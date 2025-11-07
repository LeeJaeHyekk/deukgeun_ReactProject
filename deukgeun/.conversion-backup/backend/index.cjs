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
require("reflect-metadata");
require('./config/env.cjs');
if (typeof globalThis.File === 'undefined') {
    globalThis.File = class File {
        constructor(name = '', size = 0, type = '', lastModified = Date.now()) {
            this.name = name;
            this.size = size;
            this.type = type;
            this.lastModified = lastModified;
        }
    };
}
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const net = __importStar(require("net"));
const databaseConfig_1 = require('./config/databaseConfig.cjs');
const healthMonitor_1 = require('./middlewares/healthMonitor.cjs');
const resilience_1 = require('./middlewares/resilience.cjs');
const advancedLogging_1 = require('./middlewares/advancedLogging.cjs');
const serverStartup_1 = require('./middlewares/serverStartup.cjs');
const weeklyCrawlingScheduler_1 = require('./schedulers/weeklyCrawlingScheduler.cjs');
async function createApp() {
    const app = (0, express_1.default)();
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', true);
        console.log('✅ Trust proxy 활성화 (프로덕션 환경)');
    }
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN?.split(",").filter(origin => origin.trim() !== "") || [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5000",
            "http://localhost:5001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5000",
            "http://127.0.0.1:5001",
        ],
        credentials: true
    }));
    app.use((0, morgan_1.default)("dev"));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    app.use(advancedLogging_1.requestTrackingMiddleware);
    app.use(advancedLogging_1.securityMonitoringMiddleware);
    app.use(advancedLogging_1.errorTrackingMiddleware);
    app.use(advancedLogging_1.performanceMonitoringMiddleware);
    app.use(advancedLogging_1.businessLogicLoggingMiddleware);
    app.use(resilience_1.databaseResilienceMiddleware);
    app.use(resilience_1.apiResilienceMiddleware);
    app.use(resilience_1.memoryMonitorMiddleware);
    app.use(healthMonitor_1.metricsMiddleware);
    app.get("/", (req, res) => {
        res.json({
            message: "Deukgeun Backend API",
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
            status: "healthy",
        });
    });
    app.get("/health", healthMonitor_1.healthCheckMiddleware);
    app.get("/health/detailed", healthMonitor_1.detailedHealthCheckMiddleware);
    app.get("/health/circuit-breakers", resilience_1.getCircuitBreakerStatus);
    app.get("/debug", (req, res) => {
        res.status(200).json({
            status: "debug",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
            process: {
                pid: process.pid,
                version: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
            }
        });
    });
    await setupSafeRoutes(app);
    return app;
}
async function setupSafeRoutes(app) {
    console.log("🔄 Setting up safe routes...");
    try {
        app.get("/api/health", (req, res) => {
            res.json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development",
                message: "API running in safe mode"
            });
        });
        console.log("✅ Basic API routes configured");
        try {
            const { authRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/auth/index.cjs')));
            app.use("/api/auth", authRoutes);
            console.log("✅ Auth routes configured");
        }
        catch (error) {
            console.warn("⚠️ Auth routes failed:", error);
        }
        try {
            const { homePageRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/homepage/index.cjs')));
            app.use("/api/homepage", homePageRoutes);
            console.log("✅ Homepage routes configured");
        }
        catch (error) {
            console.warn("⚠️ Homepage routes failed:", error);
        }
        try {
            const { statsRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/user/index.cjs')));
            app.use("/api/stats", statsRoutes);
            console.log("✅ Stats routes configured");
        }
        catch (error) {
            console.warn("⚠️ Stats routes failed:", error);
        }
        try {
            const levelRoutes = await Promise.resolve().then(() => __importStar(require('./routes/level.cjs')));
            app.use("/api/level", levelRoutes.default);
            console.log("✅ Level routes configured");
        }
        catch (error) {
            console.warn("⚠️ Level routes failed:", error);
        }
        try {
            const recaptchaRoutes = await Promise.resolve().then(() => __importStar(require('./routes/recaptcha.cjs')));
            app.use("/api/recaptcha", recaptchaRoutes.default);
            console.log("✅ Recaptcha routes configured");
        }
        catch (error) {
            console.warn("⚠️ Recaptcha routes failed:", error);
        }
        const isDatabaseConnected = await checkDatabaseConnection();
        if (isDatabaseConnected) {
            console.log("🔄 Database connected, loading additional routes...");
            try {
                const { gymRoutes, enhancedGymRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/gym/index.cjs')));
                app.use("/api/gyms", gymRoutes);
                app.use("/api/enhanced-gym", enhancedGymRoutes);
                console.log("✅ Gym routes configured");
            }
            catch (error) {
                console.warn("⚠️ Gym routes failed:", error);
                if (error instanceof ReferenceError && error.message.includes('File is not defined')) {
                    console.warn("⚠️ File is not defined 오류는 무시하고 계속 진행합니다 (undici 모듈 문제)");
                }
            }
            try {
                const { machineRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/machine/index.cjs')));
                app.use("/api/machines", machineRoutes);
                console.log("✅ Machine routes configured");
            }
            catch (error) {
                console.warn("⚠️ Machine routes failed:", error);
            }
            try {
                const { postRoutes, commentRoutes, likeRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/social/index.cjs')));
                app.use("/api/posts", postRoutes);
                app.use("/api/comments", commentRoutes);
                app.use("/api/likes", likeRoutes);
                console.log("✅ Social routes configured");
            }
            catch (error) {
                console.warn("⚠️ Social routes failed:", error);
            }
            try {
                const { workoutRoutes } = await Promise.resolve().then(() => __importStar(require('./modules/workout/index.cjs')));
                app.use("/api/workouts", workoutRoutes);
                console.log("✅ Workout routes configured");
            }
            catch (error) {
                console.warn("⚠️ Workout routes failed:", error);
            }
            try {
                const rewardsRoutes = await Promise.resolve().then(() => __importStar(require('./routes/rewards.cjs')));
                app.use("/api/rewards", rewardsRoutes.default);
                console.log("✅ Rewards routes configured");
            }
            catch (error) {
                console.warn("⚠️ Rewards routes failed:", error);
            }
            try {
                const crawlingRoutes = await Promise.resolve().then(() => __importStar(require('./routes/crawling.cjs')));
                app.use("/api/crawling", crawlingRoutes.default);
                console.log("✅ Crawling routes configured");
            }
            catch (error) {
                console.warn("⚠️ Crawling routes failed:", error);
            }
        }
        else {
            console.log("⚠️ Database not connected, skipping database-dependent routes");
        }
        app.use((req, res, next) => {
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
        console.log("✅ All safe routes configured");
    }
    catch (error) {
        console.error("❌ Error setting up routes:", error);
    }
}
async function checkDatabaseConnection() {
    try {
        const { AppDataSource } = await Promise.resolve().then(() => __importStar(require('./config/databaseConfig.cjs')));
        return AppDataSource.isInitialized;
    }
    catch (error) {
        console.warn("⚠️ Database connection check failed:", error);
        return false;
    }
}
async function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => {
                resolve(true);
            });
            server.close();
        });
        server.on('error', () => {
            resolve(false);
        });
    });
}
async function findAvailablePort(startPort, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        const port = startPort + i;
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
    try {
        console.log("=".repeat(60));
        console.log("🔧 DEUKGEUN BACKEND SERVER STARTUP DEBUG START");
        console.log("=".repeat(60));
        console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔧 Node Version: ${process.version}`);
        console.log(`🔧 Process ID: ${process.pid}`);
        console.log(`🔧 Working Directory: ${process.cwd()}`);
        console.log(`🔧 Database Host: ${process.env.DB_HOST || "localhost"}`);
        console.log(`🔧 Database Port: ${process.env.DB_PORT || "3306"}`);
        console.log(`🔧 Database Name: ${process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db"}`);
        console.log("=".repeat(60));
        const preferredPort = parseInt(process.env.PORT || "5000");
        const environment = process.env.NODE_ENV || "development";
        console.log("🔄 Step 0: Performing startup validation...");
        const validationReport = await (0, serverStartup_1.performStartupValidation)(preferredPort);
        if (!validationReport.success) {
            if (environment === 'development') {
                console.warn("⚠️ Startup validation failed in development mode, continuing with limited functionality");
                console.warn("📊 Failed phases:");
                validationReport.phases
                    .filter(p => !p.success)
                    .forEach(p => console.warn(`   - ${p.name}: ${p.error || 'Unknown error'}`));
            }
            else {
                console.error("❌ Startup validation failed, aborting server start");
                process.exit(1);
            }
        }
        console.log("🔄 Step 1: Attempting database connection...");
        try {
            await (0, databaseConfig_1.connectDatabase)();
            console.log("✅ Database connection successful");
        }
        catch (dbError) {
            console.warn("⚠️ Database connection failed, starting server in limited mode");
            console.warn("   Error:", dbError instanceof Error ? dbError.message : String(dbError));
        }
        console.log("🔄 Step 2: Creating Express application...");
        const app = await createApp();
        console.log("✅ Express application created");
        console.log(`🔄 Step 3: Checking port availability...`);
        let port;
        try {
            if (await isPortAvailable(preferredPort)) {
                port = preferredPort;
                console.log(`✅ Port ${port} is available`);
            }
            else {
                console.log(`⚠️ Port ${preferredPort} is in use, finding alternative...`);
                port = await findAvailablePort(preferredPort);
                console.log(`✅ Found available port: ${port}`);
            }
        }
        catch (error) {
            console.error(`❌ Failed to find available port:`, error);
            throw error;
        }
        console.log(`🔄 Step 4: Starting server on port ${port}...`);
        const server = app.listen(port, '0.0.0.0', async () => {
            console.log("=".repeat(60));
            console.log("🚀 DEUKGEUN BACKEND SERVER STARTED");
            console.log("=".repeat(60));
            console.log(`🌐 Server URL: http://localhost:${port}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`🔧 Port: ${port}`);
            console.log(`🔧 Process ID: ${process.pid}`);
            console.log(`🔧 Node Version: ${process.version}`);
            console.log("📝 Available endpoints:");
            console.log(`   - GET  /health              - Health check`);
            console.log(`   - GET  /health/detailed     - Detailed health check`);
            console.log(`   - GET  /health/circuit-breakers - Circuit breaker status`);
            console.log(`   - GET  /debug              - Debug information`);
            console.log(`   - GET  /                   - API status`);
            console.log(`   - GET  /api/health         - API health check`);
            console.log("=".repeat(60));
            console.log("✅ Backend server is ready!");
            console.log("=".repeat(60));
            console.log("🔄 Step 5: Performing post-startup health check...");
            const healthCheckPassed = await (0, serverStartup_1.performPostStartupHealthCheck)();
            if (healthCheckPassed) {
                console.log("✅ Post-startup health check passed");
            }
            else {
                console.warn("⚠️ Post-startup health check failed, but server is running");
            }
            console.log("🔄 Step 6: Starting weekly crawling scheduler...");
            weeklyCrawlingScheduler_1.weeklyCrawlingScheduler.start();
            console.log("✅ Weekly crawling scheduler started");
        });
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${port} is already in use`);
                console.error("   Please check if another instance is running or use a different port");
            }
            else {
                console.error(`❌ Server error:`, error);
            }
            process.exit(1);
        });
        process.on('SIGTERM', () => {
            console.log('🔄 SIGTERM received, shutting down gracefully');
            weeklyCrawlingScheduler_1.weeklyCrawlingScheduler.stop();
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            console.log('🔄 SIGINT received, shutting down gracefully');
            weeklyCrawlingScheduler_1.weeklyCrawlingScheduler.stop();
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        });
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            process.exit(1);
        });
    }
    catch (error) {
        console.error("❌ Server startup failed:", error);
        console.error("   Error type:", error?.constructor?.name || "Unknown");
        console.error("   Error message:", error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error("   Error stack:", error.stack);
        }
        process.exit(1);
    }
}
startServer();
