import { AppDataSource } from '@backend/config/database'
import { UserLevel } from '@backend/entities/UserLevel'
import { ExpHistory } from "../entities/ExpHistory"
import { UserReward } from "../entities/UserReward"
import { Milestone } from "../entities/Milestone"
import { Between } from "typeorm"
import { getLevelConfig } from "../config/levelConfig"

interface ExpGrantData {
  [key: string]: any
}

export class LevelService {
  // 레벨별 필요 경험치 계산
  private calculateRequiredExp(level: number): number {
    const config = getLevelConfig()
    return Math.floor(
      config.levelUpFormula.baseExp *
        Math.pow(config.levelUpFormula.multiplier, level - 1)
    )
  }

  // 사용자 레벨 정보 조회
  async getUserLevel(userId: number): Promise<UserLevel | null> {
    try {
      const userLevelRepo = AppDataSource.getRepository(UserLevel)
      return await userLevelRepo.findOne({ where: { userId } })
    } catch (error) {
      console.error("사용자 레벨 조회 오류:", error)
      return null
    }
  }

  // 사용자 레벨 정보 생성 (신규 사용자용)
  async createUserLevel(userId: number): Promise<UserLevel> {
    try {
      const userLevelRepo = AppDataSource.getRepository(UserLevel)

      const userLevel = userLevelRepo.create({
        userId,
        level: 1,
        currentExp: 0,
        totalExp: 0,
        seasonExp: 0,
      })

      return await userLevelRepo.save(userLevel)
    } catch (error) {
      console.error("사용자 레벨 생성 오류:", error)
      throw error
    }
  }

  // 사용자 레벨 진행률 조회
  async getLevelProgress(userId: number): Promise<{
    level: number
    currentExp: number
    totalExp: number
    requiredExp: number
    progressPercentage: number
  } | null> {
    try {
      const userLevel = await this.getUserLevel(userId)
      if (!userLevel) {
        return null
      }

      const requiredExp = this.calculateRequiredExp(userLevel.level)
      const progressPercentage = (userLevel.currentExp / requiredExp) * 100

      return {
        level: userLevel.level,
        currentExp: userLevel.currentExp,
        totalExp: userLevel.totalExp,
        requiredExp,
        progressPercentage,
      }
    } catch (error) {
      console.error("레벨 진행률 조회 오류:", error)
      return null
    }
  }

  // 쿨다운 검증
  private async checkCooldown(
    userId: number,
    action: string
  ): Promise<{ isOnCooldown: boolean; remainingTime: number }> {
    try {
      const expHistoryRepo = AppDataSource.getRepository(ExpHistory)

      const config = getLevelConfig()
      const cooldownTimes = config.cooldownTimes

      const cooldownTime = (cooldownTimes as any)[action] || 0
      if (cooldownTime === 0) {
        return { isOnCooldown: false, remainingTime: 0 }
      }

      // 최근 동일 액션 조회
      const recentAction = await expHistoryRepo.findOne({
        where: { userId, actionType: action as any },
        order: { createdAt: "DESC" },
      })

      if (!recentAction) {
        return { isOnCooldown: false, remainingTime: 0 }
      }

      const timeSinceLastAction = Date.now() - recentAction.createdAt.getTime()
      const isOnCooldown = timeSinceLastAction < cooldownTime
      const remainingTime = Math.max(0, cooldownTime - timeSinceLastAction)

      return { isOnCooldown, remainingTime }
    } catch (error) {
      console.error("쿨다운 검증 오류:", error)
      return { isOnCooldown: false, remainingTime: 0 }
    }
  }

  // 레벨업 보상 지급
  private async grantLevelUpRewards(
    userId: number,
    newLevel: number
  ): Promise<UserReward[]> {
    try {
      const rewards: UserReward[] = []

      const config = getLevelConfig()
      const levelRewards = config.levelRewards

      const reward = (levelRewards as any)[newLevel]
      if (reward) {
        const userReward = await this.grantReward(userId, reward.type as any, {
          name: reward.name,
          description: reward.description,
          level: newLevel,
          ...reward.metadata,
        })

        if (userReward) {
          rewards.push(userReward)
        }
      }

      return rewards
    } catch (error) {
      console.error("레벨업 보상 지급 오류:", error)
      return []
    }
  }

