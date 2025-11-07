"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weeklyCrawlingScheduler_1 = require("../schedulers/weeklyCrawlingScheduler.cjs");
const router = (0, express_1.Router)();
router.get('/status', (req, res) => {
    try {
        const status = weeklyCrawlingScheduler_1.weeklyCrawlingScheduler.getStatus();
        res.json({
            success: true,
            data: {
                ...status,
                nextRunISO: status.nextRun ? status.nextRun.toISOString() : null,
                lastRunISO: status.lastRun ? status.lastRun.toISOString() : null,
                lastRunDurationSeconds: status.lastRunDuration
                    ? (status.lastRunDuration / 1000).toFixed(2)
                    : null
            }
        });
    }
    catch (error) {
        console.error('크롤링 상태 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '크롤링 상태 조회 실패',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
router.post('/run', async (req, res) => {
    try {
        const result = await weeklyCrawlingScheduler_1.weeklyCrawlingScheduler.runManual();
        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    }
    catch (error) {
        console.error('수동 크롤링 실행 실패:', error);
        res.status(500).json({
            success: false,
            message: '수동 크롤링 실행 실패',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.default = router;
