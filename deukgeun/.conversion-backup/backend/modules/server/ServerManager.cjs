"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAndStartServer = void 0;
exports.handleServerStartupError = handleServerStartupError;
const ServerConfig_1 = require('./ServerConfig.cjs');
const ServerValidator_1 = require('./ServerValidator.cjs');
const DatabaseManager_1 = require('./DatabaseManager.cjs');
const ServerStarter_1 = require('./ServerStarter.cjs');
const PerformanceMonitor_1 = require('./PerformanceMonitor.cjs');
exports.initializeAndStartServer = (0, PerformanceMonitor_1.measureAsyncPerformance)('server-initialization', async () => {
    console.log("=".repeat(60));
    console.log("🔧 SERVER STARTUP START");
    console.log("=".repeat(60));
    const config = (0, ServerConfig_1.createServerConfig)();
    console.log(`🔧 Environment: ${config.environment}`);
    console.log(`🔧 Process ID: ${process.pid}`);
    console.log(`🔧 Node Version: ${process.version}`);
    (0, PerformanceMonitor_1.logMemoryUsage)();
    try {
        console.log("🔄 Step 1: Validating environment variables...");
        const validation = await (0, ServerValidator_1.validateEnvironmentVariables)(config);
        console.log(`✅ Step 1: Environment validation completed`);
        const database = await (0, DatabaseManager_1.connectDatabase)(config);
        const startup = await (0, ServerStarter_1.startExpressServer)(config, database);
        (0, ServerStarter_1.setupGracefulShutdown)(startup.server);
        (0, PerformanceMonitor_1.logPerformanceMetrics)();
        (0, PerformanceMonitor_1.logMemoryUsage)();
        return {
            server: startup.server,
            config,
            validation,
            database,
            startup
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log("=".repeat(60));
        console.log("❌ SERVER INITIALIZATION FAILED");
        console.log("=".repeat(60));
        console.error("❌ Server initialization failed:", errorMessage);
        if (error instanceof Error && error.stack) {
            console.error("❌ Error stack:", error.stack);
        }
        console.log("=".repeat(60));
        throw error;
    }
}, { environment: process.env.NODE_ENV || 'development' });
function handleServerStartupError(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("❌ Server startup failed:", errorMessage);
    console.error("❌ Error details:", errorStack);
    process.exit(1);
}
