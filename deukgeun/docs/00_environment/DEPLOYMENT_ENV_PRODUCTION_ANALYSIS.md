# 배포 시 .env.production 파일 적용 분석 및 수정

## 🔍 분석 결과

### ✅ 현재 상태

#### 1. **파일 생성 상태**
- ✅ `.env.production` 파일 생성 완료 (프론트엔드용)
- ✅ `env.production` 파일 생성 완료 (백엔드용)
- ✅ Vite의 `loadEnv()` 함수가 `.env.production` 파일을 인식

#### 2. **Vite 빌드 시 환경 변수 로딩**

**코드 위치:** `vite.config.ts` (8-18줄)
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "") // 프로젝트 루트의 환경 변수
  const frontendEnv = loadEnv(
    mode,
    path.resolve(process.cwd(), "src/frontend"), // 프론트엔드 전용 환경 변수
    ""
  )
  const mergedEnv = { ...env, ...frontendEnv }
```

**동작 방식:**
- Vite의 `loadEnv(mode, rootDir, prefix)` 함수는 자동으로 `.env.[mode]` 파일을 로드
- `mode=production`일 때 `.env.production` 파일을 자동 로드
- 프로젝트 루트와 `src/frontend` 디렉토리에서 모두 로드

#### 3. **빌드 스크립트 문제점**

**코드 위치:** `scripts/build-optimized.ts` (326-333줄)

**문제점:**
```typescript
// ❌ 하드코딩된 환경 변수
const env = {
  ...process.env,
  NODE_ENV: 'production',
  MODE: 'production',
  VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || '${VITE_BACKEND_URL}',
  VITE_FRONTEND_URL: process.env.VITE_FRONTEND_URL || '${VITE_FRONTEND_URL}',
  VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY || '${VITE_RECAPTCHA_SITE_KEY}',
}
```

**⚠️ 중요:** 실제 값은 환경 변수 파일에 설정하거나 환경 변수로 직접 설정해야 합니다.

**문제:**
- `.env.production` 파일을 읽지 않고 하드코딩된 값 사용
- `process.env`에서만 읽어서 `.env.production` 파일이 무시됨
- 새로운 환경 변수 추가 시 스크립트 수정 필요

## ✅ 수정 사항

### 1. **빌드 스크립트 수정**

**변경 내용:**
1. `dotenv` 패키지 import 추가
2. `.env.production` 파일 로드 함수 추가
3. 빌드 시 `.env.production` 파일 우선 사용

**수정된 코드:**
```typescript
// dotenv import 추가
import * as dotenv from 'dotenv'

// .env.production 파일 로드 함수 추가
private loadProductionEnv(): Record<string, string> {
  const envProductionPath = path.join(this.options.projectRoot, '.env.production')
  const envProductionResult = dotenv.config({ path: envProductionPath })
  
  if (envProductionResult.parsed) {
    log(`✅ .env.production 파일 로드 완료 (${Object.keys(envProductionResult.parsed).length}개 변수)`, 'green')
    return envProductionResult.parsed
  }
  
  logWarning('.env.production 파일이 없거나 변수를 파싱할 수 없습니다.')
  return {}
}

// 빌드 시 환경 변수 설정 변경
const productionEnv = this.loadProductionEnv()

