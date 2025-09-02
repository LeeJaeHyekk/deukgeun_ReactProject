import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger.js"

/**
 * 애플리케이션 에러 인터페이스
 * 기본 Error 클래스를 확장하여 HTTP 상태 코드와 운영 에러 여부를 추가합니다.
 */
export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

/**
 * 전역 에러 핸들러 미들웨어
 * 애플리케이션에서 발생하는 모든 에러를 중앙에서 처리합니다.
 * 에러 로깅과 클라이언트 응답 생성을 담당합니다.
 *
 * @param {AppError} error - 처리할 에러 객체
 * @param {Request} req - Express 요청 객체
 * @param {Response} res - Express 응답 객체
 * @param {NextFunction} next - Express 다음 미들웨어 함수 (사용하지 않음)
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  /**
   * 에러 상태 코드 결정
   * 에러 객체에 statusCode가 있으면 사용하고, 없으면 500(Internal Server Error)를 사용합니다.
   */
  const statusCode = error.statusCode || 500

  /**
   * 에러 메시지 결정
   * 에러 객체에 message가 있으면 사용하고, 없으면 기본 메시지를 사용합니다.
   */
  const message = error.message || "Internal Server Error"

  /**
   * 에러 로깅
   * 에러 정보와 요청 정보를 함께 로그로 기록합니다.
   * 디버깅과 모니터링에 활용됩니다.
   */
  logger.error(`Error ${statusCode}: ${message}`, {
    error: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  })

  /**
   * 클라이언트 응답 생성
   * 에러 정보를 JSON 형태로 클라이언트에 전송합니다.
   * 개발 환경에서는 스택 트레이스도 포함합니다.
   */
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
  })
}
