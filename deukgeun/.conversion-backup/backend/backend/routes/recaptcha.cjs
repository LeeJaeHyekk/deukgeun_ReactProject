"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recaptcha_enterprise_1 = require('utils/recaptcha-enterprise');
const router = (0, express_1.Router)();
router.post('/verify', async (req, res) => {
    try {
        const { token, action } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'reCAPTCHA token is required'
            });
        }
        if (!action) {
            return res.status(400).json({
                success: false,
                error: 'Action is required'
            });
        }
        const result = await (0, recaptcha_enterprise_1.verifyRecaptchaEnterprise)(token, action);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                score: result.score
            });
        }
        res.json({
            success: true,
            score: result.score,
            message: 'reCAPTCHA verification successful'
        });
    }
    catch (error) {
        console.error('reCAPTCHA 검증 오류:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const health = await (0, recaptcha_enterprise_1.checkRecaptchaEnterpriseHealth)();
        res.json({
            success: true,
            health,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('reCAPTCHA 헬스체크 오류:', error);
        res.status(500).json({
            success: false,
            error: 'Health check failed'
        });
    }
});
router.get('/config', (req, res) => {
    try {
        const config = {
            siteKey: process.env.RECAPTCHA_SITE_KEY,
            projectId: process.env.RECAPTCHA_PROJECT_ID,
            hasApiKey: !!process.env.RECAPTCHA_API_KEY,
            hasSecret: !!process.env.RECAPTCHA_SECRET
        };
        res.json({
            success: true,
            config
        });
    }
    catch (error) {
        console.error('reCAPTCHA 설정 정보 오류:', error);
        res.status(500).json({
            success: false,
            error: 'Config retrieval failed'
        });
    }
});
exports.default = router;
