// ============================================================================
// Level API Configuration
// ============================================================================

export const LEVEL_CONFIG = {
  // API 활성화 여부
  ENABLED: import.meta.env.VITE_ENABLE_LEVEL_API === 'true',
  
  // API 호출 제한
  FETCH_COOLDOWN: 30000, // 30초
  MAX_RETRY_ATTEMPTS: 2,
  MAX_CONSECUTIVE_ERRORS: 3,
  
  // 기본값
  DEFAULT_LEVEL: 1,
  DEFAULT_EXP: 0,
  DEFAULT_EXP_TO_NEXT: 100,
  
  // 오류 처리
  AUTO_DISABLE_ON_403: true,
  SUPPRESS_ERROR_LOGS: true,
  
  // 기능 플래그
  FEATURES: {
    EXP_GRANTING: true,
    REWARDS: true,
    LEADERBOARD: false,
    ACHIEVEMENTS: false,
  }
} as const

// ============================================================================
// Level API 상태 관리
// ============================================================================

class LevelApiState {
  private isEnabled: boolean = LEVEL_CONFIG.ENABLED
  private consecutiveErrors: number = 0
  private lastErrorTime: number = 0

  isApiEnabled(): boolean {
    return this.isEnabled
  }

  disableApi(): void {
    this.isEnabled = false
    console.log("레벨 API 비활성화됨")
  }

  enableApi(): void {
    this.isEnabled = true
    this.consecutiveErrors = 0
    console.log("레벨 API 활성화됨")
  }

  recordError(): void {
    this.consecutiveErrors++
    this.lastErrorTime = Date.now()
    
    if (this.consecutiveErrors >= LEVEL_CONFIG.MAX_CONSECUTIVE_ERRORS) {
      console.warn("연속 오류로 인한 레벨 API 비활성화")
      this.disableApi()
    }
  }

  recordSuccess(): void {
    this.consecutiveErrors = 0
  }

  getConsecutiveErrors(): number {
    return this.consecutiveErrors
  }

  shouldSkipApiCall(): boolean {
    if (!this.isEnabled) return true
    if (this.consecutiveErrors >= LEVEL_CONFIG.MAX_CONSECUTIVE_ERRORS) return true
    return false
  }
}

export const levelApiState = new LevelApiState()
