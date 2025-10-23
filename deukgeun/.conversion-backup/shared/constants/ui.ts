// ============================================================================
// UI 관련 상수
// ============================================================================

// 색상 팔레트
export const COLORS = {
  // 브랜드 색상
  PRIMARY: "#3B82F6",
  PRIMARY_DARK: "#2563EB",
  PRIMARY_LIGHT: "#60A5FA",

  // 보조 색상
  SECONDARY: "#10B981",
  SECONDARY_DARK: "#059669",
  SECONDARY_LIGHT: "#34D399",

  // 중성 색상
  GRAY_50: "#F9FAFB",
  GRAY_100: "#F3F4F6",
  GRAY_200: "#E5E7EB",
  GRAY_300: "#D1D5DB",
  GRAY_400: "#9CA3AF",
  GRAY_500: "#6B7280",
  GRAY_600: "#4B5563",
  GRAY_700: "#374151",
  GRAY_800: "#1F2937",
  GRAY_900: "#111827",

  // 상태 색상
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  INFO: "#3B82F6",

  // 배경 색상
  BACKGROUND: "#FFFFFF",
  BACKGROUND_DARK: "#1F2937",
  SURFACE: "#F9FAFB",
  SURFACE_DARK: "#374151",

  // 텍스트 색상
  TEXT_PRIMARY: "#111827",
  TEXT_SECONDARY: "#6B7280",
  TEXT_DISABLED: "#9CA3AF",
  TEXT_INVERSE: "#FFFFFF",
} as const

// 타이포그래피
export const TYPOGRAPHY = {
  // 폰트 패밀리
  FONT_FAMILY: {
    SANS: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    MONO: "JetBrains Mono, 'Fira Code', 'Courier New', monospace",
  },

  // 폰트 크기
  FONT_SIZE: {
    XS: "0.75rem",
    SM: "0.875rem",
    BASE: "1rem",
    LG: "1.125rem",
    XL: "1.25rem",
    "2XL": "1.5rem",
    "3XL": "1.875rem",
    "4XL": "2.25rem",
    "5XL": "3rem",
    "6XL": "3.75rem",
  },

  // 폰트 웨이트
  FONT_WEIGHT: {
    THIN: 100,
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
    BLACK: 900,
  },

  // 라인 하이트
  LINE_HEIGHT: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
} as const

// 간격 (Spacing)
export const SPACING = {
  XS: "0.25rem",
  SM: "0.5rem",
  MD: "1rem",
  LG: "1.5rem",
  XL: "2rem",
  "2XL": "3rem",
  "3XL": "4rem",
  "4XL": "6rem",
  "5XL": "8rem",
} as const

// 테두리 반경
export const BORDER_RADIUS = {
  NONE: "0",
  SM: "0.125rem",
  MD: "0.25rem",
  LG: "0.5rem",
  XL: "0.75rem",
  "2XL": "1rem",
  "3XL": "1.5rem",
  FULL: "9999px",
} as const

// 그림자
export const SHADOWS = {
  SM: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  MD: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  LG: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  XL: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2XL": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  INNER: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  NONE: "none",
} as const

// 애니메이션
export const ANIMATIONS = {
  // 지속 시간
  DURATION: {
    FAST: "150ms",
    NORMAL: "300ms",
    SLOW: "500ms",
    VERY_SLOW: "1000ms",
  },

  // 이징 함수
  EASING: {
    LINEAR: "linear",
    EASE_IN: "ease-in",
    EASE_OUT: "ease-out",
    EASE_IN_OUT: "ease-in-out",
    BOUNCE: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // 트랜지션
  TRANSITION: {
    FAST: "all 150ms ease-in-out",
    NORMAL: "all 300ms ease-in-out",
    SLOW: "all 500ms ease-in-out",
  },
} as const

// 브레이크포인트
export const BREAKPOINTS = {
  XS: "320px",
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
} as const

// Z-인덱스
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const

// 컴포넌트 크기
export const SIZES = {
  // 버튼 크기
  BUTTON: {
    SM: { height: "2rem", padding: "0.5rem 1rem", fontSize: "0.875rem" },
    MD: { height: "2.5rem", padding: "0.75rem 1.5rem", fontSize: "1rem" },
    LG: { height: "3rem", padding: "1rem 2rem", fontSize: "1.125rem" },
  },

  // 입력 필드 크기
  INPUT: {
    SM: { height: "2rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem" },
    MD: { height: "2.5rem", padding: "0.75rem 1rem", fontSize: "1rem" },
    LG: { height: "3rem", padding: "1rem 1.25rem", fontSize: "1.125rem" },
  },

  // 아바타 크기
  AVATAR: {
    XS: "1.5rem",
    SM: "2rem",
    MD: "2.5rem",
    LG: "3rem",
    XL: "4rem",
    "2XL": "6rem",
  },

  // 아이콘 크기
  ICON: {
    XS: "0.75rem",
    SM: "1rem",
    MD: "1.25rem",
    LG: "1.5rem",
    XL: "2rem",
    "2XL": "3rem",
  },
} as const

// 테마
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const

export type Theme = (typeof THEMES)[keyof typeof THEMES]

// 로딩 상태
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const

export type LoadingState = (typeof LOADING_STATES)[keyof typeof LOADING_STATES]

// 모달 타입
export const MODAL_TYPES = {
  CONFIRM: "confirm",
  ALERT: "alert",
  FORM: "form",
  CUSTOM: "custom",
} as const

export type ModalType = (typeof MODAL_TYPES)[keyof typeof MODAL_TYPES]

// 토스트 타입
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const

export type ToastType = (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES]

// 토스트 위치
export const TOAST_POSITIONS = {
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
  BOTTOM_RIGHT: "bottom-right",
} as const

export type ToastPosition =
  (typeof TOAST_POSITIONS)[keyof typeof TOAST_POSITIONS]

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

// 검색
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_SUGGESTIONS: 10,
} as const

// 파일 업로드
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
  MAX_FILES: 10,
} as const

// 드래그 앤 드롭
export const DRAG_DROP = {
  DRAG_OVER_CLASS: "drag-over",
  DRAG_ACTIVE_CLASS: "drag-active",
} as const

// 키보드 단축키
export const KEYBOARD_SHORTCUTS = {
  ESCAPE: "Escape",
  ENTER: "Enter",
  SPACE: " ",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
} as const
