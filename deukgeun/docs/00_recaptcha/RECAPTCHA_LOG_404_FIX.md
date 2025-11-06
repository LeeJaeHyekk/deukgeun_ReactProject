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
- `.env.production`에 `VITE_BACKEND_URL=${VITE_BACKEND_URL}` 설정

**⚠️ 중요:** 실제 값은 환경 변수 파일에 설정하거나 환경 변수로 직접 설정해야 합니다.
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

