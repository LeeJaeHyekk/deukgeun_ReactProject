"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironmentVariables = validateEnvironmentVariables;
exports.shouldStartServer = shouldStartServer;
const typeGuards_1 = require("../../utils/typeGuards.cjs");
const ConfigCache_1 = require("./ConfigCache.cjs");
async function validateEnvironmentVariables(config) {
    return (0, ConfigCache_1.getCachedValidationResult)(async () => {
        console.log("=".repeat(60));
        console.log("🔧 TYPE-SAFE ENVIRONMENT VALIDATION START");
        console.log("=".repeat(60));
        try {
            const validation = (0, typeGuards_1.validateAllConfigs)();
            if (!validation.isValid) {
                console.log("❌ Environment validation failed:");
                validation.allErrors.forEach(error => {
                    console.log(`   - ${error}`);
                });
                if (config.environment === 'production') {
                    console.log("=".repeat(60));
                    console.log("❌ PRODUCTION ENVIRONMENT VALIDATION FAILED");
                    console.log("=".repeat(60));
                    process.exit(1);
                }
                else {
                    console.log("⚠️ Development mode: Continuing with warnings...");
                    console.log("💡 Please check your .env file or environment variables");
                }
            }
            else {
                console.log("✅ All environment configurations are valid");
            }
            console.log("📊 Configuration Summary:");
            console.log(`   - Database: ${validation.configs.database.config?.host}:${validation.configs.database.config?.port}`);
            console.log(`   - JWT Secret: ${validation.configs.jwt.config?.secret ? 'Set' : 'Not set'}`);
            console.log("=".repeat(60));
            console.log("✅ TYPE-SAFE ENVIRONMENT VALIDATION COMPLETE");
            console.log("=".repeat(60));
            return {
                isValid: validation.isValid,
                errors: validation.allErrors,
                configs: validation.configs
            };
        }
        catch (error) {
            console.log("=".repeat(60));
            console.log("❌ ENVIRONMENT VALIDATION ERROR");
            console.log("=".repeat(60));
            console.error("❌ Error during validation:", error instanceof Error ? error.message : String(error));
            if (config.environment === 'production') {
                console.log("❌ Production environment requires valid configuration");
                process.exit(1);
            }
            else {
                console.log("⚠️ Development mode: Continuing with default values...");
            }
            console.log("=".repeat(60));
            return {
                isValid: false,
                errors: [error instanceof Error ? error.message : String(error)],
                configs: {
                    server: { isValid: false, config: null, errors: [] },
                    database: { isValid: false, config: null, errors: [] },
                    jwt: { isValid: false, config: null, errors: [] }
                }
            };
        }
    });
}
function shouldStartServer(validationResult, config) {
    if (validationResult.isValid) {
        return true;
    }
    if (config.environment === 'development') {
        console.log("⚠️ Development mode: Starting server despite validation warnings");
        return true;
    }
    console.log("❌ Production mode: Cannot start server with validation errors");
    return false;
}
