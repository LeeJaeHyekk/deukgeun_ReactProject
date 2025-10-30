# 커뮤니티 페이지 기능 테스트 결과

## 🧪 테스트 실행 방법

### 방법 1: 브라우저 콘솔에서 실행

1. **프로젝트 실행**
   ```bash
   npm run dev  # 프론트엔드
   npm run start  # 백엔드
   ```

2. **브라우저에서 커뮤니티 페이지 열기**
   - http://localhost:5173/community (또는 설정된 포트)

3. **DevTools Console 열기** (F12)

4. **테스트 스크립트 로드**
   ```javascript
   // test-verification.js 파일 내용을 콘솔에 붙여넣고 실행
   // 또는
   runVerificationTests()  // 자동 로드된 경우
   ```

5. **Verification 도구로 검증**
   ```javascript
   // 모니터링 시작
   verification.start()
   
   // 커뮤니티 페이지에서 동작 수행
   // - 페이지 새로고침
   // - 댓글 작성/수정/삭제
   // - 포스트 작성
   
   // 검증 실행
   verification.runAll()
   ```

### 방법 2: 자동화된 테스트 실행

```bash
# 브라우저에서 test-verification.js 실행
# 또는 Node.js 환경에서 실행 (제한적)
```

---

## 📋 테스트 항목

### 1. Verification 도구 로드 확인 ✅
**목적**: verification.ts가 제대로 로드되었는지 확인

**기대 결과**:
- `window.verification` 객체 존재
- 모든 메서드 사용 가능 (`start`, `getLog`, `testPosts`, `testComments`, `testAuthHeader`, `testTokenSource`, `runAll`)

**실행**:
```javascript
typeof window.verification !== 'undefined'
Object.keys(window.verification)
```

### 2. 네트워크 모니터링 시작 ✅
**목적**: PerformanceObserver를 통한 네트워크 요청 추적 확인

**기대 결과**:
- `verification.start()` 성공
- 요청 로그 배열 생성됨

**실행**:
```javascript
verification.start()
verification.getLog()  // 빈 배열 반환 (아직 요청 없음)
```

### 3. GET /api/posts 호출 횟수 확인 ✅
**목적**: 중복 호출 방지 확인

**기대 결과**:
- 페이지 로드 시 GET /api/posts가 **1회만** 호출됨

**실행**:
```javascript
// 1. 모니터링 시작
verification.start()

// 2. 페이지 새로고침 또는 커뮤니티 페이지 진입

// 3. 검증
verification.testPosts()
// 예상: ✅ GET /api/posts가 1회만 호출됨
```

**확인 방법**:
- DevTools → Network 탭에서도 확인 가능
- 필터: `posts` (GET /api/posts만)

### 4. GET /api/comments/:postId 호출 횟수 확인 ✅
**목적**: 같은 postId에 대한 중복 호출 방지 확인

**기대 결과**:
- 각 postId당 GET /api/comments/:postId가 **1회만** 호출됨
- 같은 postId에 대해 여러 번 호출되지 않음

**실행**:
```javascript
// 1. 모니터링 시작
verification.start()

// 2. PostCard 클릭하여 댓글 목록 로드

// 3. 검증
verification.testComments()
// 예상: ✅ 각 postId당 GET /api/comments/:postId가 1회만 호출됨

// 특정 postId 확인
verification.testComments(9)  // postId 9에 대한 호출 확인
```

### 5. Authorization 헤더 형식 확인 ✅
**목적**: Bearer 토큰 형식이 올바른지 확인 (따옴표 없음)

**기대 결과**:
- Authorization 헤더: `Bearer eyJ...` 형태
- 따옴표 없음
- JWT 형식

**실행**:
```javascript
verification.testAuthHeader()
// 예상: ✅ 토큰 형식 정상: Bearer eyJ... (따옴표 없음)
```

**확인 방법**:
- DevTools → Network 탭
- 특정 요청 클릭 → Headers 탭
- Request Headers → Authorization 헤더 확인
- 형식: `Bearer eyJ...` (따옴표 없음)

