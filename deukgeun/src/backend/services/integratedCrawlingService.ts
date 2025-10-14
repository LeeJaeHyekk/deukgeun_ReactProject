import { PublicApiScheduler } from './publicApiScheduler'
import { ApiListUpdater } from './apiListUpdater'
import { CrawlingBypassService } from './crawlingBypassService'
import { TypeGuardService } from './typeGuardService'
import { DataMergingService } from './dataMergingService'
import { DataQualityService } from './dataQualityService'
import { Repository } from 'typeorm'
import { Gym } from '../entities/Gym'
import * as fs from 'fs'
import * as path from 'path'

// 통합 크롤링 결과 인터페이스
interface IntegratedCrawlingResult {
  success: boolean
  totalGyms: number
  publicApiGyms: number
  crawlingGyms: number
  mergedGyms: number
  duration: number
  errors: string[]
  warnings: string[]
  dataQuality: {
    average: number
    min: number
    max: number
    distribution: Record<string, number>
  }
}

// 크롤링 설정 인터페이스
interface CrawlingConfig {
  enablePublicApi: boolean
  enableCrawling: boolean
  enableDataMerging: boolean
  enableQualityCheck: boolean
  batchSize: number
  maxConcurrentRequests: number
  delayBetweenBatches: number
  maxRetries: number
  timeout: number
  saveToFile: boolean
  saveToDatabase: boolean
}

// 크롤링 상태 인터페이스
interface CrawlingStatus {
  isRunning: boolean
  currentStep: string
  progress: {
    current: number
    total: number
    percentage: number
  }
  startTime: Date | null
  estimatedCompletion: Date | null
  errors: string[]
}

/**
 * 통합 크롤링 서비스
 * 공공 API 스케줄링, API 목록 업데이트, 크롤링 우회, 타입 가드, 데이터 병합을 통합한 서비스
 */
export class IntegratedCrawlingService {
  private publicApiScheduler: PublicApiScheduler
  private apiListUpdater: ApiListUpdater
  private crawlingBypassService: CrawlingBypassService
  private typeGuardService: TypeGuardService
  private dataMergingService: DataMergingService
  private dataQualityService: DataQualityService
  private gymRepo: Repository<Gym>
  
  private config: CrawlingConfig
  private status: CrawlingStatus
  private dataDirectory: string

  constructor(gymRepo: Repository<Gym>) {
    this.gymRepo = gymRepo
    this.publicApiScheduler = new PublicApiScheduler()
    this.apiListUpdater = new ApiListUpdater()
    this.crawlingBypassService = new CrawlingBypassService()
    this.typeGuardService = new TypeGuardService()
    this.dataMergingService = new DataMergingService(gymRepo)
    this.dataQualityService = new DataQualityService(gymRepo)

    this.config = {
      enablePublicApi: true,
      enableCrawling: true,
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

    this.status = {
      isRunning: false,
      currentStep: '',
      progress: { current: 0, total: 0, percentage: 0 },
      startTime: null,
      estimatedCompletion: null,
      errors: []
    }

    this.dataDirectory = path.join(process.cwd(), 'src', 'data')
    this.ensureDataDirectory()
  }

  /**
   * 통합 크롤링 실행
   */
  async executeIntegratedCrawling(): Promise<IntegratedCrawlingResult> {
    if (this.status.isRunning) {
      throw new Error('크롤링이 이미 실행 중입니다')
    }

    this.status.isRunning = true
    this.status.startTime = new Date()
    this.status.errors = []
    this.status.currentStep = '초기화'

    console.log('🚀 통합 크롤링 시작')

    const result: IntegratedCrawlingResult = {
      success: false,
      totalGyms: 0,
      publicApiGyms: 0,
      crawlingGyms: 0,
      mergedGyms: 0,
      duration: 0,
      errors: [],
      warnings: [],
      dataQuality: {
        average: 0,
        min: 0,
        max: 0,
        distribution: {}
      }
    }

    try {
      // 1. 공공 API 스케줄링
      if (this.config.enablePublicApi) {
        result.publicApiGyms = await this.executePublicApiScheduling()
      }

      // 2. API 목록 업데이트
      const apiUpdateResult = await this.executeApiListUpdate()
      result.publicApiGyms += apiUpdateResult.totalGyms

      // 3. 크롤링 실행
      if (this.config.enableCrawling) {
        result.crawlingGyms = await this.executeCrawling()
      }

      // 4. 데이터 병합
      if (this.config.enableDataMerging) {
        result.mergedGyms = await this.executeDataMerging()
      }

      // 5. 데이터 품질 검사
      if (this.config.enableQualityCheck) {
        const qualityResult = await this.executeQualityCheck()
        result.dataQuality = qualityResult
      }

      // 6. 최종 데이터 저장
      result.totalGyms = await this.saveFinalData()

      result.success = true
      result.duration = Date.now() - this.status.startTime.getTime()

      console.log(`✅ 통합 크롤링 완료: ${result.totalGyms}개 헬스장, ${(result.duration / 1000).toFixed(1)}초`)

    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : '알 수 없는 오류')
      console.error('❌ 통합 크롤링 실패:', error)
    } finally {
      this.status.isRunning = false
      this.status.currentStep = '완료'
    }

    return result
  }

