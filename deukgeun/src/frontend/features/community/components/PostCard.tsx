import React, { memo, useEffect, useMemo, useCallback } from "react"
import { PostDTO as CommunityPost } from "../../../../shared/types"
import { usePostLikes } from "../hooks/usePostLikes"
import { getAuthorName, getCategoryName, truncateText } from "../utils/textUtils"
import { formatRelativeTime } from "../utils/dateUtils"
import styles from "./postCard.module.css"

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
  
  // 좋아요 버튼 클릭 핸들러 메모이제이션
  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    console.log("💳 [PostCard] 좋아요 버튼 클릭 이벤트:", { 
      isLoggedIn, 
      syncing, 
      disabled: !isLoggedIn || syncing 
    })
    e.stopPropagation()
    handleToggleLike()
  }, [isLoggedIn, syncing, handleToggleLike])
  
  // 디버깅용 로그 (개발 환경에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [PostCard] 댓글 수 변화 감지:', {
        postId: post.id,
        displayCommentCount,
        timestamp: new Date().toISOString()
      })
    }
  }, [displayCommentCount, post.id])
  
  // 개발 환경에서만 렌더링 로그 출력
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("💳 [PostCard] 렌더링됨:", { 
        postId: post.id, 
        title: post.title, 
        likeCount: post.likeCount,
        originalCommentCount: post.commentCount,
        displayCommentCount,
        isLiked,
        syncing,
        isLoggedIn,
        timestamp: new Date().toISOString()
      })
    }
  }, [post.id, post.title, post.likeCount, post.commentCount, displayCommentCount, isLiked, syncing, isLoggedIn])

  // displayCommentCount 변화 추적 (디버깅용)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [PostCard] displayCommentCount 변화:', {
        postId: post.id,
        displayCommentCount,
        originalCommentCount: post.commentCount,
        difference: displayCommentCount - (post.commentCount || 0),
        timestamp: new Date().toISOString()
      })
    }
  }, [displayCommentCount, post.id, post.commentCount])

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
