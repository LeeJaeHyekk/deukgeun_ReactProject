import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthRedux } from './useAuthRedux'
import { levelApiWrapper, levelApiManager } from '../api/levelApiWrapper'
import { LevelProgress, UserReward } from '../api/levelApi'
import { showToast } from '../lib'
import { withRequestManagement, autoReconnectManager, stateSafetyManager, apiRequestManager } from '../utils/apiRequestManager'
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
  
  // 중복 실행 방지를 위한 ref
  const isInitializingRef = useRef<boolean>(false)
  const autoReconnectSetupRef = useRef<boolean>(false)

  // ============================================================================
  // API 호출 함수들
  // ============================================================================

  // 함수 참조 안정화를 위한 ref (렌더링 최적화)
  const fetchLevelProgressRef = useRef<(() => Promise<void>) | null>(null)
  const fetchRewardsRef = useRef<(() => Promise<void>) | null>(null)
  
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

    // 비활성 상태 확인 - 마이페이지에서는 강제로 활성화
    // 마이페이지에서 명시적으로 호출하는 경우 비활성 상태를 무시
    if (stateSafetyManager.isInactive(requestKey)) {
      // 비활성 상태를 강제로 활성화하여 요청 허용
      stateSafetyManager.resetState(requestKey) // 상태 리셋
      stateSafetyManager.activate(requestKey) // 활성화 (lastActivity 업데이트)
      logger.debug('LEVEL', '비활성 상태 감지 - 강제 활성화', { requestKey })
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
  }, [isLoggedIn, user?.id])
  
  // 함수 참조 저장 (안정적인 참조 유지)
  fetchLevelProgressRef.current = fetchLevelProgress

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

    // 비활성 상태 확인 - 마이페이지에서는 강제로 활성화
    if (stateSafetyManager.isInactive(requestKey)) {
      // 비활성 상태를 강제로 활성화하여 요청 허용
      stateSafetyManager.resetState(requestKey) // 상태 리셋
      stateSafetyManager.activate(requestKey) // 활성화 (lastActivity 업데이트)
      logger.debug('LEVEL', '비활성 상태 감지 - 강제 활성화', { requestKey })
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
  }, [isLoggedIn, user?.id])
  
  // 함수 참조 저장 (안정적인 참조 유지)
  fetchRewardsRef.current = fetchRewards

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

  // 이전 상태 추적을 위한 ref (렌더링 최적화)
  const prevUserIdRef = useRef<number | undefined>(undefined)
  const prevIsLoggedInRef = useRef<boolean>(false)
  const initializedUserIdRef = useRef<number | undefined>(undefined)
  
  useEffect(() => {
    // 이전 상태 추적
    const prevUserId = prevUserIdRef.current
    const prevIsLoggedIn = prevIsLoggedInRef.current
    const initializedUserId = initializedUserIdRef.current
    const currentUserId = user?.id
    
    // 상태 업데이트
    prevUserIdRef.current = currentUserId
    prevIsLoggedInRef.current = isLoggedIn
    
    // 중복 실행 방지
    if (isInitializingRef.current) {
      logger.debug('LEVEL', '이미 초기화 중 - 스킵', { userId: currentUserId, prevUserId })
      return
    }
    
    // 동일한 사용자로 이미 초기화된 경우 스킵 (불필요한 재초기화 방지)
    if (initializedUserId === currentUserId && prevUserId === currentUserId && prevIsLoggedIn === isLoggedIn) {
      logger.debug('LEVEL', '동일 사용자로 이미 초기화됨 - 스킵', { userId: currentUserId })
      return
    }
    
    // 사용자가 변경되지 않고 로그인 상태만 변경된 경우 스킵
    if (prevUserId !== undefined && prevUserId === currentUserId && prevIsLoggedIn !== isLoggedIn) {
      logger.debug('LEVEL', '사용자 변경 없음, 로그인 상태만 변경 - 스킵', { userId: currentUserId })
      return
    }
    
    if (isLoggedIn && user && currentUserId) {
      const userId = currentUserId
      
      // 초기화 시작
      isInitializingRef.current = true
      
      // 자동 재연결 설정 (순차 처리로 rate limit 방지)
      const setupAutoReconnect = () => {
        // 중복 설정 방지
        if (autoReconnectSetupRef.current) {
          logger.debug('LEVEL', '자동 재연결 이미 설정됨 - 스킵', { userId })
          return
        }
        
        const reconnectKey = `level-auto-reconnect-${userId}`
        autoReconnectSetupRef.current = true
        
        autoReconnectManager.startAutoReconnect(reconnectKey, async () => {
          logger.info('LEVEL', '자동 재연결 시도', { userId })
          
          try {
            // 안정적인 함수 참조 사용
            const fetchProgress = fetchLevelProgressRef.current || fetchLevelProgress
            const fetchRewardsFn = fetchRewardsRef.current || fetchRewards
            
            // 자동 재연결은 쿨다운을 무시하고 진행 (주기적 새로고침)
            // 순차 처리로 rate limit 방지
            // 1. 레벨 진행률 조회 (쿨다운 무시)
            const requestKeyProgress = `level-progress-${userId}`
            if (!stateSafetyManager.getLoading(requestKeyProgress)) {
              // 쿨다운 상태를 임시로 리셋하여 재연결 허용
              const state = apiRequestManager.getRequestStatus(requestKeyProgress)
              if (state && state.cooldownUntil > 0) {
                // 자동 재연결을 위해 쿨다운을 5초로 단축 (rate limit 방지는 유지)
                state.cooldownUntil = Math.min(state.cooldownUntil, Date.now() + 5000)
              }
              await fetchProgress()
            }
            
            // 2. 요청 간 간격 추가 (rate limit 방지)
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // 3. 보상 목록 조회 (쿨다운 무시)
            const requestKeyRewards = `user-rewards-${userId}`
            if (!stateSafetyManager.getLoading(requestKeyRewards)) {
              // 쿨다운 상태를 임시로 리셋하여 재연결 허용
              const state = apiRequestManager.getRequestStatus(requestKeyRewards)
              if (state && state.cooldownUntil > 0) {
                // 자동 재연결을 위해 쿨다운을 5초로 단축 (rate limit 방지는 유지)
                state.cooldownUntil = Math.min(state.cooldownUntil, Date.now() + 5000)
              }
              await fetchRewardsFn()
            }
          } catch (error) {
            logger.error('LEVEL', '자동 재연결 실패', { userId, error: error instanceof Error ? error.message : String(error) })
            throw error // 에러를 다시 throw하여 재시도 로직이 작동하도록
          }
        })
      }

      // 초기 데이터 로드 (순차 처리로 rate limit 방지)
      const initializeData = async () => {
        try {
          // 안정적인 함수 참조 사용 (ref를 통해 최신 함수 참조 보장)
          const fetchProgress = fetchLevelProgressRef.current || fetchLevelProgress
          const fetchRewardsFn = fetchRewardsRef.current || fetchRewards
          
          // 1. 레벨 진행률 조회
          await fetchProgress()
          
          // 2. 요청 간 간격 추가 (rate limit 방지)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 3. 보상 목록 조회
          await fetchRewardsFn()
        } catch (error) {
          logger.error('LEVEL', '초기 데이터 로드 실패', { userId, error: error instanceof Error ? error.message : String(error) })
          // 초기화 실패는 치명적이지 않으므로 계속 진행
        } finally {
          // 초기화 완료
          isInitializingRef.current = false
          initializedUserIdRef.current = userId // 초기화 완료 사용자 ID 저장
        }
      }
      
      initializeData()
      
      // 자동 재연결 설정 (최소 30초 후 시작)
      setupAutoReconnect()
      
      // 컴포넌트 언마운트 시 자동 재연결 정리
      return () => {
        const reconnectKey = `level-auto-reconnect-${userId}`
        autoReconnectManager.stopAutoReconnect(reconnectKey)
        autoReconnectSetupRef.current = false
        isInitializingRef.current = false
        logger.debug('LEVEL', '자동 재연결 정리', { userId })
      }
    } else {
      // 로그아웃 시 기본값 설정 (이전 상태와 다른 경우에만)
      if (prevIsLoggedIn || initializedUserIdRef.current !== undefined) {
        setLevelProgress(DEFAULT_LEVEL_PROGRESS)
        setRewards([])
        setCooldownInfo(null)
        setDailyLimitInfo(null)
        setError(null)
        
        // 모든 자동 재연결 정리
        autoReconnectManager.stopAllAutoReconnects()
        autoReconnectSetupRef.current = false
        isInitializingRef.current = false
        initializedUserIdRef.current = undefined
      }
    }
  }, [isLoggedIn, user?.id]) // 함수 참조는 ref를 통해 관리하므로 의존성 제거

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