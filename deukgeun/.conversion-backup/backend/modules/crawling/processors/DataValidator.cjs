"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidator = void 0;
class DataValidator {
    validateGymData(data) {
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
    validateEquipmentData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
            return false;
        }
        if (!data.type || !['cardio', 'weight'].includes(data.type)) {
            return false;
        }
        if (!data.category || typeof data.category !== 'string') {
            return false;
        }
        if (typeof data.quantity !== 'number' || data.quantity < 0) {
            return false;
        }
        if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
            return false;
        }
        return true;
    }
    cleanGymData(data) {
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
            latitude: this.validateCoordinate(data.latitude, -90, 90),
            longitude: this.validateCoordinate(data.longitude, -180, 180),
            rating: this.validateRating(data.rating),
            reviewCount: this.validateReviewCount(data.reviewCount),
            confidence: Math.max(0, Math.min(1, data.confidence || 0))
        };
    }
    cleanEquipmentData(data) {
        return {
            ...data,
            name: data.name.trim(),
            category: data.category.trim(),
            brand: data.brand?.trim() || undefined,
            model: data.model?.trim() || undefined,
            weightRange: data.weightRange?.trim() || undefined,
            equipmentVariant: data.equipmentVariant?.trim() || undefined,
            additionalInfo: data.additionalInfo?.trim() || undefined,
            quantity: Math.max(0, data.quantity || 0),
            confidence: Math.max(0, Math.min(1, data.confidence || 0))
        };
    }
    validateCoordinate(value, min, max) {
        if (value && typeof value === 'number' && value >= min && value <= max) {
            return value;
        }
        return undefined;
    }
    validateRating(rating) {
        if (rating && typeof rating === 'number' && rating >= 0 && rating <= 5) {
            return rating;
        }
        return undefined;
    }
    validateReviewCount(reviewCount) {
        if (reviewCount && typeof reviewCount === 'number' && reviewCount >= 0) {
            return reviewCount;
        }
        return undefined;
    }
    calculateDataQuality(data) {
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
    isDuplicate(data1, data2) {
        const name1 = data1.name.toLowerCase().trim();
        const name2 = data2.name.toLowerCase().trim();
        const address1 = data1.address.toLowerCase().trim();
        const address2 = data2.address.toLowerCase().trim();
        return name1 === name2 && address1 === address2;
    }
    checkDataConsistency(data) {
        const issues = [];
        if (!data.name || data.name.trim().length === 0) {
            issues.push('헬스장 이름이 없습니다');
        }
        if (!data.address || data.address.trim().length === 0) {
            issues.push('헬스장 주소가 없습니다');
        }
        if (data.latitude && data.longitude) {
            if (data.latitude < -90 || data.latitude > 90) {
                issues.push('위도가 유효하지 않습니다');
            }
            if (data.longitude < -180 || data.longitude > 180) {
                issues.push('경도가 유효하지 않습니다');
            }
        }
        if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
            issues.push('평점이 유효하지 않습니다');
        }
        if (data.confidence < 0 || data.confidence > 1) {
            issues.push('신뢰도가 유효하지 않습니다');
        }
        return {
            isValid: issues.length === 0,
            issues
        };
    }
}
exports.DataValidator = DataValidator;
