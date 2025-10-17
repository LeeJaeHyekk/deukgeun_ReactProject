/**
 * 봇 탐지 회피 유틸리티
 */
export class AntiDetectionUtils {
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ]

  private static readonly REFERERS = [
    'https://www.google.com/',
    'https://www.naver.com/',
    'https://www.daum.net/',
    'https://www.bing.com/'
  ]

  /**
   * 랜덤 User-Agent 반환
   */
  static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)]
  }

  /**
   * 랜덤 Referer 반환
   */
  static getRandomReferer(): string {
    return this.REFERERS[Math.floor(Math.random() * this.REFERERS.length)]
  }

  /**
   * 랜덤 지연 시간 생성 (밀리초)
   */
  static getRandomDelay(min: number = 1000, max: number = 3000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 지수 백오프 지연 시간 계산
   */
  static getExponentialBackoffDelay(attempt: number, baseDelay: number = 1000): number {
    return baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
  }

  /**
   * 요청 헤더에 랜덤 요소 추가
   */
  static getEnhancedHeaders(): Record<string, string> {
    const userAgent = this.getRandomUserAgent()
    const referer = this.getRandomReferer()
    
    return {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Referer': referer
    }
  }

  /**
   * 403 에러 감지
   */
  static is403Error(error: any): boolean {
    if (error?.response?.status === 403) return true
    if (error?.message?.includes('403')) return true
    if (error?.message?.includes('Forbidden')) return true
    return false
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  static isRetryableError(error: any): boolean {
    const status = error?.response?.status
    return status === 403 || status === 429 || status === 503 || status === 502
  }

  /**
   * 요청 간 지연 (인간적인 패턴)
   */
  static async humanLikeDelay(): Promise<void> {
    const delay = this.getRandomDelay(2000, 5000)
    console.log(`⏳ 인간적인 지연: ${delay}ms`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * 403 에러 후 긴 지연
   */
  static async delayAfter403Error(): Promise<void> {
    const delay = this.getRandomDelay(10000, 20000)
    console.log(`🚫 403 에러 후 긴 지연: ${delay}ms`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * 쿼리 정규화 (특수문자 제거)
   */
  static normalizeQuery(query: string): string {
    return query
      .replace(/[()]/g, '') // 괄호 제거
      .replace(/\s+/g, ' ') // 연속 공백을 하나로
      .trim()
  }

  /**
   * 쿼리 단순화 (검색 실패 시 사용)
   */
  static simplifyQuery(query: string): string {
    return query
      .replace(/[()]/g, '')
      .replace(/[^\w\s가-힣]/g, '') // 한글, 영문, 숫자, 공백만 유지
      .replace(/\s+/g, ' ')
      .trim()
  }
}
