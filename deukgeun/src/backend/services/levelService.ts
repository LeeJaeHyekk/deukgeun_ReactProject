import { AppDataSource } from "../config/database"
import { UserLevel } from "../entities/UserLevel"
import { ExpHistory } from "../entities/ExpHistory"
import { UserReward } from "../entities/UserReward"
import { Milestone } from "../entities/Milestone"

interface ExpGrantData {
  [key: string]: any
}

export class LevelService {
  // 레벨별 필요 경험치 계산
  private calculateRequiredExp(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1))
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

  // 경험치 부여
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
  }> {
    try {
      const userLevelRepo = AppDataSource.getRepository(UserLevel)
      const expHistoryRepo = AppDataSource.getRepository(ExpHistory)

      // 사용자 레벨 정보 조회 또는 생성
      let userLevel = await userLevelRepo.findOne({ where: { userId } })
      if (!userLevel) {
        userLevel = await this.createUserLevel(userId)
      }

      // 경험치 계산
      const expAmount = this.calculateExpAmount(action, reason)

      // 경험치 히스토리 기록
      const expHistory = expHistoryRepo.create({
        userId,
        actionType: action,
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

      // 레벨업 체크
      let leveledUp = false
      while (
        userLevel.currentExp >= this.calculateRequiredExp(userLevel.level)
      ) {
        userLevel.currentExp -= this.calculateRequiredExp(userLevel.level)
        userLevel.level += 1
        leveledUp = true
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
      }
    } catch (error) {
      console.error("경험치 부여 오류:", error)
      throw error
    }
  }

  // 경험치 양 계산
  private calculateExpAmount(action: string, reason: string): number {
    const expTable: { [key: string]: { [key: string]: number } } = {
      post: {
        post_creation: 50,
        post_like: 5,
        post_comment: 10,
      },
      comment: {
        comment_creation: 20,
        comment_like: 2,
      },
      like: {
        post_like: 3,
        comment_like: 1,
      },
      workout: {
        workout_completion: 100,
        workout_goal_achieved: 200,
        streak_maintained: 50,
      },
      social: {
        profile_completion: 30,
        first_post: 100,
        first_comment: 50,
      },
    }

    return expTable[action]?.[reason] || 10
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
        rewardType: rewardType,
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
