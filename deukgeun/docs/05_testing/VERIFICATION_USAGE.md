# Verification.ts 사용 가이드

## ✅ 검증 완료 사항

### 1. 코드 개선
- ✅ 네트워크 모니터링 중복 시작 방지
- ✅ GET 요청만 필터링 (POST/PUT/DELETE 제외)
- ✅ getCurrentToken() 사용으로 실제 토큰 확인
- ✅ 토큰 소스 확인 로직 개선 (getCurrentToken과 동일한 우선순위)
- ✅ Bearer 헤더 형식 검증 추가
- ✅ 에러 메시지 개선
- ✅ 요청 로그 초기화 기능 추가

### 2. 자동 로드
- ✅ main.tsx에서 개발 환경에서만 자동 로드
- ✅ window.verification 객체로 접근 가능

## 🚀 사용 방법

### 브라우저 콘솔에서 사용

1. **네트워크 모니터링 시작**
   ```javascript
   verification.start()
   ```

2. **모든 검증 테스트 실행**
   ```javascript
   verification.runAll()
   ```

3. **개별 테스트 실행**
   ```javascript
   // GET /api/posts 호출 횟수 확인
   verification.testPosts()
   
   // GET /api/comments/:postId 호출 횟수 확인
   verification.testComments()
   verification.testComments(9) // 특정 postId 확인
   
   // Authorization 헤더 형식 확인
   verification.testAuthHeader()
   
   // 토큰 소스 확인
   verification.testTokenSource()
   ```

4. **요청 로그 확인**
   ```javascript
   // 모든 요청 로그 확인
   verification.getLog()
   
   // 요청 로그 초기화
   verification.clearLog()
   ```

## 📊 검증 항목

### 1. GET /api/posts 호출 횟수
- **예상**: 1회만 호출
- **확인 방법**: `verification.testPosts()`
- **결과**: 
  - ✅ 1회 호출 시 통과
  - ❌ 0회 또는 2회 이상 호출 시 실패

### 2. GET /api/comments/:postId 호출 횟수
- **예상**: 각 postId당 1회만 호출
- **확인 방법**: `verification.testComments()`
- **결과**:
  - ✅ 각 postId당 1회만 호출 시 통과
  - ❌ 같은 postId에 대해 여러 번 호출 시 실패

### 3. Authorization 헤더 형식
- **예상**: `Bearer eyJ...` 형태 (따옴표 없음)
- **확인 방법**: `verification.testAuthHeader()`
- **결과**:
  - ✅ Bearer eyJ... 형태 (따옴표 없음) 시 통과
  - ❌ 따옴표 포함 또는 JWT 형식 아님 시 실패

### 4. 토큰 소스 확인
- **예상**: Redux > memory > localStorage 순서로 확인
- **확인 방법**: `verification.testTokenSource()`
- **결과**:
  - ✅ 우선순위에 맞게 토큰 읽기 성공 시 통과
  - ❌ 토큰 없음 시 실패

## 🔍 검증 프로세스

### 1단계: 모니터링 시작
```javascript
verification.start()
```

### 2단계: 페이지 동작 수행
- 커뮤니티 페이지 진입
- 댓글 작성/수정/삭제
- 포스트 작성

### 3단계: 검증 실행
```javascript
verification.runAll()
```

### 4단계: 결과 확인
- 콘솔에서 검증 결과 확인
- 실패한 항목은 details 확인

## 📝 예시 출력

```javascript
🧪 커뮤니티 페이지 기능 검증 테스트 시작...

📊 검증 결과 요약:
==================================================
✅ GET /api/posts 호출 횟수
   ✅ GET /api/posts가 1회만 호출됨
   상세: { count: 1, requests: [...] }

✅ GET /api/comments/:postId 호출 횟수
   ✅ 각 postId당 GET /api/comments/:postId가 1회만 호출됨
   상세: { totalRequests: 3, postIdCounts: {...} }

✅ Authorization 헤더 형식
   ✅ 토큰 형식 정상: Bearer eyJ... (따옴표 없음)
   상세: { bearerHeader: "Bearer eyJ...", hasQuotes: false }

✅ 토큰 소스 확인
   ✅ Redux에서 토큰을 읽음 (우선순위 1)
   상세: { source: "Redux", checkedSources: [...] }

총 4개 테스트 중 4개 통과
```

## ⚠️ 주의사항

1. **모니터링 시작 전에 호출**
   - `verification.start()`를 먼저 실행하지 않으면 요청 로그가 비어있을 수 있음

2. **페이지 새로고침**
   - 모니터링은 페이지 로드 후의 요청만 추적
   - 페이지 새로고침 후 `verification.start()` 다시 실행 필요

3. **PerformanceObserver 지원**
   - 일부 브라우저에서는 PerformanceObserver를 지원하지 않을 수 있음
   - 이 경우 콘솔에 경고 메시지 표시

## 🔧 문제 해결

### 요청 로그가 비어있는 경우
1. `verification.start()` 실행 확인
2. 브라우저 콘솔에서 에러 확인
3. PerformanceObserver 지원 확인

### 토큰 관련 테스트 실패 시
1. 로그인 상태 확인
2. Redux store 상태 확인
3. localStorage 확인

---

**작성일**: 2025-01-31  
**상태**: 검증 완료, 사용 준비 완료

