import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { AppDispatch, RootState } from '@frontend/shared/store'
import { addCommentThunk, updateCommentThunk, deleteCommentThunk, setCommentsForPost } from '../comments/commentsSlice'
import { setCommentCount } from '../posts/postsSlice'
import { commentsApi } from '@frontend/shared/api'
import { safeLoadComments } from '../utils/commentMappers'
import { logError, getUserFriendlyMessage } from '../utils/errorHandlers'
import { showToast } from '@frontend/shared/lib'
import { isValidPostId } from '../utils/typeGuards'

import { PostId } from '../types'
import { getCurrentToken } from '@frontend/shared/utils/tokenUtils'
import { useAuthGuard } from '@frontend/shared/hooks/useAuthGuard'
import { handleAuthAwareError } from '@frontend/shared/utils/errorHandler'
import { isValidString } from '../utils/typeGuards'

/**
 * 메모이제이션된 selector 생성 함수 (postId별로 독립적인 selector 인스턴스)
 */
const createCommentSelectors = (postId: number) => {
  // confirmedComments selector - 배열이 없을 때도 같은 빈 배열 참조 반환
  const confirmedCommentsSelector = (state: RootState) => {
    const comments = state.comments.byPost[postId]
    return comments || []
  }

  // optimisticComments selector
  const optimisticCommentsSelector = (state: RootState) => {
    const comments = state.comments.optimisticTemp[postId]
    return comments || []
  }

  // isAlreadyLoaded selector - 불리언만 반환
  const isAlreadyLoadedSelector = (state: RootState) => {
    return state.comments.byPost[postId] !== undefined
  }

  return {
    confirmedCommentsSelector,
    optimisticCommentsSelector,
    isAlreadyLoadedSelector,
  }
}

/**
 * 댓글 관리를 위한 커스텀 훅
 */
