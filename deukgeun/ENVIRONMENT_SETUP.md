# 환경 변수 설정 가이드

이 문서는 Deukgeun 프로젝트의 환경 변수 설정 방법을 설명합니다.

## 📋 개요

프로젝트는 두 개의 환경 변수 파일을 사용합니다:
- **루트 .env**: 프론트엔드 환경 변수
- **src/backend/.env**: 백엔드 환경 변수

## 🚀 빠른 시작

### 1. 개발 환경 설정

```bash
# 환경 변수 파일 생성
npm run setup:env

# 또는 수동으로 생성
cp env.example .env
cp src/backend/env.sample src/backend/.env
```

### 2. 프로덕션 배포 설정

```bash
# 프로덕션 환경 변수 설정
npm run setup:env:deploy
```

## 📁 파일 구조

```
deukgeun/
├── .env                    # 프론트엔드 환경 변수 (자동 생성)
├── env.example            # 프론트엔드 환경 변수 템플릿
├── env.production         # 프로덕션 환경 변수 템플릿
├── src/backend/
│   ├── .env              # 백엔드 환경 변수 (자동 생성)
│   └── env.sample        # 백엔드 환경 변수 템플릿
└── scripts/
    ├── setup-env.js      # 개발 환경 설정 스크립트
    └── deploy-env.js     # 배포 환경 설정 스크립트
```

## 🔧 환경 변수 설정

### 프론트엔드 환경 변수 (.env)

```bash
# Frontend Environment Variables
VITE_FRONTEND_PORT=5173
VITE_BACKEND_URL=http://localhost:5000

# Kakao Map API Keys
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_api_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_rest_api_key

# Gym API Key
VITE_GYM_API_KEY=your_gym_api_key

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 백엔드 환경 변수 (src/backend/.env)

```bash
# 애플리케이션 기본 설정
NODE_ENV=development
PORT=5000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=deukgeun_db

# JWT 인증 설정
JWT_SECRET=your-jwt-secret-key-for-development
JWT_ACCESS_SECRET=your-jwt-access-secret-for-development
JWT_REFRESH_SECRET=your-jwt-refresh-secret-for-development

# 이메일 설정
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🚀 배포 시 환경 변수 처리

### 방법 1: 환경 변수 템플릿 사용 (권장)

1. **env.production 파일 준비**
   ```bash
   # env.production 파일에 실제 프로덕션 값 설정
   cp env.example env.production
   # env.production 파일을 편집하여 실제 값으로 변경
   ```

2. **배포 시 자동 설정**
   ```bash
   # 배포 스크립트가 자동으로 환경 변수 설정
   npm run deploy:ec2
   ```

### 방법 2: Docker 환경 변수 주입

```bash
# Docker 실행 시 환경 변수 주입
docker run -e NODE_ENV=production \
           -e DB_HOST=your_db_host \
           -e DB_PASSWORD=your_db_password \
           your-image-name
```

### 방법 3: 시스템 환경 변수 사용

```bash
# 시스템 환경 변수 설정
export NODE_ENV=production
export DB_HOST=your_db_host
export DB_PASSWORD=your_db_password

# 애플리케이션 실행
npm start
```

## 🔒 보안 고려사항

### 1. 민감한 정보 보호

- **절대 Git에 커밋하지 마세요**: `.env` 파일은 `.gitignore`에 포함되어 있습니다.
- **강력한 비밀번호 사용**: JWT 시크릿, 데이터베이스 비밀번호 등은 충분히 복잡하게 설정하세요.
- **환경별 분리**: 개발, 스테이징, 프로덕션 환경을 분리하여 관리하세요.

### 2. 프로덕션 환경 변수

```bash
# 프로덕션용 강력한 JWT 시크릿
JWT_SECRET=your_production_jwt_secret_key_here_make_it_long_and_random
JWT_ACCESS_SECRET=your_production_access_secret_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_production_refresh_secret_key_here_make_it_long_and_random

# 프로덕션 데이터베이스
DB_HOST=your_production_db_host
DB_PASSWORD=your_secure_production_password
```

## 🛠️ 문제 해결

### 1. 환경 변수가 로드되지 않는 경우

```bash
# 환경 변수 파일 존재 확인
ls -la .env
ls -la src/backend/.env

# 환경 변수 설정 스크립트 재실행
npm run setup:env
```

### 2. 배포 시 환경 변수 문제

```bash
# 배포 환경 변수 설정 확인
npm run setup:env:deploy

# 생성된 파일 확인
cat .env
cat src/backend/.env
```

### 3. Docker 환경에서 문제

```bash
# Docker 빌드 시 환경 변수 확인
docker build -t deukgeun .
docker run --env-file .env deukgeun
```

## 📝 스크립트 설명

### setup-env.js
- 개발 환경용 환경 변수 파일 생성
- env.example과 env.sample을 기반으로 .env 파일 생성

### deploy-env.js
- 프로덕션 배포용 환경 변수 설정
- env.production 파일을 기반으로 환경 변수 생성
- 백엔드와 프론트엔드 환경 변수 분리

## 🔄 자동화

### CI/CD 파이프라인에서 사용

```yaml
# GitHub Actions 예시
- name: Setup Environment
  run: npm run setup:env:deploy

- name: Build Application
  run: npm run build:production
```

### PM2 환경 변수 설정

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'deukgeun-backend',
    script: 'dist/backend/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DB_HOST: process.env.DB_HOST,
      DB_PASSWORD: process.env.DB_PASSWORD
    }
  }]
}
```

## 📞 지원

환경 변수 설정에 문제가 있으면 다음을 확인하세요:

1. **파일 권한**: .env 파일이 읽기 가능한지 확인
2. **파일 경로**: 올바른 위치에 .env 파일이 있는지 확인
3. **환경 변수 이름**: 대소문자와 언더스코어가 정확한지 확인
4. **값 형식**: 따옴표나 특수 문자가 올바른지 확인

---

이 가이드를 따라하면 Deukgeun 프로젝트의 환경 변수를 안전하고 효율적으로 관리할 수 있습니다.
