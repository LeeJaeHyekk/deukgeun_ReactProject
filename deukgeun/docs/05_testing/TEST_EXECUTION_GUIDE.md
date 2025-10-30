# 커뮤니티 페이지 기능 테스트 실행 가이드

## 🚀 빠른 시작

### 1단계: 프로젝트 실행
```bash
# 프론트엔드 실행
npm run dev

# 백엔드 실행 (다른 터미널)
npm run start
```

### 2단계: 브라우저에서 테스트 실행
1. 브라우저 열기: http://localhost:5173 (또는 설정된 포트)
2. DevTools 열기 (F12)
3. Console 탭 선택
4. 아래 명령어 실행:

```javascript
// 방법 1: 자동 테스트 스크립트 실행
// run-functional-tests.js 파일 내용을 복사하여 붙여넣기

// 방법 2: 수동으로 단계별 실행
verification.start()  // 1. 모니터링 시작
// ... 페이지에서 동작 수행 ...
verification.runAll()  // 2. 검증 실행
```

---

## 📋 단계별 테스트 절차

### Step 1: 초기 확인

**브라우저 콘솔에서 실행:**
```javascript
// Verification 도구 확인
typeof window.verification
// 예상: "object"

// 사용 가능한 메서드 확인
Object.keys(window.verification)
// 예상: ["start", "getLog", "clearLog", "addRequest", "testPosts", "testComments", "testAuthHeader", "testTokenSource", "runAll"]
```

**✅ 예상 결과:**
- `window.verification` 객체 존재
- 모든 필수 메서드 사용 가능

### Step 2: 네트워크 모니터링 시작

**브라우저 콘솔에서 실행:**
```javascript
verification.start()
```

**✅ 예상 결과:**
```
✅ 네트워크 모니터링 시작됨 (PerformanceObserver)
✅ Axios 인터셉터가 활성화되어 있습니다.
```

### Step 3: 커뮤니티 페이지 진입

**동작:**
1. 브라우저에서 `/community` 페이지로 이동
2. 또는 이미 커뮤니티 페이지에 있다면 새로고침 (F5)

**✅ 확인사항:**
- 페이지가 정상적으로 로드됨
- 게시글 목록이 표시됨

### Step 4: GET /api/posts 호출 횟수 확인

**브라우저 콘솔에서 실행:**
```javascript
verification.testPosts()
```

**✅ 예상 결과:**
```javascript
{
  test: 'GET /api/posts 호출 횟수',
  passed: true,
  message: '✅ GET /api/posts가 1회만 호출됨',
  details: {
    count: 1,
    requests: [{
      url: '/api/posts',
      method: 'GET',
      timestamp: '2025-01-31T...'
    }]
  }
}
```

**또는 Network 탭에서 확인:**
- DevTools → Network 탭
- 필터: `posts`
- GET /api/posts 요청이 **1회만** 나타나는지 확인

### Step 5: 댓글 기능 테스트

**동작:**
1. 게시글 클릭하여 댓글 섹션 열기
2. 댓글 작성 (로그인 필요)

**브라우저 콘솔에서 실행:**
```javascript
verification.testComments()
```

**✅ 예상 결과:**
```javascript
{
  test: 'GET /api/comments/:postId 호출 횟수',
  passed: true,
  message: '✅ 각 postId당 GET /api/comments/:postId가 1회만 호출됨',
  details: {
    totalRequests: 2,  // 예: postId 9, 10
    postIdCounts: { 9: 1, 10: 1 },
    duplicates: []
  }
}
```

**특정 postId 확인:**
```javascript
verification.testComments(9)  // postId 9에 대한 호출 확인
```

### Step 6: Authorization 헤더 확인

**브라우저 콘솔에서 실행:**
```javascript
verification.testAuthHeader()
```

