import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthRedux } from './useAuthRedux'
import { levelApiWrapper, levelApiManager } from '../api/levelApiWrapper'
import { LevelProgress, UserReward } from '../api/levelApi'
import { showToast } from '../lib'
import { withRequestManagement, autoReconnectManager, stateSafetyManager } from '../utils/apiRequestManager'
import { logger } from '../utils/logger'

// ============================================================================
// Constants
// ============================================================================

const FETCH_COOLDOWN = 60000 // 60초 쿨다운

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
  const { user, isLoggedIn } = useAuthRedux()
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
  const isFetching = useRef<boolean>(false)

  // ============================================================================
  // API 호출 함수들
  // ============================================================================

  const fetchLevelProgress = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setLevelProgress(DEFAULT_LEVEL_PROGRESS)
      return
    }

    const requestKey = `level-progress-${user.id}`
    
    // 상태 안전장치 확인
    if (stateSafetyManager.getLoading(requestKey)) {
      logger.debug('LEVEL', '이미 로딩 중인 요청', { requestKey })
      return
    }

    // 비활성 상태 확인
    if (stateSafetyManager.isInactive(requestKey)) {
      logger.debug('LEVEL', '비활성 상태 - 요청 스킵', { requestKey })
      return
    }

    // 요청 관리자를 통한 안전한 요청
    const result = await withRequestManagement(
      async () => {
        logger.debug('LEVEL', '레벨 진행률 조회 시작', { userId: user.id })
        const progress = await levelApiWrapper.getUserProgress(user.id)
        
        // progress가 유효한지 확인하고 기본값과 병합
        const safeProgress = {
          ...DEFAULT_LEVEL_PROGRESS,
          ...progress,
          progressPercentage: progress?.progressPercentage ?? 0,
        }
        
        logger.info('LEVEL', '레벨 진행률 조회 성공', { userId: user.id, progress: safeProgress })
        return safeProgress
      },
      {
        key: requestKey,
        cooldownMs: FETCH_COOLDOWN,
        onSuccess: (data) => {
          setLevelProgress(data)
          setError(null)
          stateSafetyManager.setLoading(requestKey, false)
        },
        onError: (error) => {
          logger.error('LEVEL', '레벨 진행률 조회 실패', { userId: user.id, error: error?.message })
          setError("레벨 정보를 불러오는데 실패했습니다.")
          setLevelProgress(DEFAULT_LEVEL_PROGRESS)
          stateSafetyManager.setError(requestKey, error?.message || '알 수 없는 오류')
          stateSafetyManager.setLoading(requestKey, false)
        },
        onRetry: (retryCount) => {
          logger.info('LEVEL', '레벨 진행률 조회 재시도', { userId: user.id, retryCount })
          stateSafetyManager.setLoading(requestKey, true)
        }
      }
    )

    if (result) {
      setLevelProgress(result)
    }
  }, [isLoggedIn, user])

  const fetchRewards = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setRewards([])
      return
    }

    const requestKey = `user-rewards-${user.id}`
    
    // 상태 안전장치 확인
    if (stateSafetyManager.getLoading(requestKey)) {
      logger.debug('LEVEL', '이미 로딩 중인 요청', { requestKey })
      return
    }

    // 비활성 상태 확인
    if (stateSafetyManager.isInactive(requestKey)) {
      logger.debug('LEVEL', '비활성 상태 - 요청 스킵', { requestKey })
      return
    }

    // 요청 관리자를 통한 안전한 요청
    const result = await withRequestManagement(
      async () => {
        logger.debug('LEVEL', '보상 목록 조회 시작', { userId: user.id })
        const userRewards = await levelApiWrapper.getUserRewards(user.id)
        
        logger.info('LEVEL', '보상 목록 조회 성공', { userId: user.id, rewardsCount: userRewards.length })
        return userRewards
      },
      {
        key: requestKey,
        cooldownMs: FETCH_COOLDOWN,
        onSuccess: (data) => {
          setRewards(data)
          setError(null)
          stateSafetyManager.setLoading(requestKey, false)
        },
        onError: (error) => {
          logger.error('LEVEL', '보상 목록 조회 실패', { userId: user.id, error: error?.message })
          setError("보상 정보를 불러오는데 실패했습니다.")
          setRewards([])
          stateSafetyManager.setError(requestKey, error?.message || '알 수 없는 오류')
          stateSafetyManager.setLoading(requestKey, false)
        },
        onRetry: (retryCount) => {
          logger.info('LEVEL', '보상 목록 조회 재시도', { userId: user.id, retryCount })
          stateSafetyManager.setLoading(requestKey, true)
        }
      }
    )

    if (result) {
      setRewards(result)
    }
  }, [isLoggedIn, user])

  // ============================================================================
  // 경험치 부여 함수
  // ============================================================================

  const grantExp = useCallback(
    async (actionType: string, source: string, metadata?: Record<string, unknown>) => {
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
            result.rewards.forEach((reward: UserReward) => {
              const rewardName = reward.metadata && typeof reward.metadata === 'object' && 'name' in reward.metadata 
                ? String(reward.metadata.name) 
                : "보상"
              showToast(
                `🎁 ${rewardName} 획득!`,
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
      } catch (err: unknown) {
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
      const userId = user.id
      
      // 자동 재연결 설정
      const setupAutoReconnect = () => {
        const reconnectKey = `level-auto-reconnect-${userId}`
        
        autoReconnectManager.startAutoReconnect(reconnectKey, async () => {
          logger.info('LEVEL', '자동 재연결 시도', { userId })
          await Promise.all([
            fetchLevelProgress(),
            fetchRewards()
          ])
        })
      }

      // 초기 데이터 로드
      fetchLevelProgress()
      fetchRewards()
      
      // 자동 재연결 설정
      setupAutoReconnect()
      
      // 컴포넌트 언마운트 시 자동 재연결 정리
      return () => {
        const reconnectKey = `level-auto-reconnect-${userId}`
        autoReconnectManager.stopAutoReconnect(reconnectKey)
        logger.debug('LEVEL', '자동 재연결 정리', { userId })
      }
    } else {
      // 로그아웃 시 기본값 설정
      setLevelProgress(DEFAULT_LEVEL_PROGRESS)
      setRewards([])
      setCooldownInfo(null)
      setDailyLimitInfo(null)
      setError(null)
      
      // 모든 자동 재연결 정리
      autoReconnectManager.stopAllAutoReconnects()
    }
  }, [isLoggedIn, user])

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

// Export the hook
export { useLevel }