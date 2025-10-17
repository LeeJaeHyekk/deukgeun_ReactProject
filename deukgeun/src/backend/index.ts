import "reflect-metadata"
// 환경 변수 로딩을 가장 먼저 처리
import "@/config/env"

// 모듈화된 서버 관리 모듈 import
import { 
  initializeAndStartServer, 
  handleServerStartupError 
} from "@/modules/server"

console.log("🔧 Starting server initialization...")
console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`)

// 서버 초기화 및 시작
initializeAndStartServer()
  .then((result) => {
    console.log("🎉 Server started successfully!")
    console.log(`📊 Server running on port: ${result.startup.port}`)
    console.log(`📊 Database connected: ${result.database.connected}`)
  })
  .catch(handleServerStartupError)
