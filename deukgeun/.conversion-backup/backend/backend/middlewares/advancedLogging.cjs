"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessLogicLoggingMiddleware = exports.performanceMonitoringMiddleware = exports.errorTrackingMiddleware = exports.securityMonitoringMiddleware = exports.requestTrackingMiddleware = exports.SecurityLogger = void 0;
exports.cleanupOldLogs = cleanupOldLogs;
const logger_1 = require('utils/logger');
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
class SecurityLogger {
    static log(event) {
        const logEntry = {
            ...event,
            timestamp: new Date().toISOString()
        };
        console.warn(`🚨 SECURITY ALERT [${event.severity.toUpperCase()}]: ${event.description}`);
        try {
            if (!fs.existsSync(path.dirname(this.logFile))) {
                fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
            }
            fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + "\n");
        }
        catch (error) {
            console.error("Failed to write security log:", error);
        }
        if (event.severity === "critical" || event.severity === "high") {
            logger_1.logger.error("Critical security event detected", logEntry);
        }
    }
}
exports.SecurityLogger = SecurityLogger;
SecurityLogger.logFile = path.join(process.cwd(), "logs", "security.log");
const requestTrackingMiddleware = (req, res, next) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    try {
        if (res.setHeader && typeof res.setHeader === 'function') {
            res.setHeader('X-Request-ID', requestId);
        }
        else {
            res.header('X-Request-ID', requestId);
        }
    }
    catch (error) {
        console.warn('Failed to set request ID header:', error);
    }
    req.requestId = requestId;
    req.startTime = startTime;
    logger_1.logger.info("Request started", {
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    try {
        if (res.on && typeof res.on === 'function') {
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
                logger_1.logger[logLevel]("Request completed", {
                    requestId,
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString()
                });
            });
        }
        else {
            const originalSend = res.send;
            res.send = function (data) {
                const duration = Date.now() - startTime;
                const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
                logger_1.logger[logLevel]("Request completed", {
                    requestId,
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString()
                });
                return originalSend.call(this, data);
            };
        }
    }
    catch (error) {
        console.warn('Failed to set up response logging:', error);
    }
    next();
};
exports.requestTrackingMiddleware = requestTrackingMiddleware;
const securityMonitoringMiddleware = (req, res, next) => {
    const ip = req.ip;
    const userAgent = req.get('User-Agent') || '';
    const url = req.url;
    const method = req.method;
    const suspiciousPatterns = [
        /\.\.\//,
        /<script/i,
        /union.*select/i,
        /eval\(/i,
        /javascript:/i,
        /on\w+\s*=/i
    ];
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url) || pattern.test(userAgent));
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
                patterns: suspiciousPatterns.filter(pattern => pattern.test(url) || pattern.test(userAgent)).map(p => p.toString())
            },
            timestamp: new Date().toISOString()
        });
    }
    const requestCount = req.requestCount || 0;
    if (requestCount > 100) {
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
        });
    }
    next();
};
exports.securityMonitoringMiddleware = securityMonitoringMiddleware;
const errorTrackingMiddleware = (req, res, next) => {
    const originalSend = res.send.bind(res);
    res.send = function (data) {
        if (res.statusCode >= 400) {
            const errorInfo = {
                requestId: req.requestId,
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
                errorData: typeof data === 'string' ? data : JSON.stringify(data)
            };
            if (res.statusCode >= 500) {
                logger_1.logger.error("Server error occurred", errorInfo);
            }
            else if (res.statusCode >= 400) {
                logger_1.logger.warn("Client error occurred", errorInfo);
            }
        }
        return originalSend(data);
    };
    next();
};
exports.errorTrackingMiddleware = errorTrackingMiddleware;
const performanceMonitoringMiddleware = (req, res, next) => {
    const startTime = process.hrtime();
    const startMemory = process.memoryUsage();
    try {
        if (res.on && typeof res.on === 'function') {
            res.on('finish', () => {
                const [seconds, nanoseconds] = process.hrtime(startTime);
                const duration = seconds * 1000 + nanoseconds / 1000000;
                const endMemory = process.memoryUsage();
                const memoryDelta = {
                    rss: endMemory.rss - startMemory.rss,
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal
                };
                const isSlowRequest = duration > 5000;
                const isHighMemoryUsage = memoryDelta.heapUsed > 50 * 1024 * 1024;
                if (isSlowRequest || isHighMemoryUsage) {
                    logger_1.logger.warn("Performance issue detected", {
                        requestId: req.requestId,
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
                    });
                }
            });
        }
        else {
            const originalSend = res.send;
            res.send = function (data) {
                const [seconds, nanoseconds] = process.hrtime(startTime);
                const duration = seconds * 1000 + nanoseconds / 1000000;
                const endMemory = process.memoryUsage();
                const memoryDelta = {
                    rss: endMemory.rss - startMemory.rss,
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal
                };
                const isSlowRequest = duration > 5000;
                const isHighMemoryUsage = memoryDelta.heapUsed > 50 * 1024 * 1024;
                if (isSlowRequest || isHighMemoryUsage) {
                    logger_1.logger.warn("Performance issue detected", {
                        requestId: req.requestId,
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
                    });
                }
                return originalSend.call(this, data);
            };
        }
    }
    catch (error) {
        console.warn('Failed to set up performance monitoring:', error);
    }
    next();
};
exports.performanceMonitoringMiddleware = performanceMonitoringMiddleware;
const businessLogicLoggingMiddleware = (req, res, next) => {
    const businessEndpoints = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/gyms',
        '/api/posts',
        '/api/workouts'
    ];
    const isBusinessEndpoint = businessEndpoints.some(endpoint => req.url.startsWith(endpoint));
    if (isBusinessEndpoint) {
        logger_1.logger.info("Business logic accessed", {
            requestId: req.requestId,
            endpoint: req.url,
            method: req.method,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
    }
    next();
};
exports.businessLogicLoggingMiddleware = businessLogicLoggingMiddleware;
function cleanupOldLogs(daysToKeep = 30) {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
        return;
    }
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    try {
        const files = fs.readdirSync(logsDir);
        files.forEach(file => {
            const filePath = path.join(logsDir, file);
            const stats = fs.statSync(filePath);
            if (stats.mtime < cutoffDate) {
                fs.unlinkSync(filePath);
                logger_1.logger.info(`Cleaned up old log file: ${file}`);
            }
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to cleanup old logs:", error);
    }
}
