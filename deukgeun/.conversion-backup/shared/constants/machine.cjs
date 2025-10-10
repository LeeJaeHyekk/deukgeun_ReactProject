// ============================================================================
// 기계 관련 상수
// ============================================================================
// 기계 카테고리
const MACHINE_CATEGORIES
module.exports.MACHINE_CATEGORIES = MACHINE_CATEGORIES = {
    UPPER_BODY: "상체",
    LOWER_BODY: "하체",
    FULL_BODY: "전신",
    OTHER: "기타",
};
// 기계 난이도
const MACHINE_DIFFICULTIES
module.exports.MACHINE_DIFFICULTIES = MACHINE_DIFFICULTIES = {
    BEGINNER: "초급",
    INTERMEDIATE: "중급",
    ADVANCED: "고급",
};
// 타겟 근육
const TARGET_MUSCLES
module.exports.TARGET_MUSCLES = TARGET_MUSCLES = {
    TRICEPS: "삼두근",
    BICEPS: "이두근",
    PECTORALIS_MAJOR: "대흉근",
    LATISSIMUS_DORSI: "광배근",
    TRAPEZIUS: "승모근",
    DELTOID: "삼각근",
    QUADRICEPS: "대퇴사두근",
    HAMSTRINGS: "햄스트링",
    GLUTEUS: "둔근",
    GASTROCNEMIUS: "비복근",
    ABDOMINALS: "복근",
    ERECTOR_SPINAE: "척추기립근",
};
// 기계 상태
const MACHINE_STATUS
module.exports.MACHINE_STATUS = MACHINE_STATUS = {
    AVAILABLE: "available",
    IN_USE: "in_use",
    MAINTENANCE: "maintenance",
    OUT_OF_ORDER: "out_of_order",
};
// 기계 타입
const MACHINE_TYPES
module.exports.MACHINE_TYPES = MACHINE_TYPES = {
    CARDIO: "cardio",
    STRENGTH: "strength",
    FUNCTIONAL: "functional",
    FLEXIBILITY: "flexibility",
    BALANCE: "balance",
};
// 기계 브랜드
const MACHINE_BRANDS
module.exports.MACHINE_BRANDS = MACHINE_BRANDS = {
    LIFE_FITNESS: "Life Fitness",
    PRECOR: "Precor",
    CYBEX: "Cybex",
    MATRIX: "Matrix",
    HAMMER_STRENGTH: "Hammer Strength",
    NORDIC_TRACK: "NordicTrack",
    CONCEPT2: "Concept2",
    TRUE: "True",
    STAR_TRAC: "Star Trac",
    SCHWINN: "Schwinn",
    OTHER: "기타",
};
// 기계 필터 옵션
const MACHINE_FILTER_OPTIONS
module.exports.MACHINE_FILTER_OPTIONS = MACHINE_FILTER_OPTIONS = {
    CATEGORY: "category",
    DIFFICULTY: "difficulty",
    TARGET_MUSCLE: "target_muscle",
    TYPE: "type",
    BRAND: "brand",
    STATUS: "status",
};
// 기계 정렬 옵션
const MACHINE_SORT_OPTIONS
module.exports.MACHINE_SORT_OPTIONS = MACHINE_SORT_OPTIONS = {
    NAME: "name",
    CATEGORY: "category",
    DIFFICULTY: "difficulty",
    POPULARITY: "popularity",
    RATING: "rating",
    CREATED_AT: "created_at",
};
// 기계 API 엔드포인트
const MACHINE_API_ENDPOINTS
module.exports.MACHINE_API_ENDPOINTS = MACHINE_API_ENDPOINTS = {
    LIST: "/api/machines",
    DETAIL: "/api/machines/:id",
    SEARCH: "/api/machines/search",
    FILTER: "/api/machines/filter",
    CATEGORIES: "/api/machines/categories",
    DIFFICULTIES: "/api/machines/difficulties",
    TARGET_MUSCLES: "/api/machines/target-muscles",
    BRANDS: "/api/machines/brands",
    REVIEWS: "/api/machines/:id/reviews",
    PHOTOS: "/api/machines/:id/photos",
    VIDEOS: "/api/machines/:id/videos",
    WORKOUT_PROGRAMS: "/api/machines/:id/workout-programs",
    COMPARE: "/api/machines/compare",
};
// 기계 이미지 타입
const MACHINE_IMAGE_TYPES
module.exports.MACHINE_IMAGE_TYPES = MACHINE_IMAGE_TYPES = {
    MAIN: "main",
    DETAIL: "detail",
    USAGE: "usage",
    POSITION: "position",
    VARIATION: "variation",
};
// 기계 리뷰 타입
const MACHINE_REVIEW_TYPES
module.exports.MACHINE_REVIEW_TYPES = MACHINE_REVIEW_TYPES = {
    GENERAL: "general",
    EFFECTIVENESS: "effectiveness",
    EASE_OF_USE: "ease_of_use",
    SAFETY: "safety",
    MAINTENANCE: "maintenance",
};
// 기계 알림 타입
const MACHINE_NOTIFICATION_TYPES
module.exports.MACHINE_NOTIFICATION_TYPES = MACHINE_NOTIFICATION_TYPES = {
    NEW_REVIEW: "new_review",
    MAINTENANCE_DUE: "maintenance_due",
    POPULARITY_CHANGE: "popularity_change",
    RECOMMENDATION: "recommendation",
    NEW_PROGRAM: "new_program",
};
// 기계 페이지네이션
const MACHINE_PAGINATION
module.exports.MACHINE_PAGINATION = MACHINE_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
// 기계 검색 설정
const MACHINE_SEARCH
module.exports.MACHINE_SEARCH = MACHINE_SEARCH = {
    MIN_QUERY_LENGTH: 2,
    MAX_SUGGESTIONS: 10,
    DEBOUNCE_DELAY: 300,
};
// 기계 평가 기준
const MACHINE_RATING_CRITERIA
module.exports.MACHINE_RATING_CRITERIA = MACHINE_RATING_CRITERIA = {
    EFFECTIVENESS: "effectiveness",
    EASE_OF_USE: "ease_of_use",
    SAFETY: "safety",
    DURABILITY: "durability",
    VALUE: "value",
};
// 기계 운동 프로그램 타입
const MACHINE_WORKOUT_PROGRAM_TYPES
module.exports.MACHINE_WORKOUT_PROGRAM_TYPES = MACHINE_WORKOUT_PROGRAM_TYPES = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
    CUSTOM: "custom",
};
// 기계 운동 프로그램 난이도
const MACHINE_WORKOUT_DIFFICULTIES
module.exports.MACHINE_WORKOUT_DIFFICULTIES = MACHINE_WORKOUT_DIFFICULTIES = {
    EASY: "easy",
    MODERATE: "moderate",
    HARD: "hard",
    EXPERT: "expert",
};
