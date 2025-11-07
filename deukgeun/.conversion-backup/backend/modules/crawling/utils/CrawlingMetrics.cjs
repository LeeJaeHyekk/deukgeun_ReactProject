"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlingMetricsCollector = void 0;
class CrawlingMetricsCollector {
    constructor() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            blockedRequests: 0,
            averageResponseTime: 0,
            successRate: 0,
            blockRate: 0,
            lastUpdated: Date.now()
        };
        this.strategyMetrics = new Map();
        this.gymMetrics = new Map();
        this.responseTimes = [];
    }
    recordRequestStart(gymName, strategyName) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.lastUpdated = startTime;
        this.updateGymMetrics(gymName, strategyName, startTime);
        this.updateStrategyMetrics(strategyName, startTime);
        return startTime;
    }
    recordRequestSuccess(gymName, strategyName, startTime, result) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        this.metrics.successfulRequests++;
        this.responseTimes.push(responseTime);
        this.updateAverageResponseTime();
        const gymMetric = this.gymMetrics.get(gymName);
        if (gymMetric) {
            gymMetric.successfulAttempts++;
            gymMetric.averageConfidence = (gymMetric.averageConfidence + result.confidence) / 2;
            gymMetric.lastSuccessfulStrategy = strategyName;
        }
        const strategyMetric = this.strategyMetrics.get(strategyName);
        if (strategyMetric) {
            strategyMetric.successfulAttempts++;
            strategyMetric.averageExecutionTime = (strategyMetric.averageExecutionTime + responseTime) / 2;
        }
        this.updateSuccessRate();
        this.metrics.lastUpdated = endTime;
        console.log(`📊 메트릭 기록: ${gymName} 성공 (${strategyName}, ${responseTime}ms)`);
    }
    recordRequestFailure(gymName, strategyName, startTime, error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        this.metrics.failedRequests++;
        this.responseTimes.push(responseTime);
        this.updateAverageResponseTime();
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
            this.metrics.blockedRequests++;
            this.updateBlockRate();
        }
        const gymMetric = this.gymMetrics.get(gymName);
        if (gymMetric) {
        }
        const strategyMetric = this.strategyMetrics.get(strategyName);
        if (strategyMetric) {
            strategyMetric.failedAttempts++;
            strategyMetric.averageExecutionTime = (strategyMetric.averageExecutionTime + responseTime) / 2;
        }
        this.updateSuccessRate();
        this.metrics.lastUpdated = endTime;
        console.log(`📊 메트릭 기록: ${gymName} 실패 (${strategyName}, ${responseTime}ms)`);
    }
    updateGymMetrics(gymName, strategyName, timestamp) {
        if (!this.gymMetrics.has(gymName)) {
            this.gymMetrics.set(gymName, {
                gymName,
                totalAttempts: 0,
                successfulAttempts: 0,
                strategiesUsed: [],
                averageConfidence: 0,
                lastSuccessfulStrategy: '',
                lastAttempt: timestamp
            });
        }
        const gymMetric = this.gymMetrics.get(gymName);
        gymMetric.totalAttempts++;
        gymMetric.lastAttempt = timestamp;
        if (!gymMetric.strategiesUsed.includes(strategyName)) {
            gymMetric.strategiesUsed.push(strategyName);
        }
    }
    updateStrategyMetrics(strategyName, timestamp) {
        if (!this.strategyMetrics.has(strategyName)) {
            this.strategyMetrics.set(strategyName, {
                strategyName,
                totalAttempts: 0,
                successfulAttempts: 0,
                failedAttempts: 0,
                averageExecutionTime: 0,
                successRate: 0,
                lastUsed: timestamp
            });
        }
        const strategyMetric = this.strategyMetrics.get(strategyName);
        strategyMetric.totalAttempts++;
        strategyMetric.lastUsed = timestamp;
    }
    updateAverageResponseTime() {
        if (this.responseTimes.length > 0) {
            const sum = this.responseTimes.reduce((a, b) => a + b, 0);
            this.metrics.averageResponseTime = sum / this.responseTimes.length;
        }
        if (this.responseTimes.length > 100) {
            this.responseTimes = this.responseTimes.slice(-100);
        }
    }
    updateSuccessRate() {
        if (this.metrics.totalRequests > 0) {
            this.metrics.successRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
        }
    }
    updateBlockRate() {
        if (this.metrics.totalRequests > 0) {
            this.metrics.blockRate = (this.metrics.blockedRequests / this.metrics.totalRequests) * 100;
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getStrategyMetrics() {
        return Array.from(this.strategyMetrics.values());
    }
    getGymMetrics() {
        return Array.from(this.gymMetrics.values());
    }
    getGymMetric(gymName) {
        return this.gymMetrics.get(gymName);
    }
    getStrategyMetric(strategyName) {
        return this.strategyMetrics.get(strategyName);
    }
    generatePerformanceReport() {
        const metrics = this.getMetrics();
        const strategyMetrics = this.getStrategyMetrics();
        let report = '\n📊 크롤링 성능 리포트\n';
        report += '='.repeat(50) + '\n';
        report += `총 요청 수: ${metrics.totalRequests}\n`;
        report += `성공 요청 수: ${metrics.successfulRequests}\n`;
        report += `실패 요청 수: ${metrics.failedRequests}\n`;
        report += `차단 요청 수: ${metrics.blockedRequests}\n`;
        report += `성공률: ${metrics.successRate.toFixed(2)}%\n`;
        report += `차단률: ${metrics.blockRate.toFixed(2)}%\n`;
        report += `평균 응답 시간: ${metrics.averageResponseTime.toFixed(0)}ms\n`;
        report += `마지막 업데이트: ${new Date(metrics.lastUpdated).toLocaleString()}\n\n`;
        report += '📈 전략별 성능:\n';
        report += '-'.repeat(30) + '\n';
        strategyMetrics.forEach(strategy => {
            report += `${strategy.strategyName}:\n`;
            report += `  시도: ${strategy.totalAttempts}, 성공: ${strategy.successfulAttempts}\n`;
            report += `  성공률: ${strategy.successRate.toFixed(2)}%\n`;
            report += `  평균 실행 시간: ${strategy.averageExecutionTime.toFixed(0)}ms\n\n`;
        });
        return report;
    }
    resetMetrics() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            blockedRequests: 0,
            averageResponseTime: 0,
            successRate: 0,
            blockRate: 0,
            lastUpdated: Date.now()
        };
        this.strategyMetrics.clear();
        this.gymMetrics.clear();
        this.responseTimes = [];
        console.log('🔄 크롤링 메트릭 리셋 완료');
    }
    exportMetrics() {
        return JSON.stringify({
            metrics: this.metrics,
            strategyMetrics: Array.from(this.strategyMetrics.values()),
            gymMetrics: Array.from(this.gymMetrics.values()),
            exportedAt: new Date().toISOString()
        }, null, 2);
    }
}
exports.CrawlingMetricsCollector = CrawlingMetricsCollector;