  /**
   * 공공 API 스케줄링 실행
   */
  private async executePublicApiScheduling(): Promise<number> {
    this.status.currentStep = '공공 API 스케줄링'
    console.log('📡 공공 API 스케줄링 실행')

    try {
      const result = await this.publicApiScheduler.runNow()
      
      if (result.success) {
        console.log(`✅ 공공 API 스케줄링 완료: ${result.totalGyms}개 헬스장`)
        return result.totalGyms
      } else {
        throw new Error(result.error || '공공 API 스케줄링 실패')
      }
    } catch (error) {
      console.error('❌ 공공 API 스케줄링 실패:', error)
      this.status.errors.push(`공공 API 스케줄링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      return 0
    }
  }

  /**
   * API 목록 업데이트 실행
   */
  private async executeApiListUpdate(): Promise<{ totalGyms: number }> {
    this.status.currentStep = 'API 목록 업데이트'
    console.log('🔄 API 목록 업데이트 실행')

    try {
      const result = await this.apiListUpdater.updateAllApis()
      
      if (result.success) {
        console.log(`✅ API 목록 업데이트 완료: ${result.totalGyms}개 헬스장`)
        return { totalGyms: result.totalGyms }
      } else {
        throw new Error(`API 목록 업데이트 실패: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      console.error('❌ API 목록 업데이트 실패:', error)
      this.status.errors.push(`API 목록 업데이트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      return { totalGyms: 0 }
    }
  }

  /**
   * 크롤링 실행
   */
  private async executeCrawling(): Promise<number> {
    this.status.currentStep = '크롤링 실행'
    console.log('🕷️ 크롤링 실행')

    try {
      // 공공 API에서 가져온 헬스장 목록을 기반으로 크롤링
      const publicApiData = await this.publicApiScheduler.getStoredData()
      
      if (publicApiData.length === 0) {
        console.log('⚠️ 크롤링할 공공 API 데이터가 없습니다')
        return 0
      }

      let totalCrawledGyms = 0
      const batchSize = this.config.batchSize

      // 배치 단위로 크롤링 실행
      for (let i = 0; i < publicApiData.length; i += batchSize) {
        const batch = publicApiData.slice(i, i + batchSize)
        
        this.status.progress = {
          current: i,
          total: publicApiData.length,
          percentage: Math.round((i / publicApiData.length) * 100)
        }

        console.log(`📊 크롤링 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(publicApiData.length / batchSize)} 처리 중...`)

        // 배치 내에서 병렬 크롤링
        const batchPromises = batch.map(async (gym) => {
          try {
            const crawlingResults = await this.crawlingBypassService.crawlAllSources(gym.name)
            
            // 타입 가드 적용
            const validatedResults = this.typeGuardService.validateDataArray(
              crawlingResults,
              (data) => this.typeGuardService.validateCrawlingData(data)
            )

            return validatedResults.validData
          } catch (error) {
            console.warn(`⚠️ ${gym.name} 크롤링 실패:`, error)
            return []
          }
        })

        const batchResults = await Promise.allSettled(batchPromises)
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            totalCrawledGyms += result.value.length
          }
        })

        // 배치 간 지연
        if (i + batchSize < publicApiData.length) {
          await this.delay(this.config.delayBetweenBatches)
        }
      }

      console.log(`✅ 크롤링 완료: ${totalCrawledGyms}개 헬스장`)
      return totalCrawledGyms

    } catch (error) {
      console.error('❌ 크롤링 실행 실패:', error)
      this.status.errors.push(`크롤링 실행 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      return 0
    }
  }

  /**
   * 데이터 병합 실행
   */
  private async executeDataMerging(): Promise<number> {
    this.status.currentStep = '데이터 병합'
    console.log('🔄 데이터 병합 실행')

    try {
      // 공공 API 데이터와 크롤링 데이터를 병합
      const publicApiData = await this.publicApiScheduler.getStoredData()
      
      // 크롤링 데이터는 별도로 저장된 파일에서 가져오거나 메모리에서 처리
      // 실제 구현에서는 크롤링 결과를 임시 저장소에 저장하고 여기서 가져옴
      
      const allSourceData = [
        ...publicApiData.map(data => ({ ...data, source: 'public_api' })),
        // 크롤링 데이터 추가 (실제 구현에서는 적절한 소스에서 가져옴)
      ]

      // 타입 가드 적용
      const validatedData = this.typeGuardService.validateDataArray(
        allSourceData,
        (data) => this.typeGuardService.validateIntegratedData(data)
      )

      if (validatedData.invalidCount > 0) {
        console.warn(`⚠️ ${validatedData.invalidCount}개 데이터가 검증에 실패했습니다`)
      }

      // 데이터 병합
      const mergedData = await this.dataMergingService.mergeGymDataFromMultipleSources(
        validatedData.validData as any[]
      )

      console.log(`✅ 데이터 병합 완료: ${mergedData.length}개 헬스장`)
      return mergedData.length

    } catch (error) {
      console.error('❌ 데이터 병합 실패:', error)
      this.status.errors.push(`데이터 병합 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      return 0
    }
  }

  /**
   * 데이터 품질 검사 실행
   */
  private async executeQualityCheck(): Promise<{
    average: number
    min: number
    max: number
    distribution: Record<string, number>
  }> {
    this.status.currentStep = '데이터 품질 검사'
    console.log('🔍 데이터 품질 검사 실행')

    try {
      const qualityStats = await this.dataQualityService.getQualityStats()
      
      console.log(`✅ 데이터 품질 검사 완료: 평균 ${(qualityStats as any).averageQuality?.toFixed(2) || '0.00'}`)
      
      return {
        average: (qualityStats as any).averageQuality || 0,
        min: (qualityStats as any).minQuality || 0,
        max: (qualityStats as any).maxQuality || 0,
        distribution: (qualityStats as any).qualityDistribution || {}
      }

    } catch (error) {
      console.error('❌ 데이터 품질 검사 실패:', error)
      this.status.errors.push(`데이터 품질 검사 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      
      return {
        average: 0,
        min: 0,
        max: 0,
        distribution: {}
      }
    }
  }

  /**
   * 최종 데이터 저장
   */
  private async saveFinalData(): Promise<number> {
    this.status.currentStep = '최종 데이터 저장'
    console.log('💾 최종 데이터 저장')

    try {
      let totalSaved = 0

      // 파일 저장
      if (this.config.saveToFile) {
        const savedToFile = await this.saveToFile()
        totalSaved += savedToFile
      }

      // 데이터베이스 저장
      if (this.config.saveToDatabase) {
        const savedToDatabase = await this.saveToDatabase()
        totalSaved += savedToDatabase
      }

      console.log(`✅ 최종 데이터 저장 완료: ${totalSaved}개 헬스장`)
      return totalSaved

    } catch (error) {
      console.error('❌ 최종 데이터 저장 실패:', error)
      this.status.errors.push(`최종 데이터 저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      return 0
    }
  }

  /**
   * 파일로 데이터 저장
   */
  private async saveToFile(): Promise<number> {
    try {
      const timestamp = new Date().toISOString()
      const filePath = path.join(this.dataDirectory, 'gyms_raw.json')
      
      // 모든 데이터 소스에서 데이터 수집
      const publicApiData = await this.publicApiScheduler.getStoredData()
      
      const dataToSave = {
        metadata: {
          totalGyms: publicApiData.length,
          lastUpdated: timestamp,
          source: 'integrated_crawling_service',
          version: '1.0.0',
          config: this.config
        },
        gyms: publicApiData
      }

      await fs.promises.writeFile(
        filePath, 
        JSON.stringify(dataToSave, null, 2), 
        'utf8'
      )

      console.log(`💾 데이터가 파일에 저장되었습니다: ${filePath}`)
      return publicApiData.length

    } catch (error) {
      console.error('❌ 파일 저장 실패:', error)
      throw error
    }
  }

  /**
   * 데이터베이스에 데이터 저장
   */
  private async saveToDatabase(): Promise<number> {
    try {
      const publicApiData = await this.publicApiScheduler.getStoredData()
      let savedCount = 0

      for (const gymData of publicApiData) {
        try {
          // 타입 가드 적용
          const validation = this.typeGuardService.validateIntegratedData(gymData)
          
          if (validation.isValid && validation.data) {
            // 기존 데이터 확인
            const existingGym = await this.gymRepo.findOne({ where: { id: parseInt(gymData.id || '0') } })
            
            if (existingGym) {
              // 기존 데이터 업데이트
              Object.assign(existingGym, validation.data)
              await this.gymRepo.save(existingGym)
            } else {
              // 새 데이터 생성
              const gymDataForCreate = {
                ...validation.data,
                id: undefined, // ID는 자동 생성
                name: validation.data.name || '',
                address: validation.data.address || '',
                phone: validation.data.phone || '',
                latitude: validation.data.latitude || 0,
                longitude: validation.data.longitude || 0
              }
              const newGym = this.gymRepo.create(gymDataForCreate)
              await this.gymRepo.save(newGym)
            }
            
            savedCount++
          } else {
            console.warn(`⚠️ 데이터 검증 실패로 저장 건너뜀: ${gymData.name}`)
          }
        } catch (error) {
          console.error(`❌ 개별 데이터 저장 실패: ${gymData.name}`, error)
        }
      }

      console.log(`💾 데이터베이스에 ${savedCount}개 헬스장이 저장되었습니다`)
      return savedCount

    } catch (error) {
      console.error('❌ 데이터베이스 저장 실패:', error)
      throw error
    }
  }

  /**
   * 크롤링 설정 업데이트
   */
  updateConfig(newConfig: Partial<CrawlingConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ 크롤링 설정이 업데이트되었습니다')
  }

  /**
   * 크롤링 상태 조회
   */
  getStatus(): CrawlingStatus {
    return { ...this.status }
  }

  /**
   * 크롤링 중단
   */
  async stopCrawling(): Promise<void> {
    if (this.status.isRunning) {
      this.status.isRunning = false
      this.status.currentStep = '중단됨'
      console.log('⏹️ 크롤링이 중단되었습니다')
    }
  }

  /**
   * 데이터 디렉토리 확인 및 생성
   */
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDirectory)) {
      fs.mkdirSync(this.dataDirectory, { recursive: true })
      console.log(`📁 데이터 디렉토리가 생성되었습니다: ${this.dataDirectory}`)
    }
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 저장된 데이터 조회
   */
  async getStoredData(): Promise<any[]> {
    try {
      const filePath = path.join(this.dataDirectory, 'gyms_raw.json')
      
      if (!fs.existsSync(filePath)) {
        return []
      }

      const fileContent = await fs.promises.readFile(filePath, 'utf8')
      const data = JSON.parse(fileContent)
      
      return data.gyms || []
    } catch (error) {
      console.error('❌ 저장된 데이터 조회 실패:', error)
      return []
    }
  }

  /**
   * 크롤링 통계 조회
   */
  async getCrawlingStats(): Promise<{
    totalGyms: number
    publicApiGyms: number
    crawlingGyms: number
    mergedGyms: number
    dataQuality: number
    lastUpdated: string
  }> {
    try {
      const storedData = await this.getStoredData()
      const publicApiData = await this.publicApiScheduler.getStoredData()
      
      return {
        totalGyms: storedData.length,
        publicApiGyms: publicApiData.length,
        crawlingGyms: 0, // 실제 구현에서는 크롤링 데이터 수 계산
        mergedGyms: storedData.length,
        dataQuality: 0.8, // 실제 구현에서는 품질 점수 계산
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ 크롤링 통계 조회 실패:', error)
      return {
        totalGyms: 0,
        publicApiGyms: 0,
        crawlingGyms: 0,
        mergedGyms: 0,
        dataQuality: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }
}
