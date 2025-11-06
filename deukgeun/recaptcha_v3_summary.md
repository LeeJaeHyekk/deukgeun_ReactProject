# reCAPTCHA v3 구현 및 수정 내역

## 📋 개요

이 문서는 프로젝트에서 reCAPTCHA Enterprise에서 reCAPTCHA v3로 전환하고, 프로덕션 환경에서 안정적으로 동작하도록 개선한 모든 변경사항을 정리합니다.

**수정 기간**: 2025-11-05  
**최종 버전**: reCAPTCHA v3 (표준 API)  
**Site Key**: `6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P`

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
VITE_RECAPTCHA_SITE_KEY=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P

# 백엔드 (v3 Secret Key)
RECAPTCHA_SITE_KEY=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P
RECAPTCHA_SECRET_KEY=your_v3_secret_key
RECAPTCHA_SECRET=your_v3_secret_key

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


