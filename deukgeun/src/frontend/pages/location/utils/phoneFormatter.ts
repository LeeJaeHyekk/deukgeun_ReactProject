/**
 * 전화번호 포맷팅 유틸리티
 * 한국 전화번호 체계에 맞춘 정교한 포맷팅
 */

export const formatPhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return phone
  
  // 이미 하이픈이 있는 경우 그대로 반환
  if (phone.includes('-')) return phone
  
  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '')
  
  // 빈 문자열이거나 너무 짧은 경우
  if (numbers.length < 7) return phone
  
  // 한국 전화번호 체계에 따른 포맷팅
  if (numbers.length === 11) {
    // 010, 011, 016, 017, 018, 019 (휴대폰)
    if (numbers.startsWith('010') || numbers.startsWith('011') || 
        numbers.startsWith('016') || numbers.startsWith('017') || 
        numbers.startsWith('018') || numbers.startsWith('019')) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
    }
  }
  
  if (numbers.length === 10) {
    // 02 (서울) - 2-4-4 형태
    if (numbers.startsWith('02')) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`
    }
    // 지역번호 (031, 032, 033, 041, 042, 043, 051, 052, 053, 054, 055, 061, 062, 063, 064)
    if (numbers.startsWith('031') || numbers.startsWith('032') || numbers.startsWith('033') ||
        numbers.startsWith('041') || numbers.startsWith('042') || numbers.startsWith('043') ||
        numbers.startsWith('051') || numbers.startsWith('052') || numbers.startsWith('053') ||
        numbers.startsWith('054') || numbers.startsWith('055') ||
        numbers.startsWith('061') || numbers.startsWith('062') || numbers.startsWith('063') ||
        numbers.startsWith('064')) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
    }
  }
  
  if (numbers.length === 9) {
    // 02 (서울) - 2-3-4 형태 (구형)
    if (numbers.startsWith('02')) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`
    }
  }
  
  // 기타 경우: 뒤에서부터 4자리씩 끊어서 하이픈 추가
  if (numbers.length > 4) {
    let result = numbers
    let position = numbers.length - 4
    
    while (position > 0) {
      result = result.slice(0, position) + '-' + result.slice(position)
      position -= 4
    }
    
    return result
  }
  
  return phone
}

/**
 * 전화번호 유효성 검사
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false
  
  const numbers = phone.replace(/\D/g, '')
  return numbers.length >= 7 && numbers.length <= 11
}
