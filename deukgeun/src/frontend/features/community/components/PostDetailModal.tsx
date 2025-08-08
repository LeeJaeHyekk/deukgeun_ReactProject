import React, { useEffect, useMemo, useState } from "react";
import styles from "./PostDetailModal.module.css";
import type { FeedPost } from "./FeedCard";
import { commentsApi } from "@shared/api";
import { showToast } from "@shared/lib";
import { useAuth } from "@shared/hooks/useAuth";

interface PostDetailModalProps {
  post: FeedPost;
  onClose: () => void;
}

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const { isLoggedIn } = useAuth();
  const [comments, setComments] = useState<
    Array<{ id: number; author: string; content: string; createdAt: string }>
  >([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchComments() {
    try {
      const res = await commentsApi.list(post.id, { page, limit });
      setComments(res.data);
      setTotal(res.total);
    } catch (e) {
      // handled globally
    }
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, page, limit]);

  async function handleCreate() {
    if (!isLoggedIn) {
      showToast("로그인이 필요합니다", "error");
      return;
    }
    if (!content.trim()) {
      showToast("댓글 내용을 입력하세요", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      await commentsApi.create(post.id, { content: content.trim() });
      setContent("");
      await fetchComments();
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleCreate();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
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
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>{post.title}</h2>
          <p className={styles.content}>{post.content}</p>
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>

          <div className={styles.commentsSection}>
            <h3 className={styles.commentsTitle}>댓글 {total}</h3>
            <div className={styles.commentList}>
              {comments.map((c) => (
                <div key={c.id} className={styles.commentItem}>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentAuthor}>{c.author}</span>
                    <span className={styles.commentDate}>
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={styles.commentContent}>{c.content}</p>
                </div>
              ))}
              {comments.length === 0 ? (
                <div className={styles.emptyComments}>
                  첫 댓글을 작성해보세요!
                </div>
              ) : null}
            </div>

            <div className={styles.commentForm}>
              {!isLoggedIn ? (
                <div className={styles.loginRequired}>
                  댓글을 작성하려면 로그인이 필요합니다
                </div>
              ) : (
                <>
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={styles.commentInput}
                    placeholder="댓글을 입력하세요"
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className={styles.commentSubmit}
                    onClick={handleCreate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "등록 중..." : "등록"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
