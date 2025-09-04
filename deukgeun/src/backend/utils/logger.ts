// ============================================================================
// 프로덕션 환경을 위한 고급 로깅 시스템
// ============================================================================

import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { appConfig } from "../config/env.js"

// 로그 레벨 설정
const logLevel = appConfig.environment === "production" ? "info" : "debug"

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// 콘솔 출력 설정
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
})

// 파일 출력 설정
const fileTransport = new DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
})

// Winston 로거 생성
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [consoleTransport, fileTransport],
  exitOnError: false,
})

// 스트림 설정 (Morgan과 함께 사용)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}

export default logger
