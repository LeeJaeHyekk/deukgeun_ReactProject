"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedDataMerger = void 0;
class EnhancedDataMerger {
    constructor() {
        this.qualityThreshold = 0.7;
        this.duplicateThreshold = 0.8;
    }
    convertEnhancedGymInfoToProcessedGymData(enhancedInfo, originalGym) {
        return {
            ...originalGym,
            rating: originalGym?.rating || enhancedInfo.rating,
            reviewCount: originalGym?.reviewCount || enhancedInfo.reviewCount,
            openHour: originalGym?.openHour || enhancedInfo.openHour,
            closeHour: originalGym?.closeHour || enhancedInfo.closeHour,
            price: originalGym?.price || enhancedInfo.price,
            membershipPrice: originalGym?.membershipPrice || enhancedInfo.membershipPrice,
            ptPrice: originalGym?.ptPrice || enhancedInfo.ptPrice,
            gxPrice: originalGym?.gxPrice || enhancedInfo.gxPrice,
            dayPassPrice: originalGym?.dayPassPrice || enhancedInfo.dayPassPrice,
            priceDetails: originalGym?.priceDetails || enhancedInfo.priceDetails,
            minimumPrice: originalGym?.minimumPrice || enhancedInfo.minimumPrice,
            discountInfo: originalGym?.discountInfo || enhancedInfo.discountInfo,
            facilities: this.mergeFacilities(originalGym?.facilities, enhancedInfo.facilities),
            services: this.mergeServices(originalGym?.services, enhancedInfo.services),
            website: originalGym?.website || enhancedInfo.website,
            instagram: originalGym?.instagram || enhancedInfo.instagram,
            facebook: originalGym?.facebook || enhancedInfo.facebook,
            source: this.mergeSources(originalGym?.source, enhancedInfo.source),
            confidence: Math.max(originalGym?.confidence || 0.5, enhancedInfo.confidence),
            serviceType: originalGym?.serviceType || this.determineServiceType(enhancedInfo.name),
            isCurrentlyOpen: originalGym?.isCurrentlyOpen !== undefined ? originalGym.isCurrentlyOpen : true,
            updatedAt: new Date().toISOString(),
            crawledAt: new Date().toISOString()
        };
    }
    async mergeGymDataWithCrawling(originalData, crawledData) {
        console.log('🔄 데이터 병합 시작');
        console.log(`📊 원본 데이터: ${originalData.length}개, 크롤링 데이터: ${crawledData.length}개`);
        const result = {
            mergedData: [],
            statistics: {
                totalProcessed: 0,
                successfullyMerged: 0,
                fallbackUsed: 0,
                duplicatesRemoved: 0,
                qualityScore: 0
            },
            conflicts: []
        };
        const matchedPairs = this.matchGyms(originalData, crawledData);
        console.log(`🔗 매칭된 쌍: ${matchedPairs.length}개`);
        for (const pair of matchedPairs) {
            const mergeResult = this.mergeSingleGym(pair.original, pair.crawled);
            result.mergedData.push(mergeResult.merged);
            result.conflicts.push(...mergeResult.conflicts);
            if (mergeResult.merged.confidence >= this.qualityThreshold) {
                result.statistics.successfullyMerged++;
            }
            else {
                result.statistics.fallbackUsed++;
            }
        }
        const unmatchedOriginal = originalData.filter(original => !matchedPairs.some(pair => pair.original.id === original.id));
        for (const original of unmatchedOriginal) {
            const fallbackData = this.convertToProcessedGymData(original);
            result.mergedData.push(fallbackData);
            result.statistics.fallbackUsed++;
        }
        const unmatchedCrawled = crawledData.filter(crawled => !matchedPairs.some(pair => this.isSameGym(pair.original, crawled)));
        for (const crawled of unmatchedCrawled) {
            result.mergedData.push(crawled);
            result.statistics.successfullyMerged++;
        }
        result.mergedData = this.removeDuplicates(result.mergedData);
        result.statistics.duplicatesRemoved =
            matchedPairs.length + unmatchedOriginal.length + unmatchedCrawled.length - result.mergedData.length;
        result.statistics.totalProcessed = result.mergedData.length;
        result.statistics.qualityScore = this.calculateQualityScore(result.mergedData);
        console.log(`✅ 데이터 병합 완료: ${result.mergedData.length}개 헬스장`);
        console.log(`📈 성공적 병합: ${result.statistics.successfullyMerged}개`);
        console.log(`📉 폴백 사용: ${result.statistics.fallbackUsed}개`);
        console.log(`🔄 중복 제거: ${result.statistics.duplicatesRemoved}개`);
        console.log(`⭐ 품질 점수: ${result.statistics.qualityScore.toFixed(2)}`);
        return result;
    }
    matchGyms(originalData, crawledData) {
        const matches = [];
        for (const original of originalData) {
            let bestMatch = null;
            let bestSimilarity = 0;
            for (const crawled of crawledData) {
                const similarity = this.calculateSimilarity(original, crawled);
                if (similarity > bestSimilarity && similarity >= this.duplicateThreshold) {
                    bestMatch = crawled;
                    bestSimilarity = similarity;
                }
            }
            if (bestMatch) {
                matches.push({
                    original,
                    crawled: bestMatch,
                    similarity: bestSimilarity
                });
            }
        }
        return matches;
    }
    calculateSimilarity(original, crawled) {
        let similarity = 0;
        let factors = 0;
        if (original.name && crawled.name) {
            const nameSimilarity = this.calculateStringSimilarity(original.name.toLowerCase(), crawled.name.toLowerCase());
            similarity += nameSimilarity * 0.5;
            factors += 0.5;
        }
        if (original.address && crawled.address) {
            const addressSimilarity = this.calculateStringSimilarity(original.address.toLowerCase(), crawled.address.toLowerCase());
            similarity += addressSimilarity * 0.3;
            factors += 0.3;
        }
        if (original.phone && crawled.phone) {
            const phoneMatch = original.phone === crawled.phone ? 1 : 0;
            similarity += phoneMatch * 0.2;
            factors += 0.2;
        }
        return factors > 0 ? similarity / factors : 0;
    }
    calculateStringSimilarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0)
            return 1;
        const distance = this.levenshteinDistance(str1, str2);
        return 1 - (distance / maxLength);
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
    mergeSingleGym(original, crawled) {
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
            facilities: this.mergeFacilities(original.facilities, crawled.facilities),
            services: this.mergeServices(original.services, crawled.services),
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
    resolveFieldConflict(fieldName, originalValue, crawledValue, conflicts, defaultValue) {
        if (!originalValue && !crawledValue) {
            return defaultValue;
        }
        if (!originalValue) {
            return crawledValue;
        }
        if (!crawledValue) {
            return originalValue;
        }
        if (originalValue !== crawledValue) {
            conflicts.push({
                gymName: defaultValue || 'Unknown',
                field: fieldName,
                originalValue,
                crawledValue,
                resolution: this.getResolutionStrategy(fieldName, originalValue, crawledValue)
            });
            return this.getResolutionStrategy(fieldName, originalValue, crawledValue) === 'crawled'
                ? crawledValue
                : originalValue;
        }
        return originalValue;
    }
    getResolutionStrategy(fieldName, originalValue, crawledValue) {
        switch (fieldName) {
            case 'name':
                return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original';
            case 'address':
                return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original';
            case 'phone':
                return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original';
            case 'rating':
            case 'reviewCount':
            case 'openHour':
            case 'closeHour':
            case 'price':
            case 'membershipPrice':
            case 'ptPrice':
            case 'gxPrice':
            case 'dayPassPrice':
            case 'priceDetails':
            case 'minimumPrice':
            case 'discountInfo':
            case 'website':
            case 'instagram':
            case 'facebook':
                return crawledValue ? 'crawled' : 'original';
            default:
                return 'original';
        }
    }
    mergeFacilities(originalFacilities, crawledFacilities) {
        const facilities = [];
        if (originalFacilities) {
            if (Array.isArray(originalFacilities)) {
                facilities.push(...originalFacilities);
            }
            else if (typeof originalFacilities === 'string') {
                facilities.push(originalFacilities);
            }
        }
        if (crawledFacilities) {
            if (Array.isArray(crawledFacilities)) {
                facilities.push(...crawledFacilities);
            }
            else if (typeof crawledFacilities === 'string') {
                facilities.push(crawledFacilities);
            }
        }
        return [...new Set(facilities.filter(f => f && f.trim()))];
    }
    mergeServices(originalServices, crawledServices) {
        const services = [];
        if (originalServices && Array.isArray(originalServices)) {
            services.push(...originalServices);
        }
        if (crawledServices && Array.isArray(crawledServices)) {
            services.push(...crawledServices);
        }
        return [...new Set(services.filter(s => s && s.trim()))];
    }
    mergeSources(originalSource, crawledSource) {
        const sources = [];
        if (originalSource) {
            sources.push(originalSource);
        }
        if (crawledSource && crawledSource !== originalSource) {
            sources.push(crawledSource);
        }
        return sources.join(' + ');
    }
    removeDuplicates(data) {
        const unique = [];
        const seen = new Set();
        for (const item of data) {
            const key = `${item.name}-${item.address}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(item);
            }
        }
        return unique;
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
            if (item.latitude && item.longitude) {
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
    isSameGym(original, crawled) {
        return this.calculateSimilarity(original, crawled) >= this.duplicateThreshold;
    }
    determineServiceType(gymName) {
        const name = gymName.toLowerCase();
        if (name.includes('크로스핏') || name.includes('crossfit')) {
            return '크로스핏';
        }
        else if (name.includes('pt') || name.includes('개인트레이닝')) {
            return 'pt';
        }
        else if (name.includes('gx') || name.includes('그룹')) {
            return 'gx';
        }
        else if (name.includes('요가') || name.includes('yoga')) {
            return '요가';
        }
        else if (name.includes('필라테스') || name.includes('pilates')) {
            return '필라테스';
        }
        else {
            return 'gym';
        }
    }
}
exports.EnhancedDataMerger = EnhancedDataMerger;
