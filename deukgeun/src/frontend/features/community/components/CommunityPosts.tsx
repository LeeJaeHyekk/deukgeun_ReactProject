import { Post as CommunityPost } from "../../../../shared/types"
import { PostGrid } from "./PostGrid"
import styles from "./CommunityPosts.module.css"

interface CommunityPostsProps {
  posts: CommunityPost[]
  loading: boolean
  currentPage: number
  totalPages: number
  onPostClick: (post: CommunityPost) => void
  onLikeClick: (postId: number) => void
  onPageChange: (page: number) => void
  likedPosts: Set<number>
  onCreatePost: () => void
}

export function CommunityPosts({
  posts,
  loading,
  currentPage,
  totalPages,
  onPostClick,
  onLikeClick,
  onPageChange,
  likedPosts,
  onCreatePost,
}: CommunityPostsProps) {
  if (loading) {
    return (
      <section className={styles.postsSection}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>게시글을 불러오는 중...</p>
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return (
      <section className={styles.postsSection}>
        <div className={styles.emptyState}>
          <h3>게시글이 없습니다</h3>
          <p>첫 번째 게시글을 작성해보세요!</p>
          <button className={styles.createFirstPostBtn} onClick={onCreatePost}>
            ✏️ 첫 게시글 작성하기
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.postsSection}>
      <PostGrid
        posts={posts}
        onPostClick={onPostClick}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  )
}
