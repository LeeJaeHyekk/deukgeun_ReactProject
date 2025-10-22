"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRecaptchaEnterpriseHealth = exports.recaptchaEnterpriseMiddleware = exports.processRecaptchaScore = exports.verifyRecaptchaEnterprise = void 0;
const axios_1 = __importDefault(require("axios"));
const verifyRecaptchaEnterprise = async (token, expectedAction) => {
    try {
        const projectId = process.env.RECAPTCHA_PROJECT_ID;
        const apiKey = process.env.RECAPTCHA_API_KEY;
        if (!projectId || !apiKey) {
            throw new Error('reCAPTCHA Enterprise 설정이 누락되었습니다.');
        }
        const requestData = {
            event: {
                token,
                siteKey: process.env.RECAPTCHA_SITE_KEY || '6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG',
                expectedAction
            }
        };
        const response = await axios_1.default.post(`https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = response.data;
        if (!data.tokenProperties.valid) {
            return {
                success: false,
                score: 0,
                error: data.tokenProperties.invalidReason || 'Invalid token'
            };
        }
        if (data.tokenProperties.action !== expectedAction) {
            return {
                success: false,
                score: data.riskAnalysis.score,
                error: 'Action mismatch'
            };
        }
        return {
            success: true,
            score: data.riskAnalysis.score
        };
    }
    catch (error) {
        console.error('reCAPTCHA Enterprise 검증 오류:', error);
        if (axios_1.default.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            return {
                success: false,
                score: 0,
                error: `API 오류: ${errorMessage}`
            };
        }
        return {
            success: false,
            score: 0,
            error: 'Verification failed'
        };
    }
};
exports.verifyRecaptchaEnterprise = verifyRecaptchaEnterprise;
const processRecaptchaScore = (score, action) => {
    const scoreThresholds = {
        LOGIN: 0.5,
        REGISTER: 0.7,
        SENSITIVE: 0.8,
        ADMIN: 0.9
    };
    const threshold = scoreThresholds[action] || 0.5;
    return {
        allowed: score >= threshold,
        score,
        threshold,
        riskLevel: score >= 0.8 ? 'low' : score >= 0.5 ? 'medium' : 'high'
    };
};
exports.processRecaptchaScore = processRecaptchaScore;
const recaptchaEnterpriseMiddleware = (action, minScore = 0.5) => {
    return async (req, res, next) => {
        try {
            if (process.env.NODE_ENV === "development") {
                console.log("🔧 Development mode: Bypassing reCAPTCHA verification");
                req.recaptchaScore = 1.0;
                req.recaptchaRiskLevel = 'low';
                next();
                return;
            }
            const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'];
            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'reCAPTCHA token is required'
                });
            }
            const result = await (0, exports.verifyRecaptchaEnterprise)(token, action);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error || 'reCAPTCHA verification failed'
                });
            }
            const scoreResult = (0, exports.processRecaptchaScore)(result.score, action);
            if (!scoreResult.allowed) {
                return res.status(400).json({
                    success: false,
                    error: `Score too low: ${result.score} (minimum: ${minScore})`,
                    score: result.score,
                    riskLevel: scoreResult.riskLevel
                });
            }
            req.recaptchaScore = result.score;
            req.recaptchaRiskLevel = scoreResult.riskLevel;
            next();
        }
        catch (error) {
            console.error('reCAPTCHA Enterprise 미들웨어 오류:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
};
exports.recaptchaEnterpriseMiddleware = recaptchaEnterpriseMiddleware;
const checkRecaptchaEnterpriseHealth = async () => {
    try {
        const projectId = process.env.RECAPTCHA_PROJECT_ID;
        const apiKey = process.env.RECAPTCHA_API_KEY;
        if (!projectId || !apiKey) {
            return {
                status: 'unhealthy',
                message: 'reCAPTCHA Enterprise 설정이 누락되었습니다.'
            };
        }
        const response = await axios_1.default.get(`https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}?key=${apiKey}`, { timeout: 5000 });
        return {
            status: 'healthy',
            message: 'reCAPTCHA Enterprise API 연결 정상',
            projectId
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            message: 'reCAPTCHA Enterprise API 연결 실패',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
exports.checkRecaptchaEnterpriseHealth = checkRecaptchaEnterpriseHealth;
