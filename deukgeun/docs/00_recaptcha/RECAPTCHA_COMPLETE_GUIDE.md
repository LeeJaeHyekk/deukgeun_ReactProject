# reCAPTCHA v3 설정 및 재배포 가이드

## ✅ 완료된 작업

### 1. 환경 변수 설정 업데이트

#### env.unified 파일
- **프로덕션 reCAPTCHA v3 Site Key 설정 완료**
  ```bash
  VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
  RECAPTCHA_SITE_KEY=${RECAPTCHA_SITE_KEY}
  ```

**⚠️ 중요:** 실제 값은 환경 변수 파일에 설정하거나 환경 변수로 직접 설정해야 합니다.

#### ecosystem.config.cjs 파일
- **PM2 프로덕션 환경 변수 추가 완료**
  - `VITE_RECAPTCHA_SITE_KEY`: 기본값으로 실제 Site Key 설정
  - `RECAPTCHA_SECRET_KEY`: 환경 변수에서 읽거나 `RECAPTCHA_SECRET` 사용
  - `RECAPTCHA_SECRET`: 환경 변수에서 읽거나 `RECAPTCHA_SECRET_KEY` 사용

### 2. 코드 구조 확인

#### 프론트엔드
- ✅ `src/frontend/shared/lib/recaptcha.ts`: `import.meta.env.VITE_RECAPTCHA_SITE_KEY` 사용
- ✅ `vite.config.ts`: 환경 변수를 `define`으로 주입
- ✅ 동적 스크립트 로드: `loadRecaptchaScript()` 함수 사용

#### 백엔드
- ✅ `src/backend/utils/recaptcha.ts`: `process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET` 사용
- ✅ 우선순위: `RECAPTCHA_SECRET_KEY` > `RECAPTCHA_SECRET`

## 🔧 추가 작업 필요

### 1. Secret Key 설정

**Google reCAPTCHA Admin Console에서 Secret Key 확인 후 설정:**

```bash
# env.production 파일 수정
RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}
RECAPTCHA_SECRET=${RECAPTCHA_SECRET}
```

**또는 PM2 환경 변수로 직접 설정:**
```bash
export RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}
export RECAPTCHA_SECRET=${RECAPTCHA_SECRET}
```

**⚠️ 중요:** 실제 값은 환경 변수 파일에 설정하거나 환경 변수로 직접 설정해야 합니다.

### 2. Google reCAPTCHA Admin Console 확인

1. **접속**: https://www.google.com/recaptcha/admin
2. **확인 사항**:
   - ✅ 키 유형이 **"reCAPTCHA v3"**인지 확인 (v2는 작동하지 않음)
   - ✅ Site Key: `${VITE_RECAPTCHA_SITE_KEY}` (환경 변수에서 확인)
   - ✅ 도메인 목록에 다음이 포함되어 있는지 확인:
     - `localhost` (개발 환경)
     - `127.0.0.1` (개발 환경)
     - 프로덕션 도메인 (예: `devtrail.net`, `www.devtrail.net`)

### 3. 재배포 절차

#### 개발 환경
```bash
# 1. 환경 변수 확인
cat env.unified | grep RECAPTCHA

# 2. 프론트엔드 재시작
npm run dev:frontend

# 3. 백엔드 재시작
npm run dev:backend
```

#### 프로덕션 환경 (EC2)
```bash
# 1. 환경 변수 설정 (Secret Key가 없는 경우)
export RECAPTCHA_SECRET_KEY=실제_Secret_Key_입력
export RECAPTCHA_SECRET=실제_Secret_Key_입력

# 2. PM2 재시작
pm2 restart ecosystem.config.cjs --env production

# 또는 환경 변수와 함께 재시작
RECAPTCHA_SECRET_KEY=실제_Secret_Key pm2 restart ecosystem.config.cjs --env production
```

#### 전체 재빌드 및 재배포 (필요한 경우)
```bash
# 1. 백엔드 빌드
npm run build:backend

# 2. 프론트엔드 빌드
npm run build

# 3. PM2 재시작
pm2 restart ecosystem.config.cjs --env production
```

## ✅ 검증 방법

### 1. 프론트엔드 검증

**브라우저 콘솔에서 실행:**
```javascript
// Site Key 확인
console.log(import.meta.env.VITE_RECAPTCHA_SITE_KEY)
// 예상 출력: 환경 변수에 설정된 Site Key

// 로드된 스크립트 확인
document.querySelector('script[src*="recaptcha"]')?.src
// 예상 출력: "https://www.google.com/recaptcha/api.js?render=${VITE_RECAPTCHA_SITE_KEY}"
```

// grecaptcha 객체 확인
window.grecaptcha
// 예상 출력: 객체가 존재하고 execute 함수가 있어야 함
```

**Network 탭에서 확인:**
- `recaptcha/api.js?render=...` 요청이 200 OK로 성공하는지 확인
- 스크립트 로드 후 `execute` 함수가 준비되는지 확인

### 2. 백엔드 검증

**서버 로그에서 확인:**
```bash
# reCAPTCHA 로그 확인
tail -f logs/recaptcha.log

# 에러 로그 확인
tail -f logs/backend-error.log
```

**환경 변수 확인 (서버에서):**
```bash
# Secret Key 확인
echo $RECAPTCHA_SECRET_KEY
echo $RECAPTCHA_SECRET