**✅ 예상 결과:**
```javascript
{
  test: 'Authorization 헤더 형식',
  passed: true,
  message: '✅ 토큰 형식 정상: Bearer eyJ... (따옴표 없음)',
  details: {
    bearerHeader: 'Bearer eyJ...',
    hasQuotes: false,
    isBearerFormat: true,
    hasValidBearerFormat: true,
    source: 'getCurrentToken()'
  }
}
```

**Network 탭에서 직접 확인:**
1. DevTools → Network 탭
2. 특정 API 요청 클릭 (예: POST /api/comments/:postId)
3. Headers 탭 → Request Headers
4. `Authorization: Bearer eyJ...` 확인 (따옴표 없음)

### Step 7: 토큰 소스 확인

**브라우저 콘솔에서 실행:**
```javascript
verification.testTokenSource()
```

**✅ 예상 결과:**
```javascript
{
  test: '토큰 소스 확인',
  passed: true,
  message: '✅ Redux에서 토큰을 읽음 (우선순위 1)',
  details: {
    source: 'Redux',
    tokenPreview: 'eyJ...',
    checkedSources: [
      { name: 'Redux', hasToken: true },
      { name: 'Memory', hasToken: false },
      { name: 'localStorage', hasToken: true }
    ]
  }
}
```

### Step 8: 전체 검증 실행

**브라우저 콘솔에서 실행:**
```javascript
verification.runAll()
```

**✅ 예상 출력:**
```
🧪 커뮤니티 페이지 기능 검증 테스트 시작...

📊 검증 결과 요약:
==================================================
✅ GET /api/posts 호출 횟수
   ✅ GET /api/posts가 1회만 호출됨

✅ GET /api/comments/:postId 호출 횟수
   ✅ 각 postId당 GET /api/comments/:postId가 1회만 호출됨

✅ Authorization 헤더 형식
   ✅ 토큰 형식 정상: Bearer eyJ... (따옴표 없음)

✅ 토큰 소스 확인
   ✅ Redux에서 토큰을 읽음 (우선순위 1)

총 4개 테스트 중 4개 통과
```

---

## 🔍 상세 테스트 시나리오

### 시나리오 1: 페이지 로드 시 중복 호출 방지

**목적**: GET /api/posts가 여러 번 호출되지 않는지 확인

**절차:**
1. 모니터링 시작: `verification.start()`
2. 로그 초기화: `verification.clearLog()` (선택사항)
3. 커뮤니티 페이지 새로고침 (F5)
4. 검증: `verification.testPosts()`

**✅ 성공 기준:**
- GET /api/posts가 **1회만** 호출됨
- `count: 1` 반환

### 시나리오 2: 댓글 중복 로드 방지

**목적**: 같은 postId에 대해 댓글이 여러 번 로드되지 않는지 확인

**절차:**
1. 모니터링 시작: `verification.start()`
2. 게시글 A 클릭 → 댓글 목록 로드
3. 댓글 섹션 닫기
4. 게시글 A 다시 클릭 → 댓글 목록 다시 로드 시도
5. 검증: `verification.testComments(게시글A의ID)`

**✅ 성공 기준:**
- GET /api/comments/:postId가 **1회만** 호출됨
- `postIdCounts: { [게시글A의ID]: 1 }` 반환

### 시나리오 3: 401 에러 시 Refresh 토큰 동작

**목적**: Refresh 토큰으로 자동 갱신 및 재시도 확인

**절차:**
1. Network 탭 열기
2. 토큰 임시 제거 (테스트용):
   ```javascript
   localStorage.removeItem('accessToken')
   ```
3. 댓글 작성 시도
4. Network 탭에서 확인:
   - 첫 요청: 401 응답
   - POST /api/auth/refresh 호출 (withCredentials: true)
   - 원 요청 자동 재시도: 성공

**✅ 성공 기준:**
- Refresh 토큰이 쿠키로 전송됨
- 원 요청이 자동으로 재시도됨
- 재시도 요청이 성공함

### 시나리오 4: 낙관적 업데이트 확인

**목적**: 댓글 작성 시 즉시 UI 반영 확인

