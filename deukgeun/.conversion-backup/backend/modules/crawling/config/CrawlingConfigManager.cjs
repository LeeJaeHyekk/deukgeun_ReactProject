"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlingConfigManager = void 0;
class CrawlingConfigManager {
    constructor(initialConfig) {
        this.config = this.getDefaultConfig();
        if (initialConfig) {
            this.updateConfig(initialConfig);
        }
    }
    getDefaultConfig() {
        return {
            timeout: 30000,
            delay: 1000,
            maxRetries: 3,
            batchProcessing: {
                initialBatchSize: 10,
                minBatchSize: 1,
                maxBatchSize: 20,
                maxConsecutiveFailures: 3,
                batchDelay: {
                    min: 2000,
                    max: 5000
                },
                lowSuccessRateDelay: {
                    min: 5000,
                    max: 10000
                },
                lowSuccessRateThreshold: 80
            },
            performanceMonitoring: {
                enableDetailedStats: true,
                enableRealTimeMonitoring: true,
                reportInterval: 10000
            },
            searchEngines: {
                enabled: ['naver_cafe', 'naver', 'google', 'daum', 'naver_blog'],
                timeout: 30000,
                delay: 1000,
                maxRetries: 3,
                enableParallel: false,
                maxConcurrent: 1
            },
            fallback: {
                enableEnhancedFallback: true,
                minConfidence: 0.1,
                fallbackConfidence: 0.05
            },
            antiDetection: {
                enableRandomDelay: true,
                minDelay: 1000,
                maxDelay: 3000,
                enableUserAgentRotation: true,
                enableRequestHeaders: true
            },
            successRate: {
                targetRate: 95,
                warningThreshold: 80,
                criticalThreshold: 60
            }
        };
    }
    updateConfig(newConfig) {
        this.config = this.deepMerge(this.config, newConfig);
        console.log('⚙️ 크롤링 설정이 업데이트되었습니다.');
    }
    getConfig() {
        return { ...this.config };
    }
    getConfigValue(path) {
        return this.getNestedValue(this.config, path);
    }
    setConfigValue(path, value) {
        this.setNestedValue(this.config, path, value);
        console.log(`⚙️ 설정 업데이트: ${path} = ${JSON.stringify(value)}`);
    }
    getBatchProcessingConfig() {
        return { ...this.config.batchProcessing };
    }
    getPerformanceMonitoringConfig() {
        return { ...this.config.performanceMonitoring };
    }
    getSearchEnginesConfig() {
        return { ...this.config.searchEngines };
    }
    getFallbackConfig() {
        return { ...this.config.fallback };
    }
    getAntiDetectionConfig() {
        return { ...this.config.antiDetection };
    }
    getSuccessRateConfig() {
        return { ...this.config.successRate };
    }
    validateConfig(config) {
        const errors = [];
        if (config.timeout !== undefined && config.timeout <= 0) {
            errors.push('timeout은 0보다 커야 합니다.');
        }
        if (config.delay !== undefined && config.delay < 0) {
            errors.push('delay는 0 이상이어야 합니다.');
        }
        if (config.maxRetries !== undefined && config.maxRetries < 0) {
            errors.push('maxRetries는 0 이상이어야 합니다.');
        }
        if (config.batchProcessing) {
            const bp = config.batchProcessing;
            if (bp.initialBatchSize !== undefined && (bp.initialBatchSize < 1 || bp.initialBatchSize > 50)) {
                errors.push('initialBatchSize는 1-50 범위여야 합니다.');
            }
            if (bp.minBatchSize !== undefined && bp.minBatchSize < 1) {
                errors.push('minBatchSize는 1 이상이어야 합니다.');
            }
            if (bp.maxBatchSize !== undefined && bp.maxBatchSize > 100) {
                errors.push('maxBatchSize는 100 이하여야 합니다.');
            }
            if (bp.minBatchSize !== undefined && bp.maxBatchSize !== undefined && bp.minBatchSize > bp.maxBatchSize) {
                errors.push('minBatchSize는 maxBatchSize보다 작거나 같아야 합니다.');
            }
        }
        if (config.successRate) {
            const sr = config.successRate;
            if (sr.targetRate !== undefined && (sr.targetRate < 0 || sr.targetRate > 100)) {
                errors.push('targetRate는 0-100 범위여야 합니다.');
            }
            if (sr.warningThreshold !== undefined && (sr.warningThreshold < 0 || sr.warningThreshold > 100)) {
                errors.push('warningThreshold는 0-100 범위여야 합니다.');
            }
            if (sr.criticalThreshold !== undefined && (sr.criticalThreshold < 0 || sr.criticalThreshold > 100)) {
                errors.push('criticalThreshold는 0-100 범위여야 합니다.');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    resetToDefault() {
        this.config = this.getDefaultConfig();
        console.log('⚙️ 설정이 기본값으로 리셋되었습니다.');
    }
    getConfigSummary() {
        return `
📋 크롤링 설정 요약:
   - 타임아웃: ${this.config.timeout}ms
   - 지연 시간: ${this.config.delay}ms
   - 최대 재시도: ${this.config.maxRetries}회
   - 배치 크기: ${this.config.batchProcessing.initialBatchSize}개 (${this.config.batchProcessing.minBatchSize}-${this.config.batchProcessing.maxBatchSize})
   - 최대 연속 실패: ${this.config.batchProcessing.maxConsecutiveFailures}회
   - 성공률 목표: ${this.config.successRate.targetRate}%
   - 활성화된 검색 엔진: ${this.config.searchEngines.enabled.join(', ')}
   - 실시간 모니터링: ${this.config.performanceMonitoring.enableRealTimeMonitoring ? '활성화' : '비활성화'}
   - 향상된 폴백: ${this.config.fallback.enableEnhancedFallback ? '활성화' : '비활성화'}
    `;
    }
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        if (!lastKey)
            return;
        const target = keys.reduce((current, key) => {
            if (!current[key])
                current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
}
exports.CrawlingConfigManager = CrawlingConfigManager;
