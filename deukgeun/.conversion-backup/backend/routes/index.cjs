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
const express_1 = require("express");
const auth_1 = __importDefault(require('./auth.cjs'));
const gym_1 = __importDefault(require('./gym.cjs'));
const machine_1 = __importDefault(require('./machine.cjs'));
const post_1 = __importDefault(require('./post.cjs'));
const comment_1 = __importDefault(require('./comment.cjs'));
const like_1 = __importDefault(require('./like.cjs'));
const level_1 = __importDefault(require('./level.cjs'));
const stats_1 = __importDefault(require('./stats.cjs'));
const workout_1 = __importDefault(require('./workout.cjs'));
const logs_1 = __importDefault(require('./logs.cjs'));
const recaptcha_1 = __importDefault(require('./recaptcha.cjs'));
const homePage_1 = __importDefault(require('./homePage.cjs'));
const enhancedGymRoutes_1 = __importDefault(require('./enhancedGymRoutes.cjs'));
const databaseConfig_1 = require('../config/databaseConfig.cjs');
const healthMonitor_1 = require('../middlewares/healthMonitor.cjs');
const typeGuards_1 = require('../utils/typeGuards.cjs');
console.log("=".repeat(60));
console.log("🔧 API ROUTES INITIALIZATION DEBUG START");
console.log("=".repeat(60));
const router = (0, express_1.Router)();
console.log("✅ Router instance created");
console.log("🔄 Step 1: Configuring health check endpoint...");
router.get("/health", async (req, res) => {
    console.log(`🔍 API Health check accessed - ${req.method} ${req.url}`);
    try {
        console.log("🔄 Checking database connection status...");
        const isDatabaseConnected = databaseConfig_1.AppDataSource.isInitialized;
        console.log(`   - Database initialized: ${isDatabaseConnected}`);
        let databaseHealth = null;
        if (isDatabaseConnected) {
            console.log("🔄 Running database health check...");
            databaseHealth = await (0, healthMonitor_1.checkDatabaseHealth)();
            console.log(`   - Database health: ${databaseHealth.connected ? 'connected' : 'disconnected'}`);
        }
        const healthStatus = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: isDatabaseConnected ? "connected" : "disconnected",
            databaseHealth: databaseHealth,
            environment: process.env.NODE_ENV || "development",
            port: parseInt(process.env.PORT || "5000"),
            memory: process.memoryUsage()
        };
        if (!(0, typeGuards_1.isValidHealthResponse)(healthStatus)) {
            console.error("❌ Health response validation failed");
            res.status(500).json({
                success: false,
                message: "Health check response validation failed",
                timestamp: new Date().toISOString()
            });
            return;
        }
        console.log("✅ Health check completed successfully");
        res.json(healthStatus);
    }
    catch (error) {
        console.error("❌ Health check failed:", error);
        const errorResponse = {
            success: false,
            message: "Health check failed",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
        };
        if (!(0, typeGuards_1.isValidApiResponse)(errorResponse)) {
            console.error("❌ Error response validation failed");
            res.status(500).json({
                success: false,
                message: "Internal server error",
                timestamp: new Date().toISOString()
            });
            return;
        }
        res.status(500).json(errorResponse);
    }
});
console.log("✅ Health check endpoint configured");
console.log("🔄 Step 2: Checking database connection for API routes...");
const isDatabaseConnected = databaseConfig_1.AppDataSource.isInitialized;
console.log(`   - Database connected: ${isDatabaseConnected}`);
if (isDatabaseConnected) {
    console.log("🔄 Step 3: Configuring full API routes (database connected)...");
    router.use("/auth", auth_1.default);
    console.log("✅ Auth routes configured");
    try {
        router.use("/gyms", gym_1.default);
        console.log("✅ Gym routes configured");
    }
    catch (error) {
        console.warn("⚠️ Gym routes failed:", error);
        if (error instanceof ReferenceError && error.message.includes('File is not defined')) {
            console.warn("⚠️ File is not defined 오류는 무시하고 계속 진행합니다 (undici 모듈 문제)");
        }
    }
    router.use("/machines", machine_1.default);
    console.log("✅ Machine routes configured");
    router.use("/posts", post_1.default);
    console.log("✅ Post routes configured");
    router.use("/comments", comment_1.default);
    console.log("✅ Comment routes configured");
    router.use("/likes", like_1.default);
    console.log("✅ Like routes configured");
    router.use("/level", level_1.default);
    console.log("✅ Level routes configured");
    router.use("/stats", stats_1.default);
    console.log("✅ Stats routes configured");
    console.log("✅ Scheduler routes configured");
    router.use("/workouts", workout_1.default);
    console.log("✅ Workout routes configured");
    router.use("/logs", logs_1.default);
    console.log("✅ Logs routes configured");
    router.use("/recaptcha", recaptcha_1.default);
    console.log("✅ Recaptcha routes configured");
    router.use("/homepage", homePage_1.default);
    console.log("✅ Homepage routes configured");
    router.use("/enhanced-gym", enhancedGymRoutes_1.default);
    console.log("✅ Enhanced Gym routes configured");
    (async () => {
        try {
            const crawlingRoutes = await Promise.resolve().then(() => __importStar(require('./crawling.cjs')));
            router.use("/crawling", crawlingRoutes.default);
            console.log("✅ Crawling routes configured");
        }
        catch (error) {
            console.warn("⚠️ Crawling routes failed:", error);
        }
    })().catch((error) => {
        console.warn("⚠️ Crawling routes async initialization failed:", error);
    });
    console.log("✅ All API routes configured (full functionality)");
}
else {
    console.log("🔄 Step 3: Configuring limited API routes (database disconnected)...");
    if (process.env.NODE_ENV === "development") {
        console.log("🔧 Development mode: Enabling auth routes without database");
        router.use("/auth", auth_1.default);
        console.log("✅ Auth routes configured (development mode)");
    }
    router.get("/status", (req, res) => {
        console.log(`🔍 API Status accessed - ${req.method} ${req.url}`);
        res.json({
            message: "API is running in limited mode",
            database: "disconnected",
            availableEndpoints: ["/health", "/api/status", ...(process.env.NODE_ENV === "development" ? ["/api/auth/*"] : [])],
            timestamp: new Date().toISOString()
        });
    });
    console.log("✅ Limited API status endpoint configured");
    console.log("⚠️ API running in limited mode (database not connected)");
}
console.log("🔄 Step 4: Configuring 404 handler...");
router.use((req, res, next) => {
    if (!res.headersSent) {
        console.log(`🔍 404 - API endpoint not found: ${req.method} ${req.url}`);
        res.status(404).json({
            message: "API endpoint not found",
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString()
        });
    }
    else {
        next();
    }
});
console.log("✅ 404 handler configured");
console.log("=".repeat(60));
console.log("✅ API ROUTES INITIALIZATION COMPLETE");
console.log("=".repeat(60));
exports.default = router;
