# 환경변수 설정 가이드

## 포트 설정

- **프론트엔드**: `http://localhost:5173` (Vite 기본)
- **백엔드**: `http://localhost:3001`

## 프론트엔드 환경변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# Google reCAPTCHA Site Key (v3)
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Kakao Map API Keys
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_api_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_rest_api_key

# Gym API Key
VITE_GYM_API_KEY=your_gym_api_key
```

## 백엔드 환경변수

백엔드 프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=gym_db

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-minimum-32-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-minimum-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google reCAPTCHA Secret Key
RECAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# API Keys
KAKAO_REST_MAP_API_KEY=your_kakao_rest_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
SEOUL_OPENAPI_KEY=your_seoul_openapi_key

# Auto-update scheduler configuration
AUTO_UPDATE_HOUR=6
AUTO_UPDATE_MINUTE=0
AUTO_UPDATE_TYPE=enhanced
AUTO_UPDATE_ENABLED=false
```

## reCAPTCHA 설정

1. [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)에 접속
2. 새 사이트 등록
3. reCAPTCHA v3 선택
4. 도메인 등록 (개발 시: `localhost`, `127.0.0.1`)
5. Site Key와 Secret Key를 환경변수에 설정

## 개발용 더미 reCAPTCHA

개발 환경에서는 Google에서 제공하는 테스트 키를 사용할 수 있습니다:

- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

## 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 강력한 비밀키를 사용하세요
- JWT_SECRET은 최소 32자 이상의 랜덤 문자열을 사용하세요

## 개발 서버 실행

### 개별 실행

```bash
# 프론트엔드만 실행
npm run dev:frontend

# 백엔드만 실행
npm run dev:backend
```

### 동시 실행 (권장)

```bash
# 프론트엔드와 백엔드를 동시에 실행
npm run dev:all
```

## 환경변수 확인

프로젝트 실행 전 다음 사항들을 확인하세요:

1. 프론트엔드와 백엔드의 `.env` 파일이 올바르게 설정되었는지 확인
2. 백엔드 서버가 실행 중인지 확인 (포트 3001)
3. 프론트엔드 서버가 실행 중인지 확인 (포트 5173)
4. 데이터베이스 연결이 정상적인지 확인
5. reCAPTCHA 키가 올바른지 확인

## 포트 충돌 해결

### 자동 해결 (권장)

```bash
# 포트 사용 현황 확인 및 프로세스 종료
npm run check-ports
```

### 수동 해결

만약 포트가 이미 사용 중인 경우:

1. **프론트엔드 포트 변경**: `vite.config.ts`에서 `port` 값 수정
2. **백엔드 포트 변경**: `.env` 파일에서 `PORT` 값 수정
3. **프로세스 종료**:

   ```bash
   # 포트 사용 프로세스 확인
   netstat -ano | findstr :5173
   netstat -ano | findstr :3001

   # 프로세스 종료 (PID는 위 명령어로 확인)
   taskkill /F /PID <PID>
   ```

## 환경변수 파일 생성

### 프론트엔드 (.env)

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_api_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_rest_api_key
VITE_GYM_API_KEY=your_gym_api_key
```

### 백엔드 (.env)

`src/backend/` 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=gym_db
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-minimum-32-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-minimum-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RECAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
CORS_ORIGIN=http://localhost:5173
KAKAO_REST_MAP_API_KEY=your_kakao_rest_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
SEOUL_OPENAPI_KEY=your_seoul_openapi_key
AUTO_UPDATE_HOUR=6
AUTO_UPDATE_MINUTE=0
AUTO_UPDATE_TYPE=enhanced
AUTO_UPDATE_ENABLED=false
```
