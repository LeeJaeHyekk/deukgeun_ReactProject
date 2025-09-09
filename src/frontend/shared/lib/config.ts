// ============================================================================
// 프론트엔드 공통 설정
// ============================================================================

import { frontendApiKeyConfig } from "../config/apiKeys.js"

// 이미지 매칭 설정
export const IMAGE_MATCHING_CONFIG = {
  // 머신 이미지 기본 경로
  MACHINE_IMAGE_BASE_PATH: "/img/machine/",

  // 기본 이미지
  DEFAULT_MACHINE_IMAGE: "/img/machine/default.png",

  // 이미지 확장자
  IMAGE_EXTENSIONS: [".png", ".jpg", ".jpeg", ".gif"],

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

  // 이미지 매칭 규칙
  MATCHING_RULES: {
    // 이름 기반 매칭
    NAME_MATCHING: true,
    // 카테고리 기반 매칭
    CATEGORY_MATCHING: true,
    // 키워드 기반 매칭
    KEYWORD_MATCHING: true,
  },
} as const

// 카카오 맵 설정
export const KAKAO_CONFIG = {
  // 카카오 맵 API 키
  API_KEY: frontendApiKeyConfig.kakao.javascriptKey,

  // 기본 지도 설정
  DEFAULT_CENTER: {
    lat: 37.5665, // 서울시청
    lng: 126.978,
  },

  // 기본 줌 레벨
  DEFAULT_ZOOM: 7,

  // 마커 설정
  MARKER: {
    DEFAULT_IMAGE: "/img/marker-default.png",
    SELECTED_IMAGE: "/img/marker-selected.png",
    SIZE: {
      width: 30,
      height: 30,
    },
  },

  // 인포윈도우 설정
  INFO_WINDOW: {
    MAX_WIDTH: 300,
    PADDING: 10,
  },
} as const

// API 설정
export const API_CONFIG = {
  // 타임아웃 설정
  TIMEOUT: 10000,

  // 재시도 설정
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },

  // 캐시 설정
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5분
  },
} as const

// UI 설정
export const UI_CONFIG = {
  // 애니메이션 설정
  ANIMATION: {
    DURATION: 300,
    EASING: "ease-in-out",
  },

  // 토스트 설정
  TOAST: {
    DURATION: 3000,
    POSITION: "top-right",
  },

  // 모달 설정
  MODAL: {
    BACKDROP_CLOSABLE: true,
    ESC_CLOSABLE: true,
  },
} as const

export default {
  IMAGE_MATCHING: IMAGE_MATCHING_CONFIG,
  KAKAO: KAKAO_CONFIG,
  API: API_CONFIG,
  UI: UI_CONFIG,
}
