import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from '@frontend/shared/store'
import { incrementCommentCount, decrementCommentCount, setCommentCount } from '../posts/postsSlice'
import axios from 'axios'

export type Comment = {
  id: number
  postId: number
  content: string
  userId: number
  author: {
    id: number
    nickname: string
    profileImage?: string
    avatarUrl?: string
  }
  createdAt: string
  updatedAt: string
  likesCount: number
}

type CommentsState = {
  byPost: Record<number, Comment[]>
  optimisticTemp: Record<number, Comment[]> // 서버 확정 전 임시 댓글
  loading: Record<number, boolean> // 각 포스트별 로딩 상태
}

const initialState: CommentsState = {
  byPost: {},
  optimisticTemp: {},
  loading: {},
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    // 특정 포스트의 댓글 목록 설정
    setCommentsForPost(state, action: PayloadAction<{ postId: number; comments: Comment[] }>) {
      const { postId, comments } = action.payload
      state.byPost[postId] = comments
      state.loading[postId] = false
      console.log('🔥 [commentsSlice] 댓글 목록 설정:', { postId, count: comments.length })
    },
    
    // 댓글 추가 확정 (서버 응답 후)
    addCommentConfirmed(state, action: PayloadAction<Comment>) {
      const comment = action.payload
      const postId = comment.postId
      
      if (!state.byPost[postId]) {
        state.byPost[postId] = []
      }
      
      // 중복 방지
      const existingIndex = state.byPost[postId].findIndex(c => c.id === comment.id)
      if (existingIndex === -1) {
        state.byPost[postId].push(comment)
      }
      
      // optimistic 댓글 제거
      if (state.optimisticTemp[postId]) {
        state.optimisticTemp[postId] = state.optimisticTemp[postId].filter(c => c.id !== comment.id)
      }
      
      console.log('🔥 [commentsSlice] 댓글 추가 확정:', { postId, commentId: comment.id })
    },
    
    // 댓글 수 동기화 (postsSlice와 연동)
    syncCommentCounts(state, action: PayloadAction<{ postId: number }>) {
      const { postId } = action.payload
      const confirmedCount = state.byPost[postId]?.length || 0
      const optimisticCount = state.optimisticTemp[postId]?.length || 0
      
      console.log('🔥 [commentsSlice] 댓글 수 동기화 요청:', { 
        postId, 
        confirmedCount, 
        optimisticCount 
      })
      
      // postsSlice의 syncCommentCount 액션을 dispatch하도록 외부에서 처리
      // 여기서는 로그만 출력
    },
    
    // 낙관적 댓글 추가 (서버 요청 전)
    addCommentOptimistic(state, action: PayloadAction<{ postId: number; tempComment: Comment }>) {
      const { postId, tempComment } = action.payload
      
      if (!state.optimisticTemp[postId]) {
        state.optimisticTemp[postId] = []
      }
      
      state.optimisticTemp[postId].push(tempComment)
      console.log('🔥 [commentsSlice] 낙관적 댓글 추가:', { 
        postId, 
        tempId: tempComment.id,
        optimisticCount: state.optimisticTemp[postId].length,
        totalOptimistic: Object.keys(state.optimisticTemp).length
      })
    },
    
    // 낙관적 댓글 제거 (실패 시)
    removeOptimisticComment(state, action: PayloadAction<{ postId: number; tempId: number }>) {
      const { postId, tempId } = action.payload
      
      if (state.optimisticTemp[postId]) {
        state.optimisticTemp[postId] = state.optimisticTemp[postId].filter(c => c.id !== tempId)
        console.log('🔥 [commentsSlice] 낙관적 댓글 제거:', { postId, tempId })
      }
    },
    
    // 댓글 수정
    updateComment(state, action: PayloadAction<{ postId: number; commentId: number; content: string }>) {
      const { postId, commentId, content } = action.payload
      
      const list = state.byPost[postId]
      if (!list) return
      
      const next = list.map(c => 
        c.id === commentId 
          ? { ...c, content, updatedAt: new Date().toISOString() } 
          : c
      )
      state.byPost[postId] = next
      console.log('🔥 [commentsSlice] 댓글 수정:', { postId, commentId })
    },
    
    // 댓글 삭제
    removeComment(state, action: PayloadAction<{ postId: number; commentId: number }>) {
      const { postId, commentId } = action.payload
      
      if (state.byPost[postId]) {
        state.byPost[postId] = state.byPost[postId].filter(c => c.id !== commentId)
        console.log('🔥 [commentsSlice] 댓글 삭제:', { postId, commentId })
      }
    },
    
    // 로딩 상태 설정
    setLoading(state, action: PayloadAction<{ postId: number; loading: boolean }>) {
      const { postId, loading } = action.payload
      state.loading[postId] = loading
    },
    
    // 모든 댓글 상태 초기화
    clearAllComments(state) {
      state.byPost = {}
      state.optimisticTemp = {}
      state.loading = {}
      console.log('🔥 [commentsSlice] 모든 댓글 상태 초기화')
    }
  },
})

export const { 
  setCommentsForPost, 
  addCommentConfirmed, 
  addCommentOptimistic, 
  removeOptimisticComment,
  updateComment,
  removeComment,
  setLoading,
  syncCommentCounts,
  clearAllComments
} = commentsSlice.actions

// Thunk actions are exported below as individual functions

export default commentsSlice.reducer

