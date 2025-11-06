# 환경 변수 참조 구조 분석

## 📋 현재 구조 분석

### 1. **백엔드 환경 변수 로딩** (`src/backend/config/env.ts`)

**우선순위 순서:**
1. `src/backend/.env.local` (최우선)
2. `src/backend/.env`
3. `src/backend/env.production` (NODE_ENV=production일 때)
4. `src/backend/env.development` (NODE_ENV=development일 때)
5. 프로젝트 루트 `.env.local`
6. 프로젝트 루트 `.env`
7. **프로젝트 루트 `env.production`** (NODE_ENV=production일 때) ← **생성됨**
8. 프로젝트 루트 `env.development`
9. 현재 디렉토리 `.env.local`
10. 현재 디렉토리 `.env`

**⚠️ 중요: `env.unified`는 참조되지 않음!**
- 단순 템플릿 파일
- 실제 환경 변수 로딩에 사용되지 않음

### 2. **프론트엔드 환경 변수 로딩** (`vite.config.ts`)

**Vite의 `loadEnv()` 함수 사용:**
- 프로젝트 루트에서: `.env`, `.env.local`, `.env.[mode]`, `.env.[mode].local`
- `src/frontend` 디렉토리에서: `.env`, `.env.local`, `.env.[mode]`, `.env.[mode].local`
- `mode`는 `development` 또는 `production`

**⚠️ 중요: `env.unified`는 참조되지 않음!**

### 3. **PM2 환경 변수** (`ecosystem.config.cjs`)

**PM2의 `env_production` 섹션:**
- PM2가 프로세스에 직접 환경 변수 주입
- `process.env`에서 읽을 수 있음
- 백엔드 코드에서 `process.env.VARIABLE_NAME`으로 접근
- **우선순위: PM2 환경 변수 > .env 파일**

## 🔍 현재 문제점 (해결됨)

1. ✅ **`env.production` 파일 생성 완료**
   - 프로젝트 루트에 `env.production` 파일 생성
   - 백엔드가 자동으로 로드 (우선순위 7번)

2. **`env.unified` 파일이 사용되지 않음**
   - 백엔드와 프론트엔드 모두 이 파일을 참조하지 않음
   - 단순히 통합 설정 템플릿 역할만 함
   - **권장: 환경별 파일 관리** (`env.production`, `env.development`)

3. **환경 변수 중복 관리**
   - `env.unified`에 설정 (템플릿)
   - `env.production`에 설정 (프로덕션)
   - `ecosystem.config.cjs`에 설정 (PM2 백업)
   - **권장: `env.production`을 주로 사용, PM2는 백업**

## ✅ 해결 방안 (구현됨)

### ✅ 옵션 1: `env.production` 파일 생성 (완료)

**프로젝트 루트에 `env.production` 파일 생성:**
- ✅ 백엔드가 자동으로 로드 (우선순위 7번)
- ✅ PM2 없이도 동작 가능
- ✅ 환경별 파일 관리 용이

**파일 위치:** `/home/ec2-user/deukgeun_ReactProject/deukgeun/env.production`

### 옵션 2: PM2 환경 변수만 사용 (현재 방식)

**장점:**
- 이미 설정되어 있음
- PM2로 관리 용이

**단점:**
- PM2 없이 실행 불가
- 환경 변수 확인이 어려움

## 📝 권장 구조

```
프로젝트 루트/
├── .env                    # 개발 환경 (gitignore, 선택적)
├── .env.production         # 프로덕션 환경 (Vite용, gitignore)
├── env.production          # 프로덕션 환경 (백엔드용, gitignore) ← 생성됨
├── env.development         # 개발 환경 (백엔드용, gitignore)
├── env.unified             # 통합 템플릿 (gitignore)
├── .env.example            # 예제 파일 (Git에 커밋)
└── ecosystem.config.cjs   # PM2 설정 (env_production 포함)
```

## 🎯 환경 변수 우선순위

### 백엔드
1. **PM2 환경 변수** (프로세스에 직접 주입)
2. `src/backend/.env.local`
3. `src/backend/.env`
4. `src/backend/env.production`
5. 프로젝트 루트 `.env.local`
6. 프로젝트 루트 `.env`
7. **프로젝트 루트 `env.production`** ← **생성됨**

### 프론트엔드
1. **PM2 환경 변수** (빌드 시점에 주입)
2. `.env.production.local` (Vite)
3. `.env.production` (Vite)
4. `.env.local` (Vite)
5. `.env` (Vite)

## 🔧 사용 방법

### 개발 환경
```bash
# 자동으로 env.development 또는 .env 로드됨
npm run dev:backend
```

### 프로덕션 환경

#### 방법 1: env.production 파일 사용 (권장)
```bash
# NODE_ENV=production일 때 자동으로 env.production 로드됨
NODE_ENV=production npm run dev:backend
```

#### 방법 2: PM2 사용
```bash
# PM2가 env_production 섹션의 환경 변수를 주입
pm2 start ecosystem.config.cjs --env production
```

## 📊 현재 설정된 값

### env.production에 포함된 값:
- ✅ NODE_ENV=production
- ✅ MODE=production
- ✅ SEOUL_OPENAPI_KEY=${SEOUL_OPENAPI_KEY}
- ✅ VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
- ✅ RECAPTCHA_SITE_KEY=${RECAPTCHA_SITE_KEY}
- ⚠️ RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY} (실제 값 필요)
- ⚠️ DB_PASSWORD=${DB_PASSWORD} (실제 값 필요)
- ⚠️ JWT_SECRET=${JWT_SECRET} (실제 값 필요)

**⚠️ 중요:** 실제 값은 환경 변수 파일에 설정하거나 환경 변수로 직접 설정해야 합니다.

## 🚀 다음 단계

1. **`env.production` 파일에 실제 Secret 값 설정**
   - RECAPTCHA_SECRET_KEY
   - DB_PASSWORD
   - JWT_SECRET 등

2. **PM2 재시작** (선택적)
   ```bash
   pm2 restart ecosystem.config.cjs --env production
   ```

3. **환경 변수 확인**
   ```bash
   # 서버 시작 시 로그에서 확인
   # 또는
   console.log(process.env.SEOUL_OPENAPI_KEY)
   ```
