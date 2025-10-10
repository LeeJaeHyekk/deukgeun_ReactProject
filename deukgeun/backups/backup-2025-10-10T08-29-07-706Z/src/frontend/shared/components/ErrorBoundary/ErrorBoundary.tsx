// ============================================================================
// 에러 바운더리 컴포넌트
// ============================================================================

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 에러가 발생했을 때 상태를 업데이트
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 및 상태 업데이트
    this.setState({
      error,
      errorInfo
    })

    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 외부 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 에러 리포팅 (선택적)
    this.reportError(error, errorInfo)
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // 에러가 있고 resetKeys가 변경되었을 때 에러 상태 리셋
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some((key, index) => 
          key !== prevProps.resetKeys?.[index]
        )
        if (hasResetKeyChanged) {
          this.resetErrorBoundary()
        }
      }
    }

    // resetOnPropsChange가 true일 때 props 변경 시 에러 상태 리셋
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 에러 리포팅 서비스에 전송 (예: Sentry, LogRocket 등)
    try {
      // 개발 환경에서는 콘솔에 상세 정보 출력
      if (import.meta.env.DEV) {
        console.group('🚨 Error Boundary Report')
        console.error('Error:', error)
        console.error('Error Info:', errorInfo)
        console.error('Component Stack:', errorInfo.componentStack)
        console.groupEnd()
      }

      // 프로덕션에서는 에러 리포팅 서비스로 전송
      if (import.meta.env.PROD) {
        // TODO: 실제 에러 리포팅 서비스 연동
        // 예: Sentry.captureException(error, { extra: errorInfo })
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      })
    }, 100)
  }

  private handleRetry = () => {
    this.resetErrorBoundary()
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    const { hasError, error, errorInfo, errorId } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // 커스텀 fallback이 있으면 사용
      if (fallback) {
        return fallback
      }

      // 기본 에러 UI 렌더링
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo as any}
          errorId={errorId}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      )
    }

    return children
  }
}

// HOC로 에러 바운더리 래핑
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// 훅으로 에러 바운더리 상태 접근
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // 에러 리포팅
    if (import.meta.env.PROD) {
      // TODO: 에러 리포팅 서비스로 전송
    }
  }
}
