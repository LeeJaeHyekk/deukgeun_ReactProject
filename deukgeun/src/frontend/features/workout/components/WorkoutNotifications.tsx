import React from 'react'
import styles from './WorkoutNotifications.module.css'

interface Notification {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

interface WorkoutNotificationsProps {
  notifications: Notification[]
  onRemove: (id: string) => void
  className?: string
}

/**
 * 워크아웃 알림 컴포넌트
 */
export function WorkoutNotifications({ 
  notifications, 
  onRemove,
  className 
}: WorkoutNotificationsProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <div className={`${styles.notificationsContainer} ${className || ''}`}>
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`${styles.notification} ${styles[notification.type || 'info']}`}
        >
          <div className={styles.notificationContent}>
            <span className={styles.notificationMessage}>
              {notification.message}
            </span>
            <button
              className={styles.notificationClose}
              onClick={() => onRemove(notification.id)}
              aria-label="알림 닫기"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
