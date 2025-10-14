import { Repository } from 'typeorm'
import { Gym } from '../entities/Gym'
import { IntegratedGymDataService } from './integratedGymDataService'
import { EnhancedCrawlingSources } from './enhancedCrawlingSources'
import { DataMergingService } from './dataMergingService'

// 배치 처리 설정
interface BatchConfig {
  batchSize: number
  concurrency: number
  delayBetweenBatches: number
  maxRetries: number
  timeout: number
  retryDelay: number
}

// 배치 처리 결과
interface BatchResult {
  success: number
  failed: number
  total: number
  duration: number
  errors: Array<{
    gymName: string
    error: string
    retryCount: number
  }>
  progress: {
    processed: number
    remaining: number
    percentage: number
  }
}

// 개별 작업 결과
interface TaskResult {
  success: boolean
  gymName: string
  data?: any
  error?: string
  retryCount: number
  duration: number
}

/**
 * 배치 처리 서비스
 * 대량의 헬스장 데이터를 효율적으로 처리하기 위한 배치 처리 서비스
 */
export class BatchProcessingService {
  private gymRepo: Repository<Gym>
  private integratedService: IntegratedGymDataService
  private crawlingService: EnhancedCrawlingSources
  private mergingService: DataMergingService

  // 기본 배치 설정
  private defaultConfig: BatchConfig = {
    batchSize: 20,
    concurrency: 3,
    delayBetweenBatches: 2000,
    maxRetries: 3,
    timeout: 30000,
    retryDelay: 1000
  }

  constructor(gymRepo: Repository<Gym>) {
    this.gymRepo = gymRepo
    this.integratedService = new IntegratedGymDataService(gymRepo)
    this.crawlingService = new EnhancedCrawlingSources()
    this.mergingService = new DataMergingService(gymRepo)
  }

  /**
   * 헬스장 데이터를 배치로 처리
   */
  async processGymsInBatches(
    config: Partial<BatchConfig> = {}
  ): Promise<BatchResult> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const startTime = Date.now()

    console.log(`🚀 배치 처리 시작 (배치 크기: ${finalConfig.batchSize}, 동시성: ${finalConfig.concurrency})`)

