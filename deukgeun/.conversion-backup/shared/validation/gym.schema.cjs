// ============================================================================
// Gym Validation Schema
// ============================================================================

const { z  } = require('zod')

const GymSchema = z.object({
  id: z.number(),
  name: z.string().max(255),
  address: z.string().max(255),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  facilities: z.string().optional(),
  openHour: z.string().optional(),
  is24Hours: z.boolean(),
  hasGX: z.boolean(),
  hasPT: z.boolean(),
  hasGroupPT: z.boolean(),
  hasParking: z.boolean(),
  hasShower: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
})

const CreateGymSchema = GymSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

const UpdateGymSchema = CreateGymSchema.partial()