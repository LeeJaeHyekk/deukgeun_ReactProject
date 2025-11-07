"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaverBlogSearchEngine = void 0;
const BaseSearchEngine_1 = require('./BaseSearchEngine.cjs');
class NaverBlogSearchEngine extends BaseSearchEngine_1.BaseSearchEngine {
    async search(gymName, address) {
        try {
            console.log(`🔍 네이버 블로그 검색 시도: ${gymName}`);
            const searchQuery = encodeURIComponent(`${gymName} 헬스장`);
            const searchUrl = `https://search.naver.com/search.naver?where=blog&query=${searchQuery}`;
            const response = await this.makeRequest(searchUrl);
            if (response.status === 200) {
                const pageText = this.extractText(response.data);
                const extractedInfo = this.extractNaverBlogInfo(pageText, gymName);
                if (extractedInfo) {
                    console.log(`✅ 네이버 블로그에서 정보 추출: ${gymName}`);
                    return extractedInfo;
                }
            }
            return null;
        }
        catch (error) {
            console.warn(`네이버 블로그 검색 실패: ${gymName}`, error);
            return null;
        }
    }
    extractNaverBlogInfo(pageText, gymName) {
        try {
            const phone = this.extractPhoneNumber(pageText);
            const { openHour, closeHour } = this.parseOperatingHours(pageText);
            const blogSpecificInfo = this.extractBlogSpecificInfo(pageText);
            if (phone || openHour || blogSpecificInfo.length > 0) {
                return {
                    name: gymName,
                    address: '',
                    phone,
                    openHour,
                    closeHour,
                    facilities: blogSpecificInfo,
                    source: 'naver_blog',
                    confidence: 0.6,
                    type: 'private'
                };
            }
            return null;
        }
        catch (error) {
            console.warn('네이버 블로그 정보 추출 오류:', error);
            return null;
        }
    }
    extractBlogSpecificInfo(pageText) {
        const blogKeywords = [
            '헬스장', '피트니스', '운동', 'PT', 'GX', '요가', '필라테스',
            '크로스핏', '웨이트', '유산소', '근력운동', '다이어트',
            '24시간', '샤워시설', '주차장', '락커룸', '운동복',
            '개인트레이너', '그룹레슨', '회원권', '일일권', '리뷰',
            '후기', '추천', '시설', '환경', '트레이너'
        ];
        return blogKeywords.filter(keyword => pageText.toLowerCase().includes(keyword.toLowerCase()));
    }
}
exports.NaverBlogSearchEngine = NaverBlogSearchEngine;
