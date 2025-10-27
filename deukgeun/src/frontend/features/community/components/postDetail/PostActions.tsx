import React from 'react'
import { usePostLikes } from '../../hooks/usePostLikes'
import { PostDTO as CommunityPost } from '../../../../../shared/types'
import styles from './PostActions.module.css'

interface PostActionsProps {
  post: CommunityPost
  displayCommentCount: number
  isAuthor: boolean
  onEdit?: () => void
  onDelete?: () => void
  onComment?: () => void
}

export function PostActions({ 
  post, 
  displayCommentCount,
  isAuthor, 
  onEdit, 
  onDelete, 
  onComment 
}: PostActionsProps) {
  const { isLiked, syncing, isLoggedIn, handleToggleLike } = usePostLikes(post.id)
  
  // 댓글 수 실시간 업데이트를 위한 로깅
  console.log('PostActions 렌더링:', { 
    postId: post.id, 
    originalCommentCount: post.commentCount,
    displayCommentCount,
    likeCount: post.likeCount 
  })

  return (
    <div className={styles.postActions}>
      <button 
        className={`${styles.likeButton} ${isLiked ? styles.liked : ""} ${!isLoggedIn || syncing ? styles.disabled : ""}`}
        disabled={!isLoggedIn || syncing}
        onClick={() => {
          console.log('좋아요 버튼 클릭:', post.id, { isLiked, syncing, isLoggedIn })
          if (!syncing && isLoggedIn) {
            handleToggleLike()
          } else if (!isLoggedIn) {
            // 비로그인 시 로그인 유도 메시지
            console.log('로그인이 필요합니다')
          }
        }}
        title={!isLoggedIn ? "로그인이 필요합니다" : ""}
      >
        {isLiked ? "❤️" : "🤍"} {post.likeCount || 0}
        {syncing && " ⏳"}
      </button>
      
      <button 
        className={`${styles.commentButton} ${!isLoggedIn ? styles.disabled : ""}`}
        disabled={!isLoggedIn}
        onClick={() => {
          console.log('댓글 버튼 클릭:', post.id, { isLoggedIn })
          if (isLoggedIn) {
            onComment?.()
          } else {
            console.log('로그인이 필요합니다')
          }
        }}
        title={!isLoggedIn ? "로그인이 필요합니다" : ""}
      >
        💬 {displayCommentCount}
      </button>
      
      {isLoggedIn && isAuthor && onEdit && (
        <button
          onClick={onEdit}
          className={styles.editButton}
        >
          수정
        </button>
      )}
      
      {isLoggedIn && isAuthor && onDelete && (
        <button
          onClick={onDelete}
          className={styles.deleteButton}
        >
          삭제
        </button>
      )}
    </div>
  )
}
