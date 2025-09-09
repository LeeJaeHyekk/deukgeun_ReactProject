// ============================================================================
// 유효성 검사 미들웨어
// ============================================================================

import { Request, Response, NextFunction } from "express"
import { z } from "zod"

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 요청 본문, 쿼리, 파라미터를 모두 검증
      const data = {
        body: req.body,
        query: req.query,
        params: req.params,
      }

      const validatedData = schema.parse(data)

      // 검증된 데이터를 요청 객체에 할당
      req.body = validatedData.body || req.body
      req.query = validatedData.query || req.query
      req.params = validatedData.params || req.params

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
}

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join("."),
          message: err.message,
        }))

        return res.status(400).json({
          success: false,
          error: "Request body validation failed",
          details: errorMessages,
        })
      }

      next(error)
    }
  }
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join("."),
          message: err.message,
        }))

        return res.status(400).json({
          success: false,
          error: "Query parameters validation failed",
          details: errorMessages,
        })
      }

      next(error)
    }
  }
}

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join("."),
          message: err.message,
        }))

        return res.status(400).json({
          success: false,
          error: "URL parameters validation failed",
          details: errorMessages,
        })
      }

      next(error)
    }
  }
}
