// ============================================================================
// 사용하지 않는 모듈 정리 스크립트
// ============================================================================

import * as fs from "fs"
import * as path from "path"

/**
 * 사용하지 않는 서버 모듈들
 */
const UNUSED_SERVER_MODULES = [
  "src/backend/modules/server/ServerStarter.ts",
  "src/backend/modules/server/ServerManager.ts", 
  "src/backend/modules/server/ServerValidator.ts",
  "src/backend/modules/server/PerformanceMonitor.ts"
]

/**
 * 사용하지 않는 크롤링 모듈들
 */
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
]

/**
 * 사용하지 않는 스크립트들
 */
const UNUSED_SCRIPTS = [
  // 이미 제거된 파일들 (목록에만 유지)
  "src/backend/scripts/test-crawling-simple.cjs",
  "src/backend/scripts/test-crawling-simple.mjs",
  "src/backend/scripts/test-data-merging.cjs",
  "src/backend/scripts/test-data-merging.mjs",
  "src/backend/scripts/test-preserve-data-merging.cjs",
  "src/backend/scripts/test-preserve-data-merging.mjs",
  "src/backend/scripts/test-results-simulation.cjs",
  "src/backend/scripts/test-results-simulation.mjs",
  "src/backend/scripts/test-simple-crawling.cjs",
  "src/backend/scripts/test-simple-crawling.mjs",
  // 사용되지 않는 테스트 파일들 (다른 파일에서 import되지 않음)
  "src/backend/scripts/testCrossValidationCrawling.ts",
  "src/backend/scripts/testNaverCafeSearch.ts",
  "src/backend/scripts/testIntegratedCrawling.ts",
  "src/backend/scripts/testImprovedCrawling.ts",
  "src/backend/scripts/testOptimizedCrawling.ts",
  "src/backend/scripts/testSeoulApi.ts"
]

/**
 * 파일이 존재하는지 확인
 */
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

/**
 * 파일을 안전하게 삭제
 */
function safeDeleteFile(filePath: string): boolean {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`✅ Deleted: ${filePath}`)
      return true
    } else {
      console.log(`⚠️ File not found: ${filePath}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Failed to delete ${filePath}:`, error)
    return false
  }
}

/**
 * 디렉토리가 비어있는지 확인
 */
function isDirectoryEmpty(dirPath: string): boolean {
  try {
    const files = fs.readdirSync(dirPath)
    return files.length === 0
  } catch {
    return false
  }
}

/**
 * 빈 디렉토리 삭제
 */
function removeEmptyDirectories(basePath: string): void {
  const dirs = [
    "src/backend/modules/server",
    "src/backend/modules/crawling/processors",
    "src/backend/modules/crawling/sources/search",
    "src/backend/modules/crawling/strategies",
    "src/backend/modules/crawling/utils"
  ]

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath) && isDirectoryEmpty(fullPath)) {
      try {
        fs.rmdirSync(fullPath)
        console.log(`✅ Removed empty directory: ${dir}`)
      } catch (error) {
        console.log(`⚠️ Could not remove directory ${dir}:`, error)
      }
    }
  })
}

/**
 * 메인 정리 함수
 */
async function cleanupUnusedModules(): Promise<void> {
  console.log("=".repeat(60))
  console.log("🧹 CLEANING UP UNUSED MODULES")
  console.log("=".repeat(60))

  let deletedCount = 0

  // 사용하지 않는 서버 모듈 정리
  console.log("🔄 Cleaning up unused server modules...")
  UNUSED_SERVER_MODULES.forEach(module => {
    if (safeDeleteFile(module)) {
      deletedCount++
    }
  })

  // 사용하지 않는 크롤링 모듈 정리
  console.log("🔄 Cleaning up unused crawling modules...")
  UNUSED_CRAWLING_MODULES.forEach(module => {
    if (safeDeleteFile(module)) {
      deletedCount++
    }
  })

  // 사용하지 않는 스크립트 정리
  console.log("🔄 Cleaning up unused test scripts...")
  UNUSED_SCRIPTS.forEach(script => {
    if (safeDeleteFile(script)) {
      deletedCount++
    }
  })

  // 빈 디렉토리 정리
  console.log("🔄 Removing empty directories...")
  removeEmptyDirectories(process.cwd())

  console.log("=".repeat(60))
  console.log("✅ CLEANUP COMPLETED")
  console.log("=".repeat(60))
  console.log(`📊 Total files deleted: ${deletedCount}`)
  console.log("=".repeat(60))
}

// 스크립트 실행
if (require.main === module) {
  cleanupUnusedModules().catch(console.error)
}

export { cleanupUnusedModules }
