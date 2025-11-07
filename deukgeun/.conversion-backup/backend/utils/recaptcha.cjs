"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRecaptcha = verifyRecaptcha;
exports.validateRecaptchaConfig = validateRecaptchaConfig;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger.cjs");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 2 * 60 * 1000;
const MAX_CACHE_SIZE = 10000;
const requestTracker = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
function cleanupCache() {
    const now = Date.now();
    for (const [tokenHash, timestamp] of tokenCache.entries()) {
        if (now - timestamp > TOKEN_CACHE_TTL) {
            tokenCache.delete(tokenHash);
        }
    }
    if (tokenCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(tokenCache.entries());
        entries.sort((a, b) => a[1] - b[1]);
        const toDelete = entries.slice(0, tokenCache.size - MAX_CACHE_SIZE);
        toDelete.forEach(([tokenHash]) => tokenCache.delete(tokenHash));
    }
    for (const [ip, data] of requestTracker.entries()) {
        if (now > data.resetTime) {
            requestTracker.delete(ip);
        }
    }
}
function hashToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}
function checkRateLimit(ip) {
    const now = Date.now();
    const tracker = requestTracker.get(ip);
    if (!tracker || now > tracker.resetTime) {
        requestTracker.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (tracker.count >= RATE_LIMIT_MAX_REQUESTS) {
        logger_1.logger.warn(`Rate limit 초과 - IP: ${ip}, 요청 횟수: ${tracker.count}`);
        return false;
    }
    tracker.count++;
    return true;
}
function writeRecaptchaLog(level, message, data) {
    const logDir = path.join(process.cwd(), "logs");
    const logFile = path.join(logDir, "recaptcha.log");
    if (!fs.existsSync(logDir)) {
        try {
            fs.mkdirSync(logDir, { recursive: true });
        }
        catch (error) {
            logger_1.logger.warn("로그 디렉토리 생성 실패:", error);
            return;
        }
    }
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data: data || {},
        environment: process.env.NODE_ENV || "development",
        mode: process.env.MODE || "development",
    };
    try {
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n", "utf-8");
    }
    catch (error) {
        logger_1.logger.warn("reCAPTCHA 로그 파일 기록 실패:", error);
    }
}
function extractContext(req) {
    if (!req) {
        return {};
    }
    if ("headers" in req && "ip" in req) {
        const request = req;
        const hostHeader = request.headers["host"];
        const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader || request.get("host") || undefined;
        const xForwardedHostHeader = request.headers["x-forwarded-host"];
        const xForwardedHost = Array.isArray(xForwardedHostHeader) ? xForwardedHostHeader[0] : xForwardedHostHeader || request.get("x-forwarded-host") || undefined;
        const xForwardedProtoHeader = request.headers["x-forwarded-proto"];
        const xForwardedProto = Array.isArray(xForwardedProtoHeader) ? xForwardedProtoHeader[0] : xForwardedProtoHeader || request.get("x-forwarded-proto") || undefined;
        if (host) {
            logger_1.logger.info("reCAPTCHA 검증 - Host 헤더 확인:", {
                host,
                xForwardedHost,
                xForwardedProto,
                originalUrl: request.originalUrl || request.url,
            });
        }
        else {
            logger_1.logger.warn("⚠️ reCAPTCHA 검증 - Host 헤더가 없습니다. Nginx 설정을 확인하세요.");
        }
        return {
            userAgent: request.headers["user-agent"] || request.get("user-agent") || undefined,
            userIpAddress: request.ip || request.socket.remoteAddress || undefined,
            requestUrl: request.url || request.originalUrl || undefined,
            host: host || xForwardedHost,
            xForwardedHost,
            xForwardedProto,
        };
    }
    return req;
}
async function verifyRecaptcha(token, expectedAction, context) {
    logger_1.logger.info(`[verifyRecaptcha] 검증 시작`, {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        expectedAction,
        hasContext: !!context
    });
    const requestId = `recaptcha-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();
    try {
        if (Math.random() < 0.1) {
            cleanupCache();
        }
        if (!token || typeof token !== 'string' || token.trim() === '') {
            logger_1.logger.error("reCAPTCHA 토큰이 없거나 유효하지 않습니다:", {
                tokenType: typeof token,
                tokenLength: token ? token.length : 0,
                tokenPreview: token ? token.substring(0, 20) + '...' : 'null/undefined',
            });
            writeRecaptchaLog("error", "reCAPTCHA 토큰 없음 또는 유효하지 않음", {
                requestId,
                expectedAction,
                tokenType: typeof token,
                tokenLength: token ? token.length : 0,
            });
            return false;
        }
        if (token.length < 100) {
            logger_1.logger.error("reCAPTCHA 토큰이 너무 짧습니다 (유효하지 않을 수 있음):", {
                tokenLength: token.length,
                tokenPreview: token.substring(0, 30) + '...',
            });
            writeRecaptchaLog("error", "reCAPTCHA 토큰 형식 오류 (너무 짧음)", {
                requestId,
                expectedAction,
                tokenLength: token.length,
            });
            return false;
        }
        const tokenHash = hashToken(token);
        if (tokenCache.has(tokenHash)) {
            const cachedTime = tokenCache.get(tokenHash);
            const age = Date.now() - cachedTime;
            logger_1.logger.warn("reCAPTCHA 토큰 재사용 감지:", {
                tokenHash: tokenHash.substring(0, 10) + '...',
                age: `${Math.round(age / 1000)}초`,
                cachedTime: new Date(cachedTime).toISOString(),
            });
            writeRecaptchaLog("warn", "reCAPTCHA 토큰 재사용 감지", {
                requestId,
                expectedAction,
                tokenHash: tokenHash.substring(0, 10) + '...',
                age: `${Math.round(age / 1000)}초`,
            });
            return false;
        }
        const verificationContext = extractContext(context);
        const { userIpAddress } = verificationContext;
        if (userIpAddress) {
            if (!checkRateLimit(userIpAddress)) {
                logger_1.logger.warn("reCAPTCHA Rate limit 초과:", {
                    ip: userIpAddress,
                    limit: RATE_LIMIT_MAX_REQUESTS,
                    window: `${RATE_LIMIT_WINDOW / 1000}초`,
                });
                writeRecaptchaLog("warn", "reCAPTCHA Rate limit 초과", {
                    requestId,
                    expectedAction,
                    ip: userIpAddress,
                    limit: RATE_LIMIT_MAX_REQUESTS,
                });
                return false;
            }
        }
        if (process.env.NODE_ENV === "development") {
            if (token.includes("dummy-token") || token.includes("test-token")) {
                logger_1.logger.info("개발 환경에서 더미 reCAPTCHA 토큰 허용");
                writeRecaptchaLog("info", "개발 환경 더미 토큰 허용", {
                    requestId,
                    expectedAction,
                    token: token.substring(0, 20) + "...",
                });
                return true;
            }
        }
        const secret = process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET;
        if (!secret || secret === "") {
            if (process.env.NODE_ENV === "development") {
                logger_1.logger.warn("개발 환경에서 reCAPTCHA 시크릿 키가 설정되지 않았지만 더미 토큰 허용");
                writeRecaptchaLog("warn", "개발 환경 시크릿 키 없음", {
                    requestId,
                    expectedAction,
                });
                return true;
            }
            logger_1.logger.error("reCAPTCHA 시크릿 키가 설정되지 않았습니다.");
            writeRecaptchaLog("error", "reCAPTCHA 시크릿 키 없음", {
                requestId,
                expectedAction,
            });
            return false;
        }
        const siteKey = process.env.RECAPTCHA_SITE_KEY || process.env.VITE_RECAPTCHA_SITE_KEY;
        if (siteKey) {
            logger_1.logger.info("reCAPTCHA 키 정보:", {
                siteKey: siteKey.substring(0, 20) + "...",
                secretKey: secret.substring(0, 20) + "...",
                tokenLength: token.length,
            });
        }
        const { userAgent, userIpAddress: userIp, requestUrl, host, xForwardedHost, xForwardedProto } = verificationContext;
        let remoteIp = userIp || '';
        if (remoteIp) {
            const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
            const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
            if (!ipv4Pattern.test(remoteIp) && !ipv6Pattern.test(remoteIp)) {
                logger_1.logger.warn("유효하지 않은 IP 주소 형식:", { ip: remoteIp });
                remoteIp = '';
            }
        }
        const response = await axios_1.default.post(`https://www.google.com/recaptcha/api/siteverify`, new URLSearchParams({
            secret: secret,
            response: token,
            remoteip: remoteIp,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'deukgeun-backend/1.0',
            },
            timeout: 10000,
            validateStatus: (status) => status < 500,
        });
        const duration = Date.now() - startTime;
        if (response.status !== 200) {
            logger_1.logger.error("reCAPTCHA API HTTP 오류:", {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
            });
            writeRecaptchaLog("error", "reCAPTCHA API HTTP 오류", {
                requestId,
                expectedAction,
                status: response.status,
                statusText: response.statusText,
                duration: `${duration}ms`,
            });
            return false;
        }
        if (!response.data || typeof response.data !== 'object') {
            logger_1.logger.error("reCAPTCHA API 응답 데이터 형식 오류:", {
                dataType: typeof response.data,
                data: response.data,
            });
            writeRecaptchaLog("error", "reCAPTCHA API 응답 데이터 형식 오류", {
                requestId,
                expectedAction,
                dataType: typeof response.data,
                duration: `${duration}ms`,
            });
            return false;
        }
        const challengeTs = response.data.challenge_ts;
        let tokenAge = null;
        if (challengeTs) {
            try {
                const challengeTime = new Date(challengeTs).getTime();
                if (isNaN(challengeTime)) {
                    logger_1.logger.warn("reCAPTCHA challenge_ts 파싱 실패:", { challengeTs });
                }
                else {
                    tokenAge = Math.round((Date.now() - challengeTime) / 1000);
                    const TOKEN_MAX_AGE = 120;
                    if (tokenAge > TOKEN_MAX_AGE) {
                        logger_1.logger.warn("reCAPTCHA 토큰 만료:", {
                            tokenAge: `${tokenAge}초`,
                            maxAge: `${TOKEN_MAX_AGE}초`,
                            challengeTs,
                        });
                        writeRecaptchaLog("warn", "reCAPTCHA 토큰 만료", {
                            requestId,
                            expectedAction,
                            tokenAge: `${tokenAge}초`,
                            maxAge: `${TOKEN_MAX_AGE}초`,
                            challengeTs,
                        });
                        return false;
                    }
                    if (tokenAge < 0) {
                        logger_1.logger.warn("reCAPTCHA 토큰 시간 불일치 (시스템 시간 확인 필요):", {
                            tokenAge: `${tokenAge}초`,
                            challengeTs,
                            serverTime: new Date().toISOString(),
                        });
                    }
                }
            }
            catch (error) {
                logger_1.logger.warn("reCAPTCHA 토큰 만료 시간 파싱 실패:", error);
            }
        }
        console.log("🔍 [reCAPTCHA] Google API 응답:", JSON.stringify({
            success: response.data.success,
            hasScore: response.data.score !== undefined,
            score: response.data.score,
            action: response.data.action,
            hostname: response.data.hostname,
            challenge_ts: response.data.challenge_ts,
            tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
            errorCodes: response.data["error-codes"] || [],
            fullResponse: response.data,
        }, null, 2));
        logger_1.logger.info("reCAPTCHA API 응답:", {
            success: response.data.success,
            hasScore: response.data.score !== undefined,
            score: response.data.score,
            action: response.data.action,
            hostname: response.data.hostname,
            challenge_ts: response.data.challenge_ts,
            tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
            errorCodes: response.data["error-codes"] || [],
        });
        if (!response.data.success) {
            const errorCodes = response.data["error-codes"] || [];
            const apiHostname = response.data.hostname;
            const apiChallengeTs = response.data.challenge_ts;
            const registeredDomains = (process.env.RECAPTCHA_REGISTERED_DOMAINS ||
                "devtrail.net,www.devtrail.net,43.203.30.167,localhost,127.0.0.1")
                .split(",")
                .map(domain => domain.trim().toLowerCase())
                .filter(domain => domain.length > 0);
            let domainMismatch = false;
            let domainMismatchDetails = null;
            if (apiHostname) {
                const normalizedHostname = apiHostname.toLowerCase().trim();
                const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(normalizedHostname);
                const isRegistered = registeredDomains.some(domain => {
                    const normalizedDomain = domain.toLowerCase().trim();
                    if (isIpAddress) {
                        return normalizedHostname === normalizedDomain;
                    }
                    return normalizedHostname === normalizedDomain ||
                        normalizedHostname.endsWith(`.${normalizedDomain}`);
                });
                if (!isRegistered) {
                    domainMismatch = true;
                    domainMismatchDetails = {
                        apiHostname: apiHostname,
                        registeredDomains: registeredDomains,
                        mismatch: true,
                        isIpAddress,
                        suggestion: `Google Console에 '${apiHostname}' ${isIpAddress ? 'IP 주소' : '도메인'}를 추가하세요.`
                    };
                }
            }
            else {
                domainMismatch = true;
                domainMismatchDetails = {
                    apiHostname: null,
                    registeredDomains: registeredDomains,
                    mismatch: true,
                    reason: "Google API 응답에 hostname이 없습니다. 이는 도메인이 등록되지 않았거나 불일치할 가능성이 높습니다.",
                    suggestion: "Google Console (https://www.google.com/recaptcha/admin)에서 도메인 등록 상태를 확인하세요."
                };
            }
            let errorMessage = "";
            if (errorCodes.includes("invalid-input-response")) {
                if (domainMismatch) {
                    errorMessage = `도메인 불일치: ${domainMismatchDetails?.reason || "hostname이 null입니다"}. ${domainMismatchDetails?.suggestion || "Google Console에서 도메인을 확인하세요."}`;
                }
                else {
                    errorMessage = "토큰이 유효하지 않습니다. 가능한 원인: 1) 토큰 만료 (2분 초과), 2) 토큰 재사용, 3) Site Key와 Secret Key 불일치, 4) 토큰 형식 오류";
                }
            }
            else if (errorCodes.includes("invalid-input-secret")) {
                errorMessage = "Secret Key가 유효하지 않습니다.";
            }
            else if (errorCodes.includes("timeout-or-duplicate")) {
                errorMessage = "토큰이 만료되었거나 이미 사용되었습니다 (재사용 불가).";
            }
            else {
                errorMessage = "알 수 없는 오류";
            }
            const detailInfo = {
                errorCodes,
                tokenLength: token.length,
                tokenPreview: token.substring(0, 30) + "...",
                score: response.data.score,
                action: response.data.action,
                hostname: apiHostname,
                challenge_ts: apiChallengeTs,
                siteKey: siteKey ? siteKey.substring(0, 20) + "..." : "not set",
                secretKey: secret.substring(0, 20) + "...",
                errorMessage,
                tokenAge: apiChallengeTs
                    ? `${Math.round((Date.now() / 1000 - new Date(apiChallengeTs).getTime() / 1000))}초 경과`
                    : "알 수 없음",
                domainMismatch: domainMismatch,
                domainMismatchDetails: domainMismatchDetails,
                registeredDomains: registeredDomains,
                fullApiResponse: response.data,
            };
            console.error("❌ [reCAPTCHA] 검증 실패 - 상세 정보:", JSON.stringify(detailInfo, null, 2));
            if (domainMismatch) {
                console.error("⚠️ [reCAPTCHA] 도메인 불일치 감지:", JSON.stringify(domainMismatchDetails, null, 2));
                logger_1.logger.error("reCAPTCHA 도메인 불일치 감지:", domainMismatchDetails);
            }
            logger_1.logger.error("reCAPTCHA 검증 실패 - 상세 정보:", detailInfo);
            writeRecaptchaLog("error", "reCAPTCHA v3 검증 실패", {
                requestId,
                expectedAction,
                errorCodes,
                score: response.data.score,
                action: response.data.action,
                hostname: apiHostname,
                challenge_ts: apiChallengeTs,
                duration: `${duration}ms`,
                userAgent,
                userIpAddress,
                requestUrl,
                requestHost: host || xForwardedHost,
                xForwardedHost,
                xForwardedProto,
                errorMessage,
                domainMismatch,
                domainMismatchDetails,
                registeredDomains,
                fullApiResponse: response.data,
            });
            return false;
        }
        if (expectedAction && response.data.action) {
            const normalizedExpected = expectedAction.toLowerCase().trim();
            const normalizedActual = response.data.action.toLowerCase().trim();
            if (normalizedActual !== normalizedExpected) {
                logger_1.logger.warn("reCAPTCHA action 불일치:", {
                    expected: expectedAction,
                    actual: response.data.action,
                    normalizedExpected,
                    normalizedActual,
                });
                writeRecaptchaLog("warn", "reCAPTCHA action 불일치", {
                    requestId,
                    expectedAction,
                    actualAction: response.data.action,
                    normalizedExpected,
                    normalizedActual,
                    score: response.data.score,
                    hostname: response.data.hostname,
                    challenge_ts: response.data.challenge_ts,
                    duration: `${duration}ms`,
                    userAgent,
                    userIpAddress,
                    requestUrl,
                });
                return false;
            }
            logger_1.logger.info("reCAPTCHA action 검증 통과:", {
                expected: expectedAction,
                actual: response.data.action,
                normalizedExpected,
                normalizedActual,
            });
        }
        if (response.data.score !== undefined && response.data.score !== null) {
            const score = parseFloat(String(response.data.score));
            let minScore;
            if (expectedAction === "LOGIN") {
                const loginMinScore = process.env.RECAPTCHA_MIN_SCORE_LOGIN;
                minScore = loginMinScore ? parseFloat(loginMinScore) : 0.1;
            }
            else if (expectedAction === "REGISTER") {
                const registerMinScore = process.env.RECAPTCHA_MIN_SCORE_REGISTER;
                minScore = registerMinScore ? parseFloat(registerMinScore) : parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");
            }
            else {
                minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");
            }
            if (isNaN(score) || score < 0 || score > 1) {
                logger_1.logger.error("reCAPTCHA 점수가 유효하지 않습니다:", {
                    score,
                    minScore,
                    rawScore: response.data.score,
                });
                writeRecaptchaLog("error", "reCAPTCHA 점수 유효성 오류", {
                    requestId,
                    expectedAction,
                    score,
                    rawScore: response.data.score,
                    minScore,
                });
                return false;
            }
            logger_1.logger.info("reCAPTCHA 점수 수신:", {
                score,
                minScore,
                action: response.data.action,
                threshold: score >= minScore ? "통과" : "실패",
                margin: (score - minScore).toFixed(3)
            });
            if (score < minScore) {
                logger_1.logger.warn("reCAPTCHA 점수가 너무 낮습니다:", {
                    score,
                    minScore,
                    margin: (score - minScore).toFixed(3),
                });
                writeRecaptchaLog("warn", "reCAPTCHA 점수 낮음", {
                    requestId,
                    expectedAction,
                    score,
                    minScore,
                    margin: (score - minScore).toFixed(3),
                    action: response.data.action,
                    hostname: response.data.hostname,
                    challenge_ts: response.data.challenge_ts,
                    tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
                    duration: `${duration}ms`,
                    userAgent,
                    userIpAddress: userIp,
                    requestUrl,
                    requestHost: host || xForwardedHost,
                    xForwardedHost,
                    xForwardedProto,
                });
                return false;
            }
            logger_1.logger.info("reCAPTCHA 검증 성공 (점수 확인됨):", {
                score,
                minScore,
                action: response.data.action,
                margin: (score - minScore).toFixed(3),
            });
            tokenCache.set(tokenHash, Date.now());
            writeRecaptchaLog("info", "reCAPTCHA v3 검증 성공", {
                requestId,
                expectedAction,
                score,
                minScore,
                margin: (score - minScore).toFixed(3),
                action: response.data.action,
                hostname: response.data.hostname,
                challenge_ts: response.data.challenge_ts,
                tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
                duration: `${duration}ms`,
                userAgent,
                userIpAddress: userIp,
                requestUrl,
                requestHost: host || xForwardedHost,
                xForwardedHost,
                xForwardedProto,
            });
        }
        else {
            if (process.env.NODE_ENV === "production") {
                logger_1.logger.error("reCAPTCHA v3 검증 성공했지만 점수가 반환되지 않았습니다 (프로덕션):", {
                    action: response.data.action,
                    hostname: response.data.hostname,
                    challenge_ts: response.data.challenge_ts,
                });
                writeRecaptchaLog("error", "reCAPTCHA 점수 없음 (프로덕션)", {
                    requestId,
                    expectedAction,
                    action: response.data.action,
                    hostname: response.data.hostname,
                    challenge_ts: response.data.challenge_ts,
                    duration: `${duration}ms`,
                    userAgent,
                    userIpAddress: userIp,
                    requestUrl,
                    note: "프로덕션 환경에서는 점수가 필수입니다. v2이거나 v3 설정이 올바르지 않을 수 있습니다.",
                });
                return false;
            }
            logger_1.logger.warn("reCAPTCHA v3 검증 성공했지만 점수가 반환되지 않았습니다:", {
                action: response.data.action,
                hostname: response.data.hostname,
                challenge_ts: response.data.challenge_ts,
            });
            logger_1.logger.info("reCAPTCHA 검증 성공 (점수 없음 - v2이거나 설정 오류 가능)");
            tokenCache.set(tokenHash, Date.now());
            writeRecaptchaLog("warn", "reCAPTCHA 검증 성공 (점수 없음)", {
                requestId,
                expectedAction,
                action: response.data.action,
                hostname: response.data.hostname,
                challenge_ts: response.data.challenge_ts,
                tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
                duration: `${duration}ms`,
                userAgent,
                userIpAddress: userIp,
                requestUrl,
                requestHost: host || xForwardedHost,
                xForwardedHost,
                xForwardedProto,
                note: "점수가 반환되지 않았습니다. v2이거나 v3 설정이 올바르지 않을 수 있습니다.",
            });
        }
        return true;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const verificationContext = extractContext(context);
        const { userAgent, userIpAddress, requestUrl, host, xForwardedHost, xForwardedProto } = verificationContext;
        const isNetworkError = axios_1.default.isAxiosError(error) && (error.code === 'ECONNABORTED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT');
        const isTimeoutError = axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED';
        logger_1.logger.error("reCAPTCHA 인증 실패:", {
            error: error instanceof Error ? error.message : String(error),
            errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
            isAxiosError: axios_1.default.isAxiosError(error),
            errorCode: axios_1.default.isAxiosError(error) ? error.code : undefined,
            errorStatus: axios_1.default.isAxiosError(error) ? error.response?.status : undefined,
        });
        writeRecaptchaLog("error", "reCAPTCHA 검증 오류", {
            requestId,
            expectedAction,
            error: error instanceof Error ? error.message : String(error),
            errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
            errorCode: axios_1.default.isAxiosError(error) ? error.code : undefined,
            errorStatus: axios_1.default.isAxiosError(error) ? error.response?.status : undefined,
            duration: `${duration}ms`,
            userAgent,
            userIpAddress,
            requestUrl,
            requestHost: host || xForwardedHost,
            xForwardedHost,
            xForwardedProto,
        });
        if (process.env.NODE_ENV === "development" && isNetworkError && !isTimeoutError) {
            logger_1.logger.warn("개발 환경에서 네트워크 오류 시 더미 토큰 허용 (타임아웃 제외)");
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
