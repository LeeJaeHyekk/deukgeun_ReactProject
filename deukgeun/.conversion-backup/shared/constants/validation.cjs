// Browser API polyfills for Node.js environment
if (typeof window === 'undefined') {
  global.window = global.window || {}
  global.document = global.document || {}
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.File = global.File || class File {}
  global.StorageEvent = global.StorageEvent || class StorageEvent {}
  global.requestAnimationFrame = global.requestAnimationFrame || (cb => setTimeout(cb, 16))
}

// ============================================================================
// Validation Constants
// ============================================================================

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MIN_LENGTH = 5
const EMAIL_MAX_LENGTH = 254

// Password validation
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

// Phone number validation (Korean format)
const PHONE_REGEX = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
const PHONE_LENGTH = 11

// Nickname validation
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,20}$/
const NICKNAME_MIN_LENGTH = 2
const NICKNAME_MAX_LENGTH = 20

// Name validation
const NAME_REGEX = /^[가-힣a-zA-Z\s]{2,50}$/
const NAME_MIN_LENGTH = 2
const NAME_MAX_LENGTH = 50

// Username validation
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/
const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 30

// URL validation
const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

// Date validation
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/

// Number validation
const POSITIVE_NUMBER_REGEX = /^[1-9]\d*$/
const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/

// File validation
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

// Text validation
const TEXT_MIN_LENGTH = 1
const TEXT_MAX_LENGTH = 1000
const LONG_TEXT_MAX_LENGTH = 10000
const TITLE_MAX_LENGTH = 200
const DESCRIPTION_MAX_LENGTH = 500

// Age validation
const MIN_AGE = 13
const MAX_AGE = 120

// Rating validation
const MIN_RATING = 1
const MAX_RATING = 5

// Pagination validation
const MIN_PAGE = 1
const MAX_PAGE = 10000
const MIN_LIMIT = 1
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 10

// Search validation
const SEARCH_MIN_LENGTH = 1
const SEARCH_MAX_LENGTH = 100

// Category validation
const CATEGORY_REGEX = /^[a-zA-Z0-9_-]{1,50}$/
const CATEGORY_MIN_LENGTH = 1
const CATEGORY_MAX_LENGTH = 50

// Tag validation
const TAG_REGEX = /^[a-zA-Z0-9가-힣_-]{1,30}$/
const TAG_MIN_LENGTH = 1
const TAG_MAX_LENGTH = 30
const MAX_TAGS = 10

// Machine validation
const MACHINE_NAME_MIN_LENGTH = 1
const MACHINE_NAME_MAX_LENGTH = 100
const MACHINE_DESCRIPTION_MAX_LENGTH = 1000
const MACHINE_INSTRUCTIONS_MAX_LENGTH = 2000

// Workout validation
const WORKOUT_NAME_MIN_LENGTH = 1
const WORKOUT_NAME_MAX_LENGTH = 100
const WORKOUT_DESCRIPTION_MAX_LENGTH = 1000
const MIN_SETS = 1
const MAX_SETS = 50
const MIN_REPS = 1
const MAX_REPS = 1000
const MIN_WEIGHT = 0
const MAX_WEIGHT = 1000
const MIN_DURATION = 1
const MAX_DURATION = 1440 // 24 hours in minutes

// Gym validation
const GYM_NAME_MIN_LENGTH = 1
const GYM_NAME_MAX_LENGTH = 100
const GYM_ADDRESS_MAX_LENGTH = 200
const GYM_PHONE_REGEX = /^0\d{1,2}-?\d{3,4}-?\d{4}$/
const GYM_HOURS_MAX_LENGTH = 100

// Comment validation
const COMMENT_MIN_LENGTH = 1
const COMMENT_MAX_LENGTH = 1000

// Post validation
const POST_TITLE_MIN_LENGTH = 1
const POST_TITLE_MAX_LENGTH = 200
const POST_CONTENT_MIN_LENGTH = 1
const POST_CONTENT_MAX_LENGTH = 10000

// Level validation
const MIN_LEVEL = 1
const MAX_LEVEL = 100
const MIN_EXP = 0
const MAX_EXP = 1000000

// Streak validation
const MIN_STREAK = 0
const MAX_STREAK = 365

