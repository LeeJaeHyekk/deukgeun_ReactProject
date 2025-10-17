import "reflect-metadata"
import { AppDataSource } from "@backend/config/database"
import app from "@backend/simple-app"
import { logger } from "@backend/utils/logger"
import { initializeCrawlingService } from "@backend/services/crawlingService"
// import { getRepository } from "typeorm" // AppDataSource.getRepository 사용
import { Gym } from "@backend/entities/Gym"

const PORT = process.env.BACKEND_PORT || 5000

async function startServer() {
  try {
    console.log("🚀 Starting Deukgeun Backend Server...")
    
    // 데이터베이스 연결
    console.log("📊 Connecting to database...")
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    console.log("✅ Database connected successfully")
    
    // 크롤링 서비스 초기화 (비동기, 서버 시작을 블로킹하지 않음)
    console.log("🔄 Initializing crawling service...")
    setTimeout(async () => {
      try {
        const gymRepo = AppDataSource.getRepository(Gym)
        await initializeCrawlingService(gymRepo)
        console.log("✅ Crawling service initialized successfully")
      } catch (error) {
        console.warn("⚠️ Crawling service initialization failed:", error instanceof Error ? error.message : String(error))
      }
    }, 1000) // 1초 후 초기화
    
    // 서버 시작
    console.log(`🌐 Starting server on port ${PORT}...`)
    const server = app.listen(PORT, () => {
      console.log("=".repeat(60))
      console.log("🚀 DEUKGEUN BACKEND SERVER STARTED")
      console.log("=".repeat(60))
      console.log(`🌐 Server URL: http://localhost:${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔧 Port: ${PORT}`)
      console.log(`✅ Database: Connected`)
      console.log(`🔄 Crawling Service: Initializing (non-blocking)`)
      console.log("=".repeat(60))
      console.log("✅ Backend server is ready!")
      console.log("=".repeat(60))
    })

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

  } catch (error) {
    console.error("❌ Server startup failed:", error)
    process.exit(1)
  }
}

startServer()