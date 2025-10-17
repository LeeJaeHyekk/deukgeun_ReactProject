#!/usr/bin/env tsx

/**
 * 백엔드 상대경로를 절대경로로 변경하는 스크립트
 */

import * as fs from 'fs'
import * as path from 'path'
import glob from 'glob'

// 백엔드 디렉토리 경로
const BACKEND_DIR = 'src/backend'

// 상대경로를 절대경로로 매핑하는 규칙
const PATH_MAPPINGS = [
  // 크롤링 모듈 관련
  { from: /from ['"]\.\.\/types\/CrawlingTypes['"]/g, to: "from '@backend/modules/crawling/types/CrawlingTypes'" },
  { from: /from ['"]\.\.\/utils\/PerformanceMonitor['"]/g, to: "from '@backend/modules/crawling/utils/PerformanceMonitor'" },
  { from: /from ['"]\.\.\/utils\/AntiDetectionUtils['"]/g, to: "from '@backend/modules/crawling/utils/AntiDetectionUtils'" },
  { from: /from ['"]\.\.\/utils\/AdaptiveRetryManager['"]/g, to: "from '@backend/modules/crawling/utils/AdaptiveRetryManager'" },
  { from: /from ['"]\.\.\/utils\/FallbackStrategyManager['"]/g, to: "from '@backend/modules/crawling/utils/FallbackStrategyManager'" },
  { from: /from ['"]\.\.\/utils\/CrawlingMetrics['"]/g, to: "from '@backend/modules/crawling/utils/CrawlingMetrics'" },
  { from: /from ['"]\.\.\/utils\/CrawlingUtils['"]/g, to: "from '@backend/modules/crawling/utils/CrawlingUtils'" },
  { from: /from ['"]\.\.\/processors\/CrossValidator['"]/g, to: "from '@backend/modules/crawling/processors/CrossValidator'" },
  { from: /from ['"]\.\.\/processors\/PriceExtractor['"]/g, to: "from '@backend/modules/crawling/processors/PriceExtractor'" },
  { from: /from ['"]\.\.\/processors\/BatchProcessor['"]/g, to: "from '@backend/modules/crawling/processors/BatchProcessor'" },
  { from: /from ['"]\.\.\/processors\/DataMerger['"]/g, to: "from '@backend/modules/crawling/processors/DataMerger'" },
  { from: /from ['"]\.\.\/processors\/DataValidator['"]/g, to: "from '@backend/modules/crawling/processors/DataValidator'" },
  { from: /from ['"]\.\.\/processors\/UnifiedDataMerger['"]/g, to: "from '@backend/modules/crawling/processors/UnifiedDataMerger'" },
  { from: /from ['"]\.\.\/processors\/EnhancedDataMerger['"]/g, to: "from '@backend/modules/crawling/processors/EnhancedDataMerger'" },
  { from: /from ['"]\.\.\/config\/CrawlingConfigManager['"]/g, to: "from '@backend/modules/crawling/config/CrawlingConfigManager'" },
  { from: /from ['"]\.\.\/sources\/search\/BaseSearchEngine['"]/g, to: "from '@backend/modules/crawling/sources/search/BaseSearchEngine'" },
  { from: /from ['"]\.\.\/sources\/search\/NaverSearchEngine['"]/g, to: "from '@backend/modules/crawling/sources/search/NaverSearchEngine'" },
  { from: /from ['"]\.\.\/sources\/search\/GoogleSearchEngine['"]/g, to: "from '@backend/modules/crawling/sources/search/GoogleSearchEngine'" },
  { from: /from ['"]\.\.\/sources\/search\/DaumSearchEngine['"]/g, to: "from '@backend/modules/crawling/sources/search/DaumSearchEngine'" },
  { from: /from ['"]\.\.\/sources\/search\/NaverBlogSearchEngine['"]/g, to: "from '@backend/modules/crawling/sources/search/NaverBlogSearchEngine'" },
  { from: /from ['"]\.\.\/sources\/search\/NaverCafeSearchEngine['"]/g, to: "from '@backend/modules/crawling/sources/search/NaverCafeSearchEngine'" },
  { from: /from ['"]\.\.\/sources\/search\/SearchEngineFactory['"]/g, to: "from '@backend/modules/crawling/sources/search/SearchEngineFactory'" },
  { from: /from ['"]\.\.\/sources\/OptimizedGymCrawlingSource['"]/g, to: "from '@backend/modules/crawling/sources/OptimizedGymCrawlingSource'" },
  { from: /from ['"]\.\.\/sources\/PublicApiSource['"]/g, to: "from '@backend/modules/crawling/sources/PublicApiSource'" },
  { from: /from ['"]\.\.\/core\/OptimizedCrawlingService['"]/g, to: "from '@backend/modules/crawling/core/OptimizedCrawlingService'" },
  { from: /from ['"]\.\.\/core\/CrawlingService['"]/g, to: "from '@backend/modules/crawling/core/CrawlingService'" },
  { from: /from ['"]\.\.\/core\/DataProcessor['"]/g, to: "from '@backend/modules/crawling/core/DataProcessor'" },
  { from: /from ['"]\.\.\/tracking\/CrawlingHistoryTracker['"]/g, to: "from '@backend/modules/crawling/tracking/CrawlingHistoryTracker'" },
  { from: /from ['"]\.\.\/strategies\/NaverCafeFallbackStrategies['"]/g, to: "from '@backend/modules/crawling/strategies/NaverCafeFallbackStrategies'" },
  
  // 일반적인 상대경로 패턴
  { from: /from ['"]\.\.\/\.\.\/types\/CrawlingTypes['"]/g, to: "from '@backend/modules/crawling/types/CrawlingTypes'" },
  { from: /from ['"]\.\.\/\.\.\/utils\/PerformanceMonitor['"]/g, to: "from '@backend/modules/crawling/utils/PerformanceMonitor'" },
  { from: /from ['"]\.\.\/\.\.\/utils\/AntiDetectionUtils['"]/g, to: "from '@backend/modules/crawling/utils/AntiDetectionUtils'" },
  { from: /from ['"]\.\.\/\.\.\/processors\/CrossValidator['"]/g, to: "from '@backend/modules/crawling/processors/CrossValidator'" },
  { from: /from ['"]\.\.\/\.\.\/processors\/PriceExtractor['"]/g, to: "from '@backend/modules/crawling/processors/PriceExtractor'" },
  { from: /from ['"]\.\.\/\.\.\/processors\/BatchProcessor['"]/g, to: "from '@backend/modules/crawling/processors/BatchProcessor'" },
  { from: /from ['"]\.\.\/\.\.\/config\/CrawlingConfigManager['"]/g, to: "from '@backend/modules/crawling/config/CrawlingConfigManager'" },
  { from: /from ['"]\.\.\/\.\.\/sources\/OptimizedGymCrawlingSource['"]/g, to: "from '@backend/modules/crawling/sources/OptimizedGymCrawlingSource'" },
  
  // 백엔드 일반 모듈들
  { from: /from ['"]\.\.\/config\/database['"]/g, to: "from '@backend/config/database'" },
  { from: /from ['"]\.\.\/utils\/logger['"]/g, to: "from '@backend/utils/logger'" },
  { from: /from ['"]\.\.\/utils\/jwt['"]/g, to: "from '@backend/utils/jwt'" },
  { from: /from ['"]\.\.\/utils\/recaptcha['"]/g, to: "from '@backend/utils/recaptcha'" },
  { from: /from ['"]\.\.\/utils\/getAvailablePort['"]/g, to: "from '@backend/utils/getAvailablePort'" },
  { from: /from ['"]\.\.\/utils\/typeGuards['"]/g, to: "from '@backend/utils/typeGuards'" },
  { from: /from ['"]\.\.\/middlewares\/errorHandler['"]/g, to: "from '@backend/middlewares/errorHandler'" },
  { from: /from ['"]\.\.\/middlewares\/auth['"]/g, to: "from '@backend/middlewares/auth'" },
  { from: /from ['"]\.\.\/middlewares\/performanceMonitor['"]/g, to: "from '@backend/middlewares/performanceMonitor'" },
  { from: /from ['"]\.\.\/routes['"]/g, to: "from '@backend/routes'" },
  { from: /from ['"]\.\.\/routes\/index['"]/g, to: "from '@backend/routes/index'" },
  { from: /from ['"]\.\.\/routes\/auth['"]/g, to: "from '@backend/routes/auth'" },
  { from: /from ['"]\.\.\/routes\/machine['"]/g, to: "from '@backend/routes/machine'" },
  { from: /from ['"]\.\.\/routes\/workout['"]/g, to: "from '@backend/routes/workout'" },
  { from: /from ['"]\.\.\/routes\/post['"]/g, to: "from '@backend/routes/post'" },
  { from: /from ['"]\.\.\/routes\/comment['"]/g, to: "from '@backend/routes/comment'" },
  { from: /from ['"]\.\.\/routes\/like['"]/g, to: "from '@backend/routes/like'" },
  { from: /from ['"]\.\.\/routes\/level['"]/g, to: "from '@backend/routes/level'" },
  { from: /from ['"]\.\.\/routes\/stats['"]/g, to: "from '@backend/routes/stats'" },
  { from: /from ['"]\.\.\/routes\/homePage['"]/g, to: "from '@backend/routes/homePage'" },
  { from: /from ['"]\.\.\/routes\/equipment['"]/g, to: "from '@backend/routes/equipment'" },
  { from: /from ['"]\.\.\/routes\/enhancedGymRoutes['"]/g, to: "from '@backend/routes/enhancedGymRoutes'" },
  { from: /from ['"]\.\.\/routes\/recaptcha['"]/g, to: "from '@backend/routes/recaptcha'" },
  { from: /from ['"]\.\.\/routes\/logs['"]/g, to: "from '@backend/routes/logs'" },
  { from: /from ['"]\.\.\/controllers\/authController['"]/g, to: "from '@backend/controllers/authController'" },
  { from: /from ['"]\.\.\/controllers\/machineController['"]/g, to: "from '@backend/controllers/machineController'" },
  { from: /from ['"]\.\.\/controllers\/workoutController['"]/g, to: "from '@backend/controllers/workoutController'" },
  { from: /from ['"]\.\.\/controllers\/postController['"]/g, to: "from '@backend/controllers/postController'" },
  { from: /from ['"]\.\.\/controllers\/commentController['"]/g, to: "from '@backend/controllers/commentController'" },
  { from: /from ['"]\.\.\/controllers\/likeController['"]/g, to: "from '@backend/controllers/likeController'" },
  { from: /from ['"]\.\.\/controllers\/levelController['"]/g, to: "from '@backend/controllers/levelController'" },
  { from: /from ['"]\.\.\/controllers\/statsController['"]/g, to: "from '@backend/controllers/statsController'" },
  { from: /from ['"]\.\.\/controllers\/homePageController['"]/g, to: "from '@backend/controllers/homePageController'" },
  { from: /from ['"]\.\.\/controllers\/gymController['"]/g, to: "from '@backend/controllers/gymController'" },
  { from: /from ['"]\.\.\/services\/authService['"]/g, to: "from '@backend/services/authService'" },
  { from: /from ['"]\.\.\/services\/machineService['"]/g, to: "from '@backend/services/machineService'" },
  { from: /from ['"]\.\.\/services\/workoutService['"]/g, to: "from '@backend/services/workoutService'" },
  { from: /from ['"]\.\.\/services\/postService['"]/g, to: "from '@backend/services/postService'" },
  { from: /from ['"]\.\.\/services\/commentService['"]/g, to: "from '@backend/services/commentService'" },
  { from: /from ['"]\.\.\/services\/likeService['"]/g, to: "from '@backend/services/likeService'" },
  { from: /from ['"]\.\.\/services\/levelService['"]/g, to: "from '@backend/services/levelService'" },
  { from: /from ['"]\.\.\/services\/statsService['"]/g, to: "from '@backend/services/statsService'" },
  { from: /from ['"]\.\.\/services\/homePageService['"]/g, to: "from '@backend/services/homePageService'" },
  { from: /from ['"]\.\.\/services\/gymService['"]/g, to: "from '@backend/services/gymService'" },
  { from: /from ['"]\.\.\/services\/equipmentService['"]/g, to: "from '@backend/services/equipmentService'" },
  { from: /from ['"]\.\.\/services\/crawlingService['"]/g, to: "from '@backend/services/crawlingService'" },
  { from: /from ['"]\.\.\/services\/emailService['"]/g, to: "from '@backend/services/emailService'" },
  { from: /from ['"]\.\.\/services\/accountRecoveryService['"]/g, to: "from '@backend/services/accountRecoveryService'" },
  { from: /from ['"]\.\.\/services\/legacy-crawling-services['"]/g, to: "from '@backend/services/legacy-crawling-services'" },
  { from: /from ['"]\.\.\/entities\/User['"]/g, to: "from '@backend/entities/User'" },
  { from: /from ['"]\.\.\/entities\/Machine['"]/g, to: "from '@backend/entities/Machine'" },
  { from: /from ['"]\.\.\/entities\/WorkoutSession['"]/g, to: "from '@backend/entities/WorkoutSession'" },
  { from: /from ['"]\.\.\/entities\/Post['"]/g, to: "from '@backend/entities/Post'" },
  { from: /from ['"]\.\.\/entities\/Comment['"]/g, to: "from '@backend/entities/Comment'" },
  { from: /from ['"]\.\.\/entities\/Like['"]/g, to: "from '@backend/entities/Like'" },
  { from: /from ['"]\.\.\/entities\/UserLevel['"]/g, to: "from '@backend/entities/UserLevel'" },
  { from: /from ['"]\.\.\/entities\/WorkoutStats['"]/g, to: "from '@backend/entities/WorkoutStats'" },
  { from: /from ['"]\.\.\/entities\/Gym['"]/g, to: "from '@backend/entities/Gym'" },
  { from: /from ['"]\.\.\/entities\/Equipment['"]/g, to: "from '@backend/entities/Equipment'" },
  { from: /from ['"]\.\.\/transformers\/index['"]/g, to: "from '@backend/transformers/index'" },
  { from: /from ['"]\.\.\/transformers\/user\.transformer['"]/g, to: "from '@backend/transformers/user.transformer'" },
  { from: /from ['"]\.\.\/transformers\/machine\.transformer['"]/g, to: "from '@backend/transformers/machine.transformer'" },
  { from: /from ['"]\.\.\/transformers\/workoutsession\.transformer['"]/g, to: "from '@backend/transformers/workoutsession.transformer'" },
  { from: /from ['"]\.\.\/transformers\/post\.transformer['"]/g, to: "from '@backend/transformers/post.transformer'" },
  { from: /from ['"]\.\.\/transformers\/comment\.transformer['"]/g, to: "from '@backend/transformers/comment.transformer'" },
  { from: /from ['"]\.\.\/transformers\/like\.transformer['"]/g, to: "from '@backend/transformers/like.transformer'" },
  { from: /from ['"]\.\.\/transformers\/userlevel\.transformer['"]/g, to: "from '@backend/transformers/userlevel.transformer'" },
  { from: /from ['"]\.\.\/transformers\/gym\.transformer['"]/g, to: "from '@backend/transformers/gym.transformer'" },
  { from: /from ['"]\.\.\/types\/machine['"]/g, to: "from '@backend/types/machine'" },
  
  // 공유 모듈들
  { from: /from ['"]\.\.\/\.\.\/shared\/types['"]/g, to: "from '@shared/types'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/common['"]/g, to: "from '@shared/types/common'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto['"]/g, to: "from '@shared/types/dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/machine\.dto['"]/g, to: "from '@shared/types/dto/machine.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/user\.dto['"]/g, to: "from '@shared/types/dto/user.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/workout\.dto['"]/g, to: "from '@shared/types/dto/workout.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/post\.dto['"]/g, to: "from '@shared/types/dto/post.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/comment\.dto['"]/g, to: "from '@shared/types/dto/comment.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/like\.dto['"]/g, to: "from '@shared/types/dto/like.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/level\.dto['"]/g, to: "from '@shared/types/dto/level.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/stats\.dto['"]/g, to: "from '@shared/types/dto/stats.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/gym\.dto['"]/g, to: "from '@shared/types/dto/gym.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/types\/dto\/equipment\.dto['"]/g, to: "from '@shared/types/dto/equipment.dto'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/constants['"]/g, to: "from '@shared/constants'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/validation['"]/g, to: "from '@shared/validation'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/api['"]/g, to: "from '@shared/api'" },
  { from: /from ['"]\.\.\/\.\.\/shared\/utils['"]/g, to: "from '@shared/utils'" },
]

async function fixBackendPaths() {
  console.log('🔧 백엔드 상대경로를 절대경로로 변경 시작...')
  
  try {
    // 백엔드 디렉토리의 모든 TypeScript 파일 찾기
    const files = await new Promise<string[]>((resolve, reject) => {
      glob(`${BACKEND_DIR}/**/*.ts`, { 
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'] 
      }, (err, matches) => {
        if (err) reject(err)
        else resolve(matches || [])
      })
    })
    
    console.log(`📁 ${files.length}개의 TypeScript 파일을 찾았습니다.`)
    
    let totalChanges = 0
    let filesChanged = 0
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8')
        let newContent = content
        let fileChanges = 0
        
        // 각 매핑 규칙 적용
        for (const mapping of PATH_MAPPINGS) {
          const matches = newContent.match(mapping.from)
          if (matches) {
            newContent = newContent.replace(mapping.from, mapping.to)
            fileChanges += matches.length
          }
        }
        
        // 변경사항이 있으면 파일 저장
        if (fileChanges > 0) {
          fs.writeFileSync(file, newContent, 'utf-8')
          console.log(`✅ ${file}: ${fileChanges}개 경로 변경`)
          totalChanges += fileChanges
          filesChanged++
        }
      } catch (error) {
        console.error(`❌ ${file} 처리 중 오류:`, error)
      }
    }
    
    console.log(`\n🎉 백엔드 경로 변경 완료!`)
    console.log(`📊 총 ${filesChanged}개 파일에서 ${totalChanges}개 경로 변경`)
    
  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error)
    process.exit(1)
  }
}

// 스크립트 실행
fixBackendPaths()

export { fixBackendPaths }
