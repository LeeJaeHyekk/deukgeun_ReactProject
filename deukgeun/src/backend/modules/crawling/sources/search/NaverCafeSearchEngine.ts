import { BaseSearchEngine } from './BaseSearchEngine'
import { EnhancedGymInfo } from '@backend/modules/crawling/types/CrawlingTypes'
import { AntiDetectionUtils } from '@backend/modules/crawling/utils/AntiDetectionUtils'
import { NaverCafeFallbackStrategies } from '../../strategies/NaverCafeFallbackStrategies'
import * as cheerio from 'cheerio'

/**
 * 네이버 카페 검색 엔진 (페이스북 대체)
 * 정교한 검색 및 정보 추출 로직 구현
 */
export class NaverCafeSearchEngine extends BaseSearchEngine {
  /**
   * 폴백 전략 초기화
   */
  protected initializeFallbackStrategies(): void {
    const strategies = NaverCafeFallbackStrategies.getAllStrategies()
    strategies.forEach(strategy => {
      this.fallbackManager.registerStrategy(strategy)
    })
    console.log(`📋 네이버 카페 폴백 전략 등록 완료: ${strategies.length}개`)
  }

  async search(gymName: string, address?: string): Promise<EnhancedGymInfo | null> {
    return this.executeWithFallback(
      () => this.performPrimarySearch(gymName, address),
      gymName,
      address
    )
  }

  /**
   * 1차 검색 수행
   */
  private async performPrimarySearch(gymName: string, address?: string): Promise<EnhancedGymInfo | null> {
    try {
      console.log(`🔍 네이버 카페 1차 검색 시도: ${gymName} ${address ? `(${address})` : ''}`)
      
      // 다양한 검색 쿼리 시도
      const searchQueries = this.generateSearchQueries(gymName, address)
      
      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i]
        try {
          const searchUrl = `https://search.naver.com/search.naver?where=cafe&query=${encodeURIComponent(query)}`
          console.log(`🔍 검색 쿼리 ${i + 1}/${searchQueries.length}: ${query}`)
          
          const response = await this.makeRequest(searchUrl)
          
          if (response.status === 200) {
            const extractedInfo = this.extractNaverCafeInfo(response.data, gymName, address)
            
            if (extractedInfo && this.isValidGymInfo(extractedInfo)) {
              console.log(`✅ 네이버 카페에서 정보 추출 성공: ${gymName}`)
              return extractedInfo
            }
          } else if (response.status === 403) {
            console.warn(`🚫 403 Forbidden - 네이버 카페 검색 차단됨: ${gymName}`)
            throw new Error('403 Forbidden - 네이버 카페 검색 차단')
          }
          
          // 요청 간 지연 (마지막 쿼리가 아닌 경우에만)
          if (i < searchQueries.length - 1) {
            await this.delayBetweenRequests()
          }
        } catch (queryError) {
          console.warn(`쿼리 "${query}" 검색 실패:`, queryError)
          
          // 403 에러인 경우 즉시 throw하여 폴백 전략으로 넘어감
          if (AntiDetectionUtils.is403Error(queryError)) {
            throw new Error('403 Forbidden - 네이버 카페 검색 차단')
          }
          continue
        }
      }
      
