// ============================================================================
// 데이터베이스 연결 관리 모듈
// ============================================================================

import { AppDataSource } from "@backend/config/database"
import { logger } from "@backend/utils/logger"
import { ServerConfig } from "@backend/modules/server/ServerConfig"
import { lazyLoadDatabase } from "@backend/modules/server/LazyLoader"

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
    // 지연 로딩을 통한 데이터베이스 연결 (타임아웃 포함)
    const dataSource = await lazyLoadDatabase()
    const dbEndTime = Date.now()
    
    // 연결 상태 재확인
    if (!dataSource.isInitialized) {
      throw new Error("Database connection not properly initialized")
    }
    
    console.log(`✅ Step 2: Database connected successfully in ${dbEndTime - dbStartTime}ms`)
    console.log(`📊 Database: ${process.env.DB_NAME || "deukgeun_db"} on ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`)
    
    // Auto-update scheduler is deprecated - using new crawling system
    console.log("🔄 Step 2.1: Skipping deprecated auto-update scheduler...")
    logger.info("Auto-update scheduler is deprecated - using new crawling system")
    console.log("✅ Step 2.1: Skipped deprecated auto-update scheduler")
    
    return { connected: true }
  } catch (dbError) {
    const dbEndTime = Date.now()
    const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError)
    const connectionTime = dbEndTime - dbStartTime
    
    console.log(`❌ Step 2: Database connection failed in ${connectionTime}ms`)
    console.warn("⚠️ Database connection failed:", dbErrorMessage)
    
    // 에러 타입별 상세 로깅
    if (dbErrorMessage.includes("timeout")) {
      console.log("⏰ Connection timeout - check if MySQL server is running and accessible")
    } else if (dbErrorMessage.includes("ECONNREFUSED")) {
      console.log("🔌 Connection refused - MySQL server may not be running")
    } else if (dbErrorMessage.includes("ER_ACCESS_DENIED_ERROR")) {
      console.log("🔐 Access denied - check database credentials")
    } else if (dbErrorMessage.includes("ER_BAD_DB_ERROR")) {
      console.log("📁 Database not found - check if database exists")
    }
    
    // 개발 환경에서는 데이터베이스 연결 실패해도 서버 시작 허용
    if (config.environment === 'development') {
      console.log("⚠️ Development mode: Continuing without database connection")
      console.log("💡 Limited functionality available - database features will be disabled")
      console.log("🔧 Database error details:", dbErrorMessage)
      console.log("🔧 Connection attempt took:", `${connectionTime}ms`)
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
      console.log("   - Network connectivity to database server")
      console.log("=".repeat(60))
      console.log("🔧 Error details:", dbErrorMessage)
      console.log("🔧 Connection attempt took:", `${connectionTime}ms`)
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
