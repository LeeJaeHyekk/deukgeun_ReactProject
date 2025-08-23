import React, { Component, ErrorInfo, ReactNode } from "react"
import ErrorPage from "./ErrorPage"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러가 발생하면 상태를 업데이트하여 다음 렌더링에서 폴백 UI를 표시
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    // 에러 정보를 상태에 저장
    this.setState({ error, errorInfo })

    // 사용자 정의 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 에러 리포팅 (선택사항)
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 에러 리포팅 로직 (예: Sentry, LogRocket 등)
    try {
      // 개발 환경에서는 콘솔에 출력
      if (import.meta.env.DEV) {
        console.group("🚨 Error Boundary Report")
        console.error("Error:", error)
        console.error("Error Info:", errorInfo)
        console.error("Component Stack:", errorInfo.componentStack)
        console.groupEnd()
      }

      // 프로덕션 환경에서는 에러 리포팅 서비스로 전송
      if (import.meta.env.PROD) {
        // 예시: Sentry로 에러 전송
        // Sentry.captureException(error, { extra: errorInfo })

        // 또는 자체 에러 로깅 API 호출
        this.sendErrorToServer(error, errorInfo)
      }
    } catch (reportingError) {
      console.error("Error reporting failed:", reportingError)
    }
  }

  private sendErrorToServer = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        // 추가 컨텍스트 정보
        context: {
          userId: localStorage.getItem("userId") || "anonymous",
          sessionId: sessionStorage.getItem("sessionId") || "unknown",
        },
      }

      // 에러 리포팅 API 호출 (실제 구현 시 활성화)
      // await fetch("/api/errors", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(errorReport),
      // })

      console.log("Error report prepared:", errorReport)
    } catch (sendError) {
      console.error("Failed to send error to server:", sendError)
    }
  }

  private handleRetry = () => {
    // 에러 상태를 리셋하고 컴포넌트를 다시 렌더링
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // 사용자 정의 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 에러 페이지 표시
      return (
        <ErrorPage
          statusCode={500}
          title="애플리케이션 오류"
          message="예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요."
          showRetryButton={true}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

// 함수형 컴포넌트를 위한 에러 바운더리 래퍼
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// 훅 기반 에러 바운더리 (함수형 컴포넌트용)
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback(
    (error: Error, errorInfo: ErrorInfo) => {
      console.error("useErrorBoundary caught an error:", error, errorInfo)
      setError(error)
    },
    []
  )

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    resetError,
  }
}

// 에러 바운더리 컨텍스트
interface ErrorBoundaryContextType {
  reportError: (error: Error, errorInfo?: ErrorInfo) => void
  clearError: () => void
  hasError: boolean
}

const ErrorBoundaryContext =
  React.createContext<ErrorBoundaryContextType | null>(null)

export function ErrorBoundaryProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = React.useState<
    Array<{ error: Error; errorInfo?: ErrorInfo; timestamp: Date }>
  >([])

  const reportError = React.useCallback(
    (error: Error, errorInfo?: ErrorInfo) => {
      setErrors(prev => [...prev, { error, errorInfo, timestamp: new Date() }])
    },
    []
  )

  const clearError = React.useCallback(() => {
    setErrors([])
  }, [])

  const value = React.useMemo(
    () => ({
      reportError,
      clearError,
      hasError: errors.length > 0,
    }),
    [reportError, clearError, errors.length]
  )

  return (
    <ErrorBoundaryContext.Provider value={value}>
      {children}
    </ErrorBoundaryContext.Provider>
  )
}

export function useErrorBoundaryContext() {
  const context = React.useContext(ErrorBoundaryContext)
  if (!context) {
    throw new Error(
      "useErrorBoundaryContext must be used within ErrorBoundaryProvider"
    )
  }
  return context
}

export default ErrorBoundary