# 또는 PM2 환경에서
pm2 env 0 | grep RECAPTCHA
```

### 3. 기능 테스트

1. **회원가입 테스트**
   - 회원가입 폼 작성
   - 브라우저 콘솔에서 reCAPTCHA 토큰 생성 확인
   - 백엔드 로그에서 검증 성공 확인

2. **로그인 테스트**
   - 로그인 폼 작성
   - reCAPTCHA 토큰과 함께 로그인 요청
   - 백엔드 로그에서 검증 성공 확인

## 🐛 문제 해결

### 문제 1: "키 유형이 올바르지 않습니다" 오류

**원인:**
- v2 키를 v3로 사용하거나 그 반대
- 도메인이 등록되지 않음

**해결:**
1. Google reCAPTCHA Admin Console에서 키 유형 확인 (v3 여부)
2. 도메인 목록에 현재 도메인 추가

### 문제 2: "execute 함수 준비 타임아웃"

**원인:**
- Site Key가 잘못됨
- 스크립트 로드는 성공했으나 execute 함수 초기화 실패

**해결:**
1. Site Key가 올바른지 확인
2. 브라우저 콘솔에서 `window.grecaptcha` 객체 상태 확인
3. Network 탭에서 스크립트 로드 상태 확인

### 문제 3: "invalid-input-secret" 오류

**원인:**
- Secret Key가 잘못되었거나 설정되지 않음
- Site Key와 Secret Key가 쌍이 맞지 않음

**해결:**
1. Google reCAPTCHA Admin Console에서 Secret Key 확인
2. `env.production` 또는 PM2 환경 변수에 올바른 Secret Key 설정
3. PM2 재시작

### 문제 4: 환경 변수가 적용되지 않음

**원인:**
- 빌드 시점에 환경 변수가 고정됨 (Vite)
- PM2 환경 변수 설정 누락

**해결:**
1. 프론트엔드: 재빌드 필요 (`npm run build`)
2. 백엔드: PM2 재시작 (`pm2 restart`)
3. 환경 변수 확인 후 재배포

## 📝 체크리스트

- [ ] Google reCAPTCHA Admin Console에서 v3 키 확인
- [ ] 도메인 목록에 localhost 및 프로덕션 도메인 추가
- [ ] Secret Key를 `env.production` 또는 PM2 환경 변수에 설정
- [ ] 프론트엔드 재빌드 (프로덕션)
- [ ] 백엔드 PM2 재시작
- [ ] 브라우저 콘솔에서 Site Key 확인
- [ ] Network 탭에서 스크립트 로드 확인
- [ ] 회원가입/로그인 기능 테스트

## 🔗 참고 문서

- `RECAPTCHA_INTEGRATION_STATUS.json`: 통합 상태 상세 정보
- `RECAPTCHA_DIAGNOSIS_COMPLETE.json`: 진단 정보 및 문제 해결 가이드
- Google reCAPTCHA Admin Console: https://www.google.com/recaptcha/admin

# reCAPTCHA v3 수정 완료 보고서

**수정 일시**: 2025-11-06  
**목적**: reCAPTCHA v3 표준 API로 완전 전환 및 문서 요구사항 반영

---

## ✅ 완료된 수정 사항

### 1. 백엔드 수정

#### `src/backend/utils/recaptcha.ts`
- ✅ **action 검증 강화**: expectedAction과 실제 action 일치 확인
- ✅ **Request 객체 지원**: userAgent, userIpAddress 자동 추출 및 로깅
- ✅ **프로덕션 로깅**: `logs/recaptcha.log` 파일에 상세 로그 기록
- ✅ **점수 기반 검증**: 0.0 ~ 1.0 범위 검증 및 최소 점수 설정
- ✅ **상세한 오류 처리**: error-codes 분석 및 로깅

**주요 변경사항:**
```typescript
// 이전
export async function verifyRecaptcha(token: string): Promise<boolean>

// 현재
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  context?: Request | RecaptchaVerificationContext
): Promise<boolean>
```

#### `src/backend/controllers/authController.ts`
- ✅ **모든 verifyRecaptcha 호출에 action 전달**:
  - `login`: `"LOGIN"` ✅
  - `register`: `"REGISTER"` ✅
  - `findId`: `"FIND_ACCOUNT"` ✅
  - `findPassword`: `"FIND_PASSWORD"` ✅
- ✅ **모든 verifyRecaptcha 호출에 req 객체 전달** ✅

#### `src/backend/routes/recaptcha.ts`
- ✅ **Enterprise 코드 제거**: v3 표준 API만 사용
- ✅ **로그 엔드포인트 추가**: `/api/recaptcha/log` (프론트엔드 로그 수신)
- ✅ **v3 검증 엔드포인트**: `/api/recaptcha/verify` (action 검증 포함)
- ✅ **설정 정보 엔드포인트**: `/api/recaptcha/config` (개발용)

### 2. 프론트엔드 수정

#### `src/frontend/shared/lib/recaptcha.ts`
- ✅ **Enterprise 코드 완전 제거**: v3 표준 API만 사용
- ✅ **스크립트 로드 개선**: grecaptcha 객체 확인 로직 강화 (최대 5초 대기)
- ✅ **상세 로깅**: 토큰 생성 과정의 모든 단계를 로그로 기록
- ✅ **프론트엔드 로그 전송**: 오류 발생 시 백엔드로 로그 전송

**주요 변경사항:**
```typescript
// 이전: Enterprise 체크
const isEnterprise = config.RECAPTCHA.SITE_KEY === '${VITE_RECAPTCHA_SITE_KEY}'
const scriptUrl = isEnterprise 
  ? `https://www.google.com/recaptcha/enterprise.js?render=...`
  : `https://www.google.com/recaptcha/api.js?render=...`

