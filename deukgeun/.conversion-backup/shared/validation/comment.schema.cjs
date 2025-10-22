// ============================================================================
// Comment Validation Schema
// ============================================================================

const { z  } = require('zod')

const CommentSchema = z.object({
  id: z.number(),
  postId: z.number(),
  userId: z.number(),
  author: z.string().max(100),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const CreateCommentSchema = CommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

const UpdateCommentSchema = CreateCommentSchema.partial()