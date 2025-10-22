// ============================================================================
// Like Validation Schema
// ============================================================================

const { z  } = require('zod')

const LikeSchema = z.object({
  id: z.number(),
  postId: z.number(),
  userId: z.number(),
  createdAt: z.date()
})

const CreateLikeSchema = LikeSchema.omit({
  createdAt: true
})

const UpdateLikeSchema = CreateLikeSchema.partial()