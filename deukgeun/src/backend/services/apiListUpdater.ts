import { config } from '../config/env'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

// API 목록 인터페이스
interface ApiEndpoint {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  params?: Record<string, any>
  dataPath: string
  isActive: boolean
  lastChecked: Date | null
  successCount: number
  failureCount: number
  rateLimit?: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  retryConfig?: {
    maxRetries: number
    retryDelay: number
  }
}

// API 응답 인터페이스
interface ApiResponse {
  success: boolean
  data: any[]
  totalCount: number
  error?: string
  rateLimitInfo?: {
    remaining: number
    resetTime: Date
  }
}

// 업데이트 결과 인터페이스
interface UpdateResult {
  success: boolean
  totalApis: number
  successfulApis: number
  failedApis: number
  totalGyms: number
  errors: string[]
  duration: number
}

/**
 * API 목록 업데이트 서비스
 * 다양한 공공 API들의 상태를 모니터링하고 헬스장 데이터를 수집하는 서비스
 */
export class ApiListUpdater {
  private apiEndpoints: ApiEndpoint[]
  private dataDirectory: string
  private maxConcurrentRequests: number = 5
  private requestTimeout: number = 30000

  constructor() {
    this.dataDirectory = path.join(process.cwd(), 'src', 'data')
    this.apiEndpoints = this.initializeApiEndpoints()
    this.ensureDataDirectory()
  }

