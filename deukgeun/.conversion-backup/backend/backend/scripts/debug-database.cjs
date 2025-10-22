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
const typeorm_1 = require("typeorm");
const promise_1 = __importDefault(require("mysql2/promise"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function runDatabaseDebug() {
    console.log("=".repeat(80));
    console.log("🗄️ DATABASE DEBUGGING SCRIPT");
    console.log("=".repeat(80));
    console.log("🔧 Environment Information:");
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
    console.log(`   - Working Directory: ${process.cwd()}`);
    console.log(`   - Script Location: ${__filename}`);
    console.log("\n🗄️ Database Configuration:");
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db'
    };
    console.log(`   - Host: ${dbConfig.host}`);
    console.log(`   - Port: ${dbConfig.port}`);
    console.log(`   - Username: ${dbConfig.username}`);
    console.log(`   - Password: ${dbConfig.password ? '***' : 'NOT SET'}`);
    console.log(`   - Database: ${dbConfig.database}`);
    console.log("\n🔄 Step 1: Testing MySQL server connection...");
    try {
        const connection = await promise_1.default.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.username,
            password: dbConfig.password,
        });
        console.log("✅ MySQL server connection successful");
        const [serverInfo] = await connection.query('SELECT VERSION() as version, NOW() as current_time');
        console.log(`   - MySQL Version: ${serverInfo[0].version}`);
        console.log(`   - Server Time: ${serverInfo[0].current_time}`);
        await connection.end();
    }
    catch (error) {
        console.error("❌ MySQL server connection failed:");
        console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED')) {
                console.error("   - Issue: Connection refused - MySQL server is not running");
            }
            else if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
                console.error("   - Issue: Access denied - Check username/password");
            }
            else if (error.message.includes('ENOTFOUND')) {
                console.error("   - Issue: Host not found - Check DB_HOST");
            }
        }
        console.log("\n💡 Troubleshooting Tips:");
        console.log("   1. Check if MySQL server is running");
        console.log("   2. Verify DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD");
        console.log("   3. Check firewall settings");
        console.log("   4. Try: mysql -h localhost -P 3306 -u root -p");
        process.exit(1);
    }
    console.log("\n🔄 Step 2: Checking database existence...");
    try {
        const connection = await promise_1.default.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.username,
            password: dbConfig.password,
        });
        const [databases] = await connection.query('SHOW DATABASES');
        const dbNames = databases.map(db => db.Database);
        const dbExists = dbNames.includes(dbConfig.database);
        console.log(`   - Database '${dbConfig.database}' exists: ${dbExists ? '✅ YES' : '❌ NO'}`);
        if (!dbExists) {
            console.log("   - Available databases:", dbNames.join(', '));
            console.log("   - Creating database...");
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
            console.log("   ✅ Database created successfully");
        }
        await connection.end();
    }
    catch (error) {
        console.error("❌ Database check failed:");
        console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    console.log("\n🔄 Step 3: Testing TypeORM DataSource configuration...");
    const entityPaths = [
        'src/backend/entities/**/*.ts',
        'dist/backend/entities/**/*.js',
        path.join(process.cwd(), 'src', 'backend', 'entities', '**', '*.ts'),
        path.join(process.cwd(), 'dist', 'backend', 'entities', '**', '*.js')
    ];
    console.log("   - Entity paths to check:");
    entityPaths.forEach((entityPath, index) => {
        console.log(`     ${index + 1}. ${entityPath}`);
    });
    const testDataSource = new typeorm_1.DataSource({
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
    console.log("   - DataSource configuration created");
    console.log(`   - Type: ${testDataSource.options.type}`);
    console.log(`   - Host: ${testDataSource.options.host || 'N/A'}`);
    console.log(`   - Port: ${testDataSource.options.port || 'N/A'}`);
    console.log(`   - Database: ${testDataSource.options.database}`);
    console.log(`   - Username: ${testDataSource.options.username || 'N/A'}`);
    console.log("\n🔄 Step 4: Testing DataSource initialization...");
    try {
        await testDataSource.initialize();
        console.log("✅ DataSource initialization successful");
        console.log(`   - Is Initialized: ${testDataSource.isInitialized}`);
        console.log(`   - Connection Name: ${testDataSource.name}`);
        const result = await testDataSource.query("SELECT 1 as test, NOW() as current_time");
        console.log("   - Query test result:", result);
        await testDataSource.destroy();
        console.log("   - DataSource destroyed");
    }
    catch (error) {
        console.error("❌ DataSource initialization failed:");
        console.error(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
            console.error("   - Stack trace:");
            console.error(error.stack);
        }
    }
    console.log("\n🔄 Step 5: Checking entity files...");
    const entityDir = path.join(process.cwd(), 'src', 'backend', 'entities');
    const distEntityDir = path.join(process.cwd(), 'dist', 'backend', 'entities');
    console.log(`   - Source entities: ${entityDir}`);
    console.log(`   - Source exists: ${fs.existsSync(entityDir) ? '✅' : '❌'}`);
    console.log(`   - Dist entities: ${distEntityDir}`);
    console.log(`   - Dist exists: ${fs.existsSync(distEntityDir) ? '✅' : '❌'}`);
    if (fs.existsSync(entityDir)) {
        const entityFiles = fs.readdirSync(entityDir, { recursive: true })
            .filter((file) => file.endsWith('.ts'));
        console.log(`   - Entity files found: ${entityFiles.length}`);
        entityFiles.slice(0, 5).forEach((file) => {
            console.log(`     - ${file}`);
        });
        if (entityFiles.length > 5) {
            console.log(`     ... and ${entityFiles.length - 5} more`);
        }
    }
    console.log("\n" + "=".repeat(80));
    console.log("✅ DATABASE DEBUGGING COMPLETE");
    console.log("=".repeat(80));
}
runDatabaseDebug().catch(error => {
    console.error("❌ Database debugging failed:", error);
    process.exit(1);
});
