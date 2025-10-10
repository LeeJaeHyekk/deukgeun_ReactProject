// ============================================================================
// 헬스장 관련 상수
// ============================================================================
// 헬스장 타입
const GYM_TYPES
module.exports.GYM_TYPES = GYM_TYPES = {
    FRANCHISE: "franchise",
    INDEPENDENT: "independent",
    STUDIO: "studio",
    CROSSFIT: "crossfit",
    PILATES: "pilates",
    YOGA: "yoga",
};
// 헬스장 시설 옵션
const GYM_FACILITIES
module.exports.GYM_FACILITIES = GYM_FACILITIES = {
    PARKING: "parking",
    SHOWER: "shower",
    LOCKER_ROOM: "locker_room",
    SAUNA: "sauna",
    POOL: "pool",
    CAFE: "cafe",
    PRO_SHOP: "pro_shop",
    CHILDCARE: "childcare",
    PT_ROOM: "pt_room",
    GROUP_CLASS: "group_class",
    CARDIO_ZONE: "cardio_zone",
    WEIGHT_ZONE: "weight_zone",
    FUNCTIONAL_ZONE: "functional_zone",
};
// 헬스장 운영 시간
const OPERATING_HOURS
module.exports.OPERATING_HOURS = OPERATING_HOURS = {
    "24_HOURS": "24시간",
    "06_00": "06:00-24:00",
    "07_00": "07:00-24:00",
    "08_00": "08:00-24:00",
    "09_00": "09:00-24:00",
    "10_00": "10:00-24:00",
    CUSTOM: "기타",
};
// 헬스장 가격대
const PRICE_RANGES
module.exports.PRICE_RANGES = PRICE_RANGES = {
    LOW: "저가",
    MEDIUM: "중가",
    HIGH: "고가",
    PREMIUM: "프리미엄",
};
// 헬스장 필터 옵션
const GYM_FILTER_OPTIONS
module.exports.GYM_FILTER_OPTIONS = GYM_FILTER_OPTIONS = {
    TYPE: "type",
    FACILITY: "facility",
    PRICE: "price",
    OPERATING_HOUR: "operating_hour",
    RATING: "rating",
    DISTANCE: "distance",
};
// 헬스장 정렬 옵션
const GYM_SORT_OPTIONS
module.exports.GYM_SORT_OPTIONS = GYM_SORT_OPTIONS = {
    DISTANCE: "distance",
    RATING: "rating",
    PRICE: "price",
    NAME: "name",
    REVIEW_COUNT: "review_count",
};
// 정렬 방향
const SORT_DIRECTIONS
module.exports.SORT_DIRECTIONS = SORT_DIRECTIONS = {
    ASC: "asc",
    DESC: "desc",
};
// 헬스장 상태
const GYM_STATUS
module.exports.GYM_STATUS = GYM_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    MAINTENANCE: "maintenance",
    CLOSED: "closed",
};
// 헬스장 등급
const GYM_GRADES
module.exports.GYM_GRADES = GYM_GRADES = {
    BASIC: "basic",
    STANDARD: "standard",
    PREMIUM: "premium",
    LUXURY: "luxury",
};
// 헬스장 검색 반경 (미터)
const SEARCH_RADIUS
module.exports.SEARCH_RADIUS = SEARCH_RADIUS = {
    NEAR: 1000, // 1km
    MEDIUM: 3000, // 3km
    FAR: 5000, // 5km
    VERY_FAR: 10000, // 10km
};
// 헬스장 페이지네이션
const GYM_PAGINATION
module.exports.GYM_PAGINATION = GYM_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
// 헬스장 API 엔드포인트
const GYM_API_ENDPOINTS
module.exports.GYM_API_ENDPOINTS = GYM_API_ENDPOINTS = {
    LIST: "/api/gyms",
    DETAIL: "/api/gyms/:id",
    SEARCH: "/api/gyms/search",
    NEARBY: "/api/gyms/nearby",
    REVIEWS: "/api/gyms/:id/reviews",
    MACHINES: "/api/gyms/:id/machines",
    PHOTOS: "/api/gyms/:id/photos",
    HOURS: "/api/gyms/:id/hours",
    PRICES: "/api/gyms/:id/prices",
};
// 헬스장 이미지 타입
const GYM_IMAGE_TYPES
module.exports.GYM_IMAGE_TYPES = GYM_IMAGE_TYPES = {
    EXTERIOR: "exterior",
    INTERIOR: "interior",
    EQUIPMENT: "equipment",
    FACILITY: "facility",
    LOGO: "logo",
};
// 헬스장 리뷰 타입
const GYM_REVIEW_TYPES
module.exports.GYM_REVIEW_TYPES = GYM_REVIEW_TYPES = {
    GENERAL: "general",
    EQUIPMENT: "equipment",
    STAFF: "staff",
    CLEANLINESS: "cleanliness",
    ATMOSPHERE: "atmosphere",
};
// 헬스장 알림 타입
const GYM_NOTIFICATION_TYPES
module.exports.GYM_NOTIFICATION_TYPES = GYM_NOTIFICATION_TYPES = {
    NEW_REVIEW: "new_review",
    PRICE_CHANGE: "price_change",
    HOURS_CHANGE: "hours_change",
    MAINTENANCE: "maintenance",
    SPECIAL_OFFER: "special_offer",
};
