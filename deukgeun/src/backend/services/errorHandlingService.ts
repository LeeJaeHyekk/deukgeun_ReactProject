import { logger } from "../utils/logger.js"

export interface ErrorContext {
  gymName: string
  source: string
  error: Error
  timestamp: Date
  retryCount: number
  fallbackStrategy?: string
}

export interface FallbackStrategy {
  name: string
  priority: number
  description: string
  shouldRetry: boolean
  maxRetries: number
  retryDelay: number
}

export class ErrorHandlingService {
  private static errorHistory: ErrorContext[] = []
  private static readonly MAX_ERROR_HISTORY = 1000

  // 에러 타입별 대응 전략
  private static readonly FALLBACK_STRATEGIES: Record<string, FallbackStrategy> = {
    // API 관련 에러
    "API_RATE_LIMIT": {
      name: "API_RATE_LIMIT",
      priority: 1,
      description: "API 호출 한도 초과 - 크롤링으로 대체",
      shouldRetry: true,
      maxRetries: 3,
      retryDelay: 5000
    },
    "API_AUTH_ERROR": {
      name: "API_AUTH_ERROR",
      priority: 2,
      description: "API 인증 실패 - 다른 API로 대체",
      shouldRetry: false,
      maxRetries: 0,
      retryDelay: 0
    },
    "API_TIMEOUT": {
      name: "API_TIMEOUT",
      priority: 3,
      description: "API 타임아웃 - 크롤링으로 대체",
      shouldRetry: true,
      maxRetries: 2,
      retryDelay: 3000
    },
    "API_NOT_FOUND": {
      name: "API_NOT_FOUND",
      priority: 4,
      description: "API 데이터 없음 - 크롤링으로 대체",
      shouldRetry: false,
      maxRetries: 0,
      retryDelay: 0
    },

    // 크롤링 관련 에러
    "CRAWLING_TIMEOUT": {
      name: "CRAWLING_TIMEOUT",
      priority: 5,
      description: "크롤링 타임아웃 - 다른 사이트로 대체",
      shouldRetry: true,
      maxRetries: 2,
      retryDelay: 2000
    },
    "CRAWLING_BLOCKED": {
      name: "CRAWLING_BLOCKED",
      priority: 6,
      description: "크롤링 차단됨 - User-Agent 변경 후 재시도",
      shouldRetry: true,
      maxRetries: 3,
      retryDelay: 10000
    },
    "CRAWLING_PARSE_ERROR": {
      name: "CRAWLING_PARSE_ERROR",
      priority: 7,
      description: "크롤링 파싱 오류 - 다른 파싱 방식 시도",
      shouldRetry: true,
      maxRetries: 2,
      retryDelay: 1000
    },

    // 네트워크 관련 에러
    "NETWORK_ERROR": {
      name: "NETWORK_ERROR",
      priority: 8,
      description: "네트워크 오류 - 잠시 후 재시도",
      shouldRetry: true,
      maxRetries: 3,
      retryDelay: 5000
    },
    "DNS_ERROR": {
      name: "DNS_ERROR",
      priority: 9,
      description: "DNS 해석 오류 - 다른 DNS 사용",
      shouldRetry: true,
      maxRetries: 2,
      retryDelay: 3000
    },

    // 데이터베이스 관련 에러
    "DB_CONNECTION_ERROR": {
      name: "DB_CONNECTION_ERROR",
      priority: 10,
      description: "데이터베이스 연결 오류 - 재연결 시도",
      shouldRetry: true,
      maxRetries: 5,
      retryDelay: 2000
    },
    "DB_TIMEOUT": {
      name: "DB_TIMEOUT",
      priority: 11,
      description: "데이터베이스 타임아웃 - 쿼리 최적화",
      shouldRetry: true,
      maxRetries: 3,
      retryDelay: 1000
    }
  }

