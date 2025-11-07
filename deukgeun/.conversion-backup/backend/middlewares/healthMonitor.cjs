"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = exports.detailedHealthCheckMiddleware = exports.healthCheckMiddleware = void 0;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.getHealthStatus = getHealthStatus;
const databaseConfig_1 = require('../config/databaseConfig.cjs');
const logger_1 = require('../utils/logger.cjs');
async function checkDatabaseHealth() {
    if (!databaseConfig_1.AppDataSource.isInitialized) {
        return { connected: false, error: "Database not initialized" };
    }
    try {
        const startTime = Date.now();
        await databaseConfig_1.AppDataSource.query("SELECT 1 as health_check");
        const responseTime = Date.now() - startTime;
        return { connected: true, responseTime };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { connected: false, error: errorMessage };
    }
}
function getMemoryUsage() {
    const memory = process.memoryUsage();
    return {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024),
        arrayBuffers: Math.round(memory.arrayBuffers / 1024 / 1024)
    };
}
function getCpuUsage() {
    try {
        const usage = process.cpuUsage();
        const totalUsage = usage.user + usage.system;
        return totalUsage / 1000000;
    }
    catch {
        return undefined;
    }
}
function getLoadAverage() {
    try {
        const os = require('os');
        return os.loadavg();
    }
    catch {
        return undefined;
    }
}
async function getHealthStatus() {
    const database = await checkDatabaseHealth();
    const memory = getMemoryUsage();
    const cpuUsage = getCpuUsage();
    const loadAverage = getLoadAverage();
    let status = "healthy";
    if (!database.connected) {
        status = "unhealthy";
    }
    else if (database.responseTime && database.responseTime > 5000) {
        status = "degraded";
    }
    else if (memory.heapUsed > 1000) {
        status = "degraded";
    }
    return {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        database,
        memory,
        performance: {
            cpuUsage,
            loadAverage
        }
    };
}
const healthCheckMiddleware = async (req, res, next) => {
    try {
        const healthStatus = await getHealthStatus();
        res.status(200).json(healthStatus);
    }
    catch (error) {
        logger_1.logger.error("Health check failed:", error);
        res.status(200).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: "Health check failed",
            message: "Server is running but health check encountered an error"
        });
    }
};
exports.healthCheckMiddleware = healthCheckMiddleware;
const detailedHealthCheckMiddleware = async (req, res, next) => {
    try {
        const healthStatus = await getHealthStatus();
        const debugInfo = {
            ...healthStatus,
            process: {
                pid: process.pid,
                version: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: process.uptime()
            },
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
                DB_HOST: process.env.DB_HOST,
                DB_PORT: process.env.DB_PORT,
                DB_DATABASE: process.env.DB_DATABASE
            }
        };
        res.json(debugInfo);
    }
    catch (error) {
        logger_1.logger.error("Detailed health check failed:", error);
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: "Detailed health check failed"
        });
    }
};
exports.detailedHealthCheckMiddleware = detailedHealthCheckMiddleware;
const metricsMiddleware = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const memory = process.memoryUsage();
        logger_1.logger.info("Request metrics", {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            memory: {
                rss: Math.round(memory.rss / 1024 / 1024),
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
            },
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
