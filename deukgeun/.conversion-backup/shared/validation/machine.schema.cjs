// ============================================================================
// Machine Validation Schema
// ============================================================================
const { z  } = require('zod');
const MachineSchema = z.object({
    id: z.number(),
    machineKey: z.string().max(100),
    name: z.string().max(100),
    nameKo: z.string().max(100).optional(),
    nameEn: z.string().max(100).optional(),
    imageUrl: z.string().url().max(255),
    shortDesc: z.string().max(255),
    detailDesc: z.string(),
    positiveEffect: z.string().optional(),
    category: z.enum([
        "cardio",
        "strength",
        "flexibility",
        "balance",
        "functional",
        "rehabilitation",
        "상체",
        "하체",
        "전신",
        "기타",
    ]),
    targetMuscles: z.array(z.string()).optional(),
    difficulty: z.enum([
        "beginner",
        "intermediate",
        "advanced",
        "expert",
        "초급",
        "중급",
        "고급",
    ]),
    videoUrl: z.string().url().max(255).optional(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
const CreateMachineSchema = MachineSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
const UpdateMachineSchema = CreateMachineSchema.partial();
