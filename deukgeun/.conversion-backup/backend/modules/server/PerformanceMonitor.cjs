"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPerformanceTimer = startPerformanceTimer;
exports.endPerformanceTimer = endPerformanceTimer;
exports.measurePerformance = measurePerformance;
exports.measureAsyncPerformance = measureAsyncPerformance;
exports.getAllPerformanceMetrics = getAllPerformanceMetrics;
exports.getPerformanceMetricsByName = getPerformanceMetricsByName;
exports.logPerformanceMetrics = logPerformanceMetrics;
exports.clearPerformanceMetrics = clearPerformanceMetrics;
exports.getMemoryUsage = getMemoryUsage;
exports.logMemoryUsage = logMemoryUsage;
const perf_hooks_1 = require("perf_hooks");
const performanceMetrics = new Map();
function startPerformanceTimer(name, metadata) {
    const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    performanceMetrics.set(timerId, {
        name,
        startTime: perf_hooks_1.performance.now(),
        memory: process.memoryUsage(),
        metadata
    });
    console.log(`⏱️ Performance timer started: ${name}`);
    return timerId;
}
function endPerformanceTimer(timerId) {
    const metric = performanceMetrics.get(timerId);
    if (!metric) {
        console.warn(`⚠️ Performance timer not found: ${timerId}`);
        return null;
    }
    const endTime = perf_hooks_1.performance.now();
    const duration = endTime - metric.startTime;
    const finalMetric = {
        ...metric,
        endTime,
        duration,
        memory: process.memoryUsage()
    };
    performanceMetrics.set(timerId, finalMetric);
    console.log(`⏱️ Performance timer ended: ${metric.name} (${duration.toFixed(2)}ms)`);
    return finalMetric;
}
function measurePerformance(name, fn, metadata) {
    return ((...args) => {
        const timerId = startPerformanceTimer(name, metadata);
        try {
            const result = fn(...args);
            if (result instanceof Promise) {
                return result.finally(() => {
                    endPerformanceTimer(timerId);
                });
            }
            endPerformanceTimer(timerId);
            return result;
        }
        catch (error) {
            endPerformanceTimer(timerId);
            throw error;
        }
    });
}
function measureAsyncPerformance(name, fn, metadata) {
    return (async (...args) => {
        const timerId = startPerformanceTimer(name, metadata);
        try {
            const result = await fn(...args);
            endPerformanceTimer(timerId);
            return result;
        }
        catch (error) {
            endPerformanceTimer(timerId);
            throw error;
        }
    });
}
function getAllPerformanceMetrics() {
    return Array.from(performanceMetrics.values());
}
function getPerformanceMetricsByName(name) {
    return Array.from(performanceMetrics.values()).filter(metric => metric.name === name);
}
function logPerformanceMetrics() {
    const metrics = getAllPerformanceMetrics();
    if (metrics.length === 0) {
        console.log("📊 No performance metrics available");
        return;
    }
    console.log("📊 Performance Metrics:");
    console.log("=".repeat(60));
    const groupedMetrics = metrics.reduce((acc, metric) => {
        if (!acc[metric.name]) {
            acc[metric.name] = [];
        }
        acc[metric.name].push(metric);
        return acc;
    }, {});
    for (const [name, metricList] of Object.entries(groupedMetrics)) {
        const durations = metricList
            .filter(m => m.duration !== undefined)
            .map(m => m.duration);
        if (durations.length === 0)
            continue;
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        console.log(`📈 ${name}:`);
        console.log(`   - Count: ${durations.length}`);
        console.log(`   - Average: ${avgDuration.toFixed(2)}ms`);
        console.log(`   - Min: ${minDuration.toFixed(2)}ms`);
        console.log(`   - Max: ${maxDuration.toFixed(2)}ms`);
        console.log("");
    }
    console.log("=".repeat(60));
}
function clearPerformanceMetrics() {
    performanceMetrics.clear();
    console.log("🗑️ Performance metrics cleared");
}
function getMemoryUsage() {
    return process.memoryUsage();
}
function logMemoryUsage() {
    const memory = getMemoryUsage();
    console.log("💾 Memory Usage:");
    console.log(`   - RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - External: ${(memory.external / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Array Buffers: ${(memory.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
}