// Thunk: 댓글 추가 (낙관적 업데이트 + 롤백 처리)
export const addCommentThunk = (postId: number, content: string) => 
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const user = getState().auth.user
    if (!user) {
      throw new Error('사용자 정보가 없습니다.')
    }

    // ID 타입 변환
    const validPostId = Number(postId)
    if (!validPostId || isNaN(validPostId)) {
      throw new Error('유효하지 않은 게시글 ID입니다.')
    }

    // 임시 댓글 ID 생성 (음수로 구분)
    const tempId = -Date.now()
    const tempComment: Comment = {
      id: tempId,
      postId: validPostId,
      content: content.trim(),
      userId: user.id,
      author: {
        id: user.id,
        nickname: user.nickname || 'Unknown',
        profileImage: user.profileImage
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0
    }

    try {
      console.log('=== commentsSlice 댓글 추가 시작 (낙관적 업데이트) ===')
      console.log('postId:', validPostId, 'type:', typeof validPostId)
      console.log('content:', content)
      console.log('tempId:', tempId)
      
      // 토큰 상태 상세 확인
      const token = localStorage.getItem('accessToken')
      console.log('🔐 [addCommentThunk] 토큰 상태:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
        timestamp: new Date().toISOString()
      })
      
      // 1. 낙관적 업데이트 (즉시 UI에 표시)
      dispatch(addCommentOptimistic({ postId: validPostId, tempComment }))
      dispatch(incrementCommentCount({ postId: validPostId }))
      
      // 2. 서버에 실제 요청
      const { commentsApi } = await import('@frontend/shared/api')
      console.log('commentsApi 로드 완료')
      
      console.log('API 호출 시작: POST /api/comments/' + validPostId)
      console.log('요청 데이터:', { content })
      const response = await commentsApi.create(validPostId, { content })
      console.log('API 응답 받음:', response)
      const confirmed: Comment = response.data.data as Comment

      // 3. 서버 응답 성공 시 낙관적 댓글 제거하고 실제 댓글 추가
      dispatch(removeOptimisticComment({ postId: validPostId, tempId }))
      dispatch(addCommentConfirmed(confirmed))
      
      console.log('🔥 [commentsSlice] 댓글 추가 성공:', { 
        postId: validPostId, 
        commentId: confirmed.id,
        tempId
      })
      return confirmed
    } catch (error) {
      console.error('🔥 [commentsSlice] 댓글 추가 실패 - 롤백 처리:', error)
      
      // 4. 실패 시 낙관적 댓글 제거 및 댓글 수 롤백
      dispatch(removeOptimisticComment({ postId: validPostId, tempId }))
      dispatch(decrementCommentCount({ postId: validPostId }))
      
      throw error
    }
  }

// Thunk: 댓글 수정 (postsSlice와 연동)
export const updateCommentThunk = (postId: number, commentId: number, content: string) => 
  async (dispatch: AppDispatch) => {
    try {
      console.log('=== commentsSlice 댓글 수정 시작 ===')
      console.log('postId:', postId, 'type:', typeof postId)
      console.log('commentId:', commentId, 'type:', typeof commentId)
      console.log('content:', content)
      
      // 토큰 상태 상세 확인
      const token = localStorage.getItem('accessToken')
      console.log('🔐 [updateCommentThunk] 토큰 상태:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
        timestamp: new Date().toISOString()
      })
      
      // commentsApi를 사용하여 일관된 엔드포인트 사용
      const { commentsApi } = await import('@frontend/shared/api')
      console.log('commentsApi 로드 완료')
      
      console.log('API 호출 시작: PUT /api/comments/' + commentId)
      console.log('요청 데이터:', { content })
      
      const response = await commentsApi.update(commentId, { content })
      console.log('API 응답 받음:', response)
      
      // 서버 응답에서 업데이트된 댓글 정보 추출
      const updatedComment = response.data.data as Comment
      console.log('추출된 댓글 정보:', updatedComment)
      
      // 서버 수정 성공 후 Redux에서 업데이트
      dispatch(updateComment({ 
        postId: updatedComment.postId, 
        commentId: updatedComment.id, 
        content: updatedComment.content 
      }))
      
      console.log('🔥 [commentsSlice] 댓글 수정 성공:', { 
        postId: updatedComment.postId, 
        commentId: updatedComment.id 
      })
      
      return updatedComment
    } catch (error) {
      console.error('=== commentsSlice 댓글 수정 실패 ===')
      console.error('에러 객체:', error)
      console.error('에러 메시지:', error instanceof Error ? error.message : 'Unknown error')
      console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack')
      throw error
    }
  }

// Thunk: 댓글 삭제 (postsSlice와 연동)
export const deleteCommentThunk = (postId: number, commentId: number) => 
  async (dispatch: AppDispatch) => {
    try {
      console.log('=== commentsSlice 댓글 삭제 시작 ===')
      console.log('postId:', postId, 'type:', typeof postId)
      console.log('commentId:', commentId, 'type:', typeof commentId)
      
      // 토큰 상태 상세 확인
      const token = localStorage.getItem('accessToken')
      console.log('🔐 [deleteCommentThunk] 토큰 상태:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
        timestamp: new Date().toISOString()
      })
      
      // commentsApi를 사용하여 일관된 엔드포인트 사용
      const { commentsApi } = await import('@frontend/shared/api')
      console.log('commentsApi 로드 완료')
      
      console.log('API 호출 시작: DELETE /api/comments/' + commentId)
      await commentsApi.remove(commentId)
      console.log('API 삭제 성공')
      
      // 서버 삭제 성공 후 Redux에서 제거
      dispatch(removeComment({ postId, commentId }))
      // postsSlice의 댓글 수 감소
      dispatch(decrementCommentCount({ postId }))
      
      console.log('🔥 [commentsSlice] 댓글 삭제 성공:', { postId, commentId })
      
      return { postId, commentId }
    } catch (error) {
      console.error('🔥 [commentsSlice] 댓글 삭제 실패:', error)
      throw error
    }
  }

  
