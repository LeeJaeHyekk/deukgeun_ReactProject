// ============================================================================
// 프론트엔드 애플리케이션 설정
// ============================================================================

interface FrontendAppConfig {
  environment: string
  apiBaseUrl: string
  apiTimeout: number
  enableDebug: boolean
  enablePerformanceMonitoring: boolean
  enableHotReload: boolean
}

// 프론트엔드 애플리케이션 설정
export const frontendAppConfig: FrontendAppConfig = {
  environment: "development",
  apiBaseUrl: "http://localhost:3000/api",
  apiTimeout: 10000,
  enableDebug: true,
  enablePerformanceMonitoring: true,
  enableHotReload: true,
}

export default frontendAppConfig
