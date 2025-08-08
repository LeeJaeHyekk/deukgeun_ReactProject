import { getRepository } from "typeorm";
import { UserLevel } from "../entities/UserLevel";
import { ExpHistory } from "../entities/ExpHistory";
import { UserReward } from "../entities/UserReward";
import { Milestone } from "../entities/Milestone";
import { UserStreak } from "../entities/UserStreak";
import { logger } from "../utils/logger";

export interface LevelConfig {
  dailyExpCap: number;
  actionLimits: {
    [key: string]: {
      exp: number;
      cooldownSec: number;
      minLength?: number;
    };
  };
}

export interface LevelProgress {
  level: number;
  currentExp: number;
  totalExp: number;
  seasonExp: number;
  expToNextLevel: number;
  progressPercentage: number;
}

export class LevelService {
  private config: LevelConfig = {
    dailyExpCap: 500,
    actionLimits: {
      checkin: { exp: 10, cooldownSec: 86400 },
      post: { exp: 20, cooldownSec: 300, minLength: 50 },
      comment: { exp: 5, cooldownSec: 60, minLength: 10 },
      like: { exp: 2, cooldownSec: 5 },
      mission: { exp: 30, cooldownSec: 86400 },
      workout_log: { exp: 15, cooldownSec: 3600 },
      gym_visit: { exp: 25, cooldownSec: 86400 },
    },
  };

  /**
   * 사용자의 레벨 정보를 가져오거나 생성
   */
  async getUserLevel(userId: number): Promise<UserLevel> {
    const userLevelRepo = getRepository(UserLevel);
    let userLevel = await userLevelRepo.findOne({ where: { userId } });

    if (!userLevel) {
      userLevel = userLevelRepo.create({
        userId,
        level: 1,
        currentExp: 0,
        totalExp: 0,
        seasonExp: 0,
      });
      await userLevelRepo.save(userLevel);
      logger.info(`새 사용자 레벨 생성: User ID ${userId}`);
    }

    return userLevel;
  }

  /**
   * 레벨에 필요한 경험치 계산
   */
  calculateRequiredExp(level: number): number {
    if (level <= 10) {
      // 선형 증가: 100 + (level - 1) * 50
      return 100 + (level - 1) * 50;
    } else if (level <= 50) {
      // 지수적 증가: 600 * 1.3^(level - 11)
      return Math.floor(600 * Math.pow(1.3, level - 11));
    } else {
      // 로그함수적 증가: 5000 * log(1.1, level - 50 + 1)
      return Math.floor((5000 * Math.log(level - 50 + 1)) / Math.log(1.1));
    }
  }

  /**
   * 경험치 부여 및 레벨업 처리
   */
  async grantExp(
    userId: number,
    actionType: string,
    source: string,
    metadata?: any
  ): Promise<{ success: boolean; expGained: number; levelUp?: boolean }> {
    const actionConfig = this.config.actionLimits[actionType];
    if (!actionConfig) {
      logger.warn(`알 수 없는 액션 타입: ${actionType}`);
      return { success: false, expGained: 0 };
    }

    // 쿨다운 체크
    const canGrant = await this.checkCooldown(userId, actionType);
    if (!canGrant) {
      return { success: false, expGained: 0 };
    }

    // 일일 경험치 한도 체크
    const dailyExp = await this.getDailyExp(userId);
    if (dailyExp + actionConfig.exp > this.config.dailyExpCap) {
      logger.info(`일일 경험치 한도 초과: User ID ${userId}`);
      return { success: false, expGained: 0 };
    }

    // 트랜잭션으로 경험치 부여 및 레벨업 처리
    const userLevelRepo = getRepository(UserLevel);
    const expHistoryRepo = getRepository(ExpHistory);

    try {
      const userLevel = await this.getUserLevel(userId);
      const oldLevel = userLevel.level;

      // 경험치 추가
      userLevel.currentExp += actionConfig.exp;
      userLevel.totalExp += actionConfig.exp;
      userLevel.seasonExp += actionConfig.exp;

      // 레벨업 체크
      let levelUp = false;
      while (
        userLevel.currentExp >= this.calculateRequiredExp(userLevel.level)
      ) {
        userLevel.currentExp -= this.calculateRequiredExp(userLevel.level);
        userLevel.level += 1;
        levelUp = true;
      }

      await userLevelRepo.save(userLevel);

      // 경험치 이력 저장
      const expHistory = expHistoryRepo.create({
        userId,
        actionType,
        expGained: actionConfig.exp,
        source,
        metadata,
      });
      await expHistoryRepo.save(expHistory);

      // 레벨업 시 보상 처리
      if (levelUp) {
        await this.processLevelUpRewards(userId, userLevel.level);
        logger.info(
          `레벨업: User ID ${userId}, Level ${oldLevel} → ${userLevel.level}`
        );
      }

      return {
        success: true,
        expGained: actionConfig.exp,
        levelUp,
      };
    } catch (error) {
      logger.error(`경험치 부여 실패: User ID ${userId}, Error: ${error}`);
      return { success: false, expGained: 0 };
    }
  }

