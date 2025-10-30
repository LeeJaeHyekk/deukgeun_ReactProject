# 커뮤니티 페이지 기능 진단 보고서

## 📋 요청 정보 수집 템플릿

### A. 네트워크 캡처 (브라우저 DevTools → Network)

**아래 항목을 복사해서 실제 네트워크 로그로 채워주세요:**

#### 1. GET /api/posts 호출
```
요청 URL: 
요청 헤더: 
  - Authorization: 
  - Cookie: 
응답 상태: 
응답 바디: 
```

#### 2. GET /api/comments/:postId (문제 발생한 postId) 호출
```
요청 URL: 
요청 헤더: 
  - Authorization: 
  - Cookie: 
응답 상태: 
응답 바디: 
```

#### 3. 실패한 요청 예시 (댓글 삭제/수정/작성)
```
요청 URL: 
요청 메서드: 
요청 헤더: 
  - Authorization: 
  - Cookie: 
응답 상태: 
Response Headers: 
Response Body: 
```

---

## 🔍 코드 분석 결과

### 1. 발견된 문제점

#### ⚠️ Critical: useComments.ts에서 정의되지 않은 변수 사용

**위치**: `src/frontend/features/community/hooks/useComments.ts`

**문제**: 114, 217, 305번째 줄에서 `token` 변수를 사용하지만 정의되지 않음

```114:119:src/frontend/features/community/hooks/useComments.ts
    // 토큰 상태 상세 확인 (이미 위에서 선언됨)
    console.log('🔐 [useComments] 토큰 상태:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
      timestamp: new Date().toISOString()
    })
```

**해결**: `getCurrentToken()` 함수를 import하여 사용해야 함

#### ⚠️ Warning: 백엔드 라우터 URL 패턴 혼용

**위치**: `src/backend/routes/comment.ts`

**문제**: 
- GET `/api/comments/:id` → `id`는 `postId`
- POST `/api/comments/:id` → `id`는 `postId`  
- PUT `/api/comments/:id` → `id`는 `commentId`
- DELETE `/api/comments/:id` → `id`는 `commentId`

**현재 코드**:
```9:15:src/backend/routes/comment.ts
router.get("/:id", commentController.getCommentsByPostId)
router.post("/:id", authMiddleware, commentController.createComment)
router.put("/:id", authMiddleware, commentController.updateComment)
router.delete("/:id", authMiddleware, commentController.deleteComment)
```

**프론트엔드 API 호출**:
```436:444:src/frontend/shared/api/index.ts
const commentsApi = {
  list: (postId: number, params?: { page?: number; limit?: number }) =>
    api.get(`/api/comments/${postId}`, { params }),
  create: (postId: number, data: { content: string }) =>
    api.post(`/api/comments/${postId}`, data),
  update: (commentId: number, data: { content: string }) =>
    api.put(`/api/comments/${commentId}`, data),
  remove: (commentId: number) => api.delete(`/api/comments/${commentId}`),
}
```

**분석**: 프론트엔드는 올바르게 postId/commentId를 구분하고 있지만, 백엔드 라우터는 모두 `:id`로 받음. 
PUT/DELETE는 commentId를 받아야 하는데, 라우터 구조상 문제 없음 (요청 시 commentId를 URL에 포함하면 됨).

#### ✅ 정상: Axios 인터셉터 구조

**위치**: `src/frontend/shared/api/index.ts`

**분석**: 401 에러 시 refresh 시도, 실패 시에만 로그아웃 처리하는 구조가 올바르게 구현됨

```243:321:src/frontend/shared/api/index.ts
      if (
        originalRequest.response?.status === 401 &&
        !originalRequest.config?._retry &&
        originalRequest.config?.url !== '/api/auth/refresh' // refresh 엔드포인트 자체는 제외
      ) {
        // ... 토큰 갱신 로직 ...
        // 갱신 실패 시에만 로그아웃
        if (shouldLogout(refreshError)) {
          // ... 로그아웃 처리 ...
          window.location.href = '/login'
        }
      }
```

