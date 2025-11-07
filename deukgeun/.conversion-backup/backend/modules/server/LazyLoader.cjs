"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyLoad = lazyLoad;
exports.lazyLoadDatabase = lazyLoadDatabase;
exports.lazyLoadLogger = lazyLoadLogger;
exports.getLazyModuleStatus = getLazyModuleStatus;
exports.logLazyModuleStatus = logLazyModuleStatus;
exports.reloadLazyModule = reloadLazyModule;
exports.reloadAllLazyModules = reloadAllLazyModules;
const databaseConfig_1 = require("../../config/databaseConfig.cjs");
const logger_1 = require("../../utils/logger.cjs");
const lazyModules = new Map();
async function lazyLoad(moduleName, loader, fallback) {
    const state = lazyModules.get(moduleName);
    if (state?.loaded) {
        console.log(`📦 Using cached module: ${moduleName}`);
        return loader();
    }
    if (state?.loading) {
        console.log(`⏳ Module already loading: ${moduleName}`);
        while (lazyModules.get(moduleName)?.loading) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return loader();
    }
    console.log(`🔄 Lazy loading module: ${moduleName}`);
    const startTime = Date.now();
    lazyModules.set(moduleName, { loaded: false, loading: true });
    try {
        const result = await loader();
        const loadTime = Date.now() - startTime;
        lazyModules.set(moduleName, {
            loaded: true,
            loading: false,
            loadTime
        });
        console.log(`✅ Module loaded: ${moduleName} (${loadTime}ms)`);
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        lazyModules.set(moduleName, {
            loaded: false,
            loading: false,
            error: errorMessage
        });
        console.error(`❌ Module load failed: ${moduleName} - ${errorMessage}`);
        if (fallback) {
            console.log(`🔄 Using fallback for module: ${moduleName}`);
            return fallback;
        }
        throw error;
    }
}
async function withTimeout(promise, timeoutMs, errorMessage = "Operation timed out") {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
        }, timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    }
    finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}
async function lazyLoadDatabase() {
    return lazyLoad('database', async () => {
        console.log("🔄 Initializing database connection...");
        if (!databaseConfig_1.AppDataSource.isInitialized) {
            try {
                await withTimeout(databaseConfig_1.AppDataSource.initialize(), 15000, "Database connection timeout");
                console.log("✅ Database connection established successfully");
                if (databaseConfig_1.AppDataSource.isInitialized) {
                    console.log("📊 Database connection verified");
                    return databaseConfig_1.AppDataSource;
                }
                else {
                    throw new Error("Database initialization completed but connection not verified");
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error("❌ Database initialization failed:", errorMessage);
                if (databaseConfig_1.AppDataSource.isInitialized) {
                    try {
                        await databaseConfig_1.AppDataSource.destroy();
                        console.log("🔄 Database connection cleaned up after failure");
                    }
                    catch (cleanupError) {
                        console.warn("⚠️ Failed to cleanup database connection:", cleanupError);
                    }
                }
                throw new Error(`Database connection failed: ${errorMessage}`);
            }
        }
        else {
            console.log("📦 Using existing database connection");
            return databaseConfig_1.AppDataSource;
        }
    }, databaseConfig_1.AppDataSource);
}
async function lazyLoadLogger() {
    return lazyLoad('logger', async () => {
        return logger_1.logger;
    }, logger_1.logger);
}
function getLazyModuleStatus(moduleName) {
    if (moduleName) {
        return lazyModules.get(moduleName) || { loaded: false, loading: false };
    }
    return new Map(lazyModules);
}
function logLazyModuleStatus() {
    console.log("📊 Lazy Module Status:");
    for (const [name, state] of lazyModules) {
        const status = state.loaded ? '✅' : state.loading ? '⏳' : '❌';
        const time = state.loadTime ? ` (${state.loadTime}ms)` : '';
        const error = state.error ? ` - ${state.error}` : '';
        console.log(`   ${status} ${name}${time}${error}`);
    }
}
function reloadLazyModule(moduleName) {
    lazyModules.delete(moduleName);
    console.log(`🔄 Module marked for reload: ${moduleName}`);
}
function reloadAllLazyModules() {
    lazyModules.clear();
    console.log("🔄 All modules marked for reload");
}
