// 헬스장 유틸리티 함수들
/**
 * 헬스장 데이터를 필터링합니다.
 * @param gyms - 헬스장 데이터 배열
 * @param filters - 필터 조건
 * @returns 필터링된 헬스장 배열
 */
function filterGyms
module.exports.filterGyms = filterGyms(gyms, filters = {}
module.exports.filterGyms = filterGyms) {
    return gyms.filter(gym => {
        // 카테고리 필터
        if (filters.category && gym.category !== filters.category) {
            return false;
        }
        // 지역 필터
        if (filters.region && !gym.address.includes(filters.region)) {
            return false;
        }
        // 이름 필터
        if (filters.name &&
            !gym.name.toLowerCase().includes(filters.name.toLowerCase())) {
            return false;
        }
        return true;
    });
}
/**
 * 헬스장 데이터를 정제합니다.
 * @param gym - 정제할 헬스장 데이터
 * @returns 정제된 헬스장 데이터
 */
function sanitizeGymData
module.exports.sanitizeGymData = sanitizeGymData(gym) {
    return {
        ...gym,
        name: gym.name.trim(),
        address: gym.address.trim(),
        phone: gym.phone?.trim() || undefined,
        category: gym.category?.trim() || undefined,
    }
module.exports.sanitizeGymData = sanitizeGymData;
}
/**
 * 헬스장 데이터를 검증합니다.
 * @param gym - 검증할 헬스장 데이터
 * @returns 검증 결과
 */
function validateGymData
module.exports.validateGymData = validateGymData(gym) {
    const errors = [];
    if (!gym.name || gym.name.trim().length === 0) {
        errors.push("헬스장 이름은 필수입니다.");
    }
module.exports.validateGymData = validateGymData
    if (!gym.address || gym.address.trim().length === 0) {
        errors.push("주소는 필수입니다.");
    }
    if (gym.name && gym.name.length > 100) {
        errors.push("헬스장 이름은 100자를 초과할 수 없습니다.");
    }
    if (gym.address && gym.address.length > 200) {
        errors.push("주소는 200자를 초과할 수 없습니다.");
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
