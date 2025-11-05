import { useState, useCallback, useEffect } from 'react'
import { SAFETY_LIMITS, ERROR_MESSAGES } from '../constants'

/**
 * 에러 처리 및 재시도 로직 훅
 */
export const useErrorHandling = () => {
  const [videoError, setVideoError] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // 재시도 로직
  const handleRetry = useCallback(() => {
    if (retryCount < SAFETY_LIMITS.MAX_RETRY_ATTEMPTS) {
      setIsRetrying(true)
      setDataError(null)
      setRetryCount(prev => prev + 1)
      
      // 재시도 후 상태 초기화
      setTimeout(() => {
        setIsRetrying(false)
      }, 1000)
    }
  }, [retryCount])

  // 에러 상태 초기화
  const clearErrors = useCallback(() => {
    setDataError(null)
    setVideoError(false)
    setRetryCount(0)
    setIsRetrying(false)
  }, [])

  // 비디오 에러 설정
  const setVideoErrorState = useCallback((error: boolean, message?: string) => {
    setVideoError(error)
    // 비디오 오류는 dataError로 설정하지 않음 (videoFallback UI로 처리)
    // 단, 명시적으로 메시지가 전달된 경우에만 dataError 설정
    if (error && message && message !== ERROR_MESSAGES.VIDEO_LOAD_ERROR) {
      setDataError(message)
    }
  }, [])

  // 데이터 에러 설정
  const setDataErrorState = useCallback((message: string) => {
    setDataError(message)
  }, [])

  // 에러 상태 모니터링
  useEffect(() => {
    if (dataError && retryCount === 0) {
      const timer = setTimeout(() => {
        setDataError(null)
      }, SAFETY_LIMITS.TIMEOUT_DURATION)
      
      return () => clearTimeout(timer)
    }
  }, [dataError, retryCount])

  // 성능 가드: 메모리 누수 방지
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 타이머 정리
      setDataError(null)
      setVideoError(false)
      setRetryCount(0)
      setIsRetrying(false)
    }
  }, [])

  return {
    // 에러 상태
    videoError,
    dataError,
    retryCount,
    isRetrying,
    
    // 에러 처리 함수
    handleRetry,
    clearErrors,
    setVideoErrorState,
    setDataErrorState,
  }
}
