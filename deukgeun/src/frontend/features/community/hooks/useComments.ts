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
import { useAuthGuard } from '@frontend/shared/hooks/useAuthGuard'
import { handleAuthAwareError } from '@frontend/shared/utils/errorHandler'
import { isValidPostId, isValidString, isValidNumber } from '../utils/typeGuards'
import { PostId } from '../types'

/**
 * 댓글 관리를 위한 커스텀 훅
 */
export function useComments(postId: PostId) {
  const dispatch = useDispatch<AppDispatch>()
  const { ensureAuthenticated } = useAuthGuard()
  // Redux의 확정 댓글 목록을 직접 구독 (로컬 상태 제거 → 즉시 반영)
  const confirmedComments = useSelector((state: RootState) => state.comments.byPost[Number(postId)] || [])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)

  // 사용자 정보를 훅 최상위에서 가져오기
  const user = useSelector((state: RootState) => state.auth.user)
  
  // Redux에서 낙관적 댓글 가져오기
  const optimisticComments = useSelector((state: RootState) => 
    state.comments.optimisticTemp[Number(postId)] || []
  )
  
  // 실제 댓글과 낙관적 댓글을 합쳐서 표시 (Redux 기반)
  const allComments = [...confirmedComments, ...optimisticComments].sort((a, b) => 
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

    // 인증 사전 검증
    if (!ensureAuthenticated()) return

    // postId 타입 변환
    const validPostId = Number(postId)
    if (!isValidNumber(validPostId) || validPostId <= 0) {
      showToast('유효하지 않은 게시글입니다.', 'error')
      return
    }

    const commentText = newComment.trim()
    console.log('=== useComments 댓글 작성 시작 ===')
    console.log('게시글 ID:', validPostId, 'type:', typeof validPostId)
    console.log('댓글 내용:', commentText)
    
    // 토큰 상태 상세 확인 (이미 위에서 선언됨)
    console.log('🔐 [useComments] 토큰 상태:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
      timestamp: new Date().toISOString()
    })
    
    // Redux 상태 확인
    console.log('🔍 [useComments] Redux 상태:', {
      allCommentsCount: allComments.length,
      commentsCount: confirmedComments.length,
      userState: user ? { id: user.id, nickname: user.nickname } : null
    })

    try {
      // 새로운 thunk 사용 (API 성공 후 상태 업데이트)
      console.log('🚀 [useComments] addCommentThunk 호출 시작')
      await dispatch(addCommentThunk(validPostId, commentText))
      console.log('✅ [useComments] addCommentThunk 호출 완료')
      
      showToast('댓글이 작성되었습니다.', 'success')
      setNewComment('')
      
      // 댓글 목록 새로고침 (Redux 상태는 thunk에서 자동 업데이트됨)
      console.log('🔄 [useComments] 댓글 목록 새로고침 시작')
      await fetchComments()
      console.log('✅ [useComments] 댓글 목록 새로고침 완료')
    } catch (error: unknown) {
      // 에러 분석하여 적절한 처리
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      
      // 401 에러는 Axios 인터셉터에서 토큰 갱신 처리하므로 여기서는 로그아웃하지 않음
      // 403 에러는 권한 부족으로 로그아웃 불필요
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        showToast('권한이 부족합니다. 다시 로그인해주세요.', 'error')
        return
      }
      
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

    // 인증 사전 검증
    if (!ensureAuthenticated()) return

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

    // 현재 댓글 목록에서 해당 댓글이 존재하는지 확인 (allComments에서 검색)
    const existingComment = allComments.find(c => c.id === validCommentId)
    if (!existingComment) {
      console.warn('댓글을 찾을 수 없음:', { commentId: validCommentId, availableComments: allComments.map(c => c.id) })
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
      console.log('=== useComments 댓글 수정 시작 ===')
      console.log('postId:', validPostId, 'type:', typeof validPostId)
      console.log('commentId:', validCommentId, 'type:', typeof validCommentId)
      console.log('newContent:', newContent)
      console.log('existingComment:', existingComment)
      console.log('currentUser:', user)
      
      // 토큰 상태 상세 확인 (이미 위에서 선언됨)
      console.log('🔐 [useComments] 토큰 상태:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
        timestamp: new Date().toISOString()
      })
      
      // Redux 상태 확인
      console.log('🔍 [useComments] Redux 상태:', {
      allCommentsCount: allComments.length,
      commentsCount: confirmedComments.length,
        userState: user ? { id: user.id, nickname: user.nickname } : null
      })
      
      // 새로운 thunk 사용 (일관된 API 엔드포인트)
      console.log('🚀 [useComments] updateCommentThunk 호출 시작')
      await dispatch(updateCommentThunk(validPostId, validCommentId, newContent.trim()))
      console.log('✅ [useComments] updateCommentThunk 호출 완료')
      
      showToast('댓글이 수정되었습니다.', 'success')
      console.log('🔥 [useComments] 댓글 수정 완료:', { postId: validPostId, commentId: validCommentId })
      
    } catch (error: unknown) {
      console.error('=== 댓글 수정 에러 ===')
      console.error('에러 객체:', error)
      console.error('에러 메시지:', error instanceof Error ? error.message : 'Unknown error')
      console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack')
      
      // 공통 인증 에러 처리 (토스트 및 중단)
      if (handleAuthAwareError(error, (m,t='error')=>showToast(m,t))) return
      
      logError('useComments.handleEditComment', error, { 
        postId: validPostId, 
        commentId: validCommentId, 
        content: newContent, 
        existingComment 
      })
      showToast(getUserFriendlyMessage(error), 'error')
    }
  }, [dispatch, postId, allComments, user])

  // 댓글 삭제 (postsSlice 연동)
  const handleDeleteComment = useCallback(async (commentId: number) => {
    // 인증 사전 검증
    if (!ensureAuthenticated()) return

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

    // 현재 댓글 목록에서 해당 댓글이 존재하는지 확인 (allComments에서 검색)
    const existingComment = allComments.find(c => c.id === validCommentId)
    if (!existingComment) {
      console.warn('댓글을 찾을 수 없음:', { commentId: validCommentId, availableComments: allComments.map(c => c.id) })
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
      console.log('=== useComments 댓글 삭제 시작 ===')
      console.log('postId:', validPostId, 'type:', typeof validPostId)
      console.log('commentId:', validCommentId, 'type:', typeof validCommentId)
      console.log('existingComment:', existingComment)
      console.log('currentUser:', user)
      
      // 토큰 상태 상세 확인 (이미 위에서 선언됨)
      console.log('🔐 [useComments] 토큰 상태:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
        timestamp: new Date().toISOString()
      })
      
      // Redux 상태 확인
      console.log('🔍 [useComments] Redux 상태:', {
      allCommentsCount: allComments.length,
      commentsCount: confirmedComments.length,
        userState: user ? { id: user.id, nickname: user.nickname } : null
      })
      
      // 새로운 thunk 사용 (일관된 API 엔드포인트)
      console.log('🚀 [useComments] deleteCommentThunk 호출 시작')
      await dispatch(deleteCommentThunk(validPostId, validCommentId))
      console.log('✅ [useComments] deleteCommentThunk 호출 완료')
      
      showToast('댓글이 삭제되었습니다.', 'success')
      
      // 댓글 목록 새로고침 (Redux 상태는 thunk에서 자동 업데이트됨)
      console.log('🔄 [useComments] 댓글 목록 새로고침 시작')
      await fetchComments()
      console.log('✅ [useComments] 댓글 목록 새로고침 완료')
    } catch (error: unknown) {
      // 공통 인증 에러 처리 (토스트 및 중단)
      if (handleAuthAwareError(error, (m,t='error')=>showToast(m,t))) return
      
      logError('useComments.handleDeleteComment', error, { 
        postId: validPostId, 
        commentId: validCommentId, 
        existingComment 
      })
      showToast(getUserFriendlyMessage(error), 'error')
    }
  }, [dispatch, postId, fetchComments, allComments, user])

  return {
    comments: confirmedComments,
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
