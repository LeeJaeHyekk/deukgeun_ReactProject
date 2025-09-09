// ============================================================================
// 에러 핸들러 미들웨어 (앱 레벨)
// ============================================================================

import { Request, Response, NextFunction } from "express"
import { errorHandler as sharedErrorHandler } from "../../shared/middlewares/errorHandler.js"

export {
  errorHandler as sharedErrorHandler,
  notFoundHandler,
  asyncHandler,
} from "../../shared/middlewares/errorHandler.js"

// 앱 레벨 에러 핸들러
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 공유 에러 핸들러 사용
  return sharedErrorHandler(error, req, res, next)
}
