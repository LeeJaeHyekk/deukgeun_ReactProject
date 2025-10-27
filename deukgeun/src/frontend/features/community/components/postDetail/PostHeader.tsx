import React from 'react'
import { PostDTO as CommunityPost } from '../../../../../shared/types'
import { getAuthorName, getCategoryName } from '../../utils/textUtils'
import { formatDate } from '../../utils/dateUtils'
import styles from './PostHeader.module.css'

interface PostHeaderProps {
  post: CommunityPost
  isEditing: boolean
  onClose: () => void
}

export function PostHeader({ post, isEditing, onClose }: PostHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>
        {isEditing ? '게시글 수정' : post.title}
      </h2>
      <button className={styles.closeButton} onClick={onClose}>
        ✕
      </button>
    </div>
  )
}

export function PostInfo({ post }: { post: CommunityPost }) {
  return (
    <div className={styles.postInfo}>
      <div className={styles.authorInfo}>
        <span className={styles.author}>
          {getAuthorName(post.author)}
        </span>
        <span className={styles.date}>
          {formatDate(post.createdAt.toString())}
        </span>
      </div>
      <div className={styles.category}>
        {getCategoryName(post.category)}
      </div>
    </div>
  )
}
