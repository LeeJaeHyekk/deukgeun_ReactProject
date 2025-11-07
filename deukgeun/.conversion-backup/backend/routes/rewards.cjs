"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth.cjs");
const levelService_1 = require("../services/levelService.cjs");
const router = (0, express_1.Router)();
const levelService = new levelService_1.LevelService();
router.get("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const rewards = await levelService.getUserRewards(userId);
        res.json({ success: true, message: "OK", data: { rewards } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: "SERVER_ERROR" });
    }
});
exports.default = router;
