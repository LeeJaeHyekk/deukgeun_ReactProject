# Mixed Content 오류 해결 (HTTPS에서 HTTP 호출)

## 🔍 문제 상황

### 발생한 오류
```
페이지: https://www.devtrail.net/
요청: http://43.203.30.167:5000/api/homepage/config ❌ (HTTP)
차단 사유: HTTPS 페이지에서 HTTP 호출 발생
```

### 근본 원인

프론트엔드가 EC2 IP 주소(`43.203.30.167:5000`)를 API 기본 URL로 사용하고 있습니다:

1. **하드코딩된 IP 주소**
   - `http://43.203.30.167:5000`이 환경 변수나 코드에 하드코딩됨
   - ALB와 nginx를 건너뛰고 백엔드에 직접 접속 시도

2. **Mixed Content 정책**
   - 브라우저는 HTTPS 페이지에서 HTTP 리소스를 차단
   - 보안 정책 위반으로 간주

3. **아키텍처 문제**
   - 모든 요청이 nginx를 거쳐야 함
   - nginx가 `/api/` 경로를 백엔드로 프록시

## ✅ 해결 방법

### 1. 프론트엔드 API URL 설정 수정

**변경 전:**
- `VITE_BACKEND_URL=http://43.203.30.167:5000` (하드코딩)
- 또는 환경 변수 없음 → fallback이 IP 주소 사용

**변경 후:**
- 프로덕션에서 현재 도메인 사용 (`https://www.devtrail.net`)
- nginx를 통해 프록시되므로 `/api/` 경로로 요청

### 2. 코드 수정

#### A. `src/frontend/shared/config/index.ts`

**변경 내용:**
```typescript
// 프로덕션 환경에서 API URL 결정
const isProduction = import.meta.env.MODE === 'production'
let apiBaseURL = import.meta.env.VITE_BACKEND_URL

// 환경 변수가 없을 때 프로덕션에서는 현재 도메인 사용
if (!apiBaseURL && isProduction && typeof window !== 'undefined') {
  apiBaseURL = window.location.origin
  console.log('🔧 프로덕션 환경: 현재 도메인을 API URL로 사용:', apiBaseURL)
}
```

#### B. `src/shared/config/index.ts`

**변경 내용:**
```typescript
// 프로덕션 환경에서 환경 변수가 없을 때 현재 도메인 사용
if (!baseURL && isProduction && typeof window !== 'undefined') {
  baseURL = window.location.origin
  console.log('🔧 프로덕션 환경: 현재 도메인을 API URL로 사용:', baseURL)
}
```

#### C. `src/shared/api/client.ts`

**변경 내용:**
```typescript
// 프로덕션 환경에서 환경 변수가 없을 때 현재 도메인 사용
if (!baseURL && isProduction && typeof window !== 'undefined') {
  baseURL = window.location.origin
  console.log('🔧 프로덕션 환경: 현재 도메인을 API URL로 사용:', baseURL)
}

// baseURL이 없을 때 fallback 처리
const safeBaseURL = baseURL || (isProduction && typeof window !== 'undefined' 
  ? window.location.origin 
  : window.location.origin.replace(':5173', ':5000'))
```

### 3. 환경 변수 파일 생성 (선택사항)

**`.env.production` 파일 생성:**
```bash
# Production Environment Variables
VITE_BACKEND_URL=https://www.devtrail.net
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

**참고:** 환경 변수가 없어도 코드에서 자동으로 현재 도메인을 사용하도록 수정됨

## 🔄 적용된 변경 사항

### 1. API URL 자동 결정 로직

**프로덕션 환경:**
1. `VITE_BACKEND_URL` 환경 변수 확인
2. 없으면 `window.location.origin` 사용
3. 결과: `https://www.devtrail.net`

**개발 환경:**
1. `VITE_BACKEND_URL` 환경 변수 확인
2. `localhost:5173`이면 `http://localhost:5000` 사용
3. 없으면 fallback 처리

### 2. 빌드 및 배포

```bash
# 프론트엔드 빌드
npm run build

# 빌드된 파일이 이미 dist/frontend에 있음
# nginx가 자동으로 서빙하므로 별도 복사 불필요
```

## 🧪 검증 방법

### 1. 브라우저 콘솔 확인

**브라우저 개발자 도구 → Console:**
```javascript
// API 설정 확인
console.log('API Base URL:', config.api.baseURL)
// 예상 출력: https://www.devtrail.net
```

### 2. Network 탭 확인

**브라우저 개발자 도구 → Network:**
- API 요청이 `https://www.devtrail.net/api/...`로 가는지 확인
- Mixed Content 경고가 사라졌는지 확인

### 3. API 요청 테스트

```bash
# API 엔드포인트 테스트
curl -I https://www.devtrail.net/api/homepage/config
# 예상 출력: HTTP/2 200, Content-Type: application/json
```

### 4. Mixed Content 확인

**브라우저 콘솔:**
- Mixed Content 경고가 없어야 함
- 모든 요청이 HTTPS로 가는지 확인

## 📋 요청 흐름

### 변경 전 (문제)
```
브라우저 → https://www.devtrail.net/
  ↓
프론트엔드 JS 실행
  ↓
API 요청: http://43.203.30.167:5000/api/homepage/config
  ↓
❌ Mixed Content 차단
```

### 변경 후 (해결)
```
브라우저 → https://www.devtrail.net/
  ↓
프론트엔드 JS 실행
  ↓
API 요청: https://www.devtrail.net/api/homepage/config
  ↓
ALB (HTTPS → HTTP)
  ↓
nginx (포트 80)
  ↓
location /api/ → proxy_pass http://127.0.0.1:5000
  ↓
백엔드 (포트 5000)
  ↓
✅ 정상 응답
```

## ⚠️ 주의 사항

### 1. 환경 변수 우선순위

1. `VITE_BACKEND_URL` 환경 변수 (최우선)
2. 프로덕션: `window.location.origin` (자동)
3. 개발: `http://localhost:5000` (fallback)

### 2. 빌드 시점

**중요:** 환경 변수는 빌드 시점에 주입됩니다.

- `.env.production` 파일이 있으면 빌드 시 사용
- 없으면 런타임에 `window.location.origin` 사용

### 3. nginx 설정 확인

**nginx가 `/api/` 경로를 프록시하는지 확인:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5000;
    ...
}
```

## 📝 요약

**문제:**
- 프론트엔드가 `http://43.203.30.167:5000`을 API URL로 사용
- HTTPS 페이지에서 HTTP 호출로 Mixed Content 오류 발생

**해결:**
1. 프로덕션에서 현재 도메인(`window.location.origin`) 자동 사용
2. 환경 변수 우선순위 설정
3. 빌드 및 배포

**결과:**
- ✅ API 요청이 `https://www.devtrail.net/api/...`로 전달
- ✅ Mixed Content 오류 해결
- ✅ 모든 요청이 nginx를 거쳐 백엔드로 전달

## 🎯 다음 단계

1. **브라우저에서 확인:**
   - `https://www.devtrail.net` 접속
   - 개발자 도구 → Network 탭에서 API 요청 확인
   - Mixed Content 경고가 사라졌는지 확인

2. **추가 최적화 (선택):**
   - `.env.production` 파일 생성하여 명시적으로 설정
   - 환경별 설정 분리

