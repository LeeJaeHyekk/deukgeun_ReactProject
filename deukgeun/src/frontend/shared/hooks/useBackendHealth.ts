// ============================================================================
// 백엔드 헬스체크 훅
// ============================================================================

import { useEffect, useState, useCallback } from 'react'
import { 
  getBackendHealthMonitor, 
  startBackendHealthMonitoring,
  stopBackendHealthMonitoring,
  setupAutoRecovery,
  type HealthCheckResult 
} from '@frontend/shared/utils/backendHealthMonitor'
import { logger } from '@frontend/shared/utils/logger'

// ============================================================================
// 백엔드 헬스체크 훅
// ============================================================================

export function useBackendHealth(options?: {
  autoStart?: boolean
  checkInterval?: number
  onHealthChange?: (result: HealthCheckResult) => void
  onUnhealthy?: () => void
}) {
  const {
    autoStart = true,
    checkInterval = 30000,
    onHealthChange,
    onUnhealthy
  } = options || {}

  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 헬스체크 상태 변경 핸들러
  const handleHealthChange = useCallback((result: HealthCheckResult) => {
    setHealthStatus(result)
    onHealthChange?.(result)

    // unhealthy 상태 감지 시 콜백 호출
    if (result.status === 'unhealthy') {
      logger.warn('BACKEND_HEALTH', '백엔드 unhealthy 상태 감지', result)
      onUnhealthy?.()
    }
  }, [onHealthChange, onUnhealthy])

  // 헬스체크 모니터링 시작
  const startMonitoring = useCallback(() => {
    if (isMonitoring) {
      logger.warn('BACKEND_HEALTH', '헬스체크 모니터링이 이미 실행 중입니다.')
      return
    }

    try {
      const monitor = getBackendHealthMonitor({ checkInterval })
      monitor.onHealthChange(handleHealthChange)
      monitor.start()
      setIsMonitoring(true)
      logger.info('BACKEND_HEALTH', '헬스체크 모니터링 시작')
    } catch (error) {
      logger.error('BACKEND_HEALTH', '헬스체크 모니터링 시작 실패', error)
    }
  }, [checkInterval, handleHealthChange, isMonitoring])

  // 헬스체크 모니터링 중지
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) {
      return
    }

    try {
      stopBackendHealthMonitoring()
      setIsMonitoring(false)
      logger.info('BACKEND_HEALTH', '헬스체크 모니터링 중지')
    } catch (error) {
      logger.error('BACKEND_HEALTH', '헬스체크 모니터링 중지 실패', error)
    }
  }, [isMonitoring])

  // 즉시 헬스체크 실행
  const checkHealth = useCallback(async () => {
    try {
      const monitor = getBackendHealthMonitor()
      const result = await monitor.checkHealth()
      setHealthStatus(result)
      return result
    } catch (error) {
      logger.error('BACKEND_HEALTH', '헬스체크 실행 실패', error)
      return null
    }
  }, [])

  // 자동 복구 설정
  useEffect(() => {
    if (autoStart) {
      setupAutoRecovery()
    }
  }, [autoStart])

  // 컴포넌트 마운트 시 모니터링 시작
  useEffect(() => {
    if (autoStart) {
      startMonitoring()
    }

    return () => {
      stopMonitoring()
    }
  }, [autoStart, startMonitoring, stopMonitoring])

  return {
    healthStatus,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkHealth
  }
}

export default useBackendHealth

