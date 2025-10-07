#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 환경 변수 설정 스크립트
 * 배포 시 .env 파일을 생성하고 필요한 환경 변수를 설정합니다.
 */

function setupEnvironment() {
  const rootDir = path.join(__dirname, '..');
  const backendDir = path.join(rootDir, 'src', 'backend');
  
  console.log('🚀 환경 변수 설정을 시작합니다...');
  
  // 1. 루트 .env 파일 생성
  const rootEnvPath = path.join(rootDir, '.env');
  const rootEnvExamplePath = path.join(rootDir, 'env.example');
  
  if (fs.existsSync(rootEnvExamplePath) && !fs.existsSync(rootEnvPath)) {
    fs.copyFileSync(rootEnvExamplePath, rootEnvPath);
    console.log('✅ 루트 .env 파일이 생성되었습니다.');
  } else if (fs.existsSync(rootEnvPath)) {
    console.log('ℹ️  루트 .env 파일이 이미 존재합니다.');
  } else {
    // env.example이 없으면 기본 .env 파일 생성
    const defaultEnvContent = `# Frontend Environment Variables
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
NODE_ENV=development
BACKEND_PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=deukgeun_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
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
CORS_ORIGIN=http://localhost:5173,http://3.36.230.117:3000,http://3.36.230.117:5000,https://devtrail.net,https://www.devtrail.net`;
    
    fs.writeFileSync(rootEnvPath, defaultEnvContent);
    console.log('✅ 기본 루트 .env 파일이 생성되었습니다.');
  }
  
  // 2. 백엔드 .env 파일 생성
  const backendEnvPath = path.join(backendDir, '.env');
  const backendEnvExamplePath = path.join(backendDir, 'env.sample');
  
  if (fs.existsSync(backendEnvExamplePath) && !fs.existsSync(backendEnvPath)) {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    console.log('✅ 백엔드 .env 파일이 생성되었습니다.');
  } else if (fs.existsSync(backendEnvPath)) {
    console.log('ℹ️  백엔드 .env 파일이 이미 존재합니다.');
  } else {
    // env.sample이 없으면 기본 백엔드 .env 파일 생성
    const defaultBackendEnvContent = `# ============================================================================
# Deukgeun Backend 환경 변수 설정
# ============================================================================

# ============================================================================
# 🚀 애플리케이션 기본 설정
# ============================================================================
NODE_ENV=development
PORT=5000

# ============================================================================
# 🌐 CORS 설정
# ============================================================================
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://3.36.230.117:3000,http://3.36.230.117:5000,https://devtrail.net,https://www.devtrail.net

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
JWT_SECRET=your-jwt-secret-key-for-development
JWT_EXPIRES_IN=7d
# ACCESS TOKEN
JWT_ACCESS_SECRET=your-jwt-access-secret-for-development
JWT_ACCESS_EXPIRES_IN=15m
# REFRESH TOKEN
JWT_REFRESH_SECRET=your-jwt-refresh-secret-for-development
JWT_REFRESH_EXPIRES_IN=7d

# ============================================================================
# 🛡️ reCAPTCHA Enterprise 보안 설정
# ============================================================================
RECAPTCHA_SECRET=your_recaptcha_enterprise_secret_key
RECAPTCHA_SITE_KEY=6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG
RECAPTCHA_PROJECT_ID=secure-theme-468004-f1
RECAPTCHA_API_KEY=your_recaptcha_enterprise_api_key
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
# 🗺️ 카카오 API 설정
# ============================================================================
KAKAO_API_KEY=a15bf17d25ab2adec8208f1fdeca3bf8
KAKAO_JAVASCRIPT_MAP_API_KEY=c5c2b4e24825e98afcd558c58002519c
KAKAO_Location_MobileMapApiKey=c5c2b4e24825e98afcd558c58002519c
KAKAO_REST_MAP_API_KEY=096728d472e6d5331b08e3318a2b4286
KAKAO_Location_AdminMapKey=1ac1e90eb3199352cc87542696395ec4

# ============================================================================
# 🔍 구글 API 설정
# ============================================================================
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_secure_secret_generator=your_google_secure_secret

# ============================================================================
# 🏛️ 서울시 API 설정
# ============================================================================
SEOUL_OPENAPI_KEY=your_seoul_openapi_key

# ============================================================================
# 🏋️ 헬스장 API 설정
# ============================================================================
VITE_GYM_API_KEY=your_gym_api_key`;
    
    fs.writeFileSync(backendEnvPath, defaultBackendEnvContent);
    console.log('✅ 기본 백엔드 .env 파일이 생성되었습니다.');
  }
  
  // 3. 프로덕션 환경 변수 확인
  const productionEnvPath = path.join(rootDir, 'env.production');
  if (fs.existsSync(productionEnvPath)) {
    console.log('ℹ️  프로덕션 환경 변수 파일이 존재합니다.');
    console.log('   배포 시 env.production 파일을 .env로 복사하세요.');
  }
  
  console.log('🎉 환경 변수 설정이 완료되었습니다!');
  console.log('');
  console.log('📝 다음 단계:');
  console.log('1. .env 파일들을 열어서 실제 값으로 수정하세요.');
  console.log('2. 데이터베이스 연결 정보를 확인하세요.');
  console.log('3. API 키들을 실제 값으로 설정하세요.');
}

// 스크립트 실행
setupEnvironment();

export { setupEnvironment };
