// 프론트엔드 전용 인증 타입 정의
export interface User {
  id: string
  email: string
  nickname: string
  profileImage?: string
  level: number
  experience: number
  maxExperience: number
  role: string // 필수 속성으로 변경
  name: string // 필수 속성으로 변경
  phone?: string
  gender?: "male" | "female" | "other"
  birthDate?: string
  isActive?: boolean
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  createdAt: Date
  updatedAt: Date
  accessToken?: string // shared hooks 호환성을 위해 추가
}

export interface AuthUser extends User {
  accessToken: string
}

export interface LoginRequest {
  email: string
  password: string
  recaptchaToken: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  nickname: string // 추가
  name: string // 추가
  phone: string
  gender: "male" | "female" | "other" // 추가
  birthDate: string // birthday → birthDate로 일관성 유지
  recaptchaToken: string
}

export interface RegisterResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken: string
}

export interface LogoutResponse {
  message: string
  success: boolean
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (user: User, accessToken: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}
