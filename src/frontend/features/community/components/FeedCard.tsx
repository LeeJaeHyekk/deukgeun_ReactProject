import React from "react"
import styles from "./FeedCard.module.css"

export interface FeedPost {
  id: number
  title: string
  content: string
  author: string
  authorAvatar: string
  createdAt: string
  likes: number
  comments: number
  category: string
  tags: string[]
}

interface FeedCardProps {
  post: FeedPost
  onClick?: (post: FeedPost) => void
  onLike?: (postId: number) => void
}

export function FeedCard({ post, onClick, onLike }: FeedCardProps) {
  return (
    <article className={styles.postCard} onClick={() => onClick?.(post)}>
      <div className={styles.postHeader}>
        <div className={styles.authorInfo}>
          <img
            src={post.authorAvatar}
            alt={post.author}
            className={styles.authorAvatar}
          />
          <div>
            <span className={styles.authorName}>{post.author}</span>
            <span className={styles.postDate}>{post.createdAt}</span>
          </div>
        </div>
        <span className={styles.category}>{post.category}</span>
      </div>

      <div className={styles.postContent}>
        <h3 className={styles.postTitle}>{post.title}</h3>
        <p className={styles.postExcerpt}>
          {post.content.length > 100
            ? `${post.content.substring(0, 100)}...`
            : post.content}
        </p>
      </div>

      {post.tags?.length ? (
        <div className={styles.postTags}>
          {post.tags.map(tag => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.postActions} onClick={e => e.stopPropagation()}>
        <button className={styles.actionBtn} onClick={() => onLike?.(post.id)}>
          ❤️ {post.likes}
        </button>
        <button className={styles.actionBtn}>💬 {post.comments}</button>
        <button className={styles.actionBtn}>📤 공유</button>
      </div>
    </article>
  )
}
