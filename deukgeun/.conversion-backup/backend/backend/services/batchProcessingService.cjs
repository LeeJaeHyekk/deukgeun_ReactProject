const { logger  } = require('../utils/logger');
const { ErrorHandlingService  } = require('./errorHandlingService');
class BatchProcessingService
module.exports.BatchProcessingService = BatchProcessingService {
    /**
     * 배치 처리를 통한 헬스장 데이터 업데이트
     */
    static async processGymsInBatches(gymRepo, updateFunction, config = {}) {
        const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
        const allGyms = await gymRepo.find();
        logger.info(`🚀 배치 처리 시작: ${allGyms.length}개 헬스장, 배치 크기: ${finalConfig.batchSize}`);
        const progress = {
            total: allGyms.length,
            processed: 0,
            success: 0,
            failed: 0,
            currentBatch: 0,
            totalBatches: Math.ceil(allGyms.length / finalConfig.batchSize),
            estimatedTimeRemaining: 0,
            startTime: new Date(),
            lastUpdateTime: new Date()
        };
        const results = [];
        const errors = [];
        // 배치로 나누기
        const batches = this.createBatches(allGyms, finalConfig.batchSize);
        for (let i = 0; i < batches.length; i++) {
            progress.currentBatch = i + 1;
            const batch = batches[i];
            logger.info(`📦 배치 ${i + 1}/${batches.length} 처리 중: ${batch.length}개 헬스장`);
            try {
                // 배치 내에서 동시 처리
                const batchResults = await this.processBatchConcurrently(batch, updateFunction, finalConfig, progress);
                results.push(...batchResults.successful);
                errors.push(...batchResults.errors);
                progress.success += batchResults.successful.length;
                progress.failed += batchResults.errors.length;
                progress.processed += batch.length;
                // 진행률 업데이트
                this.updateProgress(progress);
                // 배치 간 지연
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, finalConfig.delayBetweenBatches));
                }
            }
            catch (error) {
                logger.error(`❌ 배치 ${i + 1} 처리 실패:`, error);
                errors.push(error);
                progress.failed += batch.length;
                progress.processed += batch.length;
            }
        }
        const duration = Date.now() - progress.startTime.getTime();
        logger.info(`✅ 배치 처리 완료: ${progress.success}개 성공, ${progress.failed}개 실패, ${duration}ms 소요`);
        return {
            success: progress.failed === 0,
            data: results,
            errors,
            progress,
            duration
        };
    }
    /**
     * 배치를 동시에 처리
     */
    static async processBatchConcurrently(batch, processFunction, config, progress) {
        const successful = [];
        const errors = [];
        // 동시 처리 제한
        const semaphore = new Semaphore(config.concurrency);
        const promises = batch.map(async (item) => {
            await semaphore.acquire();
            try {
                const result = await this.processWithRetry(item, processFunction, config);
                successful.push(result);
                return result;
            }
            catch (error) {
                errors.push(error);
                throw error;
            }
            finally {
                semaphore.release();
            }
        });
        await Promise.allSettled(promises);
        return { successful, errors };
    }
    /**
     * 재시도 로직을 포함한 개별 처리
     */
    static async processWithRetry(item, processFunction, config) {
        const context = {
            gymName: item.name || "unknown",
            source: "batch_processing",
            error: new Error("Initial error"),
            timestamp: new Date(),
            retryCount: 0
        };
        return ErrorHandlingService.retryWithBackoff(async () => {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Timeout")), config.timeout);
            });
            const processPromise = processFunction(item);
            return Promise.race([processPromise, timeoutPromise]);
        }, context, config.maxRetries);
    }
    /**
     * 배열을 배치로 나누기
     */
    static createBatches(array, batchSize) {
        const batches = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }
    /**
     * 진행률 업데이트
     */
    static updateProgress(progress) {
        const now = new Date();
        const elapsed = now.getTime() - progress.startTime.getTime();
        if (progress.processed > 0) {
            const avgTimePerItem = elapsed / progress.processed;
            const remainingItems = progress.total - progress.processed;
            progress.estimatedTimeRemaining = avgTimePerItem * remainingItems;
        }
        progress.lastUpdateTime = now;
        // 진행률 로깅
        const percentage = ((progress.processed / progress.total) * 100).toFixed(1);
        logger.info(`📊 진행률: ${percentage}% (${progress.processed}/${progress.total}) - 성공: ${progress.success}, 실패: ${progress.failed}`);
    }
    /**
     * 메모리 사용량 최적화된 배치 처리
     */
    static async processWithMemoryOptimization(items, processFunction, config = {}) {
        const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
        // 메모리 사용량 모니터링
        const startMemory = process.memoryUsage();
        logger.info(`💾 초기 메모리 사용량: ${this.formatBytes(startMemory.heapUsed)}`);
        const results = [];
        const errors = [];
        let processed = 0;
        // 스트림 방식으로 처리
        for (let i = 0; i < items.length; i += finalConfig.batchSize) {
            const batch = items.slice(i, i + finalConfig.batchSize);
            try {
                const batchResults = await this.processBatchConcurrently(batch, processFunction, finalConfig, {
                    total: items.length,
                    processed,
                    success: results.length,
                    failed: errors.length,
                    currentBatch: Math.floor(i / finalConfig.batchSize) + 1,
                    totalBatches: Math.ceil(items.length / finalConfig.batchSize),
                    estimatedTimeRemaining: 0,
                    startTime: new Date(),
                    lastUpdateTime: new Date()
                });
                results.push(...batchResults.successful);
                errors.push(...batchResults.errors);
                processed += batch.length;
                // 메모리 정리
                if (global.gc) {
                    global.gc();
                }
                // 메모리 사용량 로깅
                const currentMemory = process.memoryUsage();
                logger.info(`💾 메모리 사용량: ${this.formatBytes(currentMemory.heapUsed)}`);
            }
            catch (error) {
                logger.error(`❌ 배치 처리 실패:`, error);
                errors.push(error);
                processed += batch.length;
            }
        }
        const endMemory = process.memoryUsage();
        logger.info(`💾 최종 메모리 사용량: ${this.formatBytes(endMemory.heapUsed)}`);
        return {
            success: errors.length === 0,
            data: results,
            errors,
            progress: {
                total: items.length,
                processed,
                success: results.length,
                failed: errors.length,
                currentBatch: Math.ceil(items.length / finalConfig.batchSize),
                totalBatches: Math.ceil(items.length / finalConfig.batchSize),
                estimatedTimeRemaining: 0,
                startTime: new Date(),
                lastUpdateTime: new Date()
            },
            duration: 0
        };
    }
    /**
     * 배치 크기 자동 조정
     */
    static calculateOptimalBatchSize(totalItems, availableMemory) {
        // 메모리 기반 배치 크기 계산
        const estimatedMemoryPerItem = 1024 * 1024; // 1MB per item (추정)
        const maxItemsByMemory = Math.floor(availableMemory / estimatedMemoryPerItem);
        // 기본 배치 크기와 메모리 제한 중 작은 값 선택
        const optimalSize = Math.min(this.DEFAULT_CONFIG.batchSize, maxItemsByMemory);
        // 최소값 보장
        return Math.max(optimalSize, 1);
    }
    /**
     * 동시성 제어를 위한 세마포어
     */
    static formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0)
            return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}
BatchProcessingService.DEFAULT_CONFIG = {
    batchSize: 10,
    concurrency: 3,
    delayBetweenBatches: 1000,
    maxRetries: 3,
    timeout: 30000
};
/**
 * 동시성 제어를 위한 세마포어 클래스
 */
class Semaphore {
    constructor(permits) {
        this.waiting = [];
        this.permits = permits;
    }
    async acquire() {
        if (this.permits > 0) {
            this.permits--;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.waiting.push(resolve);
        });
    }
    release() {
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            resolve();
        }
        else {
            this.permits++;
        }
    }
}
