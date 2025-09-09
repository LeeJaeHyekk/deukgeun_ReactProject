// ============================================================================
// Frontend 헬스장 상수들
// ============================================================================

// 헬스장 타입
export const GYM_TYPES = {
  COMMERCIAL: "commercial",
  FRANCHISE: "franchise",
  INDEPENDENT: "independent",
  COMMUNITY: "community",
  CORPORATE: "corporate",
} as const

export const GYM_TYPE_LABELS = {
  [GYM_TYPES.COMMERCIAL]: "상업용",
  [GYM_TYPES.FRANCHISE]: "프랜차이즈",
  [GYM_TYPES.INDEPENDENT]: "개인",
  [GYM_TYPES.COMMUNITY]: "커뮤니티",
  [GYM_TYPES.CORPORATE]: "기업용",
} as const

// 헬스장 시설
export const GYM_FACILITIES = {
  CARDIO_MACHINES: "cardio_machines",
  WEIGHT_MACHINES: "weight_machines",
  FREE_WEIGHTS: "free_weights",
  GROUP_CLASSES: "group_classes",
  PERSONAL_TRAINING: "personal_training",
  LOCKER_ROOM: "locker_room",
  SHOWER: "shower",
  SAUNA: "sauna",
  PARKING: "parking",
  CAFE: "cafe",
  PRO_SHOP: "pro_shop",
  CHILDCARE: "childcare",
  POOL: "pool",
  BASKETBALL_COURT: "basketball_court",
  RACQUETBALL: "racquetball",
  YOGA_STUDIO: "yoga_studio",
  PILATES_STUDIO: "pilates_studio",
  SPINNING_ROOM: "spinning_room",
  FUNCTIONAL_TRAINING: "functional_training",
  OUTDOOR_AREA: "outdoor_area",
} as const

export const GYM_FACILITY_LABELS = {
  [GYM_FACILITIES.CARDIO_MACHINES]: "유산소 기구",
  [GYM_FACILITIES.WEIGHT_MACHINES]: "웨이트 머신",
  [GYM_FACILITIES.FREE_WEIGHTS]: "프리웨이트",
  [GYM_FACILITIES.GROUP_CLASSES]: "그룹 클래스",
  [GYM_FACILITIES.PERSONAL_TRAINING]: "개인 트레이닝",
  [GYM_FACILITIES.LOCKER_ROOM]: "락커룸",
  [GYM_FACILITIES.SHOWER]: "샤워실",
  [GYM_FACILITIES.SAUNA]: "사우나",
  [GYM_FACILITIES.PARKING]: "주차장",
  [GYM_FACILITIES.CAFE]: "카페",
  [GYM_FACILITIES.PRO_SHOP]: "프로샵",
  [GYM_FACILITIES.CHILDCARE]: "어린이 돌봄",
  [GYM_FACILITIES.POOL]: "수영장",
  [GYM_FACILITIES.BASKETBALL_COURT]: "농구장",
  [GYM_FACILITIES.RACQUETBALL]: "라켓볼",
  [GYM_FACILITIES.YOGA_STUDIO]: "요가 스튜디오",
  [GYM_FACILITIES.PILATES_STUDIO]: "필라테스 스튜디오",
  [GYM_FACILITIES.SPINNING_ROOM]: "스피닝룸",
  [GYM_FACILITIES.FUNCTIONAL_TRAINING]: "기능성 트레이닝",
  [GYM_FACILITIES.OUTDOOR_AREA]: "야외 운동 공간",
} as const

// 헬스장 시설 아이콘
export const GYM_FACILITY_ICONS = {
  [GYM_FACILITIES.CARDIO_MACHINES]: "Heart",
  [GYM_FACILITIES.WEIGHT_MACHINES]: "Dumbbell",
  [GYM_FACILITIES.FREE_WEIGHTS]: "Weight",
  [GYM_FACILITIES.GROUP_CLASSES]: "Users",
  [GYM_FACILITIES.PERSONAL_TRAINING]: "UserCheck",
  [GYM_FACILITIES.LOCKER_ROOM]: "Lock",
  [GYM_FACILITIES.SHOWER]: "Droplets",
  [GYM_FACILITIES.SAUNA]: "Thermometer",
  [GYM_FACILITIES.PARKING]: "Car",
  [GYM_FACILITIES.CAFE]: "Coffee",
  [GYM_FACILITIES.PRO_SHOP]: "ShoppingBag",
  [GYM_FACILITIES.CHILDCARE]: "Baby",
  [GYM_FACILITIES.POOL]: "Waves",
  [GYM_FACILITIES.BASKETBALL_COURT]: "Basketball",
  [GYM_FACILITIES.RACQUETBALL]: "Tennis",
  [GYM_FACILITIES.YOGA_STUDIO]: "Flower",
  [GYM_FACILITIES.PILATES_STUDIO]: "Activity",
  [GYM_FACILITIES.SPINNING_ROOM]: "Bike",
  [GYM_FACILITIES.FUNCTIONAL_TRAINING]: "Zap",
  [GYM_FACILITIES.OUTDOOR_AREA]: "TreePine",
} as const

