/**
 * 보안 헤더 미들웨어
 */
const securityHeaders
module.exports.securityHeaders = securityHeaders = (req, res, next) => {
    // XSS Protection
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Content Type Options
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Frame Options (Clickjacking 방지)
    res.setHeader("X-Frame-Options", "DENY");
    // Strict Transport Security (HTTPS 강제)
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    // Content Security Policy
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Permissions Policy
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
};
/**
 * CORS 보안 강화 미들웨어
 */
const corsSecurity
module.exports.corsSecurity = corsSecurity = (req, res, next) => {
    // 허용된 Origin만 접근 가능
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5000",
        "https://yourdomain.com", // 프로덕션 도메인
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // Preflight 요청 처리
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }
    next();
};
