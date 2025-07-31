import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

/**
 * 인증된 요청을 위한 Request 인터페이스 확장
 * JWT 토큰에서 추출한 사용자 정보를 req.user에 저장합니다.
 */
interface AuthRequest extends Request {
  user?: any;
}

/**
 * JWT 토큰 기반 인증 미들웨어
 * 요청 헤더의 Authorization 토큰을 검증하여 사용자 인증을 처리합니다.
 *
 * @param {AuthRequest} req - 확장된 Express 요청 객체
 * @param {Response} res - Express 응답 객체
 * @param {NextFunction} next - Express 다음 미들웨어 함수
 */
export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     * "Bearer <token>" 형태에서 토큰 부분만 분리합니다.
     */
    const token = req.header("Authorization")?.replace("Bearer ", "");

    /**
     * 토큰이 존재하지 않는 경우 401 Unauthorized 응답
     */
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    /**
     * JWT 토큰 검증 및 디코딩
     * config.JWT_SECRET를 사용하여 토큰의 유효성을 확인합니다.
     */
    const decoded = jwt.verify(token, config.JWT_SECRET);

    /**
     * 디코딩된 사용자 정보를 요청 객체에 저장
     * 이후 미들웨어에서 req.user로 접근할 수 있습니다.
     */
    req.user = decoded;

    /**
     * 인증 성공 시 다음 미들웨어로 진행
     */
    next();
  } catch (error) {
    /**
     * 토큰 검증 실패 시 400 Bad Request 응답
     * 잘못된 토큰이나 만료된 토큰의 경우입니다.
     */
    res.status(400).json({ message: "Invalid token." });
  }
};
