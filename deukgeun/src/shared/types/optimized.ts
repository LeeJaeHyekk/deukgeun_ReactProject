// ============================================================================
// 최적화된 타입 시스템
// 중복 제거 및 일관성 향상을 위한 통합 타입 정의
// ============================================================================

// 공통 API 응답 타입
export interface OptimizedApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
  timestamp?: number
}

// 페이지네이션 타입
export interface OptimizedPaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface OptimizedPaginatedResponse<T>
  extends OptimizedApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 로딩 상태 타입
export interface OptimizedLoadingState {
  isLoading: boolean
  isRefreshing?: boolean
  isInitialLoading?: boolean
}

// 에러 상태 타입
export interface OptimizedErrorState {
  error: string | null
  retryCount?: number
  lastErrorTime?: number
}

// 캐시 관련 타입
export interface OptimizedCacheConfig {
  duration: number
  maxSize?: number
  strategy?: 'memory' | 'localStorage' | 'sessionStorage'
}

export interface OptimizedCacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  accessCount: number
}

// 필터링 관련 타입
export interface OptimizedFilterState {
  activeFilters: Record<string, any>
  searchQuery: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

// 성능 메트릭 타입
export interface OptimizedPerformanceMetrics {
  loadTime: number
  renderTime: number
  apiCallTime: number
  cacheHitRate: number
}

// 유틸리티 타입들
export type OptimizedOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>
export type OptimizedRequired<T, K extends keyof T> = T & Required<Pick<T, K>>
export type OptimizedDeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? OptimizedDeepPartial<T[P]> : T[P]
}

// 함수 타입들
export type OptimizedAsyncFunction<T, R> = (params: T) => Promise<R>
export type OptimizedCallback<T> = (value: T) => void
export type OptimizedErrorHandler = (error: Error) => void

// 이벤트 타입들
export interface OptimizedEventEmitter<T = any> {
  emit: (event: string, data?: T) => void
  on: (event: string, callback: OptimizedCallback<T>) => void
  off: (event: string, callback: OptimizedCallback<T>) => void
}

// 설정 타입들
export interface OptimizedAppConfig {
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
    retryDelay: number
  }
  cache: OptimizedCacheConfig
  performance: {
    enableMetrics: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
}

// 상태 관리 타입들
export interface OptimizedStateManager<T> {
  state: T
  setState: (newState: Partial<T> | ((prev: T) => T)) => void
  subscribe: (callback: OptimizedCallback<T>) => () => void
  getState: () => T
}

// 검색 관련 타입들
export interface OptimizedSearchParams {
  query: string
  filters?: Record<string, any>
  pagination?: OptimizedPaginationParams
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
}

export interface OptimizedSearchResult<T> {
  items: T[]
  total: number
  pagination: OptimizedPaginatedResponse<T>['pagination']
  searchTime: number
  suggestions?: string[]
}

// 폼 관련 타입들
export interface OptimizedFormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

export interface OptimizedFormConfig<T> {
  initialValues: T
  validation?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<void> | void
}

// 모달/다이얼로그 타입들
export interface OptimizedModalState {
  isOpen: boolean
  data?: any
  onClose?: () => void
  onConfirm?: (data?: any) => void
}

// 알림/토스트 타입들
export interface OptimizedNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// 테마 관련 타입들
export interface OptimizedTheme {
  colors: {
    primary: string
    secondary: string
    success: string
    error: string
    warning: string
    info: string
    background: string
    surface: string
    text: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
  }
}

// 접근성 관련 타입들
export interface OptimizedA11yConfig {
  skipLinks: boolean
  focusManagement: boolean
  screenReaderSupport: boolean
  keyboardNavigation: boolean
  highContrast: boolean
}

// 국제화 관련 타입들
export interface OptimizedI18nConfig {
  defaultLocale: string
  supportedLocales: string[]
  fallbackLocale: string
  namespace: string
}

export interface OptimizedTranslation {
  [key: string]: string | OptimizedTranslation
}

// 개발 도구 관련 타입들
export interface OptimizedDevTools {
  enableReduxDevTools: boolean
  enableReactDevTools: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  enablePerformanceMonitoring: boolean
}

// 환경 설정 타입들
export interface OptimizedEnvironment {
  NODE_ENV: 'development' | 'production' | 'test'
  API_BASE_URL: string
  ENABLE_ANALYTICS: boolean
  ENABLE_ERROR_REPORTING: boolean
  VERSION: string
  BUILD_TIME: string
}