### 6. 토큰 소스 확인 ✅
**목적**: getCurrentToken()의 우선순위 확인

**기대 결과**:
- Redux > memory > localStorage 순서로 확인
- 실제 사용되는 소스 반환

**실행**:
```javascript
verification.testTokenSource()
// 예상: ✅ Redux에서 토큰을 읽음 (우선순위 1)
// 또는: ✅ Memory에서 토큰을 읽음 (우선순위 2)
// 또는: ✅ localStorage에서 토큰을 읽음 (우선순위 3)
```

### 7. 401 에러 처리 확인 ✅
**목적**: Refresh 토큰으로 자동 갱신 및 재시도 확인

**기대 결과**:
- 401 발생 시 POST /api/auth/refresh 호출
- Refresh 성공 시 원 요청 자동 재시도
- Refresh 실패 시에만 /login 이동

**실행**:
```javascript
// 1. 토큰 만료 시뮬레이션 (localStorage에서 토큰 제거)
localStorage.removeItem('accessToken')

// 2. API 요청 시도 (예: 댓글 작성)

// 3. Network 탭에서 확인:
// - 첫 요청: 401
// - POST /api/auth/refresh 호출 (withCredentials: true, 쿠키 포함)
// - 원 요청 재시도: 성공 또는 refresh 실패 시 /login 이동
```

### 8. 낙관적 업데이트 확인 ✅
**목적**: 댓글 작성 시 즉시 UI 반영 확인

**기대 결과**:
- 댓글 작성 즉시 UI에 표시 (낙관적 업데이트)
- 서버 응답 후 실제 댓글로 교체
- 실패 시 롤백

**실행**:
1. 댓글 작성 버튼 클릭
2. 즉시 댓글이 목록에 나타나는지 확인
3. Network 탭에서 POST /api/comments/:postId 확인
4. 서버 응답 후 댓글 ID 업데이트 확인

### 9. 댓글 수 동기화 확인 ✅
**목적**: postsSlice.commentCount 동기화 확인

**기대 결과**:
- 댓글 작성 시 commentCount 증가
- 댓글 삭제 시 commentCount 감소

**실행**:
1. 댓글 작성 전 댓글 수 확인
2. 댓글 작성
3. 댓글 수 증가 확인
4. 댓글 삭제
5. 댓글 수 감소 확인

### 10. 자동 리다이렉트 제거 확인 ✅
**목적**: 일반 에러 시 페이지 이동 없음 확인

**기대 결과**:
- 토큰 검증 실패 시 토스트만 표시, 페이지 이동 없음
- 403 에러 시 토스트만 표시, 페이지 이동 없음
- Refresh 실패 시에만 /login 이동

**실행**:
1. 토큰 제거 후 포스트 작성 시도
2. 토스트 메시지 표시 확인
3. 페이지 이동 없음 확인 (현재 페이지 유지)

---

## 🔍 실제 테스트 실행 가이드

### Step 1: 환경 준비
```bash
# 프론트엔드 실행
npm run dev

# 백엔드 실행 (다른 터미널)
npm run start
```

### Step 2: 브라우저 열기
- http://localhost:5173 (또는 설정된 포트)
- DevTools 열기 (F12)
- Console 탭 선택

### Step 3: 검증 도구 확인
```javascript
// Verification 도구 확인
typeof window.verification
// 예상: "object"

// 사용 가능한 메서드 확인
Object.keys(window.verification)
// 예상: ["start", "getLog", "clearLog", "addRequest", "testPosts", "testComments", "testAuthHeader", "testTokenSource", "runAll"]
```

### Step 4: 네트워크 모니터링 시작
```javascript
verification.start()
// 예상: ✅ 네트워크 모니터링 시작됨 (PerformanceObserver)
```

