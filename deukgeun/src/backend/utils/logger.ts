// ============================================================================
// 프로덕션 환경을 위한 고급 로깅 시스템
// ============================================================================

import winston from "winston"
import path from "path"
import fs from "fs"
// import { config } from "@backend/config/environmentConfig"

// 간단한 config 객체 정의
const config = {
  environment: process.env.NODE_ENV || "development"
}

// 로그 레벨 정의
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// 로그 색상 정의
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
}

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// 프로덕션용 JSON 포맷
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// 로그 파일 경로 설정
const logDir = config.environment === "production" ? "/app/logs" : "./logs"
const errorLogPath = path.join(logDir, "error.log")
const combinedLogPath = path.join(logDir, "combined.log")
const accessLogPath = path.join(logDir, "access.log")

// 로거 설정
const logger = winston.createLogger({
  levels: logLevels,
  level: config.environment === "production" ? "info" : "debug",
  format: config.environment === "production" ? productionFormat : logFormat,
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: errorLogPath,
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    // 통합 로그 파일
    new winston.transports.File({
      filename: combinedLogPath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    // HTTP 액세스 로그 (프로덕션에서만)
    ...(config.environment === "production"
      ? [
          new winston.transports.File({
            filename: accessLogPath,
            level: "http",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true,
          }),
        ]
      : []),
  ],
  // 예외 처리
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // 프로세스 종료 시 로그 처리
  exitOnError: false,
})

// 개발 환경에서는 콘솔 출력 추가
if (config.environment !== "production") {
  logger.add(
    new winston.transports.Console({
      format: logFormat,
    })
  )
}

// 로그 로테이션 설정 (프로덕션)
if (config.environment === "production") {
  // 매일 자정에 로그 로테이션
  const rotateLogs = () => {
    const today = new Date().toISOString().split("T")[0]
    const archiveDir = path.join(logDir, "archive", today)

    // 아카이브 디렉토리 생성
    fs.mkdirSync(archiveDir, { recursive: true })

    // 로그 파일 이동
    const files = ["error.log", "combined.log", "access.log"]
    files.forEach(file => {
      const sourcePath = path.join(logDir, file)
      const targetPath = path.join(archiveDir, file)

      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, targetPath)
      }
    })
  }

  // 매일 자정에 로그 로테이션 실행
  setInterval(() => {
    const now = new Date()
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      rotateLogs()
    }
  }, 60000) // 1분마다 체크
}

// 로그 메서드 확장
export const extendedLogger = {
  ...logger,

  // HTTP 요청 로깅
  logRequest: (req: any, res: any, responseTime: number) => {
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
    }

    if (res.statusCode >= 400) {
      logger.warn("HTTP Request", logData)
    } else {
      logger.http("HTTP Request", logData)
    }
  },

  // 데이터베이스 쿼리 로깅
  logQuery: (query: string, parameters: any[], executionTime: number) => {
    if (executionTime > 1000) {
      // 1초 이상 걸리는 쿼리
      logger.warn("Slow Query", {
        query,
        parameters,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
      })
    } else if (config.environment === "development") {
      logger.debug("Database Query", {
        query,
        parameters,
        executionTime: `${executionTime}ms`,
      })
    }
  },

  // 에러 로깅 (스택 트레이스 포함)
  logError: (error: Error, context?: any) => {
    logger.error("Application Error", {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    })
  },

  // 성능 메트릭 로깅
  logMetrics: (metrics: any) => {
    logger.info("Performance Metrics", {
      ...metrics,
      timestamp: new Date().toISOString(),
    })
  },
}

export { logger }
export default logger
