"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveRetryManager = void 0;
const CircuitBreaker_1 = require('./CircuitBreaker.cjs');
class AdaptiveRetryManager {
    constructor(config = {}) {
        this.metrics = {
            totalAttempts: 0,
            successfulAttempts: 0,
            failedAttempts: 0,
            averageDelay: 0,
            lastFailureTime: 0,
            consecutiveFailures: 0
        };
        this.config = {
            maxRetries: 5,
            baseDelay: 2000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            jitter: true,
            ...config
        };
        this.circuitBreaker = new CircuitBreaker_1.CircuitBreaker(config.maxRetries || 5, config.maxDelay || 30000);
    }
    async executeWithRetry(operation, context = 'operation') {
        let lastError = null;
        let totalDelay = 0;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`🔄 ${context} 재시도 ${attempt}/${this.config.maxRetries}`);
                const result = await this.circuitBreaker.execute(operation);
                this.updateSuccessMetrics(totalDelay);
                console.log(`✅ ${context} 성공 (시도 ${attempt})`);
                return result;
            }
            catch (error) {
                lastError = error;
                this.updateFailureMetrics();
                console.warn(`❌ ${context} 실패 (시도 ${attempt}):`, error);
                if (attempt < this.config.maxRetries) {
                    const delay = this.calculateAdaptiveDelay(attempt);
                    totalDelay += delay;
                    console.log(`⏳ ${Math.round(delay)}ms 대기 후 재시도...`);
                    await this.sleep(delay);
                }
            }
        }
        console.error(`💥 ${context} 모든 재시도 실패 (${this.config.maxRetries}회)`);
        throw lastError || new Error(`${context} failed after ${this.config.maxRetries} attempts`);
    }
    calculateAdaptiveDelay(attempt) {
        let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
        if (this.metrics.consecutiveFailures > 3) {
            delay *= Math.min(this.metrics.consecutiveFailures / 3, 3);
        }
        delay = Math.min(delay, this.config.maxDelay);
        if (this.config.jitter) {
            const jitterRange = delay * 0.1;
            delay += (Math.random() - 0.5) * 2 * jitterRange;
        }
        return Math.max(delay, 100);
    }
    updateSuccessMetrics(totalDelay) {
        this.metrics.totalAttempts++;
        this.metrics.successfulAttempts++;
        this.metrics.consecutiveFailures = 0;
        this.metrics.averageDelay = (this.metrics.averageDelay + totalDelay) / 2;
    }
    updateFailureMetrics() {
        this.metrics.totalAttempts++;
        this.metrics.failedAttempts++;
        this.metrics.consecutiveFailures++;
        this.metrics.lastFailureTime = Date.now();
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getSuccessRate() {
        if (this.metrics.totalAttempts === 0)
            return 0;
        return (this.metrics.successfulAttempts / this.metrics.totalAttempts) * 100;
    }
    getCircuitBreakerState() {
        return this.circuitBreaker.getState();
    }
    resetMetrics() {
        this.metrics = {
            totalAttempts: 0,
            successfulAttempts: 0,
            failedAttempts: 0,
            averageDelay: 0,
            lastFailureTime: 0,
            consecutiveFailures: 0
        };
        this.circuitBreaker.reset();
        console.log('🔄 적응형 재시도 관리자 메트릭 리셋');
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ 재시도 설정 업데이트:', this.config);
    }
}
exports.AdaptiveRetryManager = AdaptiveRetryManager;
