// ============================================================================
// Date Utilities - 날짜 파싱 및 포맷팅 유틸리티
// ============================================================================

/**
 * 다양한 타입의 날짜 값을 Date 객체로 변환
 */
export function parseDate(dateValue: unknown): Date | null {
  if (!dateValue) return null
  
  try {
    // Date 객체인 경우
    if (dateValue && typeof dateValue === "object" && (dateValue as any).constructor === Date) {
      return dateValue as Date
    }
    // 문자열인 경우
    else if (typeof dateValue === "string" && dateValue.trim() !== '') {
      return new Date(dateValue)
    }
    // 숫자인 경우
    else if (typeof dateValue === "number" && !isNaN(dateValue)) {
      return new Date(dateValue)
    }
    // 기타 타입
    else {
      return new Date(String(dateValue))
    }
  } catch {
    return null
  }
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export function formatDateToKorean(dateValue: unknown): string | null {
  const date = parseDate(dateValue)
  if (!date || isNaN(date.getTime())) return null
  
  // 유효한 날짜 범위 확인 (1900-2100년)
  const year = date.getFullYear()
  if (year < 1900 || year > 2100) return null
  
  try {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  } catch {
    return null
  }
}

/**
 * 날짜 유효성 검증
 */
export function isValidDate(dateValue: unknown): boolean {
  const date = parseDate(dateValue)
  if (!date) return false
  
  const year = date.getFullYear()
  return !isNaN(date.getTime()) && year >= 1900 && year <= 2100
}

