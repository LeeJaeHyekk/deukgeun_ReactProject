"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterGyms = filterGyms;
exports.sanitizeGymData = sanitizeGymData;
exports.validateGymData = validateGymData;
function filterGyms(gyms, filters = {}) {
    return gyms.filter(gym => {
        if (filters.category && gym.category !== filters.category) {
            return false;
        }
        if (filters.region && !gym.address.includes(filters.region)) {
            return false;
        }
        if (filters.name &&
            !gym.name.toLowerCase().includes(filters.name.toLowerCase())) {
            return false;
        }
        return true;
    });
}
function sanitizeGymData(gym) {
    return {
        ...gym,
        name: gym.name.trim(),
        address: gym.address.trim(),
        phone: gym.phone?.trim() || undefined,
        category: gym.category?.trim() || undefined,
    };
}
function validateGymData(gym) {
    const errors = [];
    if (!gym.name || gym.name.trim().length === 0) {
        errors.push("헬스장 이름은 필수입니다.");
    }
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
