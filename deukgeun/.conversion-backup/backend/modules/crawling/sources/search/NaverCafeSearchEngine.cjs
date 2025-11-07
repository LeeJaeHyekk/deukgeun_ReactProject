"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaverCafeSearchEngine = void 0;
const BaseSearchEngine_1 = require('./BaseSearchEngine.cjs');
const AntiDetectionUtils_1 = require('../../utils/AntiDetectionUtils.cjs');
const NaverCafeFallbackStrategies_1 = require('../../strategies/NaverCafeFallbackStrategies.cjs');
const cheerio = __importStar(require("cheerio"));
class NaverCafeSearchEngine extends BaseSearchEngine_1.BaseSearchEngine {
    initializeFallbackStrategies() {
        const strategies = NaverCafeFallbackStrategies_1.NaverCafeFallbackStrategies.getAllStrategies();
        strategies.forEach(strategy => {
            this.fallbackManager.registerStrategy(strategy);
        });
        console.log(`📋 네이버 카페 폴백 전략 등록 완료: ${strategies.length}개`);
    }
    async search(gymName, address) {
        return this.executeWithFallback(() => this.performPrimarySearch(gymName, address), gymName, address);
    }
    async performPrimarySearch(gymName, address) {
        try {
            console.log(`🔍 네이버 카페 1차 검색 시도: ${gymName} ${address ? `(${address})` : ''}`);
            const searchQueries = this.generateSearchQueries(gymName, address);
            for (let i = 0; i < searchQueries.length; i++) {
                const query = searchQueries[i];
                try {
                    const searchUrl = `https://search.naver.com/search.naver?where=cafe&query=${encodeURIComponent(query)}`;
                    console.log(`🔍 검색 쿼리 ${i + 1}/${searchQueries.length}: ${query}`);
                    const response = await this.makeRequest(searchUrl);
                    if (response.status === 200) {
                        const extractedInfo = this.extractNaverCafeInfo(response.data, gymName, address);
                        if (extractedInfo && this.isValidGymInfo(extractedInfo)) {
                            console.log(`✅ 네이버 카페에서 정보 추출 성공: ${gymName}`);
                            return extractedInfo;
                        }
                    }
                    else if (response.status === 403) {
                        console.warn(`🚫 403 Forbidden - 네이버 카페 검색 차단됨: ${gymName}`);
                        throw new Error('403 Forbidden - 네이버 카페 검색 차단');
                    }
                    if (i < searchQueries.length - 1) {
                        await this.delayBetweenRequests();
                    }
                }
                catch (queryError) {
                    console.warn(`쿼리 "${query}" 검색 실패:`, queryError);
                    if (AntiDetectionUtils_1.AntiDetectionUtils.is403Error(queryError)) {
                        throw new Error('403 Forbidden - 네이버 카페 검색 차단');
                    }
                    continue;
                }
            }
            console.log(`❌ 모든 네이버 카페 검색 쿼리 실패: ${gymName}`);
            return null;
        }
        catch (error) {
            console.error(`네이버 카페 1차 검색 실패: ${gymName}`, error);
            throw error;
        }
    }
    generateSearchQueries(gymName, address) {
        const queries = [];
        queries.push(`${gymName} 헬스장`);
        queries.push(`${gymName} 피트니스`);
        queries.push(`${gymName} 운동`);
        if (address) {
            const region = this.extractRegionFromAddress(address);
            if (region) {
                queries.push(`${gymName} ${region} 헬스장`);
                queries.push(`${gymName} ${region} 피트니스`);
                queries.push(`${region} ${gymName}`);
            }
        }
        if (gymName.includes('짐') || gymName.includes('Gym')) {
            queries.push(gymName.replace(/짐|Gym/gi, '헬스장'));
        }
        return [...new Set(queries)];
    }
    extractRegionFromAddress(address) {
        const regionPatterns = [
            /서울특별시\s+(\w+구)/,
            /서울\s+(\w+구)/,
            /(\w+구)/,
            /(\w+시)/,
            /(\w+동)/
        ];
        for (const pattern of regionPatterns) {
            const match = address.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }
    extractNaverCafeInfo(html, gymName, address) {
        try {
            const $ = cheerio.load(html);
            const pageText = $('body').text();
            const phone = this.extractPhoneNumber(pageText);
            const { openHour, closeHour } = this.parseOperatingHours(pageText);
            const price = this.extractPrice(pageText);
            const rating = this.extractRating(pageText);
            const reviewCount = this.extractReviewCount(pageText);
            const facilities = this.extractCafeSpecificInfo(pageText);
            const additionalInfo = this.extractAdditionalInfo($, pageText);
            const confidence = this.calculateConfidence({
                phone, openHour, price, rating, facilities, additionalInfo
            });
            if (confidence > 0.3) {
                return {
                    name: gymName,
                    address: address || '',
                    phone,
                    openHour,
                    closeHour,
                    price,
                    rating,
                    reviewCount,
                    facilities: [...facilities, ...additionalInfo],
                    source: 'naver_cafe',
                    confidence,
                    type: 'private'
                };
            }
            return null;
        }
        catch (error) {
            console.warn('네이버 카페 정보 추출 오류:', error);
            return null;
        }
    }
    extractPrice(pageText) {
        const pricePatterns = [
            /(\d{1,3}(?:,\d{3})*)\s*원/g,
            /(\d{1,3}(?:,\d{3})*)\s*만원/g,
            /월\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
            /회원권\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
            /일일권\s*(\d{1,3}(?:,\d{3})*)\s*원/g
        ];
        for (const pattern of pricePatterns) {
            const matches = pageText.match(pattern);
            if (matches && matches.length > 0) {
                return matches[0];
            }
        }
        return undefined;
    }
    extractRating(pageText) {
        const ratingPatterns = [
            /평점\s*(\d+\.?\d*)/g,
            /별점\s*(\d+\.?\d*)/g,
            /(\d+\.?\d*)\s*점/g,
            /(\d+\.?\d*)\s*\/\s*5/g
        ];
        for (const pattern of ratingPatterns) {
            const match = pageText.match(pattern);
            if (match && match[1]) {
                const rating = parseFloat(match[1]);
                if (rating >= 0 && rating <= 5) {
                    return rating;
                }
            }
        }
        return undefined;
    }
    extractReviewCount(pageText) {
        const reviewPatterns = [
            /리뷰\s*(\d+)/g,
            /후기\s*(\d+)/g,
            /(\d+)\s*개\s*리뷰/g,
            /(\d+)\s*개\s*후기/g
        ];
        for (const pattern of reviewPatterns) {
            const match = pageText.match(pattern);
            if (match && match[1]) {
                return parseInt(match[1]);
            }
        }
        return undefined;
    }
    extractAdditionalInfo($, pageText) {
        const additionalInfo = [];
        $('.cafe_title, .cafe_subject, .cafe_content').each((_, element) => {
            const text = $(element).text();
            if (text) {
                additionalInfo.push(text.trim());
            }
        });
        const keywordSentences = this.extractKeywordSentences(pageText);
        additionalInfo.push(...keywordSentences);
        return additionalInfo.slice(0, 10);
    }
    extractKeywordSentences(pageText) {
        const sentences = [];
        const keywords = ['운영시간', '가격', '시설', '트레이너', '후기', '추천'];
        const lines = pageText.split(/[.!?]\s*/);
        for (const line of lines) {
            for (const keyword of keywords) {
                if (line.includes(keyword) && line.length > 10 && line.length < 100) {
                    sentences.push(line.trim());
                    break;
                }
            }
        }
        return sentences.slice(0, 5);
    }
    calculateConfidence(data) {
        let confidence = 0;
        if (data.phone)
            confidence += 0.3;
        if (data.openHour)
            confidence += 0.2;
        if (data.price)
            confidence += 0.2;
        if (data.rating)
            confidence += 0.1;
        if (data.facilities.length > 0)
            confidence += 0.1;
        if (data.additionalInfo.length > 0)
            confidence += 0.1;
        return Math.min(confidence, 1.0);
    }
    isValidGymInfo(info) {
        return !!(info.name &&
            (info.phone || info.openHour || info.price || (info.facilities && info.facilities.length > 0)));
    }
    extractCafeSpecificInfo(pageText) {
        const cafeKeywords = [
            '헬스장', '피트니스', '운동', 'PT', 'GX', '요가', '필라테스',
            '크로스핏', '웨이트', '유산소', '근력운동', '다이어트',
            '24시간', '샤워시설', '주차장', '락커룸', '운동복',
            '개인트레이너', '그룹레슨', '회원권', '일일권', '리뷰',
            '후기', '추천', '시설', '환경', '트레이너', '회원',
            '이용', '체험', '상담', '문의', '운영시간', '가격'
        ];
        return cafeKeywords.filter(keyword => pageText.toLowerCase().includes(keyword.toLowerCase()));
    }
}
exports.NaverCafeSearchEngine = NaverCafeSearchEngine;
