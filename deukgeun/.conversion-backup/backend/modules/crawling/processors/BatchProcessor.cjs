"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessor = void 0;
class BatchProcessor {
    constructor(config = {}, performanceMonitor) {
        this.consecutiveFailures = 0;
        this.config = {
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
            lowSuccessRateThreshold: 80,
            ...config
        };
        this.performanceMonitor = performanceMonitor;
        this.currentBatchSize = this.config.initialBatchSize;
    }
    async processBatches(gyms, processBatch) {
        const startTime = Date.now();
        const results = [];
        let successfulBatches = 0;
        let failedBatches = 0;
        let totalBatchSize = 0;
        console.log(`📦 배치 처리 시작: ${gyms.length}개 헬스장, 초기 배치 크기 ${this.currentBatchSize}개`);
        for (let i = 0; i < gyms.length; i += this.currentBatchSize) {
            if (this.currentBatchSize <= 0) {
                this.currentBatchSize = 1;
                console.log('⚠️ 배치 크기가 0이 되어 1로 조정됨');
            }
            const batch = gyms.slice(i, i + this.currentBatchSize);
            const batchNumber = Math.floor(i / this.currentBatchSize) + 1;
            const totalBatches = Math.ceil(gyms.length / this.currentBatchSize);
            console.log(`\n🔄 배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개)`);
            if (this.consecutiveFailures > 0) {
                console.log(`⚠️ 연속 실패 ${this.consecutiveFailures}회 - 배치 크기 조정: ${this.currentBatchSize}개`);
            }
            try {
                const batchStartTime = Date.now();
                const batchResults = await processBatch(batch);
                const batchEndTime = Date.now();
                const batchProcessingTime = batchEndTime - batchStartTime;
                if (batchResults && Array.isArray(batchResults)) {
                    results.push(...batchResults);
                    successfulBatches++;
                    totalBatchSize += batch.length;
                    this.performanceMonitor.recordBatchAttempt(true, batchProcessingTime);
                    this.consecutiveFailures = 0;
                    this.adjustBatchSizeUp();
                    this.logIntermediateResults(results, batchNumber, totalBatches);
                    await this.handleLowSuccessRate(results, i, gyms.length);
                }
                else {
                    console.warn(`⚠️ 배치 ${batchNumber} 결과가 유효하지 않음:`, batchResults);
                    throw new Error('배치 결과가 유효하지 않음');
                }
            }
            catch (batchError) {
                const errorMessage = batchError instanceof Error ? batchError.message : String(batchError);
                console.error(`❌ 배치 ${batchNumber} 처리 실패:`, errorMessage);
                failedBatches++;
                this.performanceMonitor.recordBatchAttempt(false, 0);
                this.handleBatchFailure();
                console.log(`🔄 배치 ${batchNumber} 개별 처리로 폴백...`);
                const individualResults = await this.processIndividualFallback(batch, processBatch);
                results.push(...individualResults);
            }
            if (i + this.currentBatchSize < gyms.length) {
                await this.delayBetweenBatches();
            }
        }
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        this.performanceMonitor.updateSystemStats(this.consecutiveFailures, this.currentBatchSize, this.config.maxConsecutiveFailures);
        return {
            results,
            totalBatches: Math.ceil(gyms.length / this.currentBatchSize),
            successfulBatches,
            failedBatches,
            averageBatchSize: totalBatchSize / (successfulBatches + failedBatches) || 0,
            processingTime
        };
    }
    adjustBatchSizeUp() {
        const oldBatchSize = this.currentBatchSize;
        this.currentBatchSize = Math.min(this.config.maxBatchSize, this.currentBatchSize + 1);
        if (this.currentBatchSize > oldBatchSize) {
            this.performanceMonitor.recordOptimizationAttempt(true);
            console.log(`✅ 적응형 최적화 성공: 배치 크기 증가 ${oldBatchSize} → ${this.currentBatchSize}개`);
        }
    }
    handleBatchFailure() {
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= this.config.maxConsecutiveFailures) {
            this.performanceMonitor.recordRetryAttempt(true);
            const oldBatchSize = this.currentBatchSize;
            this.currentBatchSize = Math.max(this.config.minBatchSize, Math.floor(this.currentBatchSize / 2));
            console.log(`⚠️ 연속 실패 ${this.consecutiveFailures}회 - 배치 크기 감소: ${oldBatchSize} → ${this.currentBatchSize}개`);
            if (this.currentBatchSize < oldBatchSize) {
                console.log(`✅ 시스템 최적화 성공: 배치 크기 조정으로 안정성 향상`);
            }
        }
    }
    logIntermediateResults(results, batchNumber, totalBatches) {
        const currentSuccessCount = results.filter(r => r.confidence > 0.1).length;
        const currentSuccessRate = (currentSuccessCount / results.length) * 100;
        console.log(`📊 현재 성공률: ${currentSuccessRate.toFixed(1)}% (${currentSuccessCount}/${results.length})`);
    }
    async handleLowSuccessRate(results, currentIndex, totalGyms) {
        const currentSuccessCount = results.filter(r => r.confidence > 0.1).length;
        const currentSuccessRate = (currentSuccessCount / results.length) * 100;
        if (currentSuccessRate < this.config.lowSuccessRateThreshold && currentIndex + this.currentBatchSize < totalGyms) {
            this.performanceMonitor.recordOptimizationAttempt(true);
            const extraWaitTime = this.config.lowSuccessRateDelay.min +
                Math.random() * (this.config.lowSuccessRateDelay.max - this.config.lowSuccessRateDelay.min);
            this.performanceMonitor.recordWaitTime(extraWaitTime);
            console.log(`⚠️ 성공률이 낮음 - 다음 배치를 위해 추가 대기 ${Math.round(extraWaitTime)}ms`);
            await new Promise(resolve => setTimeout(resolve, extraWaitTime));
        }
    }
    async delayBetweenBatches() {
        const waitTime = this.config.batchDelay.min +
            Math.random() * (this.config.batchDelay.max - this.config.batchDelay.min);
        this.performanceMonitor.recordWaitTime(waitTime);
        console.log(`⏳ 다음 배치까지 ${Math.round(waitTime)}ms 대기...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    async processIndividualFallback(batch, processBatch) {
        const results = [];
        let individualSuccessCount = 0;
        for (const gym of batch) {
            try {
                const individualWaitTime = 1000 + Math.random() * 2000;
                this.performanceMonitor.recordWaitTime(individualWaitTime);
                await new Promise(resolve => setTimeout(resolve, individualWaitTime));
                const individualStartTime = Date.now();
                const individualResult = await processBatch([gym]);
                const individualEndTime = Date.now();
                const individualProcessingTime = individualEndTime - individualStartTime;
                if (individualResult && Array.isArray(individualResult) && individualResult.length > 0) {
                    results.push(...individualResult);
                    individualSuccessCount++;
                    this.performanceMonitor.recordIndividualAttempt(true, individualProcessingTime);
                    console.log(`✅ 개별 처리 성공: ${gym.name}`);
                }
                else {
                    throw new Error('개별 처리 결과가 유효하지 않음');
                }
            }
            catch (individualError) {
                const errorMessage = individualError instanceof Error ? individualError.message : String(individualError);
                console.error(`❌ 개별 처리 실패: ${gym.name}`, errorMessage);
                this.performanceMonitor.recordIndividualAttempt(false, 0);
                this.performanceMonitor.recordFallbackSuccess();
                const fallbackResult = this.createFallbackResult(gym);
                results.push(fallbackResult);
                console.log(`🔄 폴백 정보 추가: ${gym.name} (신뢰도: ${fallbackResult.confidence})`);
            }
        }
        const individualSuccessRate = (individualSuccessCount / batch.length) * 100;
        if (individualSuccessRate >= 50) {
            this.consecutiveFailures = Math.max(0, this.consecutiveFailures - 1);
            this.performanceMonitor.recordRetryAttempt(true);
            console.log(`🔄 개별 처리 성공률 ${individualSuccessRate.toFixed(1)}% - 연속 실패 카운터 감소`);
            console.log(`✅ 통합 최적화 성공: 개별 처리 폴백으로 시스템 복구`);
        }
        return results;
    }
    createFallbackResult(gym) {
        return {
            name: gym.name,
            address: gym.address,
            phone: gym.phone || '정보 없음',
            rating: gym.rating || 0,
            reviewCount: gym.reviewCount || 0,
            openHour: gym.openHour || '정보 없음',
            closeHour: gym.closeHour || '정보 없음',
            price: gym.price || '정보 없음',
            membershipPrice: gym.membershipPrice || '정보 없음',
            ptPrice: gym.ptPrice || '정보 없음',
            gxPrice: gym.gxPrice || '정보 없음',
            dayPassPrice: gym.dayPassPrice || '정보 없음',
            priceDetails: gym.priceDetails || '정보 없음',
            minimumPrice: gym.minimumPrice || '정보 없음',
            discountInfo: gym.discountInfo || '정보 없음',
            facilities: this.normalizeFacilities(gym.facilities),
            services: gym.services || ['정보 없음'],
            website: gym.website || '정보 없음',
            instagram: gym.instagram || '정보 없음',
            facebook: gym.facebook || '정보 없음',
            source: 'enhanced_fallback',
            confidence: 0.05,
            type: 'private'
        };
    }
    normalizeFacilities(facilities) {
        if (!facilities)
            return ['기본 헬스장'];
        if (Array.isArray(facilities))
            return facilities;
        return [String(facilities)];
    }
    getCurrentBatchSize() {
        return this.currentBatchSize;
    }
    setBatchSize(size) {
        if (size >= this.config.minBatchSize && size <= this.config.maxBatchSize) {
            this.currentBatchSize = size;
            console.log(`📦 배치 크기가 ${size}개로 설정되었습니다.`);
        }
        else {
            console.warn(`⚠️ 배치 크기는 ${this.config.minBatchSize}-${this.config.maxBatchSize} 범위 내에서 설정해야 합니다.`);
        }
    }
    setMaxConsecutiveFailures(maxFailures) {
        if (maxFailures > 0) {
            this.config.maxConsecutiveFailures = maxFailures;
            console.log(`⚠️ 최대 연속 실패 횟수가 ${maxFailures}회로 설정되었습니다.`);
        }
        else {
            console.warn('⚠️ 최대 연속 실패 횟수는 0보다 커야 합니다.');
        }
    }
    getConsecutiveFailures() {
        return this.consecutiveFailures;
    }
    getConfig() {
        return { ...this.config };
    }
}
exports.BatchProcessor = BatchProcessor;
