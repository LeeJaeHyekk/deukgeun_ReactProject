import axios from 'axios'
import { CrawledEquipmentData, EquipmentCategory, EquipmentType } from '../../shared/types/equipment'

/**
 * 헬스장 기구 정보 크롤링 서비스
 * 다양한 소스에서 헬스장의 기구 정보를 수집하는 서비스
 */
export class EquipmentCrawlerService {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

  /**
   * 헬스장 기구 정보 크롤링
   */
  async crawlGymEquipment(gymName: string, gymAddress?: string): Promise<CrawledEquipmentData[]> {
    console.log(`🔍 기구 정보 크롤링 시작: ${gymName}`)

    const equipmentData: CrawledEquipmentData[] = []

    try {
      // 1. 네이버 블로그에서 기구 정보 검색
      const naverData = await this.crawlFromNaverBlog(gymName, gymAddress)
      equipmentData.push(...naverData)

      // 2. 인스타그램에서 기구 정보 검색
      const instagramData = await this.crawlFromInstagram(gymName)
      equipmentData.push(...instagramData)

      // 3. 헬스장 공식 웹사이트에서 기구 정보 검색
      const websiteData = await this.crawlFromGymWebsite(gymName)
      equipmentData.push(...websiteData)

      // 4. 중복 제거 및 데이터 정제
      const cleanedData = this.cleanAndDeduplicateEquipment(equipmentData)

      console.log(`✅ 기구 정보 크롤링 완료: ${gymName} - ${cleanedData.length}개 기구 발견`)
      return cleanedData

    } catch (error) {
      console.error(`❌ 기구 정보 크롤링 실패: ${gymName}`, error)
      return []
    }
  }

