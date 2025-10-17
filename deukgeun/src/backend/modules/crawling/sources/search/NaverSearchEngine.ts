import { BaseSearchEngine } from './BaseSearchEngine'
import { EnhancedGymInfo } from '@backend/modules/crawling/types/CrawlingTypes'

/**
 * 네이버 검색 엔진
 */
export class NaverSearchEngine extends BaseSearchEngine {
  async search(gymName: string, address?: string): Promise<EnhancedGymInfo | null> {
    try {
      console.log(`🔍 네이버 향상된 검색 시도: ${gymName} ${address || ''}`)
      
      const searchQuery = encodeURIComponent(`${gymName} ${address || ''}`)
      const searchUrl = `https://search.naver.com/search.naver?where=nexearch&query=${searchQuery}`
      
      const response = await this.makeRequest(searchUrl)
      
      if (response.status === 200) {
        const pageText = this.extractText(response.data)
        const extractedInfo = this.extractNaverInfo(pageText, gymName)
        
        if (extractedInfo) {
          console.log(`✅ 네이버 페이지에서 상세 정보 추출: ${gymName}`)
          return extractedInfo
        }
      }
      
      return null
    } catch (error) {
      console.warn(`네이버 검색 실패: ${gymName}`, error)
      return null
    }
  }

  private extractNaverInfo(pageText: string, gymName: string): EnhancedGymInfo | null {
    try {
      const phone = this.extractPhoneNumber(pageText)
      const { openHour, closeHour } = this.parseOperatingHours(pageText)
      
      // 네이버 특화 정보 추출
      const naverSpecificInfo = this.extractNaverSpecificInfo(pageText)
      
      if (phone || openHour || naverSpecificInfo.length > 0) {
        return {
          name: gymName,
          address: '',
          phone,
          openHour,
          closeHour,
          facilities: naverSpecificInfo,
          source: 'naver',
          confidence: 0.8,
          type: 'private'
        }
      }
      
      return null
    } catch (error) {
      console.warn('네이버 정보 추출 오류:', error)
      return null
    }
  }

  private extractNaverSpecificInfo(pageText: string): string[] {
    const naverKeywords = [
      '헬스장', '피트니스', '운동', 'PT', 'GX', '요가', '필라테스',
      '크로스핏', '웨이트', '유산소', '근력운동', '다이어트',
      '24시간', '샤워시설', '주차장', '락커룸', '운동복',
      '개인트레이너', '그룹레슨', '회원권', '일일권'
    ]
    
    return naverKeywords.filter(keyword => 
      pageText.toLowerCase().includes(keyword.toLowerCase())
    )
  }
}