  // 일일 경험치 한도 검증
  private async checkDailyExpLimit(
    userId: number,
    expToAdd: number
  ): Promise<{ withinLimit: boolean; dailyExp: number; limit: number }> {
    try {
      const expHistoryRepo = AppDataSource.getRepository(ExpHistory)
      const config = getLevelConfig()
      const DAILY_EXP_LIMIT = config.dailyExpLimit

      // 오늘 날짜의 시작과 끝
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // 오늘 획득한 경험치 총합
      const todayExpHistory = await expHistoryRepo.find({
        where: {
          userId,
          createdAt: Between(today, tomorrow),
        },
      })

      const dailyExp = todayExpHistory.reduce(
        (sum, history) => sum + history.expGained,
        0
      )
      const withinLimit = dailyExp + expToAdd <= DAILY_EXP_LIMIT

      return {
        withinLimit,
        dailyExp,
        limit: DAILY_EXP_LIMIT,
      }
    } catch (error) {
      console.error("일일 경험치 한도 검증 오류:", error)
      return { withinLimit: true, dailyExp: 0, limit: 500 }
    }
  }

  // 경험치 부여 (쿨다운 검증 포함)
  async grantExp(
    userId: number,
    action: string,
    reason: string,
    data?: ExpGrantData
  ): Promise<{
    success: boolean
    level: number
    currentExp: number
    totalExp: number
    leveledUp: boolean
    expGained: number
    levelUp?: number
    cooldownInfo?: { isOnCooldown: boolean; remainingTime: number }
    rewards?: UserReward[]
    dailyLimitInfo?: { withinLimit: boolean; dailyExp: number; limit: number }
  }> {
    try {
      // 쿨다운 검증
      const cooldownInfo = await this.checkCooldown(userId, action)
      if (cooldownInfo.isOnCooldown) {
        return {
          success: false,
          level: 0,
          currentExp: 0,
          totalExp: 0,
          leveledUp: false,
          expGained: 0,
          cooldownInfo,
        }
      }

      // 경험치 계산
      const expAmount = this.calculateExpAmount(action, reason)

      // 일일 경험치 한도 검증
      const dailyLimitInfo = await this.checkDailyExpLimit(userId, expAmount)
      if (!dailyLimitInfo.withinLimit) {
        return {
          success: false,
          level: 0,
          currentExp: 0,
          totalExp: 0,
          leveledUp: false,
          expGained: 0,
          dailyLimitInfo,
        }
      }

      const userLevelRepo = AppDataSource.getRepository(UserLevel)
      const expHistoryRepo = AppDataSource.getRepository(ExpHistory)

      // 사용자 레벨 정보 조회 또는 생성
      let userLevel = await userLevelRepo.findOne({ where: { userId } })
      if (!userLevel) {
        userLevel = await this.createUserLevel(userId)
      }

      // 경험치 히스토리 기록
      const expHistory = expHistoryRepo.create({
        userId,
        actionType: action as any,
        source: reason,
        expGained: expAmount,
        metadata: data,
      })
      await expHistoryRepo.save(expHistory)

      // 레벨 업데이트
      const oldLevel = userLevel.level
      userLevel.currentExp += expAmount
      userLevel.totalExp += expAmount
      userLevel.seasonExp += expAmount

      // 레벨업 체크 및 보상 지급
      let leveledUp = false
      let rewards: UserReward[] = []

      while (
        userLevel.currentExp >= this.calculateRequiredExp(userLevel.level)
      ) {
        userLevel.currentExp -= this.calculateRequiredExp(userLevel.level)
        userLevel.level += 1
        leveledUp = true

        // 레벨업 보상 지급
        const levelRewards = await this.grantLevelUpRewards(
          userId,
          userLevel.level
        )
        rewards.push(...levelRewards)
      }

      await userLevelRepo.save(userLevel)

      return {
        success: true,
        level: userLevel.level,
        currentExp: userLevel.currentExp,
        totalExp: userLevel.totalExp,
        leveledUp,
        expGained: expAmount,
        levelUp: leveledUp ? userLevel.level : undefined,
        cooldownInfo,
        rewards: rewards.length > 0 ? rewards : undefined,
        dailyLimitInfo,
      }
    } catch (error) {
      console.error("경험치 부여 오류:", error)
      throw error
    }
  }

