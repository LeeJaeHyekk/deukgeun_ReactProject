// ============================================================================
// MIX 유효성 검사 미들웨어
// ============================================================================

import { Request, Response, NextFunction } from "express"
import { z } from "zod"

// MIX 데이터 유효성 검사 스키마
const mixValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "이름은 필수입니다"),
    category: z.string().min(1, "카테고리는 필수입니다"),
    muscleGroups: z
      .array(z.string())
      .min(1, "근육 그룹은 최소 1개 이상이어야 합니다"),
    equipment: z.string().optional(),
    instructions: z.array(z.string()).optional(),
    tips: z.array(z.string()).optional(),
  }),
})

export function mixValidation(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = mixValidationSchema.parse({
      body: req.body,
    })

    req.body = validatedData.body
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
      }))

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errorMessages,
      })
    }

    next(error)
  }
}

// 머신 생성 유효성 검사
export function validateMachine(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return mixValidation(req, res, next)
}

// 머신 업데이트 유효성 검사
export function validateMachineUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return mixValidation(req, res, next)
}