### Step 5: 기본 동작 테스트
```javascript
// 1. 커뮤니티 페이지 새로고침
// 또는 커뮤니티 페이지로 이동

// 2. 요청 로그 확인
verification.getLog()
// 예상: GET /api/posts 요청이 로그에 기록됨

// 3. GET /api/posts 호출 횟수 확인
verification.testPosts()
// 예상: ✅ GET /api/posts가 1회만 호출됨
```

### Step 6: 댓글 기능 테스트
```javascript
// 1. PostCard 클릭하여 댓글 목록 로드

// 2. 댓글 작성

// 3. 댓글 요청 확인
verification.testComments()
// 예상: ✅ 각 postId당 GET /api/comments/:postId가 1회만 호출됨
```

### Step 7: 토큰 검증
```javascript
// Authorization 헤더 확인
verification.testAuthHeader()
// 예상: ✅ 토큰 형식 정상: Bearer eyJ... (따옴표 없음)

// 토큰 소스 확인
verification.testTokenSource()
// 예상: ✅ Redux에서 토큰을 읽음 (우선순위 1)
```

### Step 8: 전체 검증 실행
```javascript
// 모든 테스트 한 번에 실행
verification.runAll()

// 결과 확인
// 예상 출력:
// 🧪 커뮤니티 페이지 기능 검증 테스트 시작...
// 
// 📊 검증 결과 요약:
// ==================================================
// ✅ GET /api/posts 호출 횟수
//    ✅ GET /api/posts가 1회만 호출됨
// ...
// 
// 총 4개 테스트 중 4개 통과
```

---

## 📊 예상 테스트 결과

| 테스트 항목 | 예상 결과 | 확인 방법 |
|------------|----------|-----------|
| Verification 도구 로드 | ✅ 통과 | `window.verification` 객체 존재 |
| 네트워크 모니터링 | ✅ 통과 | `verification.start()` 성공 |
| GET /api/posts 호출 횟수 | ✅ 통과 | 1회만 호출 |
| GET /api/comments/:postId 호출 횟수 | ✅ 통과 | 각 postId당 1회만 호출 |
| Authorization 헤더 형식 | ✅ 통과 | `Bearer eyJ...` (따옴표 없음) |
| 토큰 소스 확인 | ✅ 통과 | Redux > memory > localStorage 순서 |
| 401 에러 처리 | ✅ 통과 | Refresh → 재시도 |
| 낙관적 업데이트 | ✅ 통과 | 즉시 UI 반영 |
| 댓글 수 동기화 | ✅ 통과 | postsSlice.commentCount 동기화 |
| 자동 리다이렉트 제거 | ✅ 통과 | 토스트만 표시, 페이지 유지 |

---

## 🚨 문제 발견 시 체크리스트

### GET /api/posts가 여러 번 호출되는 경우
- [ ] CommunityPage의 useEffect 의존성 배열 확인
- [ ] `isInitialLoad` 플래그가 제대로 작동하는지 확인
- [ ] `fetchPostsData` useCallback 의존성 확인

### GET /api/comments/:postId가 여러 번 호출되는 경우
- [ ] useComments의 `isAlreadyLoaded` 가드 확인
- [ ] useEffect 의존성 배열 확인
- [ ] Redux 상태에 댓글이 이미 있는지 확인

### Authorization 헤더에 따옴표가 포함된 경우
- [ ] tokenUtils의 따옴표 제거 로직 확인
- [ ] localStorage에 따옴표가 포함되어 저장되었는지 확인
- [ ] axios 인터셉터의 토큰 정제 로직 확인

### Refresh 토큰이 전송되지 않는 경우
- [ ] `withCredentials: true` 설정 확인
- [ ] 백엔드 CORS 설정 확인 (`credentials: true`)
- [ ] 쿠키 설정 확인 (`httpOnly`, `secure`, `sameSite`)

---

**작성일**: 2025-01-31  
**테스트 환경**: 브라우저 (Chrome/Edge 권장)  
**실행 방법**: DevTools Console에서 직접 실행

