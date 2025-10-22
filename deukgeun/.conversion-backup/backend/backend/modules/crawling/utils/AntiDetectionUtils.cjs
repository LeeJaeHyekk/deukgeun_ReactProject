"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiDetectionUtils = void 0;
class AntiDetectionUtils {
    static getRandomUserAgent() {
        return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
    }
    static getRandomReferer() {
        return this.REFERERS[Math.floor(Math.random() * this.REFERERS.length)];
    }
    static getRandomDelay(min = 1000, max = 3000) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static getExponentialBackoffDelay(attempt, baseDelay = 1000) {
        return baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
    }
    static getEnhancedHeaders() {
        const userAgent = this.getRandomUserAgent();
        const referer = this.getRandomReferer();
        return {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Referer': referer
        };
    }
    static is403Error(error) {
        if (error?.response?.status === 403)
            return true;
        if (error?.message?.includes('403'))
            return true;
        if (error?.message?.includes('Forbidden'))
            return true;
        return false;
    }
    static isRetryableError(error) {
        const status = error?.response?.status;
        return status === 403 || status === 429 || status === 503 || status === 502;
    }
    static async humanLikeDelay() {
        const delay = this.getRandomDelay(2000, 5000);
        console.log(`⏳ 인간적인 지연: ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    static async delayAfter403Error() {
        const delay = this.getRandomDelay(10000, 20000);
        console.log(`🚫 403 에러 후 긴 지연: ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    static normalizeQuery(query) {
        return query
            .replace(/[()]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    static simplifyQuery(query) {
        return query
            .replace(/[()]/g, '')
            .replace(/[^\w\s가-힣]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}
exports.AntiDetectionUtils = AntiDetectionUtils;
AntiDetectionUtils.USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];
AntiDetectionUtils.REFERERS = [
    'https://www.google.com/',
    'https://www.naver.com/',
    'https://www.daum.net/',
    'https://www.bing.com/'
];
