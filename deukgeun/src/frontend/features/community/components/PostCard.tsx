import { Post as CommunityPost } from "../../../../shared/types"
import styles from "./PostCard.module.css"

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
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "방금 전"
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
          <span className={styles.author}>{post.author.nickname}</span>
          <span className={styles.date}>{formatDate(post.createdAt)}</span>
        </div>
        <span className={styles.category}>{post.category}</span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{truncateContent(post.content)}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.stats}>
          <button
            className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
            onClick={e => {
              e.stopPropagation()
              onLikeClick()
            }}
          >
            {isLiked ? "❤️" : "🤍"} {post.like_count || post.likes || 0}
          </button>
          <span className={styles.commentCount}>
            💬 {post.comment_count || post.comments || 0}
          </span>
        </div>
      </div>
    </div>
  )
}
