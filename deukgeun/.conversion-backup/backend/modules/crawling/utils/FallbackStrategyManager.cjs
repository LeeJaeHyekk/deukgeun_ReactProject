"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackStrategyManager = void 0;
const AdaptiveRetryManager_1 = require('./AdaptiveRetryManager.cjs');
class FallbackStrategyManager {
    constructor() {
        this.strategies = [];
        this.executionHistory = new Map();
        this.retryManager = new AdaptiveRetryManager_1.AdaptiveRetryManager({
            maxRetries: 3,
            baseDelay: 3000,
            maxDelay: 15000
        });
    }
    registerStrategy(strategy) {
        this.strategies.push(strategy);
        this.strategies.sort((a, b) => a.priority - b.priority);
        console.log(`📋 폴백 전략 등록: ${strategy.name} (우선순위: ${strategy.priority})`);
    }
    async executeFallback(gymName, address, context = 'fallback') {
        const startTime = Date.now();
        const results = [];
        console.log(`🔄 다단계 폴백 시작: ${gymName}`);
        const availableStrategies = this.strategies.filter(s => s.isAvailable());
        if (availableStrategies.length === 0) {
            console.warn('⚠️ 사용 가능한 폴백 전략이 없습니다');
            return this.createFailureResult('no_available_strategies', startTime);
        }
        for (const strategy of availableStrategies) {
            try {
                console.log(`🎯 전략 시도: ${strategy.name}`);
                const result = await this.retryManager.executeWithRetry(() => strategy.execute(gymName, address), `${context}_${strategy.name}`);
                if (result && this.isValidResult(result)) {
                    const successResult = this.createSuccessResult(strategy.name, result, startTime, results.length + 1);
                    console.log(`✅ 폴백 성공: ${strategy.name} (${Math.round(successResult.totalTime)}ms)`);
                    this.recordExecution(gymName, successResult);
                    return successResult;
                }
                const invalidResult = this.createFailureResult(strategy.name, startTime, 'invalid_result');
                results.push(invalidResult);
            }
            catch (error) {
                console.warn(`❌ 전략 실패: ${strategy.name}`, error);
                const failureResult = this.createFailureResult(strategy.name, startTime, error instanceof Error ? error.message : 'unknown_error');
                results.push(failureResult);
            }
        }
        const finalResult = this.createFailureResult('all_strategies_failed', startTime, '모든 폴백 전략 실패');
        console.error(`💥 모든 폴백 전략 실패: ${gymName}`);
        this.recordExecution(gymName, finalResult);
        return finalResult;
    }
    isValidResult(result) {
        return !!(result &&
            result.name &&
            result.confidence &&
            result.confidence > 0.1);
    }
    createSuccessResult(strategy, data, startTime, attempts) {
        return {
            success: true,
            data,
            strategy,
            attempts,
            totalTime: Date.now() - startTime
        };
    }
    createFailureResult(strategy, startTime, error) {
        return {
            success: false,
            data: null,
            strategy,
            attempts: 1,
            totalTime: Date.now() - startTime,
            error
        };
    }
    recordExecution(gymName, result) {
        if (!this.executionHistory.has(gymName)) {
            this.executionHistory.set(gymName, []);
        }
        const history = this.executionHistory.get(gymName);
        history.push(result);
        if (history.length > 10) {
            history.shift();
        }
    }
    getExecutionHistory(gymName) {
        return this.executionHistory.get(gymName) || [];
    }
    getStrategySuccessRate() {
        const successRates = new Map();
        for (const [gymName, results] of this.executionHistory) {
            for (const result of results) {
                const current = successRates.get(result.strategy) || { success: 0, total: 0 };
                current.total++;
                if (result.success)
                    current.success++;
                successRates.set(result.strategy, current);
            }
        }
        const rates = new Map();
        for (const [strategy, stats] of successRates) {
            rates.set(strategy, (stats.success / stats.total) * 100);
        }
        return rates;
    }
    reorderStrategiesBySuccess() {
        const successRates = this.getStrategySuccessRate();
        this.strategies.sort((a, b) => {
            const rateA = successRates.get(a.name) || 0;
            const rateB = successRates.get(b.name) || 0;
            return rateB - rateA;
        });
        console.log('🔄 전략 우선순위 재정렬 완료');
    }
    getRegisteredStrategies() {
        return this.strategies.map(s => s.name);
    }
    disableStrategy(strategyName) {
        const strategy = this.strategies.find(s => s.name === strategyName);
        if (strategy) {
            strategy.isAvailable = () => false;
            console.log(`🚫 전략 비활성화: ${strategyName}`);
        }
    }
    enableStrategy(strategyName) {
        const strategy = this.strategies.find(s => s.name === strategyName);
        if (strategy) {
            strategy.isAvailable = () => true;
            console.log(`✅ 전략 활성화: ${strategyName}`);
        }
    }
    getOverallStats() {
        let totalExecutions = 0;
        let successfulExecutions = 0;
        let totalTime = 0;
        for (const results of this.executionHistory.values()) {
            for (const result of results) {
                totalExecutions++;
                totalTime += result.totalTime;
                if (result.success)
                    successfulExecutions++;
            }
        }
        return {
            totalExecutions,
            successfulExecutions,
            averageExecutionTime: totalExecutions > 0 ? totalTime / totalExecutions : 0,
            strategyCount: this.strategies.length
        };
    }
}
exports.FallbackStrategyManager = FallbackStrategyManager;
