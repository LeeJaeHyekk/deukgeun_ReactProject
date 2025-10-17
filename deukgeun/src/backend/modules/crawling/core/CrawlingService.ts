/**
 * 통합 크롤링 서비스
 * 모든 크롤링 기능을 하나의 서비스로 통합
 */

import { Repository } from 'typeorm'
import { Gym } from '../../../entities/Gym'
import { DataProcessor } from './DataProcessor'
import { PublicApiSource } from '@backend/modules/crawling/sources/PublicApiSource'
import { OptimizedGymCrawlingSource } from '@backend/modules/crawling/sources/OptimizedGymCrawlingSource'
import { DataMerger } from '@backend/modules/crawling/processors/DataMerger'
import { EnhancedDataMerger } from '@backend/modules/crawling/processors/EnhancedDataMerger'
import { DataValidator } from '@backend/modules/crawling/processors/DataValidator'
import { CrawlingHistoryTracker } from '@backend/modules/crawling/tracking/CrawlingHistoryTracker'
import { getGymsRawPath } from '../utils/pathUtils'
import { 
  CrawlingConfig, 
  CrawlingResult, 
  CrawlingOptions, 
  ProcessedGymData,
  CrawlingStatus 
} from '@backend/modules/crawling/types/CrawlingTypes'

export class CrawlingService {
  private gymRepo: Repository<Gym>
  private dataProcessor: DataProcessor
  private publicApiSource: PublicApiSource
  private optimizedCrawlingSource: OptimizedGymCrawlingSource
  private dataMerger: DataMerger
  private enhancedDataMerger: EnhancedDataMerger
  private dataValidator: DataValidator
  private historyTracker: CrawlingHistoryTracker
  private config: CrawlingConfig
  private status: CrawlingStatus

  constructor(gymRepo: Repository<Gym>) {
    this.gymRepo = gymRepo
    this.dataProcessor = new DataProcessor(gymRepo)
    this.publicApiSource = new PublicApiSource()
    this.optimizedCrawlingSource = new OptimizedGymCrawlingSource()
    this.dataMerger = new DataMerger()
    this.enhancedDataMerger = new EnhancedDataMerger()
    this.dataValidator = new DataValidator()
    this.historyTracker = new CrawlingHistoryTracker()
    
    this.config = {
      enablePublicApi: true,
      enableCrawling: true, // 웹 크롤링 활성화
      enableDataMerging: true,
      enableQualityCheck: true,
      batchSize: 5, // 웹 크롤링을 위해 배치 크기 대폭 감소
      maxConcurrentRequests: 1, // 동시 요청 수 1개로 제한
      delayBetweenBatches: 10000, // 지연 시간 대폭 증가 (10초)
      maxRetries: 3,
      timeout: 30000,
      saveToFile: true,
      saveToDatabase: true
    }

    this.status = {
      isRunning: false,
      currentStep: '',
      progress: { current: 0, total: 0, percentage: 0 },
      startTime: null,
      estimatedCompletion: null,
      errors: []
    }
  }

