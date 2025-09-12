import { Post as CommunityPost } from '../../../../shared/types'
import { useAuthContext } from '@frontend/shared/contexts/AuthContext'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: CommunityPost
  onClick: () => void
  onLikeClick: () => void
  isLiked?: boolean
}

export function PostCard({
  post,
  onClick,
  onLikeClick,
  isLiked = false,
}: PostCardProps) {
  const currentLikeCount =
    (post as any).likeCount || (post as any).like_count || 0
  const currentCommentCount =
    (post as any).commentCount || (post as any).comment_count || 0
  console.log('🎨 PostCard 렌더링:', {
    id: post.id,
    title: post.title,
    isLiked,
    likeCount: currentLikeCount,
    commentCount: currentCommentCount,
    rawPost: post,
  })
  const { isAuthenticated } = useAuthContext()

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return '방금 전'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <span className={styles.author}>
            {isAuthenticated ? post.author?.nickname || '익명' : '익명'}
          </span>
          <span className={styles.date}>
            {formatDate(post.createdAt.toString())}
          </span>
        </div>
        <span className={styles.category}>
          {(post.category as any)?.name || post.category}
        </span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{truncateContent(post.content)}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.stats}>
          {isAuthenticated ? (
            <button
              className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
              onClick={e => {
                e.stopPropagation()
                onLikeClick()
              }}
            >
              {isLiked ? '❤️' : '🤍'} {currentLikeCount}
            </button>
          ) : (
            <button
              className={`${styles.likeButton} ${styles.disabled}`}
              disabled
              title="로그인 후 좋아요를 누를 수 있습니다"
            >
              🤍 {currentLikeCount}
            </button>
          )}
          <span className={styles.commentCount}>💬 {currentCommentCount}</span>
        </div>
      </div>
    </div>
  )
}
