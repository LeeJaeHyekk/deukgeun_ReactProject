// ============================================================================
// Comment Validation Schema
// ============================================================================

import { z } from "zod"

export const CommentSchema = z.object({
  id: z.number(),
  postId: z.number(),
  userId: z.number(),
  author: z.string().max(100),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateCommentSchema = CommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateCommentSchema = CreateCommentSchema.partial()

export type CommentInput = z.infer<typeof CommentSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>
