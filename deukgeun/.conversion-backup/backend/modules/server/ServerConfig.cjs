"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerConfig = createServerConfig;
exports.logServerConfig = logServerConfig;
const typeGuards_1 = require('../../utils/typeGuards.cjs');
const ConfigCache_1 = require('./ConfigCache.cjs');
const DEFAULT_CORS_ORIGINS = [
    "https://devtrail.net",
    "https://www.devtrail.net",
    "http://43.203.30.167:3000",
    "http://43.203.30.167:5000",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "http://localhost:5001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
];
function createServerConfig() {
    return (0, ConfigCache_1.getCachedServerConfig)(() => {
        console.log("🔧 Creating server config...");
        const port = (0, typeGuards_1.safeGetEnvNumber)('PORT', 5000);
        const nodeEnv = (0, typeGuards_1.safeGetEnvString)('NODE_ENV', 'development');
        const corsOrigin = (0, typeGuards_1.safeGetEnvArray)('CORS_ORIGIN', [...DEFAULT_CORS_ORIGINS]);
        const config = {
            port,
            environment: nodeEnv,
            corsOrigin
        };
        console.log("✅ Server config created successfully");
        console.log(`   - Port: ${port}`);
        console.log(`   - Environment: ${nodeEnv}`);
        console.log(`   - CORS Origins: ${corsOrigin.length} configured`);
        return config;
    });
}
function logServerConfig(config) {
    console.log("📊 Server Configuration:");
    console.log(`   - Port: ${config.port}`);
    console.log(`   - Environment: ${config.environment}`);
    console.log(`   - CORS Origins: ${config.corsOrigin.join(', ')}`);
}
