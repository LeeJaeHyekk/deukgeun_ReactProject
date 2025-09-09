// ============================================================================
// Common 타입 인덱스 - 모든 타입을 중앙에서 관리
// ============================================================================

// API 관련 타입들
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  statusCode?: number
  timestamp?: string
}

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  count: number
}

export interface RequestState {
  loading: boolean
  error: string | null
  success: boolean
}

export interface LoadingState {
  isLoading: boolean
  progress?: number
}

// UI 타입들
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
  }>
}

export interface ProgressData {
  current: number
  total: number
  percentage: number
}

export interface LocalStorageData {
  key: string
  value: any
  expires?: number
}

export interface AppError {
  code: string
  message: string
  details?: any
}

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
}

export interface AccessibilityProps {
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-expanded"?: boolean
  "aria-hidden"?: boolean
  role?: string
  tabIndex?: number
}
