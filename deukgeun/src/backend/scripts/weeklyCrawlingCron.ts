/**
 * EC2 환경용 7일 주기 크롤링 스크립트
 * gyms_raw.json 데이터를 안전하게 업데이트
 * 
 * 특징:
 * - 기존 파일 수정 방식 (파일 추가 X)
 * - 병렬 처리로 안전한 오류 처리
 * - EC2 환경 최적화
 * 
 * 사용법:
 * - PM2로 배포: pm2 start ecosystem.config.cjs --only weekly-crawling
 * - 수동 실행: npx ts-node src/backend/scripts/weekly-crawling-cron.ts
 */

import { CrawlingService } from '@backend/modules/crawling/core/CrawlingService'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

// 비동기 파일 작업을 위한 promisify
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)
const mkdir = promisify(fs.mkdir)

// 환경 변수에서 설정값 가져오기
const getConfigValue = (key: string, defaultValue: any): any => {
  const value = process.env[key]
  if (value === undefined) return defaultValue
  
  // 숫자 변환 시도
  if (typeof defaultValue === 'number') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }
  
  // 불린 변환 시도
  if (typeof defaultValue === 'boolean') {
    return value.toLowerCase() === 'true'
  }
  
  return value
}

// 안전한 파일 작업을 위한 래퍼
class SafeFileManager {
  private static readonly MAX_RETRIES = getConfigValue('SAFE_FILE_RETRIES', 3)
  private static readonly RETRY_DELAY = getConfigValue('SAFE_FILE_DELAY', 1000)

  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await mkdir(dirPath, { recursive: true })
    } catch (error) {
      if ((error as any).code !== 'EEXIST') {
        throw error
      }
    }
  }

  static async safeReadFile(filePath: string): Promise<string> {
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        return await readFile(filePath, 'utf-8')
      } catch (error) {
        if (i === this.MAX_RETRIES - 1) throw error
        await this.delay(this.RETRY_DELAY * (i + 1))
      }
    }
    throw new Error('파일 읽기 실패')
  }

  static async safeWriteFile(filePath: string, data: string): Promise<void> {
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        // 임시 파일에 먼저 쓰기
        const tempPath = `${filePath}.tmp`
        await writeFile(tempPath, data, 'utf-8')
        
        // 원자적 이동 (rename)
        await fs.promises.rename(tempPath, filePath)
        return
      } catch (error) {
        // 임시 파일 정리
        try {
          if (fs.existsSync(`${filePath}.tmp`)) {
            await fs.promises.unlink(`${filePath}.tmp`)
          }
        } catch (cleanupError) {
          // 정리 실패는 무시
        }
        
        if (i === this.MAX_RETRIES - 1) throw error
        await this.delay(this.RETRY_DELAY * (i + 1))
      }
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 병렬 처리를 위한 안전한 크롤링 매니저
class SafeCrawlingManager {
  private crawlingService: CrawlingService
  private readonly maxConcurrent = getConfigValue('CRAWLING_MAX_CONCURRENT', 3)
  private readonly batchSize = getConfigValue('CRAWLING_BATCH_SIZE', 10)
  private readonly retryDelay = getConfigValue('CRAWLING_RETRY_DELAY', 2000)
  private readonly timeout = getConfigValue('CRAWLING_TIMEOUT', 30000)
  private readonly maxRetries = getConfigValue('CRAWLING_MAX_RETRIES', 3)

  constructor() {
    this.crawlingService = new CrawlingService(null)
    this.crawlingService.updateConfig({
      enablePublicApi: getConfigValue('ENABLE_PUBLIC_API', true),
      enableCrawling: getConfigValue('ENABLE_CRAWLING', true),
      enableDataMerging: getConfigValue('ENABLE_DATA_MERGING', true),
      enableQualityCheck: getConfigValue('ENABLE_QUALITY_CHECK', true),
      batchSize: this.batchSize,
      maxConcurrentRequests: this.maxConcurrent,
      delayBetweenBatches: this.retryDelay,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      saveToFile: getConfigValue('SAVE_TO_FILE', true),
      saveToDatabase: getConfigValue('SAVE_TO_DATABASE', false)
    })
  }

