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
exports.PublicApiSource = void 0;
const axios_1 = __importStar(require("axios"));
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;
const MAX_DATA_ITEMS = 10000;
const REQUEST_TIMEOUT = 30000;
class PublicApiSource {
    constructor() {
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        this.timeout = REQUEST_TIMEOUT;
        this.maxRetries = MAX_RETRIES;
        this.retryDelay = RETRY_DELAY;
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000;
    }
    async collectData() {
        return this.fetchFromSeoulAPI();
    }
    validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }
        if (apiKey.length < 10) {
            console.warn('⚠️ API 키가 너무 짧습니다');
            return false;
        }
        return true;
    }
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            console.log(`⏳ 레이트 리미팅: ${waitTime}ms 대기`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastRequestTime = Date.now();
        this.requestCount++;
    }
    async safeApiCall(url, config) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                await this.enforceRateLimit();
                if (attempt > 1) {
                    const backoffDelay = this.retryDelay * Math.pow(2, attempt - 2);
                    console.log(`⏳ 재시도 ${attempt}/${this.maxRetries} - ${backoffDelay}ms 대기`);
                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                }
                const response = await axios_1.default.get(url, {
                    ...config,
                    timeout: this.timeout,
                    maxContentLength: MAX_RESPONSE_SIZE,
                    maxBodyLength: MAX_RESPONSE_SIZE,
                    validateStatus: (status) => status < 500
                });
                const responseSize = JSON.stringify(response.data).length;
                if (responseSize > MAX_RESPONSE_SIZE) {
                    throw new Error(`응답 크기가 너무 큽니다: ${(responseSize / 1024 / 1024).toFixed(2)}MB`);
                }
                return response;
            }
            catch (error) {
                lastError = error;
                if (error instanceof axios_1.AxiosError) {
                    console.warn(`❌ API 호출 실패 (시도 ${attempt}/${this.maxRetries}): ${error.response?.status} ${error.message}`);
                    const isRetryable = this.isRetryableError(error);
                    if (isRetryable && attempt < this.maxRetries) {
                        continue;
                    }
                    if (!isRetryable || attempt === this.maxRetries) {
                        throw error;
                    }
                }
                else {
                    throw error;
                }
            }
        }
        throw lastError || new Error('모든 재시도 실패');
    }
    isRetryableError(error) {
        if (!error.response) {
            return true;
        }
        const status = error.response.status;
        if (status >= 500 && status < 600) {
            return true;
        }
        if (status === 429) {
            return true;
        }
        if (status === 408) {
            return true;
        }
        return false;
    }
    async fetchFromSeoulAPI() {
        console.log('📡 서울시 공공데이터 API 호출 (LOCALDATA_104201)');
        try {
            const apiKey = process.env.SEOUL_OPENAPI_KEY;
            if (!apiKey) {
                console.warn('⚠️ SEOUL_OPENAPI_KEY가 설정되지 않았습니다');
                return [];
            }
            if (!this.validateApiKey(apiKey)) {
                console.error('❌ 유효하지 않은 API 키입니다');
                return [];
            }
            const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/LOCALDATA_104201/1/1000/`;
            const response = await this.safeApiCall(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate'
                }
            });
            if (!response.data) {
                console.error('❌ 서울시 API 응답 데이터가 없습니다');
                return [];
            }
            if (!response.data.LOCALDATA_104201) {
                console.error('❌ 서울시 API 응답 구조가 올바르지 않습니다');
                return [];
            }
            const rawData = response.data.LOCALDATA_104201.row || [];
            if (!Array.isArray(rawData)) {
                console.error('❌ 서울시 API 응답 데이터가 배열 형식이 아닙니다');
                return [];
            }
            if (rawData.length > MAX_DATA_ITEMS) {
                console.warn(`⚠️ 데이터 항목 수가 제한을 초과했습니다: ${rawData.length}개 (최대 ${MAX_DATA_ITEMS}개)`);
                rawData.splice(MAX_DATA_ITEMS);
            }
            console.log(`✅ 서울시 API 데이터 수집 완료: ${rawData.length}개 시설`);
            return this.processSeoulAPIData(rawData);
        }
        catch (error) {
            console.error('❌ 서울시 API 호출 실패:', error);
            if (error instanceof axios_1.AxiosError) {
                if (error.response) {
                    console.error(`   상태 코드: ${error.response.status}`);
                    console.error(`   응답 데이터: ${JSON.stringify(error.response.data).substring(0, 200)}`);
                }
                else if (error.request) {
                    console.error('   네트워크 에러: 요청이 전송되었지만 응답을 받지 못했습니다');
                }
            }
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
    validateDataItem(item) {
        if (!item || typeof item !== 'object') {
            return false;
        }
        const hasName = item.BPLCNM && typeof item.BPLCNM === 'string' && item.BPLCNM.trim().length > 0;
        const hasAddress = (item.RDNWHLADDR || item.SITEWHLADDR) &&
            typeof (item.RDNWHLADDR || item.SITEWHLADDR) === 'string' &&
            (item.RDNWHLADDR || item.SITEWHLADDR).trim().length > 0;
        if (!hasName || !hasAddress) {
            return false;
        }
        if (item.BPLCNM.length > 200 || (item.RDNWHLADDR || item.SITEWHLADDR).length > 500) {
            console.warn(`⚠️ 데이터 항목이 너무 깁니다: ${item.BPLCNM}`);
            return false;
        }
        return true;
    }
    safeParseFloat(value) {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }
        try {
            const parsed = parseFloat(String(value));
            if (isNaN(parsed) || !isFinite(parsed)) {
                return undefined;
            }
            return parsed;
        }
        catch (error) {
            return undefined;
        }
    }
    safeTrim(value) {
        if (value === null || value === undefined) {
            return undefined;
        }
        try {
            const str = String(value).trim();
            return str.length > 0 ? str : undefined;
        }
        catch (error) {
            return undefined;
        }
    }
    processSeoulAPIData(rawData) {
        console.log('🔍 서울시 API 데이터 처리 시작');
        console.log(`📊 원본 데이터 개수: ${rawData.length}`);
        if (!Array.isArray(rawData)) {
            console.error('❌ 원본 데이터가 배열 형식이 아닙니다');
            return [];
        }
        if (rawData.length === 0) {
            console.warn('⚠️ 원본 데이터가 비어있습니다');
            return [];
        }
        if (rawData.length > 0) {
            console.log('📋 첫 번째 데이터 샘플:', JSON.stringify(rawData[0], null, 2).substring(0, 500));
        }
        const processedData = [];
        let filteredCount = 0;
        let invalidCount = 0;
        for (const item of rawData) {
            try {
                if (!this.validateDataItem(item)) {
                    invalidCount++;
                    continue;
                }
                const businessStatus = item.TRDSTATENM;
                if (!this.isActiveBusiness(businessStatus)) {
                    filteredCount++;
                    continue;
                }
                const businessType = item.UPTAENM;
                const detailBusinessType = item.DRMKCOBNM;
                const cultureSportsType = item.CULPHYEDCOBNM;
                const isGymRelated = this.isGymRelatedBusiness(businessType, detailBusinessType, cultureSportsType, item.BPLCNM);
                if (!isGymRelated) {
                    filteredCount++;
                    continue;
                }
                const processedItem = {
                    name: this.safeTrim(item.BPLCNM) || '',
                    address: this.safeTrim(item.RDNWHLADDR || item.SITEWHLADDR) || '',
                    phone: this.safeTrim(item.SITETEL),
                    facilities: this.safeTrim(item.DRMKCOBNM || item.UPTAENM),
                    openHour: undefined,
                    closeHour: undefined,
                    latitude: this.safeParseFloat(item.Y),
                    longitude: this.safeParseFloat(item.X),
                    source: 'seoul_public_api',
                    confidence: 0.9,
                    type: 'public',
                    isCurrentlyOpen: true,
                    serviceType: this.determineServiceType(item.BPLCNM || '', item.DRMKCOBNM),
                    businessStatus: this.safeTrim(item.TRDSTATENM),
                    businessType: this.safeTrim(item.UPTAENM),
                    detailBusinessType: this.safeTrim(item.DRMKCOBNM),
                    cultureSportsType: this.safeTrim(item.CULPHYEDCOBNM),
                    managementNumber: this.safeTrim(item.MGTNO),
                    approvalDate: this.safeTrim(item.APVPERMYMD),
                    siteArea: this.safeTrim(item.SITEAREA),
                    postalCode: this.safeTrim(item.RDNPOSTNO || item.SITEPOSTNO),
                    sitePostalCode: this.safeTrim(item.SITEPOSTNO),
                    siteAddress: this.safeTrim(item.SITEWHLADDR),
                    roadAddress: this.safeTrim(item.RDNWHLADDR),
                    roadPostalCode: this.safeTrim(item.RDNPOSTNO),
                    insuranceCode: this.safeTrim(item.INSURJNYNCODE),
                    leaderCount: this.safeTrim(item.LDERCNT),
                    buildingCount: this.safeTrim(item.BDNGDNGNUM),
                    buildingArea: this.safeTrim(item.BDNGYAREA)
                };
                if (!processedItem.name || !processedItem.address) {
                    invalidCount++;
                    continue;
                }
                processedData.push(processedItem);
            }
            catch (error) {
                invalidCount++;
                console.warn(`⚠️ 데이터 항목 처리 실패: ${error instanceof Error ? error.message : String(error)}`);
                continue;
            }
        }
        console.log(`✅ 처리된 데이터 개수: ${processedData.length} (헬스장 관련 + 영업중)`);
        console.log(`📊 필터링된 데이터: ${filteredCount}개, 유효하지 않은 데이터: ${invalidCount}개`);
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
