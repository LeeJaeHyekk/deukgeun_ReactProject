/**
 * 욕설 및 비속어 필터링 유틸리티
 */

// 욕설 및 비속어 목록 (실제 운영에서는 더 포괄적인 목록이 필요)
const PROFANITY_WORDS = [
  // 직접적인 욕설
  '씨발',
  '씨팔',
  '시발',
  '시팔',
  '개새끼',
  '개새기',
  '개쓰레기',
  '개지랄',
  '개년',
  '개놈',
  '병신',
  '븅신',
  '똥',
  '지랄',
  '좆',
  '좃',
  '존나',
  '존내',
  '존맛',
  '존잘',
  '존예',
  '미친',
  '미쳤',
  '미치',
  '빠가',
  '바보',
  '멍청',
  '등신',
  '호구',
  '찐따',
  '찐다',
  '꺼져',
  '꺼지',
  '닥쳐',
  '닥치',
  '죽어',
  '죽어라',
  '죽여',
  '죽이',
  '뒤져',
  '뒤져라',
  '엿먹',
  '엿먹어',
  '엿먹어라',
  '엿드셔',
  '엿드세요',
  '엿드시고',
  '엿드신',

  // 은어 및 비속어
  'ㅅㅂ',
  'ㅆㅂ',
  'ㅅ발',
  'ㅆ발',
  'ㅗ',
  'ㅜ',
  'ㅠ',
  'ㅡ',
  'ㅏ',
  'ㅓ',
  'ㅔ',
  'ㅐ',
  'ㅣ',
  'ㅑ',
  'ㅕ',
  'ㅖ',
  'ㅒ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅢ',

  // 성적 비속어
  '섹스',
  '성관계',
  '성행위',
  '자위',
  '자지',
  '보지',
  '딸감',
  '야동',
  '야사',
  '야설',
  '포르노',
  'porn',
  'xxx',
  'av',
  '야한',
  '음란',
  '성인',
  '19금',
  '19+',

  // 기타 부적절한 표현
  '테러',
  '폭탄',
  '폭발',
  '살인',
  '자살',
  '자해',
  '마약',
  '대마',
  '코카인',
  '헤로인',
  '도박',
  '사기',
  '절도',
  '강도',
  '강간',
  '성폭행',
  '성추행',
  '성희롱',

  // 정치적/종교적 비하 표현
  '좌파',
  '우파',
  '진보',
  '보수',
  '빨갱이',
  '수꼴',
  '좌빨',
  '우빨',
  '개독',
  '불교',
  '기독교',
  '천주교',
  '이슬람',
  '힌두',
  '유대교',
  '무신론',
  '종교',

  // 인종/성별 비하 표현
  '흑인',
  '백인',
  '황인',
  '아시아',
  '중국',
  '일본',
  '한국',
  '조선',
  '북한',
  '남한',
  '여성',
  '남성',
  '게이',
  '레즈',
  '트랜스',
  '성소수자',
  '장애인',
  '정신병',

  // 온라인 비속어
  '노잼',
  '노재미',
  '노가치',
  '노의미',
  '노존재',
  '노필요',
  '노가치',
  '노의미',
  '개노잼',
  '개노재미',
  '개노가치',
  '개노의미',
  '개노존재',
  '개노필요',
  '진짜',
  '정말',
  '완전',
  '너무',
  '엄청',
  '대박',
  '개대박',
  '존대박',
  '미친대박',

  // 축약형 욕설
  'ㅋㅋㅋ',
  'ㅎㅎㅎ',
  'ㅠㅠㅠ',
  'ㅜㅜㅜ',
  'ㅡㅡ',
  'ㅗㅗㅗ',
  'ㅏㅏㅏ',
  'ㅓㅓㅓ',
  'ㅔㅔㅔ',
  'ㅐㅐㅐ',
  'ㅣㅣㅣ',
  'ㅑㅑㅑ',
  'ㅕㅕㅕ',
  'ㅖㅖㅖ',
  'ㅒㅒㅒ',
]

// 예외 단어 목록 (지역명, 건물명 등 정당한 용도로 사용되는 단어)
const EXCEPTION_WORDS = [
  '노원',
  '노원역',
  '노원구',
  '노원구청',
  '노원구청역',
  '노원고등학교',
  '노원중학교',
  '노원초등학교',
  '노원동',
  '노원문화원',
  '노원구민회관',
  '노원체육관',
  '노원구민체육관',
  '노원구청사',
  '노원구보건소',
  '노원구도서관',
  '노원구민센터',
]

