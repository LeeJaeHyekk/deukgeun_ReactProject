import { useState, useEffect, useMemo } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'
import { showToast } from '@frontend/shared/lib'
import { PostDTO as CommunityPost } from '../../../../../shared/types'
import { makeSelectDisplayCommentCountWithFallback } from '../../comments/commentsSelectors'
import { RootState } from '@frontend/shared/store'
import { PostHeader, PostInfo } from './PostHeader'
import { PostActions } from './PostActions'
import { PostEditForm } from './PostEditForm'
import { CommentsSection } from './CommentsSection'
import styles from './PostDetailModal.module.css'

interface PostDetailModalProps {
  post: CommunityPost
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
  const { user } = useAuthRedux()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    category: post.category || 'tips'
  })
  const [loading, setLoading] = useState(false)
  
  // Selector factory를 사용하여 독립 캐시 생성
  const selectDisplayCommentCount = useMemo(() => 
    makeSelectDisplayCommentCountWithFallback(), []
  )
  
  // 통합 댓글 수 가져오기 (서버 수 + 낙관적 델타, 실시간 상태 참조)
  const displayCommentCount = useSelector(
    (state: RootState) => selectDisplayCommentCount(state, post.id),
    shallowEqual
  )
  
  console.log('🔍 [PostDetailModal] 댓글 수 최종 계산:', {
    postId: post.id,
    displayCommentCount,
    originalCommentCount: post.commentCount,
    timestamp: new Date().toISOString()
  })
  
  // 댓글 수 변화 추적
  useEffect(() => {
    console.log('🔍 [PostDetailModal] 댓글 수 변화 감지:', {
      postId: post.id,
      displayCommentCount,
      timestamp: new Date().toISOString()
    })
  }, [displayCommentCount, post.id])

  // 댓글 수 변경 핸들러 (Redux에서 자동 관리되므로 제거)
  // const handleCommentCountChange = (count: number) => {
  //   console.log('댓글 수 변경:', count)
  //   // Redux 상태는 useComments에서 자동으로 업데이트됨
  // }

  // 현재 사용자가 게시글 작성자인지 확인
  const isAuthor = user?.id === post.author.id

  // 댓글 섹션으로 스크롤 이동
  const scrollToComments = () => {
    const commentsSection = document.querySelector('[data-comments-section]')
    if (commentsSection) {
      commentsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }

  // 게시글 수정 (타입 가드 및 예외 처리 강화)
  const handleUpdatePost = async () => {
    if (!onUpdate) {
      console.warn('PostDetailModal: onUpdate 핸들러가 없습니다.')
      return
    }

    // post 객체 검증
    if (!post || !post.id) {
      showToast('게시글 정보가 유효하지 않습니다.', 'error')
      return
    }

    // 입력 데이터 검증
    const { isValidString } = await import('../../utils/typeGuards')
    
    if (!isValidString(editData.title)) {
      showToast('제목을 입력해주세요.', 'error')
      return
    }

    if (!isValidString(editData.content)) {
      showToast('내용을 입력해주세요.', 'error')
      return
    }

    setLoading(true)
    try {
      await onUpdate(post.id, editData)
      setIsEditing(false)
      showToast('게시글이 성공적으로 수정되었습니다.', 'success')
    } catch (error: unknown) {
      const { getUserFriendlyMessage } = await import('../../utils/errorHandlers')
      console.error('게시글 수정 실패:', error)
      showToast(getUserFriendlyMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }

  // 게시글 삭제 (타입 가드 및 예외 처리 강화)
  const handleDeletePost = async () => {
    if (!onDelete) {
      console.warn('PostDetailModal: onDelete 핸들러가 없습니다.')
      return
    }

    // post 객체 검증
    if (!post || !post.id) {
      showToast('게시글 정보가 유효하지 않습니다.', 'error')
      return
    }

    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    setLoading(true)
    try {
      await onDelete(post.id)
      showToast('게시글이 성공적으로 삭제되었습니다.', 'success')
    } catch (error: unknown) {
      const { getUserFriendlyMessage } = await import('../../utils/errorHandlers')
      console.error('게시글 삭제 실패:', error)
      showToast(getUserFriendlyMessage(error), 'error')
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

  // 모달이 열릴 때 배경 스크롤 방지
  useEffect(() => {
    // 현재 스크롤 위치 저장
    const scrollY = window.scrollY
    
    // body 스크롤 방지
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    
    // 모달이 닫힐 때 스크롤 복원
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <PostHeader 
          post={post} 
          isEditing={isEditing} 
          onClose={onClose} 
        />

        <div className={styles.body}>
          {isEditing ? (
            <PostEditForm
              editData={editData}
              onEditDataChange={setEditData}
              onSave={handleUpdatePost}
              onCancel={() => setIsEditing(false)}
              loading={loading}
            />
          ) : (
            <>
              <PostInfo post={post} />

              <div className={styles.postContent}>
                <p>{post.content}</p>
              </div>

              <PostActions
                post={post}
                displayCommentCount={displayCommentCount}
                isAuthor={isAuthor}
                onEdit={() => setIsEditing(true)}
                onDelete={handleDeletePost}
                onComment={scrollToComments}
              />
            </>
          )}

          <CommentsSection 
            postId={post.id} 
          />
        </div>
      </div>
    </div>
  )
}
