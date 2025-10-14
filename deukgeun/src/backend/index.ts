import "reflect-metadata"
import { AppDataSource } from "./config/database"
import app from "./app"
import { logger } from "./utils/logger"
import { getAvailablePort } from "./utils/getAvailablePort"
// import { config, logConfigInfo, validateEnvironmentVariables } from "./config/env"
import { autoInitializeScheduler } from "./services/autoUpdateScheduler"
import { 
  validateAllConfigs, 
  isValidServerStatus, 
  isValidHealthResponse,
  safeGetEnvString,
  safeGetEnvNumber,
  safeGetEnvArray
} from "./utils/typeGuards"

const environment = process.env.NODE_ENV || "development"

// 타입 안전한 config 객체 정의
const config = {
  port: safeGetEnvNumber('PORT', 5000),
  environment: safeGetEnvString('NODE_ENV', 'development'),
  corsOrigin: safeGetEnvArray('CORS_ORIGIN', [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:5000",
    "http://localhost:5001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
  ])
}

// 타입 안전한 환경 변수 검증 함수
async function validateEnvironmentVariables() {
  console.log("=".repeat(60))
  console.log("🔧 TYPE-SAFE ENVIRONMENT VALIDATION START")
  console.log("=".repeat(60))
  
  const validation = validateAllConfigs()
  
  if (!validation.isValid) {
    console.log("❌ Environment validation failed:")
    validation.allErrors.forEach(error => {
      console.log(`   - ${error}`)
    })
    
    if (config.environment === 'production') {
      console.log("=".repeat(60))
      console.log("❌ PRODUCTION ENVIRONMENT VALIDATION FAILED")
      console.log("=".repeat(60))
      process.exit(1)
    } else {
      console.log("⚠️ Development mode: Continuing with warnings...")
    }
  } else {
    console.log("✅ All environment configurations are valid")
  }
  
  console.log("📊 Configuration Summary:")
  console.log(`   - Server Port: ${config.port}`)
  console.log(`   - Environment: ${config.environment}`)
  console.log(`   - CORS Origins: ${config.corsOrigin.length} configured`)
  console.log(`   - Database: ${validation.configs.database.config?.host}:${validation.configs.database.config?.port}`)
  console.log(`   - JWT Secret: ${validation.configs.jwt.config?.secret ? 'Set' : 'Not set'}`)
  
  console.log("=".repeat(60))
  console.log("✅ TYPE-SAFE ENVIRONMENT VALIDATION COMPLETE")
  console.log("=".repeat(60))
}

console.log("🔧 Starting server initialization...")
console.log(`🔧 Environment: ${environment}`)
console.log(`🔧 Config loaded: ${config ? 'Yes' : 'No'}`)
console.log("🔧 About to call startServer()...")

// 디버깅을 위한 추가 로그
console.log("🔧 Debug: Starting startServer function...")

