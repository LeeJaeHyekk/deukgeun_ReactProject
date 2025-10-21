#!/usr/bin/env npx tsx

/**
 * 서버 시작 디버깅 스크립트
 * 실제 서버 시작 과정을 단계별로 테스트하는 도구
 */

import "reflect-metadata"
import { config } from 'dotenv'
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"

// 환경 변수 로딩
config()

/**
 * 메인 디버깅 함수
 */
async function runServerDebug() {
  console.log("=".repeat(80))
  console.log("🚀 SERVER STARTUP DEBUGGING SCRIPT")
  console.log("=".repeat(80))

  // 환경 정보
  console.log("🔧 Environment Information:")
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`)
  console.log(`   - Working Directory: ${process.cwd()}`)
  console.log(`   - Node Version: ${process.version}`)
  console.log(`   - Platform: ${process.platform}`)
  console.log(`   - Process ID: ${process.pid}`)

  // Step 1: 환경 변수 확인
  console.log("\n🔄 Step 1: Checking environment variables...")
  const criticalVars = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '5000',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || '3306',
    DB_USERNAME: process.env.DB_USERNAME || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db',
    JWT_SECRET: process.env.JWT_SECRET || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || ''
  }

  console.log("   Critical variables:")
  Object.entries(criticalVars).forEach(([key, value]) => {
    const isSet = value && value !== ''
    const displayValue = key.includes('PASSWORD') || key.includes('SECRET') ? 
      (isSet ? '***' : 'NOT SET') : 
      (isSet ? value : 'NOT SET')
    console.log(`     - ${key}: ${displayValue} ${isSet ? '✅' : '❌'}`)
  })

  // Step 2: Express 앱 생성 테스트
  console.log("\n🔄 Step 2: Testing Express app creation...")
  try {
    const app = express()
    console.log("   ✅ Express app created")
    
    // 미들웨어 설정
    app.use(helmet())
    console.log("   ✅ Helmet middleware added")
    
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
    console.log("   ✅ CORS middleware added")
    
    app.use(morgan("dev"))
    console.log("   ✅ Morgan middleware added")
    
    app.use(cookieParser())
    console.log("   ✅ Cookie parser middleware added")
    
    app.use(express.json({ limit: "10mb" }))
    app.use(express.urlencoded({ extended: true, limit: "10mb" }))
    console.log("   ✅ Body parsing middleware added")
    
    // 기본 라우트 추가
    app.get("/", (req, res) => {
      res.json({
        message: "Deukgeun Backend API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        status: "healthy",
      })
    })
    console.log("   ✅ Basic routes added")
    
    console.log("   ✅ Express app configuration complete")
  } catch (error) {
    console.error("   ❌ Express app creation failed:")
    console.error(`     - Error: ${error instanceof Error ? error.message : String(error)}`)
  }

  // Step 3: 데이터베이스 연결 테스트 (선택적)
  console.log("\n🔄 Step 3: Testing database connection (optional)...")
  try {
    // 동적 import로 데이터베이스 모듈 로드
    const databaseModule = await import('../config/databaseConfig')
    console.log("   ✅ Database module imported")
    console.log(`   - Module keys: ${Object.keys(databaseModule).join(', ')}`)
    
    if (databaseModule.connectDatabase) {
      try {
        await databaseModule.connectDatabase()
        console.log("   ✅ Database connection successful")
      } catch (dbError) {
        console.warn("   ⚠️ Database connection failed (server will run in limited mode)")
        console.warn(`     - Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
      }
    } else {
      console.warn("   ⚠️ connectDatabase function not found in database module")
    }
  } catch (importError) {
    console.warn("   ⚠️ Database module import failed:")
    console.warn(`     - Error: ${importError instanceof Error ? importError.message : String(importError)}`)
    if (importError instanceof Error && importError.stack) {
      console.warn(`     - Stack: ${importError.stack}`)
    }
  }

  // Step 4: 라우트 모듈 로드 테스트
  console.log("\n🔄 Step 4: Testing route module loading...")
  try {
    const routesModule = await import('../routes')
    console.log("   ✅ API routes module imported")
    console.log(`   - Module keys: ${Object.keys(routesModule).join(', ')}`)
    console.log(`   - Default export type: ${typeof routesModule.default}`)
    
    if (routesModule.default !== undefined) {
      console.log("   ✅ Default route export found")
    } else {
      console.warn("   ⚠️ No default export found in routes module")
    }
  } catch (routeError) {
    console.error("   ❌ API routes module import failed:")
    console.error(`     - Error: ${routeError instanceof Error ? routeError.message : String(routeError)}`)
    if (routeError instanceof Error && routeError.stack) {
      console.error(`     - Stack: ${routeError.stack}`)
    }
  }

  // Step 5: 서버 시작 테스트
  console.log("\n🔄 Step 5: Testing server startup...")
  const PORT = parseInt(process.env.PORT || '5000')

  try {
    const app = express()
    
    // 기본 미들웨어
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
    
    // 기본 라우트
    app.get("/", (req, res) => {
      res.json({
        message: "Deukgeun Backend API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        status: "healthy",
      })
    })
    
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      })
    })
    
    // 서버 시작
    const server = app.listen(PORT, () => {
      console.log(`   ✅ Server started successfully on port ${PORT}`)
      console.log(`   - URL: http://localhost:${PORT}`)
      console.log(`   - Health check: http://localhost:${PORT}/health`)
      
      // 서버 종료
      setTimeout(() => {
        console.log("   🔄 Shutting down test server...")
        server.close(() => {
          console.log("   ✅ Test server closed")
          console.log("\n" + "=".repeat(80))
          console.log("✅ SERVER STARTUP DEBUGGING COMPLETE")
          console.log("=".repeat(80))
          process.exit(0)
        })
      }, 2000)
    })
    
    server.on('error', (error) => {
      console.error("   ❌ Server startup failed:")
      console.error(`     - Error: ${error.message}`)
      process.exit(1)
    })
    
  } catch (error) {
    console.error("   ❌ Server startup test failed:")
    console.error(`     - Error: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

// 메인 함수 실행
runServerDebug().catch(error => {
  console.error("❌ Server debugging failed:", error)
  process.exit(1)
})
