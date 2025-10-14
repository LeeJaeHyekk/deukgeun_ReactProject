import axios from 'axios'
import * as cheerio from 'cheerio'
import { config } from '../config/env'

// 크롤링 결과 인터페이스
interface CrawlingResult {
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  is24Hours: boolean
  hasParking: boolean
  hasShower: boolean
  hasPT: boolean
  hasGX: boolean
  hasGroupPT: boolean
  openHour: string
  closeHour: string
  price: string
  rating: number
  reviewCount: number
  source: string
  confidence: number
  additionalInfo: Record<string, any>
}

// 크롤링 소스 인터페이스
interface CrawlingSource {
  id: string
  name: string
  baseUrl: string
  searchPath: string
  requiresApiKey: boolean
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  selectors: {
    name: string
    address: string
    phone: string
    price: string
    rating: string
    facilities: string
  }
  isActive: boolean
}

// 크롤링 설정 인터페이스
interface CrawlingConfig {
  userAgents: string[]
  timeout: number
  maxRetries: number
  retryDelay: number
  delayBetweenRequests: number
  maxConcurrentRequests: number
}

/**
 * 크롤링 우회 서비스
 * API 키 없이 웹 크롤링을 통해 헬스장 정보를 수집하는 서비스
 */
export class CrawlingBypassService {
  private sources: CrawlingSource[]
  private config: CrawlingConfig
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map()

  constructor() {
    this.config = {
      userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
      ],
      timeout: 15000,
      maxRetries: 3,
      retryDelay: 2000,
      delayBetweenRequests: 1000,
      maxConcurrentRequests: 3
    }

