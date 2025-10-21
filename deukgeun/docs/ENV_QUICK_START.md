# 🚀 환경 변수 빠른 시작 가이드

## 📁 파일 구조

```
├── env.unified          # 통합 환경 변수 파일 (개발/프로덕션 모두 포함)
├── env.example          # 환경 변수 예시 파일
└── .env                 # 실제 사용할 환경 변수 파일 (gitignore에 포함)
```

## ⚡ 빠른 설정

### 1. 개발환경 설정

```bash
# Windows
scripts\setup-dev.bat

# Linux/Mac
./scripts/setup-dev.sh
```

### 2. 프로덕션환경 설정

```bash
# Windows
scripts\setup-prod.bat

# Linux/Mac
./scripts/setup-prod.sh
```

## 🔧 수동 설정

### 개발환경
```bash
# 1. 통합 파일 복사
cp env.unified .env

# 2. 개발 서버 시작
npm run dev
```

### 프로덕션환경
```bash
# 1. 통합 파일 복사
cp env.unified .env

# 2. .env 파일에서 프로덕션 설정 주석 해제
# NODE_ENV=production
# MODE=production
# VITE_BACKEND_URL=https://api.devtrail.net
# VITE_FRONTEND_URL=https://devtrail.net
# LOG_LEVEL=info
# ENABLE_MONITORING=true
# AUTO_UPDATE_ENABLED=true

# 3. 빌드 및 배포
npm run build
npm run start:prod
```

## 🎯 주요 설정값

| 설정 | 개발환경 | 프로덕션환경 |
|------|----------|-------------|
| NODE_ENV | development | production |
| VITE_BACKEND_URL | http://localhost:5000 | https://api.devtrail.net |
| VITE_FRONTEND_URL | http://localhost:5173 | https://devtrail.net |
| LOG_LEVEL | debug | info |
| ENABLE_MONITORING | false | true |
| AUTO_UPDATE_ENABLED | false | true |

## 🐛 문제 해결

### 환경 변수 검증
```bash
# 환경 변수 검증 실행
npm run validate-env

# 또는 직접 확인
node -e "require('./src/shared/utils/envValidator').runEnvironmentValidation()"
```

### CORS 오류
```bash
# CORS 설정 확인
grep CORS_ORIGIN .env

# CORS 설정이 비어있는 경우
echo "CORS_ORIGIN=http://localhost:5173" >> .env
```

### API 연결 오류
```bash
# API URL 확인
grep VITE_BACKEND_URL .env

# API URL이 설정되지 않은 경우
echo "VITE_BACKEND_URL=http://localhost:5000" >> .env
```

### 환경 확인
```bash
# 현재 환경 확인
grep NODE_ENV .env
grep MODE .env

# 필수 환경 변수 확인
grep -E "VITE_BACKEND_URL|VITE_FRONTEND_URL|CORS_ORIGIN" .env
```

### 환경 변수 누락 오류
```bash
# 필수 환경 변수가 누락된 경우
cp env.unified .env
# 또는
./scripts/setup-dev.bat  # Windows
./scripts/setup-dev.sh   # Linux/Mac
```

### 백엔드 CORS 오류
```bash
# 백엔드 CORS 설정 확인
grep CORS_ORIGIN .env

# CORS 설정이 비어있는 경우 (개발환경)
echo "CORS_ORIGIN=http://localhost:5173,http://localhost:3000" >> .env

# CORS 설정이 비어있는 경우 (프로덕션)
echo "CORS_ORIGIN=https://devtrail.net,https://www.devtrail.net" >> .env
```

### 백엔드 시작 시 경고 메시지
```bash
# 환경 변수가 설정되지 않은 경우 나타나는 경고
⚠️ CORS_ORIGIN 환경 변수가 설정되지 않았습니다. 기본 localhost 설정을 사용합니다.
⚠️ 백엔드 환경 변수가 설정되지 않았습니다: CORS_ORIGIN, JWT_SECRET
⚠️ 일부 기능이 제한될 수 있습니다.
```

### 프론트엔드 시작 시 경고 메시지
```bash
# 환경 변수가 설정되지 않은 경우 나타나는 경고
⚠️ 프론트엔드 환경 변수가 설정되지 않았습니다: VITE_BACKEND_URL, VITE_FRONTEND_URL
⚠️ API 연결에 문제가 발생할 수 있습니다.
⚠️ VITE_BACKEND_URL 환경 변수가 설정되지 않았습니다.
⚠️ API 연결에 문제가 발생할 수 있습니다.
```

### 환경 변수 검증 오류 해결
```bash
# process is not defined 오류 해결
# 이 오류는 프론트엔드에서 process.env를 사용할 때 발생합니다.
# 수정된 코드에서는 자동으로 환경을 감지하여 적절한 방법을 사용합니다.

# 환경 변수 검증 실행
npm run validate-env
```

## 📝 추가 정보

- 상세한 설정 가이드: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
- 통합 환경 변수 파일: [env.unified](./env.unified)
