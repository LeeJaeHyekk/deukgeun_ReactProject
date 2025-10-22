"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicApiSource = void 0;
const axios_1 = __importDefault(require("axios"));
class PublicApiSource {
    constructor() {
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        this.timeout = 15000;
    }
    async collectData() {
        return this.fetchFromSeoulAPI();
    }
    async fetchFromSeoulAPI() {
        console.log('📡 서울시 공공데이터 API 호출 (LOCALDATA_104201)');
        try {
            const apiKey = process.env.SEOUL_OPENAPI_KEY;
            if (!apiKey) {
                console.warn('⚠️ SEOUL_OPENAPI_KEY가 설정되지 않았습니다');
                return [];
            }
            const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/LOCALDATA_104201/1/1000/`;
            const response = await axios_1.default.get(url, {
                timeout: this.timeout,
                headers: {
                    'User-Agent': this.userAgent
                }
            });
            if (response.data && response.data.LOCALDATA_104201) {
                const rawData = response.data.LOCALDATA_104201.row || [];
                console.log(`✅ 서울시 API 데이터 수집 완료: ${rawData.length}개 시설`);
                return this.processSeoulAPIData(rawData);
            }
            console.log('❌ 서울시 API 응답 데이터가 없습니다');
            return [];
        }
        catch (error) {
            console.error('❌ 서울시 API 호출 실패:', error);
            return [];
        }
    }
    async fetchAllPublicAPIData() {
        console.log('📡 서울시 공공 API에서 데이터 수집 시작');
        try {
            const seoulData = await this.fetchFromSeoulAPI();
            console.log(`✅ 공공 API 데이터 수집 완료: 총 ${seoulData.length}개 헬스장`);
            return seoulData;
        }
        catch (error) {
            console.error('❌ 공공 API 데이터 수집 실패:', error);
            return [];
        }
    }
    processSeoulAPIData(rawData) {
        console.log('🔍 서울시 API 데이터 처리 시작');
        console.log(`📊 원본 데이터 개수: ${rawData.length}`);
        if (rawData.length > 0) {
            console.log('📋 첫 번째 데이터 샘플:', JSON.stringify(rawData[0], null, 2));
        }
        const processedData = rawData
            .filter(item => {
            const hasName = item.BPLCNM;
            const hasAddress = item.RDNWHLADDR || item.SITEWHLADDR;
            if (!hasName || !hasAddress) {
                return false;
            }
            const businessStatus = item.TRDSTATENM;
            if (!this.isActiveBusiness(businessStatus)) {
                console.log(`🚫 영업중이 아닌 시설 제외: ${item.BPLCNM} (상태: ${businessStatus})`);
                return false;
            }
            const businessType = item.UPTAENM;
            const detailBusinessType = item.DRMKCOBNM;
            const cultureSportsType = item.CULPHYEDCOBNM;
            const isGymRelated = this.isGymRelatedBusiness(businessType, detailBusinessType, cultureSportsType, item.BPLCNM);
            if (!isGymRelated) {
                return false;
            }
            return true;
        })
            .map(item => {
            return {
                name: item.BPLCNM.trim(),
                address: (item.RDNWHLADDR || item.SITEWHLADDR).trim(),
                phone: item.SITETEL || undefined,
                facilities: item.DRMKCOBNM || item.UPTAENM || undefined,
                openHour: undefined,
                closeHour: undefined,
                latitude: item.Y ? parseFloat(item.Y) : undefined,
                longitude: item.X ? parseFloat(item.X) : undefined,
                source: 'seoul_public_api',
                confidence: 0.9,
                type: 'public',
                isCurrentlyOpen: true,
                serviceType: this.determineServiceType(item.BPLCNM, item.DRMKCOBNM),
                businessStatus: item.TRDSTATENM,
                businessType: item.UPTAENM,
                detailBusinessType: item.DRMKCOBNM,
                cultureSportsType: item.CULPHYEDCOBNM,
                managementNumber: item.MGTNO,
                approvalDate: item.APVPERMYMD,
                siteArea: item.SITEAREA,
                postalCode: item.RDNPOSTNO || item.SITEPOSTNO,
                sitePostalCode: item.SITEPOSTNO,
                siteAddress: item.SITEWHLADDR,
                roadAddress: item.RDNWHLADDR,
                roadPostalCode: item.RDNPOSTNO,
                insuranceCode: item.INSURJNYNCODE,
                leaderCount: item.LDERCNT,
                buildingCount: item.BDNGDNGNUM,
                buildingArea: item.BDNGYAREA
            };
        });
        console.log(`✅ 처리된 데이터 개수: ${processedData.length} (헬스장 관련 + 영업중)`);
        return processedData;
    }
    isActiveBusiness(businessStatus) {
        if (!businessStatus)
            return false;
        const activeStatuses = [
            '영업', '정상영업', '영업중', '운영중', '정상운영'
        ];
        return activeStatuses.some(status => businessStatus.includes(status));
    }
    isGymRelatedBusiness(businessType, detailBusinessType, cultureSportsType, businessName) {
        const gymKeywords = [
            '헬스', '헬스장', '피트니스', 'fitness', 'gym', '짐',
            '크로스핏', 'crossfit', 'cross fit',
            'pt', 'personal training', '개인트레이닝',
            'gx', 'group exercise', '그룹운동',
            '요가', 'yoga', '필라테스', 'pilates',
            '웨이트', 'weight', '근력', 'muscle',
            '체육관', '운동', 'exercise', '스포츠',
            '체육', '운동시설', '헬스클럽', '피트니스센터'
        ];
        const combinedText = `${businessType || ''} ${detailBusinessType || ''} ${cultureSportsType || ''} ${businessName || ''}`.toLowerCase();
        return gymKeywords.some(keyword => combinedText.includes(keyword));
    }
    isGymRelatedService(serviceName, serviceType) {
        const gymKeywords = [
            '헬스', '헬스장', '피트니스', 'fitness', 'gym', '짐',
            '크로스핏', 'crossfit', 'cross fit',
            'pt', 'personal training', '개인트레이닝',
            'gx', 'group exercise', '그룹운동',
            '요가', 'yoga', '필라테스', 'pilates',
            '웨이트', 'weight', '근력', 'muscle',
            '체육관', '운동', 'exercise'
        ];
        const combinedText = `${serviceName} ${serviceType}`.toLowerCase();
        return gymKeywords.some(keyword => combinedText.includes(keyword));
    }
    isCurrentlyOpen(item) {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTime = currentHour * 60 + currentMinute;
            if (item.SVCOPNBGNDT && item.SVCOPNENDDT) {
                const openTime = this.parseTime(item.SVCOPNBGNDT);
                const closeTime = this.parseTime(item.SVCOPNENDDT);
                if (openTime !== null && closeTime !== null) {
                    return currentTime >= openTime && currentTime <= closeTime;
                }
            }
            return true;
        }
        catch (error) {
            console.warn('영업시간 확인 중 오류:', error);
            return true;
        }
    }
    parseTime(timeStr) {
        try {
            const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                const hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                return hours * 60 + minutes;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    determineServiceType(businessName, detailBusinessType) {
        const name = businessName.toLowerCase();
        const detailType = (detailBusinessType || '').toLowerCase();
        const combinedText = `${name} ${detailType}`;
        if (combinedText.includes('크로스핏') || combinedText.includes('crossfit')) {
            return '크로스핏';
        }
        else if (combinedText.includes('pt') || combinedText.includes('개인트레이닝') || combinedText.includes('personal training')) {
            return 'pt';
        }
        else if (combinedText.includes('gx') || combinedText.includes('그룹') || combinedText.includes('group exercise')) {
            return 'gx';
        }
        else if (combinedText.includes('요가') || combinedText.includes('yoga')) {
            return '요가';
        }
        else if (combinedText.includes('필라테스') || combinedText.includes('pilates')) {
            return '필라테스';
        }
        else if (combinedText.includes('헬스') || combinedText.includes('fitness') || combinedText.includes('gym')) {
            return 'gym';
        }
        else if (combinedText.includes('체육관') || combinedText.includes('운동시설')) {
            return '체육관';
        }
        else {
            return 'gym';
        }
    }
}
exports.PublicApiSource = PublicApiSource;
