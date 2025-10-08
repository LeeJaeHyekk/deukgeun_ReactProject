const { useState, useEffect, useCallback, useRef  } = require('react')
const { useAuth  } = require('./useAuth')
const { levelApiWrapper, levelApiManager  } = require('../api/levelApiWrapper')
const { LevelProgress, UserReward  } = require('../api/levelApi')
const { showToast  } = require('../lib')

// ============================================================================
// Constants
// ============================================================================

const FETCH_COOLDOWN = 30000 // 30초 쿨다운

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_LEVEL_PROGRESS: LevelProgress = {
  level: 1,
  currentExp: 0,
  totalExp: 0,
  seasonExp: 0,
  expToNextLevel: 100,
  progressPercentage: 0,
}

// ============================================================================
// Hook
// ============================================================================

function useLevel() {
  const { user, isLoggedIn } = useAuth()
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null)
  const [rewards, setRewards] = useState<UserReward[]>([])
  const [cooldownInfo, setCooldownInfo] = useState<{
    isOnCooldown: boolean
    remainingTime: number
  } | null>(null)
  const [dailyLimitInfo, setDailyLimitInfo] = useState<{
    withinLimit: boolean
    dailyExp: number
    limit: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API 호출 제한을 위한 ref
  const lastFetchTime = useRef<number>(0)

  // ============================================================================
  // API 호출 함수들
  // ============================================================================

  const fetchLevelProgress = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setLevelProgress(DEFAULT_LEVEL_PROGRESS)
      return
    }

    // API 호출 제한 확인
    const now = Date.now()
    if (now - lastFetchTime.current < FETCH_COOLDOWN) {
      console.log("API 호출 제한: 쿨다운 중")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      lastFetchTime.current = now

      const progress = await levelApiWrapper.getUserProgress(user.id)
      // progress가 유효한지 확인하고 기본값과 병합
      const safeProgress = {
        ...DEFAULT_LEVEL_PROGRESS,
        ...progress,
        progressPercentage: progress?.progressPercentage ?? 0,
      }
      setLevelProgress(safeProgress)
    } catch (err: any) {
      console.error("레벨 진행률 조회 실패:", err)
      setError("레벨 정보를 불러오는데 실패했습니다.")
      setLevelProgress(DEFAULT_LEVEL_PROGRESS)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user])

  const fetchRewards = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setRewards([])
      return
    }

    // API 호출 제한 확인
    const now = Date.now()
    if (now - lastFetchTime.current < FETCH_COOLDOWN) {
      console.log("API 호출 제한: 쿨다운 중")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      lastFetchTime.current = now

      const userRewards = await levelApiWrapper.getUserRewards(user.id)
      setRewards(userRewards)
    } catch (err: any) {
      console.error("보상 목록 조회 실패:", err)
      setError("보상 정보를 불러오는데 실패했습니다.")
      setRewards([])
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user])

  // ============================================================================
  // 경험치 부여 함수
  // ============================================================================

  const grantExp = useCallback(
    async (actionType: string, source: string, metadata?: any) => {
      if (!isLoggedIn || !user) {
        console.log("로그인 상태 아님")
        return null
      }

      try {
        const result = await levelApiWrapper.grantExp({
          actionType,
          source,
          metadata,
        })

        if (result) {
          // 쿨다운 정보 업데이트
          if (result.cooldownInfo) {
            setCooldownInfo(result.cooldownInfo)
          }

          // 일일 한도 정보 업데이트
          if (result.dailyLimitInfo) {
            setDailyLimitInfo(result.dailyLimitInfo)
          }

          // 레벨업 시 알림
          if (result.levelUp) {
            showToast("🎉 레벨업! 축하합니다!", "success")
          }

          // 보상 획득 시 알림
          if (result.rewards && result.rewards.length > 0) {
            result.rewards.forEach((reward: any) => {
              showToast(
                `🎁 ${reward.metadata?.name || "보상"} 획득!`,
                "success"
              )
            })
          }

          // 진행률 새로고침
          await fetchLevelProgress()
          await fetchRewards()

          return result
        } else {
          showToast("경험치 부여에 실패했습니다.", "error")
          return null
        }
      } catch (err: any) {
        console.error("경험치 부여 실패:", err)
        showToast("경험치 부여 중 오류가 발생했습니다.", "error")
        return null
      }
    },
    [isLoggedIn, user, fetchLevelProgress, fetchRewards]
  )

  // ============================================================================
  // 초기화 및 리셋 함수들
  // ============================================================================

  const resetLevelData = useCallback(() => {
    setLevelProgress(DEFAULT_LEVEL_PROGRESS)
    setRewards([])
    setCooldownInfo(null)
    setDailyLimitInfo(null)
    setError(null)
  }, [])

  const enableLevelApi = useCallback(() => {
    levelApiManager.enable()
    console.log("레벨 API 활성화됨")
  }, [])

  const disableLevelApi = useCallback(() => {
    levelApiManager.disable()
    resetLevelData()
    console.log("레벨 API 비활성화됨")
  }, [resetLevelData])

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchLevelProgress()
      fetchRewards()
    } else {
      // 로그아웃 시 기본값 설정
      setLevelProgress(DEFAULT_LEVEL_PROGRESS)
      setRewards([])
      setCooldownInfo(null)
      setDailyLimitInfo(null)
      setError(null)
    }
  }, [isLoggedIn, user, fetchLevelProgress, fetchRewards])

  // ============================================================================
  // Return Values
  // ============================================================================

  return {
    // 상태
    levelProgress: levelProgress ?? DEFAULT_LEVEL_PROGRESS,
    rewards,
    cooldownInfo,
    dailyLimitInfo,
    isLoading,
    error,
    isLevelApiEnabled: levelApiManager.isEnabled(),

    // 액션
    fetchLevelProgress,
    fetchRewards,
    grantExp,
    resetLevelData,
    enableLevelApi,
    disableLevelApi,

    // 유틸리티
    hasLevelData: levelProgress !== null,
    canGrantExp:
      levelApiManager.isEnabled() && isLoggedIn && !cooldownInfo?.isOnCooldown,
  }
}
