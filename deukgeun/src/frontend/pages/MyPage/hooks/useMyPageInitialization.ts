// ============================================================================
// useMyPageInitialization Hook - 마이페이지 초기화 로직 훅
// ============================================================================

import { useEffect, useState, useRef } from "react"
import { useAppDispatch } from "@frontend/shared/store/hooks"
import { fetchGoalsFromBackend, setCompletedWorkouts } from "@frontend/features/workout/slices/workoutSlice"
import { useLevel } from "@frontend/shared/hooks/useLevel"
import { stateSafetyManager } from "@frontend/shared/utils/apiRequestManager"
import { logger } from "@frontend/shared/utils/logger"

interface UseMyPageInitializationResult {
  isInitializing: boolean
  initializationError: string | null
  setInitializationError: (error: string | null) => void
}

/**
 * 마이페이지 초기화 로직을 관리하는 훅
 */
export function useMyPageInitialization(
  userId: number | undefined,
  isLoggedIn: boolean
): UseMyPageInitializationResult {
  const dispatch = useAppDispatch()
  const { fetchLevelProgress } = useLevel()
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [initializationError, setInitializationError] = useState<string | null>(null)
  
  // 중복 요청 방지를 위한 ref
  const isInitializingRef = useRef(false)
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // 초기화 중복 방지
    if (isInitializingRef.current) {
      logger.debug('MY_PAGE_INIT', '이미 초기화 중 - 스킵', { userId })
      return
    }
    
    // 사용자 인증 확인
    if (!isLoggedIn || !userId) {
      setIsInitializing(false)
      isInitializingRef.current = false
      return
    }
    
    // 초기화 시작
    isInitializingRef.current = true
    setIsInitializing(true)
    setInitializationError(null)
    
    // 초기화 타임아웃 설정 (10초 후 자동 해제)
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current)
    }
    initializationTimeoutRef.current = setTimeout(() => {
      if (isInitializingRef.current) {
        console.warn('⚠️ [useMyPageInitialization] 초기화 타임아웃 - 자동 해제')
        setIsInitializing(false)
        isInitializingRef.current = false
        setInitializationError('초기화 타임아웃 - 다시 시도해주세요.')
      }
    }, 10000)
    
    const initializeData = async () => {
      try {
        // 1. localStorage에서 이전 completedWorkouts 복원 (빠른 표시)
        try {
          const savedState = localStorage.getItem('workout_state')
          if (savedState) {
            const parsed = JSON.parse(savedState)
            // 타입 검증: completedWorkouts가 배열인지 확인
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.completedWorkouts)) {
              // 데이터 유효성 검증
              const validWorkouts = parsed.completedWorkouts.filter((w: any) => 
                w && typeof w === 'object' && 
                w.completedId && 
                w.completedAt &&
                typeof w.totalSets === 'number' &&
                typeof w.totalReps === 'number'
              )
              
              if (validWorkouts.length > 0) {
                console.log('📦 [useMyPageInitialization] localStorage에서 completedWorkouts 복원:', {
                  count: validWorkouts.length
                })
                // Redux에 저장
                dispatch(setCompletedWorkouts(validWorkouts))
              }
            }
          }
        } catch (error) {
          console.error('❌ [useMyPageInitialization] localStorage 로드 실패:', error)
          // localStorage 오류는 치명적이지 않으므로 계속 진행
        }
        
        // 2. 레벨 정보 새로고침 (에러 처리 포함)
        // 주의: useLevel 훅에서도 fetchLevelProgress를 호출하므로 중복 호출 방지
        // useLevel의 초기화가 완료될 때까지 대기
        try {
          // useLevel이 이미 초기화 중이면 스킵 (중복 방지)
          const requestKey = `level-progress-${userId}`
          if (stateSafetyManager.getLoading(requestKey)) {
            logger.debug('MY_PAGE_INIT', '레벨 정보 로딩 중 - 스킵', { userId })
          } else {
            await fetchLevelProgress()
            // 레벨 정보 로드 후 간격 추가 (rate limit 방지)
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } catch (error) {
          console.error('❌ [useMyPageInitialization] 레벨 정보 로드 실패:', error)
          // 레벨 정보 로드 실패는 치명적이지 않으므로 계속 진행
        }
        
        // 3. 운동 목표 목록 로드 (completedWorkouts 포함) - 백엔드 데이터와 병합
        try {
          const result = await dispatch(fetchGoalsFromBackend(userId)).unwrap()
          console.log('✅ [useMyPageInitialization] 운동 목표 로드 성공:', {
            goalsCount: Array.isArray(result) ? result.length : 0
          })
        } catch (error: any) {
          console.error('❌ [useMyPageInitialization] 운동 목표 로드 실패:', error)
          const errorMessage = error?.message || error?.response?.data?.message || '운동 목표를 불러오는데 실패했습니다.'
          setInitializationError(errorMessage)
        }
      } catch (error: any) {
        console.error('❌ [useMyPageInitialization] 초기화 중 예기치 않은 오류:', error)
        setInitializationError(error?.message || '데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        // 초기화 완료
        setIsInitializing(false)
        isInitializingRef.current = false
        
        // 타임아웃 정리
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current)
          initializationTimeoutRef.current = null
        }
      }
    }
    
    initializeData()
    
    // cleanup: 컴포넌트 언마운트 시 타임아웃 정리
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current)
        initializationTimeoutRef.current = null
      }
      isInitializingRef.current = false
    }
  }, [userId, isLoggedIn, fetchLevelProgress, dispatch]) // fetchLevelProgress는 안정적인 함수이므로 의존성 유지
  
  return {
    isInitializing,
    initializationError,
    setInitializationError,
  }
}

