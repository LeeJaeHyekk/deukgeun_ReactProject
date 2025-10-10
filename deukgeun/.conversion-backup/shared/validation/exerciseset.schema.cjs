// ============================================================================
// ExerciseSet Validation Schema
// ============================================================================
const { z  } = require('zod');
const ExerciseSetSchema = z.object({
    id: z.number(),
    sessionId: z.number(),
    machineId: z.number(),
    setNumber: z.number(),
    repsCompleted: z.number(),
    weightKg: z.number().optional(),
    durationSeconds: z.number().optional(),
    distanceMeters: z.number().optional(),
    rpeRating: z.number().min(1).max(10).optional(),
    notes: z.string().optional(),
    createdAt: z.date(),
});
const CreateExerciseSetSchema = ExerciseSetSchema.omit({
    id: true,
    createdAt: true,
});
const UpdateExerciseSetSchema = CreateExerciseSetSchema.partial();
