"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMerger = void 0;
const DataValidator_1 = require("./DataValidator.cjs");
class DataMerger {
    constructor() {
        this.validator = new DataValidator_1.DataValidator();
    }
    mergeGymData(dataList) {
        console.log(`🔄 헬스장 데이터 병합 시작: ${dataList.length}개 데이터`);
        if (!Array.isArray(dataList)) {
            console.error('❌ 데이터 리스트가 배열 형식이 아닙니다');
            return [];
        }
        if (dataList.length === 0) {
            console.warn('⚠️ 데이터 리스트가 비어있습니다');
            return [];
        }
        const MAX_ITEMS = 50000;
        const limitedDataList = dataList.length > MAX_ITEMS
            ? dataList.slice(0, MAX_ITEMS)
            : dataList;
        if (dataList.length > MAX_ITEMS) {
            console.warn(`⚠️ 데이터 리스트가 너무 많습니다 (${dataList.length}개). 최대 ${MAX_ITEMS}개만 처리합니다.`);
        }
        const validData = [];
        let invalidCount = 0;
        for (const data of limitedDataList) {
            try {
                if (!data || typeof data !== 'object') {
                    invalidCount++;
                    continue;
                }
                try {
                    JSON.stringify(data);
                }
                catch (error) {
                    invalidCount++;
                    console.warn('⚠️ 데이터 항목에 순환 참조가 있습니다');
                    continue;
                }
                if (!this.validator.validateGymData(data)) {
                    invalidCount++;
                    continue;
                }
                const cleanedData = this.validator.cleanGymData(data);
                validData.push(cleanedData);
            }
            catch (error) {
                invalidCount++;
                console.warn(`⚠️ 데이터 항목 처리 실패: ${error instanceof Error ? error.message : String(error)}`);
                continue;
            }
        }
        console.log(`✅ 유효한 데이터: ${validData.length}개 (유효하지 않음: ${invalidCount}개)`);
        if (validData.length === 0) {
            console.warn('⚠️ 유효한 데이터가 없습니다');
            return [];
        }
        const mergedMap = new Map();
        let mergedCount = 0;
        let duplicateCount = 0;
        for (const data of validData) {
            try {
                const key = this.generateGymKey(data);
                if (mergedMap.has(key)) {
                    const existing = mergedMap.get(key);
                    const merged = this.mergeGymRecords(existing, data);
                    mergedMap.set(key, merged);
                    duplicateCount++;
                }
                else {
                    mergedMap.set(key, data);
                }
            }
            catch (error) {
                console.warn(`⚠️ 데이터 병합 실패: ${error instanceof Error ? error.message : String(error)}`);
                continue;
            }
        }
        const mergedData = Array.from(mergedMap.values());
        mergedCount = mergedData.length;
        console.log(`✅ 병합 완료: ${mergedCount}개 헬스장 (중복 제거: ${duplicateCount}개)`);
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
        try {
            if (!existing || !newData || typeof existing !== 'object' || typeof newData !== 'object') {
                throw new Error('병합할 데이터가 유효하지 않습니다');
            }
            try {
                JSON.stringify(existing);
                JSON.stringify(newData);
            }
            catch (error) {
                throw new Error('병합할 데이터에 순환 참조가 있습니다');
            }
            const merged = {
                ...existing,
                ...newData,
                name: this.safeMergeString(existing.name, newData.name, existing.confidence >= newData.confidence),
                address: this.safeMergeString(existing.address, newData.address, existing.confidence >= newData.confidence),
                phone: this.safeMergeString(existing.phone, newData.phone, false),
                latitude: this.safeMergeNumber(existing.latitude, newData.latitude),
                longitude: this.safeMergeNumber(existing.longitude, newData.longitude),
                facilities: this.safeMergeString(existing.facilities, newData.facilities, false),
                openHour: this.safeMergeString(existing.openHour, newData.openHour, false),
                closeHour: this.safeMergeString(existing.closeHour, newData.closeHour, false),
                price: this.safeMergeString(existing.price, newData.price, false),
                rating: this.safeMergeNumber(existing.rating, newData.rating),
                reviewCount: this.safeMergeNumber(existing.reviewCount, newData.reviewCount),
                confidence: Math.max(existing.confidence || 0, newData.confidence || 0),
                source: this.safeMergeSource(existing.source, newData.source)
            };
            if (!merged.name || !merged.address) {
                throw new Error('병합된 데이터에 필수 필드가 없습니다');
            }
            return merged;
        }
        catch (error) {
            console.error('❌ 데이터 병합 실패:', error);
            return existing;
        }
    }
    safeMergeString(existing, newData, preferExisting) {
        if (preferExisting && existing) {
            return String(existing).trim();
        }
        if (newData) {
            return String(newData).trim();
        }
        if (existing) {
            return String(existing).trim();
        }
        return '';
    }
    safeMergeNumber(existing, newData) {
        const existingNum = this.safeParseNumber(existing);
        const newNum = this.safeParseNumber(newData);
        if (existingNum !== undefined)
            return existingNum;
        if (newNum !== undefined)
            return newNum;
        return undefined;
    }
    safeParseNumber(value) {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }
        try {
            const parsed = typeof value === 'number' ? value : parseFloat(String(value));
            if (isNaN(parsed) || !isFinite(parsed)) {
                return undefined;
            }
            return parsed;
        }
        catch (error) {
            return undefined;
        }
    }
    safeMergeSource(existing, newData) {
        const sources = new Set();
        if (existing) {
            const existingStr = String(existing).trim();
            if (existingStr) {
                existingStr.split(',').forEach(s => {
                    const trimmed = s.trim();
                    if (trimmed)
                        sources.add(trimmed);
                });
            }
        }
        if (newData) {
            const newStr = String(newData).trim();
            if (newStr) {
                newStr.split(',').forEach(s => {
                    const trimmed = s.trim();
                    if (trimmed)
                        sources.add(trimmed);
                });
            }
        }
        return Array.from(sources).join(',');
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
        try {
            if (!data.name || !data.address) {
                throw new Error('필수 필드가 없습니다');
            }
            const name = String(data.name).toLowerCase().trim().replace(/\s+/g, '').substring(0, 200);
            const address = String(data.address).toLowerCase().trim().replace(/\s+/g, '').substring(0, 500);
            if (!name || !address) {
                throw new Error('정제된 필수 필드가 비어있습니다');
            }
            return `${name}-${address}`;
        }
        catch (error) {
            const fallbackKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            console.warn(`⚠️ 키 생성 실패, 대체 키 사용: ${fallbackKey}`);
            return fallbackKey;
        }
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