// 현재: v3만 사용
const scriptUrl = `https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA.SITE_KEY}`
```

#### `src/frontend/shared/components/RecaptchaWidget.tsx`
- ✅ **즉시 토큰 생성**: 페이지 로드 시 자동으로 토큰 생성
- ✅ **자동 갱신**: 2분마다 토큰 자동 갱신 (토큰 만료 방지)
- ✅ **action prop 지원**: action별로 토큰 생성
- ✅ **상세 로깅**: 토큰 생성 및 갱신 과정 로깅
- ✅ **프론트엔드 로그 전송**: 오류 발생 시 백엔드로 로그 전송

**주요 변경사항:**
- 이전: `react-google-recaptcha` 라이브러리 사용 (v2 방식)
- 현재: v3 표준 API 직접 사용 (보이지 않는 위젯)
- 페이지 로드 시 즉시 토큰 생성
- 2분마다 자동 갱신

#### `src/frontend/shared/config/index.ts`
- ✅ **API_ENDPOINTS.RECAPTCHA.LOG 추가**: 프론트엔드 로그 전송 엔드포인트

#### 페이지 컴포넌트
- ✅ **LoginPage**: `action="LOGIN"` 전달 ✅
- ✅ **FindIdPage**: `action="FIND_ACCOUNT"` 전달 ✅
- ✅ **FindPasswordPage**: `action="FIND_PASSWORD"` 전달 ✅
- ✅ **LoginForm**: `action="LOGIN"` 전달 ✅

---

## 📊 수정된 파일 목록

### 백엔드
1. `src/backend/utils/recaptcha.ts` - v3 검증 로직 강화
2. `src/backend/controllers/authController.ts` - action 전달 추가
3. `src/backend/routes/recaptcha.ts` - v3로 변경 및 로그 엔드포인트 추가

### 프론트엔드
1. `src/frontend/shared/lib/recaptcha.ts` - Enterprise 코드 제거, v3만 사용
2. `src/frontend/shared/components/RecaptchaWidget.tsx` - 즉시 토큰 생성 및 자동 갱신
3. `src/frontend/shared/config/index.ts` - API_ENDPOINTS.RECAPTCHA.LOG 추가
4. `src/frontend/pages/login/LoginPage.tsx` - action="LOGIN" 전달
5. `src/frontend/pages/auth/FindIdPage.tsx` - action="FIND_ACCOUNT" 전달
6. `src/frontend/pages/auth/FindPasswordPage.tsx` - action="FIND_PASSWORD" 전달
7. `src/frontend/features/auth/components/LoginForm.tsx` - action="LOGIN" 전달

---

## 🔄 구조 및 흐름

### 프론트엔드 흐름
1. **페이지 로드** → `RecaptchaWidget` 마운트
2. **즉시 토큰 생성**:
   - 스크립트 로드 (`loadRecaptchaScript`)
   - `grecaptcha.execute(siteKey, { action })` 호출
   - 생성된 토큰을 `onChange` 콜백으로 전달
3. **2분마다 자동 갱신**:
   - `setInterval`로 120초마다 토큰 재생성
   - 만료된 토큰 방지
4. **오류 발생 시**:
   - 콘솔에 로그 출력
   - 백엔드 `/api/recaptcha/log`로 로그 전송

### 백엔드 흐름
1. **토큰 수신** → `verifyRecaptcha(token, action, req)`
2. **검증 과정**:
   - 토큰 존재 여부 확인
   - 개발 환경 더미 토큰 허용
   - v3 표준 API로 검증 (`https://www.google.com/recaptcha/api/siteverify`)
   - action 검증 (expectedAction === actualAction)
   - 점수 검증 (score >= minScore)
3. **로깅**:
   - 모든 검증 과정을 `logs/recaptcha.log`에 기록
   - userAgent, userIpAddress, requestUrl 포함
4. **결과 반환**: `true` (성공) 또는 `false` (실패)

---

## 📝 주요 기능

### 1. Action 검증
- 프론트엔드에서 생성한 action과 백엔드에서 검증하는 action이 일치해야 함
- 불일치 시 보안 위험으로 간주하여 차단

### 2. 점수 기반 검증
- v3는 0.0 ~ 1.0 점수 반환
- 기본 최소 점수: 0.5 (환경변수 `RECAPTCHA_MIN_SCORE`로 설정 가능)
- 낮은 점수 요청 차단

### 3. 프로덕션 로깅
- **백엔드 로그**: `logs/recaptcha.log` 파일에 모든 검증 과정 기록
- **프론트엔드 로그**: 오류 발생 시 백엔드로 전송하여 기록
- 로그 형식: JSON (timestamp, level, message, data, environment)

### 4. 자동 토큰 갱신
- 페이지 로드 시 즉시 토큰 생성
- 2분마다 자동 갱신 (토큰 만료 방지)
- 사용자가 별도 작업 없이 항상 유효한 토큰 유지

---

## 🔐 보안 강화

1. ✅ **Action 검증**: expectedAction과 실제 action 일치 확인
2. ✅ **점수 기반 검증**: 낮은 점수 요청 차단
3. ✅ **상세 로깅**: userAgent, userIpAddress 기록으로 공격 패턴 분석 가능
4. ✅ **프로덕션 로깅**: 콘솔 로그가 보이지 않아도 문제 추적 가능

---

## 🚀 사용 방법

### 프론트엔드
```tsx
<RecaptchaWidget
  onChange={setRecaptchaToken}
  action="LOGIN"  // 또는 "REGISTER", "FIND_ACCOUNT", "FIND_PASSWORD"
/>
```

### 백엔드
```typescript
import { verifyRecaptcha } from '@backend/utils/recaptcha'

// Request 객체 전달로 userAgent, userIpAddress 자동 기록
const isValid = await verifyRecaptcha(recaptchaToken, "LOGIN", req)

if (!isValid) {
  return res.status(403).json({
    success: false,
    message: "reCAPTCHA 검증에 실패했습니다."
  })
}
```

---

## 📋 로그 확인

### 백엔드 로그
```bash
# 로그 파일 확인
tail -f logs/recaptcha.log

# 최근 로그 확인
tail -n 100 logs/recaptcha.log | jq '.'
```

### 로그 예시
```json
{
  "timestamp": "2025-11-06T08:15:23.456Z",
  "level": "info",
  "message": "reCAPTCHA v3 검증 성공",
  "data": {
    "requestId": "recaptcha-1234567890-abc123",
    "expectedAction": "LOGIN",
    "score": 0.9,
    "action": "LOGIN",
    "hostname": "${RECAPTCHA_REGISTERED_DOMAINS}",
    "challenge_ts": "2025-11-06T08:15:23Z",
    "duration": "234ms",
    "userAgent": "Mozilla/5.0...",
    "userIpAddress": "${USER_IP_ADDRESS}",
    "requestUrl": "/api/auth/login"
  },
  "environment": "production",
  "mode": "production"
}
```

---

## ✅ 검증 방법

### 1. 개발 환경
- 브라우저 콘솔에서 토큰 생성 로그 확인
- `logs/recaptcha.log` 파일 확인

### 2. 프로덕션 환경
- `logs/recaptcha.log` 파일 확인
- 백엔드 로그에서 검증 성공/실패 확인