  async executeSafeCrawling(): Promise<{
    success: boolean
    totalProcessed: number
    successfulUpdates: number
    errors: string[]
    duration: number
  }> {
    const startTime = Date.now()
    const errors: string[] = []
    let totalProcessed = 0
    let successfulUpdates = 0

    try {
      console.log('🔄 Step 1: 공공 API 데이터 수집 (안전 모드)')
      const publicApiData = await this.safeCollectFromPublicAPI()
      totalProcessed += publicApiData.length
      console.log(`✅ 공공 API 수집 완료: ${publicApiData.length}개 헬스장`)

      console.log('🔄 Step 2: 기존 gyms_raw.json 업데이트')
      const updateResult = await this.safeUpdateGymsRaw(publicApiData)
      successfulUpdates += updateResult.updated
      if (updateResult.errors.length > 0) {
        errors.push(...updateResult.errors)
      }

      console.log('🔄 Step 3: 웹 크롤링 (병렬 처리)')
      const crawlResult = await this.safeCrawlGyms()
      totalProcessed += crawlResult.processed
      successfulUpdates += crawlResult.successful
      if (crawlResult.errors.length > 0) {
        errors.push(...crawlResult.errors)
      }

      console.log('🔄 Step 4: 최종 데이터 병합')
      const mergeResult = await this.safeMergeData()
      if (mergeResult.errors.length > 0) {
        errors.push(...mergeResult.errors)
      }

      const duration = Date.now() - startTime
      return {
        success: errors.length === 0,
        totalProcessed,
        successfulUpdates,
        errors,
        duration
      }

    } catch (error) {
      const duration = Date.now() - startTime
      errors.push(`전체 크롤링 실패: ${error instanceof Error ? error.message : String(error)}`)
      return {
        success: false,
        totalProcessed,
        successfulUpdates,
        errors,
        duration
      }
    }
  }

  private async safeCollectFromPublicAPI(): Promise<any[]> {
    try {
      return await this.crawlingService.collectFromPublicAPI()
    } catch (error) {
      console.warn('⚠️ 공공 API 수집 실패, 빈 배열 반환:', error)
      return []
    }
  }

