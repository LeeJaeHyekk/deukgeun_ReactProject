import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { startBackendHealthMonitoring, setupAutoRecovery } from '@frontend/shared/utils/backendHealthMonitor'
import { logger } from '@frontend/shared/utils/logger'

// 개발 환경에서만 검증 도구 로드
if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
  import('@frontend/shared/utils/verification').catch(() => {
    // 로드 실패 시 무시 (선택적 기능)
  })
}

// 백엔드 헬스체크 모니터링 시작
if (typeof window !== 'undefined') {
  try {
    // 자동 복구 설정
    setupAutoRecovery()
    
    // 헬스체크 모니터링 시작 (30초마다 체크)
    startBackendHealthMonitoring({
      checkInterval: 30000, // 30초
      unhealthyThreshold: 3, // 3회 연속 실패 시 unhealthy
      degradedThreshold: 2, // 2회 연속 실패 시 degraded
      timeout: 5000, // 5초 타임아웃
    })
    
    logger.info('APP', '백엔드 헬스체크 모니터링 시작')
  } catch (error) {
    logger.error('APP', '백엔드 헬스체크 모니터링 시작 실패', error)
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
