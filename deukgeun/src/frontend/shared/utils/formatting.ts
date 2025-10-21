/**
 * 데이터 포맷팅 유틸리티 함수들
 */

// ============================================================================
// 숫자 포맷팅
// ============================================================================

/**
 * 숫자를 천 단위로 구분하여 포맷팅
 */
export function formatNumber(
  num: number,
  options?: {
    decimals?: number
    locale?: string
    currency?: string
  }
): string {
  const { decimals = 0, locale = 'ko-KR', currency } = options || {}
  
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * 큰 숫자를 K, M, B 단위로 축약
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`
  return `${(num / 1000000000).toFixed(1)}B`
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercentage(
  value: number,
  total: number,
  decimals: number = 1
): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

// ============================================================================
// 날짜/시간 포맷팅
// ============================================================================

/**
 * 날짜를 상대적 시간으로 포맷팅 (예: "2시간 전", "3일 전")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'ko-KR'
): string {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
  }
}

/**
 * 날짜를 지정된 형식으로 포맷팅
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'time' | 'datetime' = 'short',
  locale: string = 'ko-KR'
): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    }
  }
  
  return new Intl.DateTimeFormat(locale, formatOptions[format]).format(targetDate)
}

/**
 * 시간을 HH:MM:SS 형식으로 포맷팅
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// ============================================================================
// 텍스트 포맷팅
// ============================================================================

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표 추가
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * 텍스트의 첫 글자를 대문자로 변환
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * 카멜케이스를 공백으로 구분된 텍스트로 변환
 */
export function camelCaseToWords(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

/**
 * 스네이크케이스를 카멜케이스로 변환
 */
export function snakeCaseToCamelCase(text: string): string {
  return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 케밥케이스를 카멜케이스로 변환
 */
export function kebabCaseToCamelCase(text: string): string {
  return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// ============================================================================
// 파일 크기 포맷팅
// ============================================================================

/**
 * 바이트를 읽기 쉬운 파일 크기로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// ============================================================================
// URL 포맷팅
// ============================================================================

/**
 * URL을 읽기 쉬운 형태로 변환
 */
export function formatUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname + urlObj.pathname
  } catch {
    return url
  }
}

/**
 * URL에서 쿼리 파라미터 제거
 */
export function removeQueryParams(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.origin + urlObj.pathname
  } catch {
    return url
  }
}

// ============================================================================
// 색상 포맷팅
// ============================================================================

/**
 * HEX 색상을 RGB로 변환
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * RGB를 HEX로 변환
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// ============================================================================
// 배열 포맷팅
// ============================================================================

/**
 * 배열을 읽기 쉬운 문자열로 변환
 */
export function formatArray<T>(
  arr: T[],
  separator: string = ', ',
  maxItems: number = 3
): string {
  if (arr.length === 0) return ''
  if (arr.length <= maxItems) return arr.join(separator)
  
  const visibleItems = arr.slice(0, maxItems)
  const remainingCount = arr.length - maxItems
  
  return `${visibleItems.join(separator)} 외 ${remainingCount}개`
}

/**
 * 배열을 그룹으로 나누어 포맷팅
 */
export function formatGroupedArray<T>(
  arr: T[],
  groupSize: number = 3,
  groupSeparator: string = ' | '
): string {
  const groups: T[][] = []
  for (let i = 0; i < arr.length; i += groupSize) {
    groups.push(arr.slice(i, i + groupSize))
  }
  
  return groups.map(group => group.join(', ')).join(groupSeparator)
}
