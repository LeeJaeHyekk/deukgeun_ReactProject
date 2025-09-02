// ============================================================================
// 성능 모니터링 미들웨어
// 프로덕션 환경에서 애플리케이션 성능을 추적
// ============================================================================

import { Request, Response, NextFunction } from "express"
import { performance } from "perf_hooks"
import { setTimeout } from "timers/promises"
import { randomBytes } from "crypto"
import { extendedLogger } from "../utils/logger.js"

// 성능 메트릭 인터페이스
interface PerformanceMetrics {
  responseTime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  timestamp: number
}

// 성능 모니터링 미들웨어
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = process.hrtime()
  const startMemory = process.memoryUsage()
  const startCpu = process.cpuUsage()

  // 응답 완료 후 성능 측정
  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime)
    const responseTime = seconds * 1000 + nanoseconds / 1000000 // 밀리초 단위

    const endMemory = process.memoryUsage()
    const endCpu = process.cpuUsage()

    const metrics: PerformanceMetrics = {
      responseTime,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: (endMemory as any).arrayBuffers
          ? (endMemory as any).arrayBuffers - (startMemory as any).arrayBuffers
          : 0,
      },
      cpuUsage: {
        user: endCpu.user - startCpu.user,
        system: endCpu.system - startCpu.system,
      },
      timestamp: Date.now(),
    }

    // 성능 로깅
    extendedLogger.logRequest(req, res, responseTime)

    // 느린 응답 경고 (1초 이상)
    if (responseTime > 1000) {
      extendedLogger.warn("Slow Response Detected", {
        url: req.url,
        method: req.method,
        responseTime: `${responseTime.toFixed(2)}ms`,
        statusCode: res.statusCode,
        userAgent: req.get("User-Agent"),
        ip: req.ip || req.connection.remoteAddress,
      })
    }

    // 메모리 사용량 경고 (100MB 이상 증가)
    const memoryIncreaseMB = metrics.memoryUsage.rss / 1024 / 1024
    if (memoryIncreaseMB > 100) {
      extendedLogger.warn("High Memory Usage Detected", {
        url: req.url,
        method: req.method,
        memoryIncreaseMB: memoryIncreaseMB.toFixed(2),
        heapIncreaseMB: (metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      })
    }

    // CPU 사용량 경고 (100ms 이상)
    const totalCpuUsage = metrics.cpuUsage.user + metrics.cpuUsage.system
    if (totalCpuUsage > 100000) {
      // 100ms in microseconds
      extendedLogger.warn("High CPU Usage Detected", {
        url: req.url,
        method: req.method,
        cpuUsageUser: `${(metrics.cpuUsage.user / 1000).toFixed(2)}ms`,
        cpuUsageSystem: `${(metrics.cpuUsage.system / 1000).toFixed(2)}ms`,
      })
    }

    // 정기적인 성능 메트릭 로깅 (10% 확률)
    if (Math.random() < 0.1) {
      extendedLogger.logMetrics({
        type: "request_performance",
        ...metrics,
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
      })
    }
  })

  next()
}

// 메모리 누수 감지 미들웨어
export const memoryLeakDetector = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentMemory = process.memoryUsage()

  // 메모리 사용량이 1GB를 초과하는 경우 경고
  if (currentMemory.heapUsed > 1024 * 1024 * 1024) {
    // 1GB
    extendedLogger.error("Memory Leak Warning", {
      heapUsed: `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(currentMemory.rss / 1024 / 1024).toFixed(2)}MB`,
      url: req.url,
      method: req.method,
    })
  }

  next()
}

// 연결 풀 모니터링
export const connectionPoolMonitor = () => {
  setInterval(() => {
    const currentMemory = process.memoryUsage()
    const currentCpu = process.cpuUsage()

    extendedLogger.logMetrics({
      type: "system_performance",
      memory: {
        heapUsed: `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(currentMemory.rss / 1024 / 1024).toFixed(2)}MB`,
        external: `${(currentMemory.external / 1024 / 1024).toFixed(2)}MB`,
        arrayBuffers: `${((currentMemory as any).arrayBuffers || 0 / 1024 / 1024).toFixed(2)}MB`,
      },
      cpu: {
        user: `${(currentCpu.user / 1000).toFixed(2)}ms`,
        system: `${(currentCpu.system / 1000).toFixed(2)}ms`,
      },
      uptime: process.uptime(),
      timestamp: Date.now(),
    })
  }, 60000) // 1분마다 체크
}

// 가비지 컬렉션 모니터링
export const garbageCollectionMonitor = () => {
  if (global.gc) {
    const gcStats = (global as any).gc.stats()

    setInterval(() => {
      extendedLogger.logMetrics({
        type: "garbage_collection",
        ...gcStats,
        timestamp: Date.now(),
      })
    }, 300000) // 5분마다 체크
  }
}

// 성능 모니터링 초기화
export const initializePerformanceMonitoring = () => {
  // 연결 풀 모니터링 시작
  connectionPoolMonitor()

  // 가비지 컬렉션 모니터링 시작
  garbageCollectionMonitor()

  extendedLogger.info("Performance monitoring initialized")
}
