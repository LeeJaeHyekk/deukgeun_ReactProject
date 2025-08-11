import { useState, useEffect } from "react"
import { commentsApi } from "@shared/api"
import { showToast } from "@shared/lib"
import styles from "./PostDetailModal.module.css"

interface Comment {
  id: number
  author: string
  content: string
  createdAt: string
}

interface Post {
  id: number
  title: string
  content: string
  author: {
    id: number
    nickname: string
  }
  category: string
  likes: number
  comments: number
  createdAt: string
  updatedAt: string
}

interface PostDetailModalProps {
  post: Post
  onClose: () => void
  onUpdate?: (
    postId: number,
    updateData: { title: string; content: string; category: string }
  ) => Promise<void>
  onDelete?: (postId: number) => Promise<void>
}

export function PostDetailModal({
  post,
  onClose,
  onUpdate,
  onDelete,
}: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    category: post.category,
  })
  const [loading, setLoading] = useState(false)

  // 댓글 목록 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await commentsApi.list(post.id)
        const commentData = response.data.data as Comment[]
        setComments(commentData || [])
      } catch (error: unknown) {
        console.error("댓글 로드 실패:", error)
        // 댓글 로드 실패 시에도 모달은 계속 표시
        setComments([])
      }
    }

    fetchComments()
  }, [post.id])

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      showToast("댓글 내용을 입력해주세요.", "error")
      return
    }

    try {
      await commentsApi.create(post.id, { content: newComment.trim() })
      showToast("댓글이 작성되었습니다.", "success")
      setNewComment("")

      // 댓글 목록 새로고침
      const response = await commentsApi.list(post.id)
      const commentData = response.data.data as Comment[]
      setComments(commentData || [])
    } catch (error: unknown) {
      console.error("댓글 작성 실패:", error)
      showToast("댓글 작성에 실패했습니다.", "error")
    }
  }

  // 게시글 수정
  const handleUpdatePost = async () => {
    if (!onUpdate) return

    if (!editData.title.trim()) {
      showToast("제목을 입력해주세요.", "error")
      return
    }

    if (!editData.content.trim()) {
      showToast("내용을 입력해주세요.", "error")
      return
    }

    setLoading(true)
    try {
      await onUpdate(post.id, editData)
      setIsEditing(false)
    } catch (error: unknown) {
      console.error("게시글 수정 실패:", error)
      // 에러 발생 시 수정 모드는 유지
    } finally {
      setLoading(false)
    }
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!onDelete) return

    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return
    }

    setLoading(true)
    try {
      await onDelete(post.id)
      // 성공 시 모달은 부모 컴포넌트에서 닫힘
    } catch (error: unknown) {
      console.error("게시글 삭제 실패:", error)
      // 에러 발생 시 모달은 열린 상태로 유지
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? "게시글 수정" : post.title}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {isEditing ? (
            <div className={styles.editForm}>
              <input
                type="text"
                value={editData.title}
                onChange={e =>
                  setEditData({ ...editData, title: e.target.value })
                }
                className={styles.titleInput}
                placeholder="제목을 입력하세요"
              />
              <textarea
                value={editData.content}
                onChange={e =>
                  setEditData({ ...editData, content: e.target.value })
                }
                className={styles.contentInput}
                placeholder="내용을 입력하세요"
                rows={8}
              />
              <div className={styles.editActions}>
                <button
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  onClick={handleUpdatePost}
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.postInfo}>
                <div className={styles.authorInfo}>
                  <span className={styles.author}>{post.author.nickname}</span>
                  <span className={styles.date}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.category}>{post.category}</div>
              </div>

              <div className={styles.postContent}>
                <p>{post.content}</p>
              </div>

              <div className={styles.postActions}>
                <button className={styles.likeButton}>❤️ {post.likes}</button>
                <button className={styles.commentButton}>
                  💬 {post.comments}
                </button>
                {onUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                  >
                    수정
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDeletePost}
                    className={styles.deleteButton}
                    disabled={loading}
                  >
                    삭제
                  </button>
                )}
              </div>
            </>
          )}

          {/* 댓글 섹션 */}
          <div className={styles.commentsSection}>
            <h3>댓글 ({comments.length})</h3>

            <div className={styles.commentForm}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className={styles.commentInput}
                rows={3}
              />
              <button
                onClick={handleSubmitComment}
                className={styles.commentSubmitButton}
                disabled={!newComment.trim()}
              >
                댓글 작성
              </button>
            </div>

            <div className={styles.commentsList}>
              {comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>
                      {comment.author}
                    </span>
                    <span className={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
