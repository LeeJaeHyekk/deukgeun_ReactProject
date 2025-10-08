// ============================================================================
// ExpHistory Validation Schema
// ============================================================================

const { z  } = require('zod')

const ExpHistorySchema = z.object({
  id: z.number(),
  userId: z.number(),
  actionType: z.enum([
    "workout_complete",
    "workout_streak",
    "goal_achieved",
    "post_created",
    "comment_created",
    "like_received",
    "daily_login",
    "weekly_challenge",
    "monthly_milestone",
  ]),
  expGained: z.number(),
  source: z.string().max(100),
  metadata: z.record(z.string(), z.unknown()).optional(),
  levelBefore: z.number().optional(),
  levelAfter: z.number().optional(),
  isLevelUp: z.boolean(),
  createdAt: z.date(),
})

const CreateExpHistorySchema = ExpHistorySchema.omit({
  id: true,
  createdAt: true,
})

const UpdateExpHistorySchema = CreateExpHistorySchema.partial()

export type ExpHistoryInput = z.infer<typeof ExpHistorySchema>
export type CreateExpHistoryInput = z.infer<typeof CreateExpHistorySchema>
export type UpdateExpHistoryInput = z.infer<typeof UpdateExpHistorySchema>
