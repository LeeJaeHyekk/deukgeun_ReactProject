/**
 * 공공 API 소스
 * 서울시 공공데이터 API에서 데이터를 수집
 */

import axios from 'axios'
import { ProcessedGymData } from '@backend/modules/crawling/types/CrawlingTypes'

export class PublicApiSource {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  private readonly timeout = 15000

  /**
   * 서울시 공공데이터 API에서 헬스장 데이터 수집
   * LOCALDATA_104201 서비스 사용 (체육시설 데이터)
   */
  async collectData(): Promise<ProcessedGymData[]> {
    return this.fetchFromSeoulAPI()
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

      // 서울시 공공데이터 API 호출 (LOCALDATA_104201 - 체육시설)
      const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/LOCALDATA_104201/1/1000/`
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent
        }
      })

      if (response.data && response.data.LOCALDATA_104201) {
        const rawData = response.data.LOCALDATA_104201.row || []
        console.log(`✅ 서울시 API 데이터 수집 완료: ${rawData.length}개 시설`)
        return this.processSeoulAPIData(rawData)
      }

      console.log('❌ 서울시 API 응답 데이터가 없습니다')
      return []
    } catch (error) {
      console.error('❌ 서울시 API 호출 실패:', error)
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
   * 서울시 API 데이터 처리
   * TRDSTATENM(영업상태명) 필터링 및 헬스장 관련 시설만 수집
   */
  private processSeoulAPIData(rawData: any[]): ProcessedGymData[] {
    console.log('🔍 서울시 API 데이터 처리 시작')
    console.log(`📊 원본 데이터 개수: ${rawData.length}`)
    
    if (rawData.length > 0) {
      console.log('📋 첫 번째 데이터 샘플:', JSON.stringify(rawData[0], null, 2))
    }
    
    const processedData = rawData
      .filter(item => {
        // 기본 필수 필드 확인
        const hasName = item.BPLCNM // 사업장명
        const hasAddress = item.RDNWHLADDR || item.SITEWHLADDR // 도로명주소 또는 지번주소
        
        if (!hasName || !hasAddress) {
          return false
        }

        // 영업상태명(TRDSTATENM) 필터링 - 영업중인 시설만
        const businessStatus = item.TRDSTATENM
        if (!this.isActiveBusiness(businessStatus)) {
          console.log(`🚫 영업중이 아닌 시설 제외: ${item.BPLCNM} (상태: ${businessStatus})`)
          return false
        }

        // 헬스장 관련 업종만 필터링
        const businessType = item.UPTAENM // 업태구분명
        const detailBusinessType = item.DRMKCOBNM // 세부업종명
        const cultureSportsType = item.CULPHYEDCOBNM // 문화체육업종명
        
        const isGymRelated = this.isGymRelatedBusiness(businessType, detailBusinessType, cultureSportsType, item.BPLCNM)
        
        if (!isGymRelated) {
          return false
        }

        return true
      })
      .map(item => {
        // 새로운 API 응답 필드명에서 데이터 추출
        return {
          name: item.BPLCNM.trim(),
          address: (item.RDNWHLADDR || item.SITEWHLADDR).trim(),
          phone: item.SITETEL || undefined,
          facilities: item.DRMKCOBNM || item.UPTAENM || undefined,
          openHour: undefined, // 새로운 API에는 운영시간 정보가 없음
          closeHour: undefined,
          latitude: item.Y ? parseFloat(item.Y) : undefined,
          longitude: item.X ? parseFloat(item.X) : undefined,
          source: 'seoul_public_api',
          confidence: 0.9,
          type: 'public',
          isCurrentlyOpen: true,
          serviceType: this.determineServiceType(item.BPLCNM, item.DRMKCOBNM),
          
          // 기본 사업장 정보
          businessStatus: item.TRDSTATENM,
          businessType: item.UPTAENM,
          detailBusinessType: item.DRMKCOBNM,
          cultureSportsType: item.CULPHYEDCOBNM,
          managementNumber: item.MGTNO,
          approvalDate: item.APVPERMYMD,
          
          // 면적 및 주소 정보
          siteArea: item.SITEAREA,
          postalCode: item.RDNPOSTNO || item.SITEPOSTNO,
          sitePostalCode: item.SITEPOSTNO,
          siteAddress: item.SITEWHLADDR,
          roadAddress: item.RDNWHLADDR,
          roadPostalCode: item.RDNPOSTNO,
          
          // 시설 상세 정보
          insuranceCode: item.INSURJNYNCODE,
          leaderCount: item.LDERCNT,
          buildingCount: item.BDNGDNGNUM,
          buildingArea: item.BDNGYAREA
        }
      })
    
    console.log(`✅ 처리된 데이터 개수: ${processedData.length} (헬스장 관련 + 영업중)`)
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