    try {
      // 1. 공공데이터에서 기본 데이터 가져오기
      const publicDataGyms = await this.fetchPublicDataGyms()
      
      if (publicDataGyms.length === 0) {
        console.log('⚠️ 처리할 헬스장 데이터가 없습니다.')
        return this.createEmptyResult(startTime)
      }

      console.log(`📊 총 ${publicDataGyms.length}개의 헬스장을 처리합니다.`)

      // 2. 배치 단위로 처리
      const results = await this.processBatches(publicDataGyms, finalConfig)

      // 3. 결과 집계
      const finalResult = this.aggregateResults(results, publicDataGyms.length, startTime)

      console.log(`\n📊 배치 처리 완료:`)
      console.log(`✅ 성공: ${finalResult.success}개`)
      console.log(`❌ 실패: ${finalResult.failed}개`)
      console.log(`📈 성공률: ${((finalResult.success / finalResult.total) * 100).toFixed(1)}%`)
      console.log(`⏱️ 소요 시간: ${(finalResult.duration / 1000).toFixed(1)}초`)

      return finalResult

    } catch (error) {
      console.error('❌ 배치 처리 중 오류 발생:', error)
      return this.createErrorResult(error as Error, startTime)
    }
  }

  /**
   * 배치들을 순차적으로 처리
   */
  private async processBatches(
    gyms: any[],
    config: BatchConfig
  ): Promise<TaskResult[][]> {
    const results: TaskResult[][] = []
    const totalBatches = Math.ceil(gyms.length / config.batchSize)

    for (let i = 0; i < gyms.length; i += config.batchSize) {
      const batch = gyms.slice(i, i + config.batchSize)
      const batchNumber = Math.floor(i / config.batchSize) + 1

      console.log(`\n📦 배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개 항목)`)

      try {
        // 배치 내에서 병렬 처리
        const batchResults = await this.processBatch(batch, config)
        results.push(batchResults)

        // 배치 간 지연
        if (i + config.batchSize < gyms.length) {
          console.log(`⏳ ${config.delayBetweenBatches}ms 대기 중...`)
          await this.delay(config.delayBetweenBatches)
        }

      } catch (error) {
        console.error(`❌ 배치 ${batchNumber} 처리 실패:`, error)
        // 실패한 배치의 모든 항목을 실패로 기록
        const failedResults = batch.map(gym => ({
          success: false,
          gymName: gym.name,
          error: (error as Error).message,
          retryCount: 0,
          duration: 0
        }))
        results.push(failedResults)
      }
    }

    return results
  }

  /**
   * 개별 배치 처리
   */
  private async processBatch(
    batch: any[],
    config: BatchConfig
  ): Promise<TaskResult[]> {
    const results: TaskResult[] = []
    const chunks = this.chunkArray(batch, config.concurrency)

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(gym => this.processGymWithRetry(gym, config))
      const chunkResults = await Promise.allSettled(chunkPromises)

      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            success: false,
            gymName: chunk[index].name,
            error: result.reason.message,
            retryCount: 0,
            duration: 0
          })
        }
      })

      // 청크 간 짧은 지연
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(500)
      }
    }

    return results
  }

  /**
   * 재시도 로직이 포함된 헬스장 처리
   */
  private async processGymWithRetry(
    gym: any,
    config: BatchConfig
  ): Promise<TaskResult> {
    let lastError: Error | null = null
    const startTime = Date.now()

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await this.processGym(gym, config.timeout)
        
        return {
          success: true,
          gymName: gym.name,
          data: result,
          retryCount: attempt,
          duration: Date.now() - startTime
        }

      } catch (error) {
        lastError = error as Error
        
        if (attempt < config.maxRetries) {
          console.warn(`⚠️ ${gym.name} 처리 실패 (시도 ${attempt + 1}/${config.maxRetries + 1}), 재시도 중...`)
          await this.delay(config.retryDelay * (attempt + 1)) // 지수 백오프
        }
      }
    }

    return {
      success: false,
      gymName: gym.name,
      error: lastError?.message || '알 수 없는 오류',
      retryCount: config.maxRetries,
      duration: Date.now() - startTime
    }
  }

  /**
   * 공공데이터에서 헬스장 목록 가져오기
   */
  private async fetchPublicDataGyms(): Promise<any[]> {
    try {
      // 실제 구현에서는 공공 API에서 데이터를 가져옴
      // 여기서는 샘플 데이터 반환
      return [
        { id: '1', name: '샘플 헬스장 1', address: '서울시 강남구', type: '짐' },
        { id: '2', name: '샘플 헬스장 2', address: '서울시 서초구', type: '짐' },
        { id: '3', name: '샘플 헬스장 3', address: '서울시 송파구', type: '짐' }
      ]
    } catch (error) {
      console.error('❌ 공공데이터 가져오기 실패:', error)
      return []
    }
  }

  /**
   * 개별 헬스장 처리
   */
  private async processGym(gym: any, timeout: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('처리 시간 초과'))
      }, timeout)

      try {
        // 1. 통합 검색으로 상세 정보 수집
        const searchResult = await this.integratedService.searchAllSources(gym.name)
        
        if (searchResult) {
          // 2. 크롤링으로 추가 정보 수집
          const crawlingResults = await this.crawlingService.searchAllCrawlingSources(gym.name)
          
          // 3. 데이터 병합
          const allSourceData = [searchResult, ...crawlingResults]
          const mergedData = await this.mergingService.mergeGymDataFromMultipleSources(allSourceData)
          
          if (mergedData.length > 0) {
            // 4. 데이터베이스에 저장
            const finalGym = mergedData[0]
            await this.saveGymToDatabase(finalGym)
            
            clearTimeout(timeoutId)
            resolve(finalGym)
          } else {
            // 병합된 데이터가 없으면 기본 데이터 저장
            await this.saveGymToDatabase(gym)
            clearTimeout(timeoutId)
            resolve(gym)
          }
        } else {
          // 검색 결과가 없으면 기본 데이터 저장
          await this.saveGymToDatabase(gym)
          clearTimeout(timeoutId)
          resolve(gym)
        }

      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  /**
   * 데이터베이스에 헬스장 저장
   */
  private async saveGymToDatabase(gymData: any): Promise<void> {
    try {
      // 기존 데이터 확인
      const existingGym = await this.gymRepo.findOne({ where: { id: gymData.id } })
      
      if (existingGym) {
        // 기존 데이터 업데이트
        Object.assign(existingGym, gymData)
        await this.gymRepo.save(existingGym)
      } else {
        // 새 데이터 생성
        const newGym = this.gymRepo.create(gymData)
        await this.gymRepo.save(newGym)
      }
    } catch (error) {
      console.error(`❌ 데이터베이스 저장 실패: ${gymData.name}`, error)
      throw error
    }
  }

  /**
   * 배열을 청크로 분할
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 결과 집계
   */
  private aggregateResults(
    results: TaskResult[][],
    totalGyms: number,
    startTime: number
  ): BatchResult {
    const allResults = results.flat()
    const successCount = allResults.filter(r => r.success).length
    const failedCount = allResults.filter(r => !r.success).length
    const errors = allResults
      .filter(r => !r.success)
      .map(r => ({
        gymName: r.gymName,
        error: r.error || '알 수 없는 오류',
        retryCount: r.retryCount
      }))

    const processed = allResults.length
    const remaining = totalGyms - processed
    const percentage = totalGyms > 0 ? (processed / totalGyms) * 100 : 0

    return {
      success: successCount,
      failed: failedCount,
      total: totalGyms,
      duration: Date.now() - startTime,
      errors,
      progress: {
        processed,
        remaining,
        percentage
      }
    }
  }

  /**
   * 빈 결과 생성
   */
  private createEmptyResult(startTime: number): BatchResult {
    return {
      success: 0,
      failed: 0,
      total: 0,
      duration: Date.now() - startTime,
      errors: [],
      progress: {
        processed: 0,
        remaining: 0,
        percentage: 0
      }
    }
  }

  /**
   * 오류 결과 생성
   */
  private createErrorResult(error: Error, startTime: number): BatchResult {
    return {
      success: 0,
      failed: 0,
      total: 0,
      duration: Date.now() - startTime,
      errors: [{
        gymName: 'SYSTEM',
        error: error.message,
        retryCount: 0
      }],
      progress: {
        processed: 0,
        remaining: 0,
        percentage: 0
      }
    }
  }

  /**
   * 진행 상황 모니터링
   */
  async monitorProgress(
    onProgress: (progress: { processed: number; total: number; percentage: number }) => void
  ): Promise<void> {
    // 실제 구현에서는 Redis나 다른 캐시를 사용하여 진행 상황을 추적
    // 여기서는 간단한 예시만 제공
    console.log('📊 진행 상황 모니터링 시작')
  }

  /**
   * 배치 처리 중단
   */
  async cancelBatchProcessing(): Promise<void> {
    console.log('⏹️ 배치 처리 중단 요청')
    // 실제 구현에서는 플래그를 설정하여 처리 중단
  }

  /**
   * 성능 통계 수집
   */
  async collectPerformanceStats(): Promise<{
    averageProcessingTime: number
    successRate: number
    errorRate: number
    throughput: number
  }> {
    // 실제 구현에서는 처리 통계를 수집
    return {
      averageProcessingTime: 0,
      successRate: 0,
      errorRate: 0,
      throughput: 0
    }
  }

  /**
   * 배치 설정 최적화
   */
  optimizeBatchConfig(
    currentStats: any,
    targetThroughput: number
  ): BatchConfig {
    // 성능 통계를 기반으로 배치 설정을 동적으로 조정
    const optimizedConfig = { ...this.defaultConfig }

    // 처리량이 목표보다 낮으면 동시성 증가
    if (currentStats.throughput < targetThroughput) {
      optimizedConfig.concurrency = Math.min(10, optimizedConfig.concurrency + 1)
    }

    // 오류율이 높으면 배치 크기 감소
    if (currentStats.errorRate > 0.1) {
      optimizedConfig.batchSize = Math.max(5, optimizedConfig.batchSize - 5)
    }

    // 평균 처리 시간이 길면 타임아웃 증가
    if (currentStats.averageProcessingTime > 20000) {
      optimizedConfig.timeout = Math.min(60000, optimizedConfig.timeout + 10000)
    }

    return optimizedConfig
  }
}