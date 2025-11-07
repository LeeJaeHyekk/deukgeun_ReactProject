"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authMiddleware = void 0;
exports.optionalAuth = optionalAuth;
const jwt_1 = require('../utils/jwt.cjs');
const logger_1 = require('../utils/logger.cjs');
const authMiddleware = (req, res, next) => {
    const requestId = Math.random().toString(36).substring(2, 15);
    console.log(`🔐 [AuthMiddleware:${requestId}] 인증 미들웨어 시작`);
    console.log(`🔐 [AuthMiddleware:${requestId}] 요청 URL: ${req.method} ${req.url}`);
    try {
        const authHeader = req.headers["authorization"];
        console.log(`🔐 [AuthMiddleware:${requestId}] Authorization 헤더:`, authHeader ? `${authHeader.substring(0, 30)}...` : "없음");
        const token = authHeader && authHeader.split(" ")[1];
        console.log(`🔐 [AuthMiddleware:${requestId}] 추출된 토큰:`, token ? `${token.substring(0, 20)}...` : "없음");
        if (!token) {
            console.log(`🔐 [AuthMiddleware:${requestId}] 토큰 없음 - 401 반환`);
            return res.status(401).json({ message: "액세스 토큰이 필요합니다." });
        }
        console.log(`🔐 [AuthMiddleware:${requestId}] 토큰 검증 시작`);
        const payload = (0, jwt_1.verifyAccessToken)(token);
        console.log(`🔐 [AuthMiddleware:${requestId}] 토큰 검증 결과:`, payload);
        if (!payload) {
            console.log(`🔐 [AuthMiddleware:${requestId}] 토큰 검증 실패 - 403 반환`);
            return res.status(403).json({
                message: "유효하지 않은 토큰입니다.",
                error: "INVALID_TOKEN",
            });
        }
        if (req.params.userId) {
            const requestedUserId = parseInt(req.params.userId);
            if (isNaN(requestedUserId)) {
                console.log(`🔐 [AuthMiddleware:${requestId}] 잘못된 사용자 ID 형식`);
                return res.status(400).json({
                    message: "잘못된 사용자 ID 형식입니다.",
                    error: "INVALID_USER_ID",
                });
            }
            if (payload.userId !== requestedUserId && payload.role !== "admin") {
                console.log(`🔐 [AuthMiddleware:${requestId}] 권한 없음 - 사용자 ID 불일치`);
                console.log(`🔐 [AuthMiddleware:${requestId}] 요청된 사용자 ID: ${requestedUserId}`);
                console.log(`🔐 [AuthMiddleware:${requestId}] 토큰의 사용자 ID: ${payload.userId}`);
                console.log(`🔐 [AuthMiddleware:${requestId}] 사용자 역할: ${payload.role}`);
                return res.status(403).json({
                    message: "다른 사용자의 데이터에 접근할 권한이 없습니다.",
                    error: "INSUFFICIENT_PERMISSIONS",
                });
            }
        }
        req.user = payload;
        console.log(`🔐 [AuthMiddleware:${requestId}] 인증 성공, 사용자 정보 설정:`, req.user);
        next();
    }
    catch (error) {
        console.error(`🔐 [AuthMiddleware:${requestId}] 토큰 인증 중 오류:`, error);
        logger_1.logger.error("토큰 인증 중 오류:", error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.authMiddleware = authMiddleware;
function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token) {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            if (payload) {
                req.user = payload;
            }
        }
        next();
    }
    catch (error) {
        logger_1.logger.error("선택적 인증 중 오류:", error);
        next();
    }
}
const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "관리자만 접근할 수 있습니다." });
    }
    next();
};
exports.isAdmin = isAdmin;
