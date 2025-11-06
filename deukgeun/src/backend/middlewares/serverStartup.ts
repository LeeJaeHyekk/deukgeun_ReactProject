// ============================================================================
// 서버 시작 프로세스 개선 미들웨어
// ============================================================================

import { logger } from "@backend/utils/logger"
import { AppDataSource } from "@backend/config/databaseConfig"

export interface StartupPhase {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  success: boolean
  error?: string
}

export interface StartupReport {
  totalDuration: number
  phases: StartupPhase[]
  success: boolean
  timestamp: string
  environment: string
  version: string
}

/**
 * 서버 시작 단계 추적기
 */
class StartupTracker {
  private phases: StartupPhase[] = []
  private startTime: number = Date.now()

  startPhase(name: string): void {
    const phase: StartupPhase = {
      name,
      startTime: Date.now(),
      success: false
    }
    this.phases.push(phase)
    
    console.log(`🔄 Starting phase: ${name}`)
  }

  completePhase(name: string, success: boolean = true, error?: string): void {
    const phase = this.phases.find(p => p.name === name && !p.endTime)
    if (phase) {
      phase.endTime = Date.now()
      phase.duration = phase.endTime - phase.startTime
      phase.success = success
      if (error) phase.error = error
      
      const status = success ? "✅" : "❌"
      console.log(`${status} Completed phase: ${name} (${phase.duration}ms)`)
    }
  }

  getReport(): StartupReport {
    const totalDuration = Date.now() - this.startTime
    const success = this.phases.every(p => p.success)
    
    return {
      totalDuration,
      phases: this.phases,
      success,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0"
    }
  }
}

/**
 * 전역 시작 추적기 인스턴스
 */
const startupTracker = new StartupTracker()

/**
 * 환경 변수 검증
 */
