import winston from "winston"
import path from "path"

// Create logs directory path
const logsDir = path.join(process.cwd(), "logs")

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  defaultMeta: { service: "gym-crawler" },
  transports: [
    // Error level logs only to separate file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    // All levels to combined file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  ],
})

// Add console transport in non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}

export { logger }
