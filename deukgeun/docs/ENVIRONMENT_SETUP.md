# 환경 설정 가이드

이 문서는 통합된 환경 변수 파일을 사용하여 개발환경과 프로덕션 환경을 관리하는 방법을 설명합니다.

## 📁 환경 변수 파일 구조

```
├── env.example          # 환경 변수 예시 파일
├── env.unified          # 통합 환경 변수 파일 (개발/프로덕션 모두 포함)
└── .env                 # 로컬 개발용 (gitignore에 포함, env.unified를 복사하여 사용)
```

## 🚀 통합 환경 변수 파일 사용법

### 개발 환경 (Development)

**파일**: `env.unified` (기본값이 개발환경으로 설정됨)

```bash
# 개발환경 설정 (기본값)
NODE_ENV=development
MODE=development
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5000,http://localhost:5001
```

**특징**:
- 로컬호스트 기반 URL 사용
- 디버그 로깅 활성화
- 모든 localhost 포트 허용
- 개발용 JWT 시크릿 사용

### 프로덕션 환경 (Production)

**파일**: `env.unified` (주석 해제하여 프로덕션 설정 사용)

```bash
# 프로덕션환경 설정 (주석 해제하여 사용)
NODE_ENV=production
MODE=production
VITE_BACKEND_URL=https://api.devtrail.net
VITE_FRONTEND_URL=https://devtrail.net
CORS_ORIGIN=https://devtrail.net,https://www.devtrail.net
```

**특징**:
- 실제 도메인 URL 사용
- 정보 로깅만 활성화
- 제한된 CORS 설정
- 강력한 JWT 시크릿 사용

## 🔧 설정 방법

### 1. 로컬 개발 환경 설정

```bash
# 통합 환경 변수 파일을 .env로 복사 (기본값이 개발환경)
cp env.unified .env

# 개발 서버 시작
npm run dev
```

### 2. 프로덕션 환경 설정

```bash
# 통합 환경 변수 파일을 .env로 복사
cp env.unified .env

# 프로덕션 설정으로 변경 (주석 해제)
nano .env

# 또는 자동화 스크립트 사용
./scripts/setup-production.sh
```

### 3. 환경 전환 스크립트

```bash
# 개발환경으로 전환
./scripts/setup-dev.sh

# 프로덕션환경으로 전환
./scripts/setup-prod.sh
```

## 🌐 환경별 API 엔드포인트

### 개발 환경
- **프론트엔드**: `http://localhost:5173`
- **백엔드**: `http://localhost:5000`
- **API Base URL**: `http://localhost:5000`

### 프로덕션 환경
- **프론트엔드**: `https://devtrail.net`
- **백엔드**: `https://api.devtrail.net`
- **API Base URL**: `https://api.devtrail.net`

## 🔒 CORS 설정

### 개발 환경
```javascript
// 모든 localhost 포트 허용
const devOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:5001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5001",
]
```

### 프로덕션 환경
```javascript
// 환경 변수에서 허용된 도메인만 허용
const corsOrigins = config.corsOrigin || []
```

## 🔐 JWT 설정

### 개발 환경
```bash
JWT_SECRET=dev_jwt_secret_key_2024
JWT_ACCESS_SECRET=dev_access_secret_2024
JWT_REFRESH_SECRET=dev_refresh_secret_2024
```

### 프로덕션 환경
```bash
JWT_SECRET=your_production_jwt_secret_key
JWT_ACCESS_SECRET=your_production_access_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
```

## 📊 로깅 설정

### 개발 환경
```bash
LOG_LEVEL=debug
```

### 프로덕션 환경
```bash
LOG_LEVEL=info
```

## 🚀 배포 시 주의사항

### 1. 환경 변수 확인
```bash
# 프로덕션 배포 전 확인
echo $NODE_ENV
echo $VITE_BACKEND_URL
echo $CORS_ORIGIN
```

### 2. 보안 설정 확인
- JWT 시크릿이 강력한지 확인
- CORS 설정이 올바른지 확인
- API 키가 올바르게 설정되었는지 확인

### 3. 데이터베이스 연결 확인
```bash
# 데이터베이스 연결 테스트
npm run test:db
```

## 🔄 환경 전환

### 개발에서 프로덕션으로
```bash
# 1. 통합 환경 변수 파일을 .env로 복사
cp env.unified .env

# 2. 프로덕션 설정 주석 해제 (자동화 스크립트 사용)
./scripts/setup-prod.sh

# 3. 빌드
npm run build

# 4. 재시작
npm run start:prod
```

### 프로덕션에서 개발로
```bash
# 1. 통합 환경 변수 파일을 .env로 복사
cp env.unified .env

# 2. 개발 설정으로 전환 (자동화 스크립트 사용)
./scripts/setup-dev.sh

# 3. 개발 서버 시작
npm run dev
```

### 수동 환경 전환
```bash
# .env 파일에서 다음 설정들을 변경:

# 개발환경 → 프로덕션환경
# NODE_ENV=development → NODE_ENV=production
# MODE=development → MODE=production
# VITE_BACKEND_URL=http://localhost:5000 → VITE_BACKEND_URL=https://api.devtrail.net
# VITE_FRONTEND_URL=http://localhost:5173 → VITE_FRONTEND_URL=https://devtrail.net
# LOG_LEVEL=debug → LOG_LEVEL=info
# ENABLE_MONITORING=false → ENABLE_MONITORING=true
# AUTO_UPDATE_ENABLED=false → AUTO_UPDATE_ENABLED=true
```

## 🐛 문제 해결

### CORS 오류
```bash
# CORS 설정 확인
grep CORS_ORIGIN .env

# 백엔드 재시작
npm run restart:backend
```

### API 연결 오류
```bash
# API URL 확인
echo $VITE_BACKEND_URL

# 네트워크 연결 테스트
curl $VITE_BACKEND_URL/health
```

### 토큰 갱신 오류
```bash
# JWT 설정 확인
grep JWT .env

# 로그 확인
tail -f logs/app.log
```

## 📝 추가 설정

### 환경별 기능 플래그
```bash
# 개발 환경
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_API=true

# 프로덕션 환경
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_API=false
```

### 모니터링 설정
```bash
# 프로덕션에서만 활성화
ENABLE_MONITORING=true
MONITORING_PORT=9090
```

이제 환경별로 적절한 설정을 사용하여 개발과 프로덕션 환경을 분리할 수 있습니다.
