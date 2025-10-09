// ============================================================================
// Level API Wrapper - Enhanced Error Handling and State Management
// ============================================================================

import { levelApi, LevelProgress, UserReward, ExpGrantRequest, ExpGrantResponse } from './levelApi'
import { levelApiState, LEVEL_CONFIG } from '../config/levelConfig'

// ============================================================================
// Wrapper Functions
// ============================================================================

const levelApiWrapper = {
  /**
   * 사용자 레벨 진행률 조회 (래핑)
   */
  getUserProgress: async (userId: number): Promise<LevelProgress> => {
    if (levelApiState.shouldSkipApiCall()) {
      console.log("레벨 API 호출 스킵됨")
      return {
        level: LEVEL_CONFIG.DEFAULT_LEVEL,
        currentExp: LEVEL_CONFIG.DEFAULT_EXP,
        totalExp: LEVEL_CONFIG.DEFAULT_EXP,
        seasonExp: LEVEL_CONFIG.DEFAULT_EXP,
        expToNextLevel: LEVEL_CONFIG.DEFAULT_EXP_TO_NEXT,
        progressPercentage: 0,
      }
    }

    try {
      const result = await levelApi.getUserProgress(userId)
      levelApiState.recordSuccess()
      return result
    } catch (error: any) {
      levelApiState.recordError()
      
      if (error?.response?.status === 403 && LEVEL_CONFIG.AUTO_DISABLE_ON_403) {
        levelApiState.disableApi()
      }
      
      if (!LEVEL_CONFIG.SUPPRESS_ERROR_LOGS) {
        console.error("레벨 진행률 조회 실패:", error)
      }
      
      // 기본값 반환
      return {
        level: LEVEL_CONFIG.DEFAULT_LEVEL,
        currentExp: LEVEL_CONFIG.DEFAULT_EXP,
        totalExp: LEVEL_CONFIG.DEFAULT_EXP,
        seasonExp: LEVEL_CONFIG.DEFAULT_EXP,
        expToNextLevel: LEVEL_CONFIG.DEFAULT_EXP_TO_NEXT,
        progressPercentage: 0,
      }
    }
  },

  /**
   * 사용자 보상 목록 조회 (래핑)
   */
  getUserRewards: async (userId: number): Promise<UserReward[]> => {
    if (levelApiState.shouldSkipApiCall()) {
      console.log("레벨 API 호출 스킵됨")
      return []
    }

    try {
      const result = await levelApi.getUserRewards(userId)
      levelApiState.recordSuccess()
      return result
    } catch (error: any) {
      levelApiState.recordError()
      
      if (error?.response?.status === 403 && LEVEL_CONFIG.AUTO_DISABLE_ON_403) {
        levelApiState.disableApi()
      }
      
      if (!LEVEL_CONFIG.SUPPRESS_ERROR_LOGS) {
        console.error("보상 목록 조회 실패:", error)
      }
      
      return []
    }
  },

  /**
   * 경험치 부여 (래핑)
   */
  grantExp: async (data: ExpGrantRequest): Promise<ExpGrantResponse | null> => {
    if (levelApiState.shouldSkipApiCall()) {
      console.log("레벨 API 호출 스킵됨")
      return null
    }

    if (!LEVEL_CONFIG.FEATURES.EXP_GRANTING) {
      console.log("경험치 부여 기능 비활성화됨")
      return null
    }

    try {
      const result = await levelApi.grantExp(data)
      levelApiState.recordSuccess()
      return result
    } catch (error: any) {
      levelApiState.recordError()
      
      if (error?.response?.status === 403 && LEVEL_CONFIG.AUTO_DISABLE_ON_403) {
        levelApiState.disableApi()
      }
      
      if (!LEVEL_CONFIG.SUPPRESS_ERROR_LOGS) {
        console.error("경험치 부여 실패:", error)
      }
      
      return null
    }
  },

  /**
   * 쿨다운 상태 확인 (래핑)
   */
  checkCooldown: async (actionType: string, userId: number) => {
    if (levelApiState.shouldSkipApiCall()) {
      return { canPerform: false, remainingTime: 0 }
    }

    try {
      const result = await levelApi.checkCooldown(actionType, userId)
      levelApiState.recordSuccess()
      return result
    } catch (error: any) {
      levelApiState.recordError()
      
      if (!LEVEL_CONFIG.SUPPRESS_ERROR_LOGS) {
        console.error("쿨다운 확인 실패:", error)
      }
      
      return { canPerform: false, remainingTime: 0 }
    }
  },

  /**
   * 전체 리더보드 조회 (래핑)
   */
  getGlobalLeaderboard: async (page: number = 1, limit: number = 20) => {
    if (levelApiState.shouldSkipApiCall() || !LEVEL_CONFIG.FEATURES.LEADERBOARD) {
      return []
    }

    try {
      const result = await levelApi.getGlobalLeaderboard(page, limit)
      levelApiState.recordSuccess()
      return result
    } catch (error: any) {
      levelApiState.recordError()
      
      if (!LEVEL_CONFIG.SUPPRESS_ERROR_LOGS) {
        console.error("리더보드 조회 실패:", error)
      }
      
      return []
    }
  },

  /**
   * 시즌 리더보드 조회 (래핑)
   */
  getSeasonLeaderboard: async (seasonId: string, page: number = 1, limit: number = 20) => {
    if (levelApiState.shouldSkipApiCall() || !LEVEL_CONFIG.FEATURES.LEADERBOARD) {
      return []
    }

    try {
      const result = await levelApi.getSeasonLeaderboard(seasonId, page, limit)
      levelApiState.recordSuccess()
      return result
    } catch (error: any) {
      levelApiState.recordError()
      
      if (!LEVEL_CONFIG.SUPPRESS_ERROR_LOGS) {
        console.error("시즌 리더보드 조회 실패:", error)
      }
      
      return []
    }
  }
}

// ============================================================================
// State Management Functions
// ============================================================================

const levelApiManager = {
  /**
   * API 상태 확인
   */
  isEnabled: () => levelApiState.isApiEnabled(),
  
  /**
   * API 활성화
   */
  enable: () => levelApiState.enableApi(),
  
  /**
   * API 비활성화
   */
  disable: () => levelApiState.disableApi(),
  
  /**
   * 연속 오류 수 확인
   */
  getConsecutiveErrors: () => levelApiState.getConsecutiveErrors(),
  
  /**
   * API 호출 스킵 여부 확인
   */
  shouldSkip: () => levelApiState.shouldSkipApiCall(),
  
  /**
   * 상태 리셋
   */
  reset: () => {
    levelApiState.enableApi()
  }
}

// Export all functions and objects
export {
  levelApiWrapper,
  levelApiManager,
}