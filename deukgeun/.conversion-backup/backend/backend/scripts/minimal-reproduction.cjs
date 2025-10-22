#!/usr/bin/env npx tsx
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const promise_1 = __importDefault(require("mysql2/promise"));
(0, dotenv_1.config)();
async function runMinimalReproduction() {
    console.log("=".repeat(80));
    console.log("🔬 MINIMAL REPRODUCTION SCRIPT");
    console.log("=".repeat(80));
    console.log("🔧 Environment Information:");
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
    console.log(`   - Working Directory: ${process.cwd()}`);
    console.log(`   - Node Version: ${process.version}`);
    console.log(`   - Process ID: ${process.pid}`);
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db'
    };
    console.log("\n🗄️ Database Configuration:");
    console.log(`   - Host: ${dbConfig.host}`);
    console.log(`   - Port: ${dbConfig.port}`);
    console.log(`   - Username: ${dbConfig.username}`);
    console.log(`   - Password: ${dbConfig.password ? '***' : 'NOT SET'}`);
    console.log(`   - Database: ${dbConfig.database}`);
    console.log("\n🔄 Step 1: Direct MySQL connection test...");
    try {
        const connection = await promise_1.default.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.username,
            password: dbConfig.password,
        });
        console.log("✅ Direct MySQL connection successful");
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        console.log(`✅ Database '${dbConfig.database}' ready`);
        await connection.end();
    }
    catch (error) {
        console.error("❌ Direct MySQL connection failed:");
        console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
    console.log("\n🔄 Step 2: TypeORM DataSource minimal test...");
    const dataSource = new typeorm_1.DataSource({
        type: "mysql",
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        synchronize: false,
        logging: true,
        entities: [],
    });
    try {
        await dataSource.initialize();
        console.log("✅ TypeORM DataSource initialization successful");
        console.log(`   - Is Initialized: ${dataSource.isInitialized}`);
        const result = await dataSource.query("SELECT 1 as test, NOW() as current_time");
        console.log("   - Query result:", result);
        await dataSource.destroy();
        console.log("   - DataSource destroyed");
    }
    catch (error) {
        console.error("❌ TypeORM DataSource initialization failed:");
        console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
            console.error("   - Stack trace:");
            console.error(error.stack);
        }
    }
    console.log("\n🔄 Step 3: Express server minimal test...");
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.get("/", (req, res) => {
        res.json({
            message: "Minimal reproduction test",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
            status: "healthy"
        });
    });
    app.get("/health", (req, res) => {
        res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
    const PORT = parseInt(process.env.PORT || '5000');
    const server = app.listen(PORT, () => {
        console.log(`✅ Express server started on port ${PORT}`);
        console.log(`   - URL: http://localhost:${PORT}`);
        console.log(`   - Health: http://localhost:${PORT}/health`);
        setTimeout(() => {
            console.log("\n🔄 Shutting down test server...");
            server.close(() => {
                console.log("✅ Test server closed");
                console.log("\n" + "=".repeat(80));
                console.log("✅ MINIMAL REPRODUCTION TEST COMPLETE");
                console.log("=".repeat(80));
                console.log("\n💡 If this test passes, the issue is likely in:");
                console.log("   1. Environment variable loading order");
                console.log("   2. Database connection timing");
                console.log("   3. Route registration sequence");
                console.log("   4. Entity file paths");
                process.exit(0);
            });
        }, 3000);
    });
    server.on('error', (error) => {
        console.error("❌ Express server startup failed:");
        console.error(`   - Error: ${error.message}`);
        process.exit(1);
    });
}
runMinimalReproduction().catch(error => {
    console.error("❌ Minimal reproduction test failed:", error);
    process.exit(1);
});