  /**
   * 에러 타입 분류
   */
  static classifyError(error: Error): string {
    const errorMessage = error.message.toLowerCase()
    const errorStack = error.stack?.toLowerCase() || ""

    // API 관련 에러
    if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      return "API_RATE_LIMIT"
    }
    if (errorMessage.includes("unauthorized") || errorMessage.includes("401")) {
      return "API_AUTH_ERROR"
    }
    if (errorMessage.includes("timeout") || errorMessage.includes("408")) {
      return "API_TIMEOUT"
    }
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return "API_NOT_FOUND"
    }

    // 크롤링 관련 에러
    if (errorMessage.includes("crawling timeout")) {
      return "CRAWLING_TIMEOUT"
    }
    if (errorMessage.includes("blocked") || errorMessage.includes("forbidden")) {
      return "CRAWLING_BLOCKED"
    }
    if (errorMessage.includes("parse") || errorMessage.includes("cheerio")) {
      return "CRAWLING_PARSE_ERROR"
    }

    // 네트워크 관련 에러
    if (errorMessage.includes("network") || errorMessage.includes("connection")) {
      return "NETWORK_ERROR"
    }
    if (errorMessage.includes("dns") || errorMessage.includes("enotfound")) {
      return "DNS_ERROR"
    }

    // 데이터베이스 관련 에러
    if (errorMessage.includes("database") || errorMessage.includes("connection")) {
      return "DB_CONNECTION_ERROR"
    }
    if (errorMessage.includes("query timeout")) {
      return "DB_TIMEOUT"
    }

    return "UNKNOWN_ERROR"
  }

  /**
   * 에러 처리 및 대응 전략 결정
   */
  static handleError(context: ErrorContext): {
    shouldRetry: boolean
    retryDelay: number
    fallbackStrategy: string
    nextAction: string
  } {
    const errorType = this.classifyError(context.error)
    const strategy = this.FALLBACK_STRATEGIES[errorType] || this.FALLBACK_STRATEGIES["UNKNOWN_ERROR"]

    // 에러 히스토리에 추가
    this.addErrorToHistory(context)

    // 재시도 여부 결정
    const shouldRetry = strategy.shouldRetry && context.retryCount < strategy.maxRetries

    // 대응 전략 결정
    let fallbackStrategy = strategy.name
    let nextAction = "continue"

    if (shouldRetry) {
      nextAction = "retry"
    } else if (errorType.startsWith("API_")) {
      fallbackStrategy = "SWITCH_TO_CRAWLING"
      nextAction = "fallback_to_crawling"
    } else if (errorType.startsWith("CRAWLING_")) {
      fallbackStrategy = "SWITCH_TO_ALTERNATIVE_SOURCE"
      nextAction = "fallback_to_alternative"
    } else {
      fallbackStrategy = "USE_CACHED_DATA"
      nextAction = "use_cached_data"
    }

    // 에러 로깅
    logger.error(`에러 처리: ${context.gymName}`, {
      errorType,
      source: context.source,
      retryCount: context.retryCount,
      fallbackStrategy,
      nextAction,
      error: context.error.message
    })

    return {
      shouldRetry,
      retryDelay: shouldRetry ? strategy.retryDelay : 0,
      fallbackStrategy,
      nextAction
    }
  }

  /**
   * 에러 히스토리에 추가
   */
  private static addErrorToHistory(context: ErrorContext): void {
    this.errorHistory.push(context)
    
    // 히스토리 크기 제한
    if (this.errorHistory.length > this.MAX_ERROR_HISTORY) {
      this.errorHistory = this.errorHistory.slice(-this.MAX_ERROR_HISTORY)
    }
  }

  /**
   * 에러 통계 조회
   */
  static getErrorStatistics(): {
    totalErrors: number
    errorTypes: Record<string, number>
    recentErrors: ErrorContext[]
    successRate: number
  } {
    const errorTypes: Record<string, number> = {}
    const recentErrors = this.errorHistory.slice(-100) // 최근 100개

    this.errorHistory.forEach(context => {
      const errorType = this.classifyError(context.error)
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1
    })

    return {
      totalErrors: this.errorHistory.length,
      errorTypes,
      recentErrors,
      successRate: this.calculateSuccessRate()
    }
  }

  /**
   * 성공률 계산
   */
  private static calculateSuccessRate(): number {
    // 실제 구현에서는 전체 요청 수와 성공 수를 추적해야 함
    // 현재는 에러 히스토리만 있으므로 임시 계산
    const totalRequests = this.errorHistory.length * 10 // 추정치
    const errorCount = this.errorHistory.length
    return Math.max(0, ((totalRequests - errorCount) / totalRequests) * 100)
  }

  /**
   * 재시도 로직
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        context.retryCount = attempt
        context.error = lastError
        
        const result = this.handleError(context)
        
        if (!result.shouldRetry) {
          throw lastError
        }
        
        // 지수 백오프
        const delay = result.retryDelay * Math.pow(2, attempt - 1)
        logger.warn(`재시도 ${attempt}/${maxRetries}: ${context.gymName} - ${delay}ms 후 재시도`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }

  /**
   * 대체 소스 선택
   */
  static selectFallbackSource(originalSource: string, errorType: string): string[] {
    const fallbackSources: Record<string, string[]> = {
      "kakao": ["google", "seoul_openapi", "crawling"],
      "google": ["kakao", "seoul_openapi", "crawling"],
      "seoul_openapi": ["kakao", "google", "crawling"],
      "crawling": ["kakao", "google", "seoul_openapi"]
    }

    return fallbackSources[originalSource] || ["crawling"]
  }

  /**
   * 에러 히스토리 초기화
   */
  static clearErrorHistory(): void {
    this.errorHistory = []
    logger.info("에러 히스토리가 초기화되었습니다.")
  }

  /**
   * 특정 에러 타입의 발생 빈도 확인
   */
  static getErrorFrequency(errorType: string, timeWindow: number = 3600000): number {
    const now = new Date()
    const windowStart = new Date(now.getTime() - timeWindow)
    
    return this.errorHistory.filter(context => {
      const contextErrorType = this.classifyError(context.error)
      return contextErrorType === errorType && context.timestamp >= windowStart
    }).length
  }

  /**
   * 에러 패턴 분석
   */
  static analyzeErrorPatterns(): {
    mostCommonError: string
    errorTrend: "increasing" | "decreasing" | "stable"
    recommendations: string[]
  } {
    const stats = this.getErrorStatistics()
    const errorTypes = Object.entries(stats.errorTypes)
    
    if (errorTypes.length === 0) {
      return {
        mostCommonError: "none",
        errorTrend: "stable",
        recommendations: ["에러가 발생하지 않고 있습니다."]
      }
    }

    // 가장 빈번한 에러
    const mostCommonError = errorTypes.reduce((a, b) => a[1] > b[1] ? a : b)[0]

    // 에러 트렌드 분석 (최근 1시간 vs 이전 1시간)
    const recentHour = this.getErrorFrequency(mostCommonError, 3600000)
    const previousHour = this.getErrorFrequency(mostCommonError, 7200000) - recentHour
    
    let errorTrend: "increasing" | "decreasing" | "stable" = "stable"
    if (recentHour > previousHour * 1.5) {
      errorTrend = "increasing"
    } else if (recentHour < previousHour * 0.5) {
      errorTrend = "decreasing"
    }

    // 권장사항 생성
    const recommendations: string[] = []
    
    if (mostCommonError === "API_RATE_LIMIT") {
      recommendations.push("API 호출 빈도를 줄이거나 API 키를 추가로 발급받으세요.")
    } else if (mostCommonError === "CRAWLING_BLOCKED") {
      recommendations.push("User-Agent를 변경하거나 크롤링 간격을 늘리세요.")
    } else if (mostCommonError === "NETWORK_ERROR") {
      recommendations.push("네트워크 연결을 확인하고 재시도 간격을 늘리세요.")
    }

    if (errorTrend === "increasing") {
      recommendations.push("에러가 증가하고 있습니다. 시스템 상태를 점검하세요.")
    }

    return {
      mostCommonError,
      errorTrend,
      recommendations
    }
  }
}
