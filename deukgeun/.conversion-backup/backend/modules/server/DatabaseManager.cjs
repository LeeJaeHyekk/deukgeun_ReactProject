"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.isDatabaseConnected = isDatabaseConnected;
exports.logDatabaseStatus = logDatabaseStatus;
const databaseConfig_1 = require("../../config/databaseConfig.cjs");
const logger_1 = require("../../utils/logger.cjs");
const LazyLoader_1 = require("./LazyLoader.cjs");
async function connectDatabase(config) {
    console.log("🔄 Step 2: Attempting database connection...");
    const dbStartTime = Date.now();
    try {
        const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
        const dbEndTime = Date.now();
        if (!dataSource.isInitialized) {
            throw new Error("Database connection not properly initialized");
        }
        console.log(`✅ Step 2: Database connected successfully in ${dbEndTime - dbStartTime}ms`);
        console.log(`📊 Database: ${process.env.DB_NAME || "deukgeun_db"} on ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`);
        console.log("🔄 Step 2.1: Skipping deprecated auto-update scheduler...");
        logger_1.logger.info("Auto-update scheduler is deprecated - using new crawling system");
        console.log("✅ Step 2.1: Skipped deprecated auto-update scheduler");
        return { connected: true };
    }
    catch (dbError) {
        const dbEndTime = Date.now();
        const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        const connectionTime = dbEndTime - dbStartTime;
        console.log(`❌ Step 2: Database connection failed in ${connectionTime}ms`);
        console.warn("⚠️ Database connection failed:", dbErrorMessage);
        if (dbErrorMessage.includes("timeout")) {
            console.log("⏰ Connection timeout - check if MySQL server is running and accessible");
        }
        else if (dbErrorMessage.includes("ECONNREFUSED")) {
            console.log("🔌 Connection refused - MySQL server may not be running");
        }
        else if (dbErrorMessage.includes("ER_ACCESS_DENIED_ERROR")) {
            console.log("🔐 Access denied - check database credentials");
        }
        else if (dbErrorMessage.includes("ER_BAD_DB_ERROR")) {
            console.log("📁 Database not found - check if database exists");
        }
        if (config.environment === 'development') {
            console.log("⚠️ Development mode: Continuing without database connection");
            console.log("💡 Limited functionality available - database features will be disabled");
            console.log("🔧 Database error details:", dbErrorMessage);
            console.log("🔧 Connection attempt took:", `${connectionTime}ms`);
            return { connected: false, error: dbErrorMessage };
        }
        else {
            console.error("❌ Database connection is required for production environment");
            console.log("=".repeat(60));
            console.log("❌ SERVER STARTUP FAILED - DATABASE CONNECTION REQUIRED");
            console.log("=".repeat(60));
            console.log("💡 Please check the following:");
            console.log("   - MySQL server is running");
            console.log("   - Database credentials are correct");
            console.log("   - Database exists and is accessible");
            console.log("   - Environment variables are properly set");
            console.log("   - Network connectivity to database server");
            console.log("=".repeat(60));
            console.log("🔧 Error details:", dbErrorMessage);
            console.log("🔧 Connection attempt took:", `${connectionTime}ms`);
            console.log("=".repeat(60));
            process.exit(1);
        }
    }
}
function isDatabaseConnected() {
    return databaseConfig_1.AppDataSource.isInitialized;
}
function logDatabaseStatus(connected) {
    if (connected) {
        console.log(`✅ Database: Connected to ${process.env.DB_NAME || "deukgeun_db"}`);
        console.log(`📊 Database Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`);
        console.log("🎯 Full API functionality available");
    }
    else {
        console.log("⚠️ Database: Not connected");
        console.log("🔧 Limited API functionality available");
        console.log("💡 Available endpoints: /health, /api/status");
    }
}