export function useComments(postId: PostId) {
  const dispatch = useDispatch<AppDispatch>()
  const { ensureAuthenticated } = useAuthGuard()
  
  // 포스트 ID 유효성 검사 (조기 반환)
  const validPostId = useMemo(() => {
    if (!isValidPostId(postId)) {
      logError('useComments', new Error('유효하지 않은 포스트 ID'), { postId })
      return null
    }
    return Number(postId)
  }, [postId])

  // memoized selectors 생성 (postId별로 한 번만 생성)
  const selectors = useMemo(() => {
    if (!validPostId) return null
    return createCommentSelectors(validPostId)
  }, [validPostId])

  // Redux의 확정 댓글 목록을 메모이제이션된 selector로 구독
  const confirmedComments = useSelector(
    selectors?.confirmedCommentsSelector || (() => []),
    shallowEqual
  )
  
  // 낙관적 댓글을 메모이제이션된 selector로 구독
  const optimisticComments = useSelector(
    selectors?.optimisticCommentsSelector || (() => []),
    shallowEqual
  )
  
  // 이미 로드되었는지 확인 (불리언만 반환)
  const isAlreadyLoaded = useSelector(
    selectors?.isAlreadyLoadedSelector || (() => false)
  )

  // 사용자 정보를 훅 최상위에서 가져오기
  const user = useSelector((state: RootState) => state.auth.user, shallowEqual)
  
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)

  // 중복 API 호출 방지를 위한 ref
  const fetchingRef = useRef<boolean>(false)

  // 실제 댓글과 낙관적 댓글을 합쳐서 표시 (useMemo로 메모이제이션)
  const allComments = useMemo(() => {
    if (!validPostId) return []
    return [...confirmedComments, ...optimisticComments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [confirmedComments, optimisticComments, validPostId])

  // 포스트 ID가 유효하지 않으면 조기 반환
  if (!validPostId || !selectors) {
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
    // 이미 로드되었거나 현재 로딩 중이면 재요청 방지
    if (isAlreadyLoaded || fetchingRef.current || commentsLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 [useComments] 댓글 로드 스킵:', {
          postId: validPostId,
          reason: {
            isAlreadyLoaded,
            isFetching: fetchingRef.current,
            commentsLoading
          }
        })
      }
      return
    }
    
    fetchingRef.current = true
    setCommentsLoading(true)
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 [useComments] 댓글 요청 시작:', validPostId)
      }
      const response = await commentsApi.list(validPostId)
      
      if (response?.data?.success) {
        const commentData = safeLoadComments(response.data, validPostId)
        
        // Redux 상태 업데이트
        dispatch(setCommentsForPost({ postId: validPostId, comments: commentData }))
        dispatch(setCommentCount({ postId: validPostId, count: commentData.length }))
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [useComments] Redux 상태 업데이트 완료:', { 
            postId: validPostId, 
            count: commentData.length
          })
        }
      }
    } catch (error: unknown) {
      logError('useComments.fetchComments', error, { postId: validPostId })
      showToast(getUserFriendlyMessage(error), 'error')
    } finally {
      fetchingRef.current = false
      setCommentsLoading(false)
    }
  }, [validPostId, isAlreadyLoaded, commentsLoading, dispatch])

  // 댓글 로드는 한 번만 실행 (이미 로드되었거나 로딩 중이면 스킵)
  useEffect(() => {
    if (!isAlreadyLoaded && !commentsLoading && !fetchingRef.current) {
      fetchComments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validPostId]) // validPostId가 변경될 때만 실행

  // 댓글 작성 (API 성공 후 상태 업데이트)
  const handleSubmitComment = useCallback(async () => {
    if (!isValidString(newComment)) {
      showToast('댓글 내용을 입력해주세요.', 'error')
      return
    }

    // 인증 사전 검증
    if (!ensureAuthenticated()) return

    const token = getCurrentToken()
    if (!token) {
      showToast('로그인이 필요합니다. 로그인 후 이용해주세요.', 'error')
      return
    }

    setLoading(true)
    
    try {
      await dispatch(addCommentThunk(validPostId, newComment))
      setNewComment('')
      showToast('댓글이 성공적으로 작성되었습니다.', 'success')
    } catch (error: unknown) {
      if (handleAuthAwareError(error, (m, t = 'error') => showToast(m, t))) {
        return
      }
      showToast(getUserFriendlyMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }, [newComment, validPostId, dispatch, ensureAuthenticated])

  // 댓글 수정
  const handleEditComment = useCallback(async (commentId: number, content: string) => {
    if (!isValidString(content)) {
      showToast('댓글 내용을 입력해주세요.', 'error')
      return
    }

    // 인증 사전 검증
    if (!ensureAuthenticated()) return

    const token = getCurrentToken()
    if (!token) {
      showToast('로그인이 필요합니다. 로그인 후 이용해주세요.', 'error')
      return
    }

    setLoading(true)
    
    try {
      await dispatch(updateCommentThunk(validPostId, commentId, content))
      showToast('댓글이 성공적으로 수정되었습니다.', 'success')
    } catch (error: unknown) {
      if (handleAuthAwareError(error, (m, t = 'error') => showToast(m, t))) {
        return
      }
      showToast(getUserFriendlyMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }, [validPostId, dispatch, ensureAuthenticated])

  // 댓글 삭제
  const handleDeleteComment = useCallback(async (commentId: number) => {
    // 인증 사전 검증
    if (!ensureAuthenticated()) return

    const token = getCurrentToken()
    if (!token) {
      showToast('로그인이 필요합니다. 로그인 후 이용해주세요.', 'error')
      return
    }

    setLoading(true)
    
    try {
      await dispatch(deleteCommentThunk(validPostId, commentId))
      showToast('댓글이 성공적으로 삭제되었습니다.', 'success')
    } catch (error: unknown) {
      if (handleAuthAwareError(error, (m, t = 'error') => showToast(m, t))) {
        return
      }
      showToast(getUserFriendlyMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }, [validPostId, dispatch, ensureAuthenticated])

  return {
    comments: confirmedComments,
    allComments,
    newComment,
    loading,
    commentsLoading,
    fetchComments,
    addComment: handleSubmitComment,
    updateComment: handleEditComment,
    deleteComment: handleDeleteComment,
    setNewComment,
  }
}
