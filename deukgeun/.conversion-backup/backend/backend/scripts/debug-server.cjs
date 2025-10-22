#!/usr/bin/env npx tsx
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
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
(0, dotenv_1.config)();
async function runServerDebug() {
    console.log("=".repeat(80));
    console.log("🚀 SERVER STARTUP DEBUGGING SCRIPT");
    console.log("=".repeat(80));
    console.log("🔧 Environment Information:");
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
    console.log(`   - Working Directory: ${process.cwd()}`);
    console.log(`   - Node Version: ${process.version}`);
    console.log(`   - Platform: ${process.platform}`);
    console.log(`   - Process ID: ${process.pid}`);
    console.log("\n🔄 Step 1: Checking environment variables...");
    const criticalVars = {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '5000',
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || '3306',
        DB_USERNAME: process.env.DB_USERNAME || 'root',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        DB_DATABASE: process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db',
        JWT_SECRET: process.env.JWT_SECRET || '',
        CORS_ORIGIN: process.env.CORS_ORIGIN || ''
    };
    console.log("   Critical variables:");
    Object.entries(criticalVars).forEach(([key, value]) => {
        const isSet = value && value !== '';
        const displayValue = key.includes('PASSWORD') || key.includes('SECRET') ?
            (isSet ? '***' : 'NOT SET') :
            (isSet ? value : 'NOT SET');
        console.log(`     - ${key}: ${displayValue} ${isSet ? '✅' : '❌'}`);
    });
    console.log("\n🔄 Step 2: Testing Express app creation...");
    try {
        const app = (0, express_1.default)();
        console.log("   ✅ Express app created");
        app.use((0, helmet_1.default)());
        console.log("   ✅ Helmet middleware added");
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
        console.log("   ✅ CORS middleware added");
        app.use((0, morgan_1.default)("dev"));
        console.log("   ✅ Morgan middleware added");
        app.use((0, cookie_parser_1.default)());
        console.log("   ✅ Cookie parser middleware added");
        app.use(express_1.default.json({ limit: "10mb" }));
        app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
        console.log("   ✅ Body parsing middleware added");
        app.get("/", (req, res) => {
            res.json({
                message: "Deukgeun Backend API",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || "development",
                status: "healthy",
            });
        });
        console.log("   ✅ Basic routes added");
        console.log("   ✅ Express app configuration complete");
    }
    catch (error) {
        console.error("   ❌ Express app creation failed:");
        console.error(`     - Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    console.log("\n🔄 Step 3: Testing database connection (optional)...");
    try {
        const databaseModule = await Promise.resolve().then(() => __importStar(require('../config/databaseConfig')));
        console.log("   ✅ Database module imported");
        console.log(`   - Module keys: ${Object.keys(databaseModule).join(', ')}`);
        if (databaseModule.connectDatabase) {
            try {
                await databaseModule.connectDatabase();
                console.log("   ✅ Database connection successful");
            }
            catch (dbError) {
                console.warn("   ⚠️ Database connection failed (server will run in limited mode)");
                console.warn(`     - Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
            }
        }
        else {
            console.warn("   ⚠️ connectDatabase function not found in database module");
        }
    }
    catch (importError) {
        console.warn("   ⚠️ Database module import failed:");
        console.warn(`     - Error: ${importError instanceof Error ? importError.message : String(importError)}`);
        if (importError instanceof Error && importError.stack) {
            console.warn(`     - Stack: ${importError.stack}`);
        }
    }
    console.log("\n🔄 Step 4: Testing route module loading...");
    try {
        const routesModule = await Promise.resolve().then(() => __importStar(require('../routes')));
        console.log("   ✅ API routes module imported");
        console.log(`   - Module keys: ${Object.keys(routesModule).join(', ')}`);
        console.log(`   - Default export type: ${typeof routesModule.default}`);
        if (routesModule.default !== undefined) {
            console.log("   ✅ Default route export found");
        }
        else {
            console.warn("   ⚠️ No default export found in routes module");
        }
    }
    catch (routeError) {
        console.error("   ❌ API routes module import failed:");
        console.error(`     - Error: ${routeError instanceof Error ? routeError.message : String(routeError)}`);
        if (routeError instanceof Error && routeError.stack) {
            console.error(`     - Stack: ${routeError.stack}`);
        }
    }
    console.log("\n🔄 Step 5: Testing server startup...");
    const PORT = parseInt(process.env.PORT || '5000');
    try {
        const app = (0, express_1.default)();
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
        app.get("/", (req, res) => {
            res.json({
                message: "Deukgeun Backend API",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || "development",
                status: "healthy",
            });
        });
        app.get("/health", (req, res) => {
            res.status(200).json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development",
            });
        });
        const server = app.listen(PORT, () => {
            console.log(`   ✅ Server started successfully on port ${PORT}`);
            console.log(`   - URL: http://localhost:${PORT}`);
            console.log(`   - Health check: http://localhost:${PORT}/health`);
            setTimeout(() => {
                console.log("   🔄 Shutting down test server...");
                server.close(() => {
                    console.log("   ✅ Test server closed");
                    console.log("\n" + "=".repeat(80));
                    console.log("✅ SERVER STARTUP DEBUGGING COMPLETE");
                    console.log("=".repeat(80));
                    process.exit(0);
                });
            }, 2000);
        });
        server.on('error', (error) => {
            console.error("   ❌ Server startup failed:");
            console.error(`     - Error: ${error.message}`);
            process.exit(1);
        });
    }
    catch (error) {
        console.error("   ❌ Server startup test failed:");
        console.error(`     - Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
runServerDebug().catch(error => {
    console.error("❌ Server debugging failed:", error);
    process.exit(1);
})