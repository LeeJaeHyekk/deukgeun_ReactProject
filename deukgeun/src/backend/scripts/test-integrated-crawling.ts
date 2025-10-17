/**
 * 통합 크롤링 시스템 테스트 스크립트
 * 
 * 테스트 순서:
 * 1. 서울 API에서 데이터 수집
 * 2. gyms_raw.json에 저장
 * 3. name 기반 웹 크롤링
 * 4. 데이터 병합 및 gyms_raw.json 업데이트
 */

import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { CrawlingService } from '../modules/crawling/core/CrawlingService.js'
import { Gym } from '../entities/Gym.js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { getDirname } from '../utils/pathUtils'

const __dirname = getDirname()

// 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '..', '.env') })
dotenv.config({ path: path.join(__dirname, '..', 'env.development') })

// 테스트용 환경 변수 설정
if (!process.env.SEOUL_OPENAPI_KEY) {
  process.env.SEOUL_OPENAPI_KEY = '467572475373737933314e4e494377'
}

async function testIntegratedCrawling() {
  console.log('🧪 통합 크롤링 시스템 테스트 시작')
  console.log('=' .repeat(70))
  
  // 데이터베이스 연결 설정 (옵션, 없어도 파일 기반 작업은 가능)
  let dataSource: DataSource | null = null
  let gymRepository: any = null
  
  try {
    // 간단한 mock repository 생성 (DB 없이 테스트)
    const mockRepository = {
      find: async () => [],
      findOne: async () => null,
      save: async (data: any) => data,
      create: (data: any) => data
    } as any
    
    gymRepository = mockRepository
    
    console.log('✅ Mock Repository 초기화 완료')
    
  } catch (error) {
    console.log('⚠️ 데이터베이스 연결 없이 진행합니다 (파일 기반 테스트)')
    gymRepository = {} as any
  }
  
  try {
    // 크롤링 서비스 초기화
    const crawlingService = new CrawlingService(gymRepository)
    
    // 크롤링 설정 (테스트를 위해 빠르게 설정)
    crawlingService.updateConfig({
      enablePublicApi: true,
      enableCrawling: true, // 웹 크롤링 활성화
      enableDataMerging: true,
      enableQualityCheck: true,
      batchSize: 3, // 테스트를 위해 작은 배치 크기
      maxConcurrentRequests: 1,
      delayBetweenBatches: 2000, // 2초 지연
      maxRetries: 2,
      timeout: 15000,
      saveToFile: true,
      saveToDatabase: false // DB 없이 파일만 사용
    })
    
    console.log('\n📋 크롤링 설정:')
    console.log('- 공공 API 수집: 활성화')
    console.log('- 웹 크롤링: 활성화')
    console.log('- 배치 크기: 3개')
    console.log('- 지연 시간: 2초')
    console.log('')
    
    // 통합 크롤링 실행
    console.log('🚀 통합 크롤링 실행 시작...\n')
    const result = await crawlingService.executeIntegratedCrawling()
    
    // 결과 출력
    console.log('\n' + '=' .repeat(70))
    console.log('📊 크롤링 결과 요약')
    console.log('=' .repeat(70))
    console.log(`✅ 성공 여부: ${result.success ? '성공' : '실패'}`)
    console.log(`📡 공공 API 수집: ${result.publicApiGyms}개 헬스장`)
    console.log(`🔍 name 기반 크롤링: ${result.crawlingGyms}개 헬스장`)
    console.log(`📦 총 처리된 헬스장: ${result.totalGyms}개`)
    console.log(`⏱️  소요 시간: ${(result.duration / 1000).toFixed(1)}초`)
    
    if (result.dataQuality) {
      console.log('\n📈 데이터 품질:')
      console.log(`- 완전한 데이터: ${result.dataQuality.complete || 0}개`)
      console.log(`- 부분 데이터: ${result.dataQuality.partial || 0}개`)
      console.log(`- 최소 데이터: ${result.dataQuality.minimal || 0}개`)
      console.log(`- 평균 품질 점수: ${result.dataQuality.averageQualityScore?.toFixed(2) || 'N/A'}`)
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️ 오류:')
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    }
    
    // 세션 통계
    const sessionStats = crawlingService.getSessionStatistics()
    console.log('\n📊 세션 통계:')
    console.log(`- 총 세션 수: ${sessionStats.totalSessions}`)
    console.log(`- 완료된 세션: ${sessionStats.completedSessions}`)
    console.log(`- 실패한 세션: ${sessionStats.failedSessions}`)
    console.log(`- 총 처리 헬스장: ${sessionStats.totalGymsProcessed}`)
    
    console.log('\n✅ 통합 크롤링 테스트 완료!')
    console.log('\n💡 다음 단계:')
    console.log('1. src/data/gyms_raw.json 파일을 확인하세요')
    console.log('2. logs/crawling-history.json에서 히스토리를 확인하세요')
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error)
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message)
      console.error('스택 트레이스:', error.stack)
    }
  } finally {
    // 데이터베이스 연결 종료
    if (dataSource && (dataSource as DataSource).isInitialized) {
      await (dataSource as DataSource).destroy()
      console.log('\n✅ 데이터베이스 연결 종료')
    }
  }
  
  console.log('\n' + '=' .repeat(70))
  console.log('🏁 테스트 종료')
}

// 스크립트 실행
testIntegratedCrawling()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('스크립트 실행 실패:', error)
    process.exit(1)
  })

export { testIntegratedCrawling }

