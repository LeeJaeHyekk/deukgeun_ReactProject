// ============================================================================
// 로거 유틸리티
// ============================================================================

import winston from "winston"
import { loggingConfig } from "../config/logging.js"

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// 개발 환경용 포맷
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "HH:mm:ss",
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`
  })
)

// 로거 생성
export const logger = winston.createLogger({
  level: loggingConfig.level,
  format: logFormat,
  defaultMeta: { service: "deukgeun-backend" },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 모든 로그 파일
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
})

// 개발 환경에서는 콘솔에도 출력
if (loggingConfig.enableDebug) {
  logger.add(
    new winston.transports.Console({
      format: devFormat,
    })
  )
}

// 성능 모니터링이 활성화된 경우
if (loggingConfig.enablePerformanceMonitoring) {
  logger.add(
    new winston.transports.File({
      filename: "logs/performance.log",
      level: "info",
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    })
  )
}

// 로거 헬퍼 함수들
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta)
}

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.stack, ...meta })
}

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta)
}

export default logger