**절차:**
1. 댓글 작성 전 댓글 수 확인
2. 댓글 작성 버튼 클릭
3. 즉시 댓글이 목록에 나타나는지 확인 (낙관적 업데이트)
4. Network 탭에서 POST /api/comments/:postId 확인
5. 서버 응답 후 댓글 ID가 업데이트되는지 확인

**✅ 성공 기준:**
- 댓글 작성 즉시 UI에 표시됨
- 서버 응답 후 실제 댓글로 교체됨
- 실패 시 롤백됨

### 시나리오 5: 댓글 수 동기화 확인

**목적**: postsSlice.commentCount가 정확히 동기화되는지 확인

**절차:**
1. Redux DevTools 열기 (있는 경우)
2. 댓글 작성 전 commentCount 확인
3. 댓글 작성
4. Redux 상태에서 commentCount 증가 확인
5. 댓글 삭제
6. Redux 상태에서 commentCount 감소 확인

**✅ 성공 기준:**
- 댓글 작성 시 commentCount 증가
- 댓글 삭제 시 commentCount 감소
- postsSlice와 동기화됨

---

## 🔧 문제 해결

### 문제 1: verification 도구가 로드되지 않음

**증상:**
```javascript
typeof window.verification
// "undefined"
```

**해결 방법:**
1. 개발 환경에서 실행 중인지 확인 (`npm run dev`)
2. 브라우저 콘솔에서 에러 확인
3. verification.ts 파일이 제대로 import되었는지 확인

### 문제 2: 네트워크 모니터링이 작동하지 않음

**증상:**
```javascript
verification.start()
verification.getLog()  // 빈 배열
```

**해결 방법:**
1. PerformanceObserver 지원 확인
2. 페이지 새로고침 후 다시 시도
3. Network 탭에서 직접 확인 (fallback)

### 문제 3: GET /api/posts가 여러 번 호출됨

**증상:**
```javascript
verification.testPosts()
// ❌ GET /api/posts가 3회 호출됨
```

**해결 방법:**
1. CommunityPage의 `isInitialLoad` 플래그 확인
2. useEffect 의존성 배열 확인
3. Redux `loading` 상태 확인

### 문제 4: Authorization 헤더에 따옴표 포함

**증상:**
```javascript
verification.testAuthHeader()
// ❌ 토큰 형식 문제: 따옴표 포함
```

**해결 방법:**
1. localStorage에서 토큰 확인 및 정제
2. tokenUtils의 따옴표 제거 로직 확인
3. axios 인터셉터의 토큰 정제 로직 확인

---

## 📊 테스트 결과 기록

### 템플릿

```
테스트 실행 시간: [날짜/시간]
브라우저: [Chrome/Edge/etc]
환경: [개발/프로덕션]

결과:
1. GET /api/posts 호출 횟수: ✅/❌ (1회/다중)
2. GET /api/comments/:postId 호출 횟수: ✅/❌
3. Authorization 헤더 형식: ✅/❌
4. 토큰 소스 확인: ✅/❌ (Redux/Memory/localStorage)

문제 발견:
- [문제 설명]

다음 단계:
- [수정 사항 또는 추가 확인 필요]
```

---

## ✅ 완료 체크리스트

기능 테스트 완료 후 확인:

- [ ] Verification 도구 로드 확인
- [ ] 네트워크 모니터링 시작 확인
- [ ] GET /api/posts 1회 호출 확인
- [ ] GET /api/comments/:postId 각 1회 호출 확인
- [ ] Authorization 헤더 형식 확인 (Bearer eyJ...)
- [ ] 토큰 소스 우선순위 확인 (Redux > memory > localStorage)
- [ ] 401 에러 시 refresh → 재시도 확인
- [ ] 낙관적 업데이트 확인
- [ ] 댓글 수 동기화 확인
- [ ] 자동 리다이렉트 제거 확인

---

**작성일**: 2025-01-31  
**테스트 환경**: 브라우저 (Chrome/Edge 권장)  
**실행 방법**: DevTools Console에서 직접 실행

