const rateLimitStore = new Map();
/**
 * Rate Limiting 미들웨어
 * @param windowMs 시간 윈도우 (밀리초)
 * @param maxRequests 최대 요청 수
 */
const rateLimiter
module.exports.rateLimiter = rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress || "unknown";
        const now = Date.now();
        // 기존 정보 가져오기
        const existing = rateLimitStore.get(clientId);
        if (!existing || now > existing.resetTime) {
            // 새로운 윈도우 시작
            rateLimitStore.set(clientId, {
                count: 1,
                resetTime: now + windowMs,
            });
        }
        else {
            // 기존 윈도우에서 카운트 증가
            existing.count++;
            if (existing.count > maxRequests) {
                return res.status(429).json({
                    message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
                    retryAfter: Math.ceil((existing.resetTime - now) / 1000),
                });
            }
        }
        // Rate limit 헤더 추가
        const current = rateLimitStore.get(clientId);
        res.set({
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": Math.max(0, maxRequests - current.count).toString(),
            "X-RateLimit-Reset": new Date(current.resetTime).toISOString(),
        });
        next();
    };
};
/**
 * Machine API 전용 Rate Limiter (개발 환경에서는 관대하게)
 */
const machineRateLimiter
module.exports.machineRateLimiter = machineRateLimiter = rateLimiter(15 * 60 * 1000, 1000); // 15분에 1000회
/**
 * Admin API 전용 Rate Limiter (개발 환경에서는 관대하게)
 */
const adminRateLimiter
module.exports.adminRateLimiter = adminRateLimiter = rateLimiter(15 * 60 * 1000, 500); // 15분에 500회