  /**
   * 크롤링 설정 업데이트
   */
  updateConfig(newConfig: Partial<CrawlingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 크롤링 상태 조회
   */
  getStatus(): CrawlingStatus {
    return { ...this.status }
  }

  /**
   * 공공 API를 통한 헬스장 데이터 수집
   */
  async collectFromPublicAPI(): Promise<ProcessedGymData[]> {
    console.log('📡 공공 API에서 헬스장 데이터 수집 시작')
    
    try {
      // 공공 API 소스에서 데이터 수집
      const publicApiData = await this.publicApiSource.fetchAllPublicAPIData()
      
      // 데이터 병합 및 정제
      const mergedData = this.dataMerger.mergeGymData(publicApiData)
      
      console.log(`✅ 공공 API 데이터 수집 완료: ${mergedData.length}개 헬스장`)
      return mergedData
      
    } catch (error) {
      console.error('❌ 공공 API 데이터 수집 실패:', error)
      return []
    }
  }

  /**
   * 특정 헬스장 정보 크롤링 (웹 크롤링)
   */
  async crawlGymDetails(options: CrawlingOptions): Promise<ProcessedGymData | null> {
    if (!this.config.enableCrawling) {
      console.log('⚠️ 크롤링이 비활성화되어 있습니다')
      return null
    }

    if (!options.gymName) {
      console.log('❌ 헬스장 이름이 필요합니다')
      return null
    }

    console.log(`🔍 헬스장 정보 크롤링 시작: ${options.gymName}`)
    
    try {
      // 웹 크롤링으로 헬스장 정보 수집
      // 웹 크롤링은 OptimizedGymCrawlingSource를 통해 처리
      const webResult = await this.optimizedCrawlingSource.crawlGymsFromRawData([{
        name: options.gymName || '',
        address: options.gymAddress || '',
        source: 'manual_search',
        confidence: 0.5
      }])
      
      if (!webResult) {
        console.log(`❌ 헬스장 크롤링 실패: ${options.gymName}`)
        return null
      }
      
      console.log(`✅ 헬스장 크롤링 완료: ${options.gymName}`)
      return webResult[0] || null
      
    } catch (error) {
      console.error(`❌ 헬스장 크롤링 오류: ${options.gymName}`, error)
      return null
    }
  }

  /**
   * 통합 크롤링 실행 (새로운 구조)
   */
  async executeIntegratedCrawling(): Promise<CrawlingResult> {
    if (this.status.isRunning) {
      throw new Error('크롤링이 이미 실행 중입니다')
    }

    this.status.isRunning = true
    this.status.startTime = new Date()
    this.status.errors = []
    this.status.currentStep = '초기화'

    // 히스토리 추적 시작
    const sessionId = this.historyTracker.startSession(this.config)

    console.log('🚀 통합 크롤링 시작 (새로운 구조)')

    const result: CrawlingResult = {
      success: false,
      totalGyms: 0,
      publicApiGyms: 0,
      crawlingGyms: 0,
      mergedGyms: 0,
      duration: 0,
      processingTime: 0,
      errors: [],
      warnings: [],
      dataQuality: {
        average: 0,
        min: 0,
        max: 0,
        distribution: {},
        complete: 0,
        partial: 0,
        minimal: 0,
        averageQualityScore: 0
      }
    }

    try {
      // 1. 공공 API에서 영업중인 헬스장 데이터 수집 (gym/gx/pt/크로스핏만)
      if (this.config.enablePublicApi) {
        this.status.currentStep = '공공 API 데이터 수집 (영업중 + 헬스장 필터링)'
        const publicApiData = await this.collectFromPublicAPI()
        result.publicApiGyms = publicApiData.length
        
        // 히스토리 기록
        this.historyTracker.recordApiCollection(
          { current: publicApiData.length, total: publicApiData.length },
          { count: publicApiData.length }
        )
        
        console.log(`✅ 공공 API 수집 완료: ${publicApiData.length}개 헬스장 (영업중 + 필터링됨)`)
        
        // 공공 API 데이터를 gyms_raw.json에 저장
        if (this.config.saveToFile) {
          await this.saveToGymsRaw(publicApiData)
        }
      }

      // 2. gyms_raw.json의 name으로 웹 크롤링
      if (this.config.enableCrawling) {
        this.status.currentStep = 'gyms_raw name 기반 웹 크롤링'
        const crawlingResults = await this.crawlGymsFromRawData()
        result.crawlingGyms = crawlingResults.length
        
        // 히스토리 기록
        const crawlingProgress = this.getStatus()
        this.historyTracker.recordNameCrawling(crawlingProgress)
        
        console.log(`✅ name 기반 크롤링 완료: ${crawlingResults.length}개 헬스장`)
        
        // 크롤링 결과를 gyms_raw.json에 병합
        if (this.config.saveToFile && crawlingResults.length > 0) {
          await this.mergeAndSaveToGymsRaw(crawlingResults)
        }
      }

      // 3. 데이터 품질 검사
      if (this.config.enableQualityCheck) {
        this.status.currentStep = '데이터 품질 검사'
        const qualityResult = await this.dataProcessor.checkDataQuality()
        result.dataQuality = qualityResult
      }

      // 4. 최종 결과 계산
      result.totalGyms = result.publicApiGyms + result.crawlingGyms
      result.success = true
      result.duration = Date.now() - this.status.startTime.getTime()

      console.log(`✅ 통합 크롤링 완료: 공공API ${result.publicApiGyms}개, name 크롤링 ${result.crawlingGyms}개, 총 ${result.totalGyms}개 헬스장, ${(result.duration / 1000).toFixed(1)}초`)

    } catch (error) {
      result.success = false
      const errorMessage = error instanceof Error ? error.message : String(error)
      result.errors.push(errorMessage)
      this.status.errors.push(errorMessage)
      
      // 히스토리에 오류 기록
      this.historyTracker.recordError(errorMessage, this.status.currentStep)
      
      console.error('❌ 통합 크롤링 실패:', error)
    } finally {
      this.status.isRunning = false
      this.status.currentStep = '완료'
      
      // 세션 종료
      this.historyTracker.endSession(sessionId, result.success ? 'completed' : 'failed')
      
      // 히스토리 저장
      await this.historyTracker.saveHistoryToFile()
    }

    return result
  }

  /**
   * gyms_raw.json의 name으로 웹 크롤링
   */
  private async crawlGymsFromRawData(): Promise<ProcessedGymData[]> {
    console.log('🔍 gyms_raw.json 기반 웹 크롤링 시작')
    
    try {
      // gyms_raw.json 파일 읽기
      const fs = await import('fs/promises')
      const filePath = getGymsRawPath()
      
      let gymsRawData: any[] = []
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        gymsRawData = JSON.parse(content)
        console.log(`📄 gyms_raw.json 로드 완료: ${gymsRawData.length}개 헬스장`)
      } catch (error) {
        console.error('❌ gyms_raw.json 파일을 읽을 수 없습니다:', error)
        return []
      }

      if (gymsRawData.length === 0) {
        console.log('⚠️ gyms_raw.json에 데이터가 없습니다')
        return []
      }

      // 헬스장 이름으로 크롤링 실행
      const enhancedResults = await this.optimizedCrawlingSource.crawlGymsFromRawData(gymsRawData)
      
      // EnhancedGymInfo를 ProcessedGymData로 변환
      const crawlingResults: ProcessedGymData[] = enhancedResults.map((enhancedInfo, index) => {
        const originalGym = gymsRawData[index]
        return this.enhancedDataMerger.convertEnhancedGymInfoToProcessedGymData(enhancedInfo, originalGym)
      })
      
      console.log(`✅ gyms_raw 기반 크롤링 완료: ${crawlingResults.length}개 헬스장`)
      return crawlingResults
      
    } catch (error) {
      console.error('❌ gyms_raw 기반 크롤링 실패:', error)
      return []
    }
  }