const env = {
  ...process.env,
  NODE_ENV: 'production',
  MODE: 'production',
  // .env.production 파일의 값 우선, 없으면 process.env, 그래도 없으면 기본값
  VITE_BACKEND_URL: productionEnv.VITE_BACKEND_URL || process.env.VITE_BACKEND_URL || '${VITE_BACKEND_URL}',
  VITE_FRONTEND_URL: productionEnv.VITE_FRONTEND_URL || process.env.VITE_FRONTEND_URL || '${VITE_FRONTEND_URL}',
  VITE_FRONTEND_PORT: productionEnv.VITE_FRONTEND_PORT || process.env.VITE_FRONTEND_PORT || '${VITE_FRONTEND_PORT}',
  VITE_GYM_API_KEY: productionEnv.VITE_GYM_API_KEY || process.env.VITE_GYM_API_KEY || '${VITE_GYM_API_KEY}',
  VITE_RECAPTCHA_SITE_KEY: productionEnv.VITE_RECAPTCHA_SITE_KEY || process.env.VITE_RECAPTCHA_SITE_KEY || '${VITE_RECAPTCHA_SITE_KEY}',
  // .env.production의 모든 VITE_* 변수 포함
  ...Object.keys(productionEnv)
    .filter(key => key.startsWith('VITE_'))
    .reduce((acc, key) => {
      acc[key] = productionEnv[key]
      return acc
    }, {} as Record<string, string>)
}
```

### 2. **환경 변수 우선순위**

**우선순위 순서:**
1. `.env.production` 파일의 값 (최우선)
2. `process.env`의 값 (환경 변수)
3. 기본값 (하드코딩된 값)

**장점:**
- `.env.production` 파일만 수정하면 빌드 스크립트 수정 불필요
- 새로운 환경 변수 추가 시 자동으로 포함됨
- 환경 변수 관리가 용이함

## 📊 배포 프로세스

### 1. **빌드 시점**

**명령어:**
```bash
npm run build
# 또는
NODE_ENV=production MODE=production npm run build
```

**흐름:**
1. `build-optimized.ts` 실행
2. `.env.production` 파일 로드
3. `vite build --mode production` 실행
4. Vite가 자동으로 `.env.production` 파일 로드 (중복이지만 안전)
5. 빌드된 파일에 환경 변수 주입

### 2. **배포 시점**

**PM2 배포:**
```bash
npm run pm2:start
# 또는
pm2 start ecosystem.config.cjs --env production
```

**환경 변수 우선순위:**
1. PM2의 `env_production` 섹션 (최우선)
2. `process.env`의 값
3. 백엔드: `env.production` 파일 (NODE_ENV=production일 때)

## ✅ 검증 방법

### 1. **빌드 전 검증**
```bash
# .env.production 파일 존재 확인
ls -la .env.production

# 파일 내용 확인 (민감 정보는 마스킹됨)
cat .env.production | sed 's/=.*/=***/g'
```

### 2. **빌드 시 검증**
```bash
# 상세 로그로 빌드
npm run build:production --verbose

# 로그에서 확인:
# ✅ .env.production 파일 로드 완료 (5개 변수)
# 📋 프론트엔드 빌드 환경 변수:
#   VITE_BACKEND_URL=${VITE_BACKEND_URL}
#   VITE_FRONTEND_URL=${VITE_FRONTEND_URL}
#   ...
```

### 3. **빌드 후 검증**
```bash
# 빌드된 파일에서 환경 변수 확인
grep -r "VITE_RECAPTCHA_SITE_KEY" dist/frontend/

# 또는 브라우저에서 확인
# 개발자 도구 > Console
console.log(import.meta.env.VITE_RECAPTCHA_SITE_KEY)
```

## 🎯 결론

### ✅ 수정 완료
1. 빌드 스크립트에서 `.env.production` 파일 로드 추가
2. 환경 변수 우선순위 설정 (`.env.production` > `process.env` > 기본값)
3. 모든 VITE_* 변수 자동 포함

### 📋 배포 시 확인 사항
1. `.env.production` 파일이 프로젝트 루트에 존재하는지 확인
2. 빌드 로그에서 `.env.production` 파일 로드 확인
3. 빌드된 파일에 환경 변수가 제대로 주입되었는지 확인
4. PM2 배포 시 환경 변수 우선순위 확인

### 🔄 다음 단계
1. 실제 빌드 테스트 수행
2. 빌드된 파일에서 환경 변수 확인
3. 배포 후 실제 동작 확인

