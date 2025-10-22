"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMerger = void 0;
const DataValidator_1 = require('modules/crawling/processors/DataValidator');
class DataMerger {
    constructor() {
        this.validator = new DataValidator_1.DataValidator();
    }
    mergeGymData(dataList) {
        console.log(`🔄 헬스장 데이터 병합 시작: ${dataList.length}개 데이터`);
        const validData = dataList
            .filter(data => this.validator.validateGymData(data))
            .map(data => this.validator.cleanGymData(data));
        console.log(`✅ 유효한 데이터: ${validData.length}개`);
        const mergedMap = new Map();
        for (const data of validData) {
            const key = this.generateGymKey(data);
            if (mergedMap.has(key)) {
                const existing = mergedMap.get(key);
                const merged = this.mergeGymRecords(existing, data);
                mergedMap.set(key, merged);
            }
            else {
                mergedMap.set(key, data);
            }
        }
        const mergedData = Array.from(mergedMap.values());
        console.log(`✅ 병합 완료: ${mergedData.length}개 헬스장`);
        return mergedData;
    }
    mergeEquipmentData(dataList) {
        console.log(`🔄 기구 데이터 병합 시작: ${dataList.length}개 데이터`);
        const validData = dataList
            .filter(data => this.validator.validateEquipmentData(data))
            .map(data => this.validator.cleanEquipmentData(data));
        console.log(`✅ 유효한 기구 데이터: ${validData.length}개`);
        const mergedMap = new Map();
        for (const data of validData) {
            const key = this.generateEquipmentKey(data);
            if (mergedMap.has(key)) {
                const existing = mergedMap.get(key);
                const merged = this.mergeEquipmentRecords(existing, data);
                mergedMap.set(key, merged);
            }
            else {
                mergedMap.set(key, data);
            }
        }
        const mergedData = Array.from(mergedMap.values());
        console.log(`✅ 기구 병합 완료: ${mergedData.length}개 기구`);
        return mergedData;
    }
    mergeGymRecords(existing, newData) {
        const merged = {
            ...existing,
            ...newData,
            name: existing.confidence >= newData.confidence ? existing.name : newData.name,
            address: existing.confidence >= newData.confidence ? existing.address : newData.address,
            phone: existing.phone || newData.phone,
            latitude: existing.latitude || newData.latitude,
            longitude: existing.longitude || newData.longitude,
            facilities: existing.facilities || newData.facilities,
            openHour: existing.openHour || newData.openHour,
            closeHour: existing.closeHour || newData.closeHour,
            price: existing.price || newData.price,
            rating: existing.rating || newData.rating,
            reviewCount: existing.reviewCount || newData.reviewCount,
            confidence: Math.max(existing.confidence, newData.confidence),
            source: `${existing.source},${newData.source}`
        };
        return merged;
    }
    mergeEquipmentRecords(existing, newData) {
        const merged = {
            ...existing,
            ...newData,
            quantity: existing.quantity + newData.quantity,
            confidence: Math.max(existing.confidence, newData.confidence),
            source: `${existing.source},${newData.source}`
        };
        return merged;
    }
    generateGymKey(data) {
        const name = data.name.toLowerCase().trim().replace(/\s+/g, '');
        const address = data.address.toLowerCase().trim().replace(/\s+/g, '');
        return `${name}-${address}`;
    }
    generateEquipmentKey(data) {
        const name = data.name.toLowerCase().trim().replace(/\s+/g, '');
        const category = data.category.toLowerCase().trim().replace(/\s+/g, '');
        const gymId = data.gymId || 'unknown';
        return `${gymId}-${category}-${name}`;
    }
    classifyByQuality(dataList) {
        const high = [];
        const medium = [];
        const low = [];
        for (const data of dataList) {
            const quality = this.validator.calculateDataQuality(data);
            if (quality >= 0.8) {
                high.push(data);
            }
            else if (quality >= 0.5) {
                medium.push(data);
            }
            else {
                low.push(data);
            }
        }
        return { high, medium, low };
    }
    getSourceStatistics(dataList) {
        const stats = {};
        for (const data of dataList) {
            const source = data.source;
            if (!stats[source]) {
                stats[source] = {
                    count: 0,
                    totalConfidence: 0,
                    high: 0,
                    medium: 0,
                    low: 0
                };
            }
            stats[source].count++;
            stats[source].totalConfidence += data.confidence;
            const quality = this.validator.calculateDataQuality(data);
            if (quality >= 0.8) {
                stats[source].high++;
            }
            else if (quality >= 0.5) {
                stats[source].medium++;
            }
            else {
                stats[source].low++;
            }
        }
        const result = {};
        for (const [source, stat] of Object.entries(stats)) {
            result[source] = {
                count: stat.count,
                averageConfidence: stat.totalConfidence / stat.count,
                qualityDistribution: {
                    high: stat.high,
                    medium: stat.medium,
                    low: stat.low
                }
            };
        }
        return result;
    }
}
exports.DataMerger = DataMerger;
