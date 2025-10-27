import React, { memo, useMemo, useCallback } from "react"
import { useSelector } from "react-redux"
import { PostCard } from "./postCard"
import { PostDTO as CommunityPost } from "../../../../shared/types"
import { makeSelectDisplayCommentCountWithFallback } from "../comments/commentsSelectors"
import { RootState } from "../../../shared/store"
import styles from "./postGrid.module.css"

// PostCard with selector factory-based comment count
const PostCardWithCommentCount = memo(function PostCardWithCommentCount({
  post,
  onPostClick,
}: {
  post: CommunityPost
  onPostClick: (post: CommunityPost) => void
}) {
  // Selector factory를 올바르게 사용 - 한 번 생성하고 재사용
  const selectDisplayCommentCount = useMemo(() => 
    makeSelectDisplayCommentCountWithFallback(), []
  )
  
  const displayCommentCount = useSelector((state: RootState) =>
    selectDisplayCommentCount(state, post.id)
  )

  if (process.env.NODE_ENV === 'development') {
    console.log('📋 [PostCardWithCommentCount] 렌더링:', { 
      postId: post.id, 
      title: post.title,
      displayCommentCount,
      originalCommentCount: post.commentCount
    })
  }

  return (
    <PostCard
      post={post}
      displayCommentCount={displayCommentCount}
      onPostClick={onPostClick}
    />
  )
})

interface PostGridProps {
  posts: CommunityPost[]
  onPostClick: (post: CommunityPost) => void
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const PostGrid = memo(function PostGrid({
  posts,
  onPostClick,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}: PostGridProps) {
  // 개발 환경에서만 렌더링 로그 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('📋 [PostGrid] 렌더링됨:', { 
      postsCount: posts.length, 
      loading: loading 
    })
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>게시글을 불러오는 중...</p>
      </div>
    )
  }

  // 빈 상태
  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>게시글이 없습니다</h3>
        <p>첫 번째 게시글을 작성해보세요!</p>
      </div>
    )
  }

  // PostCard 클릭 핸들러 메모이제이션
  const handlePostClick = useCallback((post: CommunityPost) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PostCard 클릭:', post.id)
    }
    onPostClick(post)
  }, [onPostClick])

  // PostCard 목록 메모이제이션 (selector factory 기반)
  const postCards = useMemo(() => {
    return posts.map(post => {
      return (
        <PostCardWithCommentCount
          key={post.id}
          post={post}
          onPostClick={handlePostClick}
        />
      )
    })
  }, [posts, handlePostClick])

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {postCards}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            이전
          </button>

          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
})

PostGrid.displayName = "PostGrid"