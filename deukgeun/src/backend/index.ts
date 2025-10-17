import "reflect-metadata"
// 환경 변수 로딩을 가장 먼저 처리
import "@backend/config/env"

// 모듈화된 서버 관리 모듈 import
import { 
  initializeAndStartServer, 
  handleServerStartupError 
} from "@backend/modules/server"

/**
 * 서버 부트스트랩 함수
 * 모든 초기화 작업을 순차적으로 실행하고 에러를 처리합니다.
 */
async function bootstrap(): Promise<void> {
  try {
    console.log("🔧 Starting server bootstrap...")
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`)
    console.log(`🔧 Node Version: ${process.version}`)
    console.log(`🔧 Process ID: ${process.pid}`)
    
    // 서버 초기화 및 시작
    const result = await initializeAndStartServer()
    
    console.log("🎉 Server started successfully!")
    console.log(`📊 Server running on port: ${result.startup.port}`)
    console.log(`📊 Database connected: ${result.database.connected}`)
    
    // 성공적인 시작 로그
    console.log("=".repeat(60))
    console.log("✅ BOOTSTRAP COMPLETED SUCCESSFULLY")
    console.log("=".repeat(60))
    
  } catch (error) {
    console.error("❌ Bootstrap failed:", error)
    handleServerStartupError(error)
  }
}

// 부트스트랩 실행
bootstrap()
