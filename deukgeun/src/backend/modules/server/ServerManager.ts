// ============================================================================
// 서버 관리 메인 모듈
// ============================================================================

import { createServerConfig, ServerConfig } from "./ServerConfig"
import { validateEnvironmentVariables, ValidationResult } from "./ServerValidator"
import { connectDatabase, DatabaseConnectionResult } from "./DatabaseManager"
import { startExpressServer, setupGracefulShutdown, ServerStartResult } from "./ServerStarter"
import { 
  measureAsyncPerformance, 
  logPerformanceMetrics, 
  logMemoryUsage 
} from "./PerformanceMonitor"

export interface ServerManagerResult {
  server: any
  config: ServerConfig
  validation: ValidationResult
  database: DatabaseConnectionResult
  startup: ServerStartResult
}

/**
 * 서버를 완전히 초기화하고 시작합니다.
 * 모든 단계를 순차적으로 실행합니다.
 * 성능 모니터링을 통해 각 단계의 성능을 측정합니다.
 */
export const initializeAndStartServer = measureAsyncPerformance(
  'server-initialization',
  async (): Promise<ServerManagerResult> => {
    console.log("=".repeat(60))
    console.log("🔧 SERVER STARTUP START")
    console.log("=".repeat(60))
    
    // Step 1: 서버 설정 생성 (캐시됨)
    const config = createServerConfig()
    console.log(`🔧 Environment: ${config.environment}`)
    console.log(`🔧 Process ID: ${process.pid}`)
    console.log(`🔧 Node Version: ${process.version}`)
    
    // 초기 메모리 사용량 로그
    logMemoryUsage()
    
    try {
      // Step 2: 환경 변수 검증 (캐시됨)
      console.log("🔄 Step 1: Validating environment variables...")
      const validation = await validateEnvironmentVariables(config)
      console.log(`✅ Step 1: Environment validation completed`)
      
      // Step 3: 데이터베이스 연결 (지연 로딩)
      const database = await connectDatabase(config)
      
      // Step 4: Express 서버 시작
      const startup = await startExpressServer(config, database)
      
      // Step 5: Graceful shutdown 설정
      setupGracefulShutdown(startup.server)
      
      // 성능 메트릭 로그
      logPerformanceMetrics()
      logMemoryUsage()
      
      return {
        server: startup.server,
        config,
        validation,
        database,
        startup
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log("=".repeat(60))
      console.log("❌ SERVER INITIALIZATION FAILED")
      console.log("=".repeat(60))
      console.error("❌ Server initialization failed:", errorMessage)
      if (error instanceof Error && error.stack) {
        console.error("❌ Error stack:", error.stack)
      }
      console.log("=".repeat(60))
      throw error
    }
  },
  { environment: process.env.NODE_ENV || 'development' }
)

/**
 * 서버 시작 실패 시 에러를 처리합니다.
 */
export function handleServerStartupError(error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  console.error("❌ Server startup failed:", errorMessage)
  console.error("❌ Error details:", errorStack)
  process.exit(1)
}
