// ============================================================================
// Workout Feature Types Export
// ============================================================================

export * from "./workout"
export * from "../../../../shared/types/common"

// ============================================================================
// 프론트엔드 전용 타입들 (UI/UX 관련)
// ============================================================================

// 운동 계획 관련 UI 타입
export interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onEdit?: (plan: WorkoutPlan) => void
  onDelete?: (planId: number) => void
  onStart?: (plan: WorkoutPlan) => void
}

// 운동 세션 관련 UI 타입
export interface WorkoutSessionCardProps {
  session: WorkoutSession
  onEdit?: (session: WorkoutSession) => void
  onDelete?: (sessionId: number) => void
  onResume?: (session: WorkoutSession) => void
}

// 운동 목표 관련 UI 타입
export interface WorkoutGoalCardProps {
  goal: WorkoutGoal
  onEdit?: (goal: WorkoutGoal) => void
  onDelete?: (goalId: number) => void
  onUpdateProgress?: (goalId: number, progress: number) => void
}

// 차트 데이터 타입
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface TimeRangeData {
  label: string
  value: number
  change?: number
  trend?: "up" | "down" | "stable"
}

// 필터 및 정렬 타입
export interface FilterOptions {
  difficulty?: string
  status?: string
  type?: string
  dateRange?: string
  searchQuery?: string
}

export interface SortOptions {
  field: string
  direction: "asc" | "desc"
}
