import React, { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@frontend/shared/store'
import { toggleLikeOptimistic } from '../likes/likesSlice'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'
import { PostDTO as CommunityPost } from '../../../../shared/types'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: CommunityPost
  onClick: () => void
}

const PostCardInner: React.FC<PostCardProps> = ({ post, onClick }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoggedIn } = useAuthRedux()
  
  // 좋아요 상태는 Redux에서 가져오기 (전역 상태)
  const isLiked = useSelector((state: any) => state.likes.likedIds.includes(post.id))
  const syncing = useSelector((state: any) => state.likes.syncing[post.id])
  
  console.log('💳 [PostCard] 렌더링됨:', { 
    postId: post.id, 
    title: post.title, 
    likeCount: post.likeCount,
    isLiked,
    syncing,
    isLoggedIn,
    fullPost: post // 전체 post 객체 확인
  })
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

  const onToggleLike = useCallback(() => {
    if (syncing || !isLoggedIn) {
      console.log('💳 [PostCard] 좋아요 비활성화:', { syncing, isLoggedIn })
      return
    }
    console.log('💳 [PostCard] 좋아요 버튼 클릭됨:', { 
      postId: post.id, 
      isLiked, 
      likeCount: post.likeCount 
    })
    dispatch(toggleLikeOptimistic(post.id))
  }, [dispatch, post.id, syncing, isLoggedIn, isLiked, post.likeCount])

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <span className={styles.author}>
            {typeof post.author === 'string' ? post.author : (post.author as any)?.nickname || "익명"}
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
          <button
            className={`${styles.likeButton} ${isLiked ? styles.liked : ""} ${!isLoggedIn || syncing ? styles.disabled : ""}`}
            disabled={!isLoggedIn || syncing}
            onClick={e => {
              e.stopPropagation()
              onToggleLike()
            }}
          >
            {isLiked ? "❤️" : "🤍"} {post.likeCount ?? 0}
            {syncing && " ⏳"}
          </button>
          <span className={styles.commentCount}>
            💬 {post.commentCount ?? 0}
          </span>
        </div>
      </div>
    </div>
  )
}

export const PostCard = memo(PostCardInner)

PostCard.displayName = "PostCard"
