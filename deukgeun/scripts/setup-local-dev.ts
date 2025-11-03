#!/usr/bin/env ts-node

/**
 * 로컬 개발 환경 설정 스크립트
 * 로컬에서 개발할 때 필요한 환경 변수와 설정을 자동으로 구성합니다.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// 로컬 개발용 환경 변수 설정
const localEnvConfig = {
  // 루트 .env 파일
  root: `# Frontend Environment Variables
VITE_FRONTEND_PORT=5173
VITE_BACKEND_URL=http://localhost:5000

# Kakao Map API Keys (실제 값은 .env 파일에 설정하세요)
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_map_api_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_rest_map_api_key

# Gym API Key (실제 값은 .env 파일에 설정하세요)
VITE_GYM_API_KEY=your_gym_api_key

# reCAPTCHA (실제 값은 .env 파일에 설정하세요)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Backend Environment Variables
NODE_ENV=development
BACKEND_PORT=5000

# Database Configuration (실제 값은 .env 파일에 설정하세요)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
DB_DATABASE=deukgeun_db

# JWT Configuration (실제 값은 .env 파일에 설정하세요 - 강력한 랜덤 문자열 사용)
JWT_SECRET=your_production_jwt_secret_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Email Configuration (for account recovery)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3000`,

  // 백엔드 .env 파일
  backend: `# ============================================================================
# Deukgeun Backend 환경 변수 - 로컬 개발용
# ============================================================================

# ============================================================================
# 🚀 애플리케이션 기본 설정
# ============================================================================
NODE_ENV=development
PORT=5000

# ============================================================================
# 🌐 CORS 설정
# ============================================================================
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# ============================================================================
# 🗄️ 데이터베이스 설정 (MySQL)
# ============================================================================
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=deukgeun_db

# ============================================================================
# 🔐 JWT 인증 설정
# ============================================================================
JWT_SECRET=your_production_jwt_secret_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d
# ACCESS TOKEN (실제 값은 .env 파일에 설정하세요 - 강력한 랜덤 문자열 사용)
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here_make_it_long_and_random
JWT_ACCESS_EXPIRES_IN=15m
# REFRESH TOKEN (실제 값은 .env 파일에 설정하세요 - 강력한 랜덤 문자열 사용)
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_long_and_random
JWT_REFRESH_EXPIRES_IN=7d

# ============================================================================
# 🛡️ 보안 설정
# ============================================================================
RECAPTCHA_SECRET=your_recaptcha_secret_key
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
ACCESS_TOKEN_SECRET=yourAccessSecret
REFRESH_TOKEN_SECRET=yourRefreshSecret
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# ============================================================================
# 📧 이메일 설정 (Gmail SMTP)
# ============================================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ============================================================================
# 📱 SMS 설정
# ============================================================================
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
SMS_FROM=your_sms_from_number

# ============================================================================
# 📁 파일 업로드 설정
# ============================================================================
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# ============================================================================
# ⏰ 스케줄러 설정
# ============================================================================
AUTO_UPDATE_ENABLED=true
AUTO_UPDATE_HOUR=6
AUTO_UPDATE_MINUTE=0
AUTO_UPDATE_TYPE=enhanced
AUTO_UPDATE_INTERVAL_DAYS=3

# ============================================================================
# 🗺️ 카카오 API 설정 (실제 값은 .env 파일에 설정하세요)
# ============================================================================
KAKAO_API_KEY=your_kakao_api_key
KAKAO_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_map_api_key
KAKAO_Location_MobileMapApiKey=your_kakao_location_mobile_map_api_key
KAKAO_REST_MAP_API_KEY=your_kakao_rest_map_api_key
KAKAO_Location_AdminMapKey=your_kakao_location_admin_map_key

# ============================================================================
# 🔍 구글 API 설정 (실제 값은 .env 파일에 설정하세요)
# ============================================================================
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_secure_secret_generator=your_google_secure_secret

# ============================================================================
# 🏛️ 서울시 API 설정 (실제 값은 .env 파일에 설정하세요)
# ============================================================================
SEOUL_OPENAPI_KEY=your_seoul_openapi_key

# ============================================================================
# 🏋️ 헬스장 API 설정 (실제 값은 .env 파일에 설정하세요)
# ============================================================================
VITE_GYM_API_KEY=your_gym_api_key`
}

function setupLocalEnvironment() {
  console.log('🚀 로컬 개발 환경 설정을 시작합니다...\n')

  try {
    // 루트 .env 파일 생성
    const rootEnvPath = '.env'
    if (!existsSync(rootEnvPath)) {
      writeFileSync(rootEnvPath, localEnvConfig.root)
      console.log('✅ 루트 .env 파일이 생성되었습니다.')
    } else {
      console.log('⚠️  루트 .env 파일이 이미 존재합니다.')
    }

    // 백엔드 .env 파일 생성
    const backendEnvPath = 'src/backend/.env'
    if (!existsSync(backendEnvPath)) {
      writeFileSync(backendEnvPath, localEnvConfig.backend)
      console.log('✅ 백엔드 .env 파일이 생성되었습니다.')
    } else {
      console.log('⚠️  백엔드 .env 파일이 이미 존재합니다.')
    }

    // uploads 디렉토리 생성
    const uploadsDir = 'src/backend/uploads'
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true })
      console.log('✅ uploads 디렉토리가 생성되었습니다.')
    }

    console.log('\n🎉 로컬 개발 환경 설정이 완료되었습니다!')
    console.log('\n📋 다음 단계:')
    console.log('1. .env 파일들에서 실제 값으로 변경하세요 (특히 DB_PASSWORD, JWT_SECRET 등)')
    console.log('2. MySQL 데이터베이스가 실행 중인지 확인하세요')
    console.log('3. npm run dev:full 명령어로 개발 서버를 시작하세요')

  } catch (error) {
    console.error('❌ 환경 설정 중 오류가 발생했습니다:', error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  setupLocalEnvironment()
}

export { setupLocalEnvironment }