// 헬스장 운영 시간
export const GYM_OPERATING_HOURS = {
  "24_HOURS": "24시간",
  EARLY_MORNING: "새벽 5시 - 오후 11시",
  STANDARD: "오전 6시 - 오후 10시",
  EXTENDED: "오전 5시 - 오후 12시",
  WEEKEND_ONLY: "주말만 운영",
  WEEKDAY_ONLY: "평일만 운영",
} as const

// 헬스장 가격대
export const GYM_PRICE_RANGES = {
  BUDGET: "budget",
  MID_RANGE: "mid_range",
  PREMIUM: "premium",
  LUXURY: "luxury",
} as const

export const GYM_PRICE_RANGE_LABELS = {
  [GYM_PRICE_RANGES.BUDGET]: "저렴한 가격",
  [GYM_PRICE_RANGES.MID_RANGE]: "중간 가격",
  [GYM_PRICE_RANGES.PREMIUM]: "프리미엄",
  [GYM_PRICE_RANGES.LUXURY]: "럭셔리",
} as const

// 헬스장 정렬 옵션
export const GYM_SORT_OPTIONS = {
  DISTANCE: "distance",
  RATING: "rating",
  PRICE_LOW: "price_low",
  PRICE_HIGH: "price_high",
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
  FACILITIES: "facilities",
} as const

export const GYM_SORT_LABELS = {
  [GYM_SORT_OPTIONS.DISTANCE]: "거리순",
  [GYM_SORT_OPTIONS.RATING]: "평점순",
  [GYM_SORT_OPTIONS.PRICE_LOW]: "가격 낮은순",
  [GYM_SORT_OPTIONS.PRICE_HIGH]: "가격 높은순",
  [GYM_SORT_OPTIONS.NAME_ASC]: "이름 오름차순",
  [GYM_SORT_OPTIONS.NAME_DESC]: "이름 내림차순",
  [GYM_SORT_OPTIONS.FACILITIES]: "시설 많은순",
} as const

// 헬스장 필터 옵션
export const GYM_FILTER_OPTIONS = {
  ALL: "all",
  NEARBY: "nearby",
  "24_HOURS": "24_hours",
  PARKING: "parking",
  SHOWER: "shower",
  SAUNA: "sauna",
  POOL: "pool",
  GROUP_CLASSES: "group_classes",
  PERSONAL_TRAINING: "personal_training",
  BUDGET: "budget",
  PREMIUM: "premium",
} as const

export const GYM_FILTER_LABELS = {
  [GYM_FILTER_OPTIONS.ALL]: "전체",
  [GYM_FILTER_OPTIONS.NEARBY]: "내 주변",
  [GYM_FILTER_OPTIONS["24_HOURS"]]: "24시간 운영",
  [GYM_FILTER_OPTIONS.PARKING]: "주차장",
  [GYM_FILTER_OPTIONS.SHOWER]: "샤워실",
  [GYM_FILTER_OPTIONS.SAUNA]: "사우나",
  [GYM_FILTER_OPTIONS.POOL]: "수영장",
  [GYM_FILTER_OPTIONS.GROUP_CLASSES]: "그룹 클래스",
  [GYM_FILTER_OPTIONS.PERSONAL_TRAINING]: "개인 트레이닝",
  [GYM_FILTER_OPTIONS.BUDGET]: "저렴한 가격",
  [GYM_FILTER_OPTIONS.PREMIUM]: "프리미엄",
} as const

// 헬스장 검색 반경
export const GYM_SEARCH_RADIUS = {
  "1_KM": 1,
  "3_KM": 3,
  "5_KM": 5,
  "10_KM": 10,
  "20_KM": 20,
} as const

export const GYM_SEARCH_RADIUS_LABELS = {
  [GYM_SEARCH_RADIUS["1_KM"]]: "1km",
  [GYM_SEARCH_RADIUS["3_KM"]]: "3km",
  [GYM_SEARCH_RADIUS["5_KM"]]: "5km",
  [GYM_SEARCH_RADIUS["10_KM"]]: "10km",
  [GYM_SEARCH_RADIUS["20_KM"]]: "20km",
} as const

// 헬스장 상태
export const GYM_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  MAINTENANCE: "maintenance",
  TEMPORARILY_CLOSED: "temporarily_closed",
} as const

export const GYM_STATUS_LABELS = {
  [GYM_STATUS.OPEN]: "운영 중",
  [GYM_STATUS.CLOSED]: "운영 종료",
  [GYM_STATUS.MAINTENANCE]: "점검 중",
  [GYM_STATUS.TEMPORARILY_CLOSED]: "임시 휴업",
} as const

// 헬스장 상태 색상
export const GYM_STATUS_COLORS = {
  [GYM_STATUS.OPEN]: "#22c55e",
  [GYM_STATUS.CLOSED]: "#ef4444",
  [GYM_STATUS.MAINTENANCE]: "#f59e0b",
  [GYM_STATUS.TEMPORARILY_CLOSED]: "#6b7280",
} as const

