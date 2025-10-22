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
exports.cleanupUnusedModules = cleanupUnusedModules;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const UNUSED_SERVER_MODULES = [
    "src/backend/modules/server/ServerStarter.ts",
    "src/backend/modules/server/ServerManager.ts",
    "src/backend/modules/server/ServerValidator.ts",
    "src/backend/modules/server/PerformanceMonitor.ts"
];
const UNUSED_CRAWLING_MODULES = [
    "src/backend/modules/crawling/core/OptimizedCrawlingService.ts",
    "src/backend/modules/crawling/processors/BatchProcessor.ts",
    "src/backend/modules/crawling/processors/CrossValidator.ts",
    "src/backend/modules/crawling/processors/DataMerger.ts",
    "src/backend/modules/crawling/processors/UnifiedDataMerger.ts",
    "src/backend/modules/crawling/processors/EnhancedDataMerger.ts",
    "src/backend/modules/crawling/sources/search/DaumSearchEngine.ts",
    "src/backend/modules/crawling/sources/search/GoogleSearchEngine.ts",
    "src/backend/modules/crawling/sources/search/NaverBlogSearchEngine.ts",
    "src/backend/modules/crawling/sources/search/NaverCafeSearchEngine.ts",
    "src/backend/modules/crawling/sources/search/NaverSearchEngine.ts",
    "src/backend/modules/crawling/sources/search/SearchEngineFactory.ts",
    "src/backend/modules/crawling/strategies/NaverCafeFallbackStrategies.ts",
    "src/backend/modules/crawling/utils/AdaptiveRetryManager.ts",
    "src/backend/modules/crawling/utils/CircuitBreaker.ts",
    "src/backend/modules/crawling/utils/FallbackStrategyManager.ts"
];
const UNUSED_SCRIPTS = [
    "src/backend/scripts/test-crawling-basic.ts",
    "src/backend/scripts/test-crawling-complex.ts",
    "src/backend/scripts/test-crawling-fallback.ts",
    "src/backend/scripts/test-crawling-performance.ts",
    "src/backend/scripts/test-crawling-stress.ts",
    "src/backend/scripts/test-cross-validation-crawling.ts",
    "src/backend/scripts/test-improved-crawling.ts",
    "src/backend/scripts/test-integrated-crawling.ts",
    "src/backend/scripts/test-naver-cafe-search.ts",
    "src/backend/scripts/test-optimized-crawling.ts",
    "src/backend/scripts/test-seoul-api.ts",
    "src/backend/scripts/test-crawling-simple.cjs",
    "src/backend/scripts/test-crawling-simple.mjs",
    "src/backend/scripts/test-data-merging.cjs",
    "src/backend/scripts/test-data-merging.mjs",
    "src/backend/scripts/test-preserve-data-merging.cjs",
    "src/backend/scripts/test-preserve-data-merging.mjs",
    "src/backend/scripts/test-results-simulation.cjs",
    "src/backend/scripts/test-results-simulation.mjs",
    "src/backend/scripts/test-simple-crawling.cjs",
    "src/backend/scripts/test-simple-crawling.mjs"
];
function fileExists(filePath) {
    return fs.existsSync(filePath);
}
function safeDeleteFile(filePath) {
    try {
        if (fileExists(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Deleted: ${filePath}`);
            return true;
        }
        else {
            console.log(`⚠️ File not found: ${filePath}`);
            return false;
        }
    }
    catch (error) {
        console.error(`❌ Failed to delete ${filePath}:`, error);
        return false;
    }
}
function isDirectoryEmpty(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        return files.length === 0;
    }
    catch {
        return false;
    }
}
function removeEmptyDirectories(basePath) {
    const dirs = [
        "src/backend/modules/server",
        "src/backend/modules/crawling/processors",
        "src/backend/modules/crawling/sources/search",
        "src/backend/modules/crawling/strategies",
        "src/backend/modules/crawling/utils"
    ];
    dirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath) && isDirectoryEmpty(fullPath)) {
            try {
                fs.rmdirSync(fullPath);
                console.log(`✅ Removed empty directory: ${dir}`);
            }
            catch (error) {
                console.log(`⚠️ Could not remove directory ${dir}:`, error);
            }
        }
    });
}
async function cleanupUnusedModules() {
    console.log("=".repeat(60));
    console.log("🧹 CLEANING UP UNUSED MODULES");
    console.log("=".repeat(60));
    let deletedCount = 0;
    console.log("🔄 Cleaning up unused server modules...");
    UNUSED_SERVER_MODULES.forEach(module => {
        if (safeDeleteFile(module)) {
            deletedCount++;
        }
    });
    console.log("🔄 Cleaning up unused crawling modules...");
    UNUSED_CRAWLING_MODULES.forEach(module => {
        if (safeDeleteFile(module)) {
            deletedCount++;
        }
    });
    console.log("🔄 Cleaning up unused test scripts...");
    UNUSED_SCRIPTS.forEach(script => {
        if (safeDeleteFile(script)) {
            deletedCount++;
        }
    });
    console.log("🔄 Removing empty directories...");
    removeEmptyDirectories(process.cwd());
    console.log("=".repeat(60));
    console.log("✅ CLEANUP COMPLETED");
    console.log("=".repeat(60));
    console.log(`📊 Total files deleted: ${deletedCount}`);
    console.log("=".repeat(60));
}
if (require.main === module) {
    cleanupUnusedModules().catch(console.error);
}
