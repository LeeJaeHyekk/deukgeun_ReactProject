"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require('middlewares/auth');
const logger_1 = require('utils/logger');
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const logsDir = path_1.default.join(process.cwd(), "logs");
const errorLogPath = path_1.default.join(logsDir, "error.log");
const combinedLogPath = path_1.default.join(logsDir, "combined.log");
router.get("/", auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "관리자 권한이 필요합니다.",
            });
        }
        const { level = "all", limit = 100, offset = 0 } = req.query;
        let logContent = "";
        if (level === "error" || level === "all") {
            if (fs_1.default.existsSync(errorLogPath)) {
                logContent += fs_1.default.readFileSync(errorLogPath, "utf-8");
            }
        }
        if (level === "all") {
            if (fs_1.default.existsSync(combinedLogPath)) {
                logContent += fs_1.default.readFileSync(combinedLogPath, "utf-8");
            }
        }
        const logs = logContent
            .split("\n")
            .filter(line => line.trim())
            .map(line => {
            try {
                return JSON.parse(line);
            }
            catch {
                return { message: line, timestamp: new Date().toISOString() };
            }
        })
            .reverse()
            .slice(Number(offset), Number(offset) + Number(limit));
        res.json({
            success: true,
            data: {
                logs,
                total: logs.length,
                level,
                limit: Number(limit),
                offset: Number(offset),
            },
        });
    }
    catch (error) {
        logger_1.logger.error("로그 조회 중 오류 발생", error);
        res.status(500).json({
            success: false,
            message: "로그 조회 중 오류가 발생했습니다.",
        });
    }
});
router.get("/download", auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "관리자 권한이 필요합니다.",
            });
        }
        const { type = "combined" } = req.query;
        let filePath = "";
        switch (type) {
            case "error":
                filePath = errorLogPath;
                break;
            case "combined":
                filePath = combinedLogPath;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "잘못된 로그 타입입니다.",
                });
        }
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "로그 파일을 찾을 수 없습니다.",
            });
        }
        res.download(filePath, `${type}_logs_${new Date().toISOString().split("T")[0]}.log`);
    }
    catch (error) {
        logger_1.logger.error("로그 다운로드 중 오류 발생", error);
        res.status(500).json({
            success: false,
            message: "로그 다운로드 중 오류가 발생했습니다.",
        });
    }
});
router.delete("/", auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "관리자 권한이 필요합니다.",
            });
        }
        const { type = "all" } = req.query;
        if (type === "error" || type === "all") {
            if (fs_1.default.existsSync(errorLogPath)) {
                fs_1.default.writeFileSync(errorLogPath, "");
            }
        }
        if (type === "combined" || type === "all") {
            if (fs_1.default.existsSync(combinedLogPath)) {
                fs_1.default.writeFileSync(combinedLogPath, "");
            }
        }
        logger_1.logger.info(`로그 파일이 정리되었습니다. (type: ${type})`);
        res.json({
            success: true,
            message: "로그 파일이 성공적으로 정리되었습니다.",
        });
    }
    catch (error) {
        logger_1.logger.error("로그 정리 중 오류 발생", error);
        res.status(500).json({
            success: false,
            message: "로그 정리 중 오류가 발생했습니다.",
        });
    }
});
exports.default = router;
