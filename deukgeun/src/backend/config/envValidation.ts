// ============================================================================
// 환경 변수 검증 시스템
// 프로덕션 환경에서 필수 환경 변수들이 올바르게 설정되었는지 검증
// ============================================================================

import { config } from 'dotenv'
import { z } from 'zod'
import path from 'path'
import fs from 'fs'

// 환경 변수 로드 - 여러 경로에서 시도
const nodeEnv = process.env.NODE_ENV || 'development'

// 현재 파일의 디렉토리에서 시작하여 프로젝트 루트를 찾음
const currentDir = __dirname
const projectRoot = path.resolve(currentDir, '../../..') // src/backend/config에서 프로젝트 루트로

// 환경 변수 로딩 순서: .env.local -> .env.production/.env.development -> .env -> .env.example
const envPaths = [
  path.join(projectRoot, '.env.local'),
  path.join(
    projectRoot,
    nodeEnv === 'production' ? 'env.production' : '.env.development'
  ),
  path.join(projectRoot, '.env'),
  path.join(projectRoot, 'env.example'),
  // 상대 경로도 시도
  '.env.local',
  nodeEnv === 'production' ? 'env.production' : '.env.development',
  '.env',
  'env.example',
  '../env.production',
  '../env.example',
  '../../env.production',
  '../../env.example',
]

// 각 경로에서 환경 변수 로드 시도 (여러 파일을 순차적으로 로드)
let totalLoaded = 0
const loadedFiles: string[] = []

for (const envPath of envPaths) {
  try {
    // 파일 존재 여부 확인
    if (fs.existsSync(envPath)) {
      const result = config({ path: envPath })
      if (result.parsed && Object.keys(result.parsed).length > 0) {
        console.log(
          `✅ Environment variables loaded from ${envPath} (${Object.keys(result.parsed).length} variables)`
        )
        totalLoaded += Object.keys(result.parsed).length
        loadedFiles.push(envPath)
      }
    }
  } catch (error) {
    // 파일이 없거나 읽기 실패하면 무시하고 다음 경로 시도
    continue
  }
}

if (totalLoaded > 0) {
  console.log(
    `📊 Total environment variables loaded: ${totalLoaded} from ${loadedFiles.length} file(s)`
  )
} else {
  console.warn(
    '⚠️  No environment file found. Using system environment variables only.'
  )
}

// 환경 변수 검증 스키마
const envSchema = z.object({
  // 애플리케이션 기본 설정
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).pipe(z.number().min(1000).max(65535)),

  // 데이터베이스 설정
  DB_HOST: z.string().min(1, 'DB_HOST는 필수입니다'),
  DB_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  DB_USERNAME: z.string().min(1, 'DB_USERNAME는 필수입니다'),
  DB_PASSWORD: z.string().optional().default(''),
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

  // Rate Limiting (선택적)
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),

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
    // 개발 환경에서는 더 유연한 검증 스키마 사용
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment) {
      // 개발 환경용 유연한 스키마
      const devEnvSchema = envSchema.partial().extend({
        NODE_ENV: z
          .enum(['development', 'production', 'test'])
          .default('development'),
        PORT: z
          .string()
          .default('5000')
          .transform(Number)
          .pipe(z.number().min(1000).max(65535)),
        DB_HOST: z.string().default('localhost'),
        DB_PORT: z
          .string()
          .default('3306')
          .transform(Number)
          .pipe(z.number().min(1).max(65535)),
        DB_USERNAME: z.string().default('root'),
        DB_PASSWORD: z.string().optional().default(''),
        DB_NAME: z.string().default('deukgeun_db'),
        JWT_SECRET: z
          .string()
          .default('development-jwt-secret-key-minimum-32-characters'),
        JWT_ACCESS_SECRET: z
          .string()
          .default('development-access-secret-key-minimum-32-characters'),
        JWT_REFRESH_SECRET: z
          .string()
          .default('development-refresh-secret-key-minimum-32-characters'),
        JWT_EXPIRES_IN: z.string().default('7d'),
        CORS_ORIGIN: z
          .string()
          .default('http://localhost:3000,http://localhost:5173'),
        EMAIL_HOST: z.string().default('smtp.gmail.com'),
        EMAIL_PORT: z
          .string()
          .default('587')
          .transform(Number)
          .pipe(z.number().min(1).max(65535)),
        EMAIL_USER: z.string().email().optional(),
        EMAIL_PASS: z.string().optional(),
      })

      const validatedEnv = devEnvSchema.parse(process.env)
      validateDevelopmentEnvironment(validatedEnv)
      console.log('✅ 개발 환경 변수 검증 완료')
      return validatedEnv
    } else {
      // 프로덕션 환경에서는 엄격한 검증
      const validatedEnv = envSchema.parse(process.env)
      validateProductionEnvironment(validatedEnv)
      console.log('✅ 프로덕션 환경 변수 검증 완료')
      return validatedEnv
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 환경 변수 검증 실패:')
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })

      // 개발 환경에서는 경고만 출력하고 계속 진행
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  개발 환경이므로 기본값으로 계속 진행합니다.')
        return process.env
      }
    } else {
      console.error('❌ 환경 변수 검증 중 오류 발생:', error)
    }

    // 프로덕션 환경에서만 종료
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }

    return process.env
  }
}

