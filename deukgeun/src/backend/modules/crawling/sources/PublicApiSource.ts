/**
 * 공공 API 소스
 * 서울시 공공데이터 API에서 데이터를 수집
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { ProcessedGymData } from '@backend/modules/crawling/types/CrawlingTypes'

// 상수 정의
const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2초
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DATA_ITEMS = 10000 // 최대 데이터 항목 수
const REQUEST_TIMEOUT = 30000 // 30초

export class PublicApiSource {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  private readonly timeout = REQUEST_TIMEOUT
  private readonly maxRetries = MAX_RETRIES
  private readonly retryDelay = RETRY_DELAY
  private requestCount = 0
  private lastRequestTime = 0
  private readonly minRequestInterval = 1000 // 최소 요청 간격 1초

  /**
   * 서울시 공공데이터 API에서 헬스장 데이터 수집
   * LOCALDATA_104201 서비스 사용 (체육시설 데이터)
   */
  async collectData(): Promise<ProcessedGymData[]> {
    return this.fetchFromSeoulAPI()
  }

  /**
   * API 키 검증
   */
  private validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false
    }
    
    // API 키 형식 검증 (최소 길이 등)
    if (apiKey.length < 10) {
      console.warn('⚠️ API 키가 너무 짧습니다')
      return false
    }
    
    return true
  }

  /**
   * 레이트 리미팅 (요청 간격 제어)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest
      console.log(`⏳ 레이트 리미팅: ${waitTime}ms 대기`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequestTime = Date.now()
    this.requestCount++
  }

  /**
   * 안전한 API 호출 (재시도 로직 포함)
   */
  private async safeApiCall(url: string, config: AxiosRequestConfig): Promise<any> {
    let lastError: AxiosError | null = null
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // 레이트 리미팅
        await this.enforceRateLimit()
        
        // 재시도 시 지수 백오프
        if (attempt > 1) {
          const backoffDelay = this.retryDelay * Math.pow(2, attempt - 2)
          console.log(`⏳ 재시도 ${attempt}/${this.maxRetries} - ${backoffDelay}ms 대기`)
          await new Promise(resolve => setTimeout(resolve, backoffDelay))
        }

        const response = await axios.get(url, {
          ...config,
          timeout: this.timeout,
          maxContentLength: MAX_RESPONSE_SIZE,
          maxBodyLength: MAX_RESPONSE_SIZE,
          validateStatus: (status) => status < 500 // 5xx 에러만 재시도
        })

        // 응답 크기 검증
        const responseSize = JSON.stringify(response.data).length
        if (responseSize > MAX_RESPONSE_SIZE) {
          throw new Error(`응답 크기가 너무 큽니다: ${(responseSize / 1024 / 1024).toFixed(2)}MB`)
        }

        return response
      } catch (error) {
        lastError = error as AxiosError
        
        if (error instanceof AxiosError) {
          console.warn(`❌ API 호출 실패 (시도 ${attempt}/${this.maxRetries}): ${error.response?.status} ${error.message}`)
          
          // 재시도 가능한 에러인지 확인
          const isRetryable = this.isRetryableError(error)
          
          if (isRetryable && attempt < this.maxRetries) {
            continue
          }
          
          // 재시도 불가능한 에러인 경우 즉시 throw
          if (!isRetryable || attempt === this.maxRetries) {
            throw error
          }
        } else {
          // Axios 에러가 아닌 경우 즉시 throw
          throw error
        }
      }
    }
    
    throw lastError || new Error('모든 재시도 실패')
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) {
      // 네트워크 에러 등은 재시도 가능
      return true
    }
    
    const status = error.response.status
    
    // 5xx 에러는 재시도 가능
    if (status >= 500 && status < 600) {
      return true
    }
    
    // 429 Too Many Requests는 재시도 가능
    if (status === 429) {
      return true
    }
    
    // 408 Request Timeout은 재시도 가능
    if (status === 408) {
      return true
    }
    
    // 그 외는 재시도 불가능
    return false
  }

  /**
   * 서울시 공공데이터 API에서 헬스장 데이터 수집
   * LOCALDATA_104201 서비스 사용 (체육시설 데이터)
   */
  async fetchFromSeoulAPI(): Promise<ProcessedGymData[]> {
    console.log('📡 서울시 공공데이터 API 호출 (LOCALDATA_104201)')
    
    try {
      const apiKey = process.env.SEOUL_OPENAPI_KEY
      if (!apiKey) {
        console.warn('⚠️ SEOUL_OPENAPI_KEY가 설정되지 않았습니다')
        return []
      }

      // API 키 검증
      if (!this.validateApiKey(apiKey)) {
        console.error('❌ 유효하지 않은 API 키입니다')
        return []
      }

      // 서울시 공공데이터 API 호출 (LOCALDATA_104201 - 체육시설)
      const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/LOCALDATA_104201/1/1000/`
      
      const response = await this.safeApiCall(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate'
        }
      })

      // 응답 데이터 검증
      if (!response.data) {
        console.error('❌ 서울시 API 응답 데이터가 없습니다')
        return []
      }

      if (!response.data.LOCALDATA_104201) {
        console.error('❌ 서울시 API 응답 구조가 올바르지 않습니다')
        return []
      }

      const rawData = response.data.LOCALDATA_104201.row || []
      
      // 데이터 크기 제한
      if (!Array.isArray(rawData)) {
        console.error('❌ 서울시 API 응답 데이터가 배열 형식이 아닙니다')
        return []
      }

      if (rawData.length > MAX_DATA_ITEMS) {
        console.warn(`⚠️ 데이터 항목 수가 제한을 초과했습니다: ${rawData.length}개 (최대 ${MAX_DATA_ITEMS}개)`)
        rawData.splice(MAX_DATA_ITEMS)
      }

      console.log(`✅ 서울시 API 데이터 수집 완료: ${rawData.length}개 시설`)
      return this.processSeoulAPIData(rawData)
    } catch (error) {
      console.error('❌ 서울시 API 호출 실패:', error)
      if (error instanceof AxiosError) {
        if (error.response) {
          console.error(`   상태 코드: ${error.response.status}`)
          console.error(`   응답 데이터: ${JSON.stringify(error.response.data).substring(0, 200)}`)
        } else if (error.request) {
          console.error('   네트워크 에러: 요청이 전송되었지만 응답을 받지 못했습니다')
        }
      }
      return []
    }
  }

  /**
   * 모든 공공 API에서 데이터 수집 (현재는 서울시 API만 사용)
   */
  async fetchAllPublicAPIData(): Promise<ProcessedGymData[]> {
    console.log('📡 서울시 공공 API에서 데이터 수집 시작')
    
    try {
      // 서울시 공공데이터만 사용
      const seoulData = await this.fetchFromSeoulAPI()
      
      console.log(`✅ 공공 API 데이터 수집 완료: 총 ${seoulData.length}개 헬스장`)
      return seoulData
      
    } catch (error) {
      console.error('❌ 공공 API 데이터 수집 실패:', error)
      return []
    }
  }

  /**
   * 데이터 항목 검증
   */
  private validateDataItem(item: any): boolean {
    if (!item || typeof item !== 'object') {
      return false
    }

    // 필수 필드 확인
    const hasName = item.BPLCNM && typeof item.BPLCNM === 'string' && item.BPLCNM.trim().length > 0
    const hasAddress = (item.RDNWHLADDR || item.SITEWHLADDR) && 
                       typeof (item.RDNWHLADDR || item.SITEWHLADDR) === 'string' &&
                       (item.RDNWHLADDR || item.SITEWHLADDR).trim().length > 0
    
    if (!hasName || !hasAddress) {
      return false
    }

    // 데이터 크기 검증 (이름과 주소가 너무 긴 경우 제외)
    if (item.BPLCNM.length > 200 || (item.RDNWHLADDR || item.SITEWHLADDR).length > 500) {
      console.warn(`⚠️ 데이터 항목이 너무 깁니다: ${item.BPLCNM}`)
      return false
    }

    return true
  }

  /**
   * 안전한 데이터 파싱
   */
  private safeParseFloat(value: any): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined
    }
    
    try {
      const parsed = parseFloat(String(value))
      if (isNaN(parsed) || !isFinite(parsed)) {
        return undefined
      }
      return parsed
    } catch (error) {
      return undefined
    }
  }

  /**
   * 안전한 문자열 정제
   */
  private safeTrim(value: any): string | undefined {
    if (value === null || value === undefined) {
      return undefined
    }
    
    try {
      const str = String(value).trim()
      return str.length > 0 ? str : undefined
    } catch (error) {
      return undefined
    }
  }

  /**
   * 서울시 API 데이터 처리
   * TRDSTATENM(영업상태명) 필터링 및 헬스장 관련 시설만 수집
   */
  private processSeoulAPIData(rawData: any[]): ProcessedGymData[] {
    console.log('🔍 서울시 API 데이터 처리 시작')
    console.log(`📊 원본 데이터 개수: ${rawData.length}`)
    
    if (!Array.isArray(rawData)) {
      console.error('❌ 원본 데이터가 배열 형식이 아닙니다')
      return []
    }

    if (rawData.length === 0) {
      console.warn('⚠️ 원본 데이터가 비어있습니다')
      return []
    }

    // 샘플 데이터 로깅 (최대 1개만)
    if (rawData.length > 0) {
      console.log('📋 첫 번째 데이터 샘플:', JSON.stringify(rawData[0], null, 2).substring(0, 500))
    }

    const processedData: ProcessedGymData[] = []
    let filteredCount = 0
    let invalidCount = 0
    
    for (const item of rawData) {
      try {
        // 데이터 항목 검증
        if (!this.validateDataItem(item)) {
          invalidCount++
          continue
        }

        // 영업상태명(TRDSTATENM) 필터링 - 영업중인 시설만
        const businessStatus = item.TRDSTATENM
        if (!this.isActiveBusiness(businessStatus)) {
          filteredCount++
          continue
        }

        // 헬스장 관련 업종만 필터링
        const businessType = item.UPTAENM // 업태구분명
        const detailBusinessType = item.DRMKCOBNM // 세부업종명
        const cultureSportsType = item.CULPHYEDCOBNM // 문화체육업종명
        
        const isGymRelated = this.isGymRelatedBusiness(businessType, detailBusinessType, cultureSportsType, item.BPLCNM)
        
        if (!isGymRelated) {
          filteredCount++
          continue
        }

        // 데이터 변환
        const processedItem: ProcessedGymData = {
          name: this.safeTrim(item.BPLCNM) || '',
          address: this.safeTrim(item.RDNWHLADDR || item.SITEWHLADDR) || '',
          phone: this.safeTrim(item.SITETEL),
          facilities: this.safeTrim(item.DRMKCOBNM || item.UPTAENM),
          openHour: undefined, // 새로운 API에는 운영시간 정보가 없음
          closeHour: undefined,
          latitude: this.safeParseFloat(item.Y),
          longitude: this.safeParseFloat(item.X),
          source: 'seoul_public_api',
          confidence: 0.9,
          type: 'public',
          isCurrentlyOpen: true,
          serviceType: this.determineServiceType(item.BPLCNM || '', item.DRMKCOBNM),
          
          // 기본 사업장 정보
          businessStatus: this.safeTrim(item.TRDSTATENM),
          businessType: this.safeTrim(item.UPTAENM),
          detailBusinessType: this.safeTrim(item.DRMKCOBNM),
          cultureSportsType: this.safeTrim(item.CULPHYEDCOBNM),
          managementNumber: this.safeTrim(item.MGTNO),
          approvalDate: this.safeTrim(item.APVPERMYMD),
          
          // 면적 및 주소 정보
          siteArea: this.safeTrim(item.SITEAREA),
          postalCode: this.safeTrim(item.RDNPOSTNO || item.SITEPOSTNO),
          sitePostalCode: this.safeTrim(item.SITEPOSTNO),
          siteAddress: this.safeTrim(item.SITEWHLADDR),
          roadAddress: this.safeTrim(item.RDNWHLADDR),
          roadPostalCode: this.safeTrim(item.RDNPOSTNO),
          
          // 시설 상세 정보
          insuranceCode: this.safeTrim(item.INSURJNYNCODE),
          leaderCount: this.safeTrim(item.LDERCNT),
          buildingCount: this.safeTrim(item.BDNGDNGNUM),
          buildingArea: this.safeTrim(item.BDNGYAREA)
        }

        // 필수 필드 최종 검증
        if (!processedItem.name || !processedItem.address) {
          invalidCount++
          continue
        }

        processedData.push(processedItem)
      } catch (error) {
        invalidCount++
        console.warn(`⚠️ 데이터 항목 처리 실패: ${error instanceof Error ? error.message : String(error)}`)
        continue
      }
    }
    
    console.log(`✅ 처리된 데이터 개수: ${processedData.length} (헬스장 관련 + 영업중)`)
    console.log(`📊 필터링된 데이터: ${filteredCount}개, 유효하지 않은 데이터: ${invalidCount}개`)
    
    return processedData
  }

  /**
   * 영업중인 사업장인지 확인 (TRDSTATENM 필터링)
   */
  private isActiveBusiness(businessStatus: string): boolean {
    if (!businessStatus) return false
    
    const activeStatuses = [
      '영업', '정상영업', '영업중', '운영중', '정상운영'
    ]
    
    return activeStatuses.some(status => businessStatus.includes(status))
  }

  /**
   * 헬스장 관련 사업인지 확인 (새로운 API 구조)
   */
  private isGymRelatedBusiness(
    businessType: string, 
    detailBusinessType: string, 
    cultureSportsType: string, 
    businessName: string
  ): boolean {
    const gymKeywords = [
      '헬스', '헬스장', '피트니스', 'fitness', 'gym', '짐',
      '크로스핏', 'crossfit', 'cross fit',
      'pt', 'personal training', '개인트레이닝',
      'gx', 'group exercise', '그룹운동',
      '요가', 'yoga', '필라테스', 'pilates',
      '웨이트', 'weight', '근력', 'muscle',
      '체육관', '운동', 'exercise', '스포츠',
      '체육', '운동시설', '헬스클럽', '피트니스센터'
    ]

    const combinedText = `${businessType || ''} ${detailBusinessType || ''} ${cultureSportsType || ''} ${businessName || ''}`.toLowerCase()
    
    return gymKeywords.some(keyword => combinedText.includes(keyword))
  }

  /**
   * 헬스장 관련 서비스인지 확인 (기존 메서드 - 호환성 유지)
   */
  private isGymRelatedService(serviceName: string, serviceType: string): boolean {
    const gymKeywords = [
      '헬스', '헬스장', '피트니스', 'fitness', 'gym', '짐',
      '크로스핏', 'crossfit', 'cross fit',
      'pt', 'personal training', '개인트레이닝',
      'gx', 'group exercise', '그룹운동',
      '요가', 'yoga', '필라테스', 'pilates',
      '웨이트', 'weight', '근력', 'muscle',
      '체육관', '운동', 'exercise'
    ]

    const combinedText = `${serviceName} ${serviceType}`.toLowerCase()
    
    return gymKeywords.some(keyword => combinedText.includes(keyword))
  }

  /**
   * 현재 영업중인지 확인
   */
  private isCurrentlyOpen(item: any): boolean {
    try {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTime = currentHour * 60 + currentMinute

      // 운영시간 정보가 있는 경우
      if (item.SVCOPNBGNDT && item.SVCOPNENDDT) {
        const openTime = this.parseTime(item.SVCOPNBGNDT)
        const closeTime = this.parseTime(item.SVCOPNENDDT)
        
        if (openTime !== null && closeTime !== null) {
          return currentTime >= openTime && currentTime <= closeTime
        }
      }

      // 운영시간 정보가 없는 경우 기본적으로 영업중으로 간주
      // (24시간 운영이거나 정보가 부족한 경우)
      return true
    } catch (error) {
      console.warn('영업시간 확인 중 오류:', error)
      return true // 오류 시 영업중으로 간주
    }
  }

  /**
   * 시간 문자열을 분 단위로 변환
   */
  private parseTime(timeStr: string): number | null {
    try {
      // "HH:MM" 형식 파싱
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
      if (timeMatch) {
        const hours = parseInt(timeMatch[1])
        const minutes = parseInt(timeMatch[2])
        return hours * 60 + minutes
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * 서비스 타입 결정 (새로운 API 구조)
   */
  private determineServiceType(businessName: string, detailBusinessType?: string): string {
    const name = businessName.toLowerCase()
    const detailType = (detailBusinessType || '').toLowerCase()
    const combinedText = `${name} ${detailType}`
    
    if (combinedText.includes('크로스핏') || combinedText.includes('crossfit')) {
      return '크로스핏'
    } else if (combinedText.includes('pt') || combinedText.includes('개인트레이닝') || combinedText.includes('personal training')) {
      return 'pt'
    } else if (combinedText.includes('gx') || combinedText.includes('그룹') || combinedText.includes('group exercise')) {
      return 'gx'
    } else if (combinedText.includes('요가') || combinedText.includes('yoga')) {
      return '요가'
    } else if (combinedText.includes('필라테스') || combinedText.includes('pilates')) {
      return '필라테스'
    } else if (combinedText.includes('헬스') || combinedText.includes('fitness') || combinedText.includes('gym')) {
      return 'gym'
    } else if (combinedText.includes('체육관') || combinedText.includes('운동시설')) {
      return '체육관'
    } else {
      return 'gym' // 기본값
    }
  }
}
