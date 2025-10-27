import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@frontend/shared/store'
import { toggleLikeOptimistic } from '../likes/likesSlice'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'

/**
 * 게시글 좋아요 기능을 위한 커스텀 훅
 */
export function usePostLikes(postId: number) {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoggedIn } = useAuthRedux()
  
  // Redux 상태
  const isLiked = useSelector((state: any) => 
    isLoggedIn ? state.likes.likedIds.includes(postId) : false
  )
  const syncing = useSelector((state: any) => state.likes.syncing[postId])
  
  const handleToggleLike = useCallback(() => {
    if (syncing || !isLoggedIn) {
      return
    }
    
    dispatch(toggleLikeOptimistic(postId))
  }, [dispatch, postId, syncing, isLoggedIn])
  
  return {
    isLiked,
    syncing,
    isLoggedIn,
    handleToggleLike
  }
}