// Reward validation
const REWARD_NAME_MIN_LENGTH = 1
const REWARD_NAME_MAX_LENGTH = 100
const REWARD_DESCRIPTION_MAX_LENGTH = 500

// Milestone validation
const MILESTONE_NAME_MIN_LENGTH = 1
const MILESTONE_NAME_MAX_LENGTH = 100
const MILESTONE_DESCRIPTION_MAX_LENGTH = 500

// HTTP Error messages
const HTTP_ERROR_MESSAGES = {
  BAD_REQUEST: '잘못된 요청입니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  CONFLICT: '이미 존재하는 리소스입니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
  SERVICE_UNAVAILABLE: '서비스를 사용할 수 없습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  TIMEOUT: '요청 시간이 초과되었습니다.',
  VALIDATION_ERROR: '입력 데이터가 올바르지 않습니다.',
} as const

// Error messages
const VALIDATION_ERRORS = {
  REQUIRED: '필수 입력 항목입니다.',
  EMAIL_INVALID: '올바른 이메일 형식이 아닙니다.',
  EMAIL_TOO_SHORT: `이메일은 최소 ${EMAIL_MIN_LENGTH}자 이상이어야 합니다.`,
  EMAIL_TOO_LONG: `이메일은 최대 ${EMAIL_MAX_LENGTH}자까지 입력 가능합니다.`,
  PASSWORD_INVALID: '비밀번호는 8자 이상, 대소문자, 숫자를 포함해야 합니다.',
  PASSWORD_TOO_SHORT: `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
  PASSWORD_TOO_LONG: `비밀번호는 최대 ${PASSWORD_MAX_LENGTH}자까지 입력 가능합니다.`,
  PHONE_INVALID: '올바른 전화번호 형식이 아닙니다.',
  PHONE_LENGTH: `전화번호는 ${PHONE_LENGTH}자리여야 합니다.`,
  NICKNAME_INVALID: '닉네임은 2-20자의 한글, 영문, 숫자만 사용 가능합니다.',
  NICKNAME_TOO_SHORT: `닉네임은 최소 ${NICKNAME_MIN_LENGTH}자 이상이어야 합니다.`,
  NICKNAME_TOO_LONG: `닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 입력 가능합니다.`,
  NAME_INVALID: '이름은 2-50자의 한글, 영문만 사용 가능합니다.',
  NAME_TOO_SHORT: `이름은 최소 ${NAME_MIN_LENGTH}자 이상이어야 합니다.`,
  NAME_TOO_LONG: `이름은 최대 ${NAME_MAX_LENGTH}자까지 입력 가능합니다.`,
  USERNAME_INVALID:
    '사용자명은 3-30자의 영문, 숫자, 언더스코어만 사용 가능합니다.',
  USERNAME_TOO_SHORT: `사용자명은 최소 ${USERNAME_MIN_LENGTH}자 이상이어야 합니다.`,
  USERNAME_TOO_LONG: `사용자명은 최대 ${USERNAME_MAX_LENGTH}자까지 입력 가능합니다.`,
  URL_INVALID: '올바른 URL 형식이 아닙니다.',
  DATE_INVALID: '올바른 날짜 형식이 아닙니다.',
  DATETIME_INVALID: '올바른 날짜시간 형식이 아닙니다.',
  NUMBER_INVALID: '올바른 숫자 형식이 아닙니다.',
  POSITIVE_NUMBER_INVALID: '양수만 입력 가능합니다.',
  DECIMAL_INVALID: '올바른 소수점 형식이 아닙니다.',
  FILE_TYPE_INVALID: '지원하지 않는 파일 형식입니다.',
  FILE_TOO_LARGE: `파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다.`,
  IMAGE_TOO_LARGE: `이미지 크기는 ${MAX_IMAGE_SIZE / (1024 * 1024)}MB 이하여야 합니다.`,
  VIDEO_TOO_LARGE: `동영상 크기는 ${MAX_VIDEO_SIZE / (1024 * 1024)}MB 이하여야 합니다.`,
  TEXT_TOO_SHORT: `텍스트는 최소 ${TEXT_MIN_LENGTH}자 이상이어야 합니다.`,
  TEXT_TOO_LONG: `텍스트는 최대 ${TEXT_MAX_LENGTH}자까지 입력 가능합니다.`,
  LONG_TEXT_TOO_LONG: `텍스트는 최대 ${LONG_TEXT_MAX_LENGTH}자까지 입력 가능합니다.`,
  TITLE_TOO_LONG: `제목은 최대 ${TITLE_MAX_LENGTH}자까지 입력 가능합니다.`,
  DESCRIPTION_TOO_LONG: `설명은 최대 ${DESCRIPTION_MAX_LENGTH}자까지 입력 가능합니다.`,
  AGE_INVALID: `나이는 ${MIN_AGE}세 이상 ${MAX_AGE}세 이하여야 합니다.`,
  RATING_INVALID: `평점은 ${MIN_RATING}점 이상 ${MAX_RATING}점 이하여야 합니다.`,
  PAGE_INVALID: `페이지는 ${MIN_PAGE} 이상 ${MAX_PAGE} 이하여야 합니다.`,
  LIMIT_INVALID: `한 페이지당 항목 수는 ${MIN_LIMIT} 이상 ${MAX_LIMIT} 이하여야 합니다.`,
  SEARCH_TOO_SHORT: `검색어는 최소 ${SEARCH_MIN_LENGTH}자 이상이어야 합니다.`,
  SEARCH_TOO_LONG: `검색어는 최대 ${SEARCH_MAX_LENGTH}자까지 입력 가능합니다.`,
  CATEGORY_INVALID:
    '카테고리는 1-50자의 영문, 숫자, 언더스코어, 하이픈만 사용 가능합니다.',
  CATEGORY_TOO_SHORT: `카테고리는 최소 ${CATEGORY_MIN_LENGTH}자 이상이어야 합니다.`,
  CATEGORY_TOO_LONG: `카테고리는 최대 ${CATEGORY_MAX_LENGTH}자까지 입력 가능합니다.`,
  TAG_INVALID:
    '태그는 1-30자의 영문, 숫자, 한글, 언더스코어, 하이픈만 사용 가능합니다.',
  TAG_TOO_SHORT: `태그는 최소 ${TAG_MIN_LENGTH}자 이상이어야 합니다.`,
  TAG_TOO_LONG: `태그는 최대 ${TAG_MAX_LENGTH}자까지 입력 가능합니다.`,
  TOO_MANY_TAGS: `태그는 최대 ${MAX_TAGS}개까지 입력 가능합니다.`,
  MACHINE_NAME_TOO_SHORT: `머신 이름은 최소 ${MACHINE_NAME_MIN_LENGTH}자 이상이어야 합니다.`,
  MACHINE_NAME_TOO_LONG: `머신 이름은 최대 ${MACHINE_NAME_MAX_LENGTH}자까지 입력 가능합니다.`,
  MACHINE_DESCRIPTION_TOO_LONG: `머신 설명은 최대 ${MACHINE_DESCRIPTION_MAX_LENGTH}자까지 입력 가능합니다.`,
  MACHINE_INSTRUCTIONS_TOO_LONG: `머신 사용법은 최대 ${MACHINE_INSTRUCTIONS_MAX_LENGTH}자까지 입력 가능합니다.`,
  WORKOUT_NAME_TOO_SHORT: `워크아웃 이름은 최소 ${WORKOUT_NAME_MIN_LENGTH}자 이상이어야 합니다.`,
  WORKOUT_NAME_TOO_LONG: `워크아웃 이름은 최대 ${WORKOUT_NAME_MAX_LENGTH}자까지 입력 가능합니다.`,
  WORKOUT_DESCRIPTION_TOO_LONG: `워크아웃 설명은 최대 ${WORKOUT_DESCRIPTION_MAX_LENGTH}자까지 입력 가능합니다.`,
  SETS_INVALID: `세트 수는 ${MIN_SETS} 이상 ${MAX_SETS} 이하여야 합니다.`,
  REPS_INVALID: `반복 수는 ${MIN_REPS} 이상 ${MAX_REPS} 이하여야 합니다.`,
  WEIGHT_INVALID: `무게는 ${MIN_WEIGHT} 이상 ${MAX_WEIGHT} 이하여야 합니다.`,
  DURATION_INVALID: `운동 시간은 ${MIN_DURATION}분 이상 ${MAX_DURATION}분 이하여야 합니다.`,
  GYM_NAME_TOO_SHORT: `헬스장 이름은 최소 ${GYM_NAME_MIN_LENGTH}자 이상이어야 합니다.`,
  GYM_NAME_TOO_LONG: `헬스장 이름은 최대 ${GYM_NAME_MAX_LENGTH}자까지 입력 가능합니다.`,
  GYM_ADDRESS_TOO_LONG: `주소는 최대 ${GYM_ADDRESS_MAX_LENGTH}자까지 입력 가능합니다.`,
  GYM_PHONE_INVALID: '올바른 전화번호 형식이 아닙니다.',
  GYM_HOURS_TOO_LONG: `운영시간은 최대 ${GYM_HOURS_MAX_LENGTH}자까지 입력 가능합니다.`,
  COMMENT_TOO_SHORT: `댓글은 최소 ${COMMENT_MIN_LENGTH}자 이상이어야 합니다.`,
  COMMENT_TOO_LONG: `댓글은 최대 ${COMMENT_MAX_LENGTH}자까지 입력 가능합니다.`,
  POST_TITLE_TOO_SHORT: `제목은 최소 ${POST_TITLE_MIN_LENGTH}자 이상이어야 합니다.`,
  POST_TITLE_TOO_LONG: `제목은 최대 ${POST_TITLE_MAX_LENGTH}자까지 입력 가능합니다.`,
  POST_CONTENT_TOO_SHORT: `내용은 최소 ${POST_CONTENT_MIN_LENGTH}자 이상이어야 합니다.`,
  POST_CONTENT_TOO_LONG: `내용은 최대 ${POST_CONTENT_MAX_LENGTH}자까지 입력 가능합니다.`,
  LEVEL_INVALID: `레벨은 ${MIN_LEVEL} 이상 ${MAX_LEVEL} 이하여야 합니다.`,
  EXP_INVALID: `경험치는 ${MIN_EXP} 이상 ${MAX_EXP} 이하여야 합니다.`,
  STREAK_INVALID: `연속 일수는 ${MIN_STREAK} 이상 ${MAX_STREAK} 이하여야 합니다.`,
  REWARD_NAME_TOO_SHORT: `보상 이름은 최소 ${REWARD_NAME_MIN_LENGTH}자 이상이어야 합니다.`,
  REWARD_NAME_TOO_LONG: `보상 이름은 최대 ${REWARD_NAME_MAX_LENGTH}자까지 입력 가능합니다.`,
  REWARD_DESCRIPTION_TOO_LONG: `보상 설명은 최대 ${REWARD_DESCRIPTION_MAX_LENGTH}자까지 입력 가능합니다.`,
  MILESTONE_NAME_TOO_SHORT: `마일스톤 이름은 최소 ${MILESTONE_NAME_MIN_LENGTH}자 이상이어야 합니다.`,
  MILESTONE_NAME_TOO_LONG: `마일스톤 이름은 최대 ${MILESTONE_NAME_MAX_LENGTH}자까지 입력 가능합니다.`,
  MILESTONE_DESCRIPTION_TOO_LONG: `마일스톤 설명은 최대 ${MILESTONE_DESCRIPTION_MAX_LENGTH}자까지 입력 가능합니다.`,
} as const

// Validation functions
const validation = {
  // Email validation
  isEmail: (email: string): boolean => {
    return EMAIL_REGEX.test(email)
  },

  // Password validation
  isPassword: (password: string): boolean => {
    return PASSWORD_REGEX.test(password)
  },

  // Phone validation
  isPhone: (phone: string): boolean => {
    return PHONE_REGEX.test(phone.replace(/\s/g, ''))
  },

  // Nickname validation
  isNickname: (nickname: string): boolean => {
    return NICKNAME_REGEX.test(nickname)
  },

  // Name validation
  isName: (name: string): boolean => {
    return NAME_REGEX.test(name)
  },

  // Username validation
  isUsername: (username: string): boolean => {
    return USERNAME_REGEX.test(username)
  },

  // URL validation
  isUrl: (url: string): boolean => {
    return URL_REGEX.test(url)
  },

  // Date validation
  isDate: (date: string): boolean => {
    return DATE_REGEX.test(date)
  },

  // DateTime validation
  isDateTime: (datetime: string): boolean => {
    return DATETIME_REGEX.test(datetime)
  },

  // Number validation
  isNumber: (value: string): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value))
  },

  // Positive number validation
  isPositiveNumber: (value: string): boolean => {
    return validation.isNumber(value) && Number(value) > 0
  },

  // Decimal validation
  isDecimal: (value: string): boolean => {
    return DECIMAL_REGEX.test(value)
  },

  // File type validation
  isAllowedImageType: (type: string): boolean => {
    return ALLOWED_IMAGE_TYPES.includes(type)
  },

  // File size validation
  isFileSizeValid: (size: number, maxSize: number = MAX_FILE_SIZE): boolean => {
    return size <= maxSize
  },

  // Text length validation
  isTextLengthValid: (
    text: string,
    min: number = TEXT_MIN_LENGTH,
    max: number = TEXT_MAX_LENGTH
  ): boolean => {
    return text.length >= min && text.length <= max
  },

  // Age validation
  isAge: (age: number): boolean => {
    return age >= MIN_AGE && age <= MAX_AGE
  },

  // Rating validation
  isRating: (rating: number): boolean => {
    return rating >= MIN_RATING && rating <= MAX_RATING
  },

  // Page validation
  isPage: (page: number): boolean => {
    return page >= MIN_PAGE && page <= MAX_PAGE
  },

  // Limit validation
  isLimit: (limit: number): boolean => {
    return limit >= MIN_LIMIT && limit <= MAX_LIMIT
  },

  // Search validation
  isSearch: (search: string): boolean => {
    return (
      search.length >= SEARCH_MIN_LENGTH && search.length <= SEARCH_MAX_LENGTH
    )
  },

  // Category validation
  isCategory: (category: string): boolean => {
    return CATEGORY_REGEX.test(category)
  },

  // Tag validation
  isTag: (tag: string): boolean => {
    return TAG_REGEX.test(tag)
  },

  // Machine name validation
  isMachineName: (name: string): boolean => {
    return (
      name.length >= MACHINE_NAME_MIN_LENGTH &&
      name.length <= MACHINE_NAME_MAX_LENGTH
    )
  },

  // Workout validation
  isSets: (sets: number): boolean => {
    return sets >= MIN_SETS && sets <= MAX_SETS
  },

  isReps: (reps: number): boolean => {
    return reps >= MIN_REPS && reps <= MAX_REPS
  },

  isWeight: (weight: number): boolean => {
    return weight >= MIN_WEIGHT && weight <= MAX_WEIGHT
  },

  isDuration: (duration: number): boolean => {
    return duration >= MIN_DURATION && duration <= MAX_DURATION
  },

  // Gym validation
  isGymName: (name: string): boolean => {
    return (
      name.length >= GYM_NAME_MIN_LENGTH && name.length <= GYM_NAME_MAX_LENGTH
    )
  },

  isGymPhone: (phone: string): boolean => {
    return GYM_PHONE_REGEX.test(phone.replace(/\s/g, ''))
  },

  // Comment validation
  isComment: (comment: string): boolean => {
    return (
      comment.length >= COMMENT_MIN_LENGTH &&
      comment.length <= COMMENT_MAX_LENGTH
    )
  },

  // Post validation
  isPostTitle: (title: string): boolean => {
    return (
      title.length >= POST_TITLE_MIN_LENGTH &&
      title.length <= POST_TITLE_MAX_LENGTH
    )
  },

  isPostContent: (content: string): boolean => {
    return (
      content.length >= POST_CONTENT_MIN_LENGTH &&
      content.length <= POST_CONTENT_MAX_LENGTH
    )
  },

  // Level validation
  isLevel: (level: number): boolean => {
    return level >= MIN_LEVEL && level <= MAX_LEVEL
  },

  isExp: (exp: number): boolean => {
    return exp >= MIN_EXP && exp <= MAX_EXP
  },

  // Streak validation
  isStreak: (streak: number): boolean => {
    return streak >= MIN_STREAK && streak <= MAX_STREAK
  },

  // Reward validation
  isRewardName: (name: string): boolean => {
    return (
      name.length >= REWARD_NAME_MIN_LENGTH &&
      name.length <= REWARD_NAME_MAX_LENGTH
    )
  },

  // Milestone validation
  isMilestoneName: (name: string): boolean => {
    return (
      name.length >= MILESTONE_NAME_MIN_LENGTH &&
      name.length <= MILESTONE_NAME_MAX_LENGTH
    )
  },
}

module.exports = validation