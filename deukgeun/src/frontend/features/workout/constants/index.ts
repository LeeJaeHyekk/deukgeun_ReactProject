import type { TabConfig } from "../types"

// 탭 설정 (분석, 실시간 트래킹 탭 제거)
export const TAB_CONFIG: TabConfig[] = [
  {
    key: "overview",
    label: "개요",
    icon: "📊",
    description: "현재 진행중인 운동 계획과 주요 통계",
  },
  {
    key: "goals",
    label: "목표",
    icon: "🎯",
    description: "운동 목표와 달성 상태",
  },
  {
    key: "plans",
    label: "계획",
    icon: "📋",
    description: "새 계획 생성 및 운동 추가",
  },
  { key: "sessions", label: "세션", icon: "⏱️", description: "운동 세션 관리" },

  {
    key: "workoutProgress",
    label: "진행상황",
    icon: "📈",
    description: "월/년 단위 진행 상황 시각화",
  },
] as const

// 차트 설정
export const CHART_TYPES = ["weekly", "monthly", "yearly"] as const
export const TIME_RANGES = ["7days", "30days", "90days", "1year"] as const

// 세션 상태
export const SESSION_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const

// 목표 타입
export const GOAL_TYPES = {
  WEIGHT: "weight",
  REPS: "reps",
  DURATION: "duration",
  FREQUENCY: "frequency",
} as const

// API 엔드포인트
export const API_ENDPOINTS = {
  DASHBOARD: "/api/workout/dashboard",
  PLANS: "/api/workout/plans",
  SESSIONS: "/api/workout/sessions",
  GOALS: "/api/workout/goals",
  MACHINES: "/api/machines",
} as const

// 에러 메시지
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다",
  LOAD_FAILED: "데이터를 불러오는데 실패했습니다",
  SAVE_FAILED: "저장에 실패했습니다",
  DELETE_FAILED: "삭제에 실패했습니다",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다",
} as const

// 성공 메시지
export const SUCCESS_MESSAGES = {
  PLAN_CREATED: "운동 계획이 생성되었습니다",
  PLAN_UPDATED: "운동 계획이 수정되었습니다",
  PLAN_DELETED: "운동 계획이 삭제되었습니다",
  SESSION_CREATED: "운동 세션이 생성되었습니다",
  SESSION_UPDATED: "운동 세션이 수정되었습니다",
  SESSION_DELETED: "운동 세션이 삭제되었습니다",
  GOAL_CREATED: "운동 목표가 생성되었습니다",
  GOAL_UPDATED: "운동 목표가 수정되었습니다",
  GOAL_DELETED: "운동 목표가 삭제되었습니다",
} as const

// 로딩 메시지
export const LOADING_MESSAGES = {
  DASHBOARD: "대시보드 데이터를 불러오는 중...",
  PLANS: "운동 계획을 불러오는 중...",
  SESSIONS: "운동 세션을 불러오는 중...",
  GOALS: "운동 목표를 불러오는 중...",
  SAVING: "저장 중...",
  DELETING: "삭제 중...",
} as const
