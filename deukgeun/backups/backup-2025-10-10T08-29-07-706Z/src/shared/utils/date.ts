// ============================================================================
// 날짜 관련 유틸리티 함수들
// ============================================================================

import type { DateString } from "../types"

// 날짜 포맷 옵션
export interface DateFormatOptions {
  year?: "numeric" | "2-digit"
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow"
  day?: "numeric" | "2-digit"
  hour?: "numeric" | "2-digit"
  minute?: "numeric" | "2-digit"
  second?: "numeric" | "2-digit"
  weekday?: "long" | "short" | "narrow"
  timeZone?: string
}

// 현재 날짜를 ISO 문자열로 반환
function getCurrentDateString(): DateString {
  return new Date().toISOString()
}

// 날짜를 ISO 문자열로 변환
function toDateString(date: Date): DateString {
  return date.toISOString()
}

// ISO 문자열을 Date 객체로 변환
function fromDateString(dateString: DateString): Date {
  return new Date(dateString)
}

// 날짜 포맷팅
function formatDate(
  date: Date | DateString,
  options: DateFormatOptions = {}
): string {
  const dateObj = typeof date === "string" ? fromDateString(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  }

  return new Intl.DateTimeFormat("ko-KR", defaultOptions).format(dateObj)
}

// 시간 포맷팅
function formatTime(
  date: Date | DateString,
  options: DateFormatOptions = {}
): string {
  const dateObj = typeof date === "string" ? fromDateString(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }

  return new Intl.DateTimeFormat("ko-KR", defaultOptions).format(dateObj)
}

// 날짜와 시간 포맷팅
function formatDateTime(
  date: Date | DateString,
  options: DateFormatOptions = {}
): string {
  const dateObj = typeof date === "string" ? fromDateString(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }

  return new Intl.DateTimeFormat("ko-KR", defaultOptions).format(dateObj)
}

// 상대적 시간 표시 (예: "3일 전", "1시간 전")
function formatRelativeTime(
  date: Date | DateString,
  baseDate: Date | DateString = new Date()
): string {
  const dateObj = typeof date === "string" ? fromDateString(date) : date
  const baseObj =
    typeof baseDate === "string" ? fromDateString(baseDate) : baseDate

  const diffInMs = baseObj.getTime() - dateObj.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInYears > 0) {
    return `${diffInYears}년 전`
  }
  if (diffInMonths > 0) {
    return `${diffInMonths}개월 전`
  }
  if (diffInWeeks > 0) {
    return `${diffInWeeks}주 전`
  }
  if (diffInDays > 0) {
    return `${diffInDays}일 전`
  }
  if (diffInHours > 0) {
    return `${diffInHours}시간 전`
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes}분 전`
  }
  if (diffInSeconds > 0) {
    return `${diffInSeconds}초 전`
  }

  return "방금 전"
}

// 날짜가 유효한지 확인
function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

// 날짜 문자열이 유효한지 확인
function isValidDateString(
  dateString: string
): dateString is DateString {
  const date = new Date(dateString)
  return isValidDate(date)
}

// 두 날짜 간의 차이를 계산 (일 단위)
function getDaysDifference(
  date1: Date | DateString,
  date2: Date | DateString
): number {
  const d1 = typeof date1 === "string" ? fromDateString(date1) : date1
  const d2 = typeof date2 === "string" ? fromDateString(date2) : date2

  const diffInMs = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24))
}

// 날짜가 오늘인지 확인
function isToday(date: Date | DateString): boolean {
  const dateObj = typeof date === "string" ? fromDateString(date) : date
  const today = new Date()

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

// 날짜가 어제인지 확인
function isYesterday(date: Date | DateString): boolean {
  const dateObj = typeof date === "string" ? fromDateString(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  )
}

// 날짜가 이번 주인지 확인
function isThisWeek(date: Date | DateString): boolean {
  const dateObj = typeof date === "string" ? fromDateString(date) : date
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return dateObj >= startOfWeek && dateObj <= endOfWeek
}

// 날짜가 이번 달인지 확인
function isThisMonth(date: Date | DateString): boolean {
  const dateObj = typeof date === "string" ? fromDateString(date) : date
  const today = new Date()

  return (
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

// 날짜가 이번 년도인지 확인
function isThisYear(date: Date | DateString): boolean {
  const dateObj = typeof date === "string" ? fromDateString(date) : date
  const today = new Date()

  return dateObj.getFullYear() === today.getFullYear()
}

// Export all functions
export {
  getCurrentDateString,
  toDateString,
  fromDateString,
  formatDate,
  getDaysDifference,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
}