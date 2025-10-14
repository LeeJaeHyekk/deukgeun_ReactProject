import axios from 'axios'
import * as cheerio from 'cheerio'

// 크롤링 소스 인터페이스
interface CrawlingSource {
  id: string
  name: string
  baseUrl: string
  searchPath: string
  selectors: {
    name: string
    address: string
    phone: string
    price: string
    rating: string
    facilities: string
  }
  isActive: boolean
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
}

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

/**
 * 향상된 크롤링 소스 서비스
 * 다양한 웹사이트에서 헬스장 정보를 크롤링하는 서비스
 */
export class EnhancedCrawlingSources {
  private sources: CrawlingSource[]
  private userAgents: string[]
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map()

  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ]

    this.sources = this.initializeCrawlingSources()
  }

  /**
   * 크롤링 소스 초기화
   */
  private initializeCrawlingSources(): CrawlingSource[] {
    return [
      {
        id: 'naver_blog',
        name: '네이버 블로그',
        baseUrl: 'https://search.naver.com',
        searchPath: '/search.naver',
        selectors: {
          name: '.sh_blog_title',
          address: '.sh_blog_passage',
          phone: '.sh_blog_passage',
          price: '.sh_blog_passage',
          rating: '.sh_blog_passage',
          facilities: '.sh_blog_passage'
        },
        isActive: true,
        rateLimit: { requestsPerMinute: 20, requestsPerDay: 500 }
      },
      {
        id: 'naver_kin',
        name: '네이버 지식iN',
        baseUrl: 'https://kin.naver.com',
        searchPath: '/search.naver',
        selectors: {
          name: '.title',
          address: '.detail',
          phone: '.detail',
          price: '.detail',
          rating: '.detail',
          facilities: '.detail'
        },
        isActive: true,
        rateLimit: { requestsPerMinute: 15, requestsPerDay: 300 }
      },
      {
        id: 'naver_cafe',
        name: '네이버 카페',
        baseUrl: 'https://cafe.naver.com',
        searchPath: '/ArticleSearchList.nhn',
        selectors: {
          name: '.article',
          address: '.article',
          phone: '.article',
          price: '.article',
          rating: '.article',
          facilities: '.article'
        },
        isActive: true,
        rateLimit: { requestsPerMinute: 10, requestsPerDay: 200 }
      },
      {
        id: 'daum_blog',
        name: '다음 블로그',
        baseUrl: 'https://search.daum.net',
        searchPath: '/search',
        selectors: {
          name: '.f_link_b',
          address: '.desc',
          phone: '.desc',
          price: '.desc',
          rating: '.desc',
          facilities: '.desc'
        },
        isActive: true,
        rateLimit: { requestsPerMinute: 15, requestsPerDay: 300 }
      },
      {
        id: 'gym_site',
        name: '헬스장 전용 사이트',
        baseUrl: 'https://www.gymfinder.co.kr',
        searchPath: '/search',
        selectors: {
          name: '.gym-name',
          address: '.gym-address',
          phone: '.gym-phone',
          price: '.gym-price',
          rating: '.gym-rating',
          facilities: '.gym-facilities'
        },
        isActive: true,
        rateLimit: { requestsPerMinute: 10, requestsPerDay: 200 }
      }
    ]
  }

  /**
   * 모든 크롤링 소스에서 검색
   */
  async searchAllCrawlingSources(gymName: string): Promise<CrawlingResult[]> {
    console.log(`🕷️ 크롤링 검색 시작: ${gymName}`)

    const activeSources = this.sources.filter(source => source.isActive)
    const allResults: CrawlingResult[] = []

    // 동시 요청 수 제한
    const maxConcurrent = 3
    const chunks = this.chunkArray(activeSources, maxConcurrent)

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(source => this.searchSingleSource(source, gymName))
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
        await this.delay(2000)
      }
    }

    // 결과 중복 제거 및 정리
    const uniqueResults = this.deduplicateResults(allResults)
    
    console.log(`✅ 크롤링 검색 완료: ${allResults.length}개 → ${uniqueResults.length}개 (중복제거)`)
    
    return uniqueResults
  }

  /**
   * 단일 소스에서 검색
   */
  private async searchSingleSource(source: CrawlingSource, gymName: string): Promise<CrawlingResult[]> {
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
    const maxRetries = 3
    const retryDelay = 2000
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: 15000,
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
        
        if (attempt < maxRetries) {
          console.warn(`⚠️ 크롤링 요청 실패 (시도 ${attempt}/${maxRetries}): ${source.name}`)
          await this.delay(retryDelay * attempt)
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
      case 'naver_blog':
        return `${source.baseUrl}${source.searchPath}?where=post&query=${searchQuery}&sm=tab_opt&nso=so%3Ar%2Ca%3Aall%2Cp%3Aall`
      case 'naver_kin':
        return `${source.baseUrl}${source.searchPath}?query=${searchQuery}`
      case 'naver_cafe':
        return `${source.baseUrl}${source.searchPath}?search.clubid=10050146&search.searchBy=0&search.query=${searchQuery}`
      case 'daum_blog':
        return `${source.baseUrl}${source.searchPath}?q=${searchQuery}&w=blog`
      case 'gym_site':
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
        case 'naver_blog':
          return this.parseNaverBlog($, gymName)
        case 'naver_kin':
          return this.parseNaverKin($, gymName)
        case 'naver_cafe':
          return this.parseNaverCafe($, gymName)
        case 'daum_blog':
          return this.parseDaumBlog($, gymName)
        case 'gym_site':
          return this.parseGymSite($, gymName)
        default:
          return this.parseGenericSite($, source, gymName)
      }
    } catch (error) {
      console.error(`❌ HTML 파싱 실패: ${source.name}`, error)
      return []
    }
  }

  /**
   * 네이버 블로그 파싱
   */
  private parseNaverBlog($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.sh_blog_title').each((index, element) => {
      try {
        const title = $(element).text().trim()
        const content = $(element).closest('.sh_blog_passage').text().trim()
        
        if (title && content && title.includes(gymName)) {
          results.push({
            name: title,
            address: this.extractAddress(content),
            phone: this.extractPhone(content),
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours(content),
            hasParking: this.extractParking(content),
            hasShower: this.extractShower(content),
            hasPT: this.extractPT(content),
            hasGX: this.extractGX(content),
            hasGroupPT: this.extractGroupPT(content),
            openHour: this.extractOpenHour(content),
            closeHour: this.extractCloseHour(content),
            price: this.extractPrice(content),
            rating: 0,
            reviewCount: 0,
            source: 'naver_blog',
            confidence: 0.6,
            additionalInfo: {
              originalName: gymName,
              content: content.substring(0, 200),
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 네이버 블로그 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 네이버 지식iN 파싱
   */
  private parseNaverKin($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.title').each((index, element) => {
      try {
        const title = $(element).text().trim()
        const content = $(element).closest('.detail').text().trim()
        
        if (title && content && title.includes(gymName)) {
          results.push({
            name: title,
            address: this.extractAddress(content),
            phone: this.extractPhone(content),
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours(content),
            hasParking: this.extractParking(content),
            hasShower: this.extractShower(content),
            hasPT: this.extractPT(content),
            hasGX: this.extractGX(content),
            hasGroupPT: this.extractGroupPT(content),
            openHour: this.extractOpenHour(content),
            closeHour: this.extractCloseHour(content),
            price: this.extractPrice(content),
            rating: 0,
            reviewCount: 0,
            source: 'naver_kin',
            confidence: 0.5,
            additionalInfo: {
              originalName: gymName,
              content: content.substring(0, 200),
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 네이버 지식iN 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 네이버 카페 파싱
   */
  private parseNaverCafe($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.article').each((index, element) => {
      try {
        const content = $(element).text().trim()
        
        if (content && content.includes(gymName)) {
          results.push({
            name: this.extractName(content),
            address: this.extractAddress(content),
            phone: this.extractPhone(content),
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours(content),
            hasParking: this.extractParking(content),
            hasShower: this.extractShower(content),
            hasPT: this.extractPT(content),
            hasGX: this.extractGX(content),
            hasGroupPT: this.extractGroupPT(content),
            openHour: this.extractOpenHour(content),
            closeHour: this.extractCloseHour(content),
            price: this.extractPrice(content),
            rating: 0,
            reviewCount: 0,
            source: 'naver_cafe',
            confidence: 0.7,
            additionalInfo: {
              originalName: gymName,
              content: content.substring(0, 200),
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 네이버 카페 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 다음 블로그 파싱
   */
  private parseDaumBlog($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.f_link_b').each((index, element) => {
      try {
        const title = $(element).text().trim()
        const content = $(element).closest('.desc').text().trim()
        
        if (title && content && title.includes(gymName)) {
          results.push({
            name: title,
            address: this.extractAddress(content),
            phone: this.extractPhone(content),
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours(content),
            hasParking: this.extractParking(content),
            hasShower: this.extractShower(content),
            hasPT: this.extractPT(content),
            hasGX: this.extractGX(content),
            hasGroupPT: this.extractGroupPT(content),
            openHour: this.extractOpenHour(content),
            closeHour: this.extractCloseHour(content),
            price: this.extractPrice(content),
            rating: 0,
            reviewCount: 0,
            source: 'daum_blog',
            confidence: 0.6,
            additionalInfo: {
              originalName: gymName,
              content: content.substring(0, 200),
              parsedAt: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.warn(`⚠️ 다음 블로그 파싱 오류:`, error)
      }
    })
    
    return results
  }

  /**
   * 헬스장 전용 사이트 파싱
   */
  private parseGymSite($: cheerio.Root, gymName: string): CrawlingResult[] {
    const results: CrawlingResult[] = []
    
    $('.gym-name').each((index, element) => {
      try {
        const name = $(element).text().trim()
        const address = $(element).closest('.gym-item').find('.gym-address').text().trim()
        const phone = $(element).closest('.gym-item').find('.gym-phone').text().trim()
        const price = $(element).closest('.gym-item').find('.gym-price').text().trim()
        const rating = $(element).closest('.gym-item').find('.gym-rating').text().trim()
        const facilities = $(element).closest('.gym-item').find('.gym-facilities').text().trim()
        
        if (name && address && name.includes(gymName)) {
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
            source: 'gym_site',
            confidence: 0.8,
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
        const content = $(element).closest('*').text().trim()
        
        if (name && content && name.includes(gymName)) {
          results.push({
            name: name,
            address: this.extractAddress(content),
            phone: this.extractPhone(content),
            latitude: 0,
            longitude: 0,
            is24Hours: this.extract24Hours(content),
            hasParking: this.extractParking(content),
            hasShower: this.extractShower(content),
            hasPT: this.extractPT(content),
            hasGX: this.extractGX(content),
            hasGroupPT: this.extractGroupPT(content),
            openHour: this.extractOpenHour(content),
            closeHour: this.extractCloseHour(content),
            price: this.extractPrice(content),
            rating: 0,
            reviewCount: 0,
            source: source.id,
            confidence: 0.5,
            additionalInfo: {
              originalName: gymName,
              content: content.substring(0, 200),
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

  // 유틸리티 메서드들
  private extractName(content: string): string {
    const nameMatch = content.match(/([가-힣]+(?:헬스|짐|피트니스|gym|fitness))/i)
    return nameMatch ? nameMatch[1] : ''
  }

  private extractAddress(content: string): string {
    const addressMatch = content.match(/(서울[가-힣\s\d-]+)/)
    return addressMatch ? addressMatch[1] : ''
  }

  private extractPhone(content: string): string {
    const phoneMatch = content.match(/(\d{2,3}-\d{3,4}-\d{4})/)
    return phoneMatch ? phoneMatch[1] : ''
  }

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

  private updateRateLimitCounter(source: CrawlingSource): void {
    const key = source.id
    const current = this.requestCounts.get(key)

    if (current) {
      current.count++
    }
  }

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

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}