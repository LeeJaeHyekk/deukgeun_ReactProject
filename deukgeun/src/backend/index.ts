import "reflect-metadata"
// 환경 변수 로딩을 가장 먼저 처리
import "@backend/config/environmentConfig"

// Express 기본 설정
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import * as net from "net"

// 데이터베이스 연결 (엔티티 포함)
import { connectDatabase } from "@backend/config/databaseConfig"

// 새로운 안정성 미들웨어들
import { healthCheckMiddleware, detailedHealthCheckMiddleware, metricsMiddleware } from "@backend/middlewares/healthMonitor"
import { 
  databaseResilienceMiddleware, 
  apiResilienceMiddleware, 
  memoryMonitorMiddleware,
  getCircuitBreakerStatus 
} from "@backend/middlewares/resilience"
import { 
  requestTrackingMiddleware, 
  securityMonitoringMiddleware, 
  errorTrackingMiddleware, 
  performanceMonitoringMiddleware,
  businessLogicLoggingMiddleware 
} from "@backend/middlewares/advancedLogging"
import { 
  performStartupValidation, 
  performPostStartupHealthCheck 
} from "@backend/middlewares/serverStartup"
// 주간 크롤링 스케줄러
import { weeklyCrawlingScheduler } from "@backend/schedulers/weeklyCrawlingScheduler"

/**
 * Express 앱 생성 (DB 연결 포함)
 * 데이터베이스 연결 후 라우트 등록
 */
async function createApp(): Promise<express.Application> {
  const app = express()
  
  // 기본 미들웨어 설정
  app.use(helmet())
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",").filter(origin => origin.trim() !== "") || [
      "http://localhost:3000",
      "http://localhost:5173", 
      "http://localhost:5000",
      "http://localhost:5001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5000",
      "http://127.0.0.1:5001",
    ],
    credentials: true
  }))
  app.use(morgan("dev"))
  app.use(cookieParser())
  app.use(express.json({ limit: "10mb" }))
  app.use(express.urlencoded({ extended: true, limit: "10mb" }))
  
  // 새로운 안정성 미들웨어들 추가
  app.use(requestTrackingMiddleware)
  app.use(securityMonitoringMiddleware)
  app.use(errorTrackingMiddleware)
  app.use(performanceMonitoringMiddleware)
  app.use(businessLogicLoggingMiddleware)
  app.use(databaseResilienceMiddleware)
  app.use(apiResilienceMiddleware)
  app.use(memoryMonitorMiddleware)
  app.use(metricsMiddleware)
  
  // 기본 엔드포인트
  app.get("/", (req, res) => {
    res.json({
      message: "Deukgeun Backend API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      status: "healthy",
    })
  })
  
  // 개선된 헬스체크 엔드포인트들
  app.get("/health", healthCheckMiddleware)
  app.get("/health/detailed", detailedHealthCheckMiddleware)
  app.get("/health/circuit-breakers", getCircuitBreakerStatus)
  
  app.get("/debug", (req, res) => {
    res.status(200).json({
      status: "debug",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      }
    })
  })
  
  // API 라우트 점진적 등록 (안전한 방법)
  await setupSafeRoutes(app)
  
  return app
}

/**
 * 안전한 라우트 설정 (모듈별 점진적 로딩)
 */