  /**
   * 네이버 블로그에서 기구 정보 크롤링
   */
  private async crawlFromNaverBlog(gymName: string, gymAddress?: string): Promise<CrawledEquipmentData[]> {
    try {
      const searchQuery = `${gymName} 헬스장 기구 시설`
      const response = await axios.get('https://search.naver.com/search.naver', {
        params: {
          query: searchQuery,
          where: 'blog',
          start: 1,
          display: 20
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 10000
      })

      const equipmentData: CrawledEquipmentData[] = []
      const html = response.data

      // 기구 정보 패턴 매칭
      const equipmentPatterns = this.getEquipmentPatterns()
      
      for (const pattern of equipmentPatterns) {
        const matches = html.match(pattern.regex)
        if (matches) {
          equipmentData.push({
            category: pattern.category,
            name: pattern.name,
            quantity: this.extractQuantity(matches[0]),
            confidence: 0.7,
            source: 'naver_blog'
          })
        }
      }

      return equipmentData

    } catch (error) {
      console.error('❌ 네이버 블로그 크롤링 실패:', error)
      return []
    }
  }

  /**
   * 인스타그램에서 기구 정보 크롤링
   */
  private async crawlFromInstagram(gymName: string): Promise<CrawledEquipmentData[]> {
    try {
      // 인스타그램 공식 API 또는 웹 스크래핑
      // 실제 구현에서는 인스타그램 API 키가 필요
      console.log(`📸 인스타그램에서 ${gymName} 기구 정보 검색 중...`)
      
      // 임시로 더미 데이터 반환 (실제 구현 시 API 호출)
      return []

    } catch (error) {
      console.error('❌ 인스타그램 크롤링 실패:', error)
      return []
    }
  }

  /**
   * 헬스장 공식 웹사이트에서 기구 정보 크롤링
   */
  private async crawlFromGymWebsite(gymName: string): Promise<CrawledEquipmentData[]> {
    try {
      // 헬스장 공식 웹사이트 URL 검색
      const searchQuery = `${gymName} 공식 홈페이지`
      
      // 실제 구현에서는 웹사이트 URL을 찾아서 크롤링
      console.log(`🌐 ${gymName} 공식 웹사이트에서 기구 정보 검색 중...`)
      
      return []

    } catch (error) {
      console.error('❌ 웹사이트 크롤링 실패:', error)
      return []
    }
  }

  /**
   * 기구 정보 패턴 정의
   */
  private getEquipmentPatterns() {
    return [
      // 유산소 기구
      {
        category: EquipmentCategory.TREADMILL,
        name: '런닝머신',
        regex: /런닝머신|트레드밀|러닝머신/gi
      },
      {
        category: EquipmentCategory.BIKE,
        name: '자전거',
        regex: /실내자전거|사이클|스피닝|바이크/gi
      },
      {
        category: EquipmentCategory.STEPPER,
        name: '스텝퍼',
        regex: /스텝퍼|스텝머신|클라이머/gi
      },
      {
        category: EquipmentCategory.ROWING_MACHINE,
        name: '로잉머신',
        regex: /로잉머신|로잉기구/gi
      },
      {
        category: EquipmentCategory.CROSS_TRAINER,
        name: '크로스 트레이너',
        regex: /크로스트레이너|일립티컬|엘립티컬/gi
      },
      {
        category: EquipmentCategory.STAIR_MASTER,
        name: '스테어마스터',
        regex: /스테어마스터|계단오르기|스테퍼/gi
      },
      {
        category: EquipmentCategory.SKI_MACHINE,
        name: '스키머신',
        regex: /스키머신|스키시뮬레이터/gi
      },
      
      // 웨이트 기구
      {
        category: EquipmentCategory.DUMBBELL,
        name: '덤벨',
        regex: /덤벨|덤벨세트/gi
      },
      {
        category: EquipmentCategory.BARBELL,
        name: '바벨',
        regex: /바벨|올림픽바|스탠다드바/gi
      },
      {
        category: EquipmentCategory.WEIGHT_MACHINE,
        name: '웨이트 머신',
        regex: /웨이트머신|체스트프레스|레그프레스|머신/gi
      },
      {
        category: EquipmentCategory.SMITH_MACHINE,
        name: '스미스 머신',
        regex: /스미스머신|스미스/gi
      },
      {
        category: EquipmentCategory.POWER_RACK,
        name: '파워랙',
        regex: /파워랙|스쿼트랙|벤치프레스랙/gi
      },
      {
        category: EquipmentCategory.CABLE,
        name: '케이블 머신',
        regex: /케이블머신|케이블|풀다운/gi
      },
      {
        category: EquipmentCategory.PULL_UP_BAR,
        name: '풀업 바',
        regex: /풀업바|풀업|철봉/gi
      }
    ]
  }

  /**
   * 텍스트에서 개수 추출
   */
  private extractQuantity(text: string): number {
    const quantityMatch = text.match(/(\d+)개|(\d+)대|(\d+)기/)
    if (quantityMatch) {
      return parseInt(quantityMatch[1] || quantityMatch[2] || quantityMatch[3] || '1')
    }
    return 1 // 기본값
  }

  /**
   * 브랜드 정보 추출
   */
  private extractBrand(text: string): string | undefined {
    const brandPatterns = [
      /(테크노짐|Technogym)/gi,
      /(프리코어|Precor)/gi,
      /(라이프피트니스|Life Fitness)/gi,
      /(스타트렉|Star Trac)/gi,
      /(마트릭스|Matrix)/gi,
      /(호스만|Hosman)/gi,
      /(아이언맨|Ironman)/gi
    ]

    for (const pattern of brandPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return undefined
  }

  /**
   * 데이터 정제 및 중복 제거
   */
  private cleanAndDeduplicateEquipment(equipmentData: CrawledEquipmentData[]): CrawledEquipmentData[] {
    const equipmentMap = new Map<string, CrawledEquipmentData>()

    for (const equipment of equipmentData) {
      const key = `${equipment.category}_${equipment.name}`
      
      if (equipmentMap.has(key)) {
        // 기존 데이터와 병합
        const existing = equipmentMap.get(key)!
        existing.quantity = Math.max(existing.quantity || 0, equipment.quantity || 0)
        existing.confidence = Math.max(existing.confidence, equipment.confidence)
        
        // 브랜드 정보가 있으면 추가
        if (equipment.brand && !existing.brand) {
          existing.brand = equipment.brand
        }
      } else {
        equipmentMap.set(key, { ...equipment })
      }
    }

    return Array.from(equipmentMap.values())
  }

  /**
   * 기구 정보 검증
   */
  validateEquipmentData(equipment: CrawledEquipmentData): boolean {
    if (!equipment.category || !equipment.name) {
      return false
    }

    if (equipment.quantity && equipment.quantity < 0) {
      return false
    }

    if (equipment.confidence < 0 || equipment.confidence > 1) {
      return false
    }

    return true
  }
}
