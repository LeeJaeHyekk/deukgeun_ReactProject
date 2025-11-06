import React, { memo, useEffect, useMemo, useCallback, useRef } from "react"
import { PostDTO as CommunityPost } from "../../../../shared/types"
import { usePostLikes } from "../hooks/usePostLikes"
import { getAuthorName, getCategoryName, truncateText } from "../utils/textUtils"
import { formatRelativeTime } from "../utils/dateUtils"
import styles from "./PostCard.module.css"

interface PostCardProps {
  post: CommunityPost
  displayCommentCount: number
  onPostClick: (post: CommunityPost) => void
}

// PostCard 최적화를 위한 메모이제이션된 컴포넌트
const PostCardInner: React.FC<PostCardProps> = ({ post, displayCommentCount, onPostClick }) => {
  const { isLiked, syncing, isLoggedIn, handleToggleLike } = usePostLikes(post.id)
  
  // 메모이제이션된 값들
  const authorName = useMemo(() => getAuthorName(post.author), [post.author])
  const categoryName = useMemo(() => getCategoryName(post.category), [post.category])
  const truncatedContent = useMemo(() => truncateText(post.content), [post.content])
  const formattedDate = useMemo(() => formatRelativeTime(post.createdAt.toString()), [post.createdAt])
  
  // 이전 상태 추적을 위한 ref (렌더링 최적화)
  const prevDisplayCommentCountRef = useRef(displayCommentCount)
  const prevIsLikedRef = useRef(isLiked)
  const prevLikeCountRef = useRef(post.likeCount)
  
  // 좋아요 버튼 클릭 핸들러 메모이제이션 (안정적인 참조)
  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handleToggleLike()
  }, [handleToggleLike])
  
  // 상태 변경 감지 (렌더링 최적화)
  useEffect(() => {
    const prevDisplayCommentCount = prevDisplayCommentCountRef.current
    const prevIsLiked = prevIsLikedRef.current
    const prevLikeCount = prevLikeCountRef.current
    
    const commentCountChanged = prevDisplayCommentCount !== displayCommentCount
    const isLikedChanged = prevIsLiked !== isLiked
    const likeCountChanged = prevLikeCount !== post.likeCount
    
    if (commentCountChanged || isLikedChanged || likeCountChanged) {
      // 상태 업데이트
      prevDisplayCommentCountRef.current = displayCommentCount
      prevIsLikedRef.current = isLiked
      prevLikeCountRef.current = post.likeCount
      
      if (process.env.NODE_ENV === 'development' && (commentCountChanged || isLikedChanged || likeCountChanged)) {
        console.log("💳 [PostCard] 상태 변경:", { 
          postId: post.id, 
          title: post.title,
          displayCommentCount,
          isLiked,
          likeCount: post.likeCount,
          commentCountChanged,
          isLikedChanged,
          likeCountChanged
        })
      }
    }
  }, [post.id, post.title, post.likeCount, displayCommentCount, isLiked])

  return (
    <div className={styles.card} onClick={() => onPostClick(post)}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <span className={styles.author}>
            {authorName}
          </span>
          <span className={styles.date}>
            {formattedDate}
          </span>
        </div>
        <span className={styles.category}>
          {categoryName}
        </span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{truncatedContent}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.stats}>
          <button
            className={`${styles.likeButton} ${isLiked ? styles.liked : ""} ${!isLoggedIn || syncing ? styles.disabled : ""}`}
            disabled={!isLoggedIn || syncing}
            onClick={handleLikeClick}
          >
            {isLiked ? "❤️" : "🤍"} {post.likeCount ?? 0}
            {syncing && " ⏳"}
          </button>
          <span className={styles.commentCount}>
            💬 {displayCommentCount ?? 0}
          </span>
        </div>
      </div>
    </div>
  )
}

// React.memo로 최적화 (props가 변경될 때만 재렌더링)
// displayCommentCount를 props로 받아서 primitive 값으로 비교
export const PostCard = memo(PostCardInner, (prevProps, nextProps) => {
  // 기본적인 props 비교
  const isPostEqual = (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.title === nextProps.post.title &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.likeCount === nextProps.post.likeCount &&
    prevProps.post.commentCount === nextProps.post.commentCount &&
    prevProps.post.author.id === nextProps.post.author.id &&
    prevProps.post.author.nickname === nextProps.post.author.nickname &&
    prevProps.post.category === nextProps.post.category &&
    prevProps.post.createdAt === nextProps.post.createdAt
  )
  
  // displayCommentCount 비교 (핵심!)
  const isDisplayCommentCountEqual = prevProps.displayCommentCount === nextProps.displayCommentCount
  
  const isOnPostClickEqual = prevProps.onPostClick === nextProps.onPostClick
  
  const shouldNotRerender = isPostEqual && isDisplayCommentCountEqual && isOnPostClickEqual
  
  // 디버깅용 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development' && !shouldNotRerender) {
    console.log('🔄 [PostCard] 재렌더링 필요:', {
      postId: prevProps.post.id,
      prevDisplayCommentCount: prevProps.displayCommentCount,
      nextDisplayCommentCount: nextProps.displayCommentCount,
      prevCommentCount: prevProps.post.commentCount,
      nextCommentCount: nextProps.post.commentCount,
      isPostEqual,
      isDisplayCommentCountEqual,
      isOnPostClickEqual
    })
  }
  
  return shouldNotRerender
})

PostCard.displayName = "PostCard"