  // 경험치 양 계산
  private calculateExpAmount(action: string, reason: string): number {
    const config = getLevelConfig()
    return (config.expValues as any)[action]?.[reason] || 10
  }

  // 경험치 히스토리 조회
  async getExpHistory(
    userId: number,
    limit: number = 20
  ): Promise<ExpHistory[]> {
    try {
      const expHistoryRepo = AppDataSource.getRepository(ExpHistory)
      return await expHistoryRepo.find({
        where: { userId },
        order: { createdAt: "DESC" },
        take: limit,
      })
    } catch (error) {
      console.error("경험치 히스토리 조회 오류:", error)
      return []
    }
  }

  // 리워드 부여
  async grantReward(
    userId: number,
    rewardType: string,
    rewardData: any
  ): Promise<UserReward | null> {
    try {
      const rewardRepo = AppDataSource.getRepository(UserReward)

      const reward = rewardRepo.create({
        userId,
        rewardType: rewardType as any,
        rewardId: `reward_${Date.now()}`,
        metadata: rewardData,
      })

      return await rewardRepo.save(reward)
    } catch (error) {
      console.error("리워드 부여 오류:", error)
      return null
    }
  }

  // 사용자 리워드 조회
  async getUserRewards(userId: number): Promise<UserReward[]> {
    try {
      const rewardRepo = AppDataSource.getRepository(UserReward)
      return await rewardRepo.find({
        where: { userId },
        order: { createdAt: "DESC" },
      })
    } catch (error) {
      console.error("사용자 리워드 조회 오류:", error)
      return []
    }
  }

  // 리워드 수령
  async claimReward(rewardId: number, userId: number): Promise<boolean> {
    try {
      const rewardRepo = AppDataSource.getRepository(UserReward)

      const reward = await rewardRepo.findOne({
        where: { id: rewardId, userId },
      })

      if (!reward || reward.claimedAt) {
        return false
      }

      reward.claimedAt = new Date()
      await rewardRepo.save(reward)

      return true
    } catch (error) {
      console.error("리워드 수령 오류:", error)
      return false
    }
  }

  // 마일스톤 달성 체크
  async checkMilestones(userId: number): Promise<Milestone[]> {
    try {
      const userLevelRepo = AppDataSource.getRepository(UserLevel)
      const milestoneRepo = AppDataSource.getRepository(Milestone)

      const userLevel = await userLevelRepo.findOne({ where: { userId } })
      if (!userLevel) return []

      // 달성 가능한 마일스톤 조회
      const achievableMilestones = await milestoneRepo.find({
        where: {
          userId,
          achieved: false,
        },
      })

      const achievedMilestones: Milestone[] = []

      for (const milestone of achievableMilestones) {
        milestone.achieved = true
        milestone.achievedAt = new Date()
        milestone.userId = userId
        await milestoneRepo.save(milestone)
        achievedMilestones.push(milestone)
      }

      return achievedMilestones
    } catch (error) {
      console.error("마일스톤 체크 오류:", error)
      return []
    }
  }

  // 사용자 마일스톤 조회
  async getUserMilestones(userId: number): Promise<Milestone[]> {
    try {
      const milestoneRepo = AppDataSource.getRepository(Milestone)
      return await milestoneRepo.find({
        where: { userId },
        order: { achievedAt: "DESC" },
      })
    } catch (error) {
      console.error("사용자 마일스톤 조회 오류:", error)
      return []
    }
  }
}
