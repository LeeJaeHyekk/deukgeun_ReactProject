// ============================================================================
// 댓글 수 동기화 훅
// ============================================================================

import { useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@frontend/shared/store'
import { syncCommentCount } from '../posts/postsSlice'
import { setCommentsForPost } from '../comments/commentsSlice'
import { commentsApi } from '@frontend/shared/api'
import { safeLoadComments } from '../utils/commentMappers'
import { logError, getUserFriendlyMessage } from '../utils/errorHandlers'
import { isValidPostId } from '../utils/typeGuards'
import { PostId } from '../types'

/**
 * 댓글 수 동기화 훅
 * 포스트 로드 시 댓글 데이터를 미리 로드하여 정확한 댓글 수 표시
 */
export function useCommentCountSync() {
  const dispatch = useDispatch()

  // 모든 포스트와 댓글 상태를 감시
  const posts = useSelector((state: RootState) => state.posts.entities)
  const commentsByPost = useSelector((state: RootState) => state.comments.byPost)
  const optimisticTemp = useSelector((state: RootState) => state.comments.optimisticTemp)

  // 댓글 데이터 로드 함수
  const loadCommentsForPost = useCallback(async (postId: PostId) => {
    if (!isValidPostId(postId)) {
      logError('useCommentCountSync', new Error('유효하지 않은 포스트 ID'), { postId })
      return
    }

    try {
      console.log('📥 [useCommentCountSync] 댓글 데이터 로드 시작:', postId)
      const response = await commentsApi.list(postId)
      
      if (response?.data?.success && response.data.data) {
        const commentData = safeLoadComments(response.data, postId)
        
        // Redux 상태 업데이트
        dispatch(setCommentsForPost({ postId, comments: commentData }))
        
        // postsSlice 댓글 수 동기화
        const optimisticCount = optimisticTemp[postId]?.length || 0
        dispatch(syncCommentCount({
          postId,
          confirmedCount: commentData.length,
          optimisticCount
        }))

        console.log('✅ [useCommentCountSync] 댓글 데이터 로드 완료:', {
          postId,
          commentCount: commentData.length,
          optimisticCount
        })
      } else {
        console.warn('📥 [useCommentCountSync] 댓글 API 응답이 유효하지 않음:', response)
      }
    } catch (error) {
      logError('useCommentCountSync', error, { postId })
    }
  }, [dispatch, optimisticTemp])

  // 댓글 수 동기화 함수
  const syncCommentCountForPost = useCallback((postId: PostId, post: any) => {
    if (!isValidPostId(postId) || !post) return

    const hasCommentsData = commentsByPost[postId] !== undefined
    const confirmedCount = commentsByPost[postId]?.length || 0
    const optimisticCount = optimisticTemp[postId]?.length || 0

    if (!hasCommentsData && post.commentCount > 0) {
      // 댓글이 있는 경우에만 lazy load (서버 commentCount 기준)
      // 실제 댓글 데이터는 사용자가 포스트를 클릭할 때 로드됨
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 [useCommentCountSync] 댓글 데이터 없음 (lazy load 예약):', postId, '서버 댓글 수:', post.commentCount)
      }
      // lazy load: 포스트 클릭 시 로드되도록 예약만 함
      // loadCommentsForPost(postId) // 주석 처리 - lazy loading
    } else {
      // 댓글 데이터가 있는 경우 동기화 확인
      const expectedCount = confirmedCount + optimisticCount
      if (post.commentCount !== expectedCount) {
        console.log('🔄 [useCommentCountSync] 댓글 수 동기화 필요:', {
          postId,
          currentCount: post.commentCount,
          confirmedCount,
          optimisticCount,
          expectedCount
        })

        dispatch(syncCommentCount({
          postId,
          confirmedCount,
          optimisticCount
        }))
      }
    }
  }, [dispatch, commentsByPost, optimisticTemp, loadCommentsForPost])

  // 이전 posts 객체 참조를 추적하여 실제 변경 시에만 처리
  const prevPostsRef = useRef<typeof posts>({})
  const processedPostsRef = useRef<Set<PostId>>(new Set())

  useEffect(() => {
    // posts 객체가 실제로 변경되었는지 확인
    const postsChanged = 
      Object.keys(posts).length !== Object.keys(prevPostsRef.current).length ||
      Object.keys(posts).some(postIdStr => {
        const postId = parseInt(postIdStr)
        return !prevPostsRef.current[postId] || prevPostsRef.current[postId] !== posts[postId]
      })

    if (!postsChanged) {
      return // 변경사항이 없으면 스킵
    }

    // 새로 추가된 포스트만 처리 (이미 처리한 포스트는 제외)
    Object.keys(posts).forEach(postIdStr => {
      const postId = parseInt(postIdStr)
      const post = posts[postId]
      
      if (isValidPostId(postId) && post && !processedPostsRef.current.has(postId)) {
        // 댓글 데이터는 서버의 commentCount를 우선 사용하고, 
        // 실제 댓글 데이터는 사용자가 포스트를 클릭할 때 lazy load
        // 여기서는 동기화만 수행 (실제 댓글 로드는 하지 않음)
        const hasCommentsData = commentsByPost[postId] !== undefined
        if (hasCommentsData) {
          // 이미 댓글 데이터가 있는 경우만 동기화
          syncCommentCountForPost(postId, post)
        }
        processedPostsRef.current.add(postId)
      }
    })

    prevPostsRef.current = { ...posts }
  }, [dispatch, posts, commentsByPost, syncCommentCountForPost])
}
