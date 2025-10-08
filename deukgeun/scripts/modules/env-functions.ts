/**
 * 함수형 환경 설정 모듈
 * 환경 변수 설정 및 관리를 위한 공통 기능
 */

import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger-functions'

interface EnvConfig {
  projectRoot: string
  backendDir: string
  frontendDir: string
  env: string
  verbose: boolean
}

interface EnvFile {
  path: string
  content: string
  description: string
}

/**
 * 환경 설정 파일 생성
 */
export function createEnvFiles(config: EnvConfig): boolean {
  try {
    logStep('ENV', '환경 설정 파일 생성 중...')
    
    const envFiles = generateEnvFiles(config)
    let success = true
    
    for (const envFile of envFiles) {
      if (createEnvFile(envFile)) {
        logSuccess(`✅ ${envFile.description} 생성 완료`)
      } else {
        success = false
        logError(`❌ ${envFile.description} 생성 실패`)
      }
    }
    
    return success

  } catch (error) {
    logError(`환경 설정 파일 생성 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 환경 파일 목록 생성
 */
function generateEnvFiles(config: EnvConfig): EnvFile[] {
  const envFiles: EnvFile[] = []
  
  // 루트 .env 파일
  const rootEnvPath = path.join(config.projectRoot, '.env')
  if (!fs.existsSync(rootEnvPath)) {
    envFiles.push({
      path: rootEnvPath,
      content: generateRootEnvContent(config),
      description: '루트 .env 파일'
    })
  }
  
  // 백엔드 .env 파일
  const backendEnvPath = path.join(config.backendDir, '.env')
  if (!fs.existsSync(backendEnvPath)) {
    envFiles.push({
      path: backendEnvPath,
      content: generateBackendEnvContent(config),
      description: '백엔드 .env 파일'
    })
  }
  
  // 프론트엔드 .env 파일
  const frontendEnvPath = path.join(config.frontendDir, '.env')
  if (!fs.existsSync(frontendEnvPath)) {
    envFiles.push({
      path: frontendEnvPath,
      content: generateFrontendEnvContent(config),
      description: '프론트엔드 .env 파일'
    })
  }
  
  return envFiles
}

/**
 * 루트 .env 파일 내용 생성
 */
function generateRootEnvContent(config: EnvConfig): string {
  return `# Frontend Environment Variables
VITE_FRONTEND_PORT=5173
VITE_BACKEND_URL=http://3.36.230.117:5000

# reCAPTCHA Enterprise 설정
VITE_RECAPTCHA_SITE_KEY=6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG

# Kakao Map API Keys
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=c5c2b4e24825e98afcd558c58002519c
VITE_LOCATION_REST_MAP_API_KEY=096728d472e6d5331b08e3318a2b4286

# Gym API Key
VITE_GYM_API_KEY=your_gym_api_key

# Backend Environment Variables
NODE_ENV=${config.env}
BACKEND_PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=deukgeun

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10MB

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security Configuration
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Development Configuration
DEBUG=true
HOT_RELOAD=true
`
}

/**
 * 백엔드 .env 파일 내용 생성
 */
function generateBackendEnvContent(config: EnvConfig): string {
  return `# Backend Environment Variables
NODE_ENV=${config.env}
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=deukgeun
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@deukgeun.com

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TTL=3600

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/backend.log
LOG_MAX_SIZE=10MB
LOG_MAX_FILES=5

# Security Configuration
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
BCRYPT_ROUNDS=12

# API Configuration
API_VERSION=v1
API_PREFIX=/api
SWAGGER_ENABLED=true

# Development Configuration
DEBUG=true
HOT_RELOAD=true
`
}

/**
 * 프론트엔드 .env 파일 내용 생성
 */
function generateFrontendEnvContent(config: EnvConfig): string {
  return `# Frontend Environment Variables
VITE_FRONTEND_PORT=5173
VITE_BACKEND_URL=http://3.36.230.117:5000
VITE_API_URL=http://3.36.230.117:5000/api

# reCAPTCHA Enterprise 설정
VITE_RECAPTCHA_SITE_KEY=6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG

# Kakao Map API Keys
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=c5c2b4e24825e98afcd558c58002519c
VITE_LOCATION_REST_MAP_API_KEY=096728d472e6d5331b08e3318a2b4286

# Gym API Key
VITE_GYM_API_KEY=your_gym_api_key

# Development Configuration
VITE_DEBUG=true
VITE_HOT_RELOAD=true
VITE_DEV_SERVER_PORT=5173

# Build Configuration
VITE_BUILD_TARGET=esnext
VITE_BUILD_MINIFY=true
VITE_BUILD_SOURCEMAP=false

# Feature Flags
VITE_FEATURE_AUTH=true
VITE_FEATURE_MAPS=true
VITE_FEATURE_GYMS=true
VITE_FEATURE_RECAPTCHA=true
`
}

/**
 * 환경 파일 생성
 */
function createEnvFile(envFile: EnvFile): boolean {
  try {
    const dir = path.dirname(envFile.path)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(envFile.path, envFile.content, 'utf8')
    return true

  } catch (error) {
    logError(`환경 파일 생성 실패: ${envFile.path} - ${(error as Error).message}`)
    return false
  }
}

/**
 * 환경 파일 검증
 */
export function validateEnvFiles(config: EnvConfig): boolean {
  try {
    logStep('VALIDATE', '환경 파일 검증 중...')
    
    const requiredFiles = [
      { path: path.join(config.projectRoot, '.env'), name: '루트 .env' },
      { path: path.join(config.backendDir, '.env'), name: '백엔드 .env' },
      { path: path.join(config.frontendDir, '.env'), name: '프론트엔드 .env' }
    ]
    
    let allValid = true
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file.path)) {
        logSuccess(`✅ ${file.name} 파일 존재`)
      } else {
        logError(`❌ ${file.name} 파일 없음`)
        allValid = false
      }
    }
    
    return allValid

  } catch (error) {
    logError(`환경 파일 검증 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 환경 변수 로드
 */
export function loadEnvVariables(config: EnvConfig): Record<string, string> {
  const envVars: Record<string, string> = {}
  
  try {
    const envFiles = [
      path.join(config.projectRoot, '.env'),
      path.join(config.backendDir, '.env'),
      path.join(config.frontendDir, '.env')
    ]
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, 'utf8')
        const lines = content.split('\n')
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=')
            if (key && valueParts.length > 0) {
              envVars[key.trim()] = valueParts.join('=').trim()
            }
          }
        }
      }
    }
    
    logInfo(`환경 변수 ${Object.keys(envVars).length}개 로드됨`)
    return envVars

  } catch (error) {
    logError(`환경 변수 로드 실패: ${(error as Error).message}`)
    return {}
  }
}

/**
 * 환경 설정 요약 출력
 */
export function printEnvSummary(config: EnvConfig): void {
  logInfo('\n📋 환경 설정 요약:')
  logInfo(`- 프로젝트: ${config.projectRoot}`)
  logInfo(`- 백엔드: ${config.backendDir}`)
  logInfo(`- 프론트엔드: ${config.frontendDir}`)
  logInfo(`- 환경: ${config.env}`)
  logInfo(`- 상세 로그: ${config.verbose ? '활성화' : '비활성화'}`)
}

/**
 * 환경 설정 완료
 */
export function completeEnvSetup(config: EnvConfig): void {
  logStep('COMPLETE', '환경 설정 완료 중...')
  
  logSuccess('🎉 환경 설정이 완료되었습니다!')
  logInfo('\n다음 단계:')
  logInfo('1. .env 파일들을 확인하고 필요한 값들을 수정하세요')
  logInfo('2. 데이터베이스 연결 정보를 확인하세요')
  logInfo('3. API 키들을 설정하세요')
  logInfo('4. npm run dev 명령어로 개발 서버를 시작하세요')
}
