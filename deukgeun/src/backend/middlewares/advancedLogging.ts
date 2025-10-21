// ============================================================================
// 고급 로깅 미들웨어
// ============================================================================

import { Request, Response, NextFunction } from "express"
import { logger } from "@backend/utils/logger"
import * as fs from "fs"
import * as path from "path"

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  metadata?: Record<string, any>
  requestId?: string
  userId?: string
  sessionId?: string
}

export interface SecurityEvent {
  type: "suspicious_activity" | "rate_limit_exceeded" | "authentication_failure" | "data_breach_attempt"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  metadata: Record<string, any>
  timestamp: string
}

/**
 * 요청 ID 생성기
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 보안 이벤트 로거
 */
export class SecurityLogger {
  private static logFile = path.join(process.cwd(), "logs", "security.log")

  static log(event: SecurityEvent): void {
    const logEntry = {
      ...event,
      timestamp: new Date().toISOString()
    }

    // 콘솔에 즉시 출력
    console.warn(`🚨 SECURITY ALERT [${event.severity.toUpperCase()}]: ${event.description}`)
    
    // 파일에 기록
    try {
      if (!fs.existsSync(path.dirname(this.logFile))) {
        fs.mkdirSync(path.dirname(this.logFile), { recursive: true })
      }
      
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + "\n")
    } catch (error) {
      console.error("Failed to write security log:", error)
    }

    // 심각한 보안 이벤트의 경우 추가 알림
    if (event.severity === "critical" || event.severity === "high") {
      logger.error("Critical security event detected", logEntry)
    }
  }
}

/**
 * 요청 추적 미들웨어
 */
export const requestTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = generateRequestId()
  const startTime = Date.now()
  
  // 요청 ID를 헤더에 추가 (안전한 방법)
  try {
    if (res.setHeader && typeof res.setHeader === 'function') {
      res.setHeader('X-Request-ID', requestId)
    } else {
      // setHeader가 없는 경우 직접 헤더 설정
      res.header('X-Request-ID', requestId)
    }
  } catch (error) {
    console.warn('Failed to set request ID header:', error)
  }
  
  // 요청 정보를 req 객체에 저장
  (req as any).requestId = requestId
  ;(req as any).startTime = startTime
  
  // 요청 로깅
  logger.info("Request started", {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  })
  
  // 응답 완료 시 로깅 (안전한 방법)
  try {
    if (res.on && typeof res.on === 'function') {
      res.on('finish', () => {
        const duration = Date.now() - startTime
        const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info'
        
        logger[logLevel]("Request completed", {
          requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        })
      })
    } else {
      // on 메서드가 없는 경우 대체 방법 사용
      const originalSend = res.send
      res.send = function(data: any) {
        const duration = Date.now() - startTime
        const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info'
        
        logger[logLevel]("Request completed", {
          requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        })
        
        return originalSend.call(this, data)
      }
    }
  } catch (error) {
    console.warn('Failed to set up response logging:', error)
  }
  
  next()
}

/**
 * 보안 모니터링 미들웨어
 */
export const securityMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip
  const userAgent = req.get('User-Agent') || ''
  const url = req.url
  const method = req.method
  
  // 의심스러운 패턴 감지
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempt
    /union.*select/i, // SQL injection
    /eval\(/i, // Code injection
    /javascript:/i, // JavaScript injection
    /on\w+\s*=/i // Event handler injection
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent)
  )
  
  if (isSuspicious) {
    SecurityLogger.log({
      type: "suspicious_activity",
      severity: "high",
      description: "Suspicious request pattern detected",
      metadata: {
        ip,
        userAgent,
        url,
        method,
        patterns: suspiciousPatterns.filter(pattern => 
          pattern.test(url) || pattern.test(userAgent)
        ).map(p => p.toString())
      },
      timestamp: new Date().toISOString()
    })
  }
  
  // 비정상적인 요청 빈도 감지
  const requestCount = (req as any).requestCount || 0
  if (requestCount > 100) { // 1분에 100회 이상 요청
    SecurityLogger.log({
      type: "rate_limit_exceeded",
      severity: "medium",
      description: "High request frequency detected",
      metadata: {
        ip,
        requestCount,
        url,
        method
      },
      timestamp: new Date().toISOString()
    })
  }
  
  next()
}

