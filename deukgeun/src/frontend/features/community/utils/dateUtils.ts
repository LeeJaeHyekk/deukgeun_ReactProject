/**
 * 날짜 관련 유틸리티 함수들
 */

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return "방금 전"
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}시간 전`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}일 전`
  } else {
    return date.toLocaleDateString()
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}
