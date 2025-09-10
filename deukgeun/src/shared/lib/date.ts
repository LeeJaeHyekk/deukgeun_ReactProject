// ============================================================================
// Date utilities
// ============================================================================

export const date = {
  // Format date to Korean format (YYYY년 MM월 DD일)
  formatKorean: (date: Date): string => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}년 ${month}월 ${day}일`
  },

  // Format date to ISO string
  formatISO: (date: Date): string => {
    return date.toISOString()
  },

  // Format date to readable string
  formatReadable: (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  },

  // Format date to short string
  formatShort: (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  },

  // Format time to readable string
  formatTime: (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  // Format datetime to readable string
  formatDateTime: (date: Date): string => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  // Get relative time (e.g., "2시간 전", "3일 전")
  getRelativeTime: (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (seconds < 60) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    if (weeks < 4) return `${weeks}주 전`
    if (months < 12) return `${months}개월 전`
    return `${years}년 전`
  },

  // Check if date is today
  isToday: (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  },

  // Check if date is yesterday
  isYesterday: (date: Date): boolean => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  },

  // Add days to date
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  // Add months to date
  addMonths: (date: Date, months: number): Date => {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  },

  // Add years to date
  addYears: (date: Date, years: number): Date => {
    const result = new Date(date)
    result.setFullYear(result.getFullYear() + years)
    return result
  },

  // Get start of day
  startOfDay: (date: Date): Date => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  },

  // Get end of day
  endOfDay: (date: Date): Date => {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  },

  // Get start of week
  startOfWeek: (date: Date): Date => {
    const result = new Date(date)
    const day = result.getDay()
    const diff = result.getDate() - day
    result.setDate(diff)
    return date.startOfDay(result)
  },

  // Get end of week
  endOfWeek: (date: Date): Date => {
    const result = new Date(date)
    const day = result.getDay()
    const diff = result.getDate() + (6 - day)
    result.setDate(diff)
    return date.endOfDay(result)
  },
}
