import React, { useState } from "react"
import { WorkoutReminderDTO } from "../../types"
import { Button } from "../ui/Button"

interface CreateReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateReminder: (reminderData: Omit<WorkoutReminderDTO, "id" | "createdAt" | "updatedAt">) => void
}

export function CreateReminderModal({
  isOpen,
  onClose,
  onCreateReminder,
}: CreateReminderModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    message: "",
    time: "09:00",
    days: [] as string[],
    repeatInterval: "weekly" as const,
    reminderType: "push" as const,
    advanceNotice: 15,
    snoozeTime: 5,
    notes: "",
  })

  const daysOfWeek = [
    { value: "monday", label: "월요일" },
    { value: "tuesday", label: "화요일" },
    { value: "wednesday", label: "수요일" },
    { value: "thursday", label: "목요일" },
    { value: "friday", label: "금요일" },
    { value: "saturday", label: "토요일" },
    { value: "sunday", label: "일요일" },
  ]

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim() && formData.days.length > 0) {
      onCreateReminder({
        ...formData,
        isActive: true,
      })
      onClose()
      setFormData({
        title: "",
        description: "",
        message: "",
        time: "09:00",
        days: [],
        repeatInterval: "weekly",
        reminderType: "push",
        advanceNotice: 15,
        snoozeTime: 5,
        notes: "",
      })
    }
  }

  const quickTimePresets = [
    { value: "06:00", label: "아침 6시" },
    { value: "07:00", label: "아침 7시" },
    { value: "08:00", label: "아침 8시" },
    { value: "09:00", label: "아침 9시" },
    { value: "18:00", label: "저녁 6시" },
    { value: "19:00", label: "저녁 7시" },
    { value: "20:00", label: "저녁 8시" },
    { value: "21:00", label: "저녁 9시" },
  ]

  const quickDayPresets = [
    { label: "평일", days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
    { label: "주말", days: ["saturday", "sunday"] },
    { label: "매일", days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] },
  ]

  const handleQuickDayPreset = (presetDays: string[]) => {
    setFormData(prev => ({
      ...prev,
      days: presetDays,
    }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>새 알림 생성</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="reminderTitle" className="required">알림 제목 *</label>
            <input
              id="reminderTitle"
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 운동 알림"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reminderDescription">설명</label>
            <textarea
              id="reminderDescription"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="알림에 대한 설명을 입력하세요..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reminderMessage" className="required">알림 메시지 *</label>
            <textarea
              id="reminderMessage"
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              placeholder="예: 운동할 시간입니다!"
              rows={2}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reminderTime">알림 시간</label>
            <input
              id="reminderTime"
              type="time"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            />
            <div className="quick-time-presets">
              {quickTimePresets.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  className="quick-preset-button"
                  onClick={() => setFormData({ ...formData, time: preset.value })}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>요일 선택 *</label>
            <div className="days-selection">
              {daysOfWeek.map(day => (
                <label key={day.value} className="day-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.days.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                  />
                  <span className="day-label">{day.label}</span>
                </label>
              ))}
            </div>
            <div className="quick-day-presets">
              {quickDayPresets.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  className="quick-preset-button"
                  onClick={() => handleQuickDayPreset(preset.days)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="repeatInterval">반복 주기</label>
            <select
              id="repeatInterval"
              value={formData.repeatInterval}
              onChange={e => setFormData({ ...formData, repeatInterval: e.target.value as any })}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reminderType">알림 타입</label>
            <select
              id="reminderType"
              value={formData.reminderType}
              onChange={e => setFormData({ ...formData, reminderType: e.target.value as any })}
            >
              <option value="push">푸시 알림</option>
              <option value="email">이메일</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="advanceNotice">사전 알림 (분)</label>
              <input
                id="advanceNotice"
                type="number"
                min="0"
                max="60"
                value={formData.advanceNotice}
                onChange={e => setFormData({ ...formData, advanceNotice: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="snoozeTime">다시 알림 (분)</label>
              <input
                id="snoozeTime"
                type="number"
                min="1"
                max="60"
                value={formData.snoozeTime}
                onChange={e => setFormData({ ...formData, snoozeTime: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reminderNotes">메모</label>
            <textarea
              id="reminderNotes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="알림에 대한 추가 메모를 입력하세요..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <Button type="submit" variant="primary" disabled={!formData.title.trim() || formData.days.length === 0}>
              생성
            </Button>
            <Button type="button" onClick={onClose} variant="secondary">
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
