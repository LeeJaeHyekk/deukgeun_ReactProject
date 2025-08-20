// 전역 에러 핸들러
// 애플리케이션 전체에서 발생하는 에러를 중앙에서 처리

import { errorLogger } from "./ErrorLogger"

interface ErrorContext {
  message: string
  stack?: string
  timestamp: Date
  url: string
  userAgent: string
  userId?: string
  sessionId?: string
  componentStack?: string
  errorType: "javascript" | "network" | "promise" | "resource"
}

interface ErrorHandlerConfig {
  enableConsoleLogging: boolean
  enableServerReporting: boolean
  enableUserNotification: boolean
  maxErrorHistory: number
}

// 프로젝트 스타일에 맞는 에러 알림 컴포넌트
class ErrorNotification {
  private static instance: ErrorNotification
  private container: HTMLDivElement | null = null

  static getInstance(): ErrorNotification {
    if (!ErrorNotification.instance) {
      ErrorNotification.instance = new ErrorNotification()
    }
    return ErrorNotification.instance
  }

  private createContainer(): HTMLDivElement {
    if (this.container) {
      return this.container
    }

    this.container = document.createElement("div")
    this.container.id = "error-notification-container"
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    `

    document.body.appendChild(this.container)
    return this.container
  }

  show(
    message: string,
    type: "error" | "warning" | "info" = "error",
    duration: number = 5000
  ) {
    const container = this.createContainer()
    const notification = document.createElement("div")

    const getTypeStyles = () => {
      switch (type) {
        case "error":
          return {
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
            borderColor: "rgba(239, 68, 68, 0.3)",
            icon: "❌",
          }
        case "warning":
          return {
            background:
              "linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%)",
            borderColor: "rgba(245, 158, 11, 0.3)",
            icon: "⚠️",
          }
        case "info":
          return {
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)",
            borderColor: "rgba(59, 130, 246, 0.3)",
            icon: "ℹ️",
          }
      }
    }

    const styles = getTypeStyles()

    notification.style.cssText = `
      background: ${styles.background};
      border: 1px solid ${styles.borderColor};
      border-radius: 16px;
      padding: 16px 20px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      max-width: 100%;
      word-wrap: break-word;
    `

    notification.innerHTML = `
      <span style="font-size: 18px; flex-shrink: 0; margin-top: 1px;">${styles.icon}</span>
      <div style="flex: 1; min-width: 0;">
        <div style="margin-bottom: 4px; font-weight: 600; font-size: 15px;">오류 알림</div>
        <div>${message}</div>
      </div>
      <button style="
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        margin: 0;
        flex-shrink: 0;
        transition: color 0.2s ease;
      " onclick="this.parentElement.remove()">✕</button>
    `

    container.appendChild(notification)

    // 애니메이션 효과
    requestAnimationFrame(() => {
      notification.style.transform = "translateX(0)"
      notification.style.opacity = "1"
    })

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.transform = "translateX(100%)"
          notification.style.opacity = "0"
          setTimeout(() => {
            if (notification.parentElement) {
              notification.remove()
            }
          }, 300)
        }
      }, duration)
    }

    // 호버 효과
    notification.addEventListener("mouseenter", () => {
      notification.style.transform = "translateX(0) scale(1.02)"
    })

    notification.addEventListener("mouseleave", () => {
      notification.style.transform = "translateX(0) scale(1)"
    })
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = ""
    }
  }
}

class GlobalErrorHandler {
  private errorHistory: ErrorContext[] = []
  private config: ErrorHandlerConfig = {
    enableConsoleLogging: true,
    enableServerReporting: process.env.NODE_ENV === "production",
    enableUserNotification: true,
    maxErrorHistory: 100,
  }
  private notification: ErrorNotification

  constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = { ...this.config, ...config }
    this.notification = ErrorNotification.getInstance()
    this.initialize()
  }

  private initialize() {
    // JavaScript 에러 핸들러
    window.addEventListener("error", this.handleJavaScriptError.bind(this))

    // Promise 에러 핸들러
    window.addEventListener(
      "unhandledrejection",
      this.handlePromiseError.bind(this)
    )

    // 리소스 로딩 에러 핸들러
    window.addEventListener("error", this.handleResourceError.bind(this), true)

    // 네트워크 에러 핸들러
    this.setupNetworkErrorHandling()
  }

  private handleJavaScriptError(event: ErrorEvent) {
    const errorContext: ErrorContext = {
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      errorType: "javascript",
    }

    this.processError(errorContext, event.error || new Error(event.message))
  }

  private handlePromiseError(event: PromiseRejectionEvent) {
    const error = event.reason
    const errorContext: ErrorContext = {
      message: error?.message || "Unhandled Promise Rejection",
      stack: error?.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      errorType: "promise",
    }

    this.processError(
      errorContext,
      error instanceof Error ? error : new Error(String(error))
    )
  }

  private handleResourceError(event: ErrorEvent) {
    // 리소스 로딩 에러 (이미지, 스크립트, CSS 등)
    if (event.target !== window) {
      const target = event.target as HTMLElement
      const errorContext: ErrorContext = {
        message: `Failed to load resource: ${target.tagName} - ${(target as any).src || (target as any).href}`,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        errorType: "resource",
      }

      this.processError(errorContext, new Error(errorContext.message))
    }
  }

  private setupNetworkErrorHandling() {
    // 네트워크 상태 모니터링
    window.addEventListener("online", () => {
      console.log("Network connection restored")
    })

    window.addEventListener("offline", () => {
      const errorContext: ErrorContext = {
        message: "Network connection lost",
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        errorType: "network",
      }

      this.processError(errorContext, new Error("Network connection lost"))
    })

    // fetch 요청 실패 감지
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          const errorContext: ErrorContext = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: new Date(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            userId: this.getUserId(),
            sessionId: this.getSessionId(),
            errorType: "network",
          }

          this.processError(errorContext, new Error(`HTTP ${response.status}`))
        }
        return response
      } catch (error) {
        const errorContext: ErrorContext = {
          message: `Network request failed: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId: this.getUserId(),
          sessionId: this.getSessionId(),
          errorType: "network",
        }

