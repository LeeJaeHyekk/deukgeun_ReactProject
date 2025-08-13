// ============================================================================
// 헬스장 관련 상수
// ============================================================================

// 헬스장 타입
export const GYM_TYPES = {
  FRANCHISE: "franchise",
  INDEPENDENT: "independent",
  STUDIO: "studio",
  CROSSFIT: "crossfit",
  PILATES: "pilates",
  YOGA: "yoga",
} as const

export type GymType = (typeof GYM_TYPES)[keyof typeof GYM_TYPES]

// 헬스장 시설 옵션
export const GYM_FACILITIES = {
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
} as const

export type GymFacility = (typeof GYM_FACILITIES)[keyof typeof GYM_FACILITIES]

// 헬스장 운영 시간
export const OPERATING_HOURS = {
  "24_HOURS": "24시간",
  "06_00": "06:00-24:00",
  "07_00": "07:00-24:00",
  "08_00": "08:00-24:00",
  "09_00": "09:00-24:00",
  "10_00": "10:00-24:00",
  CUSTOM: "기타",
} as const

export type OperatingHour =
  (typeof OPERATING_HOURS)[keyof typeof OPERATING_HOURS]

// 헬스장 가격대
export const PRICE_RANGES = {
  LOW: "저가",
  MEDIUM: "중가",
  HIGH: "고가",
  PREMIUM: "프리미엄",
} as const

export type PriceRange = (typeof PRICE_RANGES)[keyof typeof PRICE_RANGES]

// 헬스장 필터 옵션
export const GYM_FILTER_OPTIONS = {
  TYPE: "type",
  FACILITY: "facility",
  PRICE: "price",
  OPERATING_HOUR: "operating_hour",
  RATING: "rating",
  DISTANCE: "distance",
} as const

export type GymFilterOption =
  (typeof GYM_FILTER_OPTIONS)[keyof typeof GYM_FILTER_OPTIONS]

// 헬스장 정렬 옵션
export const GYM_SORT_OPTIONS = {
  DISTANCE: "distance",
  RATING: "rating",
  PRICE: "price",
  NAME: "name",
  REVIEW_COUNT: "review_count",
} as const

export type GymSortOption =
  (typeof GYM_SORT_OPTIONS)[keyof typeof GYM_SORT_OPTIONS]

// 정렬 방향
export const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
} as const

export type SortDirection =
  (typeof SORT_DIRECTIONS)[keyof typeof SORT_DIRECTIONS]

// 헬스장 상태
export const GYM_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
  CLOSED: "closed",
} as const

export type GymStatus = (typeof GYM_STATUS)[keyof typeof GYM_STATUS]

// 헬스장 등급
export const GYM_GRADES = {
  BASIC: "basic",
  STANDARD: "standard",
  PREMIUM: "premium",
  LUXURY: "luxury",
} as const

export type GymGrade = (typeof GYM_GRADES)[keyof typeof GYM_GRADES]

// 헬스장 검색 반경 (미터)
export const SEARCH_RADIUS = {
  NEAR: 1000, // 1km
  MEDIUM: 3000, // 3km
  FAR: 5000, // 5km
  VERY_FAR: 10000, // 10km
} as const

// 헬스장 페이지네이션
export const GYM_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// 헬스장 API 엔드포인트
export const GYM_API_ENDPOINTS = {
  LIST: "/api/gyms",
  DETAIL: "/api/gyms/:id",
  SEARCH: "/api/gyms/search",
  NEARBY: "/api/gyms/nearby",
  REVIEWS: "/api/gyms/:id/reviews",
  MACHINES: "/api/gyms/:id/machines",
  PHOTOS: "/api/gyms/:id/photos",
  HOURS: "/api/gyms/:id/hours",
  PRICES: "/api/gyms/:id/prices",
} as const

// 헬스장 이미지 타입
export const GYM_IMAGE_TYPES = {
  EXTERIOR: "exterior",
  INTERIOR: "interior",
  EQUIPMENT: "equipment",
  FACILITY: "facility",
  LOGO: "logo",
} as const

export type GymImageType =
  (typeof GYM_IMAGE_TYPES)[keyof typeof GYM_IMAGE_TYPES]

// 헬스장 리뷰 타입
export const GYM_REVIEW_TYPES = {
  GENERAL: "general",
  EQUIPMENT: "equipment",
  STAFF: "staff",
  CLEANLINESS: "cleanliness",
  ATMOSPHERE: "atmosphere",
} as const

export type GymReviewType =
  (typeof GYM_REVIEW_TYPES)[keyof typeof GYM_REVIEW_TYPES]

// 헬스장 알림 타입
export const GYM_NOTIFICATION_TYPES = {
  NEW_REVIEW: "new_review",
  PRICE_CHANGE: "price_change",
  HOURS_CHANGE: "hours_change",
  MAINTENANCE: "maintenance",
  SPECIAL_OFFER: "special_offer",
} as const

export type GymNotificationType =
  (typeof GYM_NOTIFICATION_TYPES)[keyof typeof GYM_NOTIFICATION_TYPES]
