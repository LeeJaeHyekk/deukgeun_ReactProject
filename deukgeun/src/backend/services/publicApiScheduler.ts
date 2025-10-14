import { config } from '../config/env'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import { CronJob } from 'cron'

// 공공 API 데이터 인터페이스
interface PublicApiGymData {
  id: string
  name: string
  type: string
  address: string
  phone: string
  latitude: number
  longitude: number
  businessStatus: string
  lastUpdated: string
  source: string
}

// 스케줄링 설정 인터페이스
interface SchedulerConfig {
  enabled: boolean
  cronExpression: string
  maxRetries: number
  retryDelay: number
  timeout: number
  batchSize: number
}

// 스케줄링 상태 인터페이스
interface SchedulerStatus {
  isRunning: boolean
  lastRun: Date | null
  nextRun: Date | null
  totalRuns: number
  successRuns: number
  failedRuns: number
  lastError: string | null
}

/**
 * 공공 API 스케줄링 서비스
 * 정기적으로 공공 API에서 헬스장 데이터를 가져와서 업데이트하는 스케줄러
 */
export class PublicApiScheduler {
  private config: SchedulerConfig
  private status: SchedulerStatus
  private cronJob: CronJob | null = null
  private dataDirectory: string

  constructor() {
    this.config = {
      enabled: true,
      cronExpression: '0 2 * * *', // 매일 새벽 2시
      maxRetries: 3,
      retryDelay: 5000,
      timeout: 30000,
      batchSize: 1000
    }
    
    this.status = {
      isRunning: false,
      lastRun: null,
      nextRun: null,
      totalRuns: 0,
      successRuns: 0,
      failedRuns: 0,
      lastError: null
    }

    this.dataDirectory = path.join(process.cwd(), 'src', 'data')
    this.ensureDataDirectory()
  }

  /**
   * 스케줄러 시작
   */
  start(): void {
    if (this.cronJob) {
      console.log('⚠️ 스케줄러가 이미 실행 중입니다')
      return
    }

    if (!this.config.enabled) {
      console.log('⚠️ 스케줄러가 비활성화되어 있습니다')
      return
    }

    try {
      this.cronJob = new CronJob(
        this.config.cronExpression,
        () => this.executeScheduledUpdate(),
        null,
        true,
        'Asia/Seoul'
      )

      this.status.nextRun = this.cronJob.nextDate().toJSDate()
      console.log(`✅ 공공 API 스케줄러가 시작되었습니다. 다음 실행: ${this.status.nextRun}`)
    } catch (error) {
      console.error('❌ 스케줄러 시작 실패:', error)
      this.status.lastError = error instanceof Error ? error.message : '알 수 없는 오류'
    }
  }

  /**
   * 스케줄러 중지
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
      this.status.isRunning = false
      this.status.nextRun = null
      console.log('⏹️ 공공 API 스케줄러가 중지되었습니다')
    }
  }

  /**
   * 스케줄된 업데이트 실행
   */
  private async executeScheduledUpdate(): Promise<void> {
    if (this.status.isRunning) {
      console.log('⚠️ 이전 작업이 아직 실행 중입니다. 건너뜁니다.')
      return
    }

    this.status.isRunning = true
    this.status.totalRuns++
    this.status.lastRun = new Date()

    console.log(`🚀 공공 API 스케줄된 업데이트 시작: ${this.status.lastRun}`)

    try {
      const result = await this.updatePublicApiData()
      
      if (result.success) {
        this.status.successRuns++
        console.log(`✅ 스케줄된 업데이트 완료: ${result.totalGyms}개 헬스장`)
      } else {
        this.status.failedRuns++
        this.status.lastError = result.error || '알 수 없는 오류'
        console.error(`❌ 스케줄된 업데이트 실패: ${this.status.lastError}`)
      }
    } catch (error) {
      this.status.failedRuns++
      this.status.lastError = error instanceof Error ? error.message : '알 수 없는 오류'
      console.error('❌ 스케줄된 업데이트 중 오류:', error)
    } finally {
      this.status.isRunning = false
      this.status.nextRun = this.cronJob?.nextDate().toJSDate() || null
    }
  }