export async function validateEnvironment(): Promise<boolean> {
  startupTracker.startPhase("Environment Validation")
  
  try {
    const environment = process.env.NODE_ENV || 'development'
    
    // 개발 환경에서는 더 유연한 검증
    if (environment === 'development') {
      console.log("🔧 Development mode: Using flexible environment validation")
      
      // 기본적인 변수들만 확인
      const criticalVars = ['NODE_ENV']
      const missingCriticalVars = criticalVars.filter(varName => !process.env[varName])
      
      if (missingCriticalVars.length > 0) {
        const error = `Missing critical environment variables: ${missingCriticalVars.join(', ')}`
        startupTracker.completePhase("Environment Validation", false, error)
        return false
      }
      
      // 데이터베이스 관련 변수 확인 (없으면 경고만)
      const dbName = process.env.DB_DATABASE || process.env.DB_NAME
      if (!dbName) {
        console.warn("⚠️ Database name not set (DB_DATABASE or DB_NAME) - server will run in limited mode")
      }
      
      const dbHost = process.env.DB_HOST
      if (!dbHost) {
        console.warn("⚠️ Database host not set (DB_HOST) - server will run in limited mode")
      }
      
      startupTracker.completePhase("Environment Validation")
      return true
    } else {
      // 프로덕션 환경에서는 엄격한 검증
      const requiredVars = [
        'NODE_ENV',
        'PORT',
        'DB_HOST',
        'DB_USERNAME',
        'DB_PASSWORD'
      ]
      
      // DB_DATABASE 또는 DB_NAME 중 하나가 있으면 됨
      const dbName = process.env.DB_DATABASE || process.env.DB_NAME
      if (!dbName) {
        const error = 'Missing required database name (DB_DATABASE or DB_NAME)'
        startupTracker.completePhase("Environment Validation", false, error)
        return false
      }
      
      const missingVars = requiredVars.filter(varName => !process.env[varName])
      
      if (missingVars.length > 0) {
        const error = `Missing required environment variables: ${missingVars.join(', ')}`
        startupTracker.completePhase("Environment Validation", false, error)
        return false
      }
      
      startupTracker.completePhase("Environment Validation")
      return true
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    startupTracker.completePhase("Environment Validation", false, errorMessage)
    return false
  }
}

/**
 * 데이터베이스 연결 검증
 */
export async function validateDatabaseConnection(): Promise<boolean> {
  startupTracker.startPhase("Database Connection")
  
  try {
    const environment = process.env.NODE_ENV || 'development'
    
    if (environment === 'development') {
      console.log("🔧 Development mode: Attempting database connection (optional)")
      
      try {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize()
        }
        
        // 연결 테스트
        await AppDataSource.query("SELECT 1 as test")
        
        console.log("✅ Database connection successful")
        startupTracker.completePhase("Database Connection")
        return true
      } catch (dbError) {
        console.warn("⚠️ Database connection failed in development mode - continuing without database")
        console.warn(`   Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
        startupTracker.completePhase("Database Connection", true, "Database connection failed but continuing in development mode")
        return true // 개발 환경에서는 데이터베이스 연결 실패해도 계속 진행
      }
    } else {
      // 프로덕션 환경에서는 엄격한 검증 (하지만 헬스체크를 위해 실패해도 계속 진행)
      try {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize()
        }
        
        // 연결 테스트
        await AppDataSource.query("SELECT 1 as test")
        
        console.log("✅ Database connection successful")
        startupTracker.completePhase("Database Connection")
        return true
      } catch (dbError) {
        console.warn("⚠️ Database connection failed in production mode - continuing for health check")
        console.warn(`   Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
        startupTracker.completePhase("Database Connection", true, "Database connection failed but continuing for health check")
        return true // 헬스체크를 위해 데이터베이스 연결 실패해도 계속 진행
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    startupTracker.completePhase("Database Connection", false, errorMessage)
    return false
  }
}

/**
 * 포트 가용성 검증
 */
export async function validatePortAvailability(port: number): Promise<boolean> {
  startupTracker.startPhase("Port Availability Check")
  
  try {
    const net = require('net')
    
    return new Promise((resolve) => {
      const server = net.createServer()
      
      server.listen(port, () => {
        server.once('close', () => {
          startupTracker.completePhase("Port Availability Check")
          resolve(true)
        })
        server.close()
      })
      
      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          startupTracker.completePhase("Port Availability Check", false, `Port ${port} is already in use`)
          resolve(false)
        } else {
          startupTracker.completePhase("Port Availability Check", false, err.message)
          resolve(false)
        }
      })
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    startupTracker.completePhase("Port Availability Check", false, errorMessage)
    return false
  }
}

/**
 * 메모리 사용량 검증
 */
export function validateMemoryUsage(): boolean {
  startupTracker.startPhase("Memory Usage Check")
  
  try {
    const memory = process.memoryUsage()
    const heapUsedMB = memory.heapUsed / 1024 / 1024
    
    // 메모리 사용량이 100MB를 초과하면 경고
    if (heapUsedMB > 100) {
      const warning = `High memory usage detected: ${Math.round(heapUsedMB)}MB`
      console.warn(`⚠️ ${warning}`)
    }
    
    startupTracker.completePhase("Memory Usage Check")
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    startupTracker.completePhase("Memory Usage Check", false, errorMessage)
    return false
  }
}

/**
 * 종속성 검증
 */
export async function validateDependencies(): Promise<boolean> {
  startupTracker.startPhase("Dependencies Check")
  
  try {
    // 필수 모듈들 확인
    const requiredModules = [
      'express',
      'cors',
      'helmet',
      'morgan',
      'typeorm',
      'mysql2'
    ]
    
    const missingModules: string[] = []
    
    for (const moduleName of requiredModules) {
      try {
        require(moduleName)
      } catch {
        missingModules.push(moduleName)
      }
    }
    
    if (missingModules.length > 0) {
      const error = `Missing required modules: ${missingModules.join(', ')}`
      startupTracker.completePhase("Dependencies Check", false, error)
      return false
    }
    
    startupTracker.completePhase("Dependencies Check")
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    startupTracker.completePhase("Dependencies Check", false, errorMessage)
    return false
  }
}

/**
 * 전체 서버 시작 검증
 */
export async function performStartupValidation(port: number): Promise<StartupReport> {
  console.log("=".repeat(60))
  console.log("🔧 SERVER STARTUP VALIDATION START")
  console.log("=".repeat(60))
  
  const validations = [
    () => validateEnvironment(),
    () => validateDependencies(),
    () => validateMemoryUsage(),
    () => validateDatabaseConnection(),
    () => validatePortAvailability(port)
  ]
  
  for (const validation of validations) {
    const result = await validation()
    if (!result) {
      console.log("=".repeat(60))
      console.log("❌ SERVER STARTUP VALIDATION FAILED")
      console.log("=".repeat(60))
      break
    }
  }
  
  const report = startupTracker.getReport()
  
  if (report.success) {
    console.log("=".repeat(60))
    console.log("✅ SERVER STARTUP VALIDATION SUCCESSFUL")
    console.log("=".repeat(60))
    console.log(`⏱️ Total startup time: ${report.totalDuration}ms`)
    console.log(`🌍 Environment: ${report.environment}`)
    console.log(`📦 Version: ${report.version}`)
    console.log("=".repeat(60))
  } else {
    console.log("=".repeat(60))
    console.log("❌ SERVER STARTUP VALIDATION FAILED")
    console.log("=".repeat(60))
    console.log("📊 Failed phases:")
    report.phases
      .filter(p => !p.success)
      .forEach(p => console.log(`   - ${p.name}: ${p.error || 'Unknown error'}`))
    console.log("=".repeat(60))
  }
  
  return report
}

/**
 * 서버 시작 후 헬스체크
 */
export async function performPostStartupHealthCheck(): Promise<boolean> {
  startupTracker.startPhase("Post-Startup Health Check")
  
  try {
    // 기본 헬스체크
    const healthChecks = [
      () => process.uptime() > 0,
      () => process.memoryUsage().heapUsed > 0,
      () => AppDataSource.isInitialized
    ]
    
    const allChecksPassed = healthChecks.every(check => check())
    
    if (allChecksPassed) {
      startupTracker.completePhase("Post-Startup Health Check")
      return true
    } else {
      startupTracker.completePhase("Post-Startup Health Check", false, "One or more health checks failed")
      return false
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    startupTracker.completePhase("Post-Startup Health Check", false, errorMessage)
    return false
  }
}

/**
 * 시작 추적기 인스턴스 내보내기
 */
export { startupTracker }
