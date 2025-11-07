"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.extendedLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config = {
    environment: process.env.NODE_ENV || "development"
};
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const logColors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`));
const productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const logDir = path_1.default.join(process.cwd(), "logs");
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const errorLogPath = path_1.default.join(logDir, "error.log");
const combinedLogPath = path_1.default.join(logDir, "combined.log");
const accessLogPath = path_1.default.join(logDir, "access.log");
const logger = winston_1.default.createLogger({
    levels: logLevels,
    level: config.environment === "production" ? "info" : "debug",
    format: config.environment === "production" ? productionFormat : logFormat,
    transports: [
        new winston_1.default.transports.File({
            filename: errorLogPath,
            level: "error",
            maxsize: 5242880,
            maxFiles: 5,
            tailable: true,
        }),
        new winston_1.default.transports.File({
            filename: combinedLogPath,
            maxsize: 5242880,
            maxFiles: 5,
            tailable: true,
        }),
        ...(config.environment === "production"
            ? [
                new winston_1.default.transports.File({
                    filename: accessLogPath,
                    level: "http",
                    maxsize: 5242880,
                    maxFiles: 5,
                    tailable: true,
                }),
            ]
            : []),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "exceptions.log"),
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
    exitOnError: false,
});
exports.logger = logger;
if (config.environment !== "production") {
    logger.add(new winston_1.default.transports.Console({
        format: logFormat,
    }));
}
if (config.environment === "production") {
    const rotateLogs = () => {
        const today = new Date().toISOString().split("T")[0];
        const archiveDir = path_1.default.join(logDir, "archive", today);
        fs_1.default.mkdirSync(archiveDir, { recursive: true });
        const files = ["error.log", "combined.log", "access.log"];
        files.forEach(file => {
            const sourcePath = path_1.default.join(logDir, file);
            const targetPath = path_1.default.join(archiveDir, file);
            if (fs_1.default.existsSync(sourcePath)) {
                fs_1.default.renameSync(sourcePath, targetPath);
            }
        });
    };
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            rotateLogs();
        }
    }, 60000);
}
exports.extendedLogger = {
    ...logger,
    logRequest: (req, res, responseTime) => {
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get("User-Agent"),
            ip: req.ip || req.connection.remoteAddress,
            timestamp: new Date().toISOString(),
        };
        if (res.statusCode >= 400) {
            logger.warn("HTTP Request", logData);
        }
        else {
            logger.http("HTTP Request", logData);
        }
    },
    logQuery: (query, parameters, executionTime) => {
        if (executionTime > 1000) {
            logger.warn("Slow Query", {
                query,
                parameters,
                executionTime: `${executionTime}ms`,
                timestamp: new Date().toISOString(),
            });
        }
        else if (config.environment === "development") {
            logger.debug("Database Query", {
                query,
                parameters,
                executionTime: `${executionTime}ms`,
            });
        }
    },
    logError: (error, context) => {
        logger.error("Application Error", {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
        });
    },
    logMetrics: (metrics) => {
        logger.info("Performance Metrics", {
            ...metrics,
            timestamp: new Date().toISOString(),
        });
    },
};
exports.default = logger;