/**
 * 에러 추적 미들웨어
 */
export const errorTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send.bind(res)
  
  res.send = function(data: any) {
    // 에러 응답 감지
    if (res.statusCode >= 400) {
      const errorInfo = {
        requestId: (req as any).requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        errorData: typeof data === 'string' ? data : JSON.stringify(data)
      }
      
      // 에러 심각도에 따른 로깅
      if (res.statusCode >= 500) {
        logger.error("Server error occurred", errorInfo)
      } else if (res.statusCode >= 400) {
        logger.warn("Client error occurred", errorInfo)
      }
    }
    
    return originalSend(data)
  }
  
  next()
}

/**
 * 성능 모니터링 미들웨어
 */
export const performanceMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime()
  const startMemory = process.memoryUsage()
  
  // 성능 모니터링 (안전한 방법)
  try {
    if (res.on && typeof res.on === 'function') {
      res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(startTime)
        const duration = seconds * 1000 + nanoseconds / 1000000 // Convert to milliseconds
        const endMemory = process.memoryUsage()
        
        const memoryDelta = {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        }
        
        // 성능 임계값 체크
        const isSlowRequest = duration > 5000 // 5초 이상
        const isHighMemoryUsage = memoryDelta.heapUsed > 50 * 1024 * 1024 // 50MB 이상
        
        if (isSlowRequest || isHighMemoryUsage) {
          logger.warn("Performance issue detected", {
            requestId: (req as any).requestId,
            method: req.method,
            url: req.url,
            duration,
            memoryDelta: {
              rss: Math.round(memoryDelta.rss / 1024 / 1024),
              heapUsed: Math.round(memoryDelta.heapUsed / 1024 / 1024),
              heapTotal: Math.round(memoryDelta.heapTotal / 1024 / 1024)
            },
            isSlowRequest,
            isHighMemoryUsage,
            timestamp: new Date().toISOString()
          })
        }
      })
    } else {
      // on 메서드가 없는 경우 대체 방법 사용
      const originalSend = res.send
      res.send = function(data: any) {
        const [seconds, nanoseconds] = process.hrtime(startTime)
        const duration = seconds * 1000 + nanoseconds / 1000000
        const endMemory = process.memoryUsage()
        
        const memoryDelta = {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        }
        
        const isSlowRequest = duration > 5000
        const isHighMemoryUsage = memoryDelta.heapUsed > 50 * 1024 * 1024
        
        if (isSlowRequest || isHighMemoryUsage) {
          logger.warn("Performance issue detected", {
            requestId: (req as any).requestId,
            method: req.method,
            url: req.url,
            duration,
            memoryDelta: {
              rss: Math.round(memoryDelta.rss / 1024 / 1024),
              heapUsed: Math.round(memoryDelta.heapUsed / 1024 / 1024),
              heapTotal: Math.round(memoryDelta.heapTotal / 1024 / 1024)
            },
            isSlowRequest,
            isHighMemoryUsage,
            timestamp: new Date().toISOString()
          })
        }
        
        return originalSend.call(this, data)
      }
    }
  } catch (error) {
    console.warn('Failed to set up performance monitoring:', error)
  }
  
  next()
}

/**
 * 비즈니스 로직 로깅 미들웨어
 */
export const businessLogicLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 중요한 비즈니스 로직 엔드포인트 감지
  const businessEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/gyms',
    '/api/posts',
    '/api/workouts'
  ]
  
  const isBusinessEndpoint = businessEndpoints.some(endpoint => 
    req.url.startsWith(endpoint)
  )
  
  if (isBusinessEndpoint) {
    logger.info("Business logic accessed", {
      requestId: (req as any).requestId,
      endpoint: req.url,
      method: req.method,
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString()
    })
  }
  
  next()
}

/**
 * 로그 정리 함수
 */
export function cleanupOldLogs(daysToKeep: number = 30): void {
  const logsDir = path.join(process.cwd(), "logs")
  
  if (!fs.existsSync(logsDir)) {
    return
  }
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  
  try {
    const files = fs.readdirSync(logsDir)
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file)
      const stats = fs.statSync(filePath)
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath)
        logger.info(`Cleaned up old log file: ${file}`)
      }
    })
  } catch (error) {
    logger.error("Failed to cleanup old logs:", error)
  }
}
