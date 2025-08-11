// 프론트엔드 공통 타입 정의

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
  error?: string
}

export type PaginationParams = {
  page?: number
  limit?: number
  offset?: number
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ErrorResponse = {
  success: false
  message: string
  error: string
  statusCode?: number
}

// 사용자 관련 타입
export type UserRole = "user" | "admin"
export type Gender = "male" | "female" | "other"

export interface User {
  id: number
  email: string
  nickname: string
  phone?: string
  gender?: Gender
  birthday?: Date
  profileImage?: string
  role: UserRole
  accessToken?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends Omit<User, "accessToken"> {}
