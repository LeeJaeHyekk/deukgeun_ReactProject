# 커뮤니티 페이지 기능 개선 적용 완료

## ✅ 적용된 수정사항

### 1. tokenUtils.ts 개선 (Priority 1 - Critical)

**파일**: `src/frontend/shared/utils/tokenUtils.ts`

**변경사항**:
- Redux store에서 토큰 우선 읽기 추가
- 우선순위: **Redux > memory > localStorage**
- Circular dependency 방지를 위해 lazy require 사용
- 모든 토큰 소스에서 따옴표 제거 및 trim 보장

**개선 내용**:
```typescript
export function getCurrentToken(): string | null {
  // 1. Redux store에서 토큰 가져오기 (가장 최신 상태)
  try {
    const { store } = require('@frontend/shared/store')
    const state = store?.getState?.()
    const reduxToken = state?.auth?.accessToken || state?.auth?.user?.accessToken
    if (reduxToken) {
      return String(reduxToken).trim().replace(/^"(.*)"$/, '$1')
    }
  } catch {
    // Circular dependency 방지 - 조용히 넘어감
  }
  
  // 2. Memory에서 토큰 가져오기
  // 3. localStorage에서 토큰 가져오기
  // ...
}
```

### 2. api/index.ts 요청 인터셉터 개선 (Priority 1 - Critical)

**파일**: `src/frontend/shared/api/index.ts`

**변경사항**:
- `getCurrentToken()` 사용으로 통일
- 토큰 정제 로직 강화 (따옴표 제거, trim, 빈 문자열 체크)
- Authorization 헤더 설정 시 안전성 향상

**개선 내용**:
```typescript
instance.interceptors.request.use((config) => {
  const raw = getCurrentToken()
  
  // 토큰 정제: 따옴표 제거 및 trim (안전하게 처리)
  let token: string | null = null
  if (raw && typeof raw === 'string') {
    token = String(raw).trim().replace(/^"(.*)"$/, '$1')
    if (!token || token.length === 0) {
      token = null
    }
  }
  
  // Authorization 헤더 설정 (token이 유효한 경우만)
  if (token && typeof token === 'string' && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})
```

### 3. useComments.ts - token 변수 정의 추가 (Priority 1 - Critical) ✅

**파일**: `src/frontend/features/community/hooks/useComments.ts`

**변경사항**:
- 이미 완료됨 (이전 작업)
- `getCurrentToken()` import 및 사용

### 4. commentsSlice.ts - localStorage 직접 접근 제거 (Priority 1 - Critical) ✅

**파일**: `src/frontend/features/community/comments/commentsSlice.ts`

**변경사항**:
- 이미 완료됨 (이전 작업)
- `getCurrentToken()` 사용으로 통일

### 5. useCommunityPosts.ts - 하드 리다이렉트 제거 (Priority 2 - Important)

**파일**: `src/frontend/features/community/hooks/useCommunityPosts.ts`

**변경사항**:
- 토큰 검증 실패 시 자동 리다이렉트 제거
- 토스트 메시지만 표시하고 사용자가 직접 이동하도록 변경

**개선 내용**:
```typescript
// Before
if (!token) {
  showToast('로그인이 만료되었습니다. 다시 로그인해주세요.', 'error')
  window.location.href = '/login'  // ❌ 자동 리다이렉트
  return false
}

// After
if (!token) {
  showToast('로그인이 필요합니다. 로그인 후 이용해주세요.', 'error')
  // 토스트만 표시, 자동 리다이렉트 없음
  return false
}
```

## 🔍 확인된 정상 동작

### window.location.href 사용 (의도된 동작)

1. **`shared/api/index.ts` (라인 320)**
   - Refresh 토큰 갱신 실패 시에만 `/login` 이동
   - `shouldLogout(refreshError)` 체크 후 실행 ✅

2. **`CommentsSection.tsx` (라인 176)**
   - 로그인 버튼 클릭 시 `/login` 이동
   - 사용자 의도된 동작 ✅