// 욕설 패턴 (정규식)
const PROFANITY_PATTERNS = [
  /[ㅅㅆ][ㅂ발팔]/g, // 씨발, 시발 등
  /[ㄱㅋ][ㅐㅔ][ㅅㅆ][ㅐㅔ][ㄱㅋ][ㅣㅢ]/g, // 개새끼 등
  /[ㅂㅃ][ㅣㅢ][ㅇㅎ][ㅅㅆ][ㅣㅢ][ㄴ]/g, // 병신 등
  /[ㅈㅉ][ㅗㅜ][ㅈㅉ]/g, // 좆 등
  /[ㅈㅉ][ㅗㅜ][ㄴ][ㄴ]/g, // 존나 등
  /[ㅁㅂ][ㅣㅢ][ㅊㅋ][ㅣㅢ][ㄴ]/g, // 미친 등
  /[ㄷㄸ][ㅗㅜ][ㄱㅋ][ㅈㅉ][ㅓㅔ]/g, // 똥 등
  /[ㅈㅉ][ㅣㅢ][ㄹ][ㅏㅓ]/g, // 지랄 등
  /[ㅇㅎ][ㅕㅖ][ㅅㅆ][ㅁㅂ][ㅓㅔ][ㄱㅋ]/g, // 엿먹어 등
  /[ㄷㄸ][ㅏㅓ][ㄱㅋ][ㅈㅉ][ㅓㅔ]/g, // 닥쳐 등
  /[ㅈㅉ][ㅜㅠ][ㄱㅋ][ㅓㅔ]/g, // 죽어 등
  /[ㄷㄸ][ㅟㅢ][ㅈㅉ][ㅓㅔ]/g, // 뒤져 등
]

/**
 * 욕설 및 비속어 감지 함수
 * @param text 검사할 텍스트
 * @returns 욕설이 포함되어 있으면 true, 아니면 false
 */
export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }

  const normalizedText = text.toLowerCase().trim()

  // 예외 단어 먼저 체크 (지역명, 건물명 등)
  for (const exceptionWord of EXCEPTION_WORDS) {
    if (normalizedText.includes(exceptionWord.toLowerCase())) {
      // 예외 단어가 포함된 경우, 해당 부분을 제외하고 욕설 검사
      const textWithoutException = normalizedText.replace(
        new RegExp(exceptionWord.toLowerCase(), 'g'),
        ''
      )
      if (!textWithoutException.trim()) {
        // 예외 단어만 있으면 욕설이 아님
        return false
      }
      // 예외 단어를 제거한 후 다시 검사
      return containsProfanity(textWithoutException)
    }
  }

  // 직접적인 욕설 단어 검사
  for (const word of PROFANITY_WORDS) {
    if (normalizedText.includes(word.toLowerCase())) {
      return true
    }
  }

  // 패턴 기반 욕설 검사
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(normalizedText)) {
      return true
    }
  }

  return false
}

/**
 * 욕설 및 비속어를 제거하는 함수
 * @param text 정화할 텍스트
 * @param replacement 대체할 문자 (기본값: '*')
 * @returns 정화된 텍스트
 */
export function sanitizeProfanity(
  text: string,
  replacement: string = '*'
): string {
  if (!text || typeof text !== 'string') {
    return text
  }

  let sanitizedText = text

  // 예외 단어는 보호 (대체하지 않음)
  const protectedWords: string[] = []
  for (const exceptionWord of EXCEPTION_WORDS) {
    const regex = new RegExp(exceptionWord, 'gi')
    const matches = sanitizedText.match(regex)
    if (matches) {
      matches.forEach((match, index) => {
        const placeholder = `__PROTECTED_${index}__`
        protectedWords.push(match)
        sanitizedText = sanitizedText.replace(match, placeholder)
      })
    }
  }

  // 직접적인 욕설 단어 대체
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(word, 'gi')
    sanitizedText = sanitizedText.replace(
      regex,
      replacement.repeat(word.length)
    )
  }

  // 패턴 기반 욕설 대체
  for (const pattern of PROFANITY_PATTERNS) {
    sanitizedText = sanitizedText.replace(pattern, replacement.repeat(3))
  }

  // 보호된 단어들을 원래대로 복원
  protectedWords.forEach((word, index) => {
    const placeholder = `__PROTECTED_${index}__`
    sanitizedText = sanitizedText.replace(placeholder, word)
  })

  return sanitizedText
}

/**
 * 검색어에서 욕설을 제거하고 유효한 검색어만 반환
 * @param query 원본 검색어
 * @returns 정화된 검색어 또는 null (욕설만 있는 경우)
 */
export function filterSearchQuery(query: string): string | null {
  if (!query || typeof query !== 'string') {
    return null
  }

  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return null
  }

  // 욕설이 포함되어 있는지 확인
  if (containsProfanity(trimmedQuery)) {
    // 욕설을 제거한 후 남은 텍스트가 있는지 확인
    const sanitizedQuery = sanitizeProfanity(trimmedQuery, '').trim()

    if (sanitizedQuery) {
      // 욕설이 아닌 부분이 남아있으면 그것을 반환
      return sanitizedQuery
    } else {
      // 욕설만 있으면 null 반환 (현재 위치 기반 검색으로 대체)
      return null
    }
  }

  return trimmedQuery
}

/**
 * 검색어 유효성 검사
 * @param query 검사할 검색어
 * @returns 유효한 검색어인지 여부
 */
export function isValidSearchQuery(query: string): boolean {
  if (!query || typeof query !== 'string') {
    return false
  }

  const trimmedQuery = query.trim()

  // 빈 문자열 체크
  if (!trimmedQuery) {
    return false
  }

  // 욕설 포함 여부 체크
  if (containsProfanity(trimmedQuery)) {
    return false
  }

  // 최소 길이 체크 (1글자 이상)
  if (trimmedQuery.length < 1) {
    return false
  }

  // 최대 길이 체크 (100글자 이하)
  if (trimmedQuery.length > 100) {
    return false
  }

  return true
}
