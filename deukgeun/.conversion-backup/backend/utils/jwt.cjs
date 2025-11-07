"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokens = createTokens;
exports.verifyRefreshToken = verifyRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.hashRefreshToken = hashRefreshToken;
exports.compareRefreshToken = compareRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("./logger.cjs");
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET ||
    "default-access-secret-key-2024-development-only";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET ||
    "default-refresh-secret-key-2024-development-only";
const ACCESS_TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_EXPIRY || "7d";
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.warn("⚠️  JWT secrets not set in environment variables. Using default secrets for development.");
    console.warn("⚠️  Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env file for production.");
}
function createTokens(userId, role) {
    try {
        const accessToken = jsonwebtoken_1.default.sign({ userId, role }, ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, REFRESH_TOKEN_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY,
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
        console.log("🔐 토큰 길이:", token.length);
        console.log("🔐 토큰 시작:", token.substring(0, 20) + "...");
        console.log("🔐 토큰 끝:", "..." + token.substring(token.length - 20));
        console.log("🔐 토큰 부분 수:", token.split('.').length);
        console.log("🔐 시크릿 키 길이:", ACCESS_TOKEN_SECRET?.length || 0);
        console.log("🔐 시크릿 키 시작:", ACCESS_TOKEN_SECRET?.substring(0, 10) + "...");
        const result = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        console.log("🔐 토큰 검증 성공:", result);
        return result;
    }
    catch (error) {
        console.error("🔐 Access token 검증 실패:", error.message);
        console.error("🔐 에러 타입:", error.name);
        console.error("🔐 에러 스택:", error.stack);
        if (error.name === "TokenExpiredError") {
            console.error("🔐 토큰 만료됨 - 만료 시간:", error.expiredAt);
        }
        else if (error.name === "JsonWebTokenError") {
            console.error("🔐 JWT 형식 오류 - 잘못된 토큰 구조");
        }
        else if (error.name === "NotBeforeError") {
            console.error("🔐 토큰이 아직 유효하지 않음 - 활성화 시간:", error.date);
        }
        else if (error.name === "SyntaxError") {
            console.error("🔐 토큰 파싱 오류 - JSON 형식 문제");
        }
        logger_1.logger.warn("Access token 검증 실패:", error);
        return null;
    }
}
const REFRESH_TOKEN_HASH_ROUNDS = 10;
async function hashRefreshToken(token) {
    return bcrypt_1.default.hash(token, REFRESH_TOKEN_HASH_ROUNDS);
}
async function compareRefreshToken(token, hash) {
    return bcrypt_1.default.compare(token, hash);
}
