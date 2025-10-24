// ============================================================================
// Error Message Component
// ============================================================================

import React, { useCallback } from "react"
import { getErrorMessage, getErrorIcon, shouldAutoDismiss } from "../../utils/errorHandling"
import { safeErrorLog } from "../../utils/errorHandling"
import "./ErrorMessage.css"

interface ErrorMessageProps {
  error: any
  onDismiss: () => void
  autoDismiss?: boolean
  className?: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onDismiss,
  autoDismiss = true,
  className = "",
}) => {
  const handleDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  // 에러 로깅
  React.useEffect(() => {
    if (error) {
      safeErrorLog(error, 'ErrorMessage')
    }
  }, [error])

  // 자동 해제
  React.useEffect(() => {
    if (error && autoDismiss && shouldAutoDismiss(error)) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [error, autoDismiss, onDismiss])

  if (!error) return null

  const message = getErrorMessage(error)
  const icon = getErrorIcon(error)

  return (
    <div className={`error-message-container ${className}`}>
      <div className="error-message">
        <span className="error-icon">{icon}</span>
        <span className="error-text">{message}</span>
        <button 
          className="error-close" 
          onClick={handleDismiss}
          aria-label="에러 메시지 닫기"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
