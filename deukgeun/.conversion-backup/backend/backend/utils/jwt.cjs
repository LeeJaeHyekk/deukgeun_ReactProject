"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokens = createTokens;
exports.verifyRefreshToken = verifyRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require('utils/logger');
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET ||
    "default-access-secret-key-2024-development-only";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET ||
    "default-refresh-secret-key-2024-development-only";
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.warn("⚠️  JWT secrets not set in environment variables. Using default secrets for development.");
    console.warn("⚠️  Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env file for production.");
}
function createTokens(userId, role) {
    try {
        const accessToken = jsonwebtoken_1.default.sign({ userId, role }, ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        });
        return { accessToken, refreshToken };
    }
    catch (error) {
        logger_1.logger.error("토큰 생성 실패:", error);
        throw new Error("토큰 생성에 실패했습니다.");
    }
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        logger_1.logger.warn("Refresh token 검증 실패:", error);
        return null;
    }
}
function verifyAccessToken(token) {
    try {
        console.log("🔐 Access token 검증 시작");
        console.log("🔐 토큰:", token.substring(0, 20) + "...");
        console.log("🔐 시크릿 키:", ACCESS_TOKEN_SECRET ? "설정됨" : "설정되지 않음");
        const result = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        console.log("🔐 토큰 검증 성공:", result);
        return result;
    }
    catch (error) {
        console.error("🔐 Access token 검증 실패:", error.message);
        if (error.name === "TokenExpiredError") {
            console.error("🔐 토큰 만료됨");
        }
        else if (error.name === "JsonWebTokenError") {
            console.error("🔐 JWT 형식 오류");
        }
        else if (error.name === "NotBeforeError") {
            console.error("🔐 토큰이 아직 유효하지 않음");
        }
        logger_1.logger.warn("Access token 검증 실패:", error);
        return null;
    }
}
