// ============================================================================
// UserDTO - Data Transfer Object
// ============================================================================

export interface UserDTO {
  id: number
  email: string
  nickname: string
  phone?: string
  gender?: unknown
  birthday?: Date
  profileImage?: string
  role: unknown
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  name?: string
  username?: string
  lastLoginAt?: Date
  lastActivityAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new User)
export interface CreateUserDTO {
  id: number
  email: string
  nickname: string
  phone?: string
  gender?: unknown
  birthday?: Date
  profileImage?: string
  role: unknown
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  name?: string
  username?: string
}

// Update DTO (for updating existing User)
export interface UpdateUserDTO {
  id?: number
  email?: string
  nickname?: string
  phone?: string
  gender?: unknown
  birthday?: Date
  profileImage?: string
  role?: unknown
  isActive?: boolean
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  name?: string
  username?: string
}

// Response DTO (for API responses)
export interface UserDTOResponse {
  success: boolean
  data?: UserDTO
  message?: string
  error?: string
}

// List Response DTO
export interface UserDTOListResponse {
  success: boolean
  data?: UserDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