  /**
   * 공공 API 데이터 업데이트
   */
  async updatePublicApiData(): Promise<{
    success: boolean
    totalGyms: number
    error?: string
  }> {
    try {
      console.log('📡 공공 API에서 헬스장 데이터를 가져오는 중...')

      // 서울시 공공데이터 API 호출
      const seoulData = await this.fetchSeoulPublicData()
      
      // 기타 공공 API 호출 (추가 가능)
      const otherData = await this.fetchOtherPublicData()

      // 데이터 병합
      const allData = [...seoulData, ...otherData]
      
      // 데이터 검증 및 정리
      const validatedData = this.validateAndCleanData(allData)
      
      // 파일로 저장
      await this.saveDataToFile(validatedData)

      console.log(`✅ 공공 API 데이터 업데이트 완료: ${validatedData.length}개 헬스장`)
      
      return {
        success: true,
        totalGyms: validatedData.length
      }

    } catch (error) {
      console.error('❌ 공공 API 데이터 업데이트 실패:', error)
      return {
        success: false,
        totalGyms: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }

  /**
   * 서울시 공공데이터 API에서 헬스장 데이터 가져오기
   */
  private async fetchSeoulPublicData(): Promise<PublicApiGymData[]> {
    const gyms: PublicApiGymData[] = []
    let startIndex = 1
    const endIndex = this.config.batchSize

    try {
      const response = await axios.get(
        `http://openapi.seoul.go.kr:8088/${config.apiKeys.seoulOpenApi}/json/LOCALDATA_104201/${startIndex}/${endIndex}/`,
        {
          timeout: this.config.timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      )

      if (!response.data.LOCALDATA_104201?.row) {
        throw new Error('서울시 공공데이터 API 응답 형식이 올바르지 않습니다')
      }

      response.data.LOCALDATA_104201.row.forEach((item: any) => {
        gyms.push({
          id: item.MGTNO || `SEOUL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: item.BPLCNM || '',
          type: '짐',
          address: item.RDNWHLADDR || item.SITEWHLADDR || '',
          phone: item.SITETEL || '',
          latitude: parseFloat(item.Y) || 0,
          longitude: parseFloat(item.X) || 0,
          businessStatus: item.BSN_STATE_NM || '영업중',
          lastUpdated: item.LAST_UPDT_DTM || new Date().toISOString(),
          source: 'seoul_opendata'
        })
      })

      console.log(`📊 서울시 공공데이터에서 ${gyms.length}개 헬스장 데이터를 가져왔습니다`)
      
    } catch (error) {
      console.error('❌ 서울시 공공데이터 API 호출 실패:', error)
      throw error
    }

    return gyms
  }

  /**
   * 기타 공공 API에서 헬스장 데이터 가져오기
   */
  private async fetchOtherPublicData(): Promise<PublicApiGymData[]> {
    const gyms: PublicApiGymData[] = []

    try {
      // 국민체육진흥공단 체육시설 정보 API
      if (config.apiKeys.sportsDataApiKey) {
        const sportsData = await this.fetchSportsDataApi()
        gyms.push(...sportsData)
      }

      // 기타 공공 API들 추가 가능
      // 예: 문화체육관광부 체육시설 정보, 지자체별 공공데이터 등

    } catch (error) {
      console.warn('⚠️ 기타 공공 API 호출 실패:', error)
    }

    return gyms
  }

  /**
   * 국민체육진흥공단 체육시설 정보 API
   */
  private async fetchSportsDataApi(): Promise<PublicApiGymData[]> {
    const gyms: PublicApiGymData[] = []

    try {
      const response = await axios.get(
        'https://api.kspo.or.kr/openapi/service/sports/facility',
        {
          params: {
            serviceKey: config.apiKeys.sportsDataApiKey,
            numOfRows: 1000,
            pageNo: 1,
            type: 'json'
          },
          timeout: this.config.timeout
        }
      )

      if (response.data.response?.body?.items?.item) {
        const items = Array.isArray(response.data.response.body.items.item) 
          ? response.data.response.body.items.item 
          : [response.data.response.body.items.item]

        items.forEach((item: any) => {
          // 헬스장 관련 시설만 필터링
          if (item.facilityName && (
            item.facilityName.includes('헬스') || 
            item.facilityName.includes('피트니스') ||
            item.facilityName.includes('짐')
          )) {
            gyms.push({
              id: item.facilityId || `SPORTS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: item.facilityName || '',
              type: '짐',
              address: item.address || '',
              phone: item.phoneNumber || '',
              latitude: parseFloat(item.latitude) || 0,
              longitude: parseFloat(item.longitude) || 0,
              businessStatus: '영업중',
              lastUpdated: new Date().toISOString(),
              source: 'sports_data_api'
            })
          }
        })
      }

      console.log(`📊 국민체육진흥공단에서 ${gyms.length}개 헬스장 데이터를 가져왔습니다`)

    } catch (error) {
      console.warn('⚠️ 국민체육진흥공단 API 호출 실패:', error)
    }

    return gyms
  }

  /**
   * 데이터 검증 및 정리
   */
  private validateAndCleanData(data: PublicApiGymData[]): PublicApiGymData[] {
    return data.filter(gym => {
      // 필수 필드 검증
      if (!gym.name || !gym.address) {
        return false
      }

      // 좌표 유효성 검증
      if (gym.latitude === 0 && gym.longitude === 0) {
        return false
      }

      // 서울시 내 헬스장만 필터링
      if (!gym.address.includes('서울')) {
        return false
      }

      // 영업중인 헬스장만 필터링
      if (gym.businessStatus && !gym.businessStatus.includes('영업')) {
        return false
      }

      return true
    }).map(gym => ({
      ...gym,
      name: gym.name.trim(),
      address: gym.address.trim(),
      phone: gym.phone.replace(/[^\d-]/g, ''),
      latitude: Math.round(gym.latitude * 1000000) / 1000000, // 소수점 6자리로 정규화
      longitude: Math.round(gym.longitude * 1000000) / 1000000
    }))
  }

  /**
   * 데이터를 파일로 저장
   */
  private async saveDataToFile(data: PublicApiGymData[]): Promise<void> {
    try {
      const filePath = path.join(this.dataDirectory, 'gyms_raw.json')
      const timestamp = new Date().toISOString()
      
      const dataToSave = {
        metadata: {
          totalGyms: data.length,
          lastUpdated: timestamp,
          source: 'public_api_scheduler',
          version: '1.0.0'
        },
        gyms: data
      }

      await fs.promises.writeFile(
        filePath, 
        JSON.stringify(dataToSave, null, 2), 
        'utf8'
      )

      console.log(`💾 데이터가 파일에 저장되었습니다: ${filePath}`)

      // 백업 파일도 생성
      const backupPath = path.join(this.dataDirectory, `gyms_raw_backup_${timestamp.replace(/[:.]/g, '-')}.json`)
      await fs.promises.writeFile(
        backupPath, 
        JSON.stringify(dataToSave, null, 2), 
        'utf8'
      )

      console.log(`💾 백업 파일이 생성되었습니다: ${backupPath}`)

    } catch (error) {
      console.error('❌ 데이터 파일 저장 실패:', error)
      throw error
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
   * 스케줄러 설정 업데이트
   */
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (this.cronJob && newConfig.cronExpression) {
      this.stop()
      this.start()
    }
    
    console.log('⚙️ 스케줄러 설정이 업데이트되었습니다')
  }

  /**
   * 스케줄러 상태 조회
   */
  getStatus(): SchedulerStatus & { config: SchedulerConfig } {
    return {
      ...this.status,
      config: this.config
    }
  }

  /**
   * 수동으로 즉시 업데이트 실행
   */
  async runNow(): Promise<{
    success: boolean
    totalGyms: number
    error?: string
  }> {
    console.log('🚀 수동 공공 API 업데이트 실행')
    return await this.updatePublicApiData()
  }

  /**
   * 저장된 데이터 조회
   */
  async getStoredData(): Promise<PublicApiGymData[]> {
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
}
