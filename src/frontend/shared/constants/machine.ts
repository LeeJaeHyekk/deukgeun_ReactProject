// 머신 관련 상수들

export const MACHINE_CONFIG = {
  // 머신 이미지 기본 경로
  MACHINE_IMAGE_BASE_PATH: "/img/machine/",
  
  // 기본 머신 이미지
  DEFAULT_MACHINE_IMAGE: "/img/machine/default.png",
  
  // 지원하는 이미지 확장자
  IMAGE_EXTENSIONS: [".png", ".jpg", ".jpeg", ".gif"] as const,
  
  // 이미지 매칭 규칙
  MATCHING_RULES: {
    // 머신 이름별 이미지 매칭
    MACHINE_IMAGES: {
      "벤치프레스": "bench-press.png",
      "스쿼트랙": "squat-rack.png",
      "데드리프트": "deadlift.png",
      "풀업바": "pull-up-bar.png",
      "덤벨": "dumbbell.png",
      "바벨": "barbell.png",
      "케이블머신": "cable-machine.png",
      "레그프레스": "leg-press.png",
      "라잉로우": "lying-row.png",
      "체스트프레스": "chest-press.png",
      "숄더프레스": "shoulder-press.png",
      "레그컬": "leg-curl.png",
      "레그익스텐션": "leg-extension.png",
      "라트풀다운": "lat-pulldown.png",
      "시티드로우": "seated-row.png",
      "트라이셉스푸시다운": "tricep-pushdown.png",
      "바이셉스컬": "bicep-curl.png",
      "레그레이즈": "leg-raise.png",
      "플랭크": "plank.png",
    },
    
    // 카테고리별 기본 이미지
    CATEGORY_IMAGES: {
      "chest": "chest-default.png",
      "back": "back-default.png",
      "shoulders": "shoulders-default.png",
      "arms": "arms-default.png",
      "legs": "legs-default.png",
      "core": "core-default.png",
      "cardio": "cardio-default.png",
    },
    
    // 기본 이미지
    DEFAULT_IMAGE: "default-machine.png",
    
    // 난이도별 색상
    DIFFICULTY_COLORS: {
      "beginner": "#10b981", // green
      "intermediate": "#f59e0b", // yellow
      "advanced": "#ef4444", // red
    },
  },
} as const

// 머신 카테고리
export const MACHINE_CATEGORIES = {
  CHEST: "chest",
  BACK: "back", 
  SHOULDERS: "shoulders",
  ARMS: "arms",
  LEGS: "legs",
  CORE: "core",
  CARDIO: "cardio",
  FULL_BODY: "full_body",
} as const

// 머신 난이도
export const MACHINE_DIFFICULTY = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate", 
  ADVANCED: "advanced",
} as const

// 타겟 근육군
export const TARGET_MUSCLES = {
  // 가슴
  PECTORALS: "pectorals",
  UPPER_CHEST: "upper_chest",
  LOWER_CHEST: "lower_chest",
  
  // 등
  LATISSIMUS_DORSI: "latissimus_dorsi",
  RHOMBOIDS: "rhomboids",
  TRAPEZIUS: "trapezius",
  ERECTOR_SPINAE: "erector_spinae",
  
  // 어깨
  DELTOIDS: "deltoids",
  FRONT_DELTOIDS: "front_deltoids",
  SIDE_DELTOIDS: "side_deltoids",
  REAR_DELTOIDS: "rear_deltoids",
  
  // 팔
  BICEPS: "biceps",
  TRICEPS: "triceps",
  FOREARMS: "forearms",
  
  // 다리
  QUADRICEPS: "quadriceps",
  HAMSTRINGS: "hamstrings",
  GLUTES: "glutes",
  CALVES: "calves",
  
  // 코어
  ABS: "abs",
  OBLIQUES: "obliques",
  LOWER_BACK: "lower_back",
} as const

// 머신 검색 필터
export const MACHINE_FILTERS = {
  CATEGORY: "category",
  DIFFICULTY: "difficulty", 
  TARGET_MUSCLE: "target_muscle",
  GYM_ID: "gym_id",
  SEARCH: "search",
} as const

// 머신 정렬 옵션
export const MACHINE_SORT_OPTIONS = {
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
  DIFFICULTY_ASC: "difficulty_asc",
  DIFFICULTY_DESC: "difficulty_desc",
  CREATED_ASC: "created_asc",
  CREATED_DESC: "created_desc",
} as const

// 머신 페이지네이션
export const MACHINE_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const

// 머신 유효성 검사 규칙
export const MACHINE_VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
  INSTRUCTIONS: {
    MIN_COUNT: 1,
    MAX_COUNT: 10,
    MIN_LENGTH: 5,
    MAX_LENGTH: 200,
  },
  TIPS: {
    MAX_COUNT: 5,
    MAX_LENGTH: 200,
  },
} as const

export type MachineCategory = typeof MACHINE_CATEGORIES[keyof typeof MACHINE_CATEGORIES]
export type MachineDifficulty = typeof MACHINE_DIFFICULTY[keyof typeof MACHINE_DIFFICULTY]
export type TargetMuscle = typeof TARGET_MUSCLES[keyof typeof TARGET_MUSCLES]
export type MachineFilter = typeof MACHINE_FILTERS[keyof typeof MACHINE_FILTERS]
export type MachineSortOption = typeof MACHINE_SORT_OPTIONS[keyof typeof MACHINE_SORT_OPTIONS]

// IMAGE_MATCHING_CONFIG 별칭 (기존 코드 호환성)
export const IMAGE_MATCHING_CONFIG = MACHINE_CONFIG.MATCHING_RULES