async function startServer() {
  console.log("=".repeat(60))
  console.log("🔧 SERVER STARTUP DEBUG START")
  console.log("=".repeat(60))
  
  let databaseConnected = false
  
  console.log("🔧 Debug: Inside startServer function")
  console.log(`🔧 Environment: ${environment}`)
  console.log(`🔧 Process ID: ${process.pid}`)
  console.log(`🔧 Node Version: ${process.version}`)
  console.log(`🔧 Platform: ${process.platform}`)
  console.log(`🔧 Architecture: ${process.arch}`)
  
  try {
    // 환경 변수 검증 (async)
    console.log("🔄 Step 1: Validating environment variables...")
    console.log("🔧 Debug: About to call validateEnvironmentVariables")
    const envStartTime = Date.now()
    await validateEnvironmentVariables()
    const envEndTime = Date.now()
    console.log(`🔧 Debug: validateEnvironmentVariables completed in ${envEndTime - envStartTime}ms`)
    
    // 데이터베이스 연결 시도 (모든 환경에서 필수)
    console.log("🔄 Step 2: Attempting database connection...")
    const dbStartTime = Date.now()
    try {
      console.log("🔧 Debug: About to call AppDataSource.initialize()")
      
      // 이미 초기화된 경우 스킵
      if (AppDataSource.isInitialized) {
        console.log("✅ Database already initialized")
        databaseConnected = true
      } else {
        // 모든 환경에서 데이터베이스 연결 필수
        await AppDataSource.initialize()
        databaseConnected = true
      }
      
      const dbEndTime = Date.now()
      if (databaseConnected) {
        console.log(`✅ Step 2: Database connected successfully in ${dbEndTime - dbStartTime}ms`)

        // Initialize auto-update scheduler only if database is connected
        console.log("🔄 Step 2.1: Initializing auto-update scheduler...")
        autoInitializeScheduler()
        logger.info("Auto-update scheduler initialized")
        console.log("✅ Step 2.1: Auto-update scheduler initialized")
      } else {
        console.log(`⚠️ Step 2: Database connection skipped in ${dbEndTime - dbStartTime}ms`)
      }
    } catch (dbError) {
      const dbEndTime = Date.now()
      const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      console.log(`❌ Step 2: Database connection failed in ${dbEndTime - dbStartTime}ms`)
      console.warn("⚠️ Database connection failed:", dbErrorMessage)
      
      // 모든 환경에서 데이터베이스 연결 필수
      console.error("❌ Database connection is required for all environments")
      console.log("=".repeat(60))
      console.log("❌ SERVER STARTUP FAILED - DATABASE CONNECTION REQUIRED")
      console.log("=".repeat(60))
      console.log("💡 Please check the following:")
      console.log("   - MySQL server is running")
      console.log("   - Database credentials are correct")
      console.log("   - Database exists and is accessible")
      console.log("   - Environment variables are properly set")
      console.log("=".repeat(60))
      process.exit(1)
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
    process.exit(1)
  }

  try {
    console.log("🔄 Step 3: Getting available port...")
    const portStartTime = Date.now()
    const availablePort = await getAvailablePort(config.port || 5000)
    const portEndTime = Date.now()
    console.log(`✅ Step 3: Available port found: ${availablePort} in ${portEndTime - portStartTime}ms`)

    console.log("🔄 Step 4: Starting Express server...")
    const serverStartTime = Date.now()
    
    const server = app.listen(availablePort, () => {
      const serverEndTime = Date.now()
      logger.info(`🚀 Server is running on port ${availablePort}`)

      console.log("=".repeat(60))
      console.log("🚀 DEUKGEUN BACKEND SERVER STARTED")
      console.log("=".repeat(60))
      console.log(`🌐 Server URL: http://localhost:${availablePort}`)
      console.log(`📊 Environment: ${environment}`)
      console.log(`🔧 Port: ${availablePort}`)
      console.log(`⏱️ Server startup time: ${serverEndTime - serverStartTime}ms`)
      console.log(`🔧 Process ID: ${process.pid}`)
      console.log(`🔧 Node Version: ${process.version}`)
      console.log(`🔧 Platform: ${process.platform}`)
      console.log(`🔧 Architecture: ${process.arch}`)
      
      if (databaseConnected) {
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
      if (databaseConnected) {
        console.log(`   - GET  /api/*      - Full API endpoints`)
      } else {
        console.log(`   - GET  /api/status - API status`)
      }
      console.log("=".repeat(60))
      console.log("✅ Backend server is ready!")
      console.log("=".repeat(60))
      console.log("🔧 SERVER STARTUP DEBUG END")
      console.log("=".repeat(60))
    })

    // 서버 에러 핸들링
    server.on('error', (error: any) => {
      console.error("❌ Server error:", error)
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${availablePort} is already in use`)
        console.log("💡 Try using a different port or stop the existing server")
      }
      process.exit(1)
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("❌ Server startup failed:", errorMessage)
    console.error("❌ Error details:", errorStack)
    process.exit(1)
  }
}

console.log("🔧 Calling startServer()...")
startServer().catch((error) => {
  console.error("❌ startServer failed:", error)
  process.exit(1)
})
