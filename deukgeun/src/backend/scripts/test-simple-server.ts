#!/usr/bin/env npx tsx

/**
 * 간단한 서버 테스트 스크립트
 * 엔티티 없이 기본 데이터베이스 연결만 테스트
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
 * 간단한 서버 테스트 함수
 */
async function testSimpleServer() {
  console.log("=".repeat(80))
  console.log("🚀 SIMPLE SERVER TEST SCRIPT")
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
        message: "Deukgeun Backend API - Simple Test",
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
    
    console.log("   ✅ Basic routes added")
    console.log("   ✅ Express app configuration complete")
    
    // Step 3: 간단한 데이터베이스 연결 테스트
    console.log("\n🔄 Step 3: Testing simple database connection...")
    try {
      const { connectDatabase } = await import('../config/databaseConfig')
      console.log("   ✅ Simple database module imported")
      
      try {
        await connectDatabase()
        console.log("   ✅ Simple database connection successful")
      } catch (dbError) {
        console.warn("   ⚠️ Simple database connection failed (server will run in limited mode)")
        console.warn(`     - Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
      }
    } catch (importError) {
      console.warn("   ⚠️ Simple database module import failed:")
      console.warn(`     - Error: ${importError instanceof Error ? importError.message : String(importError)}`)
    }
    
    // Step 4: 서버 시작 테스트
    console.log("\n🔄 Step 4: Testing server startup...")
    const PORT = parseInt(process.env.PORT || '5000')
    
    const server = app.listen(PORT, () => {
      console.log(`   ✅ Server started successfully on port ${PORT}`)
      console.log(`   - URL: http://localhost:${PORT}`)
      console.log(`   - Health: http://localhost:${PORT}/health`)
      
      // 5초 후 서버 종료
      setTimeout(() => {
        console.log("\n🔄 Shutting down test server...")
        server.close(() => {
          console.log("   ✅ Test server closed")
          console.log("\n" + "=".repeat(80))
          console.log("✅ SIMPLE SERVER TEST COMPLETE")
          console.log("=".repeat(80))
          console.log("\n💡 If this test passes, the issue is in entity loading")
          console.log("   1. TypeORM entity decorators")
          console.log("   2. reflect-metadata configuration")
          console.log("   3. Entity import order")
          process.exit(0)
        })
      }, 5000)
    })
    
    server.on('error', (error) => {
      console.error("   ❌ Server startup failed:")
      console.error(`     - Error: ${error.message}`)
      process.exit(1)
    })
    
  } catch (error) {
    console.error("   ❌ Express app creation failed:")
    console.error(`     - Error: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

// 메인 함수 실행
testSimpleServer().catch(error => {
  console.error("❌ Simple server test failed:", error)
  process.exit(1)
})