  /**
   * 크롤링 결과를 gyms_raw.json에 병합하여 저장
   */
  async mergeAndSaveToGymsRaw(crawledData: ProcessedGymData[]): Promise<{successfulMerges: number, fallbackUsed: number, qualityScore: number}> {
    try {
      const fs = await import('fs/promises')
      const filePath = getGymsRawPath()
      
      // 기존 데이터 읽기
      let existingData: any[] = []
      try {
        const existingContent = await fs.readFile(filePath, 'utf-8')
        existingData = JSON.parse(existingContent)
      } catch (error) {
        console.log('📄 gyms_raw.json 파일을 찾을 수 없습니다')
        return { successfulMerges: 0, fallbackUsed: 0, qualityScore: 0 }
      }

      // 향상된 데이터 병합 실행
      const mergeResult = await this.enhancedDataMerger.mergeGymDataWithCrawling(existingData, crawledData)
      
      // 병합된 데이터 저장
      await fs.writeFile(filePath, JSON.stringify(mergeResult.mergedData, null, 2), 'utf-8')
      
      console.log(`💾 gyms_raw.json 병합 저장 완료: ${mergeResult.mergedData.length}개 헬스장`)
      console.log(`📊 병합 통계: 성공 ${mergeResult.statistics.successfullyMerged}개, 폴백 ${mergeResult.statistics.fallbackUsed}개, 중복제거 ${mergeResult.statistics.duplicatesRemoved}개`)
      console.log(`⭐ 품질 점수: ${mergeResult.statistics.qualityScore.toFixed(2)}`)
      
      if (mergeResult.conflicts.length > 0) {
        console.log(`⚠️ 충돌 발생: ${mergeResult.conflicts.length}개 필드`)
        mergeResult.conflicts.forEach(conflict => {
          console.log(`  - ${conflict.gymName}: ${conflict.field} (${conflict.resolution})`)
        })
      }
      
      return {
        successfulMerges: mergeResult.statistics.successfullyMerged,
        fallbackUsed: mergeResult.statistics.fallbackUsed,
        qualityScore: mergeResult.statistics.qualityScore
      }
      
    } catch (error) {
      console.error('❌ gyms_raw.json 병합 저장 실패:', error)
      return { successfulMerges: 0, fallbackUsed: 0, qualityScore: 0 }
    }
  }

  /**
   * 크롤링 진행상황 조회
   */
  getCrawlingProgress() {
    return this.status
  }

  /**
   * 현재 세션 조회
   */
  getCurrentSession() {
    return this.historyTracker.getCurrentSession()
  }

  /**
   * 세션 조회
   */
  getSession(sessionId: string) {
    return this.historyTracker.getSession(sessionId)
  }

  /**
   * 최근 세션 조회
   */
  getRecentSessions(limit: number = 10) {
    return this.historyTracker.getRecentSessions(limit)
  }

  /**
   * 세션 통계 조회
   */
  getSessionStatistics() {
    return this.historyTracker.getSessionStatistics()
  }

  /**
   * 히스토리 로드
   */
  async loadHistory() {
    await this.historyTracker.loadHistoryFromFile()
  }

