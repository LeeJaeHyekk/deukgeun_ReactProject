/**
 * 크롤링 서비스 (새로운 모듈화된 구조)
 * 기존의 복잡한 크롤링 서비스들을 대체
 */

import { Repository } from 'typeorm'
import { Gym } from '@backend/entities/Gym'
import { CrawlingService } from '@backend/modules/crawling/core/CrawlingService'
import { CrawlingConfig } from '@backend/modules/crawling/types/CrawlingTypes'

// 싱글톤 인스턴스
let crawlingServiceInstance: CrawlingService | null = null

/**
 * 크롤링 서비스 인스턴스 가져오기
 * gymRepo가 null/undefined인 경우 파일 기반으로만 동작
 */
export function getCrawlingService(gymRepo: Repository<Gym> | null | undefined): CrawlingService {
  if (!crawlingServiceInstance && gymRepo) {
    crawlingServiceInstance = new CrawlingService(gymRepo)
  } else if (!crawlingServiceInstance && !gymRepo) {
    // 데이터베이스 없이 파일 기반으로만 동작하는 더미 레포지토리 생성
    crawlingServiceInstance = new CrawlingService(null as any)
  }
  return crawlingServiceInstance
}

/**
 * 크롤링 서비스 초기화
 */
export async function initializeCrawlingService(gymRepo: Repository<Gym>): Promise<CrawlingService> {
  const service = getCrawlingService(gymRepo)
  
  // 기본 설정으로 초기화 (크롤링은 비활성화)
  const config: Partial<CrawlingConfig> = {
    enablePublicApi: true,
    enableCrawling: false, // 기본적으로 비활성화
    enableDataMerging: true,
    enableQualityCheck: true,
    batchSize: 50,
    maxConcurrentRequests: 3,
    delayBetweenBatches: 2000,
    maxRetries: 3,
    timeout: 30000,
    saveToFile: true,
    saveToDatabase: true
  }
  
  service.updateConfig(config)
  
  console.log('✅ 크롤링 서비스 초기화 완료')
  return service
}

/**
 * 크롤링 서비스 정리
 */
export async function cleanupCrawlingService(): Promise<void> {
  if (crawlingServiceInstance) {
    await crawlingServiceInstance.cleanup()
    crawlingServiceInstance = null
    console.log('✅ 크롤링 서비스 정리 완료')
  }
}