async function setupSafeRoutes(app: express.Application): Promise<void> {
  console.log("🔄 Setting up safe routes...")
  
  try {
    // 1. 기본 API 라우트 (데이터베이스 연결 없이도 작동)
    app.get("/api/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        message: "API running in safe mode"
      })
    })
    console.log("✅ Basic API routes configured")
    
    // 2. Auth 라우트 (우선순위 1 - 가장 중요)
    try {
      const { authRoutes } = await import("@backend/modules/auth")
      app.use("/api/auth", authRoutes)
      console.log("✅ Auth routes configured")
    } catch (error) {
      console.warn("⚠️ Auth routes failed:", error)
    }
    
    // 3. Homepage 라우트 (우선순위 2 - 프론트엔드에서 필요)
    try {
      const { homePageRoutes } = await import("@backend/modules/homepage")
      app.use("/api/homepage", homePageRoutes)
      console.log("✅ Homepage routes configured")
    } catch (error) {
      console.warn("⚠️ Homepage routes failed:", error)
    }
    
    // 4. Stats 라우트 (우선순위 3 - 프론트엔드에서 필요)
    try {
      const { statsRoutes } = await import("@backend/modules/user")
      app.use("/api/stats", statsRoutes)
      console.log("✅ Stats routes configured")
    } catch (error) {
      console.warn("⚠️ Stats routes failed:", error)
    }
    
    // 5. Level 라우트 (우선순위 4 - 프론트엔드에서 필요)
    try {
      const levelRoutes = await import("@backend/routes/level")
      app.use("/api/level", levelRoutes.default)
      console.log("✅ Level routes configured")
    } catch (error) {
      console.warn("⚠️ Level routes failed:", error)
    }
    
    // 6. reCAPTCHA 라우트 (우선순위 5 - 프론트엔드 로그 전송에 필요)
    try {
      const recaptchaRoutes = await import("@backend/routes/recaptcha")
      app.use("/api/recaptcha", recaptchaRoutes.default)
      console.log("✅ Recaptcha routes configured")
    } catch (error) {
      console.warn("⚠️ Recaptcha routes failed:", error)
    }
    
    // 5. 나머지 라우트들 (데이터베이스 연결 후)
    const isDatabaseConnected = await checkDatabaseConnection()
    if (isDatabaseConnected) {
      console.log("🔄 Database connected, loading additional routes...")
      
      // Gym routes (File is not defined 오류 방지)
      try {
        const { gymRoutes, enhancedGymRoutes } = await import("@backend/modules/gym")
        app.use("/api/gyms", gymRoutes)
        app.use("/api/enhanced-gym", enhancedGymRoutes)
        console.log("✅ Gym routes configured")
      } catch (error) {
        console.warn("⚠️ Gym routes failed:", error)
        // File is not defined 오류는 undici 모듈 문제이므로 무시하고 계속 진행
        if (error instanceof ReferenceError && error.message.includes('File is not defined')) {
          console.warn("⚠️ File is not defined 오류는 무시하고 계속 진행합니다 (undici 모듈 문제)")
        }
      }
      
      // Machine routes
      try {
        const { machineRoutes } = await import("@backend/modules/machine")
        app.use("/api/machines", machineRoutes)
        console.log("✅ Machine routes configured")
      } catch (error) {
        console.warn("⚠️ Machine routes failed:", error)
      }
      
      // Social routes
      try {
        const { postRoutes, commentRoutes, likeRoutes } = await import("@backend/modules/social")
        app.use("/api/posts", postRoutes)
        app.use("/api/comments", commentRoutes)
        app.use("/api/likes", likeRoutes)
        console.log("✅ Social routes configured")
      } catch (error) {
        console.warn("⚠️ Social routes failed:", error)
      }
      
      // Workout routes
      try {
        const { workoutRoutes } = await import("@backend/modules/workout")
        app.use("/api/workouts", workoutRoutes)
        console.log("✅ Workout routes configured")
      } catch (error) {
        console.warn("⚠️ Workout routes failed:", error)
      }

      // Rewards routes
      try {
        const rewardsRoutes = await import("@backend/routes/rewards")
        app.use("/api/rewards", rewardsRoutes.default)
        console.log("✅ Rewards routes configured")
      } catch (error) {
        console.warn("⚠️ Rewards routes failed:", error)
      }

      // Crawling routes (크롤링 상태 및 수동 실행)
      try {
        const crawlingRoutes = await import("@backend/routes/crawling")
        app.use("/api/crawling", crawlingRoutes.default)
        console.log("✅ Crawling routes configured")
      } catch (error) {
        console.warn("⚠️ Crawling routes failed:", error)
      }
    } else {
      console.log("⚠️ Database not connected, skipping database-dependent routes")
    }
    
    // 6. 404 핸들러 (path-to-regexp 오류 방지를 위해 미들웨어 함수로 변경)
    app.use((req, res, next) => {
      // 모든 라우트를 거친 후에 도달하는 경우 404 처리
      if (!res.headersSent) {
        console.log(`🔍 404 - API endpoint not found: ${req.method} ${req.url}`)
        res.status(404).json({ 
          message: "API endpoint not found",
          method: req.method,
          url: req.url,
          timestamp: new Date().toISOString()
        })
      } else {
        next()
      }
    })
    
    console.log("✅ All safe routes configured")
  } catch (error) {
    console.error("❌ Error setting up routes:", error)
  }
}

/**
 * 데이터베이스 연결 상태 확인
 */
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // 엔티티가 포함된 데이터베이스 연결 확인
    const { AppDataSource } = await import("@backend/config/databaseConfig")
    return AppDataSource.isInitialized
  } catch (error) {
    console.warn("⚠️ Database connection check failed:", error)
    return false
  }
}

/**
 * 포트가 사용 가능한지 확인하는 함수
 */
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })
    
    server.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * 사용 가능한 포트를 찾는 함수
 */
async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i
    if (await isPortAvailable(port)) {
      return port
    }
  }
  throw new Error(`No available port found starting from ${startPort}`)
}

/**
 * 서버 시작 함수 (DB 연결 포함)
 * 데이터베이스 연결 후 서버 시작
 */
