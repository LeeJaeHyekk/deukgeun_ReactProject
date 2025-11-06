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

secret=YOUR_SECRET_KEY&response=TOKEN&remoteip=USER_IP
```

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
   - Google Console에 등록된 도메인: `${RECAPTCHA_REGISTERED_DOMAINS}` (환경 변수에서 확인)
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
- `${VITE_BACKEND_HOST}` (환경 변수에서 확인)
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

