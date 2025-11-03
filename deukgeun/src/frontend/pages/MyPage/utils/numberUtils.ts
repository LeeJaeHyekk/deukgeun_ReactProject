// ============================================================================
// Number Utilities - 숫자 포맷팅 및 검증 유틸리티
// ============================================================================

/**
 * 숫자를 안전하게 파싱 (NaN 체크 포함)
 */
export function safeParseNumber(value: unknown): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return Math.max(0, Math.floor(value))
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) {
      return Math.max(0, Math.floor(parsed))
    }
  }
  
  return 0
}

/**
 * 숫자를 한국어 형식으로 포맷팅 (천 단위 구분)
 */
export function formatNumber(num: number): string {
  try {
    if (typeof num !== 'number' || isNaN(num)) return '0'
    return Math.floor(Math.max(0, num)).toLocaleString("ko-KR")
  } catch {
    return '0'
  }
}

/**
 * 숫자 타입 검증 및 정규화
 */
export function validateAndNormalizeNumber(value: unknown): number {
  return safeParseNumber(value)
}

