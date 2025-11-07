import React, { memo, useMemo, useCallback, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { PostCard } from "./PostCard"
import { PostDTO as CommunityPost } from "../../../../shared/types"
import { makeSelectDisplayCommentCountWithFallback } from "../comments/commentsSelectors"
import { RootState } from "../../../shared/store"
import styles from "./postGrid.module.css"

// PostCard with selector factory-based comment count (렌더링 최적화)
const PostCardWithCommentCount = memo(function PostCardWithCommentCount({
  post,
  onPostClick,
}: {
  post: CommunityPost
  onPostClick: (post: CommunityPost) => void
}) {
  // Selector factory를 올바르게 사용 - 한 번 생성하고 재사용 (안정적인 참조)
  const selectDisplayCommentCount = useMemo(() => 
    makeSelectDisplayCommentCountWithFallback(), []
  )
  
  // 이전 displayCommentCount 추적 (렌더링 최적화)
  const prevDisplayCommentCountRef = useRef<number | null>(null)
  
  const displayCommentCount = useSelector((state: RootState) =>
    selectDisplayCommentCount(state, post.id)
  )
  
  // 실제 변경이 있을 때만 로그 출력 (렌더링 최적화)
  useEffect(() => {
    const prevCount = prevDisplayCommentCountRef.current
    if (prevCount !== displayCommentCount) {
      prevDisplayCommentCountRef.current = displayCommentCount
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 [PostCardWithCommentCount] 상태 변경:', { 
          postId: post.id, 
          title: post.title,
          displayCommentCount,
          originalCommentCount: post.commentCount,
          changed: prevCount !== null
        })
      }
    }
  }, [displayCommentCount, post.id, post.title, post.commentCount])

  return (
    <PostCard
      post={post}
      displayCommentCount={displayCommentCount}
      onPostClick={onPostClick}
    />
  )
}, (prevProps, nextProps) => {
  // props 비교 함수 (렌더링 최적화)
  // post 객체가 동일한 참조이거나 중요한 필드가 동일한지 확인
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.title === nextProps.post.title &&
    prevProps.post.likeCount === nextProps.post.likeCount &&
    prevProps.post.commentCount === nextProps.post.commentCount &&
    prevProps.onPostClick === nextProps.onPostClick
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
  // 페이지네이션 상태 추적 (렌더링 최적화)
  const prevPaginationRef = useRef({ currentPage, totalPages })
  useEffect(() => {
    const prevPagination = prevPaginationRef.current
    const changed = prevPagination.currentPage !== currentPage || 
                    prevPagination.totalPages !== totalPages
    if (changed) {
      prevPaginationRef.current = { currentPage, totalPages }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 [PostGrid] 페이지네이션 상태 변경:', {
          previous: {
            currentPage: prevPagination.currentPage,
            totalPages: prevPagination.totalPages
          },
          current: {
            currentPage,
            totalPages
          },
          postsCount: posts.length,
          timestamp: new Date().toISOString()
        })
      }
    }
  }, [currentPage, totalPages, posts.length])

  // 이전 posts 추적 (렌더링 최적화)
  const prevPostsRef = useRef(posts)
  useEffect(() => {
    const prevPosts = prevPostsRef.current
    const postsChanged = prevPosts.length !== posts.length ||
                         prevPosts.some((post, index) => {
                           const currentPost = posts[index]
                           return !currentPost || post.id !== currentPost.id
                         })
    
    if (postsChanged) {
      prevPostsRef.current = posts
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 [PostGrid] 렌더링됨:', {
          postsCount: posts.length,
          loading,
          currentPage,
          totalPages
        })
      }
    }
  }, [posts, loading, currentPage, totalPages])

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

  // PostCard 클릭 핸들러 메모이제이션 (안정적인 참조)
  const handlePostClick = useCallback((post: CommunityPost) => {
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
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (currentPage > 1) {
                const newPage = currentPage - 1
                if (process.env.NODE_ENV === 'development') {
                  console.log('📄 [PostGrid] 이전 페이지로 이동:', {
                    from: currentPage,
                    to: newPage,
                    totalPages
                  })
                }
                onPageChange(newPage)
              }
            }}
            disabled={currentPage <= 1}
            className={styles.pageButton}
            aria-label={`이전 페이지 (현재: ${currentPage}, 전체: ${totalPages})`}
          >
            이전
          </button>

          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (currentPage < totalPages) {
                const newPage = currentPage + 1
                if (process.env.NODE_ENV === 'development') {
                  console.log('📄 [PostGrid] 다음 페이지로 이동:', {
                    from: currentPage,
                    to: newPage,
                    totalPages
                  })
                }
                onPageChange(newPage)
              }
            }}
            disabled={currentPage >= totalPages}
            className={styles.pageButton}
            aria-label={`다음 페이지 (현재: ${currentPage}, 전체: ${totalPages})`}
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
})

PostGrid.displayName = "PostGrid"