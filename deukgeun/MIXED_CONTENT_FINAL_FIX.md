# Mixed Content 오류 근본 해결

## 🔍 문제 상황

### 발생한 오류
```
Mixed Content: The page at 'https://www.devtrail.net/' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 'http://43.203.30.167:5000/api/homepage/config'. 
This request has been blocked; the content must be served over HTTPS.
```

### 근본 원인

**핵심 문제:**
1. **빌드 시점에 환경 변수가 빈 문자열이거나 없음**
   - Vite는 빌드 시점에 환경 변수를 주입
   - `VITE_BACKEND_URL`이 설정되지 않으면 빈 문자열로 주입됨
   - 런타임에 `window.location.origin`을 사용하려 했지만, 이미 빌드된 파일에 잘못된 값이 포함됨

2. **하드코딩된 IP 주소**
   - 일부 파일에서 `import.meta.env.VITE_BACKEND_URL`을 직접 사용
   - 환경 변수가 빈 문자열이면 빈 문자열이 그대로 사용됨
   - 런타임에 동적으로 결정하는 로직이 제대로 작동하지 않음

3. **빌드 시점 vs 런타임 결정**
   - Vite는 빌드 시점에 환경 변수를 번들에 포함
   - 런타임에 동적으로 결정하려면 `window.location.origin`을 명시적으로 사용해야 함

## ✅ 해결 방법

### 1. 런타임에 동적으로 API URL 결정

**변경 전 (문제):**
```typescript
// 빌드 시점에 결정됨 (환경 변수가 없으면 빈 문자열)
const baseURL = import.meta.env.VITE_BACKEND_URL || ''
```

**변경 후 (해결):**
```typescript
// 런타임에 동적으로 결정
function getRuntimeBaseURL(): string {
  if (typeof window === 'undefined') {
    return config.api.baseURL
  }
  
  const currentOrigin = window.location.origin
  const isProduction = import.meta.env.MODE === 'production'
  
  // 환경 변수가 있으면 사용
  if (import.meta.env.VITE_BACKEND_URL) {
    const envURL = import.meta.env.VITE_BACKEND_URL
    // 프로덕션에서 HTTP를 HTTPS로 변경
    if (isProduction && envURL.startsWith('http://') && !envURL.includes('localhost')) {
      return currentOrigin
    }
    return envURL
  }
  
  // 프로덕션 환경: 현재 도메인 사용
  if (isProduction) {
    return currentOrigin
  }
  
  // 개발 환경: localhost:5000 또는 현재 도메인
  if (currentOrigin.includes('localhost')) {
    return 'http://localhost:5000'
  }
  
  return currentOrigin
}
```

### 2. 수정된 파일 목록

#### A. `src/frontend/shared/config/index.ts`
- 런타임에 동적으로 API URL 결정
- 프로덕션에서 HTTP를 HTTPS로 자동 변경
- `getApiBaseURL()` 함수 추가

#### B. `src/frontend/shared/api/index.ts`
- `getRuntimeBaseURL()` 함수 추가
- API 클라이언트 생성 시 런타임에 baseURL 결정

#### C. `src/shared/api/client.ts`
- `getRuntimeBaseURL()` 함수 추가
- ApiClient 생성자에서 런타임에 baseURL 결정

#### D. `src/shared/config/index.ts`
- 런타임에 baseURL 동적 결정 로직 추가

#### E. `src/frontend/shared/utils/machineImageUtils.ts`
- 이미지 URL 생성 시 런타임에 baseURL 결정

### 3. 빌드 프로세스

**빌드 명령:**
```bash
# 환경 변수 없이 빌드 (런타임에 자동 결정)
npm run build

# 또는 환경 변수 명시
NODE_ENV=production VITE_BACKEND_URL="" npm run build
```

**결과:**
- 빌드된 파일에 하드코딩된 IP 주소 없음
- 런타임에 `window.location.origin` 사용
- 프로덕션에서 자동으로 HTTPS 사용

## 🔄 요청 흐름

### 변경 전 (문제)
```
브라우저 → https://www.devtrail.net/
  ↓
프론트엔드 JS 실행
  ↓
API 요청: http://43.203.30.167:5000/api/homepage/config (빌드 시점에 고정)
  ↓
❌ Mixed Content 차단
```

### 변경 후 (해결)
```
브라우저 → https://www.devtrail.net/
  ↓
프론트엔드 JS 실행
  ↓
런타임에 API URL 결정: window.location.origin → https://www.devtrail.net
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

## 🧪 검증 방법

### 1. 빌드된 파일 확인

```bash
# 하드코딩된 IP 주소 확인
grep -r "43.203.30.167" dist/frontend --include="*.js"

# 예상 결과: 없음 (0개)
```

### 2. 브라우저 콘솔 확인

**브라우저 개발자 도구 → Console:**
```javascript
// API 설정 확인
console.log('API Base URL:', config.api.baseURL)
// 예상 출력: https://www.devtrail.net

// 또는 직접 확인
console.log('window.location.origin:', window.location.origin)
// 예상 출력: https://www.devtrail.net
```

### 3. Network 탭 확인

**브라우저 개발자 도구 → Network:**
- API 요청이 `https://www.devtrail.net/api/...`로 가는지 확인
- Mixed Content 경고가 사라졌는지 확인

### 4. API 요청 테스트

```bash
# API 엔드포인트 테스트
curl -I https://www.devtrail.net/api/homepage/config
# 예상 출력: HTTP/2 200, Content-Type: application/json
```

## 📋 요약

**문제:**
- 빌드 시점에 환경 변수가 빈 문자열이거나 없음
- 하드코딩된 IP 주소가 빌드된 파일에 포함됨
- 런타임에 동적으로 결정하는 로직이 제대로 작동하지 않음

**해결:**
1. ✅ 런타임에 동적으로 API URL 결정 (`window.location.origin` 사용)
2. ✅ 프로덕션에서 HTTP를 HTTPS로 자동 변경
3. ✅ 모든 API 클라이언트에서 런타임 결정 로직 적용
4. ✅ 빌드된 파일에서 하드코딩된 IP 주소 제거

**결과:**
- ✅ API 요청이 `https://www.devtrail.net/api/...`로 전달
- ✅ Mixed Content 오류 해결
- ✅ 모든 요청이 nginx를 거쳐 백엔드로 전달

## 🎯 다음 단계

1. **브라우저에서 확인:**
   - `https://www.devtrail.net` 접속
   - 개발자 도구 → Console에서 API Base URL 확인
   - 개발자 도구 → Network 탭에서 API 요청 확인
   - Mixed Content 경고가 사라졌는지 확인

2. **추가 최적화 (선택):**
   - `.env.production` 파일 생성하여 명시적으로 설정
   - 환경별 설정 분리

