import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { logger } from "./logger";

const ACCESS_TOKEN_SECRET = config.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = config.JWT_REFRESH_SECRET;

export function createTokens(userId: number) {
  try {
    const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error("토큰 생성 실패:", error);
    throw new Error("토큰 생성에 실패했습니다.");
  }
}

export function verifyRefreshToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: number };
  } catch (error) {
    logger.warn("Refresh token 검증 실패:", error);
    return null;
  }
}

export function verifyAccessToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: number };
  } catch (error) {
    logger.warn("Access token 검증 실패:", error);
    return null;
  }
}
