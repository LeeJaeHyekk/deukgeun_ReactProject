import React, { useState } from "react"
import { ReminderCard } from "../cards/ReminderCard"
import { CreateReminderModal } from "../modals/CreateReminderModal"
import { Button } from "../ui/Button"
import { WorkoutReminderDTO } from "../../types"

interface WorkoutRemindersSectionProps {
  reminders: WorkoutReminderDTO[]
  onToggleReminder: (reminderId: number, isActive: boolean) => void
  onEditReminder: (reminderId: number, reminderData?: any) => void
  onDeleteReminder: (reminderId: number) => void
  onCreateReminder: (
    reminderData: Omit<WorkoutReminderDTO, "id" | "createdAt" | "updatedAt">
  ) => void
}

export function WorkoutRemindersSection({
  reminders,
  onToggleReminder,
  onEditReminder,
  onDeleteReminder,
  onCreateReminder,
}: WorkoutRemindersSectionProps) {
  const [isAddingReminder, setIsAddingReminder] = useState(false)

  const activeReminders = reminders.filter(reminder => reminder.isActive)
  const inactiveReminders = reminders.filter(reminder => !reminder.isActive)

  const handleCreateReminder = (
    reminderData: Omit<WorkoutReminderDTO, "id" | "createdAt" | "updatedAt">
  ) => {
    onCreateReminder(reminderData)
    setIsAddingReminder(false)
  }

  return (
    <section className="workout-section">
      <div className="workout-section-header">
        <div>
          <h2 className="workout-section-title">운동 알림</h2>
          <p className="workout-section-description">
            운동 일정을 잊지 않도록 알림을 설정하세요
          </p>
        </div>
        <Button onClick={() => setIsAddingReminder(true)} variant="primary">
          알림 추가
        </Button>
      </div>

      <div className="reminders-content">
        {reminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>알림이 없습니다</h3>
            <p>운동 일정을 잊지 않도록 알림을 설정해보세요</p>
            <Button onClick={() => setIsAddingReminder(true)} variant="primary">
              첫 알림 만들기
            </Button>
          </div>
        ) : (
          <>
            {activeReminders.length > 0 && (
              <div className="reminders-group">
                <h3 className="group-title">
                  활성 알림 ({activeReminders.length})
                </h3>
                <div className="card-list">
                  {activeReminders.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onToggle={onToggleReminder}
                      onEdit={onEditReminder}
                      onDelete={onDeleteReminder}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactiveReminders.length > 0 && (
              <div className="reminders-group">
                <h3 className="group-title">
                  비활성 알림 ({inactiveReminders.length})
                </h3>
                <div className="card-list">
                  {inactiveReminders.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onToggle={onToggleReminder}
                      onEdit={onEditReminder}
                      onDelete={onDeleteReminder}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateReminderModal
        isOpen={isAddingReminder}
        onClose={() => setIsAddingReminder(false)}
        onCreateReminder={handleCreateReminder}
      />
    </section>
  )
}
