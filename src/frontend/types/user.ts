// ============================================================================
// 사용자 관련 타입 정의
// ============================================================================

export interface User {
  id: number
  email: string
  nickname: string
  profileImage?: string
  level: number
  experience: number
  maxExperience: number
  createdAt: Date
  updatedAt: Date
  accessToken?: string
}

export interface UserProfile {
  id: number
  email: string
  nickname: string
  profileImage?: string
  level: number
  experience: number
  maxExperience: number
  bio?: string
  preferences?: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: "light" | "dark"
  language: "ko" | "en"
  notifications: {
    email: boolean
    push: boolean
    workout: boolean
    community: boolean
  }
  privacy: {
    profileVisibility: "public" | "friends" | "private"
    workoutVisibility: "public" | "friends" | "private"
  }
}

export interface UserStats {
  totalWorkouts: number
  totalSessions: number
  totalGoals: number
  completedGoals: number
  currentStreak: number
  totalExp: number
  level: number
}

export interface UserAchievement {
  id: number
  userId: number
  achievementId: number
  unlockedAt: Date
  progress: number
  isCompleted: boolean
}

export interface CreateUserRequest {
  email: string
  password: string
  nickname: string
  profileImage?: string
}

export interface UpdateUserRequest {
  nickname?: string
  profileImage?: string
  bio?: string
  preferences?: Partial<UserPreferences>
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}