#### ✅ 정상: 댓글 낙관적 업데이트 구조

**위치**: `src/frontend/features/community/comments/commentsSlice.ts`

**분석**: 낙관적 업데이트와 롤백 로직이 올바르게 구현됨

---

## 🧩 프론트엔드 핵심 파일

### src/frontend/shared/api/index.ts (Axios 인스턴스)

**현재 상태**: 
- ✅ `withCredentials: true` 설정됨
- ✅ 401 인터셉터에서 refresh 시도 후 재시도
- ✅ refresh 실패 시에만 로그아웃
- ✅ 403 에러는 로그아웃 없이 에러만 전파

### src/frontend/features/community/comments/commentsSlice.ts

**현재 상태**:
- ✅ 낙관적 업데이트 구조 완성
- ✅ postsSlice와 commentCount 동기화
- ⚠️ `addCommentThunk`에서 localStorage 직접 접근 (tokenUtils 사용 권장)

### src/frontend/features/community/hooks/useComments.ts

**현재 상태**:
- ✅ 포스트별 1회 로드 가드 (`isAlreadyLoaded`) 적용
- ❌ **Critical**: `token` 변수 미정의 (114, 217, 305번째 줄)
- ✅ Redux 상태 기반 댓글 관리
- ✅ 낙관적 댓글과 확정 댓글 병합

### src/frontend/features/community/posts/postsSlice.ts

**현재 상태**:
- ✅ commentCount 동기화 액션 존재
- ✅ 댓글 수 증가/감소/설정 액션 구현
- ✅ createPost, updatePost, deletePost thunk 구현

### src/frontend/shared/store/authSlice.ts

**현재 상태**:
- ✅ `checkAutoLogin`에서 refresh 시도
- ✅ refresh 실패 시 `clearAllAuthData` 호출
- ✅ 토큰 유효성 검증 함수 존재

---

## 🔧 백엔드 핵심 파일

### src/backend/routes/comment.ts

**현재 상태**:
```typescript
router.get("/:id", commentController.getCommentsByPostId)           // postId
router.post("/:id", authMiddleware, commentController.createComment)  // postId
router.put("/:id", authMiddleware, commentController.updateComment)   // commentId
router.delete("/:id", authMiddleware, commentController.deleteComment) // commentId
```

**분석**: 
- GET/POST는 postId를 받고, PUT/DELETE는 commentId를 받음
- 프론트엔드 API 호출 구조와 일치 (문제 없음)

### src/backend/controllers/commentController.ts

**현재 상태**:
- ✅ 각 메서드에서 적절한 파라미터 파싱
- ✅ 권한 검사 (본인 댓글만 수정/삭제)
- ✅ 에러 응답 구조 일관성 있음

### src/backend/controllers/authController.ts

**현재 상태**:
- ✅ refresh 엔드포인트에서 쿠키에서 refreshToken 추출
- ✅ 쿠키 설정 통일 (httpOnly, secure, sameSite)
- ✅ 토큰 생성 시 환경변수 사용 (TOKEN_EXPIRY, REFRESH_EXPIRY)

### src/backend/index.ts (CORS / cookieParser 설정)

**현재 상태**:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",").filter(origin => origin.trim() !== "") || [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:5000",
    // ...
  ],
  credentials: true
}))
app.use(cookieParser())
```

**분석**: 
- ✅ `credentials: true` 설정됨
- ✅ cookieParser 미들웨어 적용

---

## 🚨 즉시 수정 필요 사항

### 1. useComments.ts에서 token 변수 정의 추가

**파일**: `src/frontend/features/community/hooks/useComments.ts`

**수정**:
```typescript
import { getCurrentToken } from '@frontend/shared/utils/tokenUtils'