    this.sources = this.initializeCrawlingSources()
  }

  /**
   * 크롤링 소스 초기화
   */
  private initializeCrawlingSources(): CrawlingSource[] {
    return [
      {
        id: 'naver_place',
        name: '네이버 플레이스',
        baseUrl: 'https://map.naver.com',
        searchPath: '/v5/search',
        requiresApiKey: false,
        rateLimit: { requestsPerMinute: 30, requestsPerDay: 1000 },
        selectors: {
          name: '.place_bluelink',
          address: '.addr',
          phone: '.tel',
          price: '.price',
          rating: '.score',
          facilities: '.facility'
        },
        isActive: true
      },
      {
        id: 'kakao_place',
        name: '카카오 플레이스',
        baseUrl: 'https://place.map.kakao.com',
        searchPath: '/search',
        requiresApiKey: false,
        rateLimit: { requestsPerMinute: 20, requestsPerDay: 500 },
        selectors: {
          name: '.tit_location',
          address: '.txt_address',
          phone: '.txt_contact',
          price: '.txt_price',
          rating: '.score',
          facilities: '.list_facility'
        },
        isActive: true
      },
      {
        id: 'google_maps',
        name: '구글 맵스',
        baseUrl: 'https://www.google.com/maps',
        searchPath: '/search',
        requiresApiKey: false,
        rateLimit: { requestsPerMinute: 10, requestsPerDay: 200 },
        selectors: {
          name: '.x3AX1-LfntMc-header-title-title',
          address: '.Io6YTe',
          phone: '.Io6YTe',
          price: '.fontBodyMedium',
          rating: '.fontDisplayLarge',
          facilities: '.fontBodyMedium'
        },
        isActive: true
      },
      {
        id: 'daum_place',
        name: '다음 플레이스',
        baseUrl: 'https://map.daum.net',
        searchPath: '/search',
        requiresApiKey: false,
        rateLimit: { requestsPerMinute: 25, requestsPerDay: 800 },
        selectors: {
          name: '.tit_place',
          address: '.txt_address',
          phone: '.txt_contact',
          price: '.txt_price',
          rating: '.score',
          facilities: '.list_facility'
        },
        isActive: true
      },
      {
        id: 'gym_finder_sites',
        name: '헬스장 전용 사이트',
        baseUrl: 'https://www.gymfinder.co.kr',
        searchPath: '/search',
        requiresApiKey: false,
        rateLimit: { requestsPerMinute: 15, requestsPerDay: 300 },
        selectors: {
          name: '.gym-name',
          address: '.gym-address',
          phone: '.gym-phone',
          price: '.gym-price',
          rating: '.gym-rating',
          facilities: '.gym-facilities'
        },
        isActive: true
      }
    ]
  }

  /**
   * 모든 소스에서 헬스장 정보 크롤링
   */
  async crawlAllSources(gymName: string): Promise<CrawlingResult[]> {
    console.log(`🕷️ 크롤링 시작: ${gymName}`)
    
    const activeSources = this.sources.filter(source => source.isActive)
    const allResults: CrawlingResult[] = []

    // 동시 요청 수 제한
    const chunks = this.chunkArray(activeSources, this.config.maxConcurrentRequests)

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(source => this.crawlSingleSource(source, gymName))
      const chunkResults = await Promise.allSettled(chunkPromises)

      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value)
        } else {
          const source = chunk[index]
          console.warn(`⚠️ 크롤링 실패: ${source.name} - ${result.reason}`)
        }
      })

      // 청크 간 지연
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(this.config.delayBetweenRequests)
      }
    }

    // 결과 중복 제거 및 정리
    const uniqueResults = this.deduplicateResults(allResults)
    
    console.log(`✅ 크롤링 완료: ${allResults.length}개 → ${uniqueResults.length}개 (중복제거)`)
    
    return uniqueResults
  }

  /**
   * 단일 소스에서 크롤링
   */
  private async crawlSingleSource(source: CrawlingSource, gymName: string): Promise<CrawlingResult[]> {
    console.log(`📡 ${source.name} 크롤링 시작`)

    try {
      // Rate limit 확인
      if (!this.checkRateLimit(source)) {
        console.warn(`⚠️ Rate limit 초과: ${source.name}`)
        return []
      }

      // 요청 실행
      const response = await this.makeCrawlingRequest(source, gymName)
      
      if (!response.success) {
        throw new Error(response.error || '크롤링 요청 실패')
      }

      // HTML 파싱
      const results = this.parseHtmlResponse(response.html!, source, gymName)

      // Rate limit 카운터 업데이트
      this.updateRateLimitCounter(source)

      console.log(`✅ ${source.name} 크롤링 성공: ${results.length}개 결과`)

      return results

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      console.error(`❌ ${source.name} 크롤링 실패: ${errorMessage}`)
      return []
    }
  }

  /**
   * 크롤링 요청 실행
   */
  private async makeCrawlingRequest(source: CrawlingSource, gymName: string): Promise<{
    success: boolean
    html?: string
    error?: string
  }> {
    const retryConfig = { maxRetries: this.config.maxRetries, retryDelay: this.config.retryDelay }
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const url = this.buildSearchUrl(source, gymName)
        const userAgent = this.getRandomUserAgent()

        const response = await axios.get(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
          },
          timeout: this.config.timeout,
          maxRedirects: 5,
          validateStatus: (status) => status < 400
        })

        if (response.status === 200) {
          return {
            success: true,
            html: response.data
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('알 수 없는 오류')
        
        if (attempt < retryConfig.maxRetries) {
          console.warn(`⚠️ 크롤링 요청 실패 (시도 ${attempt}/${retryConfig.maxRetries}): ${source.name}`)
          await this.delay(retryConfig.retryDelay * attempt)
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || '크롤링 요청 실패'
    }
  }

  /**
   * 검색 URL 생성
   */
  private buildSearchUrl(source: CrawlingSource, gymName: string): string {
    const searchQuery = encodeURIComponent(`${gymName} 헬스장`)
    
    switch (source.id) {
      case 'naver_place':
        return `${source.baseUrl}${source.searchPath}?query=${searchQuery}&type=place&searchCoord=127.027619%3B37.497938&boundary=`
      case 'kakao_place':
        return `${source.baseUrl}${source.searchPath}?q=${searchQuery}&category=`
      case 'google_maps':
        return `${source.baseUrl}${source.searchPath}?q=${searchQuery}&hl=ko`
      case 'daum_place':
        return `${source.baseUrl}${source.searchPath}?q=${searchQuery}`
      case 'gym_finder_sites':
        return `${source.baseUrl}${source.searchPath}?keyword=${searchQuery}`
      default:
        return `${source.baseUrl}${source.searchPath}?q=${searchQuery}`
    }
  }

  /**
   * HTML 응답 파싱
   */
  private parseHtmlResponse(html: string, source: CrawlingSource, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    try {
      const $ = cheerio.load(html)
      
      // 소스별 파싱 로직
      switch (source.id) {
        case 'naver_place':
          return this.parseNaverPlace($, gymName)
        case 'kakao_place':
          return this.parseKakaoPlace($, gymName)
        case 'google_maps':
          return this.parseGoogleMaps($, gymName)
        case 'daum_place':
          return this.parseDaumPlace($, gymName)
        case 'gym_finder_sites':
          return this.parseGymFinderSites($, gymName)
        default:
          return this.parseGenericSite($, source, gymName)
      }
    } catch (error) {
      console.error(`❌ HTML 파싱 실패: ${source.name}`, error)
      return []
    }
  }

  /**
   * 네이버 플레이스 파싱
   */
  private parseNaverPlace($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.place_bluelink').each((index, element) => {
      try {
        const name = $(element).text().trim()
        const address = $(element).closest('.item_info').find('.addr').text().trim()
        const phone = $(element).closest('.item_info').find('.tel').text().trim()
        const rating = $(element).closest('.item_info').find('.score').text().trim()
        
        if (name && address) {
          results.push({
            name: name,
            address: address,
            phone: phone,
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours($(element).closest('.item_info').text()),
            hasParking: this.extractParking($(element).closest('.item_info').text()),
            hasShower: this.extractShower($(element).closest('.item_info').text()),
            hasPT: this.extractPT($(element).closest('.item_info').text()),
            hasGX: this.extractGX($(element).closest('.item_info').text()),
            hasGroupPT: this.extractGroupPT($(element).closest('.item_info').text()),
            openHour: this.extractOpenHour($(element).closest('.item_info').text()),
            closeHour: this.extractCloseHour($(element).closest('.item_info').text()),
            price: this.extractPrice($(element).closest('.item_info').text()),
            rating: parseFloat(rating) || 0,
            reviewCount: 0,
            source: 'naver_place',
            confidence: 0.8,
            additionalInfo: {
              originalName: gymName,
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 네이버 플레이스 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 카카오 플레이스 파싱
   */
  private parseKakaoPlace($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.tit_location').each((index, element) => {
      try {
        const name = $(element).text().trim()
        const address = $(element).closest('.info_item').find('.txt_address').text().trim()
        const phone = $(element).closest('.info_item').find('.txt_contact').text().trim()
        const rating = $(element).closest('.info_item').find('.score').text().trim()
        
        if (name && address) {
          results.push({
            name: name,
            address: address,
            phone: phone,
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours($(element).closest('.info_item').text()),
            hasParking: this.extractParking($(element).closest('.info_item').text()),
            hasShower: this.extractShower($(element).closest('.info_item').text()),
            hasPT: this.extractPT($(element).closest('.info_item').text()),
            hasGX: this.extractGX($(element).closest('.info_item').text()),
            hasGroupPT: this.extractGroupPT($(element).closest('.info_item').text()),
            openHour: this.extractOpenHour($(element).closest('.info_item').text()),
            closeHour: this.extractCloseHour($(element).closest('.info_item').text()),
            price: this.extractPrice($(element).closest('.info_item').text()),
            rating: parseFloat(rating) || 0,
            reviewCount: 0,
            source: 'kakao_place',
            confidence: 0.75,
            additionalInfo: {
              originalName: gymName,
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 카카오 플레이스 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 구글 맵스 파싱
   */
  private parseGoogleMaps($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.x3AX1-LfntMc-header-title-title').each((index, element) => {
      try {
        const name = $(element).text().trim()
        const address = $(element).closest('.section-result').find('.Io6YTe').first().text().trim()
        const phone = $(element).closest('.section-result').find('.Io6YTe').eq(1).text().trim()
        const rating = $(element).closest('.section-result').find('.fontDisplayLarge').text().trim()
        
        if (name && address) {
          results.push({
            name: name,
            address: address,
            phone: phone,
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours($(element).closest('.section-result').text()),
            hasParking: this.extractParking($(element).closest('.section-result').text()),
            hasShower: this.extractShower($(element).closest('.section-result').text()),
            hasPT: this.extractPT($(element).closest('.section-result').text()),
            hasGX: this.extractGX($(element).closest('.section-result').text()),
            hasGroupPT: this.extractGroupPT($(element).closest('.section-result').text()),
            openHour: this.extractOpenHour($(element).closest('.section-result').text()),
            closeHour: this.extractCloseHour($(element).closest('.section-result').text()),
            price: this.extractPrice($(element).closest('.section-result').text()),
            rating: parseFloat(rating) || 0,
            reviewCount: 0,
            source: 'google_maps',
            confidence: 0.85,
            additionalInfo: {
              originalName: gymName,
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 구글 맵스 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 다음 플레이스 파싱
   */
  private parseDaumPlace($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.tit_place').each((index, element) => {
      try {
        const name = $(element).text().trim()
        const address = $(element).closest('.info_item').find('.txt_address').text().trim()
        const phone = $(element).closest('.info_item').find('.txt_contact').text().trim()
        const rating = $(element).closest('.info_item').find('.score').text().trim()
        
        if (name && address) {
          results.push({
            name: name,
            address: address,
            phone: phone,
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours($(element).closest('.info_item').text()),
            hasParking: this.extractParking($(element).closest('.info_item').text()),
            hasShower: this.extractShower($(element).closest('.info_item').text()),
            hasPT: this.extractPT($(element).closest('.info_item').text()),
            hasGX: this.extractGX($(element).closest('.info_item').text()),
            hasGroupPT: this.extractGroupPT($(element).closest('.info_item').text()),
            openHour: this.extractOpenHour($(element).closest('.info_item').text()),
            closeHour: this.extractCloseHour($(element).closest('.info_item').text()),
            price: this.extractPrice($(element).closest('.info_item').text()),
            rating: parseFloat(rating) || 0,
            reviewCount: 0,
            source: 'daum_place',
            confidence: 0.7,
            additionalInfo: {
              originalName: gymName,
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 다음 플레이스 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 헬스장 전용 사이트 파싱
   */
  private parseGymFinderSites($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.gym-name').each((index, element) => {
      try {
        const name = $(element).text().trim()
        const address = $(element).closest('.gym-item').find('.gym-address').text().trim()
        const phone = $(element).closest('.gym-item').find('.gym-phone').text().trim()
        const price = $(element).closest('.gym-item').find('.gym-price').text().trim()
        const rating = $(element).closest('.gym-item').find('.gym-rating').text().trim()
        const facilities = $(element).closest('.gym-item').find('.gym-facilities').text().trim()
        
        if (name && address) {
          results.push({
            name: name,
            address: address,
            phone: phone,
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours(facilities),
            hasParking: this.extractParking(facilities),
            hasShower: this.extractShower(facilities),
            hasPT: this.extractPT(facilities),
            hasGX: this.extractGX(facilities),
            hasGroupPT: this.extractGroupPT(facilities),
            openHour: this.extractOpenHour($(element).closest('.gym-item').text()),
            closeHour: this.extractCloseHour($(element).closest('.gym-item').text()),
            price: price,
            rating: parseFloat(rating) || 0,
            reviewCount: 0,
            source: 'gym_finder_sites',
            confidence: 0.9,
            additionalInfo: {
              originalName: gymName,
              facilities: facilities,
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 헬스장 전용 사이트 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 일반 사이트 파싱
   */
  private parseGenericSite($: cheerio.Root, source: CrawlingSource, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $(source.selectors.name).each((index, element) => {
      try {
        const name = $(element).text().trim()
        const address = $(element).closest('*').find(source.selectors.address).text().trim()
        const phone = $(element).closest('*').find(source.selectors.phone).text().trim()
        const price = $(element).closest('*').find(source.selectors.price).text().trim()
        const rating = $(element).closest('*').find(source.selectors.rating).text().trim()
        
        if (name && address) {
          results.push({
            name: name,
            address: address,
            phone: phone,
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours($(element).closest('*').text()),
            hasParking: this.extractParking($(element).closest('*').text()),
            hasShower: this.extractShower($(element).closest('*').text()),
            hasPT: this.extractPT($(element).closest('*').text()),
            hasGX: this.extractGX($(element).closest('*').text()),
            hasGroupPT: this.extractGroupPT($(element).closest('*').text()),
            openHour: this.extractOpenHour($(element).closest('*').text()),
            closeHour: this.extractCloseHour($(element).closest('*').text()),
            price: price,
            rating: parseFloat(rating) || 0,
            reviewCount: 0,
            source: source.id,
            confidence: 0.6,
            additionalInfo: {
              originalName: gymName,
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 일반 사이트 파싱 오류: ${source.name}`, error)
      }
    })
    
    return results
  }

  /**
   * Rate limit 확인
   */
  private checkRateLimit(source: CrawlingSource): boolean {
    const now = Date.now()
    const key = source.id
    const current = this.requestCounts.get(key)

    if (!current) {
      this.requestCounts.set(key, { count: 1, resetTime: now + 60000 })
      return true
    }

    if (now > current.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + 60000 })
      return true
    }

    return current.count < source.rateLimit.requestsPerMinute
  }

  /**
   * Rate limit 카운터 업데이트
   */
  private updateRateLimitCounter(source: CrawlingSource): void {
    const key = source.id
    const current = this.requestCounts.get(key)

    if (current) {
      current.count++
    }
  }

  /**
   * 결과 중복 제거
   */
  private deduplicateResults(results: CrawlingResult[]): CrawlingResult[] {
    const unique = new Map<string, CrawlingResult>()

    results.forEach(result => {
      const key = `${result.name}_${result.address}`
      
      if (!unique.has(key) || unique.get(key)!.confidence < result.confidence) {
        unique.set(key, result)
      }
    })

    return Array.from(unique.values()).sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 랜덤 User-Agent 반환
   */
  private getRandomUserAgent(): string {
    return this.config.userAgents[Math.floor(Math.random() * this.config.userAgents.length)]
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

  // 유틸리티 메서드들
  private extract24Hours(content: string): boolean {
    return /24시간|24시|야간|심야|새벽/.test(content)
  }

  private extractParking(content: string): boolean {
    return /주차|파킹|parking/.test(content)
  }

  private extractShower(content: string): boolean {
    return /샤워|shower|목욕/.test(content)
  }

  private extractPT(content: string): boolean {
    return /PT|개인레슨|퍼스널트레이닝|personal training/.test(content)
  }

  private extractGX(content: string): boolean {
    return /GX|그룹운동|요가|필라테스|댄스|줌바/.test(content)
  }

  private extractGroupPT(content: string): boolean {
    return /그룹PT|소그룹|팀트레이닝/.test(content)
  }

  private extractOpenHour(content: string): string {
    const hourMatch = content.match(/(\d{1,2}:\d{2})\s*[~-]\s*(\d{1,2}:\d{2})/)
    return hourMatch ? hourMatch[1] : ''
  }

  private extractCloseHour(content: string): string {
    const hourMatch = content.match(/(\d{1,2}:\d{2})\s*[~-]\s*(\d{1,2}:\d{2})/)
    return hourMatch ? hourMatch[2] : ''
  }

  private extractPrice(content: string): string {
    const priceMatch = content.match(/(\d{1,3}(?:,\d{3})*)\s*원/)
    return priceMatch ? `${priceMatch[1]}원` : ''
  }
}