  /**
   * 쿨다운 체크
   */
  private async checkCooldown(
    userId: number,
    actionType: string
  ): Promise<boolean> {
    const actionConfig = this.config.actionLimits[actionType];
    if (!actionConfig) return false;

    const expHistoryRepo = getRepository(ExpHistory);
    const lastAction = await expHistoryRepo.findOne({
      where: { userId, actionType },
      order: { createdAt: "DESC" },
    });

    if (!lastAction) return true;

    const now = new Date();
    const timeDiff = (now.getTime() - lastAction.createdAt.getTime()) / 1000;
    return timeDiff >= actionConfig.cooldownSec;
  }

  /**
   * 일일 경험치 계산
   */
  private async getDailyExp(userId: number): Promise<number> {
    const expHistoryRepo = getRepository(ExpHistory);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyExp = await expHistoryRepo
      .createQueryBuilder("exp")
      .select("SUM(exp.expGained)", "total")
      .where("exp.userId = :userId", { userId })
      .andWhere("exp.createdAt >= :today", { today })
      .getRawOne();

    return parseInt(dailyExp?.total || "0");
  }

  /**
   * 레벨업 보상 처리
   */
  private async processLevelUpRewards(
    userId: number,
    level: number
  ): Promise<void> {
    const rewardRepo = getRepository(UserReward);
    const rewards = this.getLevelRewards(level);

    for (const reward of rewards) {
      // 중복 보상 방지
      const existingReward = await rewardRepo.findOne({
        where: { userId, rewardId: reward.rewardId },
      });

      if (!existingReward) {
        const userReward = rewardRepo.create({
          userId,
          rewardType: reward.rewardType,
          rewardId: reward.rewardId,
          metadata: reward,
        });
        await rewardRepo.save(userReward);
        logger.info(
          `레벨업 보상 지급: User ID ${userId}, Reward ${reward.rewardId}`
        );
      }
    }
  }

  /**
   * 레벨별 보상 정의
   */
  private getLevelRewards(level: number): any[] {
    const rewards = [
      {
        level: 5,
        rewardType: "badge",
        rewardId: "beginner_badge",
        description: "초보자 뱃지",
        icon: "🥉",
      },
      {
        level: 10,
        rewardType: "feature_unlock",
        rewardId: "premium_board_access",
        description: "프리미엄 게시판 접근",
        featureName: "premium_community",
      },
      {
        level: 20,
        rewardType: "badge",
        rewardId: "intermediate_badge",
        description: "중급자 뱃지",
        icon: "🥈",
      },
      {
        level: 30,
        rewardType: "points",
        rewardId: "level_30_bonus",
        description: "레벨 30 달성 보너스 포인트",
        amount: 1000,
      },
      {
        level: 50,
        rewardType: "badge",
        rewardId: "expert_badge",
        description: "전문가 뱃지",
        icon: "🥇",
      },
      {
        level: 100,
        rewardType: "badge",
        rewardId: "master_badge",
        description: "마스터 뱃지",
        icon: "👑",
      },
    ];

    return rewards.filter((reward) => reward.level === level);
  }

  /**
   * 사용자 레벨 진행률 조회
   */
  async getLevelProgress(userId: number): Promise<LevelProgress> {
    const userLevel = await this.getUserLevel(userId);
    const requiredExp = this.calculateRequiredExp(userLevel.level);
    const progressPercentage = Math.min(
      100,
      (userLevel.currentExp / requiredExp) * 100
    );

    return {
      level: userLevel.level,
      currentExp: userLevel.currentExp,
      totalExp: userLevel.totalExp,
      seasonExp: userLevel.seasonExp,
      expToNextLevel: requiredExp - userLevel.currentExp,
      progressPercentage,
    };
  }

  /**
   * 사용자 보상 목록 조회
   */
  async getUserRewards(userId: number): Promise<UserReward[]> {
    const rewardRepo = getRepository(UserReward);
    return await rewardRepo.find({
      where: { userId },
      order: { claimedAt: "DESC" },
    });
  }

  /**
   * 마일스톤 체크 및 처리
   */
  async checkMilestones(userId: number): Promise<void> {
    // 첫 게시글 마일스톤
    await this.checkFirstPostMilestone(userId);

    // 도움되는 사용자 마일스톤
    await this.checkHelpfulUserMilestone(userId);

    // 헬스장 탐험가 마일스톤
    await this.checkGymExplorerMilestone(userId);
  }

  private async checkFirstPostMilestone(userId: number): Promise<void> {
    const milestoneRepo = getRepository(Milestone);
    const existingMilestone = await milestoneRepo.findOne({
      where: { userId, milestoneId: "first_post" },
    });

    if (!existingMilestone) {
      // 게시글 수 확인 로직 필요
      // 임시로 건너뛰기
    }
  }

  private async checkHelpfulUserMilestone(userId: number): Promise<void> {
    // 좋아요 받은 수 확인 로직 필요
  }

  private async checkGymExplorerMilestone(userId: number): Promise<void> {
    // 방문한 헬스장 수 확인 로직 필요
  }
}
