"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRateLimiter = exports.machineRateLimiter = exports.rateLimiter = void 0;
const rateLimitStore = new Map();
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress || "unknown";
        const now = Date.now();
        const existing = rateLimitStore.get(clientId);
        if (!existing || now > existing.resetTime) {
            rateLimitStore.set(clientId, {
                count: 1,
                resetTime: now + windowMs,
            });
        }
        else {
            existing.count++;
            if (existing.count > maxRequests) {
                return res.status(429).json({
                    message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
                    retryAfter: Math.ceil((existing.resetTime - now) / 1000),
                });
            }
        }
        const current = rateLimitStore.get(clientId);
        res.set({
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": Math.max(0, maxRequests - current.count).toString(),
            "X-RateLimit-Reset": new Date(current.resetTime).toISOString(),
        });
        next();
    };
};
exports.rateLimiter = rateLimiter;
exports.machineRateLimiter = (0, exports.rateLimiter)(15 * 60 * 1000, 1000);
exports.adminRateLimiter = (0, exports.rateLimiter)(15 * 60 * 1000, 500);