// 헬스장 평점
export const GYM_RATING = {
  EXCELLENT: 5,
  GOOD: 4,
  AVERAGE: 3,
  POOR: 2,
  TERRIBLE: 1,
} as const

export const GYM_RATING_LABELS = {
  [GYM_RATING.EXCELLENT]: "매우 좋음",
  [GYM_RATING.GOOD]: "좋음",
  [GYM_RATING.AVERAGE]: "보통",
  [GYM_RATING.POOR]: "나쁨",
  [GYM_RATING.TERRIBLE]: "매우 나쁨",
} as const

// 헬스장 리뷰 카테고리
export const GYM_REVIEW_CATEGORIES = {
  FACILITIES: "facilities",
  STAFF: "staff",
  CLEANLINESS: "cleanliness",
  ATMOSPHERE: "atmosphere",
  VALUE: "value",
  LOCATION: "location",
} as const

export const GYM_REVIEW_CATEGORY_LABELS = {
  [GYM_REVIEW_CATEGORIES.FACILITIES]: "시설",
  [GYM_REVIEW_CATEGORIES.STAFF]: "직원",
  [GYM_REVIEW_CATEGORIES.CLEANLINESS]: "청결도",
  [GYM_REVIEW_CATEGORIES.ATMOSPHERE]: "분위기",
  [GYM_REVIEW_CATEGORIES.VALUE]: "가성비",
  [GYM_REVIEW_CATEGORIES.LOCATION]: "위치",
} as const

// 헬스장 혼잡도
export const GYM_CROWD_LEVEL = {
  EMPTY: "empty",
  LIGHT: "light",
  MODERATE: "moderate",
  BUSY: "busy",
  VERY_BUSY: "very_busy",
} as const

export const GYM_CROWD_LEVEL_LABELS = {
  [GYM_CROWD_LEVEL.EMPTY]: "한산함",
  [GYM_CROWD_LEVEL.LIGHT]: "여유로움",
  [GYM_CROWD_LEVEL.MODERATE]: "보통",
  [GYM_CROWD_LEVEL.BUSY]: "붐빔",
  [GYM_CROWD_LEVEL.VERY_BUSY]: "매우 붐빔",
} as const

// 헬스장 혼잡도 색상
export const GYM_CROWD_LEVEL_COLORS = {
  [GYM_CROWD_LEVEL.EMPTY]: "#22c55e",
  [GYM_CROWD_LEVEL.LIGHT]: "#84cc16",
  [GYM_CROWD_LEVEL.MODERATE]: "#f59e0b",
  [GYM_CROWD_LEVEL.BUSY]: "#f97316",
  [GYM_CROWD_LEVEL.VERY_BUSY]: "#ef4444",
} as const

// 헬스장 혼잡도 시간대
export const GYM_CROWD_TIME_PERIODS = {
  EARLY_MORNING: "06:00-09:00",
  MORNING: "09:00-12:00",
  AFTERNOON: "12:00-17:00",
  EVENING: "17:00-21:00",
  NIGHT: "21:00-24:00",
} as const

export const GYM_CROWD_TIME_PERIOD_LABELS = {
  [GYM_CROWD_TIME_PERIODS.EARLY_MORNING]: "새벽",
  [GYM_CROWD_TIME_PERIODS.MORNING]: "오전",
  [GYM_CROWD_TIME_PERIODS.AFTERNOON]: "오후",
  [GYM_CROWD_TIME_PERIODS.EVENING]: "저녁",
  [GYM_CROWD_TIME_PERIODS.NIGHT]: "밤",
} as const

// 헬스장 추천 시간대
export const GYM_RECOMMENDED_TIMES = {
  EARLY_MORNING: {
    time: "06:00-09:00",
    description: "새벽 운동으로 하루를 시작하세요",
    benefits: ["한산함", "에너지 충전", "규칙적인 생활"],
  },
  LUNCH_TIME: {
    time: "12:00-14:00",
    description: "점심 시간을 활용한 운동",
    benefits: ["스트레스 해소", "오후 집중력 향상"],
  },
  EVENING: {
    time: "19:00-21:00",
    description: "저녁 운동으로 하루를 마무리하세요",
    benefits: ["스트레스 해소", "수면 질 향상"],
  },
} as const

// 헬스장 이용 팁
export const GYM_USAGE_TIPS = {
  PEAK_HOURS: "피크 시간대를 피하세요 (오후 6-9시)",
  EQUIPMENT_SHARING: "기구 사용 시 다른 사람과 배려하며 사용하세요",
  CLEANLINESS: "사용 후 기구를 정리하고 소독하세요",
  ETIQUETTE: "헬스장 에티켓을 지키세요",
  SAFETY: "안전을 최우선으로 운동하세요",
  HYGIENE: "개인 위생을 철저히 하세요",
} as const
