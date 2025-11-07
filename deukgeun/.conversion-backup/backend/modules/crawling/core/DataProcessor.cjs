"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessor = void 0;
const axios_1 = __importDefault(require("axios"));
class DataProcessor {
    constructor(gymRepo) {
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        this.gymRepo = gymRepo;
    }
    async fetchFromSeoulAPI() {
        console.log('📡 서울시 공공데이터 API 호출');
        try {
            const apiKey = process.env.SEOUL_OPENAPI_KEY;
            if (!apiKey) {
                console.warn('⚠️ SEOUL_OPENAPI_KEY가 설정되지 않았습니다');
                return [];
            }
            const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/ListPublicReservationSport/1/1000/`;
            const response = await axios_1.default.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': this.userAgent
                }
            });
            if (response.data && response.data.ListPublicReservationSport) {
                const rawData = response.data.ListPublicReservationSport.row || [];
                return this.processSeoulAPIData(rawData);
            }
            return [];
        }
        catch (error) {
            console.error('❌ 서울시 API 호출 실패:', error);
            return [];
        }
    }
    async crawlGymFromWeb(options) {
        console.log(`🔍 웹 크롤링: ${options.gymName}`);
        try {
            return null;
        }
        catch (error) {
            console.error(`❌ 웹 크롤링 실패: ${options.gymName}`, error);
            return null;
        }
    }
    mergeGymData(dataList) {
        const mergedMap = new Map();
        for (const data of dataList) {
            const key = `${data.name}-${data.address}`;
            if (mergedMap.has(key)) {
                const existing = mergedMap.get(key);
                if (data.confidence > existing.confidence) {
                    mergedMap.set(key, { ...existing, ...data });
                }
            }
            else {
                mergedMap.set(key, data);
            }
        }
        return Array.from(mergedMap.values());
    }
    async saveGymData(gymDataList) {
        console.log(`💾 헬스장 데이터 저장 시작: ${gymDataList.length}개`);
        let savedCount = 0;
        for (const gymData of gymDataList) {
            try {
                const existingGym = await this.gymRepo.findOne({
                    where: {
                        name: gymData.name,
                        address: gymData.address
                    }
                });
                if (existingGym) {
                    Object.assign(existingGym, gymData);
                    await this.gymRepo.save(existingGym);
                }
                else {
                    const gymEntity = this.convertToGymEntity(gymData);
                    const newGym = this.gymRepo.create(gymEntity);
                    await this.gymRepo.save(newGym);
                }
                savedCount++;
            }
            catch (error) {
                console.error(`❌ 헬스장 데이터 저장 실패: ${gymData.name}`, error);
            }
        }
        console.log(`✅ 헬스장 데이터 저장 완료: ${savedCount}개`);
        return savedCount;
    }
    async checkDataQuality() {
        console.log('🔍 데이터 품질 검사 시작');
        try {
            const gyms = await this.gymRepo.find();
            const confidences = gyms.map(gym => gym.confidence || 0);
            const average = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
            const min = Math.min(...confidences);
            const max = Math.max(...confidences);
            const distribution = {
                'high': confidences.filter(c => c >= 0.8).length,
                'medium': confidences.filter(c => c >= 0.5 && c < 0.8).length,
                'low': confidences.filter(c => c < 0.5).length
            };
            const complete = confidences.filter(c => c >= 0.8).length;
            const partial = confidences.filter(c => c >= 0.5 && c < 0.8).length;
            const minimal = confidences.filter(c => c < 0.5).length;
            const averageQualityScore = average;
            console.log(`✅ 데이터 품질 검사 완료: 평균 ${average.toFixed(2)}`);
            return {
                average,
                min,
                max,
                distribution,
                complete,
                partial,
                minimal,
                averageQualityScore
            };
        }
        catch (error) {
            console.error('❌ 데이터 품질 검사 실패:', error);
            return {
                average: 0,
                min: 0,
                max: 0,
                distribution: {},
                complete: 0,
                partial: 0,
                minimal: 0,
                averageQualityScore: 0
            };
        }
    }
    processSeoulAPIData(rawData) {
        return rawData
            .filter(item => item.CENTER_NAME && item.ADDR)
            .map(item => ({
            name: item.CENTER_NAME,
            address: item.ADDR,
            phone: item.TEL || undefined,
            facilities: item.FACILITY_INFO || undefined,
            source: 'seoul_public_api',
            confidence: 0.9,
            type: 'public'
        }));
    }
    convertToGymEntity(gymData) {
        return {
            name: gymData.name,
            address: gymData.address,
            phone: gymData.phone,
            latitude: gymData.latitude,
            longitude: gymData.longitude,
            type: gymData.type,
            is24Hours: gymData.is24Hours,
            hasParking: gymData.hasParking,
            hasShower: gymData.hasShower,
            facilities: gymData.facilities,
            openHour: gymData.openHour,
            closeHour: gymData.closeHour,
            price: gymData.price,
            rating: gymData.rating,
            reviewCount: gymData.reviewCount,
            source: gymData.source,
            confidence: gymData.confidence,
            hasGX: gymData.hasGX,
            hasPT: gymData.hasPT,
            hasGroupPT: gymData.hasGroupPT,
            createdAt: gymData.createdAt ? new Date(gymData.createdAt) : new Date(),
            updatedAt: new Date()
        };
    }
    async cleanup() {
        console.log('🧹 데이터 프로세서 정리 중...');
        console.log('✅ 데이터 프로세서 정리 완료');
    }
}
exports.DataProcessor = DataProcessor;
