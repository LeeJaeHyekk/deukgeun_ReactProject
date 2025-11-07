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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recaptcha_1 = require("../utils/recaptcha.cjs");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger.cjs");
const router = (0, express_1.Router)();
const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'recaptcha.log');
if (!fs.existsSync(logDir)) {
    try {
        fs.mkdirSync(logDir, { recursive: true });
    }
    catch (error) {
        logger_1.logger.warn('로그 디렉토리 생성 실패:', error);
    }
}
router.post('/verify', async (req, res) => {
    try {
        const { token, action } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'reCAPTCHA token is required'
            });
        }
        const isValid = await (0, recaptcha_1.verifyRecaptcha)(token, action || undefined, req);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'reCAPTCHA verification failed'
            });
        }
        res.json({
            success: true,
            message: 'reCAPTCHA verification successful'
        });
    }
    catch (error) {
        logger_1.logger.error('reCAPTCHA 검증 오류:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/log', async (req, res) => {
    try {
        const { level, message, data } = req.body;
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level || 'info',
            message: message || 'reCAPTCHA 로그',
            data: data || {},
            source: 'frontend',
            userAgent: req.headers['user-agent'] || req.get('user-agent') || undefined,
            userIpAddress: req.ip || req.socket.remoteAddress || undefined,
            requestUrl: req.url || req.originalUrl || undefined,
            environment: process.env.NODE_ENV || 'development',
            mode: process.env.MODE || 'development',
        };
        try {
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf-8');
        }
        catch (error) {
            logger_1.logger.warn('reCAPTCHA 로그 파일 기록 실패:', error);
        }
        res.json({
            success: true,
            message: 'Log recorded'
        });
    }
    catch (error) {
        logger_1.logger.error('reCAPTCHA 로그 수신 오류:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/config', (req, res) => {
    try {
        const config = {
            siteKey: process.env.RECAPTCHA_SITE_KEY || process.env.VITE_RECAPTCHA_SITE_KEY,
            hasSecret: !!(process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET),
            minScore: parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5'),
            environment: process.env.NODE_ENV || 'development',
        };
        res.json({
            success: true,
            config
        });
    }
    catch (error) {
        logger_1.logger.error('reCAPTCHA 설정 정보 오류:', error);
        res.status(500).json({
            success: false,
            error: 'Config retrieval failed'
        });
    }
});
exports.default = router;
