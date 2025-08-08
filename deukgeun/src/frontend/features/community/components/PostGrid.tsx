import { PostCard } from "./PostCard"
import styles from "./PostGrid.module.css"

interface Post {
  id: number
  title: string
  content: string
  author: {
    id: number
    nickname: string
  }
  category: string
  likes: number
  comments: number
  createdAt: string
  updatedAt: string
}

interface PostGridProps {
  posts: Post[]
  onPostClick: (post: Post) => void
  onLikeClick: (postId: number) => void
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PostGrid({
  posts,
  onPostClick,
  onLikeClick,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}: PostGridProps) {
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
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post)}
            onLikeClick={() => onLikeClick(post.id)}
          />
        ))}
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
}
