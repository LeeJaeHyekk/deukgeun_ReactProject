// ============================================================================
// 환경 변수 검증 시스템
// 프로덕션 환경에서 필수 환경 변수들이 올바르게 설정되었는지 검증
// ============================================================================

import { config } from 'dotenv'
import { z } from 'zod'

// 환경 변수 로드
config({ path: '.env.production' })
config({ path: '.env' })

// 환경 변수 검증 스키마
const envSchema = z.object({
  // 애플리케이션 기본 설정
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).pipe(z.number().min(1000).max(65535)),

  // 데이터베이스 설정
  DB_HOST: z.string().min(1, 'DB_HOST는 필수입니다'),
  DB_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  DB_USERNAME: z.string().min(1, 'DB_USERNAME는 필수입니다'),
  DB_PASSWORD: z.string().min(8, 'DB_PASSWORD는 최소 8자 이상이어야 합니다'),
  DB_NAME: z.string().min(1, 'DB_NAME는 필수입니다'),

  // JWT 설정
  JWT_SECRET: z.string().min(32, 'JWT_SECRET는 최소 32자 이상이어야 합니다'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET는 최소 32자 이상이어야 합니다'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET는 최소 32자 이상이어야 합니다'),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[dhms]$/, 'JWT_EXPIRES_IN 형식이 올바르지 않습니다'),

  // CORS 설정
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN는 필수입니다'),

  // 이메일 설정
  EMAIL_HOST: z.string().min(1, 'EMAIL_HOST는 필수입니다'),
  EMAIL_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  EMAIL_USER: z.string().email('EMAIL_USER는 유효한 이메일 형식이어야 합니다'),
  EMAIL_PASS: z.string().min(1, 'EMAIL_PASS는 필수입니다'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().positive()),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform(Number)
    .pipe(z.number().positive()),

  // 선택적 설정들
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .optional(),
  REDIS_PASSWORD: z.string().optional(),

  // API 키들 (선택적)
  KAKAO_API_KEY: z.string().optional(),
  KAKAO_JAVASCRIPT_MAP_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  SEOUL_OPENAPI_KEY: z.string().optional(),
  VITE_GYM_API_KEY: z.string().optional(),

  // reCAPTCHA
  RECAPTCHA_SECRET: z.string().optional(),
  RECAPTCHA_SITE_KEY: z.string().optional(),

  // SMS (선택적)
  SMS_API_KEY: z.string().optional(),
  SMS_API_SECRET: z.string().optional(),
  SMS_FROM: z.string().optional(),

  // 파일 업로드
  UPLOAD_PATH: z.string().optional(),
  MAX_FILE_SIZE: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),

  // 로깅
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  LOG_FILE_PATH: z.string().optional(),

  // 모니터링
  MONITORING_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  METRICS_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .optional(),

  // 알림
  SENTRY_DSN: z.string().url().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  ALERT_EMAIL: z.string().email().optional(),
})

// 환경 변수 검증 함수
export function validateEnvironment() {
  try {
    const validatedEnv = envSchema.parse(process.env)

    // 프로덕션 환경에서 추가 검증
    if (validatedEnv.NODE_ENV === 'production') {
      validateProductionEnvironment(validatedEnv)
    }

    console.log('✅ 환경 변수 검증 완료')
    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 환경 변수 검증 실패:')
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    } else {
      console.error('❌ 환경 변수 검증 중 오류 발생:', error)
    }
    process.exit(1)
  }
}

