/**
 * 네이버 카페 폴백 전략들
 */
import { EnhancedGymInfo } from '@backend/modules/crawling/types/CrawlingTypes'
import { FallbackStrategy } from '@backend/modules/crawling/utils/FallbackStrategyManager'
import { AntiDetectionUtils } from '@backend/modules/crawling/utils/AntiDetectionUtils'
import axios from 'axios'

export class NaverCafeFallbackStrategies {
  /**
   * 전략 1: 간소화된 쿼리로 재시도
   */
  static createSimplifiedQueryStrategy(): FallbackStrategy {
    return {
      name: 'simplified_query',
      priority: 1,
      isAvailable: () => true,
      execute: async (gymName: string, address?: string) => {
        const simplifiedQuery = AntiDetectionUtils.simplifyQuery(gymName)
        const searchUrl = `https://search.naver.com/search.naver?where=cafe&query=${encodeURIComponent(simplifiedQuery)}`
        
        const response = await axios.get(searchUrl, {
          headers: AntiDetectionUtils.getEnhancedHeaders(),
          timeout: 30000
        })
        
        if (response.status === 200) {
          return this.extractBasicInfo(response.data, gymName, address)
        }
        
        return null
      }
    }
  }

  /**
   * 전략 2: 일반 네이버 검색으로 대체
   */
  static createGeneralNaverStrategy(): FallbackStrategy {
    return {
      name: 'general_naver',
      priority: 2,
      isAvailable: () => true,
      execute: async (gymName: string, address?: string) => {
        const searchUrl = `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(gymName)}`
        
        const response = await axios.get(searchUrl, {
          headers: AntiDetectionUtils.getEnhancedHeaders(),
          timeout: 30000
        })
        
        if (response.status === 200) {
          return this.extractBasicInfo(response.data, gymName, address)
        }
        
        return null
      }
    }
  }

  /**
   * 전략 3: 네이버 블로그 검색
   */
  static createNaverBlogStrategy(): FallbackStrategy {
    return {
      name: 'naver_blog',
      priority: 3,
      isAvailable: () => true,
      execute: async (gymName: string, address?: string) => {
        const searchUrl = `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(gymName + ' 헬스장')}`
        
        const response = await axios.get(searchUrl, {
          headers: AntiDetectionUtils.getEnhancedHeaders(),
          timeout: 30000
        })
        
        if (response.status === 200) {
          return this.extractBasicInfo(response.data, gymName, address)
        }
        
        return null
      }
    }
  }

  /**
   * 전략 4: 구글 검색으로 대체
   */
  static createGoogleStrategy(): FallbackStrategy {
    return {
      name: 'google_search',
      priority: 4,
      isAvailable: () => true,
      execute: async (gymName: string, address?: string) => {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(gymName + ' 헬스장 ' + (address || ''))}`
        
        const response = await axios.get(searchUrl, {
          headers: AntiDetectionUtils.getEnhancedHeaders(),
          timeout: 30000
        })
        
        if (response.status === 200) {
          return this.extractBasicInfo(response.data, gymName, address)
        }
        
        return null
      }
    }
  }

  /**
   * 전략 5: 다음 검색으로 대체
   */
  static createDaumStrategy(): FallbackStrategy {
    return {
      name: 'daum_search',
      priority: 5,
      isAvailable: () => true,
      execute: async (gymName: string, address?: string) => {
        const searchUrl = `https://search.daum.net/search?q=${encodeURIComponent(gymName + ' 헬스장')}`
        
        const response = await axios.get(searchUrl, {
          headers: AntiDetectionUtils.getEnhancedHeaders(),
          timeout: 30000
        })
        
        if (response.status === 200) {
          return this.extractBasicInfo(response.data, gymName, address)
        }
        
        return null
      }
    }
  }

  /**
   * 전략 6: 기본 정보만으로 폴백
   */
  static createBasicInfoStrategy(): FallbackStrategy {
    return {
      name: 'basic_info',
      priority: 6,
      isAvailable: () => true,
      execute: async (gymName: string, address?: string) => {
        // 항상 성공하는 기본 정보 전략
        return {
          name: gymName,
          address: address || '',
          phone: undefined,
          openHour: undefined,
          closeHour: undefined,
          price: undefined,
          rating: undefined,
          reviewCount: undefined,
          facilities: [],
          source: 'fallback_basic',
          confidence: 0.1,
          type: 'private'
        }
      }
    }
  }

  /**
   * 전략 7: 캐시된 데이터 사용 (향후 구현)
   */
  static createCachedDataStrategy(): FallbackStrategy {
    return {
      name: 'cached_data',
      priority: 7,
      isAvailable: () => false, // 현재 비활성화
      execute: async (gymName: string, address?: string) => {
        // TODO: 캐시 시스템 구현 후 활성화
        return null
      }
    }
  }

  /**
   * 전략 8: 외부 API 사용 (향후 구현)
   */
  static createExternalApiStrategy(): FallbackStrategy {
    return {
      name: 'external_api',
      priority: 8,
      isAvailable: () => false, // 현재 비활성화
      execute: async (gymName: string, address?: string) => {
        // TODO: 외부 API 연동 후 활성화
        return null
      }
    }
  }

  /**
   * 기본 정보 추출 (공통 로직)
   */
  private static extractBasicInfo(html: string, gymName: string, address?: string): EnhancedGymInfo {
    // 간단한 정보 추출 로직
    const phoneMatch = html.match(/(\d{2,3}-\d{3,4}-\d{4})/g)
    const phone = phoneMatch ? phoneMatch[0] : undefined
    
    const priceMatch = html.match(/(\d{1,3}(?:,\d{3})*)\s*원/g)
    const price = priceMatch ? priceMatch[0] : undefined
    
    return {
      name: gymName,
      address: address || '',
      phone,
      openHour: undefined,
      closeHour: undefined,
      price,
      rating: undefined,
      reviewCount: undefined,
      facilities: [],
      source: 'fallback_extraction',
      confidence: 0.3,
      type: 'private'
    }
  }

  /**
   * 모든 전략 반환
   */
  static getAllStrategies(): FallbackStrategy[] {
    return [
      this.createSimplifiedQueryStrategy(),
      this.createGeneralNaverStrategy(),
      this.createNaverBlogStrategy(),
      this.createGoogleStrategy(),
      this.createDaumStrategy(),
      this.createBasicInfoStrategy(),
      this.createCachedDataStrategy(),
      this.createExternalApiStrategy()
    ]
  }
}
