// ============================================================================
// 유효성 검사 스키마
// ============================================================================

import { z } from "zod"

// 사용자 관련 스키마
export const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
})

export const registerSchema = z
  .object({
    email: z.string().email("유효한 이메일 주소를 입력해주세요"),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다"
      ),
    confirmPassword: z.string(),
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  })

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다").optional(),
  email: z.string().email("유효한 이메일 주소를 입력해주세요").optional(),
  bio: z.string().max(500, "자기소개는 500자 이하여야 합니다").optional(),
})

// 워크아웃 관련 스키마
export const workoutSchema = z.object({
  name: z.string().min(1, "운동 이름을 입력해주세요"),
  sets: z.number().min(1, "세트 수는 1 이상이어야 합니다"),
  reps: z.number().min(1, "반복 수는 1 이상이어야 합니다"),
  weight: z.number().min(0, "무게는 0 이상이어야 합니다"),
  duration: z.number().min(0, "시간은 0 이상이어야 합니다").optional(),
  notes: z.string().max(1000, "메모는 1000자 이하여야 합니다").optional(),
})

export const workoutPlanSchema = z.object({
  name: z.string().min(1, "운동 계획 이름을 입력해주세요"),
  description: z.string().max(1000, "설명은 1000자 이하여야 합니다").optional(),
  exercises: z.array(workoutSchema).min(1, "최소 1개의 운동이 필요합니다"),
})

// 커뮤니티 관련 스키마
export const postSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이하여야 합니다"),
  content: z
    .string()
    .min(1, "내용을 입력해주세요")
    .max(1000, "내용은 1000자 이하여야 합니다"),
  tags: z
    .array(z.string())
    .max(10, "태그는 최대 10개까지 가능합니다")
    .optional(),
  images: z
    .array(z.string())
    .max(5, "이미지는 최대 5개까지 가능합니다")
    .optional(),
})

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용을 입력해주세요")
    .max(500, "댓글은 500자 이하여야 합니다"),
  parentId: z.string().optional(),
})

// 헬스장 관련 스키마
export const gymReviewSchema = z.object({
  rating: z
    .number()
    .min(1, "평점은 1 이상이어야 합니다")
    .max(5, "평점은 5 이하여야 합니다"),
  content: z
    .string()
    .min(1, "리뷰 내용을 입력해주세요")
    .max(1000, "리뷰는 1000자 이하여야 합니다"),
  facilities: z.array(z.string()).optional(),
  cleanliness: z.number().min(1).max(5).optional(),
  staff: z.number().min(1).max(5).optional(),
  value: z.number().min(1).max(5).optional(),
})

// 타입 추출
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type WorkoutFormData = z.infer<typeof workoutSchema>
export type WorkoutPlanFormData = z.infer<typeof workoutPlanSchema>
export type PostFormData = z.infer<typeof postSchema>
export type CommentFormData = z.infer<typeof commentSchema>
export type GymReviewFormData = z.infer<typeof gymReviewSchema>
