# reCAPTCHA v3 완전 분석 문서

> 이 문서는 프로젝트의 reCAPTCHA v3 통합 상태, 설정, 진단 정보를 종합적으로 정리한 문서입니다.

## 📋 목차

1. [프론트엔드 설정 및 구현](#프론트엔드-설정-및-구현)
2. [백엔드 설정 및 구현](#백엔드-설정-및-구현)
3. [환경 변수 설정](#환경-변수-설정)
4. [실제 런타임 정보](#실제-런타임-정보)
5. [문제 진단](#문제-진단)
6. [해결 방법 및 권장 사항](#해결-방법-및-권장-사항)

---

## 프론트엔드 설정 및 구현

### 기본 정보

- **프레임워크**: React + Vite
- **reCAPTCHA 버전**: v3
- **구현 방식**: 수동 구현 (직접 구현, react-google-recaptcha 라이브러리는 설치되어 있으나 사용하지 않음)

### 스크립트 로드 방식

#### 동적 스크립트 로드

- **위치**: `src/frontend/shared/lib/recaptcha.ts`의 `loadRecaptchaScript()` 함수
- **방법**: JavaScript에서 `document.createElement('script')`로 동적 생성
- **삽입 위치**: `document.head.appendChild(script)`
- **스크립트 URL**: `https://www.google.com/recaptcha/api.js?render=${VITE_RECAPTCHA_SITE_KEY}`
- **속성**:
  - `async: true`
  - `defer: true`
  - `id: 'recaptcha-script'`

#### 스크립트 로드 검증 로직

```typescript
// 스크립트 로드 후 execute 함수 준비 확인
- 최대 대기 시간: 5초 (50회 시도, 100ms 간격)
- 검증 항목:
  - 기존 스크립트 존재 확인
  - grecaptcha 객체 존재 확인
  - execute 함수 존재 확인
```

### 토큰 생성 흐름

#### 회원가입 흐름

1. 사용자가 회원가입 폼 작성
2. 사용자가 '회원가입' 버튼 클릭
3. `handleSignUp()` 함수 실행 (`src/frontend/pages/SignUp/SignUpPage.tsx:471`)
4. `executeRecaptcha()` 호출
5. `loadRecaptchaScript()` 호출 (스크립트 미로드 시)
6. `window.grecaptcha.execute(SITE_KEY, { action: 'REGISTER' })` 실행
7. 토큰 생성 완료 (1593자)
8. `authApi.register({ recaptchaToken })` 호출

#### 로그인 흐름

1. `LoginForm` 컴포넌트 마운트 시 `RecaptchaWidget` 초기화
2. `RecaptchaWidget`의 `useEffect`에서 자동으로 토큰 생성 시도
3. 폼 제출 시 `executeRecaptcha()` 호출 (없는 경우)
4. 토큰과 함께 로그인 API 호출

### 주요 파일 위치

- **컴포넌트**: `src/frontend/shared/components/RecaptchaWidget.tsx`
- **라이브러리**: `src/frontend/shared/lib/recaptcha.ts`
- **Hook**: `src/frontend/shared/hooks/useRecaptcha.ts`
- **인증 Hook**: `src/frontend/features/auth/hooks/useAuthRecaptcha.ts`
- **사용 지점**:
  - 회원가입: `src/frontend/pages/SignUp/SignUpPage.tsx:471`
  - 로그인: `src/frontend/features/auth/components/LoginForm.tsx:60`

### 개발 환경 동작

- **더미 토큰 사용**: 개발 환경에서 자동으로 더미 토큰 생성
- **테스트 키 감지**: Google 테스트 키 (`6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`) 자동 감지하여 더미 토큰 사용
- **더미 토큰 형식**: `dummy-token-{timestamp}-{randomId}`

### 로깅

- **프론트엔드 로그 전송**: 백엔드로 로그 전송 (`/api/recaptcha/log`)
- **로그 레벨**: `info`, `warn`, `error`

---

## 백엔드 설정 및 구현

### 기본 정보

- **프레임워크**: Express + TypeORM
- **검증 엔드포인트**: `/api/auth/register` (주요), `/api/recaptcha/verify` (별도)
- **검증 로직 파일**: `src/backend/utils/recaptcha.ts`

### 검증 흐름

1. 프론트엔드에서 `authApi.register({ recaptchaToken })` 요청
2. 백엔드 `/api/auth/register` 엔드포인트 수신
3. `verifyRecaptcha(recaptchaToken, 'REGISTER', req)` 호출
4. `axios.post('https://www.google.com/recaptcha/api/siteverify', URLSearchParams)` 실행
5. Google API 응답 처리
6. 검증 결과에 따른 응답 반환

### Google API 호출

#### 요청 형식

- **URL**: `https://www.google.com/recaptcha/api/siteverify`
- **Method**: `POST`
- **Body Type**: `URLSearchParams`
- **Content-Type**: `application/x-www-form-urlencoded`

#### 요청 파라미터

```typescript
{
  secret: process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET,
  response: token (from req.body.recaptchaToken),
  remoteip: userIpAddress (optional)
}
```

#### 코드 위치

- **검증 함수**: `src/backend/utils/recaptcha.ts` (line 177-190)
- **컨트롤러**: `src/backend/controllers/authController.ts` (line 465-466)

### 검증 사용 지점

- **로그인**: `src/backend/controllers/authController.ts`의 `login` 함수 (action: `LOGIN`)
- **회원가입**: `src/backend/controllers/authController.ts`의 `register` 함수 (action: `REGISTER`)
- **아이디 찾기**: `findId`, `findIdStep1`, `findIdStep2` 함수 (action: `FIND_ACCOUNT`)
- **비밀번호 찾기**: `findPassword`, `resetPasswordStep1`, `resetPasswordStep2`, `resetPasswordStep3` 함수 (action: `FIND_PASSWORD` 또는 `FIND_ACCOUNT`)

### 검증 응답 처리

#### 성공 응답

```json
{
  "success": true,
  "action": "REGISTER|LOGIN|FIND_ACCOUNT|FIND_PASSWORD",
  "score": 0.0-1.0,
  "challenge_ts": "ISO timestamp",
  "hostname": "도메인명"
}
```

#### 실패 응답

```json
{
  "success": false,
  "error-codes": [
    "invalid-input-secret",
    "invalid-input-response",
    "bad-request",
    "timeout-or-duplicate"
  ]
}
```

### 검증 로직

- **성공 확인**: `response.data.success === true`
- **Action 검증**: `expectedAction`이 제공된 경우 `response.data.action`과 비교 (대소문자 무시)
- **점수 검증**: `response.data.score`가 제공된 경우 `RECAPTCHA_MIN_SCORE` (기본값 0.5)와 비교
- **성공 시**: `true` 반환
- **실패 시**: `false` 반환 및 로그 기록

### 개발 환경 동작

- **더미 토큰 허용**: 개발 환경에서 더미 토큰 허용
- **더미 토큰 패턴**: `dummy-token`, `test-token`
- **시크릿 키 선택사항**: 개발 환경에서는 시크릿 키가 없어도 더미 토큰 허용
- **네트워크 오류 우회**: 개발 환경에서 네트워크 오류 시 더미 토큰 허용 (타임아웃 제외)

### 로깅

- **로그 파일**: `logs/recaptcha.log`
- **로그 형식**: JSON Lines
- **로그 필드**: `timestamp`, `level`, `message`, `data`, `environment`, `mode`, `requestId`, `userAgent`, `userIpAddress`, `requestUrl`

---

## 환경 변수 설정

### 프론트엔드 환경 변수

#### 필수 변수

- **`VITE_RECAPTCHA_SITE_KEY`**: reCAPTCHA Site Key
  - **소스 파일**: `env.production`, `.env.production`
  - **설정 위치**: `src/frontend/shared/lib/recaptcha.ts`
  - **접근 방법**: `import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''`
  - **실제 값**: `${VITE_RECAPTCHA_SITE_KEY}`

#### 선택 변수

- **`VITE_BACKEND_URL`**: 백엔드 API URL (선택사항, 없으면 현재 도메인 사용)
- **`MODE`**: `development` 또는 `production`

### 백엔드 환경 변수

#### 필수 변수

- **`RECAPTCHA_SECRET_KEY`**: reCAPTCHA Secret Key (우선순위 1)
- **`RECAPTCHA_SECRET`**: reCAPTCHA Secret Key (우선순위 2)
  - **우선순위**: `RECAPTCHA_SECRET_KEY`가 우선, 없으면 `RECAPTCHA_SECRET` 사용
  - **소스 파일**: `env.production`, `.env.production`
  - **설정 위치**: `src/backend/utils/recaptcha.ts`
  - **접근 방법**: `process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET`
  - **실제 값**: `${RECAPTCHA_SECRET_KEY}`

#### 선택 변수

- **`RECAPTCHA_MIN_SCORE`**: 최소 점수 (기본값: 0.5)
- **`NODE_ENV`**: `development` 또는 `production`
- **`RECAPTCHA_SITE_KEY`**: reCAPTCHA Site Key (참고용)
- **`VITE_RECAPTCHA_SITE_KEY`**: reCAPTCHA Site Key (참고용)

### 환경별 설정

#### 개발 환경

- **프론트엔드 URL**: `http://localhost:5173`
- **백엔드 URL**: `http://localhost:5000`
- **SSL**: 사용 안 함 (HTTP)
- **더미 토큰**: 허용

#### 프로덕션 환경

- **프론트엔드 URL**: 현재 도메인 사용 (동적 결정)
- **백엔드 URL**: 현재 도메인 사용 (동적 결정) 또는 `VITE_BACKEND_URL` 설정
- **SSL**: 사용 (HTTPS)
- **더미 토큰**: 허용 안 함

### 등록된 도메인

Google reCAPTCHA Admin Console에 등록된 도메인:

- `devtrail.net`
- `www.devtrail.net`
- `43.203.30.167` (EC2 IP)
- `localhost`
- `127.0.0.1`

---

## 실제 런타임 정보

### 프론트엔드 런타임

#### 스크립트 로드 상태

- **초기 상태**: 스크립트 미로드
- **로드 시도**: 여러 번 시도됨
- **최종 상태**: 스크립트 로드 성공 (`isLoaded: true`)
- **execute 함수**: 확인됨 (`hasExecute: true`)

#### 토큰 생성

- **성공률**: 100% (토큰 생성 성공)
- **토큰 길이**: 1593자 (정상 범위)
- **토큰 프리뷰**: `0cAFcWeA4oqo3mVhOal2lO1F8Pkl7k...`
- **생성 타이밍**: submit 시점 (`handleSignUp` 함수 내부)

#### 실제 환경 변수 값

- **`VITE_RECAPTCHA_SITE_KEY`**: `${VITE_RECAPTCHA_SITE_KEY}`
- **`VITE_BACKEND_URL`**: `http://${VITE_BACKEND_HOST}:5000`
- **`MODE`**: `production`

### 백엔드 런타임

#### 실제 환경 변수 값

- **`RECAPTCHA_SECRET_KEY`**: `${RECAPTCHA_SECRET_KEY}`
- **`RECAPTCHA_SECRET`**: `${RECAPTCHA_SECRET}`
- **`RECAPTCHA_SITE_KEY`**: `${RECAPTCHA_SITE_KEY}`
- **`VITE_RECAPTCHA_SITE_KEY`**: `${VITE_RECAPTCHA_SITE_KEY}`

#### Google API 응답 (실제)

```json
{
  "success": false,
  "hasScore": false,
  "score": null,
  "action": null,
  "hostname": null,
  "challenge_ts": null,
  "errorCodes": ["invalid-input-response"]
}
```

### 실제 로그 패턴

#### 프론트엔드 스크립트 로드 이슈

```json
{
  "timestamp": "2025-11-06T06:38:57.214Z",
  "level": "warn",
  "message": "[isRecaptchaAvailable] reCAPTCHA 사용 불가",
  "reason": "스크립트 미로드",
  "grecaptcha": "not exists",
  "execute": "not exists"
}
```

#### 프론트엔드 스크립트 로드 성공

```json
{
  "timestamp": "2025-11-06T07:03:44.726Z",
  "level": "info",
  "message": "[RecaptchaWidget] 스크립트 로드 완료",
  "data": {
    "action": "LOGIN"
  }
}
```

#### 백엔드 검증 실패

```json
{
  "timestamp": "2025-11-06T15:39:31",
  "request": "POST /api/auth/register",
  "status": "403 Forbidden",
  "duration": "198.162 ms",
  "google_api_response": {
    "success": false,
    "hasScore": false,
    "errorCodes": ["invalid-input-response"],
    "hostname": null,
    "challenge_ts": null
  },
  "error_message": "보안 인증에 실패했습니다. 페이지를 새로고침하고 다시 시도해주세요."
}
```

---

## 문제 진단

### 주요 문제

#### 1. `invalid-input-response` 오류

- **상태 코드**: `403 Forbidden`
- **오류 메시지**: "보안 인증에 실패했습니다. 페이지를 새로고침하고 다시 시도해주세요."
- **발생 빈도**: 반복 발생 (모든 검증 시도에서 동일)
- **Google API 오류 코드**: `invalid-input-response`

#### 2. Google API 응답 분석

**실제 응답**:
```json
{
  "success": false,
  "hostname": null,
  "challenge_ts": null,
  "errorCodes": ["invalid-input-response"]
}
```

**관찰 사항**:
- `hostname`이 `null` - 도메인이 등록되지 않았거나 불일치 가능성
- `challenge_ts`가 `null` - 토큰이 완전히 무효함을 의미
- `score`가 없음 - v3 점수가 반환되지 않음

### 가능한 원인 분석

#### 1. 도메인 불일치 (가능성: 높음)

**증거**:
- Google API 응답의 `hostname` 필드가 항상 `null`
- 등록된 도메인 목록과 실제 요청 도메인 불일치 가능성

**확인 방법**:
1. Google reCAPTCHA Admin Console 접속: https://www.google.com/recaptcha/admin
2. 해당 키의 등록된 도메인 목록 확인
3. 다음 도메인들이 등록되어 있는지 확인:
   - `devtrail.net`
   - `www.devtrail.net`
   - `43.203.30.167` (필요시)

#### 2. 토큰 만료 (2분 초과) (가능성: 중간)

**증거**:
- `challenge_ts`가 없어서 확인 불가
- Google API 응답의 `challenge_ts` 필드가 항상 `null`

**확인 방법**:
- 프론트엔드에서 토큰 생성 시간 기록
- 백엔드에서 검증 시간과 비교하여 2분 이내인지 확인

#### 3. 토큰 재사용 (가능성: 낮음)

**증거**:
- 매번 새로운 토큰 생성 확인됨
- 토큰 프리뷰가 다름 (`0cAFcWeA6Lyeu-9usvUA...` vs `0cAFcWeA4oqo3mVhOal2lO1F8Pkl7k...`)

**현재 상태**: 토큰 재사용 방지 로직 구현됨 (캐시 기반)

#### 4. Site Key와 Secret Key 불일치 (가능성: 낮음)

**증거**:
- 키 쌍 일치 확인됨
- Site Key: `${VITE_RECAPTCHA_SITE_KEY}`
- Secret Key: `${RECAPTCHA_SECRET_KEY}`

**현재 상태**: 키 쌍 일치 확인 완료

### 진단 우선순위

#### 높음 (즉시 확인 필요)

1. **환경 변수 실제 값 확인** (플레이스홀더 값이 아닌지)
2. **Google Admin Console에서 키 유형 확인** (v3 여부)
3. **Network 탭에서 스크립트 로드 상태 확인**

#### 중간

1. **도메인 등록 확인**
2. **Site Key와 Secret Key 쌍 확인**
3. **defer 속성으로 인한 지연 확인**

#### 낮음

1. **CORS 설정 확인**
2. **Nginx 설정 확인**
3. **SSL 인증서 확인**

---

## 해결 방법 및 권장 사항

### 즉시 조치 사항

#### 1. Google Console에서 도메인 확인 및 추가

**단계**:
1. https://www.google.com/recaptcha/admin 접속
2. 해당 키 선택
3. 도메인 섹션에서 다음 도메인 확인:
   - `devtrail.net`
   - `www.devtrail.net`
   - `43.203.30.167` (필요시)
4. 없으면 추가 (프로토콜 없이 도메인만)
5. 저장 후 몇 분 대기 (도메인 등록 반영 시간)

**주의사항**:
- 도메인 형식이 정확한지 확인 (프로토콜 없이)
- IP 주소는 필요시에만 추가

#### 2. Google API 응답 로깅 강화

**현재 상태**: 구현됨

**확인 방법**:
- `logs/recaptcha.log` 파일에서 Google API 전체 응답 확인
- `hostname`, `challenge_ts`, `score` 등 모든 필드 확인

#### 3. 토큰 생성 시점과 검증 시점 시간 차이 확인

**구현 방법**:
- 프론트엔드에서 토큰 생성 시간 기록
- 백엔드에서 검증 시간과 비교
- 2분 초과 시 경고 로깅

### 장기 개선 사항

#### 1. 도메인 불일치 자동 감지 및 알림

**구현 방법**:
- `src/backend/utils/recaptcha.ts`에 도메인 검증 로직 추가
- Google API 응답의 `hostname`과 등록된 도메인 목록 비교
- 불일치 시 자동 알림

**현재 상태**: 부분 구현됨 (도메인 검증 로직 존재)

#### 2. 토큰 생성 시점과 검증 시점의 시간 차이 모니터링

**구현 방법**:
- 프론트엔드와 백엔드에 타임스탬프 로깅 추가
- 토큰 생성 시간과 검증 시간의 차이를 지속적으로 모니터링
- 2분 초과 시 경고

**현재 상태**: 부분 구현됨 (`challenge_ts` 기반 검증 존재)

#### 3. Rate Limiting 및 토큰 재사용 방지

**현재 상태**: 구현됨
- 토큰 재사용 방지: 캐시 기반 (2분 TTL)
- Rate Limiting: IP 기반 (1분당 최대 10회 요청)

### 디버깅 체크리스트

#### 프론트엔드

- [ ] 브라우저 콘솔에서 `import.meta.env.VITE_RECAPTCHA_SITE_KEY` 확인
- [ ] Network 탭에서 스크립트 로드 상태 확인 (`https://www.google.com/recaptcha/api.js?render=...`)
- [ ] 브라우저 콘솔에서 `window.grecaptcha` 객체 상태 확인
- [ ] `document.querySelector('script[src*="recaptcha"]')?.src` 확인

#### 백엔드

- [ ] 서버에서 `process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET` 확인
- [ ] `logs/recaptcha.log` 파일에서 Google API 응답 확인
- [ ] PM2 로그에서 환경 변수 확인 (`pm2 logs`)

#### Google Console

- [ ] 키 유형이 v3인지 확인
- [ ] 등록된 도메인 목록 확인
- [ ] Site Key와 Secret Key 쌍 확인

### 일반적인 오류 및 해결 방법

#### 1. `invalid-input-secret`

**원인**: Secret Key가 잘못되었거나 설정되지 않음

**해결**:
- `env.production` 파일에서 `RECAPTCHA_SECRET_KEY` 확인
- Google Console에서 Secret Key 확인
- PM2 재시작 (`pm2 restart`)

#### 2. `invalid-input-response`

**원인**: 
- 도메인 불일치 (가장 가능성 높음)
- 토큰 만료 (2분 초과)
- 토큰 재사용
- Site Key와 Secret Key 불일치

**해결**:
- Google Console에서 도메인 등록 확인
- 토큰 생성 후 검증까지의 시간 확인
- 키 쌍 확인

#### 3. `timeout-or-duplicate`

**원인**: 토큰이 이미 사용되었거나 만료됨

**해결**:
- 새로운 토큰 생성
- 토큰 생성 후 즉시 검증

#### 4. 스크립트 로드 실패

**원인**:
- 네트워크 오류
- CORS 문제
- Site Key 오류

**해결**:
- Network 탭에서 스크립트 로드 상태 확인
- CORS 설정 확인
- Site Key 확인

### 로그 확인 명령어

#### 프론트엔드 로그

```bash
# 브라우저 콘솔에서
console.log(import.meta.env.VITE_RECAPTCHA_SITE_KEY)
document.querySelector('script[src*="recaptcha"]')?.src
```

#### 백엔드 로그

```bash
# reCAPTCHA 로그 확인
tail -20 logs/recaptcha.log

# PM2 로그 확인
pm2 logs

# 환경 변수 확인
pm2 env <process_id>
```

---

## 요약

### 현재 상태

- ✅ **프론트엔드**: 토큰 생성 성공 (100% 성공률)
- ❌ **백엔드**: 검증 실패 (`invalid-input-response`)
- ⚠️ **주요 원인**: 도메인 불일치 가능성 높음

### 핵심 발견 사항

1. **토큰 생성**: 정상 작동 (1593자 토큰 생성 성공)
2. **Google API 응답**: `hostname`과 `challenge_ts`가 모두 `null`
3. **가능한 원인**: 도메인이 Google Console에 등록되지 않았거나 불일치

### 다음 단계

1. **Google Console에서 도메인 확인 및 추가**
2. **환경 변수 실제 값 확인** (플레이스홀더 값이 아닌지)
3. **로그 모니터링 강화**

---

**작성일**: 2025-11-06  
**최종 업데이트**: 2025-11-06  
**문서 버전**: 1.0

