// ============================================================================
// Like Validation Schema
// ============================================================================

import { z } from "zod"

export const LikeSchema = z.object({
  id: z.number(),
  postId: z.number(),
  userId: z.number(),
  createdAt: z.date()
})

export const CreateLikeSchema = LikeSchema.omit({
  createdAt: true
})

export const UpdateLikeSchema = CreateLikeSchema.partial()

export type LikeInput = z.infer<typeof LikeSchema>
export type CreateLikeInput = z.infer<typeof CreateLikeSchema>
export type UpdateLikeInput = z.infer<typeof UpdateLikeSchema>