3. **`LoginPage.tsx`, `Error/useErrorHandler.ts`**
   - 로그인 페이지 및 에러 핸들러 내부
   - 의도된 동작 ✅

## ✅ 검증 체크리스트

### 코드 수정 완료
- [x] tokenUtils.ts - Redux store 우선 읽기 추가
- [x] api/index.ts - 토큰 정제 로직 강화
- [x] useComments.ts - token 변수 정의
- [x] commentsSlice.ts - localStorage 직접 접근 제거
- [x] useCommunityPosts.ts - 자동 리다이렉트 제거

### 런타임 검증 필요
다음 사항은 브라우저에서 직접 테스트해야 합니다:

#### 1. 기본 동작 확인
- [ ] GET /api/posts가 **1회만** 호출되는지 확인
- [ ] GET /api/comments/:postId가 **1회만** 호출되는지 확인 (같은 postId)
- [ ] Authorization 헤더가 `Bearer eyJ...` 형태인지 확인 (따옴표 없음)

#### 2. 댓글 기능 확인
- [ ] POST /api/comments/:postId - 댓글 작성 (201 응답)
- [ ] PUT /api/comments/:commentId - 댓글 수정 (200 응답)
- [ ] DELETE /api/comments/:commentId - 댓글 삭제 (200 응답)
- [ ] 낙관적 업데이트가 즉시 반영되고 서버 응답 후 확정되는지 확인
- [ ] 댓글 수(postSlice.commentCount)가 동기화되는지 확인

#### 3. 인증/에러 처리 확인
- [ ] 401 발생 시 POST /api/auth/refresh 호출 확인
- [ ] Refresh 성공 시 원 요청 자동 재시도 확인
- [ ] Refresh 실패 시에만 `/login` 이동 확인
- [ ] 일반 401/403은 토스트만 표시하고 페이지 유지 확인

#### 4. 토큰 소스 확인
- [ ] Redux store에서 토큰을 우선 읽는지 확인 (콘솔 로그)
- [ ] Redux 실패 시 memory, localStorage 순으로 폴백하는지 확인

## 📝 추가 권장사항

### 1. CommentsSection의 로그인 버튼
현재 `window.location.href = '/login'` 사용 중입니다. 
더 나은 방법:
- React Router의 `useNavigate()` 사용
- 또는 로그인 모달 열기

### 2. 에러 처리 일관성
모든 컴포넌트에서 동일한 에러 처리 패턴 사용:
- 토스트 메시지 표시
- 자동 리다이렉트 제거 (refresh 실패 제외)
- 사용자에게 명확한 안내

### 3. 토큰 관리
- Redux store가 최신 상태 유지
- Memory는 빠른 접근용
- localStorage는 복구용

## 🚀 다음 단계

1. **프로젝트 재시작**
   ```bash
   npm run dev  # 프론트엔드
   npm run start  # 백엔드
   ```

2. **브라우저에서 테스트**
   - Network 탭에서 요청 모니터링
   - Console 탭에서 토큰 소스 로그 확인
   - 기능별 동작 확인

3. **문제 발견 시**
   - Network 탭에서 Request/Response 헤더 확인
   - Console 로그 확인
   - `COMMUNITY_DIAGNOSIS_REPORT.md` 참조

## 📄 관련 파일

- `COMMUNITY_DIAGNOSIS_REPORT.md` - 진단 보고서 및 네트워크 로그 템플릿
- `src/frontend/shared/utils/tokenUtils.ts` - 토큰 유틸리티 (개선됨)
- `src/frontend/shared/api/index.ts` - Axios 인터셉터 (개선됨)
- `src/frontend/features/community/hooks/useComments.ts` - 댓글 훅 (수정됨)
- `src/frontend/features/community/comments/commentsSlice.ts` - 댓글 Redux (수정됨)
- `src/frontend/features/community/hooks/useCommunityPosts.ts` - 포스트 훅 (수정됨)

---

**작성일**: 2025-01-31  
**상태**: 코드 수정 완료, 런타임 검증 대기 중