  private async safeCrawlGyms(): Promise<{
    processed: number
    successful: number
    errors: string[]
  }> {
    const errors: string[] = []
    let processed = 0
    let successful = 0

    try {
      // gyms_raw.json에서 기존 데이터 읽기
      const gymsRawPath = path.join(process.cwd(), 'src', 'data', 'gyms_raw.json')
      let existingGyms: any[] = []
      
      if (fs.existsSync(gymsRawPath)) {
        const content = await SafeFileManager.safeReadFile(gymsRawPath)
        const parsed = JSON.parse(content)
        
        // 배열인지 확인
        if (!Array.isArray(parsed)) {
          throw new Error('gyms_raw.json이 유효한 배열 형식이 아닙니다')
        }
        
        existingGyms = parsed
      }

      // 크롤링할 헬스장이 없으면 조기 반환
      if (existingGyms.length === 0) {
        console.log('⚠️ 크롤링할 헬스장이 없습니다')
        return { processed: 0, successful: 0, errors: [] }
      }

      // 배치 단위로 병렬 처리 (메모리 관리)
      const batches = this.createBatches(existingGyms, this.batchSize)
      console.log(`📊 총 ${existingGyms.length}개 헬스장을 ${batches.length}개 배치로 처리`)
      
      // 타임아웃 설정 (배치당 최대 5분)
      const BATCH_TIMEOUT = 5 * 60 * 1000 // 5분
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        console.log(`🔄 배치 ${batchIndex + 1}/${batches.length} 처리 중 (${batch.length}개 헬스장)`)
        
        try {
          // 배치 타임아웃 설정
          const batchPromise = Promise.allSettled(
            batch.map(async (gym, gymIndex) => {
              try {
                // 필수 필드 검증
                if (!gym || typeof gym !== 'object') {
                  throw new Error('헬스장 데이터가 유효하지 않습니다')
                }

                if (!gym.name || !gym.address) {
                  throw new Error('헬스장 이름 또는 주소가 없습니다')
                }

                // 데이터 타입 검증
                if (typeof gym.name !== 'string' || typeof gym.address !== 'string') {
                  throw new Error('헬스장 이름 또는 주소 타입이 올바르지 않습니다')
                }

                // 데이터 크기 검증
                if (gym.name.length > 200 || gym.address.length > 500) {
                  throw new Error('헬스장 이름 또는 주소가 너무 깁니다')
                }

                // 개별 크롤링 타임아웃 (1분)
                const CRAWL_TIMEOUT = 60 * 1000 // 1분
                const crawlPromise = this.crawlingService.crawlGymDetails({
                  gymName: gym.name.trim(),
                  gymAddress: gym.address.trim()
                })

                const timeoutPromise = new Promise<null>((_, reject) => {
                  setTimeout(() => {
                    reject(new Error('크롤링 타임아웃 (1분 초과)'))
                  }, CRAWL_TIMEOUT)
                })

                const result = await Promise.race([crawlPromise, timeoutPromise])
                
                processed++
                if (result) {
                  successful++
                  console.log(`✅ 크롤링 성공: ${gym.name}`)
                } else {
                  console.log(`⚠️ 크롤링 결과 없음: ${gym.name}`)
                }
                
                return { success: true, result, gymName: gym.name }
              } catch (error) {
                processed++
                const errorMsg = `크롤링 실패 (${gym.name}): ${error instanceof Error ? error.message : String(error)}`
                errors.push(errorMsg)
                console.log(`❌ ${errorMsg}`)
                return { success: false, error, gymName: gym.name }
              }
            })
          )

          // 배치 타임아웃 처리
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error(`배치 ${batchIndex + 1} 타임아웃 (${BATCH_TIMEOUT / 1000}초 초과)`))
            }, BATCH_TIMEOUT)
          })

          const batchResults = await Promise.race([batchPromise, timeoutPromise])
          
          // 배치 결과 로깅
          if (Array.isArray(batchResults)) {
            const batchSuccess = batchResults.filter(r => r.status === 'fulfilled' && r.value && r.value.success).length
            console.log(`📊 배치 ${batchIndex + 1} 완료: ${batchSuccess}/${batch.length} 성공`)
          } else {
            console.error(`❌ 배치 ${batchIndex + 1} 타임아웃`)
            errors.push(`배치 ${batchIndex + 1} 타임아웃`)
          }
        } catch (batchError) {
          console.error(`❌ 배치 ${batchIndex + 1} 처리 실패:`, batchError)
          errors.push(`배치 ${batchIndex + 1} 처리 실패: ${batchError instanceof Error ? batchError.message : String(batchError)}`)
          // 에러가 발생해도 다음 배치 계속 처리
          continue
        }
        
        // 배치 간 지연 (마지막 배치가 아닌 경우)
        if (batchIndex < batches.length - 1) {
          console.log(`⏳ ${this.retryDelay}ms 대기 중...`)
          await this.delay(this.retryDelay)
        }

        // 메모리 정리 (큰 데이터셋 처리 시)
        if (batchIndex % 10 === 0 && batchIndex > 0) {
          // 가비지 컬렉션 힌트
          if (global.gc) {
            global.gc()
          }
        }
      }

    } catch (error) {
      const errorMsg = `웹 크롤링 전체 실패: ${error instanceof Error ? error.message : String(error)}`
      errors.push(errorMsg)
      console.error(`💥 ${errorMsg}`)
    }

    console.log(`📊 크롤링 완료: ${successful}/${processed} 성공`)
    return { processed, successful, errors }
  }

  private async safeUpdateGymsRaw(newData: any[]): Promise<{
    updated: number
    errors: string[]
  }> {
    const errors: string[] = []
    let updated = 0

    try {
      const gymsRawPath = path.join(process.cwd(), 'src', 'data', 'gyms_raw.json')
      
      // 디렉토리 존재 확인
      await SafeFileManager.ensureDirectoryExists(path.dirname(gymsRawPath))

      // 기존 데이터 읽기
      let existingData: any[] = []
      if (fs.existsSync(gymsRawPath)) {
        const content = await SafeFileManager.safeReadFile(gymsRawPath)
        const parsed = JSON.parse(content)
        
        // 배열인지 확인
        if (!Array.isArray(parsed)) {
          throw new Error('기존 gyms_raw.json이 유효한 배열 형식이 아닙니다')
        }
        
        existingData = parsed
      }

      // 새 데이터가 없으면 조기 반환
      if (!newData || newData.length === 0) {
        console.log('⚠️ 업데이트할 새 데이터가 없습니다')
        return { updated: 0, errors: [] }
      }

      // 데이터 유효성 검증 강화
      const validNewData = newData.filter(item => {
        try {
          // 기본 타입 검증
          if (!item || typeof item !== 'object') {
            console.warn('⚠️ 유효하지 않은 데이터 항목 제외: 타입이 객체가 아닙니다')
            return false
          }

          // 필수 필드 검증
          if (!item.name || !item.address) {
            console.warn('⚠️ 필수 필드가 없는 데이터 제외')
            return false
          }

          // 필드 타입 검증
          if (typeof item.name !== 'string' || typeof item.address !== 'string') {
            console.warn('⚠️ 필수 필드 타입이 올바르지 않습니다')
            return false
          }

          // 데이터 크기 검증
          if (item.name.length > 200 || item.address.length > 500) {
            console.warn(`⚠️ 데이터 항목이 너무 깁니다: ${item.name}`)
            return false
          }

          // 데이터 무결성 검증 (순환 참조 등)
          try {
            JSON.stringify(item)
          } catch (error) {
            console.warn('⚠️ 데이터 항목에 순환 참조가 있습니다')
            return false
          }

          return true
        } catch (error) {
          console.warn(`⚠️ 데이터 항목 검증 실패: ${error instanceof Error ? error.message : String(error)}`)
          return false
        }
      })

      if (validNewData.length === 0) {
        console.log('⚠️ 유효한 새 데이터가 없습니다')
        return { updated: 0, errors: [] }
      }

      // 메모리 사용량 제한 (최대 50000개 항목)
      const MAX_ITEMS = 50000
      const maxNewData = MAX_ITEMS - existingData.length
      const limitedNewData = validNewData.length > maxNewData 
        ? validNewData.slice(0, maxNewData)
        : validNewData

      if (validNewData.length > maxNewData) {
        console.warn(`⚠️ 새 데이터가 너무 많습니다 (${validNewData.length}개). 최대 ${maxNewData}개만 사용합니다.`)
      }

      console.log(`📊 기존 데이터: ${existingData.length}개, 새 데이터: ${limitedNewData.length}개`)

      // 데이터 병합 (기존 파일 수정 방식)
      const mergedData = this.mergeGymData(existingData, limitedNewData)
      updated = mergedData.length - existingData.length

      console.log(`📊 병합 후: ${mergedData.length}개 (${updated > 0 ? '+' : ''}${updated}개 추가)`)

      // 데이터 무결성 최종 검증
      const finalValidData = mergedData.filter(item => {
        try {
          if (!item || typeof item !== 'object') return false
          if (!item.name || !item.address) return false
          if (typeof item.name !== 'string' || typeof item.address !== 'string') return false
          
          // 순환 참조 검증
          try {
            JSON.stringify(item)
          } catch {
            return false
          }
          
          return true
        } catch {
          return false
        }
      })

      if (finalValidData.length !== mergedData.length) {
        const invalidCount = mergedData.length - finalValidData.length
        console.warn(`⚠️ 최종 검증에서 ${invalidCount}개 항목이 제외되었습니다`)
      }

      // 안전하게 파일 저장
      try {
        const jsonData = JSON.stringify(finalValidData, null, 2)
        
        // 파일 크기 검증 (최대 100MB)
        const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
        if (jsonData.length > MAX_FILE_SIZE) {
          throw new Error(`파일 크기가 너무 큽니다: ${(jsonData.length / 1024 / 1024).toFixed(2)}MB (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)`)
        }

        await SafeFileManager.safeWriteFile(gymsRawPath, jsonData)
      } catch (writeError) {
        throw new Error(`파일 쓰기 실패: ${writeError instanceof Error ? writeError.message : String(writeError)}`)
      }

      console.log(`✅ gyms_raw.json 업데이트 완료: ${updated}개 추가`)

    } catch (error) {
      const errorMsg = `gyms_raw.json 업데이트 실패: ${error instanceof Error ? error.message : String(error)}`
      errors.push(errorMsg)
      console.error(`💥 ${errorMsg}`)
    }

    return { updated, errors }
  }

  private async safeMergeData(): Promise<{ errors: string[] }> {
    const errors: string[] = []

    try {
      await this.crawlingService.mergeAndSaveToGymsRaw([])
    } catch (error) {
      errors.push(`데이터 병합 실패: ${error instanceof Error ? error.message : String(error)}`)
    }

    return { errors }
  }

  private mergeGymData(existing: any[], newData: any[]): any[] {
    // 메모리 사용량 제한 (최대 50000개 항목)
    const MAX_ITEMS = 50000
    const MAX_EXISTING_ITEMS = 45000 // 기존 데이터 최대 크기
    
    // 기존 데이터 크기 제한
    const limitedExisting = existing.length > MAX_EXISTING_ITEMS 
      ? existing.slice(0, MAX_EXISTING_ITEMS)
      : existing
    
    // 새 데이터 크기 제한
    const maxNewData = MAX_ITEMS - limitedExisting.length
    const limitedNewData = newData.length > maxNewData 
      ? newData.slice(0, maxNewData)
      : newData

    if (existing.length > MAX_EXISTING_ITEMS) {
      console.warn(`⚠️ 기존 데이터가 너무 많습니다 (${existing.length}개). 최대 ${MAX_EXISTING_ITEMS}개만 사용합니다.`)
    }

    if (newData.length > maxNewData) {
      console.warn(`⚠️ 새 데이터가 너무 많습니다 (${newData.length}개). 최대 ${maxNewData}개만 사용합니다.`)
    }

    // Map을 사용하여 성능 개선 (O(n) vs O(n²))
    const mergedMap = new Map<string, any>()
    const now = new Date().toISOString()
    let updatedCount = 0
    let addedCount = 0
    let invalidCount = 0

    // 기존 데이터를 Map에 추가
    for (const existingGym of limitedExisting) {
      try {
        // 필수 필드 검증
        if (!existingGym.name || !existingGym.address) {
          invalidCount++
          continue
        }

        const key = this.generateGymKey(existingGym.name, existingGym.address)
        mergedMap.set(key, existingGym)
      } catch (error) {
        invalidCount++
        console.warn(`⚠️ 기존 데이터 항목 처리 실패: ${error instanceof Error ? error.message : String(error)}`)
        continue
      }
    }

    // 새 데이터 병합
    for (const newGym of limitedNewData) {
      try {
        // 필수 필드 검증
        if (!newGym.name || !newGym.address) {
          invalidCount++
          continue
        }

        // 데이터 무결성 검증
        if (typeof newGym.name !== 'string' || typeof newGym.address !== 'string') {
          invalidCount++
          console.warn('⚠️ 필수 필드 타입이 올바르지 않습니다:', newGym)
          continue
        }

        // 데이터 크기 검증
        if (newGym.name.length > 200 || newGym.address.length > 500) {
          invalidCount++
          console.warn(`⚠️ 데이터 항목이 너무 깁니다: ${newGym.name}`)
          continue
        }

        const key = this.generateGymKey(newGym.name, newGym.address)
        
        if (mergedMap.has(key)) {
          // 기존 데이터 업데이트 (기존 데이터 우선)
          const existingGym = mergedMap.get(key)!
          mergedMap.set(key, {
            ...existingGym,
            ...newGym, // 새 데이터로 보완
            updatedAt: now,
            createdAt: existingGym.createdAt || now
          })
          updatedCount++
        } else {
          // 새 데이터 추가
          mergedMap.set(key, {
            ...newGym,
            createdAt: now,
            updatedAt: now
          })
          addedCount++
        }
      } catch (error) {
        invalidCount++
        console.warn(`⚠️ 새 데이터 항목 처리 실패: ${error instanceof Error ? error.message : String(error)}`)
        continue
      }
    }

    const merged = Array.from(mergedMap.values())
    
    console.log(`📊 병합 결과: ${updatedCount}개 업데이트, ${addedCount}개 추가, ${invalidCount}개 유효하지 않음`)
    console.log(`📊 최종 데이터: ${merged.length}개 (최대 ${MAX_ITEMS}개)`)
    
    return merged
  }

  /**
   * 헬스장 키 생성 (성능 최적화)
   */
  private generateGymKey(name: string, address: string): string {
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '')
    const normalizedAddress = address.trim().toLowerCase().replace(/\s+/g, '')
    return `${normalizedName}-${normalizedAddress}`
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize))
    }
    return batches
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// EC2 환경 감지 및 설정
function detectEnvironment(): {
  isEC2: boolean
  nodeEnv: string
  logLevel: 'debug' | 'info' | 'warn' | 'error'
} {
  const isEC2 = process.env.AWS_REGION !== undefined || 
                process.env.EC2_INSTANCE_ID !== undefined ||
                process.env.NODE_ENV === 'production'
  
  const nodeEnv = process.env.NODE_ENV || 'development'
  const logLevel = isEC2 ? 'info' : 'debug'
  
  return { isEC2, nodeEnv, logLevel }
}

