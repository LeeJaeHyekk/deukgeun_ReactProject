"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpressServer = startExpressServer;
exports.setupGracefulShutdown = setupGracefulShutdown;
const app_1 = __importDefault(require("../../app.cjs"));
const logger_1 = require("../../utils/logger.cjs");
const getAvailablePort_1 = require("../../utils/getAvailablePort.cjs");
async function startExpressServer(config, databaseResult) {
    console.log("🔄 Step 3: Getting available port...");
    const portStartTime = Date.now();
    const availablePort = await (0, getAvailablePort_1.getAvailablePort)(config.port || 5000);
    const portEndTime = Date.now();
    console.log(`✅ Step 3: Available port found: ${availablePort} in ${portEndTime - portStartTime}ms`);
    console.log("🔄 Step 4: Starting Express server...");
    const serverStartTime = Date.now();
    return new Promise((resolve, reject) => {
        const server = app_1.default.listen(availablePort, () => {
            const serverEndTime = Date.now();
            const startupTime = serverEndTime - serverStartTime;
            logger_1.logger.info(`🚀 Server is running on port ${availablePort}`);
            logServerStartupInfo(availablePort, config, databaseResult, startupTime);
            resolve({
                server,
                port: availablePort,
                startupTime
            });
        });
        server.on('error', (error) => {
            console.error("❌ Server error:", error);
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${availablePort} is already in use`);
                console.log("💡 Try using a different port or stop the existing server");
            }
            reject(error);
        });
    });
}
function logServerStartupInfo(port, config, databaseResult, startupTime) {
    console.log("=".repeat(60));
    console.log("🚀 DEUKGEUN BACKEND SERVER STARTED");
    console.log("=".repeat(60));
    console.log(`🌐 Server URL: http://localhost:${port}`);
    console.log(`📊 Environment: ${config.environment}`);
    console.log(`🔧 Port: ${port}`);
    console.log(`⏱️ Server startup time: ${startupTime}ms`);
    console.log(`🔧 Process ID: ${process.pid}`);
    console.log(`🔧 Node Version: ${process.version}`);
    console.log(`🔧 Platform: ${process.platform}`);
    console.log(`🔧 Architecture: ${process.arch}`);
    if (databaseResult.connected) {
        console.log(`✅ Database: Connected to ${process.env.DB_NAME || "deukgeun_db"}`);
        console.log(`📊 Database Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`);
        console.log("🎯 Full API functionality available");
    }
    else {
        console.log("⚠️ Database: Not connected");
        console.log("🔧 Limited API functionality available");
        console.log("💡 Available endpoints: /health, /api/status");
    }
    console.log("📝 Available endpoints:");
    console.log(`   - GET  /health     - Health check`);
    console.log(`   - GET  /debug      - Debug information`);
    if (databaseResult.connected) {
        console.log(`   - GET  /api/*      - Full API endpoints`);
    }
    else {
        console.log(`   - GET  /api/status - API status`);
    }
    console.log("=".repeat(60));
    console.log("✅ Backend server is ready!");
    console.log("=".repeat(60));
}
function setupGracefulShutdown(server) {
    process.on('SIGTERM', () => {
        console.log('🔄 SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
    process.on('SIGINT', () => {
        console.log('🔄 SIGINT received, shutting down gracefully');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
}
