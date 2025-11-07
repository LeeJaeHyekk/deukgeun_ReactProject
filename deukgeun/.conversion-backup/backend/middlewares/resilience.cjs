"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCircuitBreakerStatus = exports.memoryMonitorMiddleware = exports.apiResilienceMiddleware = exports.databaseResilienceMiddleware = void 0;
exports.retryWithBackoff = retryWithBackoff;
exports.executeWithCircuitBreaker = executeWithCircuitBreaker;
exports.executeWithTimeout = executeWithTimeout;
const logger_1 = require('../utils/logger.cjs');
const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
};
const DEFAULT_CIRCUIT_BREAKER_CONFIG = {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    monitoringPeriod: 60000
};
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.nextAttemptTime = 0;
    }
    async execute(operation) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttemptTime) {
                throw new Error("Circuit breaker is OPEN - operation blocked");
            }
            this.state = CircuitState.HALF_OPEN;
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        this.state = CircuitState.CLOSED;
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
            logger_1.logger.warn(`Circuit breaker opened after ${this.failureCount} failures`);
        }
    }
    getState() {
        return this.state;
    }
    getFailureCount() {
        return this.failureCount;
    }
}
async function retryWithBackoff(operation, config = {}) {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError;
    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === finalConfig.maxRetries) {
                logger_1.logger.error(`Operation failed after ${finalConfig.maxRetries} retries`, { error: lastError.message });
                throw lastError;
            }
            const delay = Math.min(finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt), finalConfig.maxDelay);
            logger_1.logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${finalConfig.maxRetries})`, {
                error: lastError.message
            });
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
const circuitBreakers = new Map();
function getCircuitBreaker(name, config) {
    if (!circuitBreakers.has(name)) {
        const finalConfig = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
        circuitBreakers.set(name, new CircuitBreaker(finalConfig));
    }
    return circuitBreakers.get(name);
}
async function executeWithCircuitBreaker(name, operation, config) {
    const circuitBreaker = getCircuitBreaker(name, config);
    return circuitBreaker.execute(operation);
}
async function executeWithTimeout(operation, timeoutMs, errorMessage = "Operation timed out") {
    return Promise.race([
        operation(),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`${errorMessage} (${timeoutMs}ms)`)), timeoutMs);
        })
    ]);
}
const databaseResilienceMiddleware = (req, res, next) => {
    const originalSend = res.send.bind(res);
    res.send = function (data) {
        if (res.statusCode >= 500) {
            logger_1.logger.error("Database operation failed", {
                url: req.url,
                method: req.method,
                statusCode: res.statusCode,
                timestamp: new Date().toISOString()
            });
        }
        return originalSend(data);
    };
    next();
};
exports.databaseResilienceMiddleware = databaseResilienceMiddleware;
const apiResilienceMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            logger_1.logger.error("Request timeout", {
                url: req.url,
                method: req.method,
                duration: Date.now() - startTime
            });
            res.status(408).json({
                error: "Request timeout",
                message: "The request took too long to process"
            });
        }
    }, 30000);
    res.on('finish', () => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        if (duration > 10000) {
            logger_1.logger.warn("Slow request detected", {
                url: req.url,
                method: req.method,
                duration,
                statusCode: res.statusCode
            });
        }
    });
    next();
};
exports.apiResilienceMiddleware = apiResilienceMiddleware;
const memoryMonitorMiddleware = (req, res, next) => {
    const memory = process.memoryUsage();
    const heapUsedMB = memory.heapUsed / 1024 / 1024;
    if (heapUsedMB > 500) {
        logger_1.logger.warn("High memory usage detected", {
            heapUsedMB: Math.round(heapUsedMB),
            rssMB: Math.round(memory.rss / 1024 / 1024),
            url: req.url,
            method: req.method
        });
    }
    if (heapUsedMB > 1024) {
        logger_1.logger.error("Critical memory usage detected", {
            heapUsedMB: Math.round(heapUsedMB),
            rssMB: Math.round(memory.rss / 1024 / 1024),
            url: req.url,
            method: req.method
        });
    }
    next();
};
exports.memoryMonitorMiddleware = memoryMonitorMiddleware;
const getCircuitBreakerStatus = (req, res) => {
    const status = Array.from(circuitBreakers.entries()).map(([name, breaker]) => ({
        name,
        state: breaker.getState(),
        failureCount: breaker.getFailureCount()
    }));
    res.json({
        circuitBreakers: status,
        timestamp: new Date().toISOString()
    });
};
exports.getCircuitBreakerStatus = getCircuitBreakerStatus;
