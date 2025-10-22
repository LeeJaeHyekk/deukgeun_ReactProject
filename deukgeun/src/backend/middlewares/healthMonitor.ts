// ============================================================================
// 헬스체크 및 모니터링 미들웨어
// ============================================================================

import { Request, Response, NextFunction } from "express"
import { AppDataSource } from "@backend/config/databaseConfig"
import { logger } from "@backend/utils/logger"

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  uptime: number
  environment: string
  database: {
    connected: boolean
    responseTime?: number
    error?: string
  }
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers: number
  }
  performance: {
    cpuUsage?: number
    loadAverage?: number[]
  }
}

/**
 * 데이터베이스 연결 상태를 확인합니다.
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean
  responseTime?: number
  error?: string
}> {
  if (!AppDataSource.isInitialized) {
    return { connected: false, error: "Database not initialized" }
  }

  try {
    const startTime = Date.now()
    await AppDataSource.query("SELECT 1 as health_check")
    const responseTime = Date.now() - startTime
    
    return { connected: true, responseTime }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { connected: false, error: errorMessage }
  }
}

/**
 * 메모리 사용량을 가져옵니다.
 */
function getMemoryUsage() {
  const memory = process.memoryUsage()
  return {
    rss: Math.round(memory.rss / 1024 / 1024), // MB
    heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
    external: Math.round(memory.external / 1024 / 1024), // MB
    arrayBuffers: Math.round(memory.arrayBuffers / 1024 / 1024) // MB
  }
}

/**
 * CPU 사용량을 가져옵니다 (Node.js 12+)
 */
function getCpuUsage(): number | undefined {
  try {
    const usage = process.cpuUsage()
    const totalUsage = usage.user + usage.system
    return totalUsage / 1000000 // Convert to seconds
  } catch {
    return undefined
  }
}

/**
 * 시스템 로드 평균을 가져옵니다.
 */
function getLoadAverage(): number[] | undefined {
  try {
    const os = require('os')
    return os.loadavg()
  } catch {
    return undefined
  }
}

/**
 * 전체 헬스 상태를 확인합니다.
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const database = await checkDatabaseHealth()
  const memory = getMemoryUsage()
  const cpuUsage = getCpuUsage()
  const loadAverage = getLoadAverage()

  // 상태 결정 로직
  let status: "healthy" | "degraded" | "unhealthy" = "healthy"
  
  if (!database.connected) {
    status = "unhealthy"
  } else if (database.responseTime && database.responseTime > 5000) {
    status = "degraded"
  } else if (memory.heapUsed > 1000) { // 1GB 이상 사용시
    status = "degraded"
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database,
    memory,
    performance: {
      cpuUsage,
      loadAverage
    }
  }
}

/**
 * 헬스체크 엔드포인트 미들웨어
 */
export const healthCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const healthStatus = await getHealthStatus()
    
    // 상태에 따른 HTTP 상태 코드 설정
    const statusCode = healthStatus.status === "healthy" ? 200 : 
                     healthStatus.status === "degraded" ? 200 : 503

    res.status(statusCode).json(healthStatus)
  } catch (error) {
    logger.error("Health check failed:", error)
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed"
    })
  }
}

/**
 * 상세 헬스체크 엔드포인트 (디버깅용)
 */
export const detailedHealthCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const healthStatus = await getHealthStatus()
    
    // 추가 디버깅 정보
    const debugInfo = {
      ...healthStatus,
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime()
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_DATABASE: process.env.DB_DATABASE
      }
    }

    res.json(debugInfo)
  } catch (error) {
    logger.error("Detailed health check failed:", error)
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Detailed health check failed"
    })
  }
}

/**
 * 메트릭 수집 미들웨어
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const memory = process.memoryUsage()
    
    logger.info("Request metrics", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
      },
      userAgent: req.get('User-Agent'),
      ip: req.ip
    })
  })
  
  next()
}
