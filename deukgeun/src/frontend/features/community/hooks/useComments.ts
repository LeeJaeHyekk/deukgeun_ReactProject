import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { commentsApi } from '@frontend/shared/api'
import { showToast } from '@frontend/shared/lib'
import { Comment as PostComment } from '../comments/commentsSlice'
import { setCommentsForPost, addCommentConfirmed, addCommentOptimistic, removeOptimisticComment, updateComment, removeComment, setLoading, addCommentThunk, updateCommentThunk, deleteCommentThunk } from '../comments/commentsSlice'
import { setCommentCount } from '../posts/postsSlice'
import { AppDispatch, RootState } from '@frontend/shared/store'
import { safeLoadComments } from '../utils/commentMappers'
import { logError, getUserFriendlyMessage } from '../utils/errorHandlers'
import { isValidPostId, isValidString, isValidNumber } from '../utils/typeGuards'
import { PostId } from '../types'

/**
 * 댓글 관리를 위한 커스텀 훅
 */
export function useComments(postId: PostId) {
  const dispatch = useDispatch<AppDispatch>()
  const [comments, setComments] = useState<PostComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)

  // 사용자 정보를 훅 최상위에서 가져오기
  const user = useSelector((state: RootState) => state.auth.user)
  
  // Redux에서 낙관적 댓글 가져오기
  const optimisticComments = useSelector((state: RootState) => 
    state.comments.optimisticTemp[Number(postId)] || []
  )
  
  // 실제 댓글과 낙관적 댓글을 합쳐서 표시
  const allComments = [...comments, ...optimisticComments].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // 포스트 ID 유효성 검사
  if (!isValidPostId(postId)) {
    logError('useComments', new Error('유효하지 않은 포스트 ID'), { postId })
    return {
      comments: [],
      allComments: [],
      newComment: '',
      loading: false,
      commentsLoading: false,
      fetchComments: () => Promise.resolve(),
      addComment: () => Promise.resolve(),
      updateComment: () => Promise.resolve(),
      deleteComment: () => Promise.resolve(),
      setNewComment: () => {},
    }
  }

  // 댓글 목록 가져오기
  const fetchComments = useCallback(async () => {
    setCommentsLoading(true)
    
    try {
      console.log('댓글 요청 post.id:', postId)
      const response = await commentsApi.list(postId)
      console.log('댓글 API 응답:', response.data)

      const commentData = safeLoadComments(response.data, postId)
      console.log('매핑된 댓글 데이터:', commentData)
      
      setComments(commentData)
      
      // Redux 상태 업데이트
      dispatch(setCommentsForPost({ postId, comments: commentData }))
      dispatch(setCommentCount({ postId, count: commentData.length }))
      console.log('🔥 [useComments] Redux 상태 업데이트 완료:', { 
        postId, 
        count: commentData.length,
        timestamp: new Date().toISOString()
      })
    } catch (error: unknown) {
      logError('useComments.fetchComments', error, { postId })
      showToast(getUserFriendlyMessage(error), 'error')
    } finally {
      setCommentsLoading(false)
    }
  }, [postId])

  // 댓글 작성 (API 성공 후 상태 업데이트)
  const handleSubmitComment = useCallback(async () => {
    if (!isValidString(newComment)) {
      showToast('댓글 내용을 입력해주세요.', 'error')
      return
    }

    // postId 타입 변환
    const validPostId = Number(postId)
    if (!isValidNumber(validPostId) || validPostId <= 0) {
      showToast('유효하지 않은 게시글입니다.', 'error')
      return
    }

    const commentText = newComment.trim()
    console.log('댓글 작성 시작')
    console.log('게시글 ID:', validPostId)
    console.log('댓글 내용:', commentText)

    try {
      // 새로운 thunk 사용 (API 성공 후 상태 업데이트)
      await dispatch(addCommentThunk(validPostId, commentText))
      showToast('댓글이 작성되었습니다.', 'success')
      setNewComment('')
      
      // 댓글 목록 새로고침 (Redux 상태는 thunk에서 자동 업데이트됨)
      await fetchComments()
    } catch (error: unknown) {
      logError('useComments.handleSubmitComment', error, { postId: validPostId, content: commentText })
      showToast(getUserFriendlyMessage(error), 'error')
    }
  }, [postId, newComment, dispatch, fetchComments])

  // 초기 댓글 로드
  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // 댓글 수정
  const handleEditComment = useCallback(async (commentId: number, newContent: string) => {
    if (!isValidString(newContent)) {
      showToast('댓글 내용을 입력해주세요.', 'error')
      return
    }

    // 댓글 ID 유효성 검사 및 타입 변환
    const validCommentId = Number(commentId)
    if (!isValidNumber(validCommentId) || validCommentId <= 0) {
      showToast('유효하지 않은 댓글입니다.', 'error')
      return
    }

    // postId 타입 변환
    const validPostId = Number(postId)
    if (!isValidNumber(validPostId) || validPostId <= 0) {
      showToast('유효하지 않은 게시글입니다.', 'error')
      return
    }

    // 현재 댓글 목록에서 해당 댓글이 존재하는지 확인
    const existingComment = comments.find(c => c.id === validCommentId)
    if (!existingComment) {
      console.warn('댓글을 찾을 수 없음:', { commentId: validCommentId, availableComments: comments.map(c => c.id) })
      showToast('댓글을 찾을 수 없습니다. 페이지를 새로고침해주세요.', 'error')
      return
    }

    // 사용자 권한 확인 (현재 사용자가 댓글 작성자인지)
    if (!user || existingComment.userId !== user.id) {
      console.warn('댓글 수정 권한 없음:', { 
        commentId: validCommentId, 
        commentUserId: existingComment.userId, 
        currentUserId: user?.id,
        isOwner: existingComment.userId === user?.id
      })
      showToast('본인이 작성한 댓글만 수정할 수 있습니다.', 'error')
      return
    }

    try {
      console.log('=== 댓글 수정 시작 ===')
      console.log('postId:', validPostId, 'type:', typeof validPostId)
      console.log('commentId:', validCommentId, 'type:', typeof validCommentId)
      console.log('newContent:', newContent)
      console.log('existingComment:', existingComment)
      console.log('currentUser:', user)
      console.log('localStorage accessToken:', localStorage.getItem('accessToken') ? '있음' : '없음')
      
      // 새로운 thunk 사용 (일관된 API 엔드포인트)
      await dispatch(updateCommentThunk(validPostId, validCommentId, newContent.trim()))
      showToast('댓글이 수정되었습니다.', 'success')
      
      console.log('🔥 [useComments] 댓글 수정 완료:', { postId: validPostId, commentId: validCommentId })
      
    } catch (error: unknown) {
      console.error('=== 댓글 수정 에러 ===')
      console.error('에러 객체:', error)
      console.error('에러 메시지:', error instanceof Error ? error.message : 'Unknown error')
      console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack')
      
      logError('useComments.handleEditComment', error, { 
        postId: validPostId, 
        commentId: validCommentId, 
        content: newContent, 
        existingComment 
      })
      showToast(getUserFriendlyMessage(error), 'error')
    }
  }, [dispatch, postId, comments, user])

  // 댓글 삭제 (postsSlice 연동)
  const handleDeleteComment = useCallback(async (commentId: number) => {
    // 댓글 ID 유효성 검사 및 타입 변환
    const validCommentId = Number(commentId)
    if (!isValidNumber(validCommentId) || validCommentId <= 0) {
      showToast('유효하지 않은 댓글입니다.', 'error')
      return
    }

    // postId 타입 변환
    const validPostId = Number(postId)
    if (!isValidNumber(validPostId) || validPostId <= 0) {
      showToast('유효하지 않은 게시글입니다.', 'error')
      return
    }

    // 현재 댓글 목록에서 해당 댓글이 존재하는지 확인
    const existingComment = comments.find(c => c.id === validCommentId)
    if (!existingComment) {
      console.warn('댓글을 찾을 수 없음:', { commentId: validCommentId, availableComments: comments.map(c => c.id) })
      showToast('댓글을 찾을 수 없습니다. 페이지를 새로고침해주세요.', 'error')
      return
    }

    // 사용자 권한 확인 (현재 사용자가 댓글 작성자인지)
    if (!user || existingComment.userId !== user.id) {
      console.warn('댓글 삭제 권한 없음:', { 
        commentId: validCommentId, 
        commentUserId: existingComment.userId, 
        currentUserId: user?.id,
        isOwner: existingComment.userId === user?.id
      })
      showToast('본인이 작성한 댓글만 삭제할 수 있습니다.', 'error')
      return
    }

    try {
      console.log('댓글 삭제 시작:', { 
        postId: validPostId, 
        commentId: validCommentId, 
        existingComment, 
        currentUser: user 
      })
      
      // 새로운 thunk 사용 (일관된 API 엔드포인트)
      await dispatch(deleteCommentThunk(validPostId, validCommentId))
      showToast('댓글이 삭제되었습니다.', 'success')
      
      // 댓글 목록 새로고침 (Redux 상태는 thunk에서 자동 업데이트됨)
      await fetchComments()
    } catch (error: unknown) {
      logError('useComments.handleDeleteComment', error, { 
        postId: validPostId, 
        commentId: validCommentId, 
        existingComment 
      })
      showToast(getUserFriendlyMessage(error), 'error')
    }
  }, [dispatch, postId, fetchComments, comments, user])

  return {
    comments,
    allComments,
    newComment,
    setNewComment,
    loading,
    commentsLoading,
    handleSubmitComment,
    handleEditComment,
    handleDeleteComment,
    fetchComments
  }
}
