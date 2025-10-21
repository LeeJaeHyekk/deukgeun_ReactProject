// ============================================================================
// 복원력 및 안정성 미들웨어
// ============================================================================

import { Request, Response, NextFunction } from "express"
import { logger } from "@backend/utils/logger"

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
}

/**
 * 기본 재시도 설정
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
}

/**
 * 기본 서킷 브레이커 설정
 */
const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 30000,
  monitoringPeriod: 60000
}

/**
 * 서킷 브레이커 상태
 */
enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN", 
  HALF_OPEN = "HALF_OPEN"
}

/**
 * 서킷 브레이커 클래스
 */
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private lastFailureTime: number = 0
  private nextAttemptTime: number = 0

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error("Circuit breaker is OPEN - operation blocked")
      }
      this.state = CircuitState.HALF_OPEN
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0
    this.state = CircuitState.CLOSED
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeout
      logger.warn(`Circuit breaker opened after ${this.failureCount} failures`)
    }
  }

  getState(): CircuitState {
    return this.state
  }

  getFailureCount(): number {
    return this.failureCount
  }
}

/**
 * 지수 백오프를 사용한 재시도 함수
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === finalConfig.maxRetries) {
        logger.error(`Operation failed after ${finalConfig.maxRetries} retries`, { error: lastError.message })
        throw lastError
      }

      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
        finalConfig.maxDelay
      )

      logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${finalConfig.maxRetries})`, {
        error: lastError.message
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * 서킷 브레이커 인스턴스들
 */
const circuitBreakers = new Map<string, CircuitBreaker>()

/**
 * 서킷 브레이커를 가져오거나 생성합니다.
 */
function getCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    const finalConfig = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config }
    circuitBreakers.set(name, new CircuitBreaker(finalConfig))
  }
  return circuitBreakers.get(name)!
}

/**
 * 서킷 브레이커와 함께 작업을 실행합니다.
 */
export async function executeWithCircuitBreaker<T>(
  name: string,
  operation: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const circuitBreaker = getCircuitBreaker(name, config)
  return circuitBreaker.execute(operation)
}

/**
 * 타임아웃과 함께 작업을 실행합니다.
 */
export async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  errorMessage: string = "Operation timed out"
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`${errorMessage} (${timeoutMs}ms)`)), timeoutMs)
    })
  ])
}

/**
 * 데이터베이스 작업을 위한 복원력 미들웨어
 */
export const databaseResilienceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send.bind(res)
  
  res.send = function(data: any) {
    // 데이터베이스 연결 상태 확인
    if (res.statusCode >= 500) {
      logger.error("Database operation failed", {
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      })
    }
    
    return originalSend(data)
  }
  
  next()
}

/**
 * API 요청을 위한 복원력 미들웨어
 */
export const apiResilienceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  // 요청 타임아웃 설정 (30초)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      logger.error("Request timeout", {
        url: req.url,
        method: req.method,
        duration: Date.now() - startTime
      })
      res.status(408).json({
        error: "Request timeout",
        message: "The request took too long to process"
      })
    }
  }, 30000)
  
  res.on('finish', () => {
    clearTimeout(timeout)
    
    const duration = Date.now() - startTime
    if (duration > 10000) { // 10초 이상 걸린 요청 로깅
      logger.warn("Slow request detected", {
        url: req.url,
        method: req.method,
        duration,
        statusCode: res.statusCode
      })
    }
  })
  
  next()
}

/**
 * 메모리 사용량 모니터링 미들웨어
 */
export const memoryMonitorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const memory = process.memoryUsage()
  const heapUsedMB = memory.heapUsed / 1024 / 1024
  
  // 메모리 사용량이 500MB를 초과하면 경고
  if (heapUsedMB > 500) {
    logger.warn("High memory usage detected", {
      heapUsedMB: Math.round(heapUsedMB),
      rssMB: Math.round(memory.rss / 1024 / 1024),
      url: req.url,
      method: req.method
    })
  }
  
  // 메모리 사용량이 1GB를 초과하면 에러
  if (heapUsedMB > 1024) {
    logger.error("Critical memory usage detected", {
      heapUsedMB: Math.round(heapUsedMB),
      rssMB: Math.round(memory.rss / 1024 / 1024),
      url: req.url,
      method: req.method
    })
  }
  
  next()
}

/**
 * 서킷 브레이커 상태를 반환하는 엔드포인트
 */
export const getCircuitBreakerStatus = (req: Request, res: Response) => {
  const status = Array.from(circuitBreakers.entries()).map(([name, breaker]) => ({
    name,
    state: breaker.getState(),
    failureCount: breaker.getFailureCount()
  }))
  
  res.json({
    circuitBreakers: status,
    timestamp: new Date().toISOString()
  })
}
