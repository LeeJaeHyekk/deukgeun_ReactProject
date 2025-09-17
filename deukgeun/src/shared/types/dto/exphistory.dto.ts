// ============================================================================
// ExpHistoryDTO - Data Transfer Object
// ============================================================================

// 순환 import 방지를 위해 shared 타입 사용
// import type { ExpActionType } from "../../../backend/types"

// ExpActionType을 직접 정의하여 순환 import 방지 (백엔드 타입과 일치)
export type ExpActionType =
  | 'workout_complete'
  | 'workout_streak'
  | 'goal_achieved'
  | 'post_created'
  | 'comment_created'
  | 'like_received'
  | 'daily_login'
  | 'weekly_challenge'
  | 'monthly_milestone'

export interface ExpHistoryDTO {
  id: number
  userId: number
  actionType: ExpActionType
  expGained: number
  source: string
  metadata?: Record<string, unknown>
  levelBefore?: number
  levelAfter?: number
  isLevelUp: boolean
  createdAt: Date
}

// Create DTO (for creating new ExpHistory)
export interface CreateExpHistoryDTO {
  id: number
  userId: number
  actionType: ExpActionType
  expGained: number
  source: string
  metadata?: Record<string, unknown>
  levelBefore?: number
  levelAfter?: number
  isLevelUp: boolean
}

// Update DTO (for updating existing ExpHistory)
export interface UpdateExpHistoryDTO {
  id?: number
  userId?: number
  actionType?: ExpActionType
  expGained?: number
  source?: string
  metadata?: Record<string, unknown>
  levelBefore?: number
  levelAfter?: number
  isLevelUp?: boolean
}

// Response DTO (for API responses)
export interface ExpHistoryDTOResponse {
  success: boolean
  data?: ExpHistoryDTO
  message?: string
  error?: string
}

// List Response DTO
export interface ExpHistoryDTOListResponse {
  success: boolean
  data?: ExpHistoryDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
