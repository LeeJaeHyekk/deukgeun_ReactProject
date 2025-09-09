import React from "react"
import type { WorkoutReminder } from "../types"
import "./ReminderCard.css"

interface ReminderCardProps {
  reminder: WorkoutReminder
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}

export function ReminderCard({
  reminder,
  onEdit,
  onToggle,
  onDelete,
}: ReminderCardProps) {
  return (
    <div
      className={`reminder-card ${reminder.isActive ? "active" : "inactive"}`}
    >
      <div className="reminder-header">
        <h4 className="reminder-title">{reminder.title}</h4>
        <div className="reminder-status">
          <span
            className={`status-indicator ${reminder.isActive ? "active" : "inactive"}`}
          >
            {reminder.isActive ? "활성" : "비활성"}
          </span>
        </div>
      </div>

      {reminder.description && (
        <p className="reminder-description">{reminder.description}</p>
      )}

      <div className="reminder-details">
        <div className="detail-item">
          <span className="detail-label">시간:</span>
          <span className="detail-value">{reminder.time}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">반복:</span>
          <span className="detail-value">
            {reminder.days ? reminder.days.join(", ") : "설정되지 않음"}
          </span>
        </div>
      </div>

      <div className="reminder-actions">
        <button onClick={onToggle} className="toggle-btn">
          {reminder.isActive ? "비활성화" : "활성화"}
        </button>
        <button onClick={onEdit} className="edit-btn">
          수정
        </button>
        <button onClick={onDelete} className="delete-btn">
          삭제
        </button>
      </div>
    </div>
  )
}
