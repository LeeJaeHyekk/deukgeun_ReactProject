// ============================================================================
// Loading Spinner Component
// ============================================================================

import React from "react"
import { UI_TEXT } from "../../utils/constants"
import "./LoadingSpinner.css"

interface LoadingSpinnerProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = UI_TEXT.LOADING,
  size = 'medium',
  className = "",
}) => {
  return (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner ${size}`}></div>
      <p className="loading-text">{message}</p>
    </div>
  )
}
