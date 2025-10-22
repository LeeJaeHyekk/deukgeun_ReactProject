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
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv_1 = require("dotenv");
console.log("=".repeat(80));
console.log("🔧 ENVIRONMENT DEBUGGING SCRIPT");
console.log("=".repeat(80));
console.log("📁 Directory Information:");
console.log(`   - Current Working Directory: ${process.cwd()}`);
console.log(`   - Script Location: ${__filename}`);
console.log(`   - Script Directory: ${path.dirname(__filename)}`);
console.log("\n🔧 Node.js Environment:");
console.log(`   - Node Version: ${process.version}`);
console.log(`   - Platform: ${process.platform}`);
console.log(`   - Architecture: ${process.arch}`);
console.log(`   - Process ID: ${process.pid}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log("\n📄 Environment File Paths:");
const envPaths = [
    '.env.local',
    '.env',
    'env.development',
    'env.production',
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'env.development'),
    path.join(process.cwd(), 'env.production'),
    path.join(process.cwd(), 'src', 'backend', '.env'),
    path.join(process.cwd(), 'src', 'backend', 'env.development'),
];
envPaths.forEach((envPath, index) => {
    const exists = fs.existsSync(envPath);
    const resolved = path.resolve(envPath);
    console.log(`   ${index + 1}. ${envPath}`);
    console.log(`      Resolved: ${resolved}`);
    console.log(`      Exists: ${exists ? '✅ YES' : '❌ NO'}`);
    if (exists) {
        try {
            const stats = fs.statSync(envPath);
            console.log(`      Size: ${stats.size} bytes`);
            console.log(`      Modified: ${stats.mtime.toISOString()}`);
        }
        catch (error) {
            console.log(`      Error reading file: ${error}`);
        }
    }
    console.log();
});
console.log("🔄 Attempting to load environment variables...");
let loadedEnvPath = null;
let loadedVars = 0;
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        try {
            console.log(`   🔄 Loading: ${envPath}`);
            const result = (0, dotenv_1.config)({ path: envPath });
            if (result.parsed && Object.keys(result.parsed).length > 0) {
                loadedEnvPath = envPath;
                loadedVars = Object.keys(result.parsed).length;
                console.log(`   ✅ Successfully loaded ${loadedVars} variables`);
                break;
            }
        }
        catch (error) {
            console.log(`   ❌ Failed to load: ${error}`);
        }
    }
}
if (!loadedEnvPath) {
    console.log("⚠️ No environment file loaded, using system environment variables");
}
console.log("\n🔑 Critical Environment Variables:");
const criticalVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'DB_NAME',
    'JWT_SECRET',
    'CORS_ORIGIN'
];
criticalVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = value !== undefined && value !== '';
    const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') ?
        (isSet ? '***' : 'NOT SET') :
        (isSet ? value : 'NOT SET');
    console.log(`   - ${varName}: ${displayValue} ${isSet ? '✅' : '❌'}`);
});
console.log("\n🗄️ Database Configuration:");
console.log(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   - Port: ${process.env.DB_PORT || '3306'}`);
console.log(`   - Username: ${process.env.DB_USERNAME || 'root'}`);
console.log(`   - Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
console.log(`   - Database: ${process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db'}`);
console.log("\n🔐 JWT Configuration:");
console.log(`   - Secret: ${process.env.JWT_SECRET ? 'SET ✅' : 'NOT SET ❌'}`);
console.log(`   - Expires In: ${process.env.JWT_EXPIRES_IN || 'NOT SET'}`);
console.log("\n🌐 CORS Configuration:");
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
    const origins = corsOrigin.split(',').filter(origin => origin.trim() !== '');
    console.log(`   - Origins: ${origins.join(', ')}`);
}
else {
    console.log(`   - Origins: DEFAULT (localhost ports)`);
}
console.log("\n🔑 API Keys Configuration:");
const apiKeys = [
    'KAKAO_API_KEY',
    'GOOGLE_PLACES_API_KEY',
    'SEOUL_OPENAPI_KEY',
    'VITE_GYM_API_KEY'
];
apiKeys.forEach(key => {
    const value = process.env[key];
    console.log(`   - ${key}: ${value ? 'SET ✅' : 'NOT SET ⚠️'}`);
});
console.log("\n💡 Recommendations:");
if (!process.env.DB_PASSWORD) {
    console.log("   ⚠️ DB_PASSWORD is not set - database connection may fail");
}
if (!process.env.JWT_SECRET) {
    console.log("   ⚠️ JWT_SECRET is not set - authentication will not work");
}
if (!loadedEnvPath) {
    console.log("   ⚠️ No .env file found - create one with your configuration");
}
console.log("\n" + "=".repeat(80));
console.log("✅ ENVIRONMENT DEBUGGING COMPLETE");
console.log("=".repeat(80));
