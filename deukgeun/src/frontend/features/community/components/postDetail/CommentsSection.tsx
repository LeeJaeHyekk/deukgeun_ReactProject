import React, { useEffect, useState, useCallback } from 'react'
import { useComments } from '../../hooks/useComments'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'
import { getAuthorName } from '../../utils/textUtils'
import { formatDate } from '../../utils/dateUtils'
import styles from './CommentsSection.module.css'

interface CommentsSectionProps {
  postId: number
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { isLoggedIn, user } = useAuthRedux()
  const {
    comments,
    allComments,
    newComment,
    setNewComment,
    commentsLoading,
    handleSubmitComment,
    handleEditComment,
    handleDeleteComment
  } = useComments(postId)
  
  // 수정 중인 댓글 상태 관리
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  // 댓글 개수 변경 시 부모 컴포넌트에 알림 (Redux에서 자동 관리되므로 제거)
  // useEffect(() => {
  //   if (onCommentCountChange) {
  //     console.log('댓글 수 변경 알림:', comments.length)
  //     onCommentCountChange(comments.length)
  //   }
  // }, [comments.length, onCommentCountChange])

  // 댓글 추가/수정/삭제 후 즉시 댓글 수 업데이트 (Redux에서 자동 관리되므로 제거)
  const handleCommentAction = useCallback(async (action: () => Promise<void>) => {
    try {
      await action()
      // Redux에서 자동으로 댓글 수가 업데이트됨
    } catch (error) {
      console.error('댓글 액션 실패:', error)
    }
  }, [])

  // 댓글 수정 시작
  const startEditComment = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId)
    setEditContent(currentContent)
  }

  // 댓글 수정 취소
  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  // 댓글 수정 완료
  const saveEditComment = async () => {
    if (editingCommentId && editContent.trim()) {
      console.log('💬 [CommentsSection] 댓글 수정 시작:', {
        editingCommentId,
        editContent: editContent.trim(),
        availableComments: comments.map(c => ({ id: c.id, content: c.content }))
      })
      
      await handleCommentAction(async () => {
        await handleEditComment(editingCommentId, editContent.trim())
        setEditingCommentId(null)
        setEditContent('')
      })
    }
  }

  // 댓글 삭제 확인
  const confirmDeleteComment = async (commentId: number) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      await handleCommentAction(async () => {
        await handleDeleteComment(commentId)
      })
    }
  }

  return (
    <div className={styles.commentsSection} data-comments-section>
      <h3>댓글 ({comments.length})</h3>

      {isLoggedIn ? (
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
              onClick={() => handleCommentAction(async () => {
                await handleSubmitComment()
              })}
              className={styles.commentSubmitButton}
              disabled={!newComment.trim()}
            >
              댓글 작성
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.loginPrompt}>
          <div className={styles.loginPromptContent}>
            <h4>💬 댓글을 작성하려면 로그인이 필요합니다</h4>
            <p>로그인 후 댓글을 작성하고 다른 사용자들과 소통해보세요!</p>
            <button 
              className={styles.loginButton}
              onClick={() => {
                // 로그인 페이지로 이동하거나 로그인 모달 열기
                window.location.href = '/login'
              }}
            >
              로그인하기
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
        ) : allComments.length === 0 ? (
          <div className={styles.emptyComments}>
            <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
          </div>
        ) : (
                allComments.map(comment => {
                  const isCommentAuthor = user?.id === comment.userId
                  const isEditing = editingCommentId === comment.id
                  const isOptimistic = comment.id < 0 // 임시 댓글 ID는 음수
                  
                  return (
                    <div 
                      key={comment.id} 
                      className={`${styles.comment} ${isOptimistic ? styles.optimisticComment : ''}`}
                    >
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>
                          {getAuthorName(comment.author)}
                        </span>
                        <div className={styles.commentMeta}>
                          <span className={styles.commentDate}>
                            {formatDate(comment.createdAt.toString())}
                          </span>
                          {isCommentAuthor && isLoggedIn && !isEditing && (
                            <div className={styles.commentActions}>
                              <button 
                                className={styles.editCommentButton}
                                onClick={() => startEditComment(comment.id, comment.content)}
                              >
                                수정
                              </button>
                              <button 
                                className={styles.deleteCommentButton}
                                onClick={() => confirmDeleteComment(comment.id)}
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className={styles.commentEditForm}>
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className={styles.commentInput}
                            rows={3}
                            placeholder="댓글을 수정하세요..."
                          />
                          <div className={styles.commentEditActions}>
                            <button
                              className={styles.commentSaveButton}
                              onClick={saveEditComment}
                              disabled={!editContent.trim()}
                            >
                              저장
                            </button>
                            <button
                              className={styles.commentCancelButton}
                              onClick={cancelEditComment}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={styles.commentContent}>{comment.content}</p>
                      )}
                    </div>
                  )
                })
        )}
      </div>
    </div>
  )
}
