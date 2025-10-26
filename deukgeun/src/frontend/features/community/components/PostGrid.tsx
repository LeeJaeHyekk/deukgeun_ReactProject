import React, { memo } from "react"
import { PostCard } from "./PostCard"
import { PostDTO as CommunityPost } from "../../../../shared/types"
import styles from "./PostGrid.module.css"

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
  console.log('📋 [PostGrid] 렌더링됨:', { 
    postsCount: posts.length, 
    loading: loading 
  })
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>게시글이 없습니다</h3>
        <p>첫 번째 게시글을 작성해보세요!</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {posts.map(post => {
          console.log('📋 [PostGrid] PostCard 렌더링:', { postId: post.id, title: post.title })
          return (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => {
                console.log('PostCard 클릭:', post.id)
                onPostClick(post)
              }}
            />
          )
        })}
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
