import React, { useState } from "react"
import { WorkoutReminderDTO } from "../../types"
import { Button } from "../ui/Button"
import { SwitchToggle } from "../ui/SwitchToggle"

interface ReminderCardProps {
  reminder: WorkoutReminderDTO
  onToggle: (reminderId: number, isActive: boolean) => void
  onEdit: (reminderId: number) => void
  onDelete: (reminderId: number) => void
}

export function ReminderCard({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}: ReminderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getDayNames = (days: string[]) => {
    const dayMap: { [key: string]: string } = {
      monday: "월",
      tuesday: "화",
      wednesday: "수",
      thursday: "목",
      friday: "금",
      saturday: "토",
      sunday: "일",
    }
    return days.map(day => dayMap[day] || day).join(", ")
  }

  const getTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getNextReminder = () => {
    const now = new Date()
    const today = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const dayMap: { [key: string]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }

    const reminderTime =
      parseInt(reminder.time.split(":")[0]) * 60 +
      parseInt(reminder.time.split(":")[1])

    // 오늘 해당 시간이 지났는지 확인
    const todayDayName = Object.keys(dayMap).find(key => dayMap[key] === today)
    const isTodayIncluded = reminder.days.includes(todayDayName || "")

    if (isTodayIncluded && currentTime < reminderTime) {
      return "오늘"
    }

    // 다음 알림 날짜 찾기
    for (let i = 1; i <= 7; i++) {
      const nextDay = (today + i) % 7
      const nextDayName = Object.keys(dayMap).find(
        key => dayMap[key] === nextDay
      )

      if (nextDayName && reminder.days.includes(nextDayName)) {
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"]
        return dayNames[nextDay]
      }
    }

    return "다음 주"
  }

  const getStatusText = () => {
    if (!reminder.isActive) return "비활성화"

    const nextReminder = getNextReminder()
    if (nextReminder === "오늘") {
      return "오늘 예정"
    }
    return `${nextReminder}요일 예정`
  }

  const getStatusColor = () => {
    if (!reminder.isActive) return "text-gray-500"

    const nextReminder = getNextReminder()
    if (nextReminder === "오늘") {
      return "text-blue-600"
    }
    return "text-green-600"
  }

  return (
    <div
      className={`reminder-card ${reminder.isActive ? "active" : "inactive"}`}
    >
      <div className="card-header">
        <div className="card-title">
          <h3>{reminder.title}</h3>
          <div className="reminder-status">
            <SwitchToggle
              checked={reminder.isActive}
              onChange={checked => onToggle(reminder.id, checked)}
              size="small"
            />
            <span className={`status-text ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        <div className="card-actions">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
            variant="secondary"
          >
            {isExpanded ? "접기" : "자세히"}
          </Button>
          <Button
            onClick={() => onEdit(reminder.id)}
            size="small"
            variant="secondary"
          >
            수정
          </Button>
          <Button
            onClick={() => onDelete(reminder.id)}
            size="small"
            variant="danger"
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="card-content">
        {reminder.description && (
          <p className="card-description">{reminder.description}</p>
        )}

        <div className="reminder-details">
          <div className="detail-item">
            <span className="detail-label">알림 시간:</span>
            <span className="detail-value">
              {getTimeDisplay(reminder.time)}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">요일:</span>
            <span className="detail-value">{getDayNames(reminder.days)}</span>
          </div>

          {reminder.repeatInterval && (
            <div className="detail-item">
              <span className="detail-label">반복:</span>
              <span className="detail-value">
                {reminder.repeatInterval === "daily" && "매일"}
                {reminder.repeatInterval === "weekly" && "매주"}
                {reminder.repeatInterval === "monthly" && "매월"}
              </span>
            </div>
          )}

          {reminder.reminderType && (
            <div className="detail-item">
              <span className="detail-label">알림 타입:</span>
              <span className="detail-value">
                {reminder.reminderType === "push" && "푸시 알림"}
                {reminder.reminderType === "email" && "이메일"}
                {reminder.reminderType === "sms" && "SMS"}
              </span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="reminder-expanded">
            <div className="expanded-section">
              <h4>알림 설정</h4>
              <div className="setting-item">
                <span className="setting-label">다음 알림:</span>
                <span className="setting-value">
                  {getNextReminder()}요일 {getTimeDisplay(reminder.time)}
                </span>
              </div>

              {reminder.advanceNotice && (
                <div className="setting-item">
                  <span className="setting-label">사전 알림:</span>
                  <span className="setting-value">
                    {reminder.advanceNotice}분 전
                  </span>
                </div>
              )}

              {reminder.snoozeTime && (
                <div className="setting-item">
                  <span className="setting-label">다시 알림:</span>
                  <span className="setting-value">
                    {reminder.snoozeTime}분 후
                  </span>
                </div>
              )}
            </div>

            {reminder.notes && (
              <div className="expanded-section">
                <h4>메모</h4>
                <p className="reminder-notes">{reminder.notes}</p>
              </div>
            )}

            <div className="expanded-section">
              <h4>통계</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">총 알림:</span>
                  <span className="stat-value">
                    {reminder.totalNotifications || 0}회
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">성공률:</span>
                  <span className="stat-value">
                    {reminder.successRate ? `${reminder.successRate}%` : "N/A"}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">마지막 알림:</span>
                  <span className="stat-value">
                    {reminder.lastNotificationTime
                      ? new Date(
                          reminder.lastNotificationTime
                        ).toLocaleDateString("ko-KR")
                      : "없음"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="reminder-message">
          <p className="card-message">{reminder.message}</p>
        </div>
      </div>
    </div>
  )
}
