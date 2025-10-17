// ============================================================================
// 데이터베이스 연결 관리 모듈
// ============================================================================

import { AppDataSource } from "@/config/database"
import { logger } from "@/utils/logger"
import { ServerConfig } from "./ServerConfig"
import { lazyLoadDatabase } from "./LazyLoader"

export interface DatabaseConnectionResult {
  connected: boolean
  error?: string
}

/**
 * 데이터베이스 연결을 시도합니다.
 * 개발 환경에서는 연결 실패 시에도 서버 시작을 허용합니다.
 * 지연 로딩을 통해 성능을 최적화합니다.
 */
export async function connectDatabase(config: ServerConfig): Promise<DatabaseConnectionResult> {
  console.log("🔄 Step 2: Attempting database connection...")
  const dbStartTime = Date.now()
  
  try {
    // 지연 로딩을 통한 데이터베이스 연결
    await lazyLoadDatabase()
    const dbEndTime = Date.now()
    
    console.log(`✅ Step 2: Database connected successfully in ${dbEndTime - dbStartTime}ms`)
    
    // Auto-update scheduler is deprecated - using new crawling system
    console.log("🔄 Step 2.1: Skipping deprecated auto-update scheduler...")
    logger.info("Auto-update scheduler is deprecated - using new crawling system")
    console.log("✅ Step 2.1: Skipped deprecated auto-update scheduler")
    
    return { connected: true }
  } catch (dbError) {
    const dbEndTime = Date.now()
    const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError)
    console.log(`❌ Step 2: Database connection failed in ${dbEndTime - dbStartTime}ms`)
    console.warn("⚠️ Database connection failed:", dbErrorMessage)
    
    // 개발 환경에서는 데이터베이스 연결 실패해도 서버 시작 허용
    if (config.environment === 'development') {
      console.log("⚠️ Development mode: Continuing without database connection")
      console.log("💡 Limited functionality available - database features will be disabled")
      console.log("🔧 Database error details:", dbErrorMessage)
      return { connected: false, error: dbErrorMessage }
    } else {
      // 프로덕션 환경에서는 데이터베이스 연결 필수
      console.error("❌ Database connection is required for production environment")
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
  }
}

/**
 * 데이터베이스 연결 상태를 확인합니다.
 */
export function isDatabaseConnected(): boolean {
  return AppDataSource.isInitialized
}

/**
 * 데이터베이스 연결 정보를 로그로 출력합니다.
 */
export function logDatabaseStatus(connected: boolean): void {
  if (connected) {
    console.log(`✅ Database: Connected to ${process.env.DB_NAME || "deukgeun_db"}`)
    console.log(`📊 Database Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`)
    console.log("🎯 Full API functionality available")
  } else {
    console.log("⚠️ Database: Not connected")
    console.log("🔧 Limited API functionality available")
    console.log("💡 Available endpoints: /health, /api/status")
  }
}
