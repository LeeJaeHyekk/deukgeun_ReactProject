// ============================================================================
// Post Validation Schema
// ============================================================================

import { z } from "zod"

export const PostSchema = z.object({
  id: z.number(),
  title: z.string().max(255),
  content: z.string(),
  author: z.string().max(100),
  userId: z.number(),
  category: z.enum(["운동루틴", "팁", "다이어트", "기구가이드", "기타"]),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().max(255).optional(),
  images: z.array(z.string()).optional(),
  likeCount: z.number(),
  commentCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreatePostSchema = PostSchema.omit({
  id: true,
  likeCount: true,
  commentCount: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdatePostSchema = CreatePostSchema.partial()

export type PostInput = z.infer<typeof PostSchema>
export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>
