"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require('routes/auth'));
const gym_1 = __importDefault(require('routes/gym'));
const machine_1 = __importDefault(require('routes/machine'));
const post_1 = __importDefault(require('routes/post'));
const comment_1 = __importDefault(require('routes/comment'));
const like_1 = __importDefault(require('routes/like'));
const level_1 = __importDefault(require('routes/level'));
const stats_1 = __importDefault(require('routes/stats'));
const workout_1 = __importDefault(require('routes/workout'));
const logs_1 = __importDefault(require('routes/logs'));
const recaptcha_1 = __importDefault(require('routes/recaptcha'));
const homePage_1 = __importDefault(require('routes/homePage'));
const enhancedGymRoutes_1 = __importDefault(require('routes/enhancedGymRoutes'));
const databaseConfig_1 = require('config/databaseConfig');
const healthMonitor_1 = require('middlewares/healthMonitor');
const typeGuards_1 = require('utils/typeGuards');
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
    router.use("/gyms", gym_1.default);
    console.log("✅ Gym routes configured");
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
router.use("*", (req, res) => {
    console.log(`🔍 404 - API endpoint not found: ${req.method} ${req.url}`);
    res.status(404).json({
        message: "API endpoint not found",
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
});
console.log("✅ 404 handler configured");
console.log("=".repeat(60));
console.log("✅ API ROUTES INITIALIZATION COMPLETE");
console.log("=".repeat(60));
exports.default = router;
