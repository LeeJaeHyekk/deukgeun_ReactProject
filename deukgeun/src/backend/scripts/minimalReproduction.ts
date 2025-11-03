#!/usr/bin/env npx tsx

/**
 * 최소 재현 스크립트
 * 문제 재현을 위한 최소한의 코드로 테스트
 */

import "reflect-metadata"
import { config } from 'dotenv'
import express from "express"
import { DataSource } from "typeorm"
import mysql from "mysql2/promise"

// 환경 변수 로딩
config()

/**
 * 메인 재현 테스트 함수
 */
async function runMinimalReproduction() {
  console.log("=".repeat(80))
  console.log("🔬 MINIMAL REPRODUCTION SCRIPT")
  console.log("=".repeat(80))

  // 환경 정보
  console.log("🔧 Environment Information:")
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`)
  console.log(`   - Working Directory: ${process.cwd()}`)
  console.log(`   - Node Version: ${process.version}`)
  console.log(`   - Process ID: ${process.pid}`)

  // 데이터베이스 설정
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db'
  }

  console.log("\n🗄️ Database Configuration:")
  console.log(`   - Host: ${dbConfig.host}`)
  console.log(`   - Port: ${dbConfig.port}`)
  console.log(`   - Username: ${dbConfig.username}`)
  console.log(`   - Password: ${dbConfig.password ? '***' : 'NOT SET'}`)
  console.log(`   - Database: ${dbConfig.database}`)

  // Step 1: MySQL 직접 연결 테스트
  console.log("\n🔄 Step 1: Direct MySQL connection test...")
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
    })
    
    console.log("✅ Direct MySQL connection successful")
    
    // 데이터베이스 생성/확인
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
    console.log(`✅ Database '${dbConfig.database}' ready`)
    
    await connection.end()
  } catch (error) {
    console.error("❌ Direct MySQL connection failed:")
    console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }

  // Step 2: TypeORM DataSource 최소 설정
  console.log("\n🔄 Step 2: TypeORM DataSource minimal test...")
  const dataSource = new DataSource({
    type: "mysql",
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: false,
    logging: true,
    entities: [], // 빈 엔티티 배열로 테스트
  })

  try {
    await dataSource.initialize()
    console.log("✅ TypeORM DataSource initialization successful")
    console.log(`   - Is Initialized: ${dataSource.isInitialized}`)
    
    // 간단한 쿼리 테스트
    const result = await dataSource.query("SELECT 1 as test, NOW() as current_time")
    console.log("   - Query result:", result)
    
    await dataSource.destroy()
    console.log("   - DataSource destroyed")
  } catch (error) {
    console.error("❌ TypeORM DataSource initialization failed:")
    console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`)
    if (error instanceof Error && error.stack) {
      console.error("   - Stack trace:")
      console.error(error.stack)
    }
  }

  // Step 3: Express 서버 최소 설정
  console.log("\n🔄 Step 3: Express server minimal test...")
  const app = express()

  // 기본 미들웨어
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // 기본 라우트
  app.get("/", (req, res) => {
    res.json({
      message: "Minimal reproduction test",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      status: "healthy"
    })
  })

  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  })

  // 서버 시작
  const PORT = parseInt(process.env.PORT || '5000')
  const server = app.listen(PORT, () => {
    console.log(`✅ Express server started on port ${PORT}`)
    console.log(`   - URL: http://localhost:${PORT}`)
    console.log(`   - Health: http://localhost:${PORT}/health`)
    
    // 3초 후 서버 종료
    setTimeout(() => {
      console.log("\n🔄 Shutting down test server...")
      server.close(() => {
        console.log("✅ Test server closed")
        console.log("\n" + "=".repeat(80))
        console.log("✅ MINIMAL REPRODUCTION TEST COMPLETE")
        console.log("=".repeat(80))
        console.log("\n💡 If this test passes, the issue is likely in:")
        console.log("   1. Environment variable loading order")
        console.log("   2. Database connection timing")
        console.log("   3. Route registration sequence")
        console.log("   4. Entity file paths")
        process.exit(0)
      })
    }, 3000)
  })

  server.on('error', (error) => {
    console.error("❌ Express server startup failed:")
    console.error(`   - Error: ${error.message}`)
    process.exit(1)
  })
}

// 메인 함수 실행
runMinimalReproduction().catch(error => {
  console.error("❌ Minimal reproduction test failed:", error)
  process.exit(1)
})