  /**
   * API 엔드포인트 초기화
   */
  private initializeApiEndpoints(): ApiEndpoint[] {
    return [
      {
        id: 'seoul_opendata',
        name: '서울시 공공데이터',
        url: `http://openapi.seoul.go.kr:8088/${config.apiKeys.seoulOpenApi}/json/LOCALDATA_104201`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        dataPath: 'LOCALDATA_104201.row',
        isActive: true,
        lastChecked: null,
        successCount: 0,
        failureCount: 0,
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerDay: 10000
        },
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1000
        }
      },
      {
        id: 'sports_data_api',
        name: '국민체육진흥공단 체육시설',
        url: 'https://api.kspo.or.kr/openapi/service/sports/facility',
        method: 'GET',
        params: {
          serviceKey: config.apiKeys.sportsDataApiKey,
          numOfRows: 1000,
          pageNo: 1,
          type: 'json'
        },
        dataPath: 'response.body.items.item',
        isActive: !!config.apiKeys.sportsDataApiKey,
        lastChecked: null,
        successCount: 0,
        failureCount: 0,
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerDay: 5000
        },
        retryConfig: {
          maxRetries: 3,
          retryDelay: 2000
        }
      },
      {
        id: 'kakao_local_api',
        name: '카카오 로컬 API',
        url: 'https://dapi.kakao.com/v2/local/search/keyword.json',
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${config.apiKeys.kakao}`
        },
        params: {
          query: '헬스장',
          size: 15,
          page: 1
        },
        dataPath: 'documents',
        isActive: !!config.apiKeys.kakao,
        lastChecked: null,
        successCount: 0,
        failureCount: 0,
        rateLimit: {
          requestsPerMinute: 10,
          requestsPerDay: 1000
        },
        retryConfig: {
          maxRetries: 2,
          retryDelay: 1000
        }
      },
      {
        id: 'google_places_api',
        name: '구글 플레이스 API',
        url: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
        method: 'GET',
        params: {
          key: config.apiKeys.googlePlaces,
          query: '헬스장 서울',
          language: 'ko'
        },
        dataPath: 'results',
        isActive: !!config.apiKeys.googlePlaces,
        lastChecked: null,
        successCount: 0,
        failureCount: 0,
        rateLimit: {
          requestsPerMinute: 50,
          requestsPerDay: 10000
        },
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1000
        }
      }
    ]
  }

  /**
   * 모든 API 목록 업데이트
   */
  async updateAllApis(): Promise<UpdateResult> {
    const startTime = Date.now()
    console.log('🚀 API 목록 업데이트 시작')

    const activeApis = this.apiEndpoints.filter(api => api.isActive)
    const results: any[] = []
    const errors: string[] = []

    // 동시 요청 수 제한
    const chunks = this.chunkArray(activeApis, this.maxConcurrentRequests)

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(api => this.updateSingleApi(api))
      const chunkResults = await Promise.allSettled(chunkPromises)

      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          const api = chunk[index]
          const error = `API ${api.name} 업데이트 실패: ${result.reason}`
          errors.push(error)
          console.error(`❌ ${error}`)
        }
      })

      // 청크 간 지연
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(1000)
      }
    }

    // 결과 집계
    const totalGyms = results.reduce((sum, result) => sum + (result.data?.length || 0), 0)
    const successfulApis = results.filter(r => r.success).length
    const failedApis = activeApis.length - successfulApis

    const updateResult: UpdateResult = {
      success: errors.length === 0,
      totalApis: activeApis.length,
      successfulApis,
      failedApis,
      totalGyms,
      errors,
      duration: Date.now() - startTime
    }

    // 결과 저장
    await this.saveUpdateResults(updateResult, results)

    console.log(`✅ API 목록 업데이트 완료: ${successfulApis}/${activeApis.length} 성공, ${totalGyms}개 헬스장`)
    
    return updateResult
  }

  /**
   * 단일 API 업데이트
   */
  private async updateSingleApi(api: ApiEndpoint): Promise<{
    success: boolean
    apiId: string
    data?: any[]
    error?: string
  }> {
    console.log(`📡 API 업데이트 시작: ${api.name}`)

    try {
      // API 상태 확인
      if (!this.isApiAvailable(api)) {
        throw new Error('API가 비활성화되어 있습니다')
      }

      // 요청 실행
      const response = await this.makeApiRequest(api)
      
      if (!response.success) {
        throw new Error(response.error || 'API 요청 실패')
      }

      // 데이터 변환
      const transformedData = this.transformApiData(response.data, api)

      // API 통계 업데이트
      this.updateApiStats(api, true)

      console.log(`✅ API 업데이트 성공: ${api.name} - ${transformedData.length}개 데이터`)

      return {
        success: true,
        apiId: api.id,
        data: transformedData
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      
      // API 통계 업데이트
      this.updateApiStats(api, false)
      
      console.error(`❌ API 업데이트 실패: ${api.name} - ${errorMessage}`)

      return {
        success: false,
        apiId: api.id,
        error: errorMessage
      }
    }
  }

  /**
   * API 요청 실행
   */
  private async makeApiRequest(api: ApiEndpoint): Promise<ApiResponse> {
    const retryConfig = api.retryConfig || { maxRetries: 3, retryDelay: 1000 }
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const requestConfig = {
          method: api.method,
          url: api.url,
          headers: api.headers,
          params: api.params,
          timeout: this.requestTimeout,
          validateStatus: (status: number) => status < 500
        }

        const response = await axios(requestConfig)

        if (response.status === 200) {
          const data = this.extractDataFromResponse(response.data, api.dataPath)
          
          return {
            success: true,
            data: Array.isArray(data) ? data : [data],
            totalCount: Array.isArray(data) ? data.length : 1
          }
        } else if (response.status === 429) {
          // Rate limit exceeded
          const retryAfter = response.headers['retry-after'] || 60
          console.warn(`⚠️ Rate limit exceeded for ${api.name}. Waiting ${retryAfter}s`)
          await this.delay(retryAfter * 1000)
          continue
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('알 수 없는 오류')
        
        if (attempt < retryConfig.maxRetries) {
          console.warn(`⚠️ API 요청 실패 (시도 ${attempt}/${retryConfig.maxRetries}): ${api.name}`)
          await this.delay(retryConfig.retryDelay * attempt)
        }
      }
    }

    return {
      success: false,
      data: [],
      totalCount: 0,
      error: lastError?.message || 'API 요청 실패'
    }
  }

  /**
   * 응답에서 데이터 추출
   */
  private extractDataFromResponse(responseData: any, dataPath: string): any {
    const paths = dataPath.split('.')
    let data = responseData

    for (const path of paths) {
      if (data && typeof data === 'object' && path in data) {
        data = data[path]
      } else {
        return []
      }
    }

    return data || []
  }

  /**
   * API 데이터 변환
   */
  private transformApiData(data: any[], api: ApiEndpoint): any[] {
    switch (api.id) {
      case 'seoul_opendata':
        return this.transformSeoulData(data)
      case 'sports_data_api':
        return this.transformSportsData(data)
      case 'kakao_local_api':
        return this.transformKakaoData(data)
      case 'google_places_api':
        return this.transformGoogleData(data)
      default:
        return data
    }
  }

  /**
   * 서울시 공공데이터 변환
   */
  private transformSeoulData(data: any[]): any[] {
    return data.map((item: any) => ({
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
    }))
  }

  /**
   * 국민체육진흥공단 데이터 변환
   */
  private transformSportsData(data: any[]): any[] {
    return data
      .filter((item: any) => 
        item.facilityName && (
          item.facilityName.includes('헬스') || 
          item.facilityName.includes('피트니스') ||
          item.facilityName.includes('짐')
        )
      )
      .map((item: any) => ({
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
      }))
  }

  /**
   * 카카오 로컬 API 데이터 변환
   */
  private transformKakaoData(data: any[]): any[] {
    return data
      .filter((item: any) => 
        item.category_name && item.category_name.includes('헬스')
      )
      .map((item: any) => ({
        id: item.id || `KAKAO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.place_name || '',
        type: '짐',
        address: item.address_name || '',
        phone: item.phone || '',
        latitude: parseFloat(item.y) || 0,
        longitude: parseFloat(item.x) || 0,
        businessStatus: '영업중',
        lastUpdated: new Date().toISOString(),
        source: 'kakao_local_api'
      }))
  }

  /**
   * 구글 플레이스 API 데이터 변환
   */
  private transformGoogleData(data: any[]): any[] {
    return data
      .filter((item: any) => 
        item.types && item.types.includes('gym')
      )
      .map((item: any) => ({
        id: item.place_id || `GOOGLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || '',
        type: '짐',
        address: item.formatted_address || '',
        phone: item.formatted_phone_number || '',
        latitude: item.geometry?.location?.lat || 0,
        longitude: item.geometry?.location?.lng || 0,
        businessStatus: '영업중',
        lastUpdated: new Date().toISOString(),
        source: 'google_places_api'
      }))
  }

  /**
   * API 통계 업데이트
   */
  private updateApiStats(api: ApiEndpoint, success: boolean): void {
    api.lastChecked = new Date()
    
    if (success) {
      api.successCount++
    } else {
      api.failureCount++
    }
  }

  /**
   * API 가용성 확인
   */
  private isApiAvailable(api: ApiEndpoint): boolean {
    if (!api.isActive) return false
    
    // Rate limit 확인
    if (api.rateLimit) {
      // 실제 구현에서는 Redis나 메모리 캐시에서 rate limit 상태 확인
      // 여기서는 간단히 true 반환
    }
    
    return true
  }

  /**
   * 업데이트 결과 저장
   */
  private async saveUpdateResults(result: UpdateResult, apiResults: any[]): Promise<void> {
    try {
      const timestamp = new Date().toISOString()
      const filePath = path.join(this.dataDirectory, 'api_update_results.json')
      
      const dataToSave = {
        metadata: {
          timestamp,
          result,
          apiEndpoints: this.apiEndpoints.map(api => ({
            id: api.id,
            name: api.name,
            isActive: api.isActive,
            lastChecked: api.lastChecked,
            successCount: api.successCount,
            failureCount: api.failureCount
          }))
        },
        apiResults: apiResults.map(r => ({
          apiId: r.apiId,
          success: r.success,
          dataCount: r.data?.length || 0,
          error: r.error
        }))
      }

      await fs.promises.writeFile(
        filePath, 
        JSON.stringify(dataToSave, null, 2), 
        'utf8'
      )

      console.log(`💾 API 업데이트 결과가 저장되었습니다: ${filePath}`)

    } catch (error) {
      console.error('❌ API 업데이트 결과 저장 실패:', error)
    }
  }

  /**
   * API 엔드포인트 설정 업데이트
   */
  updateApiEndpoint(apiId: string, updates: Partial<ApiEndpoint>): boolean {
    const apiIndex = this.apiEndpoints.findIndex(api => api.id === apiId)
    
    if (apiIndex === -1) {
      return false
    }

    this.apiEndpoints[apiIndex] = { ...this.apiEndpoints[apiIndex], ...updates }
    console.log(`⚙️ API 엔드포인트 설정이 업데이트되었습니다: ${apiId}`)
    
    return true
  }

  /**
   * API 엔드포인트 상태 조회
   */
  getApiStatus(): ApiEndpoint[] {
    return this.apiEndpoints.map(api => ({
      ...api,
      // 민감한 정보 제거
      url: api.url.replace(/\/[^\/]*$/, '/***'),
      headers: api.headers ? Object.keys(api.headers).reduce((acc, key) => {
        acc[key] = '***'
        return acc
      }, {} as Record<string, string>) : undefined,
      params: api.params ? Object.keys(api.params).reduce((acc, key) => {
        acc[key] = '***'
        return acc
      }, {} as Record<string, any>) : undefined
    }))
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
}
