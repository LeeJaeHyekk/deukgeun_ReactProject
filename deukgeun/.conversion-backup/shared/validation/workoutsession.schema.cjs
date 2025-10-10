// ============================================================================
// WorkoutSession Validation Schema
// ============================================================================
const { z  } = require('zod');
const WorkoutSessionSchema = z.object({
    id: z.number(),
    userId: z.number(),
    planId: z.number().optional(),
    gymId: z.number().optional(),
    name: z.string().max(100),
    startTime: z.date(),
    endTime: z.date().optional(),
    totalDurationMinutes: z.number().optional(),
    moodRating: z.number().min(1).max(5).optional(),
    energyLevel: z.number().min(1).max(5).optional(),
    notes: z.string().optional(),
    status: z.enum(["in_progress", "completed", "paused", "cancelled"]),
    createdAt: z.date(),
    updatedAt: z.date(),
});
const CreateWorkoutSessionSchema = WorkoutSessionSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
const UpdateWorkoutSessionSchema = CreateWorkoutSessionSchema.partial();
