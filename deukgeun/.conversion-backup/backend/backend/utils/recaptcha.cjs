"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRecaptcha = verifyRecaptcha;
exports.validateRecaptchaConfig = validateRecaptchaConfig;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require('utils/logger');
async function verifyRecaptcha(token) {
    try {
        if (!token) {
            logger_1.logger.warn("reCAPTCHA 토큰이 없습니다.");
            return false;
        }
        if (process.env.NODE_ENV === "development") {
            if (token.includes("dummy-token") || token.includes("test-token")) {
                logger_1.logger.info("개발 환경에서 더미 reCAPTCHA 토큰 허용");
                return true;
            }
        }
        const secret = process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET;
        if (!secret || secret === "") {
            if (process.env.NODE_ENV === "development") {
                logger_1.logger.warn("개발 환경에서 reCAPTCHA 시크릿 키가 설정되지 않았지만 더미 토큰 허용");
                return true;
            }
            logger_1.logger.error("reCAPTCHA 시크릿 키가 설정되지 않았습니다.");
            return false;
        }
        const response = await axios_1.default.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret,
                response: token,
            },
            timeout: 10000,
        });
        if (!response.data.success) {
            logger_1.logger.warn("reCAPTCHA 검증 실패:", {
                errorCodes: response.data["error-codes"],
                token: token.substring(0, 20) + "...",
            });
            return false;
        }
        if (response.data.score !== undefined) {
            const score = response.data.score;
            const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");
            if (score < minScore) {
                logger_1.logger.warn("reCAPTCHA 점수가 너무 낮습니다:", { score, minScore });
                return false;
            }
            logger_1.logger.info("reCAPTCHA 검증 성공:", { score, minScore });
        }
        else {
            logger_1.logger.info("reCAPTCHA 검증 성공");
        }
        return true;
    }
    catch (error) {
        logger_1.logger.error("reCAPTCHA 인증 실패:", error);
        if (process.env.NODE_ENV === "development") {
            logger_1.logger.warn("개발 환경에서 네트워크 오류 시 더미 토큰 허용");
            return true;
        }
        return false;
    }
}
function validateRecaptchaConfig() {
    const secret = process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET;
    if (!secret || secret === "") {
        if (process.env.NODE_ENV === "development") {
            logger_1.logger.warn("개발 환경: reCAPTCHA 시크릿 키가 설정되지 않음 (더미 토큰 사용)");
            return true;
        }
        logger_1.logger.error("프로덕션 환경: reCAPTCHA 시크릿 키가 설정되지 않음");
        return false;
    }
    return true;
}
