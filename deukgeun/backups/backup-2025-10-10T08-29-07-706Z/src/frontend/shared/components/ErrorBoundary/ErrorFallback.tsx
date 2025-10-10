// ============================================================================
// 에러 폴백 컴포넌트
// ============================================================================

import React, { useState } from 'react'
import './ErrorFallback.css'

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  onRetry: () => void
  onReload: () => void
}

interface ErrorInfo {
  componentStack: string
}

export function ErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReload
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false)

  const isDevelopment = import.meta.env.DEV

  return (
    <div className="error-fallback">
      <div className="error-fallback__container">
        <div className="error-fallback__icon">⚠️</div>
        
        <div className="error-fallback__content">
          <h2 className="error-fallback__title">
            문제가 발생했습니다
          </h2>
          
          <p className="error-fallback__message">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>

          {errorId && (
            <p className="error-fallback__error-id">
              오류 ID: <code>{errorId}</code>
            </p>
          )}

          <div className="error-fallback__actions">
            <button
              className="error-fallback__button error-fallback__button--primary"
              onClick={onRetry}
            >
              다시 시도
            </button>
            
            <button
              className="error-fallback__button error-fallback__button--secondary"
              onClick={onReload}
            >
              페이지 새로고침
            </button>
          </div>

          {isDevelopment && (
            <div className="error-fallback__dev-tools">
              <button
                className="error-fallback__toggle-details"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
              </button>

              {showDetails && (
                <div className="error-fallback__details">
                  <div className="error-fallback__detail-section">
                    <h4>에러 메시지:</h4>
                    <pre className="error-fallback__code">
                      {error?.message || 'Unknown error'}
                    </pre>
                  </div>

                  {error?.stack && (
                    <div className="error-fallback__detail-section">
                      <h4>스택 트레이스:</h4>
                      <pre className="error-fallback__code">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div className="error-fallback__detail-section">
                      <h4>컴포넌트 스택:</h4>
                      <pre className="error-fallback__code">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 특정 컴포넌트용 에러 폴백
export function ComponentErrorFallback({
  componentName,
  onRetry
}: {
  componentName: string
  onRetry: () => void
}) {
  return (
    <div className="component-error-fallback">
      <div className="component-error-fallback__container">
        <div className="component-error-fallback__icon">🔧</div>
        
        <div className="component-error-fallback__content">
          <h3 className="component-error-fallback__title">
            {componentName} 컴포넌트 오류
          </h3>
          
          <p className="component-error-fallback__message">
            이 컴포넌트에서 문제가 발생했습니다.
          </p>

          <button
            className="component-error-fallback__button"
            onClick={onRetry}
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}

// API 에러용 폴백
export function ApiErrorFallback({
  error,
  onRetry
}: {
  error: Error
  onRetry: () => void
}) {
  const isNetworkError = error.message.includes('Network') || error.message.includes('fetch')
  const isServerError = error.message.includes('500') || error.message.includes('Server')

  return (
    <div className="api-error-fallback">
      <div className="api-error-fallback__container">
        <div className="api-error-fallback__icon">
          {isNetworkError ? '🌐' : isServerError ? '🖥️' : '⚠️'}
        </div>
        
        <div className="api-error-fallback__content">
          <h3 className="api-error-fallback__title">
            {isNetworkError ? '네트워크 오류' : 
             isServerError ? '서버 오류' : 'API 오류'}
          </h3>
          
          <p className="api-error-fallback__message">
            {isNetworkError ? '인터넷 연결을 확인해주세요.' :
             isServerError ? '서버에 일시적인 문제가 있습니다.' :
             '데이터를 불러오는 중 오류가 발생했습니다.'}
          </p>

          <button
            className="api-error-fallback__button"
            onClick={onRetry}
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}
