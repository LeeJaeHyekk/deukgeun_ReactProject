import axios, { AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import { EnhancedGymInfo } from '../../types/CrawlingTypes'

/**
 * 기본 검색 엔진 추상 클래스
 */
export abstract class BaseSearchEngine {
  protected timeout: number = 30000
  protected delay: number = 1000

  constructor(timeout: number = 30000, delay: number = 1000) {
    this.timeout = timeout
    this.delay = delay
  }

  /**
   * 검색 실행
   */
  abstract search(gymName: string, address?: string): Promise<EnhancedGymInfo | null>

  /**
   * HTTP 요청 헤더 생성
   */
  protected getHeaders(): Record<string, string> {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1'
    }
  }

  /**
   * HTTP 요청 실행
   */
  protected async makeRequest(url: string): Promise<AxiosResponse> {
    return await axios.get(url, {
      headers: this.getHeaders(),
      timeout: this.timeout,
      maxRedirects: 5
    })
  }

  /**
   * 페이지에서 텍스트 추출
   */
  protected extractText(html: string): string {
    const $ = cheerio.load(html)
    return $('body').text() || $('html').text() || ''
  }

  /**
   * 지연 실행
   */
  protected async delayExecution(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.delay))
  }

  /**
   * 전화번호 추출
   */
  protected extractPhoneNumber(text: string): string | undefined {
    if (!text || typeof text !== 'string') return undefined
    
    const phonePatterns = [
      /(\d{2,3}-\d{3,4}-\d{4})/g,
      /(\d{2,3}\s\d{3,4}\s\d{4})/g,
      /(\d{10,11})/g
    ]
    
    for (const pattern of phonePatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].replace(/\s+/g, '-')
      }
    }
    return undefined
  }

  /**
   * 운영시간 추출
   */
  protected parseOperatingHours(text: string): { openHour?: string; closeHour?: string } {
    const timePatterns = [
      /(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/g,
      /(\d{1,2}시)\s*[-~]\s*(\d{1,2}시)/g,
      /오픈\s*(\d{1,2}:\d{2})/g,
      /마감\s*(\d{1,2}:\d{2})/g
    ]

    for (const pattern of timePatterns) {
      const match = pattern.exec(text)
      if (match) {
        if (match[2]) {
          return { openHour: match[1], closeHour: match[2] }
        } else if (match[1]) {
          return { openHour: match[1] }
        }
      }
    }

    return {}
  }
}
