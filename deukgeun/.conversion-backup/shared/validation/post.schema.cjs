// ============================================================================
// Post Validation Schema
// ============================================================================

const { z  } = require('zod')

const PostSchema = z.object({
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

const CreatePostSchema = PostSchema.omit({
  id: true,
  likeCount: true,
  commentCount: true,
  createdAt: true,
  updatedAt: true,
})

const UpdatePostSchema = CreatePostSchema.partial()