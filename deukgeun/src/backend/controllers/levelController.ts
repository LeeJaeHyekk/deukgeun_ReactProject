import { Request, Response } from "express";
import { LevelService } from "../services/levelService";
import { logger } from "../utils/logger";

const levelService = new LevelService();

/**
 * 사용자 레벨 정보 조회
 */
export const getUserLevel = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const userId = parseInt(req.params.userId);

    // 본인 또는 관리자만 조회 가능
    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const userLevel = await levelService.getUserLevel(userId);
    const progress = await levelService.getLevelProgress(userId);

    res.json({
      success: true,
      data: {
        userLevel,
        progress,
      },
    });
  } catch (error) {
    logger.error("사용자 레벨 조회 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 사용자 레벨 진행률 조회
 */
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const userId = parseInt(req.params.userId);

    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const progress = await levelService.getLevelProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    logger.error("사용자 진행률 조회 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 사용자 보상 목록 조회
 */
export const getUserRewards = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const userId = parseInt(req.params.userId);

    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const rewards = await levelService.getUserRewards(userId);

    res.json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    logger.error("사용자 보상 조회 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 경험치 부여
 */
export const grantExp = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { actionType, source, metadata } = req.body;

    if (!actionType || !source) {
      return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
    }

    const result = await levelService.grantExp(
      req.user.userId,
      actionType,
      source,
      metadata
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          expGained: result.expGained,
          levelUp: result.levelUp,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "경험치를 부여할 수 없습니다. (쿨다운 또는 한도 초과)",
      });
    }
  } catch (error) {
    logger.error("경험치 부여 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 쿨다운 상태 확인
 */
export const checkCooldown = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { actionType } = req.params;
    const userId = parseInt(req.params.userId);

    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    // 쿨다운 체크 로직은 LevelService에서 처리
    // 여기서는 간단히 응답
    res.json({
      success: true,
      data: {
        canPerform: true, // 실제로는 LevelService에서 계산
      },
    });
  } catch (error) {
    logger.error("쿨다운 확인 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 리더보드 조회 (전체)
 */
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // 실제 구현에서는 데이터베이스에서 조회
    // 임시 응답
    res.json({
      success: true,
      data: {
        rankings: [],
        total: 0,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      },
    });
  } catch (error) {
    logger.error("리더보드 조회 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 시즌 리더보드 조회
 */
export const getSeasonLeaderboard = async (req: Request, res: Response) => {
  try {
    const { seasonId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 시즌별 리더보드 로직 구현 필요
    res.json({
      success: true,
      data: {
        seasonId,
        rankings: [],
        total: 0,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      },
    });
  } catch (error) {
    logger.error("시즌 리더보드 조회 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 관리자: 레벨 설정 업데이트
 */
export const updateLevelConfig = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId || req.user.role !== "admin") {
      return res.status(403).json({ message: "관리자만 접근할 수 있습니다." });
    }

    const { config } = req.body;

    // 설정 업데이트 로직 구현 필요
    logger.info("레벨 설정 업데이트:", config);

    res.json({
      success: true,
      message: "설정이 업데이트되었습니다.",
    });
  } catch (error) {
    logger.error("레벨 설정 업데이트 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 관리자: 사용자 진행률 리셋
 */
export const resetUserProgress = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId || req.user.role !== "admin") {
      return res.status(403).json({ message: "관리자만 접근할 수 있습니다." });
    }

    const { userId } = req.params;

    // 사용자 진행률 리셋 로직 구현 필요
    logger.info(`사용자 진행률 리셋: User ID ${userId}`);

    res.json({
      success: true,
      message: "사용자 진행률이 리셋되었습니다.",
    });
  } catch (error) {
    logger.error("사용자 진행률 리셋 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 관리자: 시스템 통계 조회
 */
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId || req.user.role !== "admin") {
      return res.status(403).json({ message: "관리자만 접근할 수 있습니다." });
    }

    // 시스템 통계 조회 로직 구현 필요
    const stats = {
      totalUsers: 0,
      averageLevel: 0,
      totalExpGranted: 0,
      activeUsers: 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("시스템 통계 조회 실패:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
