// ============================================================================
// Gym Validation Schema
// ============================================================================

import { z } from "zod"

export const GymSchema = z.object({
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

export const CreateGymSchema = GymSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const UpdateGymSchema = CreateGymSchema.partial()

export type GymInput = z.infer<typeof GymSchema>
export type CreateGymInput = z.infer<typeof CreateGymSchema>
export type UpdateGymInput = z.infer<typeof UpdateGymSchema>
