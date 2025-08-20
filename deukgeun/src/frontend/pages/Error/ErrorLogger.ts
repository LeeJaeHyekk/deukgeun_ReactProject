// 에러 로깅 및 분석 시스템

interface ErrorLog {
  id: string
  timestamp: Date
  errorType: string
  message: string
  stack?: string
  url: string
  userAgent: string
  userId?: string
  sessionId?: string
  componentStack?: string
  severity: "low" | "medium" | "high" | "critical"
  metadata?: Record<string, any>
}

interface ErrorAnalytics {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsBySeverity: Record<string, number>
  recentErrors: ErrorLog[]
  errorTrends: {
    hourly: Record<string, number>
    daily: Record<string, number>
  }
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private readonly MAX_LOGS = 1000
  private readonly FLUSH_INTERVAL = 5 * 60 * 1000 // 5분
  private flushTimer?: NodeJS.Timeout

  constructor() {
    this.initializeFlushTimer()
  }

  private initializeFlushTimer() {
    // 주기적으로 로그를 서버로 전송
    this.flushTimer = setInterval(() => {
      this.flushLogs()
    }, this.FLUSH_INTERVAL)
  }

  /**
   * 에러 로그 추가
   */
  logError(
    error: Error,
    context: {
      errorType: string
      userId?: string
      sessionId?: string
      componentStack?: string
      metadata?: Record<string, any>
    }
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      errorType: context.errorType,
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: context.userId,
      sessionId: context.sessionId,
      componentStack: context.componentStack,
      severity: this.calculateSeverity(error, context.errorType),
      metadata: context.metadata,
    }

    this.logs.push(errorLog)

    // 최대 로그 개수 제한
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift()
    }

    // 개발 환경에서는 즉시 콘솔에 출력
    if (process.env.NODE_ENV === "development") {
      this.logToConsole(errorLog)
    }

    // 심각한 에러는 즉시 서버로 전송
    if (errorLog.severity === "critical" || errorLog.severity === "high") {
      this.sendToServer([errorLog])
    }
  }

  /**
   * 에러 심각도 계산
   */
  private calculateSeverity(
    error: Error,
    errorType: string
  ): "low" | "medium" | "high" | "critical" {
    // 에러 타입별 기본 심각도
    const typeSeverity: Record<string, "low" | "medium" | "high" | "critical"> =
      {
        javascript: "medium",
        network: "high",
        promise: "medium",
        resource: "low",
      }

    let severity = typeSeverity[errorType] || "medium"

    // 에러 메시지 기반 심각도 조정
    const message = error.message.toLowerCase()

    if (message.includes("critical") || message.includes("fatal")) {
      severity = "critical"
    } else if (message.includes("network") || message.includes("connection")) {
      severity = "high"
    } else if (message.includes("validation") || message.includes("format")) {
      severity = "low"
    }

    // 스택 트레이스 길이로 심각도 조정
    if (error.stack && error.stack.split("\n").length > 10) {
      severity = severity === "low" ? "medium" : severity
    }

    return severity
  }

  /**
   * 콘솔에 로그 출력
   */
  private logToConsole(errorLog: ErrorLog): void {
    const { severity, errorType, message, timestamp } = errorLog

    const severityColors = {
      low: "#6b7280",
      medium: "#f59e0b",
      high: "#ef4444",
      critical: "#dc2626",
    }

    const color = severityColors[severity]

    console.group(
      `%c🚨 ${severity.toUpperCase()} ${errorType.toUpperCase()} ERROR`,
      `color: ${color}; font-weight: bold;`
    )
    console.error("Message:", message)
    console.error("Timestamp:", timestamp.toISOString())
    console.error("URL:", errorLog.url)
    console.error("Severity:", severity)
    if (errorLog.stack) {
      console.error("Stack:", errorLog.stack)
    }
    if (errorLog.metadata) {
      console.error("Metadata:", errorLog.metadata)
    }
    console.groupEnd()
  }

  /**
   * 서버로 로그 전송
   */
  private async sendToServer(logs: ErrorLog[]): Promise<void> {
    try {
      const payload = {
        logs: logs.map(log => ({
          ...log,
          timestamp: log.timestamp.toISOString(),
        })),
        environment: process.env.NODE_ENV,
        version: process.env.REACT_APP_VERSION || "unknown",
      }

      // 실제 구현 시 활성화
      // await fetch("/api/errors/log", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // })

      console.log("Error logs sent to server:", payload)
    } catch (error) {
      console.error("Failed to send error logs to server:", error)
    }
  }

  /**
   * 로그 플러시 (주기적 전송)
   */
  private async flushLogs(): Promise<void> {
    if (this.logs.length === 0) return

    const logsToSend = [...this.logs]
    this.logs = []

    await this.sendToServer(logsToSend)
  }

  /**
   * 에러 분석 데이터 생성
   */
  getAnalytics(): ErrorAnalytics {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentErrors = this.logs.filter(log => log.timestamp > oneHourAgo)

    const errorsByType = this.logs.reduce(
      (acc, log) => {
        acc[log.errorType] = (acc[log.errorType] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const errorsBySeverity = this.logs.reduce(
      (acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const hourlyTrends = this.logs
      .filter(log => log.timestamp > oneDayAgo)
      .reduce(
        (acc, log) => {
          const hour = log.timestamp.getHours().toString()
          acc[hour] = (acc[hour] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

    const dailyTrends = this.logs
      .filter(
        log => log.timestamp > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      )
      .reduce(
        (acc, log) => {
          const day = log.timestamp.toDateString()
          acc[day] = (acc[day] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

    return {
      totalErrors: this.logs.length,
      errorsByType,
      errorsBySeverity,
      recentErrors,
      errorTrends: {
        hourly: hourlyTrends,
        daily: dailyTrends,
      },
    }
  }

  /**
   * 특정 조건의 에러 검색
   */
  searchErrors(criteria: {
    errorType?: string
    severity?: string
    startDate?: Date
    endDate?: Date
    userId?: string
  }): ErrorLog[] {
    return this.logs.filter(log => {
      if (criteria.errorType && log.errorType !== criteria.errorType)
        return false
      if (criteria.severity && log.severity !== criteria.severity) return false
      if (criteria.startDate && log.timestamp < criteria.startDate) return false
      if (criteria.endDate && log.timestamp > criteria.endDate) return false
      if (criteria.userId && log.userId !== criteria.userId) return false
      return true
    })
  }

  /**
   * 로그 클리어
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * 고유 ID 생성
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flushLogs()
  }
}

// 싱글톤 인스턴스
export const errorLogger = new ErrorLogger()

// 편의 함수들
export const logError = (
  error: Error,
  context: {
    errorType: string
    userId?: string
    sessionId?: string
    componentStack?: string
    metadata?: Record<string, any>
  }
) => {
  errorLogger.logError(error, context)
}

export const getErrorAnalytics = () => errorLogger.getAnalytics()

export const searchErrors = (
  criteria: Parameters<typeof errorLogger.searchErrors>[0]
) => errorLogger.searchErrors(criteria)

export const clearErrorLogs = () => errorLogger.clearLogs()

export default errorLogger
