// ================================================================
// postsSelectors.ts
// 게시글 관련 Redux Selector (메모이제이션 포함)
// ================================================================
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "@frontend/shared/store"

// 1️⃣ 기본 엔티티 접근자
export const selectPostsEntities = (state: RootState) => state.posts.entities
export const selectPostsIds = (state: RootState) => state.posts.ids
export const selectPostsLoading = (state: RootState) => state.posts.loading
export const selectPostsError = (state: RootState) => state.posts.error
export const selectPostsPagination = (state: RootState) => ({
  page: state.posts.page,
  totalPages: state.posts.totalPages,
  total: state.posts.total,
})

// 2️⃣ 전체 게시글 배열 (메모이제이션 적용)
export const selectAllPosts = createSelector(
  [selectPostsIds, selectPostsEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter(Boolean)
)

// 3️⃣ 단일 게시글 선택 (메모이제이션 적용)
export const selectPostById = createSelector(
  [selectPostsEntities, (_: RootState, postId: number) => postId],
  (entities, postId) => entities[postId]
)

// 4️⃣ 좋아요 상태와 결합된 게시글
export const selectPostWithLike = (postId: number) => createSelector(
  [selectPostById, (state: RootState) => state.likes.likedIds],
  (post, likedIds) => {
    if (!post) return null
    return {
      ...post,
      isLiked: likedIds.includes(post.id),
    }
  }
)

// 5️⃣ 모든 게시글 + 좋아요 상태 조합 (메모이제이션 적용)
export const selectAllPostsWithLikes = createSelector(
  [selectAllPosts, (state: RootState) => state.likes.likedIds],
  (posts, likedIds) => {
    return posts.map(post => ({
      ...post,
      isLiked: likedIds.includes(post.id),
    }))
  }
)

// 6️⃣ 카테고리별 게시글 필터링 (선택적)
export const selectPostsByCategory = createSelector(
  [selectAllPostsWithLikes, (_: RootState, category: string) => category],
  (posts, category) => {
    if (!category || category === "ALL") return posts
    return posts.filter((post) => 
      typeof post.category === 'string' 
        ? post.category === category 
        : (post.category as any)?.name === category
    )
  }
)

// 7️⃣ 검색 결과 필터링
export const selectPostsBySearch = createSelector(
  [selectAllPostsWithLikes, (_: RootState, searchTerm: string) => searchTerm],
  (posts, searchTerm) => {
    if (!searchTerm.trim()) return posts
    const term = searchTerm.toLowerCase()
    return posts.filter((post) => 
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term)
    )
  }
)

// 8️⃣ 정렬된 포스트
export const selectSortedPosts = createSelector(
  [selectAllPostsWithLikes, (_: RootState, sortBy: 'latest' | 'popular' | 'oldest') => sortBy],
  (posts, sortBy) => {
    const sorted = [...posts]
    switch (sortBy) {
      case 'latest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'popular':
        return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      default:
        return sorted
    }
  }
)

// 9️⃣ 통계 셀렉터
export const selectPostsStats = createSelector(
  [selectAllPosts],
  (posts) => ({
    totalPosts: posts.length,
    totalLikes: posts.reduce((sum, post) => sum + (post.likeCount || 0), 0),
    totalComments: posts.reduce((sum, post) => sum + (post.commentCount || 0), 0),
    averageLikes: posts.length > 0 
      ? posts.reduce((sum, post) => sum + (post.likeCount || 0), 0) / posts.length 
      : 0,
  })
)
