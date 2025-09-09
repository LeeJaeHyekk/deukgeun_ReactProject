// ============================================================================
// 인증 관련 타입 정의
// ============================================================================

export interface User {
  id: number
  email: string
  name?: string
  nickname: string
  phone?: string
  level: number
  exp: number
  maxExp?: number
  experience?: number
  maxExperience?: number
  isEmailVerified: boolean
  role: "user" | "admin" | "moderator"
  profileImage?: string
  avatar?: string
  bio?: string
  birthDate?: string
  gender?: string
  accessToken?: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshResponse {
  success: boolean
  accessToken: string
}

export interface LogoutResponse {
  success: boolean
  message: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  updateUser: (userData: Partial<User>) => void
  isLoggedIn: boolean
}
