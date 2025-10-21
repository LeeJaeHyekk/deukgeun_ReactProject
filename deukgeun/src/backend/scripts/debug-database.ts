#!/usr/bin/env npx tsx

/**
 * 데이터베이스 연결 디버깅 스크립트
 * TypeORM DataSource 초기화 전후 상태를 확인하는 도구
 */

import "reflect-metadata"
import { DataSource } from "typeorm"
import mysql from "mysql2/promise"
import * as path from 'path'
import * as fs from 'fs'

// 환경 변수 로딩
import { config } from 'dotenv'
config()

/**
 * 메인 디버깅 함수
 */
async function runDatabaseDebug() {
  console.log("=".repeat(80))
  console.log("🗄️ DATABASE DEBUGGING SCRIPT")
  console.log("=".repeat(80))

  // 환경 정보
  console.log("🔧 Environment Information:")
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`)
  console.log(`   - Working Directory: ${process.cwd()}`)
  console.log(`   - Script Location: ${__filename}`)

  // 데이터베이스 설정 정보
  console.log("\n🗄️ Database Configuration:")
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db'
  }

  console.log(`   - Host: ${dbConfig.host}`)
  console.log(`   - Port: ${dbConfig.port}`)
  console.log(`   - Username: ${dbConfig.username}`)
  console.log(`   - Password: ${dbConfig.password ? '***' : 'NOT SET'}`)
  console.log(`   - Database: ${dbConfig.database}`)

  // Step 1: MySQL 서버 연결 테스트
  console.log("\n🔄 Step 1: Testing MySQL server connection...")
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
    })
    
    console.log("✅ MySQL server connection successful")
    
    // 서버 정보 조회
    const [serverInfo] = await connection.query('SELECT VERSION() as version, NOW() as current_time')
    console.log(`   - MySQL Version: ${(serverInfo as any)[0].version}`)
    console.log(`   - Server Time: ${(serverInfo as any)[0].current_time}`)
    
    await connection.end()
  } catch (error) {
    console.error("❌ MySQL server connection failed:")
    console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`)
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error("   - Issue: Connection refused - MySQL server is not running")
      } else if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
        console.error("   - Issue: Access denied - Check username/password")
      } else if (error.message.includes('ENOTFOUND')) {
        console.error("   - Issue: Host not found - Check DB_HOST")
      }
    }
    
    console.log("\n💡 Troubleshooting Tips:")
    console.log("   1. Check if MySQL server is running")
    console.log("   2. Verify DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD")
    console.log("   3. Check firewall settings")
    console.log("   4. Try: mysql -h localhost -P 3306 -u root -p")
    
    process.exit(1)
  }

  // Step 2: 데이터베이스 존재 확인
  console.log("\n🔄 Step 2: Checking database existence...")
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
    })
    
    const [databases] = await connection.query('SHOW DATABASES')
    const dbNames = (databases as any[]).map(db => db.Database)
    const dbExists = dbNames.includes(dbConfig.database)
    
    console.log(`   - Database '${dbConfig.database}' exists: ${dbExists ? '✅ YES' : '❌ NO'}`)
    
    if (!dbExists) {
      console.log("   - Available databases:", dbNames.join(', '))
      console.log("   - Creating database...")
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
      console.log("   ✅ Database created successfully")
    }
    
    await connection.end()
  } catch (error) {
    console.error("❌ Database check failed:")
    console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`)
  }

  // Step 3: TypeORM DataSource 설정 테스트
  console.log("\n🔄 Step 3: Testing TypeORM DataSource configuration...")

  // 엔티티 경로 확인
  const entityPaths = [
    'src/backend/entities/**/*.ts',
    'dist/backend/entities/**/*.js',
    path.join(process.cwd(), 'src', 'backend', 'entities', '**', '*.ts'),
    path.join(process.cwd(), 'dist', 'backend', 'entities', '**', '*.js')
  ]

  console.log("   - Entity paths to check:")
  entityPaths.forEach((entityPath, index) => {
    console.log(`     ${index + 1}. ${entityPath}`)
  })

  // DataSource 생성 (초기화하지 않음)
  const testDataSource = new DataSource({
    type: "mysql",
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: false,
    logging: true,
    entities: [], // 빈 배열로 테스트
  })

  console.log("   - DataSource configuration created")
  console.log(`   - Type: ${testDataSource.options.type}`)
  console.log(`   - Host: ${(testDataSource.options as any).host || 'N/A'}`)
  console.log(`   - Port: ${(testDataSource.options as any).port || 'N/A'}`)
  console.log(`   - Database: ${testDataSource.options.database}`)
  console.log(`   - Username: ${(testDataSource.options as any).username || 'N/A'}`)

  // Step 4: DataSource 초기화 테스트
  console.log("\n🔄 Step 4: Testing DataSource initialization...")
  try {
    await testDataSource.initialize()
    console.log("✅ DataSource initialization successful")
    console.log(`   - Is Initialized: ${testDataSource.isInitialized}`)
    console.log(`   - Connection Name: ${testDataSource.name}`)
    
    // 간단한 쿼리 테스트
    const result = await testDataSource.query("SELECT 1 as test, NOW() as current_time")
    console.log("   - Query test result:", result)
    
    await testDataSource.destroy()
    console.log("   - DataSource destroyed")
  } catch (error) {
    console.error("❌ DataSource initialization failed:")
    console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`)
    
    if (error instanceof Error && error.stack) {
      console.error("   - Stack trace:")
      console.error(error.stack)
    }
  }

  // Step 5: 엔티티 파일 확인
  console.log("\n🔄 Step 5: Checking entity files...")
  const entityDir = path.join(process.cwd(), 'src', 'backend', 'entities')
  const distEntityDir = path.join(process.cwd(), 'dist', 'backend', 'entities')

  console.log(`   - Source entities: ${entityDir}`)
  console.log(`   - Source exists: ${fs.existsSync(entityDir) ? '✅' : '❌'}`)
  console.log(`   - Dist entities: ${distEntityDir}`)
  console.log(`   - Dist exists: ${fs.existsSync(distEntityDir) ? '✅' : '❌'}`)

  if (fs.existsSync(entityDir)) {
    const entityFiles = (fs.readdirSync(entityDir, { recursive: true }) as string[])
      .filter((file: string) => file.endsWith('.ts'))
    console.log(`   - Entity files found: ${entityFiles.length}`)
    entityFiles.slice(0, 5).forEach((file: string) => {
      console.log(`     - ${file}`)
    })
    if (entityFiles.length > 5) {
      console.log(`     ... and ${entityFiles.length - 5} more`)
    }
  }

  console.log("\n" + "=".repeat(80))
  console.log("✅ DATABASE DEBUGGING COMPLETE")
  console.log("=".repeat(80))
}

// 메인 함수 실행
runDatabaseDebug().catch(error => {
  console.error("❌ Database debugging failed:", error)
  process.exit(1)
})
