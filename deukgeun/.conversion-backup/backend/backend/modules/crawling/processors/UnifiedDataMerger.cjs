"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedDataMerger = void 0;
class UnifiedDataMerger {
    constructor() {
        this.qualityThreshold = 0.7;
        this.duplicateThreshold = 0.8;
        this.cache = new Map();
    }
    async mergeGymDataWithCrawling(originalData, crawledData) {
        const startTime = Date.now();
        console.log('🔄 통합 데이터 병합 시작');
        console.log(`📊 원본 데이터: ${originalData.length}개, 크롤링 데이터: ${crawledData.length}개`);
        const result = {
            mergedData: [],
            statistics: {
                totalProcessed: 0,
                successfullyMerged: 0,
                fallbackUsed: 0,
                duplicatesRemoved: 0,
                qualityScore: 0,
                processingTime: 0
            },
            conflicts: []
        };
        try {
            const deduplicatedData = this.deduplicateData(originalData, crawledData);
            result.statistics.duplicatesRemoved = originalData.length + crawledData.length - deduplicatedData.original.length - deduplicatedData.crawled.length;
            const matchedPairs = await this.matchGymsParallel(deduplicatedData.original, deduplicatedData.crawled);
            console.log(`🔗 매칭된 쌍: ${matchedPairs.length}개`);
            const batchSize = 10;
            const batches = this.createBatches(matchedPairs, batchSize);
            for (const batch of batches) {
                const batchResults = await Promise.all(batch.map(pair => this.mergeSingleGymOptimized(pair.original, pair.crawled)));
                for (const mergeResult of batchResults) {
                    result.mergedData.push(mergeResult.merged);
                    result.conflicts.push(...mergeResult.conflicts);
                    if (mergeResult.merged.confidence >= this.qualityThreshold) {
                        result.statistics.successfullyMerged++;
                    }
                    else {
                        result.statistics.fallbackUsed++;
                    }
                }
            }
            await this.processUnmatchedData(deduplicatedData, result);
            result.statistics.totalProcessed = result.mergedData.length;
            result.statistics.qualityScore = this.calculateQualityScore(result.mergedData);
            result.statistics.processingTime = Date.now() - startTime;
            console.log(`✅ 통합 병합 완료: ${result.mergedData.length}개 헬스장 (${result.statistics.processingTime}ms)`);
            return result;
        }
        catch (error) {
            console.error('❌ 통합 병합 실패:', error);
            throw error;
        }
    }
    deduplicateData(originalData, crawledData) {
        const originalMap = new Map();
        const crawledMap = new Map();
        for (const data of originalData) {
            const key = this.generateCacheKey(data.name, data.address);
            if (!originalMap.has(key)) {
                originalMap.set(key, data);
            }
        }
        for (const data of crawledData) {
            const key = this.generateCacheKey(data.name, data.address);
            if (!crawledMap.has(key)) {
                crawledMap.set(key, data);
            }
        }
        return {
            original: Array.from(originalMap.values()),
            crawled: Array.from(crawledMap.values())
        };
    }
    async matchGymsParallel(originalData, crawledData) {
        const matchedPairs = [];
        const batchSize = 5;
        for (let i = 0; i < originalData.length; i += batchSize) {
            const batch = originalData.slice(i, i + batchSize);
            const batchMatches = await Promise.all(batch.map(original => this.findBestMatch(original, crawledData)));
            for (const match of batchMatches) {
                if (match) {
                    matchedPairs.push(match);
                }
            }
        }
        return matchedPairs;
    }
    async mergeSingleGymOptimized(original, crawled) {
        const conflicts = [];
        const merged = {
            ...original,
            updatedAt: new Date().toISOString(),
            rating: original.rating || crawled.rating,
            reviewCount: original.reviewCount || crawled.reviewCount,
            openHour: original.openHour || crawled.openHour,
            closeHour: original.closeHour || crawled.closeHour,
            price: original.price || crawled.price,
            membershipPrice: original.membershipPrice || crawled.membershipPrice,
            ptPrice: original.ptPrice || crawled.ptPrice,
            gxPrice: original.gxPrice || crawled.gxPrice,
            dayPassPrice: original.dayPassPrice || crawled.dayPassPrice,
            priceDetails: original.priceDetails || crawled.priceDetails,
            minimumPrice: original.minimumPrice || crawled.minimumPrice,
            discountInfo: original.discountInfo || crawled.discountInfo,
            facilities: this.mergeArrays(original.facilities, crawled.facilities),
            services: this.mergeArrays(original.services, crawled.services),
            website: original.website || crawled.website,
            instagram: original.instagram || crawled.instagram,
            facebook: original.facebook || crawled.facebook,
            hasGX: original.hasGX !== undefined ? original.hasGX : crawled.hasGX,
            hasPT: original.hasPT !== undefined ? original.hasPT : crawled.hasPT,
            hasGroupPT: original.hasGroupPT !== undefined ? original.hasGroupPT : crawled.hasGroupPT,
            is24Hours: original.is24Hours !== undefined ? original.is24Hours : crawled.is24Hours,
            hasParking: original.hasParking !== undefined ? original.hasParking : crawled.hasParking,
            hasShower: original.hasShower !== undefined ? original.hasShower : crawled.hasShower,
            source: this.mergeSources(original.source, crawled.source),
            confidence: Math.max(original.confidence || 0.5, crawled.confidence),
            serviceType: original.serviceType || this.determineServiceType(original.name || crawled.name),
            isCurrentlyOpen: original.isCurrentlyOpen !== undefined ? original.isCurrentlyOpen : true,
            crawledAt: new Date().toISOString(),
            equipment: crawled.equipment || original.equipment
        };
        this.detectConflicts(original, crawled, conflicts);
        return { merged, conflicts };
    }
    async findBestMatch(original, crawledData) {
        let bestMatch = null;
        let bestScore = 0;
        for (const crawled of crawledData) {
            const score = this.calculateMatchScore(original, crawled);
            if (score > bestScore && score > this.duplicateThreshold) {
                bestScore = score;
                bestMatch = crawled;
            }
        }
        return bestMatch ? { original, crawled: bestMatch } : null;
    }
    calculateMatchScore(original, crawled) {
        let score = 0;
        let factors = 0;
        if (original.name && crawled.name) {
            const nameSimilarity = this.calculateStringSimilarity(original.name, crawled.name);
            score += nameSimilarity * 0.4;
            factors += 0.4;
        }
        if (original.address && crawled.address) {
            const addressSimilarity = this.calculateStringSimilarity(original.address, crawled.address);
            score += addressSimilarity * 0.3;
            factors += 0.3;
        }
        if (original.phone && crawled.phone) {
            const phoneSimilarity = this.calculatePhoneSimilarity(original.phone, crawled.phone);
            score += phoneSimilarity * 0.3;
            factors += 0.3;
        }
        return factors > 0 ? score / factors : 0;
    }
    calculateStringSimilarity(str1, str2) {
        const s1 = str1.toLowerCase().replace(/\s+/g, '');
        const s2 = str2.toLowerCase().replace(/\s+/g, '');
        if (s1 === s2)
            return 1.0;
        if (s1.includes(s2) || s2.includes(s1))
            return 0.8;
        const distance = this.levenshteinDistance(s1, s2);
        const maxLength = Math.max(s1.length, s2.length);
        return maxLength > 0 ? 1 - (distance / maxLength) : 0;
    }
    calculatePhoneSimilarity(phone1, phone2) {
        const p1 = phone1.replace(/[^\d]/g, '');
        const p2 = phone2.replace(/[^\d]/g, '');
        if (p1 === p2)
            return 1.0;
        if (p1.includes(p2) || p2.includes(p1))
            return 0.9;
        return 0;
    }
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[str2.length][str1.length];
    }
    mergeArrays(original, crawled) {
        const result = new Set();
        if (original) {
            if (Array.isArray(original)) {
                original.forEach(item => item && result.add(item));
            }
            else if (typeof original === 'string') {
                result.add(original);
            }
        }
        if (crawled) {
            if (Array.isArray(crawled)) {
                crawled.forEach(item => item && result.add(item));
            }
            else if (typeof crawled === 'string') {
                result.add(crawled);
            }
        }
        return Array.from(result);
    }
    mergeSources(originalSource, crawledSource) {
        const sources = new Set();
        if (originalSource)
            sources.add(originalSource);
        if (crawledSource && crawledSource !== originalSource)
            sources.add(crawledSource);
        return Array.from(sources).join(' + ');
    }
    determineServiceType(gymName) {
        const name = gymName.toLowerCase();
        if (name.includes('크로스핏') || name.includes('crossfit'))
            return '크로스핏';
        if (name.includes('pt') || name.includes('개인트레이닝'))
            return 'pt';
        if (name.includes('gx') || name.includes('그룹'))
            return 'gx';
        if (name.includes('요가') || name.includes('yoga'))
            return '요가';
        if (name.includes('필라테스') || name.includes('pilates'))
            return '필라테스';
        return 'gym';
    }
    detectConflicts(original, crawled, conflicts) {
        const conflictFields = [
            'name', 'address', 'phone', 'rating', 'reviewCount',
            'openHour', 'closeHour', 'price', 'membershipPrice',
            'ptPrice', 'gxPrice', 'dayPassPrice', 'website',
            'instagram', 'facebook'
        ];
        for (const field of conflictFields) {
            const originalValue = original[field];
            const crawledValue = crawled[field];
            if (originalValue && crawledValue && originalValue !== crawledValue) {
                conflicts.push({
                    gymName: original.name || 'Unknown',
                    field,
                    originalValue,
                    crawledValue,
                    resolution: 'original'
                });
            }
        }
    }
    async processUnmatchedData(deduplicatedData, result) {
        const matchedOriginalIds = new Set(result.mergedData.map(data => data.id).filter(id => id !== undefined));
        const unmatchedOriginal = deduplicatedData.original.filter(original => !matchedOriginalIds.has(original.id));
        for (const original of unmatchedOriginal) {
            const fallbackData = this.convertToProcessedGymData(original);
            result.mergedData.push(fallbackData);
            result.statistics.fallbackUsed++;
        }
        const matchedCrawledNames = new Set(result.mergedData.map(data => data.name));
        const unmatchedCrawled = deduplicatedData.crawled.filter(crawled => !matchedCrawledNames.has(crawled.name));
        for (const crawled of unmatchedCrawled) {
            result.mergedData.push(crawled);
            result.statistics.successfullyMerged++;
        }
    }
    convertToProcessedGymData(original) {
        return {
            ...original,
            updatedAt: new Date().toISOString(),
            source: original.source || 'gyms_raw_fallback',
            confidence: original.confidence || 0.5,
            serviceType: original.serviceType || this.determineServiceType(original.name),
            isCurrentlyOpen: original.isCurrentlyOpen !== undefined ? original.isCurrentlyOpen : true,
            crawledAt: original.crawledAt || new Date().toISOString()
        };
    }
    calculateQualityScore(data) {
        if (data.length === 0)
            return 0;
        const totalScore = data.reduce((sum, item) => {
            let score = 0;
            let factors = 0;
            if (item.name) {
                score += 0.2;
                factors += 0.2;
            }
            if (item.address) {
                score += 0.2;
                factors += 0.2;
            }
            if (item.phone) {
                score += 0.15;
                factors += 0.15;
            }
            if (item.rating) {
                score += 0.1;
                factors += 0.1;
            }
            if (item.reviewCount) {
                score += 0.1;
                factors += 0.1;
            }
            if (item.confidence) {
                score += item.confidence * 0.1;
                factors += 0.1;
            }
            return sum + (factors > 0 ? score / factors : 0);
        }, 0);
        return totalScore / data.length;
    }
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    generateCacheKey(name, address) {
        return `${name.toLowerCase().replace(/\s+/g, '')}-${address.toLowerCase().replace(/\s+/g, '')}`;
    }
    clearCache() {
        this.cache.clear();
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
exports.UnifiedDataMerger = UnifiedDataMerger;