// 함수 내부에서
const token = getCurrentToken()
```

### 2. commentsSlice.ts에서 localStorage 직접 접근 제거

**파일**: `src/frontend/features/community/comments/commentsSlice.ts`

**현재** (208번째 줄):
```typescript
const token = localStorage.getItem('accessToken')
```

**권장**:
```typescript
import { getCurrentToken } from '@frontend/shared/utils/tokenUtils'
const token = getCurrentToken()
```

---

## 📊 재현 시나리오 템플릿

### 정상 시나리오
1. CommunityPage 진입
2. `fetchPosts()` 호출 → GET /api/posts (1회만)
3. PostCard 클릭 → CommentsSection mount
4. `fetchComments(postId)` 호출 → GET /api/comments/:postId (1회만, 같은 postId는 재호출 안 됨)
5. 댓글 작성 → 낙관적 업데이트 → POST /api/comments/:postId → 서버 응답 후 확정
6. 댓글 수정 → PUT /api/comments/:commentId → 성공
7. 댓글 삭제 → DELETE /api/comments/:commentId → 성공

### 실패 시나리오
1. CommunityPage 진입
2. PostCard 클릭 → GET /api/comments/:postId **여러 번 호출됨** ❌
3. 댓글 작성 시도 → 401 에러 → refresh 시도 → refresh 실패 → /login 이동 ❌
4. 댓글 삭제 시도 → 403 에러 → 토스트만 표시 (페이지 유지) ✅

---

## ⚡ 빠른 자가 진단 체크리스트

### Network 탭에서 확인:

- [ ] GET /api/posts가 **1회만** 호출되는가?
  - ❌ 여러 번이면: useEffect 의존성 배열 확인 필요
  
- [ ] GET /api/comments/9 (동일 postId)가 **1회만** 호출되는가?
  - ❌ 여러 번이면: useComments의 `isAlreadyLoaded` 가드 확인 필요
  
- [ ] 실패한 요청의 Authorization 헤더가 `Bearer eyJ...` 형태인가?
  - ❌ `Bearer "eyJ..."` (따옴표 포함)이면: tokenUtils에서 쿼트 제거 로직 확인
  - ✅ 정상

### Console 로그에서 확인:

- [ ] `[tokenUtils] 토큰 가져오기 실패` 에러가 발생하는가?
  - ✅ 발생하면: useComments.ts의 token 변수 정의 필요
  
- [ ] `[401 처리] 토큰 갱신 실패` 후 바로 `/login` 이동하는가?
  - ✅ 이동하면: 정상 (refresh 실패 시에만)
  - ❌ 다른 401에도 이동하면: axios 인터셉터 로직 확인

---

## 🔧 수정 권장 사항 (우선순위)

### Priority 1 (Critical)
1. useComments.ts에서 `token` 변수 정의 추가
2. commentsSlice.ts에서 localStorage 직접 접근 제거 (tokenUtils 사용)

### Priority 2 (Important)
1. 댓글 작성 후 fetchComments 재호출 제거 (thunk에서 이미 상태 업데이트됨)
2. 에러 처리 일관성 확인 (모든 컴포넌트에서 window.location.href 제거)

### Priority 3 (Nice to have)
1. 댓글 수 동기화 타이밍 최적화
2. 낙관적 업데이트 실패 시 롤백 UI 개선

---

## 📝 실제 네트워크 로그 수집 방법

1. 브라우저 DevTools 열기 (F12)
2. Network 탭 선택
3. 문제 발생하는 액션 수행 (예: 댓글 삭제)
4. 해당 요청 클릭
5. Headers 탭에서 Request Headers 전체 복사
6. Response 탭에서 Response Body 전체 복사
7. 위 템플릿에 붙여넣기

---

**작성일**: 2025-01-31  
**분석 대상**: 커뮤니티 페이지 전체 기능  
**상태**: 코드 분석 완료, 실제 네트워크 로그 대기 중

