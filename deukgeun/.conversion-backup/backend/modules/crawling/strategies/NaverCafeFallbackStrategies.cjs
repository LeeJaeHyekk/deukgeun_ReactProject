"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaverCafeFallbackStrategies = void 0;
const AntiDetectionUtils_1 = require('../utils/AntiDetectionUtils.cjs');
const axios_1 = __importDefault(require("axios"));
class NaverCafeFallbackStrategies {
    static createSimplifiedQueryStrategy() {
        return {
            name: 'simplified_query',
            priority: 1,
            isAvailable: () => true,
            execute: async (gymName, address) => {
                const simplifiedQuery = AntiDetectionUtils_1.AntiDetectionUtils.simplifyQuery(gymName);
                const searchUrl = `https://search.naver.com/search.naver?where=cafe&query=${encodeURIComponent(simplifiedQuery)}`;
                const response = await axios_1.default.get(searchUrl, {
                    headers: AntiDetectionUtils_1.AntiDetectionUtils.getEnhancedHeaders(),
                    timeout: 30000
                });
                if (response.status === 200) {
                    return this.extractBasicInfo(response.data, gymName, address);
                }
                return null;
            }
        };
    }
    static createGeneralNaverStrategy() {
        return {
            name: 'general_naver',
            priority: 2,
            isAvailable: () => true,
            execute: async (gymName, address) => {
                const searchUrl = `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(gymName)}`;
                const response = await axios_1.default.get(searchUrl, {
                    headers: AntiDetectionUtils_1.AntiDetectionUtils.getEnhancedHeaders(),
                    timeout: 30000
                });
                if (response.status === 200) {
                    return this.extractBasicInfo(response.data, gymName, address);
                }
                return null;
            }
        };
    }
    static createNaverBlogStrategy() {
        return {
            name: 'naver_blog',
            priority: 3,
            isAvailable: () => true,
            execute: async (gymName, address) => {
                const searchUrl = `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(gymName + ' 헬스장')}`;
                const response = await axios_1.default.get(searchUrl, {
                    headers: AntiDetectionUtils_1.AntiDetectionUtils.getEnhancedHeaders(),
                    timeout: 30000
                });
                if (response.status === 200) {
                    return this.extractBasicInfo(response.data, gymName, address);
                }
                return null;
            }
        };
    }
    static createGoogleStrategy() {
        return {
            name: 'google_search',
            priority: 4,
            isAvailable: () => true,
            execute: async (gymName, address) => {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(gymName + ' 헬스장 ' + (address || ''))}`;
                const response = await axios_1.default.get(searchUrl, {
                    headers: AntiDetectionUtils_1.AntiDetectionUtils.getEnhancedHeaders(),
                    timeout: 30000
                });
                if (response.status === 200) {
                    return this.extractBasicInfo(response.data, gymName, address);
                }
                return null;
            }
        };
    }
    static createDaumStrategy() {
        return {
            name: 'daum_search',
            priority: 5,
            isAvailable: () => true,
            execute: async (gymName, address) => {
                const searchUrl = `https://search.daum.net/search?q=${encodeURIComponent(gymName + ' 헬스장')}`;
                const response = await axios_1.default.get(searchUrl, {
                    headers: AntiDetectionUtils_1.AntiDetectionUtils.getEnhancedHeaders(),
                    timeout: 30000
                });
                if (response.status === 200) {
                    return this.extractBasicInfo(response.data, gymName, address);
                }
                return null;
            }
        };
    }
    static createBasicInfoStrategy() {
        return {
            name: 'basic_info',
            priority: 6,
            isAvailable: () => true,
            execute: async (gymName, address) => {
                return {
                    name: gymName,
                    address: address || '',
                    phone: undefined,
                    openHour: undefined,
                    closeHour: undefined,
                    price: undefined,
                    rating: undefined,
                    reviewCount: undefined,
                    facilities: [],
                    source: 'fallback_basic',
                    confidence: 0.1,
                    type: 'private'
                };
            }
        };
    }
    static createCachedDataStrategy() {
        return {
            name: 'cached_data',
            priority: 7,
            isAvailable: () => false,
            execute: async (gymName, address) => {
                return null;
            }
        };
    }
    static createExternalApiStrategy() {
        return {
            name: 'external_api',
            priority: 8,
            isAvailable: () => false,
            execute: async (gymName, address) => {
                return null;
            }
        };
    }
    static extractBasicInfo(html, gymName, address) {
        const phoneMatch = html.match(/(\d{2,3}-\d{3,4}-\d{4})/g);
        const phone = phoneMatch ? phoneMatch[0] : undefined;
        const priceMatch = html.match(/(\d{1,3}(?:,\d{3})*)\s*원/g);
        const price = priceMatch ? priceMatch[0] : undefined;
        return {
            name: gymName,
            address: address || '',
            phone,
            openHour: undefined,
            closeHour: undefined,
            price,
            rating: undefined,
            reviewCount: undefined,
            facilities: [],
            source: 'fallback_extraction',
            confidence: 0.3,
            type: 'private'
        };
    }
    static getAllStrategies() {
        return [
            this.createSimplifiedQueryStrategy(),
            this.createGeneralNaverStrategy(),
            this.createNaverBlogStrategy(),
            this.createGoogleStrategy(),
            this.createDaumStrategy(),
            this.createBasicInfoStrategy(),
            this.createCachedDataStrategy(),
            this.createExternalApiStrategy()
        ];
    }
}
exports.NaverCafeFallbackStrategies = NaverCafeFallbackStrategies;
