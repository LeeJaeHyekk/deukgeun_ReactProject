// ============================================================================
// Empty State Component
// ============================================================================

import React from "react"
import { UI_TEXT } from "../../utils/constants"
import "./EmptyState.css"

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "🏋️",
  title = UI_TEXT.NO_RESULTS,
  description = UI_TEXT.NO_RESULTS_DESCRIPTION,
  actionText = UI_TEXT.RESET_FILTERS,
  onAction,
  className = "",
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {onAction && (
        <button 
          className="empty-action" 
          onClick={onAction}
          type="button"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
