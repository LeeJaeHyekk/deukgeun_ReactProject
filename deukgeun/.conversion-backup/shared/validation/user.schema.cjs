// ============================================================================
// User Validation Schema
// ============================================================================

const { z  } = require('zod')

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  nickname: z.string().min(2).max(20),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthday: z.date().optional(),
  profileImage: z.string().url().optional(),
  role: z.enum(["user", "admin", "moderator"]),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  isPhoneVerified: z.boolean(),
  name: z.string().optional(),
  username: z.string().optional(),
  lastLoginAt: z.date().optional(),
  lastActivityAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const CreateUserSchema = UserSchema.omit({
  id: true,
  lastLoginAt: true,
  lastActivityAt: true,
  createdAt: true,
  updatedAt: true,
})

const UpdateUserSchema = CreateUserSchema.partial()