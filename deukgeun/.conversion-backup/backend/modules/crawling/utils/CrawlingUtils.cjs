"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCrawlingData = validateCrawlingData;
exports.cleanCrawlingData = cleanCrawlingData;
exports.mergeCrawlingResults = mergeCrawlingResults;
exports.removeDuplicates = removeDuplicates;
exports.calculateDataQuality = calculateDataQuality;
exports.sortByConfidence = sortByConfidence;
exports.filterByMinConfidence = filterByMinConfidence;
exports.calculateDataStatistics = calculateDataStatistics;
exports.cleanErrorMessage = cleanErrorMessage;
exports.delay = delay;
exports.retry = retry;
function validateCrawlingData(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        return false;
    }
    if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
        return false;
    }
    if (!data.source || typeof data.source !== 'string') {
        return false;
    }
    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
        return false;
    }
    return true;
}
function cleanCrawlingData(data) {
    return {
        ...data,
        name: data.name.trim(),
        address: data.address.trim(),
        phone: data.phone?.trim() || undefined,
        facilities: typeof data.facilities === 'string' ? data.facilities.trim() : data.facilities,
        openHour: data.openHour?.trim() || undefined,
        closeHour: data.closeHour?.trim() || undefined,
        price: data.price?.trim() || undefined,
        type: data.type?.trim() || undefined,
        latitude: data.latitude && typeof data.latitude === 'number' &&
            data.latitude >= -90 && data.latitude <= 90 ? data.latitude : undefined,
        longitude: data.longitude && typeof data.longitude === 'number' &&
            data.longitude >= -180 && data.longitude <= 180 ? data.longitude : undefined,
        rating: data.rating && typeof data.rating === 'number' &&
            data.rating >= 0 && data.rating <= 5 ? data.rating : undefined,
        reviewCount: data.reviewCount && typeof data.reviewCount === 'number' &&
            data.reviewCount >= 0 ? data.reviewCount : undefined,
        confidence: Math.max(0, Math.min(1, data.confidence || 0))
    };
}
function mergeCrawlingResults(results) {
    const mergedMap = new Map();
    for (const result of results) {
        if (!validateCrawlingData(result)) {
            console.warn('⚠️ 유효하지 않은 크롤링 데이터 건너뜀:', result);
            continue;
        }
        const cleanedData = cleanCrawlingData(result);
        const key = `${cleanedData.name}-${cleanedData.address}`;
        if (mergedMap.has(key)) {
            const existing = mergedMap.get(key);
            if (cleanedData.confidence > existing.confidence) {
                mergedMap.set(key, { ...existing, ...cleanedData });
            }
            else {
                const updated = { ...cleanedData };
                Object.keys(existing).forEach(key => {
                    const existingValue = existing[key];
                    const updatedValue = updated[key];
                    if (existingValue && !updatedValue) {
                        updated[key] = existingValue;
                    }
                });
                mergedMap.set(key, updated);
            }
        }
        else {
            mergedMap.set(key, cleanedData);
        }
    }
    return Array.from(mergedMap.values());
}
function removeDuplicates(data) {
    const seen = new Set();
    return data.filter(item => {
        const key = `${item.name}-${item.address}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
function calculateDataQuality(data) {
    let score = 0;
    let maxScore = 0;
    maxScore += 3;
    if (data.name && data.name.trim().length > 0)
        score += 1;
    if (data.address && data.address.trim().length > 0)
        score += 1;
    if (data.source && data.source.trim().length > 0)
        score += 1;
    maxScore += 7;
    if (data.phone)
        score += 1;
    if (data.latitude && data.longitude)
        score += 2;
    if (data.facilities)
        score += 1;
    if (data.openHour && data.closeHour)
        score += 1;
    if (data.price)
        score += 1;
    if (data.rating !== undefined)
        score += 1;
    return maxScore > 0 ? score / maxScore : 0;
}
function sortByConfidence(data) {
    return [...data].sort((a, b) => b.confidence - a.confidence);
}
function filterByMinConfidence(data, minConfidence = 0.5) {
    return data.filter(item => item.confidence >= minConfidence);
}
function calculateDataStatistics(data) {
    if (data.length === 0) {
        return {
            total: 0,
            averageConfidence: 0,
            minConfidence: 0,
            maxConfidence: 0,
            sourceDistribution: {},
            qualityDistribution: { high: 0, medium: 0, low: 0 }
        };
    }
    const confidences = data.map(item => item.confidence);
    const averageConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    const minConfidence = Math.min(...confidences);
    const maxConfidence = Math.max(...confidences);
    const sourceDistribution = {};
    data.forEach(item => {
        sourceDistribution[item.source] = (sourceDistribution[item.source] || 0) + 1;
    });
    const qualityDistribution = {
        high: data.filter(item => item.confidence >= 0.8).length,
        medium: data.filter(item => item.confidence >= 0.5 && item.confidence < 0.8).length,
        low: data.filter(item => item.confidence < 0.5).length
    };
    return {
        total: data.length,
        averageConfidence,
        minConfidence,
        maxConfidence,
        sourceDistribution,
        qualityDistribution
    };
}
function cleanErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return '알 수 없는 오류가 발생했습니다';
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function retry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries) {
                throw lastError;
            }
            console.warn(`⚠️ 시도 ${attempt}/${maxRetries} 실패, ${delayMs}ms 후 재시도:`, lastError.message);
            await delay(delayMs);
            delayMs *= 1.5;
        }
    }
    throw lastError;
}
