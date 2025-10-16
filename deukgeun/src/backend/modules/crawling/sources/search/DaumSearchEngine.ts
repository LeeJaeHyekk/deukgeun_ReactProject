import { BaseSearchEngine } from './BaseSearchEngine'
import { EnhancedGymInfo } from '../../types/CrawlingTypes'

/**
 * 다음 검색 엔진
 */
export class DaumSearchEngine extends BaseSearchEngine {
  async search(gymName: string, address?: string): Promise<EnhancedGymInfo | null> {
    try {
      console.log(`🔍 다음 향상된 검색 시도: ${gymName} ${address || ''} 헬스장 운영시간`)
      
      const searchQuery = encodeURIComponent(`${gymName} ${address || ''} 헬스장 운영시간`)
      const searchUrl = `https://search.daum.net/search?q=${searchQuery}`
      
      const response = await this.makeRequest(searchUrl)
      
      if (response.status === 200) {
        const pageText = this.extractText(response.data)
        const extractedInfo = this.extractDaumInfo(pageText, gymName)
        
        if (extractedInfo) {
          console.log(`✅ 다음에서 정보 추출: ${gymName}`)
          return extractedInfo
        }
      }
      
      return null
    } catch (error) {
      console.warn(`다음 검색 실패: ${gymName}`, error)
      return null
    }
  }

  private extractDaumInfo(pageText: string, gymName: string): EnhancedGymInfo | null {
    try {
      const phone = this.extractPhoneNumber(pageText)
      const { openHour, closeHour } = this.parseOperatingHours(pageText)
      
      // 다음 특화 정보 추출
      const daumSpecificInfo = this.extractDaumSpecificInfo(pageText)
      
      if (phone || openHour || daumSpecificInfo.length > 0) {
        return {
          name: gymName,
          address: '',
          phone,
          openHour,
          closeHour,
          facilities: daumSpecificInfo,
          source: 'daum',
          confidence: 0.6,
          type: 'private'
        }
      }
      
      return null
    } catch (error) {
      console.warn('다음 정보 추출 오류:', error)
      return null
    }
  }

  private extractDaumSpecificInfo(pageText: string): string[] {
    const daumKeywords = [
      '헬스장', '피트니스', '운동', 'PT', 'GX', '요가', '필라테스',
      '크로스핏', '웨이트', '유산소', '근력운동', '다이어트',
      '24시간', '샤워시설', '주차장', '락커룸', '운동복',
      '개인트레이너', '그룹레슨', '회원권', '일일권'
    ]
    
    return daumKeywords.filter(keyword => 
      pageText.toLowerCase().includes(keyword.toLowerCase())
    )
  }
}