// 안전한 로깅 시스템
class SafeLogger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error'
  private logFile: string

  constructor(logLevel: 'debug' | 'info' | 'warn' | 'error') {
    this.logLevel = logLevel
    this.logFile = path.join(process.cwd(), 'logs', 'weekly-crawling.log')
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
  }

  private async writeToFile(message: string): Promise<void> {
    try {
      await SafeFileManager.ensureDirectoryExists(path.dirname(this.logFile))
      await fs.promises.appendFile(this.logFile, message + '\n', 'utf-8')
    } catch (error) {
      // 로그 파일 쓰기 실패해도 스크립트는 계속 실행
      console.warn('로그 파일 쓰기 실패:', error)
    }
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message)
      console.log(formatted)
      this.writeToFile(formatted)
    }
  }

  info(message: string): void {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message)
      console.log(formatted)
      this.writeToFile(formatted)
    }
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message)
      console.warn(formatted)
      this.writeToFile(formatted)
    }
  }

  error(message: string): void {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message)
      console.error(formatted)
      this.writeToFile(formatted)
    }
  }
}

// 메인 크롤링 실행 함수
async function runWeeklyCrawling(): Promise<void> {
  const { isEC2, nodeEnv, logLevel } = detectEnvironment()
  const logger = new SafeLogger(logLevel)

  logger.info('='.repeat(80))
  logger.info('🚀 EC2 환경용 주간 크롤링 시작')
  logger.info('='.repeat(80))
  logger.info(`📅 실행 시간: ${new Date().toISOString()}`)
  logger.info(`🌍 환경: ${nodeEnv} (EC2: ${isEC2})`)
  logger.info(`📁 대상 파일: gyms_raw.json`)
  logger.info(`🔧 로그 레벨: ${logLevel}`)
  logger.info('='.repeat(80))

  const startTime = Date.now()
  let exitCode = 0

  try {
    // 사전 검증
    logger.info('🔍 사전 검증 시작...')
    
    // 필수 디렉토리 확인
    const dataDir = path.join(process.cwd(), 'src', 'data')
    const logsDir = path.join(process.cwd(), 'logs')
    
    await SafeFileManager.ensureDirectoryExists(dataDir)
    await SafeFileManager.ensureDirectoryExists(logsDir)
    
    logger.info('✅ 필수 디렉토리 확인 완료')

    // 안전한 크롤링 매니저 생성
    const crawlingManager = new SafeCrawlingManager()
    
    logger.info('🔄 안전한 크롤링 실행 시작')
    const result = await crawlingManager.executeSafeCrawling()

    // 결과 로깅
    logger.info('='.repeat(80))
    logger.info('📊 크롤링 결과 요약')
    logger.info('='.repeat(80))
    logger.info(`✅ 성공 여부: ${result.success ? '성공' : '부분 실패'}`)
    logger.info(`📈 총 처리된 헬스장: ${result.totalProcessed}개`)
    logger.info(`✅ 성공적으로 업데이트된 헬스장: ${result.successfulUpdates}개`)
    logger.info(`⏱️ 소요 시간: ${(result.duration / 1000).toFixed(2)}초`)
    
    if (result.errors.length > 0) {
      logger.warn(`⚠️ 발생한 오류 수: ${result.errors.length}개`)
      logger.warn('📝 오류 상세:')
      result.errors.forEach((error, index) => {
        logger.warn(`   ${index + 1}. ${error}`)
      })
    }

    // 성공률 계산
    const successRate = result.totalProcessed > 0 
      ? ((result.successfulUpdates / result.totalProcessed) * 100).toFixed(1)
      : '0.0'
    
    logger.info(`📊 성공률: ${successRate}%`)
    logger.info('='.repeat(80))
    
    // 종료 코드 결정 (성공률 기반)
    if (result.success) {
      logger.info('✅ 주간 크롤링이 성공적으로 완료되었습니다!')
      exitCode = 0
    } else if (parseFloat(successRate) >= 50) {
      logger.warn('⚠️ 주간 크롤링이 부분적으로 완료되었습니다. (50% 이상 성공)')
      exitCode = 0 // 부분 성공도 성공으로 간주
    } else {
      logger.error('❌ 주간 크롤링이 실패했습니다. (50% 미만 성공)')
      exitCode = 1
    }

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('='.repeat(80))
    logger.error('❌ 주간 크롤링 전체 실패')
    logger.error('='.repeat(80))
    logger.error(`⏱️ 실패 시점: ${(duration / 1000).toFixed(2)}초 후`)
    logger.error(`💥 오류: ${error instanceof Error ? error.message : String(error)}`)
    
    if (error instanceof Error && error.stack) {
      logger.error('📚 스택 트레이스:')
      logger.error(error.stack)
    }
    
    logger.error('='.repeat(80))
    exitCode = 1
  }

  // 최종 로그
  const totalDuration = Date.now() - startTime
  logger.info(`🏁 크롤링 종료 - 총 소요 시간: ${(totalDuration / 1000).toFixed(2)}초`)
  logger.info('='.repeat(80))

  // 안전한 종료
  process.exit(exitCode)
}