// 개발 환경 전용 검증
function validateDevelopmentEnvironment(env: any) {
  const warnings: string[] = []
  const info: string[] = []

  // 개발 환경에서는 비밀번호가 없어도 경고만 출력
  if (!env.DB_PASSWORD || env.DB_PASSWORD === '') {
    warnings.push(
      'DB_PASSWORD가 설정되지 않았습니다. MySQL root 계정에 비밀번호가 설정되어 있다면 연결이 실패할 수 있습니다.'
    )
  }

  // JWT 시크릿이 기본값인지 확인
  if (env.JWT_SECRET === 'development-jwt-secret-key-minimum-32-characters') {
    info.push('JWT_SECRET이 기본 개발용 값으로 설정되어 있습니다.')
  }

  // 이메일 설정이 없는 경우
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    info.push(
      '이메일 설정이 없습니다. 계정 복구 기능이 작동하지 않을 수 있습니다.'
    )
  }

  // API 키 설정 확인
  const apiKeys = [
    'KAKAO_API_KEY',
    'GOOGLE_PLACES_API_KEY',
    'SEOUL_OPENAPI_KEY',
    'VITE_GYM_API_KEY',
  ]
  const missingApiKeys = apiKeys.filter(
    key => !env[key] || env[key].includes('CHANGE_ME')
  )

  if (missingApiKeys.length > 0) {
    info.push(`API 키가 설정되지 않았습니다: ${missingApiKeys.join(', ')}`)
  }

  // 정보 출력
  if (info.length > 0) {
    console.log('ℹ️  개발 환경 정보:')
    info.forEach(info => console.log(`  - ${info}`))
  }

  // 경고 출력
  if (warnings.length > 0) {
    console.warn('⚠️  개발 환경 경고:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  console.log('🔧 개발 환경 설정 완료 - 일부 기능이 제한될 수 있습니다.')
}

// 프로덕션 환경 전용 검증
function validateProductionEnvironment(env: any) {
  const warnings: string[] = []
  const errors: string[] = []

  // 보안 검증
  if (
    !env.DB_PASSWORD ||
    env.DB_PASSWORD.includes('CHANGE_ME') ||
    env.DB_PASSWORD.length < 16
  ) {
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

  // reCAPTCHA 설정 검증
  if (
    env.RECAPTCHA_SECRET?.includes('your_production_recaptcha_secret_key') ||
    env.RECAPTCHA_SECRET?.includes('your_recaptcha_secret_key_here')
  ) {
    errors.push('RECAPTCHA_SECRET는 실제 production 키로 변경해야 합니다')
  }

  if (
    env.RECAPTCHA_SITE_KEY?.includes('your_production_recaptcha_site_key') ||
    env.RECAPTCHA_SITE_KEY?.includes('your_recaptcha_site_key_here')
  ) {
    errors.push('RECAPTCHA_SITE_KEY는 실제 production 키로 변경해야 합니다')
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
