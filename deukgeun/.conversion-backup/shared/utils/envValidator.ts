// ============================================================================
// 환경 변수 검증 유틸리티
// ============================================================================

interface RequiredEnvVars {
  VITE_BACKEND_URL: string
  VITE_FRONTEND_URL: string
  CORS_ORIGIN: string
}

interface OptionalEnvVars {
  VITE_KAKAO_API_KEY?: string
  VITE_RECAPTCHA_SITE_KEY?: string
  JWT_SECRET?: string
  DB_PASSWORD?: string
}

// 환경 감지 함수
function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof import.meta !== 'undefined'
}

function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && !!process.env
}

// 필수 환경 변수 검증 (프론트엔드용)
export function validateRequiredEnvVars(): RequiredEnvVars {
  let requiredVars: RequiredEnvVars

  if (isBrowserEnvironment()) {
    // 브라우저 환경 (프론트엔드)
    requiredVars = {
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '',
      VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || '',
      CORS_ORIGIN: import.meta.env.VITE_CORS_ORIGIN || '',
    }
  } else if (isNodeEnvironment()) {
    // Node.js 환경 (백엔드)
    requiredVars = {
      VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || '',
      VITE_FRONTEND_URL: process.env.VITE_FRONTEND_URL || '',
      CORS_ORIGIN: process.env.CORS_ORIGIN || '',
    }
  } else {
    throw new Error('지원되지 않는 환경입니다.')
  }

  const missingVars: string[] = []

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(key)
    }
  })

  if (missingVars.length > 0) {
    const envType = isBrowserEnvironment() ? '프론트엔드' : '백엔드'
    throw new Error(
      `${envType} 필수 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}\n` +
      '환경 변수 파일(.env)을 확인하고 필요한 값들을 설정해주세요.'
    )
  }

  return requiredVars
}

// 선택적 환경 변수 검증
export function validateOptionalEnvVars(): OptionalEnvVars {
  if (isBrowserEnvironment()) {
    // 브라우저 환경 (프론트엔드)
    return {
      VITE_KAKAO_API_KEY: import.meta.env.VITE_KAKAO_API_KEY,
      VITE_RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
      JWT_SECRET: import.meta.env.VITE_JWT_SECRET,
      DB_PASSWORD: import.meta.env.VITE_DB_PASSWORD,
    }
  } else if (isNodeEnvironment()) {
    // Node.js 환경 (백엔드)
    return {
      VITE_KAKAO_API_KEY: process.env.VITE_KAKAO_API_KEY,
      VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY,
      JWT_SECRET: process.env.JWT_SECRET,
      DB_PASSWORD: process.env.DB_PASSWORD,
    }
  } else {
    return {}
  }
}

// 환경 변수 검증 및 경고
export function validateAndWarnEnvVars(): void {
  try {
    const required = validateRequiredEnvVars()
    const optional = validateOptionalEnvVars()

    console.log('✅ 필수 환경 변수 검증 완료:', Object.keys(required))
    
    const missingOptional = Object.entries(optional)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key)

    if (missingOptional.length > 0) {
      console.warn('⚠️ 선택적 환경 변수가 설정되지 않았습니다:', missingOptional)
    }
  } catch (error) {
    console.error('❌ 환경 변수 검증 실패:', error)
    throw error
  }
}

// 프론트엔드용 환경 변수 검증 (브라우저 환경)
export function validateFrontendEnvVars(): void {
  if (!isBrowserEnvironment()) {
    return
  }

  const requiredVars = {
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '',
    VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || '',
  }

  const missingVars: string[] = []

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(key)
    }
  })

  if (missingVars.length > 0) {
    console.warn(`⚠️ 프론트엔드 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`)
    console.warn('⚠️ API 연결에 문제가 발생할 수 있습니다.')
  } else {
    console.log('✅ 프론트엔드 환경 변수 검증 완료')
  }
}

// 백엔드용 환경 변수 검증 (Node.js 환경)
export function validateBackendEnvVars(): void {
  if (!isNodeEnvironment()) {
    return
  }

  const requiredVars = {
    CORS_ORIGIN: process.env.CORS_ORIGIN || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
  }

  const missingVars: string[] = []

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(key)
    }
  })

  if (missingVars.length > 0) {
    console.warn(`⚠️ 백엔드 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`)
    console.warn('⚠️ 일부 기능이 제한될 수 있습니다.')
  } else {
    console.log('✅ 백엔드 환경 변수 검증 완료')
  }
}

// URL 형식 검증
export function validateUrl(url: string, name: string): void {
  try {
    new URL(url)
  } catch {
    throw new Error(`${name} URL 형식이 올바르지 않습니다: ${url}`)
  }
}

// 환경별 URL 검증
export function validateEnvironmentUrls(): void {
  const env = validateRequiredEnvVars()

  // Backend URL 검증
  validateUrl(env.VITE_BACKEND_URL, 'Backend')

  // Frontend URL 검증
  validateUrl(env.VITE_FRONTEND_URL, 'Frontend')

  // CORS Origin 검증
  const corsOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  corsOrigins.forEach(origin => {
    if (origin) {
      validateUrl(origin, 'CORS Origin')
    }
  })
}

// 개발 환경에서만 실행되는 검증
export function validateDevEnvironment(): void {
  if (import.meta.env.MODE === 'development' || process.env.NODE_ENV === 'development') {
    console.log('🔍 개발 환경 검증 중...')
    validateEnvironmentUrls()
    console.log('✅ 개발 환경 검증 완료')
  }
}

// 프로덕션 환경에서만 실행되는 검증
export function validateProductionEnvironment(): void {
  if (import.meta.env.MODE === 'production' || process.env.NODE_ENV === 'production') {
    console.log('🔍 프로덕션 환경 검증 중...')
    validateEnvironmentUrls()
    
    // 프로덕션에서는 HTTPS 필수
    const env = validateRequiredEnvVars()
    if (!env.VITE_BACKEND_URL.startsWith('https://')) {
      throw new Error('프로덕션 환경에서는 HTTPS를 사용해야 합니다.')
    }
    if (!env.VITE_FRONTEND_URL.startsWith('https://')) {
      throw new Error('프로덕션 환경에서는 HTTPS를 사용해야 합니다.')
    }
    
    console.log('✅ 프로덕션 환경 검증 완료')
  }
}

// 환경 변수 검증 실행
export function runEnvironmentValidation(): void {
  try {
    if (isBrowserEnvironment()) {
      // 브라우저 환경 (프론트엔드)
      validateFrontendEnvVars()
      validateDevEnvironment()
    } else if (isNodeEnvironment()) {
      // Node.js 환경 (백엔드)
      validateBackendEnvVars()
      validateAndWarnEnvVars()
      
      if (process.env.NODE_ENV === 'development') {
        validateDevEnvironment()
      } else if (process.env.NODE_ENV === 'production') {
        validateProductionEnvironment()
      }
    }
  } catch (error) {
    console.error('❌ 환경 변수 검증 실패:', error)
    if (isNodeEnvironment()) {
      process.exit(1)
    }
    // 브라우저 환경에서는 process.exit()를 사용하지 않음
  }
}
