import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@frontend/shared/store'

// 서버에서 받은 댓글 수 (posts.entities[postId].commentCount)
export const selectPostCommentCount = (state: RootState, postId: number) =>
  state.posts.entities[postId]?.commentCount ?? 0

// 초기 서버 데이터에서 댓글 수 가져오기 (fallback용)
export const selectInitialCommentCount = (state: RootState, postId: number, fallbackCount?: number) => {
  const reduxCount = state.posts.entities[postId]?.commentCount
  return reduxCount ?? fallbackCount ?? 0
}

// 확정된 댓글 목록 (서버에서 받은 댓글)
export const selectConfirmedCommentsForPost = (state: RootState, postId: number) =>
  state.comments.byPost[postId] ?? []

// 낙관적 댓글 목록 (서버 확정 전 임시 댓글)
export const selectOptimisticCommentsForPost = (state: RootState, postId: number) =>
  state.comments.optimisticTemp[postId] ?? []

// 낙관적 댓글 수 (원시값 반환 - createSelector 최적화용)
export const selectOptimisticCommentCountForPost = (state: RootState, postId: number) =>
  state.comments.optimisticTemp?.[postId]?.length ?? 0

// 댓글 로딩 상태
export const selectCommentsLoading = (state: RootState, postId: number) =>
  state.comments.loading[postId] ?? false

// 통합 댓글 수 계산 (서버 수 + 낙관적 델타) - 원시값 사용
export const selectDisplayCommentCount = createSelector(
  [
    (s: RootState, postId: number) => selectPostCommentCount(s, postId),
    (s: RootState, postId: number) => selectOptimisticCommentCountForPost(s, postId),
  ],
  (serverCount, optimisticCount) => {
    const displayCount = serverCount + optimisticCount
    
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [commentsSelectors] 댓글 수 계산:', {
        serverCount,
        optimisticCount,
        displayCount
      })
    }
    
    return displayCount
  }
)

// 개선된 통합 댓글 수 계산 (fallback 우선순위 개선) - 원시값 사용
export const selectDisplayCommentCountWithFallback = createSelector(
  [
    (s: RootState, postId: number, fallbackCount?: number) => selectInitialCommentCount(s, postId, fallbackCount),
    (s: RootState, postId: number) => selectOptimisticCommentCountForPost(s, postId),
  ],
  (serverCount, optimisticCount) => {
    const displayCount = serverCount + optimisticCount
    
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [commentsSelectors] 댓글 수 계산 (fallback):', {
        serverCount,
        optimisticCount,
        displayCount
      })
    }
    
    return displayCount
  }
)

// 특정 포스트의 모든 댓글 (확정 + 낙관적)
export const selectAllCommentsForPost = createSelector(
  [
    (s: RootState, postId: number) => selectConfirmedCommentsForPost(s, postId),
    (s: RootState, postId: number) => selectOptimisticCommentsForPost(s, postId),
  ],
  (confirmedComments, optimisticComments) => {
    return [...confirmedComments, ...optimisticComments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }
)

// 댓글 수 변화 감지 (이전 값과 비교)
export const selectCommentCountChange = createSelector(
  [
    (s: RootState, postId: number) => selectDisplayCommentCount(s, postId),
    (s: RootState, postId: number) => selectPostCommentCount(s, postId),
  ],
  (displayCount, serverCount) => ({
    displayCount,
    serverCount,
    hasOptimisticChanges: displayCount !== serverCount
  })
)

// Selector Factory - 각 포스트별 독립 캐시를 위한 팩토리 함수
export const makeSelectDisplayCommentCount = () => createSelector(
  [
    (s: RootState, postId: number) => selectPostCommentCount(s, postId),
    (s: RootState, postId: number) => selectOptimisticCommentCountForPost(s, postId),
  ],
  (serverCount, optimisticCount) => {
    const displayCount = serverCount + optimisticCount
    
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [commentsSelectors] Factory 댓글 수 계산:', {
        serverCount,
        optimisticCount,
        displayCount
      })
    }
    
    return displayCount
  }
)

// Selector Factory with Fallback - postsSlice 실시간 상태 직접 참조
export const makeSelectDisplayCommentCountWithFallback = () => createSelector(
  [
    (s: RootState, postId: number) => s.posts.entities[postId]?.commentCount ?? 0,
    (s: RootState, postId: number) => s.comments.optimisticTemp[postId]?.length ?? 0,
    (s: RootState, postId: number) => s.comments.byPost[postId]?.length ?? 0,
    (s: RootState, postId: number) => s.comments.byPost[postId] !== undefined,
  ],
  (baseCount, optimisticCount, confirmedCount, hasCommentsData) => {
    // 댓글 데이터가 로드된 경우 실제 댓글 수를 우선 사용
    if (hasCommentsData) {
      const finalCount = confirmedCount + optimisticCount
      
      // 디버깅 로그는 과도한 출력을 방지하기 위해 제거
      // 필요 시 주석 해제하여 사용
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('🔍 [commentsSelectors] 댓글 수 계산 (실제 댓글 기반):', {
      //     confirmedCount,
      //     optimisticCount,
      //     finalCount,
      //     hasCommentsData,
      //     timestamp: new Date().toISOString()
      //   })
      // }
      
      return finalCount
    }
    
    // 댓글 데이터가 로드되지 않은 경우 postsSlice의 값 사용
    const finalCount = baseCount + optimisticCount

    // 디버깅 로그는 과도한 출력을 방지하기 위해 제거
    // 필요 시 주석 해제하여 사용
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('🔍 [commentsSelectors] 댓글 수 계산 (postsSlice 기반):', {
    //     baseCount,
    //     optimisticCount,
    //     finalCount,
    //     hasCommentsData,
    //     timestamp: new Date().toISOString()
    //   })
    // }

    return finalCount
  }
)