// 프로세스 신호 처리 (안전한 종료)
let isShuttingDown = false

process.on('SIGINT', () => {
  if (isShuttingDown) {
    console.log('\n🛑 강제 종료 중...')
    process.exit(1)
  }
  
  console.log('\n🛑 SIGINT 신호 수신 - 안전한 종료 중...')
  isShuttingDown = true
  
  // 30초 후 강제 종료
  setTimeout(() => {
    console.log('🛑 30초 타임아웃 - 강제 종료')
    process.exit(1)
  }, 30000)
  
  process.exit(0)
})

process.on('SIGTERM', () => {
  if (isShuttingDown) {
    console.log('\n🛑 강제 종료 중...')
    process.exit(1)
  }
  
  console.log('\n🛑 SIGTERM 신호 수신 - 안전한 종료 중...')
  isShuttingDown = true
  
  // 30초 후 강제 종료
  setTimeout(() => {
    console.log('🛑 30초 타임아웃 - 강제 종료')
    process.exit(1)
  }, 30000)
  
  process.exit(0)
})

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error) => {
  console.error('💥 처리되지 않은 예외:', error)
  console.error('📚 스택 트레이스:', error.stack)
  
  // 로그 파일에 기록
  try {
    const logFile = path.join(process.cwd(), 'logs', 'weekly-crawling-error.log')
    const errorMsg = `[${new Date().toISOString()}] UNCAUGHT_EXCEPTION: ${error.message}\n${error.stack}\n\n`
    fs.appendFileSync(logFile, errorMsg)
  } catch (logError) {
    console.error('로그 파일 쓰기 실패:', logError)
  }
  
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 처리되지 않은 Promise 거부:', reason)
  console.error('📚 Promise:', promise)
  
  // 로그 파일에 기록
  try {
    const logFile = path.join(process.cwd(), 'logs', 'weekly-crawling-error.log')
    const errorMsg = `[${new Date().toISOString()}] UNHANDLED_REJECTION: ${reason}\nPromise: ${promise}\n\n`
    fs.appendFileSync(logFile, errorMsg)
  } catch (logError) {
    console.error('로그 파일 쓰기 실패:', logError)
  }
  
  process.exit(1)
})

// 스크립트 실행
runWeeklyCrawling().catch((error) => {
  console.error('💥 메인 함수 실행 실패:', error)
  process.exit(1)
})