async function startServer(): Promise<void> {
  try {
    console.log("=".repeat(60))
    console.log("🔧 DEUKGEUN BACKEND SERVER STARTUP DEBUG START")
    console.log("=".repeat(60))
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`)
    console.log(`🔧 Node Version: ${process.version}`)
    console.log(`🔧 Process ID: ${process.pid}`)
    console.log(`🔧 Working Directory: ${process.cwd()}`)
    console.log(`🔧 Database Host: ${process.env.DB_HOST || "localhost"}`)
    console.log(`🔧 Database Port: ${process.env.DB_PORT || "3306"}`)
    console.log(`🔧 Database Name: ${process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db"}`)
    console.log("=".repeat(60))
    
    // Step 0: 서버 시작 검증
    const preferredPort = parseInt(process.env.PORT || "5000")
    const environment = process.env.NODE_ENV || "development"
    console.log("🔄 Step 0: Performing startup validation...")
    const validationReport = await performStartupValidation(preferredPort)
    
    if (!validationReport.success) {
      if (environment === 'development') {
        console.warn("⚠️ Startup validation failed in development mode, continuing with limited functionality")
        console.warn("📊 Failed phases:")
        validationReport.phases
          .filter(p => !p.success)
          .forEach(p => console.warn(`   - ${p.name}: ${p.error || 'Unknown error'}`))
      } else {
        console.error("❌ Startup validation failed, aborting server start")
        process.exit(1)
      }
    }
    
    // Step 1: 데이터베이스 연결 시도
    console.log("🔄 Step 1: Attempting database connection...")
    try {
      await connectDatabase()
      console.log("✅ Database connection successful")
    } catch (dbError) {
      console.warn("⚠️ Database connection failed, starting server in limited mode")
      console.warn("   Error:", dbError instanceof Error ? dbError.message : String(dbError))
    }
    
    // Step 2: Express 앱 생성
    console.log("🔄 Step 2: Creating Express application...")
    const app = await createApp()
    console.log("✅ Express application created")
    
    // Step 3: 포트 확인 및 서버 시작
    console.log(`🔄 Step 3: Checking port availability...`)
    
    let port: number
    try {
      if (await isPortAvailable(preferredPort)) {
        port = preferredPort
        console.log(`✅ Port ${port} is available`)
      } else {
        console.log(`⚠️ Port ${preferredPort} is in use, finding alternative...`)
        port = await findAvailablePort(preferredPort)
        console.log(`✅ Found available port: ${port}`)
      }
    } catch (error) {
      console.error(`❌ Failed to find available port:`, error)
      throw error
    }
    
    console.log(`🔄 Step 4: Starting server on port ${port}...`)
    
    // ALB 헬스체크를 위해 0.0.0.0에서 리스닝 (모든 인터페이스)
    const server = app.listen(port, '0.0.0.0', async () => {
      console.log("=".repeat(60))
      console.log("🚀 DEUKGEUN BACKEND SERVER STARTED")
      console.log("=".repeat(60))
      console.log(`🌐 Server URL: http://localhost:${port}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
      console.log(`🔧 Port: ${port}`)
      console.log(`🔧 Process ID: ${process.pid}`)
      console.log(`🔧 Node Version: ${process.version}`)
      console.log("📝 Available endpoints:")
      console.log(`   - GET  /health              - Health check`)
      console.log(`   - GET  /health/detailed     - Detailed health check`)
      console.log(`   - GET  /health/circuit-breakers - Circuit breaker status`)
      console.log(`   - GET  /debug              - Debug information`)
      console.log(`   - GET  /                   - API status`)
      console.log(`   - GET  /api/health         - API health check`)
      console.log("=".repeat(60))
      console.log("✅ Backend server is ready!")
      console.log("=".repeat(60))
      
      // Step 5: 시작 후 헬스체크
      console.log("🔄 Step 5: Performing post-startup health check...")
      const healthCheckPassed = await performPostStartupHealthCheck()
      if (healthCheckPassed) {
        console.log("✅ Post-startup health check passed")
      } else {
        console.warn("⚠️ Post-startup health check failed, but server is running")
      }
      
      // Step 6: 주간 크롤링 스케줄러 시작
      console.log("🔄 Step 6: Starting weekly crawling scheduler...")
      weeklyCrawlingScheduler.start()
      console.log("✅ Weekly crawling scheduler started")
    })
    
    // 서버 에러 핸들링
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`)
        console.error("   Please check if another instance is running or use a different port")
      } else {
        console.error(`❌ Server error:`, error)
      }
      process.exit(1)
    })
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully')
      weeklyCrawlingScheduler.stop()
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      console.log('🔄 SIGINT received, shutting down gracefully')
      weeklyCrawlingScheduler.stop()
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })
    
    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
    })
    
    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error)
      process.exit(1)
    })
    
  } catch (error) {
    console.error("❌ Server startup failed:", error)
    console.error("   Error type:", error?.constructor?.name || "Unknown")
    console.error("   Error message:", error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error("   Error stack:", error.stack)
    }
    process.exit(1)
  }
}

// 서버 시작
startServer()