      console.log(`❌ 모든 네이버 카페 검색 쿼리 실패: ${gymName}`)
      return null
    } catch (error) {
      console.error(`네이버 카페 1차 검색 실패: ${gymName}`, error)
      throw error // 폴백 전략으로 넘어가도록 에러 재throw
    }
  }


  /**
   * 다양한 검색 쿼리 생성
   */
  private generateSearchQueries(gymName: string, address?: string): string[] {
    const queries: string[] = []
    
    // 기본 쿼리들
    queries.push(`${gymName} 헬스장`)
    queries.push(`${gymName} 피트니스`)
    queries.push(`${gymName} 운동`)
    
    // 주소가 있는 경우 지역 포함 쿼리
    if (address) {
      const region = this.extractRegionFromAddress(address)
      if (region) {
        queries.push(`${gymName} ${region} 헬스장`)
        queries.push(`${gymName} ${region} 피트니스`)
        queries.push(`${region} ${gymName}`)
      }
    }
    
    // 특수 케이스 처리
    if (gymName.includes('짐') || gymName.includes('Gym')) {
      queries.push(gymName.replace(/짐|Gym/gi, '헬스장'))
    }
    
    return [...new Set(queries)] // 중복 제거
  }

  /**
   * 주소에서 지역명 추출
   */
  private extractRegionFromAddress(address: string): string | null {
    const regionPatterns = [
      /서울특별시\s+(\w+구)/,
      /서울\s+(\w+구)/,
      /(\w+구)/,
      /(\w+시)/,
      /(\w+동)/
    ]
    
    for (const pattern of regionPatterns) {
      const match = address.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  }

  /**
   * 네이버 카페에서 정보 추출 (개선된 버전)
   */
  private extractNaverCafeInfo(html: string, gymName: string, address?: string): EnhancedGymInfo | null {
    try {
      const $ = cheerio.load(html)
      const pageText = $('body').text()
      
      // 기본 정보 추출
      const phone = this.extractPhoneNumber(pageText)
      const { openHour, closeHour } = this.parseOperatingHours(pageText)
      const price = this.extractPrice(pageText)
      const rating = this.extractRating(pageText)
      const reviewCount = this.extractReviewCount(pageText)
      
      // 카페 특화 정보 추출
      const facilities = this.extractCafeSpecificInfo(pageText)
      const additionalInfo = this.extractAdditionalInfo($ as any, pageText)
      
      // 신뢰도 계산
      const confidence = this.calculateConfidence({
        phone, openHour, price, rating, facilities, additionalInfo
      })
      
      if (confidence > 0.3) { // 최소 신뢰도 임계값
        return {
          name: gymName,
          address: address || '',
          phone,
          openHour,
          closeHour,
          price,
          rating,
          reviewCount,
          facilities: [...facilities, ...additionalInfo],
          source: 'naver_cafe',
          confidence,
          type: 'private'
        }
      }
      
      return null
    } catch (error) {
      console.warn('네이버 카페 정보 추출 오류:', error)
      return null
    }
  }

  /**
   * 가격 정보 추출
   */
  private extractPrice(pageText: string): string | undefined {
    const pricePatterns = [
      /(\d{1,3}(?:,\d{3})*)\s*원/g,
      /(\d{1,3}(?:,\d{3})*)\s*만원/g,
      /월\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
      /회원권\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
      /일일권\s*(\d{1,3}(?:,\d{3})*)\s*원/g
    ]
    
    for (const pattern of pricePatterns) {
      const matches = pageText.match(pattern)
      if (matches && matches.length > 0) {
        return matches[0]
      }
    }
    
    return undefined
  }

  /**
   * 평점 추출
   */
  private extractRating(pageText: string): number | undefined {
    const ratingPatterns = [
      /평점\s*(\d+\.?\d*)/g,
      /별점\s*(\d+\.?\d*)/g,
      /(\d+\.?\d*)\s*점/g,
      /(\d+\.?\d*)\s*\/\s*5/g
    ]
    
    for (const pattern of ratingPatterns) {
      const match = pageText.match(pattern)
      if (match && match[1]) {
        const rating = parseFloat(match[1])
        if (rating >= 0 && rating <= 5) {
          return rating
        }
      }
    }
    
    return undefined
  }

  /**
   * 리뷰 수 추출
   */
  private extractReviewCount(pageText: string): number | undefined {
    const reviewPatterns = [
      /리뷰\s*(\d+)/g,
      /후기\s*(\d+)/g,
      /(\d+)\s*개\s*리뷰/g,
      /(\d+)\s*개\s*후기/g
    ]
    
    for (const pattern of reviewPatterns) {
      const match = pageText.match(pattern)
      if (match && match[1]) {
        return parseInt(match[1])
      }
    }
    
    return undefined
  }

  /**
   * 추가 정보 추출
   */
  private extractAdditionalInfo($: cheerio.CheerioAPI, pageText: string): string[] {
    const additionalInfo: string[] = []
    
    // 카페 게시글 제목에서 정보 추출
    $('.cafe_title, .cafe_subject, .cafe_content').each((_, element) => {
      const text = $(element).text()
      if (text) {
        additionalInfo.push(text.trim())
      }
    })
    
    // 특정 키워드가 포함된 문장 추출
    const keywordSentences = this.extractKeywordSentences(pageText)
    additionalInfo.push(...keywordSentences)
    
    return additionalInfo.slice(0, 10) // 최대 10개까지만
  }

  /**
   * 키워드가 포함된 문장 추출
   */
  private extractKeywordSentences(pageText: string): string[] {
    const sentences: string[] = []
    const keywords = ['운영시간', '가격', '시설', '트레이너', '후기', '추천']
    
    const lines = pageText.split(/[.!?]\s*/)
    
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.includes(keyword) && line.length > 10 && line.length < 100) {
          sentences.push(line.trim())
          break
        }
      }
    }
    
    return sentences.slice(0, 5) // 최대 5개 문장
  }

  /**
   * 신뢰도 계산
   */
  private calculateConfidence(data: {
    phone?: string
    openHour?: string
    price?: string
    rating?: number
    facilities: string[]
    additionalInfo: string[]
  }): number {
    let confidence = 0
    
    if (data.phone) confidence += 0.3
    if (data.openHour) confidence += 0.2
    if (data.price) confidence += 0.2
    if (data.rating) confidence += 0.1
    if (data.facilities.length > 0) confidence += 0.1
    if (data.additionalInfo.length > 0) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }

  /**
   * 유효한 헬스장 정보인지 검증
   */
  private isValidGymInfo(info: EnhancedGymInfo): boolean {
    return !!(
      info.name &&
      (info.phone || info.openHour || info.price || (info.facilities && info.facilities.length > 0))
    )
  }

  private extractCafeSpecificInfo(pageText: string): string[] {
    const cafeKeywords = [
      '헬스장', '피트니스', '운동', 'PT', 'GX', '요가', '필라테스',
      '크로스핏', '웨이트', '유산소', '근력운동', '다이어트',
      '24시간', '샤워시설', '주차장', '락커룸', '운동복',
      '개인트레이너', '그룹레슨', '회원권', '일일권', '리뷰',
      '후기', '추천', '시설', '환경', '트레이너', '회원',
      '이용', '체험', '상담', '문의', '운영시간', '가격'
    ]
    
    return cafeKeywords.filter(keyword => 
      pageText.toLowerCase().includes(keyword.toLowerCase())
    )
  }
}