  /**
   * 공공 API 데이터로 웹 크롤링하여 추가 정보 수집 (레거시)
   */
  private async crawlAdditionalInfo(): Promise<ProcessedGymData[]> {
    console.log('🔍 공공 API 데이터로 웹 크롤링 시작')
    
    try {
      // 공공 API에서 수집한 데이터 가져오기
      const publicApiData = await this.collectFromPublicAPI()
      const crawlingResults: ProcessedGymData[] = []
      
      // 배치 단위로 처리
      for (let i = 0; i < publicApiData.length; i += this.config.batchSize) {
        const batch = publicApiData.slice(i, i + this.config.batchSize)
        
        console.log(`📦 배치 처리 중: ${i + 1}-${Math.min(i + this.config.batchSize, publicApiData.length)}/${publicApiData.length}`)
        
        // 배치 내에서 순차 처리 (Rate limiting 방지)
        const batchResults: PromiseSettledResult<ProcessedGymData>[] = []
        
        for (const gym of batch) {
          try {
            const crawlingResults = await this.optimizedCrawlingSource.crawlGymsFromRawData([gym])
            const crawlingResult = crawlingResults[0] || null
            if (crawlingResult) {
              // 공공 API 데이터와 크롤링 데이터 병합
              const mergedResult = this.dataMerger.mergeGymData([gym, crawlingResult])[0]
              batchResults.push({ status: 'fulfilled', value: mergedResult })
            } else {
              batchResults.push({ status: 'fulfilled', value: gym })
            }
          } catch (error) {
            console.error(`❌ 크롤링 실패: ${gym.name}`, error)
            batchResults.push({ status: 'fulfilled', value: gym })
          }
          
          // 각 헬스장 처리 후 지연
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        const validResults = batchResults
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<ProcessedGymData>).value)
        
        crawlingResults.push(...validResults)
        
        // 배치 간 지연
        if (i + this.config.batchSize < publicApiData.length) {
          await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenBatches))
        }
      }
      
      console.log(`✅ 웹 크롤링 완료: ${crawlingResults.length}개 헬스장 처리`)
      return crawlingResults
      
    } catch (error) {
      console.error('❌ 웹 크롤링 실패:', error)
      return []
    }
  }

  /**
   * gyms_raw.json 파일에 데이터 저장
   */
  private async saveToGymsRaw(data: ProcessedGymData[]): Promise<void> {
    try {
      const fs = await import('fs/promises')
      const filePath = getGymsRawPath()
      
      // 기존 데이터와 병합
      let existingData: ProcessedGymData[] = []
      try {
        const existingContent = await fs.readFile(filePath, 'utf-8')
        existingData = JSON.parse(existingContent)
      } catch (error) {
        // 파일이 없거나 읽기 실패 시 빈 배열로 시작
        console.log('📄 새로운 gyms_raw.json 파일 생성')
      }
      
      // 중복 제거 (이름과 주소로 비교)
      const mergedData = this.dataMerger.mergeGymData([...existingData, ...data])
      
      await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf-8')
      console.log(`💾 gyms_raw.json 저장 완료: ${mergedData.length}개 헬스장`)
      
    } catch (error) {
      console.error('❌ gyms_raw.json 저장 실패:', error)
    }
  }

  /**
   * gyms_raw.json 파일에 데이터 추가
   */
  private async appendToGymsRaw(data: ProcessedGymData[]): Promise<void> {
    try {
      const fs = await import('fs/promises')
      const filePath = getGymsRawPath()
      
      // 기존 데이터 읽기
      let existingData: ProcessedGymData[] = []
      try {
        const existingContent = await fs.readFile(filePath, 'utf-8')
        existingData = JSON.parse(existingContent)
      } catch (error) {
        console.log('📄 gyms_raw.json 파일을 찾을 수 없습니다')
        return
      }
      
      // 중복 제거 후 추가
      const mergedData = this.dataMerger.mergeGymData([...existingData, ...data])
      
      await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf-8')
      console.log(`💾 gyms_raw.json 업데이트 완료: ${mergedData.length}개 헬스장`)
      
    } catch (error) {
      console.error('❌ gyms_raw.json 업데이트 실패:', error)
    }
  }

  /**
   * 크롤링 서비스 정리
   */
  async cleanup(): Promise<void> {
    console.log('🧹 크롤링 서비스 정리 중...')
    
    // 실행 중인 크롤링이 있다면 중단
    if (this.status.isRunning) {
      this.status.isRunning = false
      this.status.currentStep = '중단됨'
    }
    
    // 데이터 프로세서 정리
    await this.dataProcessor.cleanup()
    
    console.log('✅ 크롤링 서비스 정리 완료')
  }
}
