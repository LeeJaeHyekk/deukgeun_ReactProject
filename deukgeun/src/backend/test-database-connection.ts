#!/usr/bin/env tsx

/**
 * 데이터베이스 연결 테스트 스크립트
 * 백엔드 서버 없이 데이터베이스 연결을 테스트합니다.
 */

import "reflect-metadata"
import { config } from "dotenv"
import { runDatabaseDiagnostics, createDatabaseIfNotExists } from "./utils/databaseDiagnostics"
import { AppDataSource } from "./config/database"

// 환경 변수 로드
config()

async function testDatabaseConnection() {
  console.log("=".repeat(80))
  console.log("🧪 DATABASE CONNECTION TEST START")
  console.log("=".repeat(80))
  
  try {
    // 1. 진단 실행
    console.log("🔄 Step 1: Running database diagnostics...")
    await runDatabaseDiagnostics()
    
    // 2. 데이터베이스 생성 시도
    console.log("\n🔄 Step 2: Creating database if it doesn't exist...")
    const dbCreated = await createDatabaseIfNotExists()
    
    if (!dbCreated) {
      console.log("❌ Database creation failed. Please check the diagnostics above.")
      return
    }
    
    // 3. TypeORM 연결 테스트
    console.log("\n🔄 Step 3: Testing TypeORM connection...")
    console.log("   - Initializing AppDataSource...")
    
    const startTime = Date.now()
    await AppDataSource.initialize()
    const endTime = Date.now()
    
    console.log(`✅ TypeORM connection successful in ${endTime - startTime}ms`)
    
    // 4. 간단한 쿼리 테스트
    console.log("\n🔄 Step 4: Testing database query...")
    const result = await AppDataSource.query("SELECT 1 as test, NOW() as `current_time`, VERSION() as mysql_version")
    console.log("✅ Query test successful:")
    console.log("   - Result:", result)
    
    // 5. 연결 종료
    console.log("\n🔄 Step 5: Closing connection...")
    await AppDataSource.destroy()
    console.log("✅ Connection closed successfully")
    
    console.log("\n" + "=".repeat(80))
    console.log("🎉 DATABASE CONNECTION TEST SUCCESSFUL")
    console.log("=".repeat(80))
    console.log("✅ All tests passed! Database is ready for use.")
    console.log("=".repeat(80))
    
  } catch (error) {
    console.log("\n" + "=".repeat(80))
    console.log("❌ DATABASE CONNECTION TEST FAILED")
    console.log("=".repeat(80))
    console.error("Error:", error instanceof Error ? error.message : String(error))
    
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack)
    }
    
    console.log("\n💡 Troubleshooting tips:")
    console.log("   1. Check if MySQL service is running")
    console.log("   2. Verify database credentials in .env file")
    console.log("   3. Ensure database exists")
    console.log("   4. Check firewall settings")
    console.log("   5. Review the diagnostics output above")
    console.log("=".repeat(80))
    
    process.exit(1)
  }
}

// 스크립트 실행
testDatabaseConnection()
  .then(() => {
    console.log("✅ Test completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Test failed:", error)
    process.exit(1)
  })

export { testDatabaseConnection }
