// ============================================================================
// 댓글 수 동기화 훅
// ============================================================================

import { useEffect, useCallback } from 'react'
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

    if (!hasCommentsData) {
      console.log('📥 [useCommentCountSync] 댓글 데이터 없음, 로드 시작:', postId)
      loadCommentsForPost(postId)
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

  useEffect(() => {
    // 각 포스트별로 댓글 데이터 확인 및 로드
    Object.keys(posts).forEach(postIdStr => {
      const postId = parseInt(postIdStr)
      const post = posts[postId]
      
      if (isValidPostId(postId) && post) {
        syncCommentCountForPost(postId, post)
      }
    })
  }, [dispatch, posts, syncCommentCountForPost])
}
