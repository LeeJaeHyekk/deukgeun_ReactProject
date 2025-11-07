"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePerformanceMonitoring = exports.garbageCollectionMonitor = exports.connectionPoolMonitor = exports.memoryLeakDetector = exports.performanceMonitor = void 0;
const logger_1 = require('../utils/logger.cjs');
const performanceMonitor = (req, res, next) => {
    const startTime = process.hrtime();
    const startMemory = process.memoryUsage();
    const startCpu = process.cpuUsage();
    res.on("finish", () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const responseTime = seconds * 1000 + nanoseconds / 1000000;
        const endMemory = process.memoryUsage();
        const endCpu = process.cpuUsage();
        const metrics = {
            responseTime,
            memoryUsage: {
                rss: endMemory.rss - startMemory.rss,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                external: endMemory.external - startMemory.external,
                arrayBuffers: endMemory.arrayBuffers
                    ? endMemory.arrayBuffers - startMemory.arrayBuffers
                    : 0,
            },
            cpuUsage: {
                user: endCpu.user - startCpu.user,
                system: endCpu.system - startCpu.system,
            },
            timestamp: Date.now(),
        };
        logger_1.extendedLogger.logRequest(req, res, responseTime);
        if (responseTime > 1000) {
            logger_1.extendedLogger.warn("Slow Response Detected", {
                url: req.url,
                method: req.method,
                responseTime: `${responseTime.toFixed(2)}ms`,
                statusCode: res.statusCode,
                userAgent: req.get("User-Agent"),
                ip: req.ip || req.connection.remoteAddress,
            });
        }
        const memoryIncreaseMB = metrics.memoryUsage.rss / 1024 / 1024;
        if (memoryIncreaseMB > 100) {
            logger_1.extendedLogger.warn("High Memory Usage Detected", {
                url: req.url,
                method: req.method,
                memoryIncreaseMB: memoryIncreaseMB.toFixed(2),
                heapIncreaseMB: (metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
            });
        }
        const totalCpuUsage = metrics.cpuUsage.user + metrics.cpuUsage.system;
        if (totalCpuUsage > 100000) {
            logger_1.extendedLogger.warn("High CPU Usage Detected", {
                url: req.url,
                method: req.method,
                cpuUsageUser: `${(metrics.cpuUsage.user / 1000).toFixed(2)}ms`,
                cpuUsageSystem: `${(metrics.cpuUsage.system / 1000).toFixed(2)}ms`,
            });
        }
        if (Math.random() < 0.1) {
            logger_1.extendedLogger.logMetrics({
                type: "request_performance",
                ...metrics,
                url: req.url,
                method: req.method,
                statusCode: res.statusCode,
            });
        }
    });
    next();
};
exports.performanceMonitor = performanceMonitor;
const memoryLeakDetector = (req, res, next) => {
    const currentMemory = process.memoryUsage();
    if (currentMemory.heapUsed > 1024 * 1024 * 1024) {
        logger_1.extendedLogger.error("Memory Leak Warning", {
            heapUsed: `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            heapTotal: `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            rss: `${(currentMemory.rss / 1024 / 1024).toFixed(2)}MB`,
            url: req.url,
            method: req.method,
        });
    }
    next();
};
exports.memoryLeakDetector = memoryLeakDetector;
const connectionPoolMonitor = () => {
    setInterval(() => {
        const currentMemory = process.memoryUsage();
        const currentCpu = process.cpuUsage();
        logger_1.extendedLogger.logMetrics({
            type: "system_performance",
            memory: {
                heapUsed: `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
                heapTotal: `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
                rss: `${(currentMemory.rss / 1024 / 1024).toFixed(2)}MB`,
                external: `${(currentMemory.external / 1024 / 1024).toFixed(2)}MB`,
                arrayBuffers: `${(currentMemory.arrayBuffers || 0 / 1024 / 1024).toFixed(2)}MB`,
            },
            cpu: {
                user: `${(currentCpu.user / 1000).toFixed(2)}ms`,
                system: `${(currentCpu.system / 1000).toFixed(2)}ms`,
            },
            uptime: process.uptime(),
            timestamp: Date.now(),
        });
    }, 60000);
};
exports.connectionPoolMonitor = connectionPoolMonitor;
const garbageCollectionMonitor = () => {
    if (global.gc) {
        const gcStats = global.gc.stats();
        setInterval(() => {
            logger_1.extendedLogger.logMetrics({
                type: "garbage_collection",
                ...gcStats,
                timestamp: Date.now(),
            });
        }, 300000);
    }
};
exports.garbageCollectionMonitor = garbageCollectionMonitor;
const initializePerformanceMonitoring = () => {
    (0, exports.connectionPoolMonitor)();
    (0, exports.garbageCollectionMonitor)();
    logger_1.extendedLogger.info("Performance monitoring initialized");
};
exports.initializePerformanceMonitoring = initializePerformanceMonitoring;
