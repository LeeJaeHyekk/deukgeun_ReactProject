"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
class PerformanceMonitor {
    constructor(config = {}) {
        this.startTime = 0;
        this.lastReportTime = 0;
        this.config = {
            enableDetailedStats: true,
            enableRealTimeMonitoring: true,
            reportInterval: 10000,
            ...config
        };
        this.stats = this.initializeStats();
    }
    initializeStats() {
        return {
            batchStats: {
                totalAttempts: 0,
                totalSuccesses: 0,
                successRate: 0
            },
            individualStats: {
                totalAttempts: 0,
                totalSuccesses: 0,
                successRate: 0
            },
            fallbackStats: {
                totalFallbackSuccesses: 0,
                fallbackSuccessRate: 0
            },
            timeStats: {
                totalProcessingTime: 0,
                totalWaitTime: 0,
                processingEfficiency: 0
            },
            retryStats: {
                totalAttempts: 0,
                totalSuccesses: 0,
                successRate: 0
            },
            optimizationStats: {
                totalAttempts: 0,
                totalSuccesses: 0,
                successRate: 0
            },
            systemStats: {
                consecutiveFailures: 0,
                currentBatchSize: 10,
                maxConsecutiveFailures: 3
            }
        };
    }
    start() {
        this.startTime = Date.now();
        this.lastReportTime = this.startTime;
        console.log('📊 성능 모니터링 시작');
    }
    recordBatchAttempt(success, processingTime) {
        this.stats.batchStats.totalAttempts++;
        if (success) {
            this.stats.batchStats.totalSuccesses++;
        }
        this.stats.batchStats.successRate = this.calculateSuccessRate(this.stats.batchStats.totalSuccesses, this.stats.batchStats.totalAttempts);
        this.stats.timeStats.totalProcessingTime += processingTime;
        this.updateProcessingEfficiency();
        this.checkReportInterval();
    }
    recordIndividualAttempt(success, processingTime) {
        this.stats.individualStats.totalAttempts++;
        if (success) {
            this.stats.individualStats.totalSuccesses++;
        }
        this.stats.individualStats.successRate = this.calculateSuccessRate(this.stats.individualStats.totalSuccesses, this.stats.individualStats.totalAttempts);
        this.stats.timeStats.totalProcessingTime += processingTime;
        this.updateProcessingEfficiency();
    }
    recordFallbackSuccess() {
        this.stats.fallbackStats.totalFallbackSuccesses++;
        this.stats.fallbackStats.fallbackSuccessRate = this.calculateSuccessRate(this.stats.fallbackStats.totalFallbackSuccesses, this.stats.individualStats.totalAttempts);
    }
    recordRetryAttempt(success) {
        this.stats.retryStats.totalAttempts++;
        if (success) {
            this.stats.retryStats.totalSuccesses++;
        }
        this.stats.retryStats.successRate = this.calculateSuccessRate(this.stats.retryStats.totalSuccesses, this.stats.retryStats.totalAttempts);
    }
    recordOptimizationAttempt(success) {
        this.stats.optimizationStats.totalAttempts++;
        if (success) {
            this.stats.optimizationStats.totalSuccesses++;
        }
        this.stats.optimizationStats.successRate = this.calculateSuccessRate(this.stats.optimizationStats.totalSuccesses, this.stats.optimizationStats.totalAttempts);
    }
    recordWaitTime(waitTime) {
        this.stats.timeStats.totalWaitTime += waitTime;
        this.updateProcessingEfficiency();
    }
    updateSystemStats(consecutiveFailures, currentBatchSize, maxConsecutiveFailures) {
        this.stats.systemStats.consecutiveFailures = consecutiveFailures;
        this.stats.systemStats.currentBatchSize = currentBatchSize;
        this.stats.systemStats.maxConsecutiveFailures = maxConsecutiveFailures;
    }
    calculateSuccessRate(successes, attempts) {
        return attempts > 0 ? (successes / attempts) * 100 : 0;
    }
    updateProcessingEfficiency() {
        const totalTime = this.stats.timeStats.totalProcessingTime + this.stats.timeStats.totalWaitTime;
        this.stats.timeStats.processingEfficiency = totalTime > 0
            ? (this.stats.timeStats.totalProcessingTime / totalTime) * 100
            : 0;
    }
    checkReportInterval() {
        if (!this.config.enableRealTimeMonitoring)
            return;
        const now = Date.now();
        if (now - this.lastReportTime >= this.config.reportInterval) {
            this.generateRealTimeReport();
            this.lastReportTime = now;
        }
    }
    generateRealTimeReport() {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 1000;
        console.log(`\n📊 실시간 성능 리포트 (${elapsedTime.toFixed(1)}초 경과):`);
        console.log(`   - 배치 성공률: ${this.stats.batchStats.successRate.toFixed(1)}%`);
        console.log(`   - 개별 성공률: ${this.stats.individualStats.successRate.toFixed(1)}%`);
        console.log(`   - 처리 효율성: ${this.stats.timeStats.processingEfficiency.toFixed(1)}%`);
        console.log(`   - 연속 실패: ${this.stats.systemStats.consecutiveFailures}회`);
    }
    getStats() {
        return { ...this.stats };
    }
    generatePerformanceReport() {
        let report = '\n📊 크롤링 성능 리포트:\n';
        report += '='.repeat(50) + '\n';
        report += `\n📦 배치 처리 통계:\n`;
        report += `   - 총 배치 시도: ${this.stats.batchStats.totalAttempts}회\n`;
        report += `   - 배치 성공: ${this.stats.batchStats.totalSuccesses}회\n`;
        report += `   - 배치 성공률: ${this.stats.batchStats.successRate.toFixed(1)}%\n`;
        report += `\n🔧 개별 처리 통계:\n`;
        report += `   - 총 개별 시도: ${this.stats.individualStats.totalAttempts}회\n`;
        report += `   - 개별 성공: ${this.stats.individualStats.totalSuccesses}회\n`;
        report += `   - 개별 성공률: ${this.stats.individualStats.successRate.toFixed(1)}%\n`;
        report += `\n🔄 폴백 통계:\n`;
        report += `   - 폴백 성공: ${this.stats.fallbackStats.totalFallbackSuccesses}회\n`;
        report += `   - 폴백 성공률: ${this.stats.fallbackStats.fallbackSuccessRate.toFixed(1)}%\n`;
        report += `\n⏱️ 시간 통계:\n`;
        report += `   - 총 처리 시간: ${(this.stats.timeStats.totalProcessingTime / 1000).toFixed(1)}초\n`;
        report += `   - 총 대기 시간: ${(this.stats.timeStats.totalWaitTime / 1000).toFixed(1)}초\n`;
        report += `   - 처리 효율성: ${this.stats.timeStats.processingEfficiency.toFixed(1)}%\n`;
        report += `\n🔄 재시도 통계:\n`;
        report += `   - 재시도 시도: ${this.stats.retryStats.totalAttempts}회\n`;
        report += `   - 재시도 성공: ${this.stats.retryStats.totalSuccesses}회\n`;
        report += `   - 재시도 성공률: ${this.stats.retryStats.successRate.toFixed(1)}%\n`;
        report += `\n🚀 최적화 통계:\n`;
        report += `   - 최적화 시도: ${this.stats.optimizationStats.totalAttempts}회\n`;
        report += `   - 최적화 성공: ${this.stats.optimizationStats.totalSuccesses}회\n`;
        report += `   - 최적화 성공률: ${this.stats.optimizationStats.successRate.toFixed(1)}%\n`;
        report += `\n⚙️ 시스템 상태:\n`;
        report += `   - 연속 실패: ${this.stats.systemStats.consecutiveFailures}회\n`;
        report += `   - 현재 배치 크기: ${this.stats.systemStats.currentBatchSize}개\n`;
        report += `   - 최대 연속 실패 허용: ${this.stats.systemStats.maxConsecutiveFailures}회\n`;
        return report;
    }
    reset() {
        this.stats = this.initializeStats();
        this.startTime = 0;
        this.lastReportTime = 0;
        console.log('📊 성능 통계가 리셋되었습니다.');
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
