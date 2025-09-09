// ============================================================================
// 프론트엔드 공통 타입 정의
// ============================================================================

// 기본 타입들
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface RequestState {
  isLoading: boolean
  error: string | null
  data: any
}

export interface AppError {
  code: string
  message: string
  details?: any
}

export interface PerformanceMetrics {
  responseTime: number
  throughput: number
  errorRate: number
}

export interface AccessibilityProps {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  role?: string
  tabIndex?: number
}

export interface ResponsiveValue<T> {
  mobile?: T
  tablet?: T
  desktop?: T
}

export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface FormState {
  isValid: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  children?: NavigationItem[]
}

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export interface ModalState {
  isOpen: boolean
  data?: any
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }>
}

export interface ProgressData {
  current: number
  total: number
  percentage: number
}

export interface SearchFilters {
  query?: string
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
}
