// ============================================================================
// Frontend UI 상수들
// ============================================================================

// 색상 팔레트
export const COLORS = {
  // 기본 색상
  PRIMARY: "#3b82f6",
  SECONDARY: "#64748b",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  ERROR: "#ef4444",
  INFO: "#06b6d4",

  // 회색 톤
  GRAY: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  // 배경 색상
  BACKGROUND: {
    PRIMARY: "#ffffff",
    SECONDARY: "#f8fafc",
    TERTIARY: "#f1f5f9",
    DARK: "#0f172a",
  },

  // 텍스트 색상
  TEXT: {
    PRIMARY: "#0f172a",
    SECONDARY: "#475569",
    TERTIARY: "#64748b",
    DISABLED: "#94a3b8",
    INVERSE: "#ffffff",
  },

  // 테두리 색상
  BORDER: {
    PRIMARY: "#e2e8f0",
    SECONDARY: "#cbd5e1",
    FOCUS: "#3b82f6",
    ERROR: "#ef4444",
  },
} as const

// 타이포그래피
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    SANS: ["Inter", "system-ui", "sans-serif"],
    MONO: ["JetBrains Mono", "Consolas", "monospace"],
  },

  FONT_SIZE: {
    XS: "0.75rem", // 12px
    SM: "0.875rem", // 14px
    BASE: "1rem", // 16px
    LG: "1.125rem", // 18px
    XL: "1.25rem", // 20px
    "2XL": "1.5rem", // 24px
    "3XL": "1.875rem", // 30px
    "4XL": "2.25rem", // 36px
    "5XL": "3rem", // 48px
  },

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

  LINE_HEIGHT: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
} as const

// 간격 (Spacing)
export const SPACING = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
} as const

// 테두리 반경
export const BORDER_RADIUS = {
  NONE: "0",
  SM: "0.125rem", // 2px
  DEFAULT: "0.25rem", // 4px
  MD: "0.375rem", // 6px
  LG: "0.5rem", // 8px
  XL: "0.75rem", // 12px
  "2XL": "1rem", // 16px
  "3XL": "1.5rem", // 24px
  FULL: "9999px",
} as const

// 그림자
export const SHADOWS = {
  SM: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  MD: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  LG: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  XL: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2XL": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  INNER: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  NONE: "0 0 #0000",
} as const

// 애니메이션
export const ANIMATIONS = {
  DURATION: {
    FAST: "150ms",
    NORMAL: "300ms",
    SLOW: "500ms",
  },

  EASING: {
    LINEAR: "linear",
    EASE: "ease",
    EASE_IN: "ease-in",
    EASE_OUT: "ease-out",
    EASE_IN_OUT: "ease-in-out",
  },

  TRANSITIONS: {
    ALL: "all 300ms ease-in-out",
    COLORS:
      "color 300ms ease-in-out, background-color 300ms ease-in-out, border-color 300ms ease-in-out",
    OPACITY: "opacity 300ms ease-in-out",
    TRANSFORM: "transform 300ms ease-in-out",
  },
} as const

// 브레이크포인트
export const BREAKPOINTS = {
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
  BUTTON: {
    SM: "h-8 px-3 text-sm",
    MD: "h-10 px-4 text-base",
    LG: "h-12 px-6 text-lg",
  },

  INPUT: {
    SM: "h-8 px-3 text-sm",
    MD: "h-10 px-4 text-base",
    LG: "h-12 px-6 text-lg",
  },

  CARD: {
    SM: "p-4",
    MD: "p-6",
    LG: "p-8",
  },
} as const

// 아이콘 크기
export const ICON_SIZES = {
  XS: 12,
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 32,
  "2XL": 40,
  "3XL": 48,
} as const

// 로딩 상태
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const

// 토스트 위치
export const TOAST_POSITIONS = {
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
  BOTTOM_RIGHT: "bottom-right",
} as const

// 모달 크기
export const MODAL_SIZES = {
  SM: "max-w-sm",
  MD: "max-w-md",
  LG: "max-w-lg",
  XL: "max-w-xl",
  "2XL": "max-w-2xl",
  "3XL": "max-w-3xl",
  "4XL": "max-w-4xl",
  "5XL": "max-w-5xl",
  "6XL": "max-w-6xl",
  FULL: "max-w-full",
} as const

// 테이블 설정
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  SORT_DIRECTIONS: ["asc", "desc"] as const,
} as const

// 폼 설정
export const FORM_CONFIG = {
  DEBOUNCE_DELAY: 300,
  VALIDATION_DELAY: 500,
  AUTO_SAVE_INTERVAL: 30000, // 30초
} as const

// 무한 스크롤 설정
export const INFINITE_SCROLL_CONFIG = {
  THRESHOLD: 100, // 픽셀
  ROOT_MARGIN: "0px 0px 100px 0px",
} as const
