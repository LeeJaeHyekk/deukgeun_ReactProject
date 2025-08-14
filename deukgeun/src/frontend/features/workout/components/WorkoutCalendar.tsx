import React from "react"
import "./WorkoutCalendar.css"

interface WorkoutCalendarProps {
  sessions?: any[]
}

export function WorkoutCalendar({ sessions }: WorkoutCalendarProps) {
  // 실제 구현에서는 실제 캘린더 기능을 구현할 수 있습니다.
  // 여기서는 간단한 플레이스홀더를 만듭니다.

  return (
    <div className="workout-calendar">
      <div className="calendar-placeholder">
        <div className="calendar-icon">📅</div>
        <p className="calendar-message">운동 캘린더가 준비 중입니다</p>
        <p className="calendar-description">
          운동 일정을 기록하면 여기에 캘린더가 표시됩니다.
        </p>
      </div>
    </div>
  )
}