### 3. Google reCAPTCHA 콘솔
- [Google reCAPTCHA 관리자 페이지](https://www.google.com/recaptcha/admin)
- Site Key 클릭하여 토큰 요청 상태 확인
- "토큰 요청" 상태가 해결되어야 정상 동작

---

## 🔧 환경 변수 설정

### 필수 환경 변수
```env
# 프론트엔드 (v3 Site Key)
VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}

# 백엔드 (v3 Secret Key)
RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}
RECAPTCHA_SECRET=${RECAPTCHA_SECRET_KEY}

# 선택사항
RECAPTCHA_MIN_SCORE=0.5  # 최소 점수 (기본값 0.5)
```

---

## 🎯 다음 단계

1. **재빌드 및 재배포**:
   ```bash
   # 백엔드 재빌드
   npm run build:backend

   # PM2 재시작
   pm2 restart deukgeun-backend
   ```

2. **로그 확인**:
   ```bash
   # 로그 파일 확인
   tail -f logs/recaptcha.log

   # PM2 로그 확인
   pm2 logs deukgeun-backend | grep -i recaptcha
   ```

3. **테스트**:
   - 로그인 페이지에서 토큰 생성 확인
   - 브라우저 콘솔에서 로그 확인
   - 백엔드 로그 파일 확인

---

## 📞 문제 해결

문제가 발생하면 다음을 확인하세요:

1. **로그 파일 확인**: `logs/recaptcha.log`
2. **환경 변수 확인**: `.env` 파일 또는 `ecosystem.config.cjs`
3. **Google reCAPTCHA 콘솔 확인**: 키 유형이 v3인지 확인
4. **브라우저 콘솔 확인**: 프론트엔드 토큰 생성 로그 확인

---

**수정 완료일**: 2025-11-06  
**버전**: reCAPTCHA v3 (표준 API)

# reCAPTCHA 로그 엔드포인트 404 오류 근본 원인 분석 및 수정

## 🔍 근본 원인 분석

### 문제 상황
- 프론트엔드에서 `POST https://www.devtrail.net/api/recaptcha/log` 호출 시 404 오류 발생
- 백엔드 로그를 보면 과거에 정상적으로 작동했던 기록이 있음 (200 응답)

### 근본 원인

#### 1. **프론트엔드 API URL 결정 로직 문제**

**파일:** `src/frontend/shared/config/index.ts`

**문제점:**
```typescript
// getApiBaseURL() 함수 (94-119줄)
if (import.meta.env.VITE_BACKEND_URL) {
  let envURL = import.meta.env.VITE_BACKEND_URL
  
  // 프로덕션 환경에서 HTTP로 시작하는 경우 HTTPS로 변환
  if (isProduction && envURL.startsWith('http://')) {
    // localhost가 아닌 경우 현재 도메인 사용 (HTTPS)
    if (!envURL.includes('localhost')) {
      return currentOrigin  // https://www.devtrail.net 반환
    }
  }
  
  return envURL
}
```

**문제:**
- `.env.production`에 `VITE_BACKEND_URL=http://${VITE_BACKEND_HOST}:5000` 설정
- 프로덕션 환경에서 `getApiBaseURL()`이 `https://www.devtrail.net`으로 변환
- 프론트엔드가 `https://www.devtrail.net/api/recaptcha/log`로 호출
- **nginx 리버스 프록시가 `/api` 경로를 백엔드로 전달하지 않으면 404 발생**

#### 2. **백엔드 라우터 등록 확인**

**파일:** `src/backend/index.ts` (169-176줄)

**상태:**
- ✅ reCAPTCHA 라우터가 `/api/recaptcha` 경로로 등록됨
- ✅ `/log` 엔드포인트가 정의되어 있음 (`router.post('/log', ...)`)

**검증:**
- 로컬에서 `curl http://localhost:5000/api/recaptcha/log` 시 정상 작동
- 백엔드 로그에 과거 정상 응답 기록 존재

#### 3. **nginx 리버스 프록시 설정 문제**

**가능한 원인:**
1. nginx 설정에 `/api` 경로 프록시 설정이 없음
2. nginx 설정이 있지만 백엔드 서버 주소가 잘못됨
3. nginx가 재시작되지 않아서 설정이 적용되지 않음

## ✅ 해결 방안

### 방안 1: nginx 리버스 프록시 설정 확인 및 수정 (권장)

nginx 설정에 `/api` 경로를 백엔드로 프록시하는 설정이 필요합니다.

**필요한 nginx 설정:**
```nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### 방안 2: 프론트엔드 API URL 결정 로직 수정

프로덕션 환경에서도 환경 변수의 백엔드 URL을 그대로 사용하도록 수정.

**수정 전:**
```typescript
if (isProduction && envURL.startsWith('http://')) {
  if (!envURL.includes('localhost')) {
    return currentOrigin  // https://www.devtrail.net 반환
  }
}
```

**수정 후:**
```typescript
// 프로덕션 환경에서도 환경 변수의 백엔드 URL을 그대로 사용
// nginx 리버스 프록시가 /api 경로를 처리하므로 currentOrigin 사용 가능
if (isProduction && envURL.startsWith('http://')) {
  // nginx 리버스 프록시가 /api 경로를 백엔드로 전달하므로
  // currentOrigin (https://www.devtrail.net)을 사용
  // 또는 환경 변수 URL을 그대로 사용 (nginx 없이 직접 호출 시)
  // 둘 다 지원하도록 수정 필요
}
```

### 방안 3: 하이브리드 접근 (권장)

프로덕션 환경에서:
1. nginx 리버스 프록시가 `/api` 경로를 처리 → `currentOrigin` 사용
2. nginx 리버스 프록시가 없으면 → 환경 변수 URL 사용

**수정 로직:**
- 프로덕션 환경에서 `currentOrigin` 사용 (nginx 리버스 프록시 가정)
- nginx가 `/api` 경로를 백엔드로 프록시하도록 설정

## 🔧 즉시 수정 사항

### 1. 프론트엔드 API URL 결정 로직 개선

프로덕션 환경에서도 환경 변수 URL을 우선 사용하되, nginx 리버스 프록시가 있는 경우 `currentOrigin` 사용.

### 2. nginx 리버스 프록시 설정 확인

nginx 설정에 `/api` 경로 프록시 설정이 있는지 확인하고, 없으면 추가.

## 📊 현재 상태

- ✅ 백엔드 라우터 정의: 정상
- ✅ 백엔드 라우터 등록: 정상
- ⚠️ 프론트엔드 API URL: 프로덕션에서 `https://www.devtrail.net` 사용
- ❓ nginx 리버스 프록시: 확인 필요

## 🎯 권장 조치

1. **nginx 리버스 프록시 설정 확인 및 수정**
2. **프론트엔드 API URL 결정 로직 개선** (하이브리드 접근)
3. **백엔드 서버 재시작 및 테스트**

# reCAPTCHA API 타입 분석 및 현재 구현 상태

## 📋 현재 프로젝트 상태

### 사용 중인 API
- **타입**: reCAPTCHA v3 표준 API
- **엔드포인트**: `https://www.google.com/recaptcha/api/siteverify`
- **인증 방식**: Secret Key만으로 인증 (별도의 Google Cloud 인증 불필요)

### 구현 위치
- `src/backend/utils/recaptcha.ts`: 표준 API 검증 함수
- `src/backend/utils/recaptcha-enterprise.ts`: Enterprise API 검증 함수 (현재 미사용)

---

## 🔍 표준 API vs Enterprise API 비교

### 1. reCAPTCHA v3 표준 API (현재 사용 중)

**특징:**
- Secret Key만으로 인증 가능
- 별도의 Google Cloud 인증 불필요
- 간단한 구현
- 무료 사용량 제한 있음

**엔드포인트:**
```
POST https://www.google.com/recaptcha/api/siteverify
```

**요청 형식:**
```
Content-Type: application/x-www-form-urlencoded

secret=${RECAPTCHA_SECRET_KEY}&response=TOKEN&remoteip=USER_IP
```

**⚠️ 중요:** `${RECAPTCHA_SECRET_KEY}`는 실제 Secret Key 값으로 대체되어야 합니다.

**응답 형식:**
```json
{
  "success": true,
  "score": 0.9,
  "action": "REGISTER",
  "challenge_ts": "2025-11-06T06:28:27Z",
  "hostname": "www.devtrail.net"
}
```

**인증 요구사항:**
- ❌ Google Cloud 인증 불필요
- ❌ 서비스 계정 불필요
- ❌ OAuth 토큰 불필요
- ✅ Secret Key만 필요

---

### 2. reCAPTCHA Enterprise API (현재 미사용)

**특징:**
- Google Cloud 인증 필요
- 서비스 계정 또는 API 키 필요
- 더 많은 기능 및 분석 제공
- 유료 플랜 (무료 할당량 있음)

**엔드포인트:**
```
POST https://recaptchaenterprise.googleapis.com/v1/projects/{PROJECT_ID}/assessments?key={API_KEY}
```

**요청 형식:**
```
Content-Type: application/json
Authorization: Bearer {ACCESS_TOKEN}

{
  "event": {
    "token": "TOKEN",
    "siteKey": "SITE_KEY",
    "expectedAction": "REGISTER"
  }
}
```

**인증 요구사항:**
- ✅ Google Cloud 인증 필요
- ✅ 서비스 계정 또는 API 키 필요
- ✅ OAuth 토큰 필요
- ✅ 프로젝트 ID 필요

---

## ✅ 현재 구현 상태

### 표준 API 구현 (올바름)

**파일**: `src/backend/utils/recaptcha.ts`

```typescript
const response = await axios.post(
  `https://www.google.com/recaptcha/api/siteverify`,
  new URLSearchParams({
    secret: secret,
    response: token,
    remoteip: userIpAddress || '',
  }),
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: 10000,
  }
)
```

**확인 사항:**
- ✅ 올바른 엔드포인트 사용
- ✅ URLSearchParams 형식으로 POST body 전송
- ✅ Content-Type 헤더 올바름
- ✅ Secret Key로 인증 (추가 인증 불필요)

---

## 🔧 현재 발생 중인 문제

### `invalid-input-response` 오류

**가능한 원인:**
1. **도메인 불일치** (가능성 높음)
   - Google Console에 등록된 도메인: `devtrail.net`, `www.devtrail.net`, `${VITE_BACKEND_HOST}`, `localhost`, `127.0.0.1`
   - 실제 토큰 생성 도메인 확인 필요 (Google API 응답의 `hostname` 확인)

2. **토큰 만료**
   - reCAPTCHA 토큰은 2분 내에만 유효
   - 토큰 생성 후 검증까지의 시간 확인 필요

3. **토큰 재사용**
   - 같은 토큰을 여러 번 사용하면 안 됨
   - 각 요청마다 새로운 토큰 생성 필요

4. **Site Key와 Secret Key 불일치**
   - 이미 확인 완료 (키 쌍 일치)

---

## 📝 다음 단계

### 1. Google API 응답 확인
다음 회원가입 테스트 시 PM2 로그에서 확인:
```bash
pm2 logs deukgeun-backend --lines 50
```

확인할 정보:
- `🔍 [reCAPTCHA] Google API 응답:` - `hostname` 값
- `❌ [reCAPTCHA] 검증 실패 - 상세 정보:` - 오류 상세 정보

### 2. 도메인 불일치 확인
Google API 응답의 `hostname`이 다음 목록에 포함되는지 확인:
- `devtrail.net`
- `www.devtrail.net`
- `${VITE_BACKEND_HOST}`
- `localhost`
- `127.0.0.1`

만약 `hostname`이 목록에 없다면:
- Google Console에 해당 도메인 추가
- 또는 프론트엔드에서 토큰 생성 시 올바른 도메인 사용 확인

---

## 🎯 결론

**현재 구현은 올바릅니다:**
- reCAPTCHA v3 표준 API를 올바르게 사용
- Secret Key로 인증 (별도의 Google Cloud 인증 불필요)
- 요청 형식이 표준에 맞음

**문제의 원인:**
- 도메인 불일치 가능성이 높음
- 다음 회원가입 테스트 시 Google API 응답의 `hostname`을 확인하여 정확한 원인 파악 가능

# reCAPTCHA v3 "키 유형이 올바르지 않습니다" 오류 해결 가이드

## 📋 오류 원인

"키 유형이 올바르지 않습니다" 오류는 다음과 같은 경우에 발생합니다:

1. **Site Key 유형 불일치**: Site Key가 v3가 아닌 Enterprise 또는 v2로 설정됨
2. **도메인 미등록**: 현재 접속 중인 도메인이 Google reCAPTCHA 콘솔에 등록되지 않음
3. **스크립트 URL 불일치**: HTML과 JavaScript에서 다른 Site Key 사용

## ✅ 해결 방법

### 1단계: Google reCAPTCHA 콘솔에서 키 확인

1. [Google reCAPTCHA 관리자 페이지](https://www.google.com/recaptcha/admin) 접속
2. Site Key `${VITE_RECAPTCHA_SITE_KEY}` 클릭
3. 다음 항목 확인:

#### 필수 확인 사항:

- **키 유형**: 반드시 `reCAPTCHA v3` 또는 `reCAPTCHA v3 (Invisible)`이어야 함
  - ❌ `reCAPTCHA Enterprise`는 사용 불가
  - ❌ `reCAPTCHA v2`는 사용 불가
  - ✅ `reCAPTCHA v3`만 사용 가능

- **도메인 등록**: 다음 도메인들이 모두 등록되어 있어야 함:
  - `localhost`
  - `127.0.0.1`
  - 실제 프로덕션 도메인 (예: `deukgeun.site`, `www.deukgeun.site`)

### 2단계: v3 키가 아닌 경우

현재 Site Key가 v3가 아닌 경우:

#### 옵션 A: 새 v3 키 생성 (권장)

1. Google reCAPTCHA 콘솔에서 새 사이트 추가
2. **키 유형**: `reCAPTCHA v3` 선택
3. **도메인**: 필요한 도메인 모두 등록
4. 생성된 새 Site Key를 환경 변수에 설정

#### 옵션 B: 기존 키 수정 (가능한 경우)

일부 키는 수정할 수 있지만, Enterprise 키는 v3로 변경할 수 없습니다.

### 3단계: 환경 변수 확인

`.env` 파일 또는 `env.unified` 파일에서:

```env
# 프론트엔드 (반드시 v3 Site Key)
VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}

