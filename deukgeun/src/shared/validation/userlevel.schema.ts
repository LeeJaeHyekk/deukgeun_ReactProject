// ============================================================================
// UserLevel Validation Schema
// ============================================================================

const { z  } = require('zod')

const UserLevelSchema = z.object({
  id: z.number(),
  userId: z.number(),
  level: z.number(),
  currentExp: z.number(),
  totalExp: z.number(),
  seasonExp: z.number(),
  totalLevelUps: z.number(),
  lastLevelUpAt: z.date().optional(),
  currentSeason: z.number(),
  seasonStartDate: z.date().optional(),
  seasonEndDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const CreateUserLevelSchema = UserLevelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

const UpdateUserLevelSchema = CreateUserLevelSchema.partial()

export type UserLevelInput = z.infer<typeof UserLevelSchema>
export type CreateUserLevelInput = z.infer<typeof CreateUserLevelSchema>
export type UpdateUserLevelInput = z.infer<typeof UpdateUserLevelSchema>
