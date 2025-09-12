import { useState, useEffect } from 'react'
import { commentsApi } from '@frontend/shared/api'
import { showToast } from '@frontend/shared/lib'
import { useAuthContext } from '@frontend/shared/contexts/AuthContext'
import {
  PostDTO as CommunityPost,
  Comment as PostComment,
} from '../../../../shared/types'
import styles from './PostDetailModal.module.css'

interface PostDetailModalProps {
  post: CommunityPost
  onClose: () => void
  onUpdate?: (
    postId: number,
    updateData: { title: string; content: string; category: string }
  ) => Promise<void>
  onDelete?: (postId: number) => Promise<void>
  onLikeClick?: (postId: number) => void
  isLiked?: boolean
  onCommentCountUpdate?: (postId: number, commentCount: number) => void
}

export function PostDetailModal({
  post,
  onClose,
  onUpdate,
  onDelete,
  onLikeClick,
  isLiked = false,
  onCommentCountUpdate,
}: PostDetailModalProps) {
  const { user, isAuthenticated } = useAuthContext()
  const currentLikeCount =
    (post as any).likeCount || (post as any).like_count || 0
  const [comments, setComments] = useState<PostComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    category:
      typeof post.category === 'string'
        ? post.category
        : post.category.name || 'tips',
  })
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)

  // 현재 사용자가 게시글 작성자인지 확인
  const isAuthor = user?.id === post.author.id

  // 댓글 목록 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true)
      try {
        console.log('댓글 요청 post.id:', post.id) // 디버깅용 로그
        const response = await commentsApi.list(post.id)
        console.log('댓글 API 응답:', response.data) // 디버깅용 로그

        // API 응답 구조 확인 및 안전한 매핑
        let commentData: PostComment[] = []

        if (response.data.success && response.data.data) {
          const rawComments = response.data.data
          console.log('원본 댓글 데이터:', rawComments) // 디버깅용 로그

          if (Array.isArray(rawComments)) {
            commentData = rawComments.map((comment: any) => ({
              id: comment.id || 0,
              postId: comment.postId || post.id,
              userId: comment.userId || comment.author_id || 0,
              author: {
                id: comment.userId || comment.author_id || 0,
                nickname:
                  comment.author?.nickname || comment.author_name || '익명',
              },
              content: comment.content || '',
              createdAt: new Date(
                comment.createdAt || comment.created_at || Date.now()
              ),
              updatedAt: new Date(
                comment.updatedAt || comment.updated_at || Date.now()
              ),
            }))
          }
        }

        console.log('매핑된 댓글 데이터:', commentData) // 디버깅용 로그
        setComments(commentData)
      } catch (error: unknown) {
        console.error('댓글 로드 실패:', error)
        showToast('댓글을 불러오는데 실패했습니다.', 'error')
        setComments([])
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchComments()
  }, [post.id])

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      showToast('댓글 내용을 입력해주세요.', 'error')
      return
    }

    console.log('댓글 작성 시작')
    console.log('게시글 ID:', post.id)
    console.log('댓글 내용:', newComment.trim())

    try {
      console.log('댓글 API 호출 시작')
      const createResponse = await commentsApi.create(post.id, {
        content: newComment.trim(),
      })
      console.log('댓글 API 응답:', createResponse)
      showToast('댓글이 작성되었습니다.', 'success')
      setNewComment('')

      // 댓글 목록 새로고침
      const listResponse = await commentsApi.list(post.id)
      console.log('댓글 작성 후 새로고침 응답:', listResponse.data) // 디버깅용 로그

      let commentData: PostComment[] = []

      if (listResponse.data.success && listResponse.data.data) {
        const rawComments = listResponse.data.data

        if (Array.isArray(rawComments)) {
          commentData = rawComments.map(comment => ({
            id: comment.id || 0,
            postId: comment.postId || post.id,
            userId: comment.userId || comment.author_id || 0,
            author: {
              id: comment.userId || comment.author_id || 0,
              nickname:
                comment.author?.nickname || comment.author_name || '익명',
            },
            content: comment.content || '',
            createdAt: new Date(
              comment.createdAt || comment.created_at || Date.now()
            ),
            updatedAt: new Date(
              comment.updatedAt || comment.updated_at || Date.now()
            ),
          })) as any
        }
      }

      setComments(commentData)

      // 댓글 개수 업데이트 알림
      console.log('📊 댓글 개수 업데이트:', commentData.length)
      onCommentCountUpdate?.(post.id, commentData.length)
    } catch (error: unknown) {
      console.error('댓글 작성 실패:', error)

      // Axios 에러인 경우 더 자세한 정보 표시
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any
        if (axiosError.response?.status === 401) {
          showToast('로그인이 필요합니다.', 'error')
        } else if (axiosError.response?.status === 400) {
          showToast(
            axiosError.response?.data?.message || '잘못된 요청입니다.',
            'error'
          )
        } else if (axiosError.response?.status === 500) {
          showToast(
            '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            'error'
          )
        } else {
          showToast('댓글 작성에 실패했습니다.', 'error')
        }
      } else {
        showToast('댓글 작성에 실패했습니다.', 'error')
      }
    }
  }

  // 게시글 수정
  const handleUpdatePost = async () => {
    if (!onUpdate) return

    if (!editData.title.trim()) {
      showToast('제목을 입력해주세요.', 'error')
      return
    }

    if (!editData.content.trim()) {
      showToast('내용을 입력해주세요.', 'error')
      return
    }

    setLoading(true)
    try {
      await onUpdate(post.id, editData)
      setIsEditing(false)
    } catch (error: unknown) {
      console.error('게시글 수정 실패:', error)
      // 에러 발생 시 수정 모드는 유지
    } finally {
      setLoading(false)
    }
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!onDelete) return

    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    setLoading(true)
    try {
      await onDelete(post.id)
      // 성공 시 모달은 부모 컴포넌트에서 닫힘
    } catch (error: unknown) {
      console.error('게시글 삭제 실패:', error)
      // 에러 발생 시 모달은 열린 상태로 유지
    } finally {
      setLoading(false)
    }
  }

  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? '게시글 수정' : post.title}
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
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.postInfo}>
                <div className={styles.authorInfo}>
                  <span className={styles.author}>
                    {isAuthenticated ? post.author?.nickname || '익명' : '익명'}
                  </span>
                  <span className={styles.date}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.category}>
                  {(post.category as any)?.name || post.category}
                </div>
              </div>

              <div className={styles.postContent}>
                <p>{post.content}</p>
              </div>

              <div className={styles.postActions}>
                {isAuthenticated ? (
                  <button
                    className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                    onClick={() => onLikeClick?.(post.id)}
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
                <button className={styles.commentButton}>
                  💬 {(post as any).commentCount || 0}
                </button>
                {/* 로그인한 사용자이고 자신의 게시물에만 수정/삭제 버튼 표시 */}
                {isAuthenticated && isAuthor && onUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                  >
                    수정
                  </button>
                )}
                {isAuthenticated && isAuthor && onDelete && (
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

            {isAuthenticated ? (
              <div className={styles.commentForm}>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className={styles.commentInput}
                  rows={3}
                />
                <div className={styles.commentSubmitWrapper}>
                  <button
                    onClick={handleSubmitComment}
                    className={styles.commentSubmitButton}
                    disabled={!newComment.trim()}
                  >
                    댓글 작성
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.commentForm}>
                <textarea
                  placeholder="로그인 후 댓글을 작성할 수 있습니다..."
                  className={styles.commentInput}
                  rows={3}
                  disabled
                />
                <div className={styles.commentSubmitWrapper}>
                  <button className={styles.commentSubmitButton} disabled>
                    로그인 필요
                  </button>
                </div>
              </div>
            )}

            <div className={styles.commentsList}>
              {commentsLoading ? (
                <div className={styles.commentsLoading}>
                  <div className={styles.commentsSpinner}></div>
                  <p>댓글을 불러오는 중...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className={styles.emptyComments}>
                  <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>
                        {isAuthenticated
                          ? comment.author?.nickname || '익명'
                          : '익명'}
                      </span>
                      <span className={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
