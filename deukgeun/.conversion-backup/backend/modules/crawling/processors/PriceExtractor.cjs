"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceExtractor = void 0;
class PriceExtractor {
    extractPriceInfo(text) {
        try {
            if (!text || typeof text !== 'string') {
                return { confidence: 0, source: 'invalid_input' };
            }
            const priceInfo = {};
            let maxConfidence = 0;
            let bestSource = '';
            const membershipPatterns = [
                { pattern: /회원권\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.9, type: 'membership' },
                { pattern: /월\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.8, type: 'membership' },
                { pattern: /년\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.8, type: 'membership' }
            ];
            for (const { pattern, confidence, type } of membershipPatterns) {
                const match = pattern.exec(text);
                if (match) {
                    priceInfo.membershipPrice = `${match[1]}원`;
                    maxConfidence = Math.max(maxConfidence, confidence);
                    bestSource = `${type}_pattern`;
                    break;
                }
            }
            const ptPatterns = [
                { pattern: /PT\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.9, type: 'pt' },
                { pattern: /개인트레이너\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.8, type: 'pt' }
            ];
            for (const { pattern, confidence, type } of ptPatterns) {
                const match = pattern.exec(text);
                if (match) {
                    priceInfo.ptPrice = `${match[1]}원`;
                    maxConfidence = Math.max(maxConfidence, confidence);
                    bestSource = `${type}_pattern`;
                    break;
                }
            }
            const gxPatterns = [
                { pattern: /GX\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.9, type: 'gx' },
                { pattern: /그룹레슨\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.8, type: 'gx' }
            ];
            for (const { pattern, confidence, type } of gxPatterns) {
                const match = pattern.exec(text);
                if (match) {
                    priceInfo.gxPrice = `${match[1]}원`;
                    maxConfidence = Math.max(maxConfidence, confidence);
                    bestSource = `${type}_pattern`;
                    break;
                }
            }
            const dayPassPatterns = [
                { pattern: /일일권\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.9, type: 'daypass' },
                { pattern: /1일\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.8, type: 'daypass' }
            ];
            for (const { pattern, confidence, type } of dayPassPatterns) {
                const match = pattern.exec(text);
                if (match) {
                    priceInfo.dayPassPrice = `${match[1]}원`;
                    maxConfidence = Math.max(maxConfidence, confidence);
                    bestSource = `${type}_pattern`;
                    break;
                }
            }
            const discountPatterns = [
                { pattern: /할인\s*(\d{1,3}(?:,\d{3})*)\s*원/g, type: 'discount_amount' },
                { pattern: /(\d{1,3}(?:,\d{3})*)\s*원\s*할인/g, type: 'discount_amount' },
                { pattern: /(\d{1,3}(?:,\d{3})*)\s*%?\s*할인/g, type: 'discount_percent' },
                { pattern: /초특가\s*(\d{1,3}(?:,\d{3})*)\s*원/g, type: 'special_price' },
                { pattern: /특가\s*(\d{1,3}(?:,\d{3})*)\s*원/g, type: 'special_price' }
            ];
            for (const { pattern, type } of discountPatterns) {
                const match = pattern.exec(text);
                if (match) {
                    const discountText = match[0].trim();
                    if (type === 'discount_percent') {
                        priceInfo.discountInfo = `할인: ${discountText}`;
                    }
                    else if (type === 'discount_amount') {
                        priceInfo.discountInfo = `할인: ${discountText}`;
                    }
                    else if (type === 'special_price') {
                        priceInfo.discountInfo = `특가: ${discountText}`;
                    }
                    break;
                }
            }
            const minimumPricePatterns = [
                { pattern: /(\d{1,3}(?:,\d{3})*)\s*원\s*부터/g, confidence: 0.7, type: 'minimum' },
                { pattern: /(\d{1,3}(?:,\d{3})*)\s*만원\s*부터/g, confidence: 0.7, type: 'minimum' },
                { pattern: /(\d{1,3}(?:,\d{3})*)\s*원\s*이상/g, confidence: 0.7, type: 'minimum' },
                { pattern: /(\d{1,3}(?:,\d{3})*)\s*만원\s*이상/g, confidence: 0.7, type: 'minimum' }
            ];
            for (const { pattern, confidence, type } of minimumPricePatterns) {
                const match = pattern.exec(text);
                if (match) {
                    const priceText = match[0].trim();
                    priceInfo.minimumPrice = priceText;
                    maxConfidence = Math.max(maxConfidence, confidence);
                    bestSource = `${type}_pattern`;
                    break;
                }
            }
            const otherPricePatterns = [
                { pattern: /(\d{1,3}(?:,\d{3})*)\s*원\s*~?\s*(\d{1,3}(?:,\d{3})*)\s*원/g, confidence: 0.8, type: 'range' },
                { pattern: /(\d{1,3}(?:,\d{3})*)\s*만원\s*~?\s*(\d{1,3}(?:,\d{3})*)\s*만원/g, confidence: 0.8, type: 'range' }
            ];
            for (const { pattern, confidence, type } of otherPricePatterns) {
                const match = pattern.exec(text);
                if (match) {
                    const priceText = match[0].trim();
                    priceInfo.priceDetails = `범위: ${priceText}`;
                    maxConfidence = Math.max(maxConfidence, confidence);
                    bestSource = `${type}_pattern`;
                    break;
                }
            }
            if (!priceInfo.membershipPrice && !priceInfo.ptPrice && !priceInfo.gxPrice && !priceInfo.dayPassPrice && !priceInfo.priceDetails && !priceInfo.minimumPrice) {
                const basicPatterns = [
                    /(\d{1,3}(?:,\d{3})*)\s*원/g,
                    /(\d{1,3}(?:,\d{3})*)\s*만원/g
                ];
                for (const pattern of basicPatterns) {
                    const match = pattern.exec(text);
                    if (match) {
                        priceInfo.priceDetails = `기본: ${match[0].trim()}`;
                        maxConfidence = Math.max(maxConfidence, 0.3);
                        bestSource = 'basic_pattern';
                        break;
                    }
                }
            }
            priceInfo.confidence = maxConfidence;
            priceInfo.source = bestSource;
            return priceInfo;
        }
        catch (error) {
            console.warn('extractPriceInfo 오류:', error);
            return { confidence: 0, source: 'extraction_error' };
        }
    }
    processPriceInformation(allPrices, results) {
        try {
            if (allPrices.length === 0) {
                return {
                    finalPrice: '방문후 확인',
                    matchCount: 0
                };
            }
            const exactPrices = results
                .map(r => [r.membershipPrice, r.ptPrice, r.gxPrice, r.dayPassPrice])
                .flat()
                .filter(price => price && price.trim().length > 0);
            if (exactPrices.length > 0) {
                const mostCommonExactPrice = this.getMostCommonValue(exactPrices);
                if (mostCommonExactPrice) {
                    const priceInfo = this.extractPriceInfo(mostCommonExactPrice);
                    const matchCount = exactPrices.filter(p => p === mostCommonExactPrice).length;
                    return {
                        membershipPrice: priceInfo.membershipPrice,
                        ptPrice: priceInfo.ptPrice,
                        gxPrice: priceInfo.gxPrice,
                        dayPassPrice: priceInfo.dayPassPrice,
                        priceDetails: priceInfo.priceDetails,
                        minimumPrice: priceInfo.minimumPrice,
                        finalPrice: mostCommonExactPrice,
                        matchCount
                    };
                }
            }
            const minimumPrices = results
                .map(r => r.minimumPrice)
                .filter(price => price && price.trim().length > 0);
            if (minimumPrices.length > 0) {
                const mostCommonMinimumPrice = this.getMostCommonValue(minimumPrices);
                if (mostCommonMinimumPrice) {
                    const matchCount = minimumPrices.filter(p => p === mostCommonMinimumPrice).length;
                    return {
                        minimumPrice: mostCommonMinimumPrice,
                        finalPrice: mostCommonMinimumPrice,
                        matchCount
                    };
                }
            }
            const otherPrices = results
                .map(r => r.priceDetails)
                .filter(price => price && price.trim().length > 0);
            if (otherPrices.length > 0) {
                const mostCommonOtherPrice = this.getMostCommonValue(otherPrices);
                if (mostCommonOtherPrice) {
                    const matchCount = otherPrices.filter(p => p === mostCommonOtherPrice).length;
                    return {
                        priceDetails: mostCommonOtherPrice,
                        finalPrice: mostCommonOtherPrice,
                        matchCount
                    };
                }
            }
            return {
                finalPrice: '방문후 확인',
                matchCount: 0
            };
        }
        catch (error) {
            console.warn('가격 정보 처리 오류:', error);
            return {
                finalPrice: '방문후 확인',
                matchCount: 0
            };
        }
    }
    getMostCommonValue(values) {
        if (values.length === 0)
            return null;
        const frequency = {};
        let maxCount = 0;
        let mostCommon = values[0];
        for (const value of values) {
            frequency[value] = (frequency[value] || 0) + 1;
            if (frequency[value] > maxCount) {
                maxCount = frequency[value];
                mostCommon = value;
            }
        }
        return mostCommon;
    }
}
exports.PriceExtractor = PriceExtractor;