// 프로덕션 환경 전용 검증
function validateProductionEnvironment(env: any) {
  const warnings: string[] = []
  const errors: string[] = []

  // 보안 검증
  if (env.DB_PASSWORD.includes('CHANGE_ME') || env.DB_PASSWORD.length < 16) {
    errors.push('DB_PASSWORD는 강력한 비밀번호로 변경해야 합니다')
  }

  if (env.JWT_SECRET.includes('CHANGE_ME') || env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET는 32자 이상의 강력한 문자열로 변경해야 합니다')
  }

  if (
    env.JWT_ACCESS_SECRET.includes('CHANGE_ME') ||
    env.JWT_ACCESS_SECRET.length < 32
  ) {
    errors.push(
      'JWT_ACCESS_SECRET는 32자 이상의 강력한 문자열로 변경해야 합니다'
    )
  }

  if (
    env.JWT_REFRESH_SECRET.includes('CHANGE_ME') ||
    env.JWT_REFRESH_SECRET.length < 32
  ) {
    errors.push(
      'JWT_REFRESH_SECRET는 32자 이상의 강력한 문자열로 변경해야 합니다'
    )
  }

  // HTTPS 검증
  if (env.CORS_ORIGIN.includes('http://')) {
    warnings.push('프로덕션 환경에서는 HTTPS를 사용하는 것을 권장합니다')
  }

  // API 키 검증
  if (env.KAKAO_API_KEY?.includes('CHANGE_ME')) {
    warnings.push('KAKAO_API_KEY가 설정되지 않았습니다')
  }

  if (env.GOOGLE_PLACES_API_KEY?.includes('CHANGE_ME')) {
    warnings.push('GOOGLE_PLACES_API_KEY가 설정되지 않았습니다')
  }

  // 이메일 설정 검증
  if (env.EMAIL_USER?.includes('CHANGE_ME')) {
    errors.push('EMAIL_USER는 실제 이메일 주소로 변경해야 합니다')
  }

  if (env.EMAIL_PASS?.includes('CHANGE_ME')) {
    errors.push('EMAIL_PASS는 실제 앱 비밀번호로 변경해야 합니다')
  }

  // 에러가 있으면 종료
  if (errors.length > 0) {
    console.error('❌ 프로덕션 환경 검증 실패:')
    errors.forEach(error => console.error(`  - ${error}`))
    process.exit(1)
  }

  // 경고 출력
  if (warnings.length > 0) {
    console.warn('⚠️  프로덕션 환경 경고:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
}

// 환경 변수 마스킹 함수 (로그 출력 시 민감한 정보 숨김)
export function maskSensitiveEnv(
  env: Record<string, any>
): Record<string, any> {
  const sensitiveKeys = [
    'DB_PASSWORD',
    'JWT_SECRET',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'EMAIL_PASS',
    'SMS_API_SECRET',
    'REDIS_PASSWORD',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'RECAPTCHA_SECRET',
    'GOOGLE_secure_secret_generator',
  ]

  const masked = { ...env }
  sensitiveKeys.forEach(key => {
    if (masked[key]) {
      masked[key] = '***MASKED***'
    }
  })

  return masked
}

// 환경 변수 상태 리포트 생성
export function generateEnvReport() {
  const env = process.env
  const maskedEnv = maskSensitiveEnv(env)

  console.log('📊 환경 변수 상태 리포트:')
  console.log('='.repeat(50))

  // 기본 설정
  console.log('🌍 애플리케이션 설정:')
  console.log(`  NODE_ENV: ${env.NODE_ENV}`)
  console.log(`  PORT: ${env.PORT}`)

  // 데이터베이스 설정
  console.log('🗄️ 데이터베이스 설정:')
  console.log(`  DB_HOST: ${env.DB_HOST}`)
  console.log(`  DB_PORT: ${env.DB_PORT}`)
  console.log(`  DB_USERNAME: ${env.DB_USERNAME}`)
  console.log(`  DB_PASSWORD: ${maskedEnv.DB_PASSWORD}`)
  console.log(`  DB_NAME: ${env.DB_NAME}`)

  // JWT 설정
  console.log('🔐 JWT 설정:')
  console.log(`  JWT_SECRET: ${maskedEnv.JWT_SECRET}`)
  console.log(`  JWT_ACCESS_SECRET: ${maskedEnv.JWT_ACCESS_SECRET}`)
  console.log(`  JWT_REFRESH_SECRET: ${maskedEnv.JWT_REFRESH_SECRET}`)
  console.log(`  JWT_EXPIRES_IN: ${env.JWT_EXPIRES_IN}`)

  // CORS 설정
  console.log('🌐 CORS 설정:')
  console.log(`  CORS_ORIGIN: ${env.CORS_ORIGIN}`)

  // 이메일 설정
  console.log('📧 이메일 설정:')
  console.log(`  EMAIL_HOST: ${env.EMAIL_HOST}`)
  console.log(`  EMAIL_PORT: ${env.EMAIL_PORT}`)
  console.log(`  EMAIL_USER: ${env.EMAIL_USER}`)
  console.log(`  EMAIL_PASS: ${maskedEnv.EMAIL_PASS}`)

  // API 키 설정 (설정된 것만)
  console.log('🔑 API 키 설정:')
  const apiKeys = [
    'KAKAO_API_KEY',
    'KAKAO_JAVASCRIPT_MAP_API_KEY',
    'GOOGLE_PLACES_API_KEY',
    'SEOUL_OPENAPI_KEY',
    'VITE_GYM_API_KEY',
  ]

  apiKeys.forEach(key => {
    if (env[key] && !env[key]?.includes('CHANGE_ME')) {
      console.log(`  ${key}: 설정됨`)
    } else {
      console.log(`  ${key}: 설정되지 않음`)
    }
  })

  console.log('='.repeat(50))
}

// 환경 변수 검증 및 리포트 실행
if (require.main === module) {
  console.log('🔍 환경 변수 검증 시작...')
  validateEnvironment()
  generateEnvReport()
}
