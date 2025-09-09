// API 관련 타입 정의

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export interface ApiListResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  retryDelay?: number
}

export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

export interface SearchParams {
  query?: string
  filters?: Record<string, any>
  pagination?: PaginationParams
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  requiresAuth?: boolean
  requiresAdmin?: boolean
}