# 백엔드 (v3 Secret Key)
RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}
RECAPTCHA_SECRET=${RECAPTCHA_SECRET_KEY}
```

### 4단계: 코드 확인

#### HTML (`index.html`)

✅ **올바른 설정**:
```html
<!-- reCAPTCHA v3 스크립트는 JavaScript에서 동적으로 로드됩니다 -->
```

❌ **잘못된 설정** (하드코딩된 키):
```html
<!-- 이렇게 하지 마세요 -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_KEY"></script>
```

#### JavaScript (`src/frontend/shared/lib/recaptcha.ts`)

스크립트는 환경 변수에서 동적으로 로드됩니다:
```typescript
const scriptUrl = `https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA.SITE_KEY}`
```

### 5단계: 브라우저 콘솔 확인

브라우저 개발자 도구(F12)에서 다음을 확인:

1. **네트워크 탭**: `api.js?render=...` 스크립트가 성공적으로 로드되었는지 확인
2. **콘솔 탭**: 오류 메시지 확인
   - `✅ reCAPTCHA v3 스크립트 로드 성공` - 정상
   - `❌ reCAPTCHA 키 유형 오류 감지` - 키 유형 문제
   - `❌ reCAPTCHA 스크립트 로드 실패` - 네트워크 또는 Site Key 문제

## 🔍 문제 진단

### 오류 메시지별 해결 방법

| 오류 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| "키 유형이 올바르지 않습니다" | Site Key가 v3가 아님 | Google 콘솔에서 v3 키로 변경 또는 새로 생성 |
| "사이트 소유자가 확인해야 하는 오류" | Site Key 유형 불일치 | v3 키인지 확인 |
| "reCAPTCHA Site Key가 설정되지 않았습니다" | 환경 변수 미설정 | `VITE_RECAPTCHA_SITE_KEY` 확인 |
| "reCAPTCHA 스크립트 로드 실패" | 네트워크 오류 또는 Site Key 오류 | 네트워크 연결 및 Site Key 확인 |

## 📝 체크리스트

오류 해결을 위한 확인 사항:

- [ ] Google reCAPTCHA 콘솔에서 Site Key의 키 유형이 `v3`인지 확인
- [ ] 도메인 등록에 `localhost`, `127.0.0.1`, 실제 도메인이 모두 포함되어 있는지 확인
- [ ] 환경 변수 `VITE_RECAPTCHA_SITE_KEY`가 올바른 v3 Site Key로 설정되어 있는지 확인
- [ ] `index.html`에 하드코딩된 스크립트가 없는지 확인
- [ ] 브라우저 콘솔에서 스크립트 로드 성공 메시지 확인
- [ ] Secret Key가 v3 Secret Key인지 확인 (Site Key와 쌍이 맞아야 함)

## 🚨 주의사항

1. **Site Key와 Secret Key는 쌍이 맞아야 함**
   - 같은 프로젝트에서 생성된 Site Key와 Secret Key를 사용해야 함
   - v3 Site Key에는 v3 Secret Key가 필요함

2. **도메인 등록은 필수**
   - 등록되지 않은 도메인에서는 reCAPTCHA가 작동하지 않음
   - 개발 환경: `localhost`, `127.0.0.1` 필수
   - 프로덕션 환경: 실제 도메인 필수

3. **키 유형은 변경할 수 없음**
   - Enterprise 키를 v3로 변경할 수 없음
   - v3가 아닌 키는 새로 생성해야 함

## 📚 참고 자료

- [reCAPTCHA v3 문서](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA 관리자 페이지](https://www.google.com/recaptcha/admin)
- [키 설정 가이드](./RECAPTCHA_KEY_SETUP_GUIDE.md)

# reCAPTCHA v3 구현 및 수정 내역

## 📋 개요

이 문서는 프로젝트에서 reCAPTCHA Enterprise에서 reCAPTCHA v3로 전환하고, 프로덕션 환경에서 안정적으로 동작하도록 개선한 모든 변경사항을 정리합니다.

**수정 기간**: 2025-11-05  
**최종 버전**: reCAPTCHA v3 (표준 API)  
**Site Key**: `${VITE_RECAPTCHA_SITE_KEY}`

---

## 🔄 주요 변경사항

### 1. Enterprise → v3 전환

- **기존**: reCAPTCHA Enterprise API 사용
- **변경**: reCAPTCHA v3 표준 API 사용
- **이유**: 
  - "키 유형이 올바르지 않습니다" 오류 해결
  - v3 표준 방식으로 통일하여 안정성 향상
  - 더 간단한 구현 및 유지보수

### 2. 프로덕션 로깅 시스템 구축

- **프론트엔드**: reCAPTCHA 오류 발생 시 백엔드로 로그 전송
- **백엔드**: `logs/recaptcha.log` 파일에 상세 로그 기록
- **목적**: 프로덕션 환경에서 콘솔 로그가 보이지 않아도 문제 추적 가능

### 3. 백엔드 검증 로직 강화

- **문서 권장사항 반영**: Google reCAPTCHA 공식 문서 구조에 맞게 수정
- **userAgent, userIpAddress 기록**: Request 객체에서 자동 추출하여 로그에 기록
- **action 검증 강화**: expectedAction과 실제 action 일치 확인
- **점수 기반 검증**: 0.0 ~ 1.0 범위 검증 및 최소 점수 설정

### 4. 프론트엔드 토큰 생성 개선

- **즉시 토큰 생성**: 페이지 로드 시 자동으로 토큰 생성
- **자동 갱신**: 2분마다 토큰 자동 갱신 (토큰 만료 방지)
- **상세 로깅**: 토큰 생성 과정의 모든 단계를 로그로 기록
- **스크립트 로드 개선**: grecaptcha 객체 확인 로직 강화 (최대 5초 대기)

---

## 📁 수정된 파일 목록

### 프론트엔드

1. **`src/frontend/shared/lib/recaptcha.ts`**
   - v3 표준 API로 통일
   - 스크립트 동적 로드 개선
   - 상세 로깅 추가
   - 프론트엔드 로그를 백엔드로 전송하는 기능 추가

2. **`src/frontend/shared/components/RecaptchaWidget.tsx`**
   - 페이지 로드 시 즉시 토큰 생성
   - 2분마다 자동 토큰 갱신
   - 상세 로깅 추가

3. **`src/frontend/shared/hooks/useRecaptcha.ts`**
   - `recaptchaConfig` import로 변경 (기존 `config`에서 분리)

4. **`src/frontend/pages/login/LoginPage.tsx`**
   - 입력 필드에 `id`와 `name` 속성 추가 (접근성 개선)
   - RecaptchaWidget에 `action="LOGIN"` 전달

5. **`src/frontend/pages/SignUp/SignUpPage.tsx`**
   - `executeRecaptcha()` 호출 수정 (인자 없이 호출)
   - 모든 입력 필드에 `id`와 `name` 속성 추가

6. **`src/frontend/pages/auth/FindIdPage.tsx`**
   - 입력 필드에 `id`와 `name` 속성 추가
   - RecaptchaWidget에 `action="FIND_ACCOUNT"` 전달

7. **`src/frontend/pages/auth/FindPasswordPage.tsx`**
   - 입력 필드에 `id`와 `name` 속성 추가
   - RecaptchaWidget에 `action="FIND_PASSWORD"` 전달

8. **`src/frontend/shared/config/index.ts`**
   - `API_ENDPOINTS.RECAPTCHA.LOG` 추가 (프론트엔드 로그 전송 엔드포인트)

9. **`index.html`**
   - reCAPTCHA v3 스크립트 태그 제거 (동적 로드로 변경)

### 백엔드

1. **`src/backend/utils/recaptcha.ts`**
   - v3 표준 `siteverify` API 사용
   - `verifyRecaptcha` 함수에 Request 객체 전달 지원 추가
   - userAgent, userIpAddress 자동 추출 및 로깅
   - 프로덕션 환경 로그 파일 기록 (`logs/recaptcha.log`)
   - action 검증 강화
   - 점수 기반 검증 개선
   - 상세한 오류 코드 처리

2. **`src/backend/controllers/authController.ts`**
   - 모든 `verifyRecaptcha` 호출에 `req` 객체 전달
   - action 검증 추가:
     - `login`: `"LOGIN"`
     - `register`: `"REGISTER"`
     - `findId`: `"FIND_ACCOUNT"`
     - `findPassword`: `"FIND_PASSWORD"`

3. **`src/backend/routes/recaptcha.ts`**
   - `/api/recaptcha/log` 엔드포인트 추가 (프론트엔드 로그 수신)
   - 프론트엔드 로그를 `recaptcha.log`에 기록
   - `verifyRecaptcha` 호출에 `req` 객체 전달

4. **`src/backend/app.ts`**
   - Enterprise API 엔드포인트를 CSP에서 제거

5. **`src/backend/routes/auth.ts`**
   - `recaptchaEnterpriseMiddleware` 제거

### 공유 파일

1. **`src/shared/lib/recaptcha.ts`**
   - v2 코드 완전 제거
   - v3만 지원하도록 정리
   - `executeRecaptchaV3` 함수를 v3 표준 방식으로 수정

### 설정 파일

1. **`env.unified`**
   - Enterprise 관련 환경 변수 제거:
     - `RECAPTCHA_PROJECT_ID`
     - `RECAPTCHA_API_KEY`
   - v3 표준 환경 변수로 통일:
     - `VITE_RECAPTCHA_SITE_KEY`
     - `RECAPTCHA_SITE_KEY`
     - `RECAPTCHA_SECRET_KEY` / `RECAPTCHA_SECRET`
     - `RECAPTCHA_MIN_SCORE` (선택사항, 기본값 0.5)

---

## 🔧 주요 기능 개선

### 1. 프론트엔드 토큰 생성

#### 이전 (Enterprise)
```typescript
// Enterprise API 사용
const token = await grecaptcha.enterprise.execute(siteKey, { action })
```

#### 현재 (v3)
```typescript
// v3 표준 API 사용
const token = await grecaptcha.execute(siteKey, { action })
```

#### 개선 사항
- ✅ 페이지 로드 시 즉시 토큰 생성
- ✅ 2분마다 자동 토큰 갱신
- ✅ 스크립트 로드 상태 확인 강화 (최대 5초 대기)
- ✅ 상세 로깅으로 디버깅 용이

### 2. 백엔드 검증 로직

#### 이전
```typescript
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string
): Promise<boolean>
```

#### 현재
```typescript
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  context?: RecaptchaVerificationContext | Request
): Promise<boolean>
```

#### 개선 사항
- ✅ Request 객체에서 userAgent, userIpAddress 자동 추출
- ✅ 모든 로그에 사용자 정보 기록
- ✅ action 검증 강화 (불일치 시 차단)
- ✅ 점수 기반 검증 개선
- ✅ 프로덕션 환경 로그 파일 기록

### 3. 프로덕션 로깅

#### 프론트엔드 → 백엔드 로그 전송
```typescript
// 프론트엔드에서 오류 발생 시
fetch(`${config.api.baseURL}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'error',
    message: 'reCAPTCHA 실행 실패',
    data: { ... }
  })
})
```

#### 백엔드 로그 파일 기록
```typescript
// logs/recaptcha.log에 기록
writeRecaptchaLog('error', 'reCAPTCHA 검증 실패', {
  requestId,
  expectedAction,
  userAgent,
  userIpAddress,
  errorCodes,
  ...
})
```

---

## 📊 로그 구조

### 로그 파일 위치
- **개발 환경**: `./logs/recaptcha.log`
- **프로덕션 환경**: `/app/logs/recaptcha.log`

### 로그 엔트리 예시
```json
{
  "timestamp": "2025-11-05T05:48:08.123Z",
  "level": "info",
  "message": "reCAPTCHA v3 검증 성공",
  "data": {
    "requestId": "recaptcha-1234567890-abc123",
    "expectedAction": "LOGIN",
    "score": 0.9,
    "action": "LOGIN",
    "hostname": "deukgeun.site",
    "challenge_ts": "2025-11-05T05:48:08Z",
    "duration": "234ms",
    "userAgent": "Mozilla/5.0...",
    "userIpAddress": "123.456.789.0",
    "requestUrl": "/api/auth/login"
  },
  "environment": "production",
  "mode": "production"
}
```

---

## 🔐 보안 강화 사항

### 1. 백엔드에서만 평가 생성
- ✅ 모든 검증이 서버에서만 수행
- ✅ 프론트엔드에서 토큰만 생성하고 검증은 백엔드에서 수행

### 2. Action 검증
- ✅ expectedAction과 실제 action 일치 확인
- ✅ 불일치 시 보안 위험으로 간주하여 차단

### 3. 점수 기반 검증
- ✅ 점수 범위 검증 (0.0 ~ 1.0)
- ✅ 최소 점수 검증 (기본값 0.5, 환경변수로 설정 가능)
- ✅ 낮은 점수 요청 차단

### 4. 상세 로깅
- ✅ userAgent, userIpAddress 기록
- ✅ 공격 패턴 분석 가능
- ✅ 문제 추적 용이

---

## 🐛 해결된 문제

### 1. "키 유형이 올바르지 않습니다" 오류
- **원인**: Enterprise 키를 v3 API로 사용하려고 시도
- **해결**: v3 표준 API로 통일

### 2. 프로덕션 환경에서 로그 확인 불가
- **원인**: 콘솔 로그가 프로덕션에서 출력되지 않음
- **해결**: 로그 파일 기록 및 프론트엔드 로그 전송 기능 추가

### 3. 타입 오류
- **원인**: v2/v3/Enterprise 타입 혼재
- **해결**: v3만 지원하도록 타입 정리

### 4. "A form field element should have an id or name attribute" 경고
- **원인**: 입력 필드에 id/name 속성 누락
- **해결**: 모든 입력 필드에 id/name 속성 추가

---

## 📝 환경 변수 설정

### 필수 환경 변수

```env
# 프론트엔드 (v3 Site Key)
VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}

# 백엔드 (v3 Secret Key)
RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}
RECAPTCHA_SECRET=${RECAPTCHA_SECRET_KEY}

# 선택사항
RECAPTCHA_MIN_SCORE=0.5  # 최소 점수 (기본값 0.5)
```

### 제거된 환경 변수

```env
# 더 이상 사용하지 않음
RECAPTCHA_PROJECT_ID=...  # Enterprise 전용
RECAPTCHA_API_KEY=...     # Enterprise 전용
```

---

## 🚀 사용 방법

### 1. 프론트엔드에서 토큰 생성

```typescript
import { RecaptchaWidget } from '@frontend/shared/components/RecaptchaWidget'

function MyComponent() {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  return (
    <>
      <RecaptchaWidget
        onChange={setRecaptchaToken}
        action="LOGIN"
      />
      {/* 토큰은 자동으로 생성되고 2분마다 갱신됩니다 */}
    </>
  )
}
```

### 2. 백엔드에서 토큰 검증

```typescript
import { verifyRecaptcha } from '@backend/utils/recaptcha'

async function login(req: Request, res: Response) {
  const { recaptchaToken } = req.body
  
  // Request 객체 전달로 userAgent, userIpAddress 자동 기록
  const isValid = await verifyRecaptcha(recaptchaToken, "LOGIN", req)
  
  if (!isValid) {
    return res.status(403).json({
      success: false,
      message: "reCAPTCHA 검증에 실패했습니다."
    })
  }
  
  // 로그인 처리...
}
```

---

## 📖 참고 문서

1. **`docs/08_deployment/RECAPTCHA_V3_TROUBLESHOOTING.md`**
   - "키 유형이 올바르지 않습니다" 오류 해결 가이드

2. **`docs/08_deployment/RECAPTCHA_KEY_SETUP_GUIDE.md`**
   - reCAPTCHA 키 설정 가이드

3. **`docs/08_deployment/RECAPTCHA_AUTHENTICATION_GUIDE.md`**
   - reCAPTCHA 인증 방법 가이드

---

## ✅ 검증 방법

### 1. 개발 환경
- 브라우저 콘솔에서 토큰 생성 로그 확인
- `logs/recaptcha.log` 파일 확인

### 2. 프로덕션 환경
- `logs/recaptcha.log` 파일 확인
- 백엔드 로그에서 검증 성공/실패 확인

### 3. Google reCAPTCHA 콘솔
- [Google reCAPTCHA 관리자 페이지](https://www.google.com/recaptcha/admin)
- Site Key 클릭하여 토큰 요청 상태 확인
- "토큰 요청" 상태가 해결되어야 정상 동작

---

## 🔄 변경 이력

### 2025-11-05
- ✅ Enterprise에서 v3로 전환
- ✅ 프로덕션 로깅 시스템 구축
- ✅ 백엔드 검증 로직 강화 (userAgent, userIpAddress 기록)
- ✅ 프론트엔드 토큰 생성 개선 (즉시 생성, 자동 갱신)
- ✅ 타입 오류 수정
- ✅ v2 코드 완전 제거
- ✅ 입력 필드 접근성 개선 (id/name 속성 추가)

---

## 🎯 다음 단계 (선택사항)

1. **로그 분석 대시보드**: reCAPTCHA 로그를 분석하는 대시보드 구축
2. **알림 시스템**: reCAPTCHA 검증 실패 시 알림 전송
3. **성능 모니터링**: 토큰 생성 및 검증 시간 추적
4. **자동 점수 조정**: 점수 패턴 분석 후 자동으로 최소 점수 조정

---

## 📞 문제 해결

문제가 발생하면 다음을 확인하세요:

1. **로그 파일 확인**: `logs/recaptcha.log`
2. **환경 변수 확인**: `env.unified` 파일
3. **Google reCAPTCHA 콘솔 확인**: 키 유형이 v3인지 확인
4. **브라우저 콘솔 확인**: 프론트엔드 토큰 생성 로그 확인

문제가 지속되면 `docs/08_deployment/RECAPTCHA_V3_TROUBLESHOOTING.md`를 참고하세요.

---

**작성일**: 2025-11-05  
**최종 업데이트**: 2025-11-05  
**버전**: 1.0.0