        this.processError(
          errorContext,
          error instanceof Error ? error : new Error(String(error))
        )
        throw error
      }
    }
  }

  private processError(errorContext: ErrorContext, error: Error) {
    // 에러 히스토리에 추가
    this.errorHistory.push(errorContext)
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory.shift()
    }

    // 에러 로깅
    if (this.config.enableConsoleLogging) {
      this.logError(errorContext, error)
    }

    // 서버 리포팅
    if (this.config.enableServerReporting) {
      this.reportToServer(errorContext)
    }

    // 사용자 알림
    if (this.config.enableUserNotification) {
      this.notifyUser(errorContext)
    }

    // 에러 로거에 전달
    errorLogger.logError(error, {
      errorType: errorContext.errorType,
      userId: errorContext.userId,
      sessionId: errorContext.sessionId,
      componentStack: errorContext.componentStack,
      metadata: {
        url: errorContext.url,
        userAgent: errorContext.userAgent,
        severity: this.getErrorSeverity(errorContext),
      },
    })
  }

  private getErrorSeverity(
    errorContext: ErrorContext
  ): "low" | "medium" | "high" | "critical" {
    // 에러 타입과 메시지에 따라 심각도 결정
    if (errorContext.errorType === "network") {
      return "high"
    }
    if (errorContext.errorType === "javascript") {
      if (errorContext.message.includes("ResizeObserver")) {
        return "low"
      }
      return "medium"
    }
    if (errorContext.errorType === "resource") {
      return "low"
    }
    return "medium"
  }

  private logError(errorContext: ErrorContext, error: Error) {
    console.group("🚨 Global Error Handler")
    console.error("Error:", error)
    console.error("Context:", errorContext)
    console.error("Timestamp:", errorContext.timestamp.toISOString())
    console.error("URL:", errorContext.url)
    console.error("User Agent:", errorContext.userAgent)
    if (errorContext.userId) {
      console.error("User ID:", errorContext.userId)
    }
    console.groupEnd()
  }

  private async reportToServer(errorContext: ErrorContext) {
    try {
      const reportData = {
        ...errorContext,
        timestamp: errorContext.timestamp.toISOString(),
      }

      // 에러 리포팅 API 호출 (실제 구현 시 활성화)
      // await fetch("/api/errors", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(reportData),
      // })

      console.log("Error report sent to server:", reportData)
    } catch (reportError) {
      console.error("Failed to report error to server:", reportError)
    }
  }

  private notifyUser(errorContext: ErrorContext) {
    // 중요하지 않은 에러는 사용자에게 알리지 않음
    if (this.shouldNotifyUser(errorContext)) {
      this.showUserNotification(errorContext)
    }
  }

  private shouldNotifyUser(errorContext: ErrorContext): boolean {
    // 네트워크 에러나 중요한 JavaScript 에러만 사용자에게 알림
    return (
      errorContext.errorType === "network" ||
      (errorContext.errorType === "javascript" &&
        !errorContext.message.includes("ResizeObserver"))
    )
  }

  private showUserNotification(errorContext: ErrorContext) {
    const message = this.getUserFriendlyMessage(errorContext)
    const type = this.getNotificationType(errorContext)

    this.notification.show(message, type, 6000)
  }

  private getNotificationType(
    errorContext: ErrorContext
  ): "error" | "warning" | "info" {
    switch (errorContext.errorType) {
      case "network":
        return "error"
      case "javascript":
        return "warning"
      case "resource":
        return "info"
      case "promise":
        return "warning"
      default:
        return "error"
    }
  }

  private getUserFriendlyMessage(errorContext: ErrorContext): string {
    switch (errorContext.errorType) {
      case "network":
        return "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요."
      case "resource":
        return "일부 리소스를 불러오는데 실패했습니다."
      case "javascript":
        return "애플리케이션에서 오류가 발생했습니다. 페이지를 새로고침해주세요."
      case "promise":
        return "작업 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      default:
        return "예상치 못한 오류가 발생했습니다."
    }
  }

  private getUserId(): string | undefined {
    try {
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        return userData.id || userData.email
      }
    } catch {
      // 파싱 에러 무시
    }
    return undefined
  }

  private getSessionId(): string | undefined {
    return sessionStorage.getItem("sessionId") || undefined
  }

  // 공개 메서드들
  public getErrorHistory(): ErrorContext[] {
    return [...this.errorHistory]
  }

  public clearErrorHistory(): void {
    this.errorHistory = []
  }

  public updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public manualErrorReport(
    error: Error,
    context?: Partial<ErrorContext>
  ): void {
    const errorContext: ErrorContext = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      errorType: "javascript",
      ...context,
    }

    this.processError(errorContext, error)
  }

  public showNotification(
    message: string,
    type?: "error" | "warning" | "info",
    duration?: number
  ) {
    this.notification.show(message, type, duration)
  }

  public clearNotifications() {
    this.notification.clear()
  }
}

// 싱글톤 인스턴스
export const globalErrorHandler = new GlobalErrorHandler()

// 편의 함수들
export const reportError = (error: Error, context?: Partial<ErrorContext>) => {
  globalErrorHandler.manualErrorReport(error, context)
}

export const getErrorHistory = () => globalErrorHandler.getErrorHistory()

export const clearErrorHistory = () => globalErrorHandler.clearErrorHistory()

export const showErrorNotification = (
  message: string,
  type?: "error" | "warning" | "info",
  duration?: number
) => {
  globalErrorHandler.showNotification(message, type, duration)
}

export default globalErrorHandler
