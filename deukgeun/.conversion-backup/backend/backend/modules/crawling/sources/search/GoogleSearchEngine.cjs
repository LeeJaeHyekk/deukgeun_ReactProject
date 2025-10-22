"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSearchEngine = void 0;
const BaseSearchEngine_1 = require('modules/crawling/sources/search/BaseSearchEngine');
class GoogleSearchEngine extends BaseSearchEngine_1.BaseSearchEngine {
    async search(gymName, address) {
        try {
            console.log(`🔍 구글 향상된 검색 시도: ${gymName} ${address || ''} 헬스장 운영시간 가격`);
            const searchQuery = encodeURIComponent(`${gymName} ${address || ''} 헬스장 운영시간 가격`);
            const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
            const response = await this.makeRequest(searchUrl);
            if (response.status === 200) {
                const pageText = this.extractText(response.data);
                const extractedInfo = this.extractGoogleInfo(pageText, gymName);
                if (extractedInfo) {
                    console.log(`✅ 구글에서 정보 추출: ${gymName}`);
                    return extractedInfo;
                }
            }
            return null;
        }
        catch (error) {
            console.warn(`구글 검색 실패: ${gymName}`, error);
            return null;
        }
    }
    extractGoogleInfo(pageText, gymName) {
        try {
            const phone = this.extractPhoneNumber(pageText);
            const { openHour, closeHour } = this.parseOperatingHours(pageText);
            const googleSpecificInfo = this.extractGoogleSpecificInfo(pageText);
            if (phone || openHour || googleSpecificInfo.length > 0) {
                return {
                    name: gymName,
                    address: '',
                    phone,
                    openHour,
                    closeHour,
                    facilities: googleSpecificInfo,
                    source: 'google',
                    confidence: 0.7,
                    type: 'private'
                };
            }
            return null;
        }
        catch (error) {
            console.warn('구글 정보 추출 오류:', error);
            return null;
        }
    }
    extractGoogleSpecificInfo(pageText) {
        const googleKeywords = [
            '헬스장', '피트니스', '운동', 'PT', 'GX', '요가', '필라테스',
            '크로스핏', '웨이트', '유산소', '근력운동', '다이어트',
            '24시간', '샤워시설', '주차장', '락커룸', '운동복',
            '개인트레이너', '그룹레슨', '회원권', '일일권'
        ];
        return googleKeywords.filter(keyword => pageText.toLowerCase().includes(keyword.toLowerCase()));
    }
}
exports.GoogleSearchEngine = GoogleSearchEngine;
