// ============================================================================
// 서버 시작 관리 모듈
// ============================================================================

import { Server } from "http"
import app from "@/app"
import { logger } from "@/utils/logger"
import { getAvailablePort } from "@/utils/getAvailablePort"
import { ServerConfig } from "./ServerConfig"
import { DatabaseConnectionResult } from "./DatabaseManager"

export interface ServerStartResult {
  server: Server
  port: number
  startupTime: number
}

/**
 * Express 서버를 시작합니다.
 */
export async function startExpressServer(
  config: ServerConfig, 
  databaseResult: DatabaseConnectionResult
): Promise<ServerStartResult> {
  console.log("🔄 Step 3: Getting available port...")
  const portStartTime = Date.now()
  const availablePort = await getAvailablePort(config.port || 5000)
  const portEndTime = Date.now()
  console.log(`✅ Step 3: Available port found: ${availablePort} in ${portEndTime - portStartTime}ms`)

  console.log("🔄 Step 4: Starting Express server...")
  const serverStartTime = Date.now()
  
  return new Promise((resolve, reject) => {
    const server = app.listen(availablePort, () => {
      const serverEndTime = Date.now()
      const startupTime = serverEndTime - serverStartTime
      
      logger.info(`🚀 Server is running on port ${availablePort}`)
      logServerStartupInfo(availablePort, config, databaseResult, startupTime)
      
      resolve({
        server,
        port: availablePort,
        startupTime
      })
    })

    // 서버 에러 핸들링
    server.on('error', (error: any) => {
      console.error("❌ Server error:", error)
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${availablePort} is already in use`)
        console.log("💡 Try using a different port or stop the existing server")
      }
      reject(error)
    })
  })
}

/**
 * 서버 시작 정보를 로그로 출력합니다.
 */
function logServerStartupInfo(
  port: number, 
  config: ServerConfig, 
  databaseResult: DatabaseConnectionResult, 
  startupTime: number
): void {
  console.log("=".repeat(60))
  console.log("🚀 DEUKGEUN BACKEND SERVER STARTED")
  console.log("=".repeat(60))
  console.log(`🌐 Server URL: http://localhost:${port}`)
  console.log(`📊 Environment: ${config.environment}`)
  console.log(`🔧 Port: ${port}`)
  console.log(`⏱️ Server startup time: ${startupTime}ms`)
  console.log(`🔧 Process ID: ${process.pid}`)
  console.log(`🔧 Node Version: ${process.version}`)
  console.log(`🔧 Platform: ${process.platform}`)
  console.log(`🔧 Architecture: ${process.arch}`)
  
  // 데이터베이스 상태 로그
  if (databaseResult.connected) {
    console.log(`✅ Database: Connected to ${process.env.DB_NAME || "deukgeun_db"}`)
    console.log(`📊 Database Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`)
    console.log("🎯 Full API functionality available")
  } else {
    console.log("⚠️ Database: Not connected")
    console.log("🔧 Limited API functionality available")
    console.log("💡 Available endpoints: /health, /api/status")
  }
  
  console.log("📝 Available endpoints:")
  console.log(`   - GET  /health     - Health check`)
  console.log(`   - GET  /debug      - Debug information`)
  if (databaseResult.connected) {
    console.log(`   - GET  /api/*      - Full API endpoints`)
  } else {
    console.log(`   - GET  /api/status - API status`)
  }
  console.log("=".repeat(60))
  console.log("✅ Backend server is ready!")
  console.log("=".repeat(60))
}

/**
 * Graceful shutdown 핸들러를 설정합니다.
 */
export function setupGracefulShutdown(server: Server): void {
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully')
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })

  process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully')
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })
}
