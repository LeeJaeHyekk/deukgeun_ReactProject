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
const isEnterprise = config.RECAPTCHA.SITE_KEY === 'your_recaptcha_site_key_here'
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
    "hostname": "deukgeun.site",
    "challenge_ts": "2025-11-06T08:15:23Z",
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
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# 백엔드 (v3 Secret Key)
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_SECRET=your_recaptcha_secret_key_here

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

