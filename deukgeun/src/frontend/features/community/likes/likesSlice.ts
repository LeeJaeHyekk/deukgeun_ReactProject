import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from '@frontend/shared/store'
import { likesApi } from '@frontend/shared/api'
import { updatePost, incLikeCount, decLikeCount } from '../posts/postsSlice'

type LikesState = {
  likedIds: number[] // 순서 보장 불필요 -> 배열 대신 Set을 사용하지 않음(직렬화 편의)
  syncing: Record<number, boolean> // 특정 postId의 동기화 상태 (loading indicator)
}

const initialState: LikesState = {
  likedIds: JSON.parse(localStorage.getItem('likedIds') || '[]'),
  syncing: {},
}

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    setLikedIds: (state, action: PayloadAction<number[]>) => {
      state.likedIds = action.payload
    },
    addLike: (state, action: PayloadAction<number>) => {
      if (!state.likedIds.includes(action.payload)) {
        state.likedIds.push(action.payload)
      }
    },
    removeLike: (state, action: PayloadAction<number>) => {
      state.likedIds = state.likedIds.filter(id => id !== action.payload)
    },
    setSyncing: (state, action: PayloadAction<{ postId: number; val: boolean }>) => {
      state.syncing[action.payload.postId] = action.payload.val
    },
    clearSyncing: (state) => {
      state.syncing = {}
    },
  },
})

export const {
  setLikedIds,
  addLike,
  removeLike,
  setSyncing,
  clearSyncing,
} = likesSlice.actions

export default likesSlice.reducer

// 낙관적 토글 thunk
export const toggleLikeOptimistic = (postId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const isLiked = state.likes.likedIds.includes(postId)

  console.log('🔥 [likesSlice] toggleLikeOptimistic 시작:', { postId, isLiked })

  // Optimistic UI update
  dispatch(setSyncing({ postId, val: true }))
  
  if (!isLiked) {
    dispatch(addLike(postId))
    dispatch(incLikeCount({ postId }))
    console.log('🔥 [likesSlice] 낙관적 좋아요 추가:', postId)
  } else {
    dispatch(removeLike(postId))
    dispatch(decLikeCount({ postId }))
    console.log('🔥 [likesSlice] 낙관적 좋아요 제거:', postId)
  }

  try {
    // 서버 호출: 성공하면 서버 응답으로 상태 업데이트
    console.log('🔥 [likesSlice] API 호출 시작:', postId)
    const response = await likesApi.toggle(postId)
    console.log('🔥 [likesSlice] API 응답 받음:', response)
    
    // 서버 응답으로 최신 상태 업데이트
    console.log('🔥 [likesSlice] 전체 API 응답:', response)
    console.log('🔥 [likesSlice] response.data:', response.data)
    console.log('🔥 [likesSlice] response.data.data:', response.data?.data)
    
    if (response.data?.data) {
      const serverData = response.data.data as any
      const serverIsLiked = serverData.isLiked
      const serverLikeCount = serverData.likeCount
      console.log('🔥 [likesSlice] 서버 응답으로 상태 업데이트:', { 
        serverIsLiked, 
        serverLikeCount,
        serverData 
      })
      
      // 서버 응답에 따라 상태 동기화
      if (serverIsLiked !== isLiked) {
        if (serverIsLiked) {
          dispatch(addLike(postId))
        } else {
          dispatch(removeLike(postId))
        }
      }
      
      // 서버의 최신 likeCount와 isLiked로 업데이트
      dispatch(updatePost({ 
        id: postId, 
        changes: { 
          likeCount: serverLikeCount,
          isLiked: serverIsLiked 
        } 
      }))
    }
    
    // 로컬 저장은 미들웨어가 처리
    console.log('💾 [likesSlice] API 호출 성공, 미들웨어가 로컬 스토리지 저장 처리')
    
  } catch (err: any) {
    console.error('❌ [likesSlice] API 호출 실패, 롤백 시작:', err)
    
    // 롤백
    if (!isLiked) {
      dispatch(removeLike(postId))
      dispatch(decLikeCount({ postId }))
      console.log('🔄 [likesSlice] 롤백: 좋아요 제거')
    } else {
      dispatch(addLike(postId))
      dispatch(incLikeCount({ postId }))
      console.log('🔄 [likesSlice] 롤백: 좋아요 추가')
    }
    
    // 에러 표시는 컴포넌트/토스트로 처리
    throw err
  } finally {
    dispatch(setSyncing({ postId, val: false }))
    console.log('✅ [likesSlice] toggleLikeOptimistic 완료:', postId)
  }
}

// 로컬 스토리지에서 좋아요 상태 복원
export const restoreLikedIds = () => (dispatch: AppDispatch) => {
  try {
    console.log('💾 [likesSlice] 로컬 스토리지에서 좋아요 상태 복원')
    const stored = localStorage.getItem('likedIds')
    if (stored) {
      const likedIds = JSON.parse(stored) as number[]
      dispatch(setLikedIds(likedIds))
      console.log('💾 [likesSlice] 복원된 좋아요 상태:', likedIds)
    }
  } catch (error) {
    console.error('💾 [likesSlice] 로컬 스토리지 복원 실패:', error)
  }
}
