"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedServerConfig = getCachedServerConfig;
exports.getCachedValidationResult = getCachedValidationResult;
exports.invalidateCache = invalidateCache;
exports.getCacheStatus = getCacheStatus;
exports.setCacheTTL = setCacheTTL;
let configCache = {
    serverConfig: null,
    validationResult: null,
    lastUpdated: 0,
    ttl: 30000
};
function isCacheValid() {
    const now = Date.now();
    return configCache.lastUpdated > 0 && (now - configCache.lastUpdated) < configCache.ttl;
}
function getCachedServerConfig(createFn) {
    if (isCacheValid() && configCache.serverConfig) {
        console.log("📦 Using cached server config");
        return configCache.serverConfig;
    }
    console.log("🔄 Creating new server config");
    const config = createFn();
    configCache.serverConfig = config;
    configCache.lastUpdated = Date.now();
    return config;
}
function getCachedValidationResult(createFn) {
    if (isCacheValid() && configCache.validationResult) {
        console.log("📦 Using cached validation result");
        return Promise.resolve(configCache.validationResult);
    }
    console.log("🔄 Creating new validation result");
    return createFn().then(result => {
        configCache.validationResult = result;
        configCache.lastUpdated = Date.now();
        return result;
    });
}
function invalidateCache() {
    console.log("🗑️ Invalidating config cache");
    configCache = {
        serverConfig: null,
        validationResult: null,
        lastUpdated: 0,
        ttl: configCache.ttl
    };
}
function getCacheStatus() {
    return {
        hasServerConfig: configCache.serverConfig !== null,
        hasValidationResult: configCache.validationResult !== null,
        isValid: isCacheValid(),
        lastUpdated: configCache.lastUpdated,
        ttl: configCache.ttl
    };
}
function setCacheTTL(ttl) {
    configCache.ttl = ttl;
    console.log(`⏰ Cache TTL set to ${ttl}ms`);
}
