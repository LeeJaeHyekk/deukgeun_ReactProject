import { createEntityAdapter, createSlice, PayloadAction, Update } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from '@frontend/shared/store'
import { postsApi } from '@frontend/shared/api'
import { PostDTO } from '@shared/types'
import { validateTokenForAction } from '@frontend/shared/utils/tokenUtils'

export type Post = PostDTO

const postsAdapter = createEntityAdapter<Post>()

const initialState = postsAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  page: 1,
  totalPages: 1,
  total: 0,
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    upsertPosts: postsAdapter.upsertMany,
    setPosts: (state, action: PayloadAction<Post[]>) => {
      postsAdapter.setAll(state, action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setPagination: (state, action: PayloadAction<{ page: number; totalPages: number; total: number }>) => {
      state.page = action.payload.page
      state.totalPages = action.payload.totalPages
      state.total = action.payload.total
    },
    incLikeCount: (state, action: PayloadAction<{ postId: number }>) => {
      const { postId } = action.payload
      const post = state.entities[postId]
      if (!post) return
      if (post.likeCount == null) post.likeCount = 0
      post.likeCount += 1
    },
    decLikeCount: (state, action: PayloadAction<{ postId: number }>) => {
      const { postId } = action.payload
      const post = state.entities[postId]
      if (!post) return
      if (post.likeCount == null) post.likeCount = 0
      post.likeCount = Math.max(0, post.likeCount - 1)
    },
    updatePost: (state, action: PayloadAction<{ id: number; changes: Partial<Post> }>) => {
      const { id, changes } = action.payload
      const post = state.entities[id]
      if (post) {
        // 불변성 보장: 새 객체로 교체
        state.entities[id] = { ...post, ...changes }
        console.log('📝 [postsSlice] updatePost 실행:', { id, changes, updatedPost: state.entities[id] })
      }
    },
    
    // 댓글 수 증가
    incrementCommentCount: (state, action: PayloadAction<{ postId: number }>) => {
      const { postId } = action.payload
      const post = state.entities[postId]
      if (post) {
        if (post.commentCount == null) post.commentCount = 0
        post.commentCount += 1
        console.log('📝 [postsSlice] 댓글 수 증가:', { postId, newCount: post.commentCount })
      }
    },
    
    // 댓글 수 감소
    decrementCommentCount: (state, action: PayloadAction<{ postId: number }>) => {
      const { postId } = action.payload
      const post = state.entities[postId]
      if (post) {
        if (post.commentCount == null) post.commentCount = 0
        post.commentCount = Math.max(0, post.commentCount - 1)
        console.log('📝 [postsSlice] 댓글 수 감소:', { postId, newCount: post.commentCount })
      }
    },
    
    // 댓글 수 설정 (서버 응답으로 받은 정확한 값)
    setCommentCount: (state, action: PayloadAction<{ postId: number; count: number }>) => {
      const { postId, count } = action.payload
      const post = state.entities[postId]
      if (post) {
        post.commentCount = count
        console.log('📝 [postsSlice] 댓글 수 설정:', { postId, count })
      }
    },
    
    // 댓글 수 동기화 (commentsSlice와 연동)
    syncCommentCount: (state, action: PayloadAction<{ postId: number; confirmedCount: number; optimisticCount: number }>) => {
      const { postId, confirmedCount, optimisticCount } = action.payload
      const post = state.entities[postId]
      if (post) {
        const previousCount = post.commentCount || 0
        // 실제 댓글 수를 우선으로 하고, 낙관적 댓글 수를 더함
        const finalCount = confirmedCount + optimisticCount
        post.commentCount = finalCount
        console.log('📝 [postsSlice] 댓글 수 동기화:', { 
          postId, 
          previousCount,
          confirmedCount, 
          optimisticCount, 
          finalCount,
          changed: previousCount !== finalCount
        })
      }
    },
    removePost: postsAdapter.removeOne,
    clearPosts: postsAdapter.removeAll,
  },
})

export const {
  upsertPosts,
  setPosts,
  setLoading,
  setError,
  setPagination,
  incLikeCount,
  decLikeCount,
  updatePost,
  incrementCommentCount,
  decrementCommentCount,
  setCommentCount,
  syncCommentCount,
  removePost,
  clearPosts,
} = postsSlice.actions

export { postsAdapter }
export default postsSlice.reducer

// Thunk: 게시글 목록 가져오기
export const fetchPosts = (params?: {
  category?: string
  page?: number
  limit?: number
}) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true))
  dispatch(setError(null))
  
  try {
    console.log('📥 [postsSlice] fetchPosts 시작:', params)
    const response = await postsApi.list(params)
    const data = response.data.data as {
      posts: PostDTO[]
      total: number
      page: number
      limit: number
    }
    
    console.log('📥 [postsSlice] API 응답 받음:', {
      postsCount: data.posts.length,
      total: data.total,
      page: data.page
    })
    
    // commentCount 기본값 보장하여 초기 싱크 문제 해결
    dispatch(setPosts(
      data.posts.map(p => ({ ...p, commentCount: p.commentCount ?? 0 }))
    ))
    dispatch(setPagination({
      page: data.page,
      totalPages: Math.ceil(data.total / data.limit),
      total: data.total
    }))
    
    console.log('📥 [postsSlice] posts 상태 업데이트 완료')
  } catch (error: any) {
    console.error('❌ [postsSlice] fetchPosts 실패:', error)
    dispatch(setError(error.message || '게시글을 불러오는데 실패했습니다.'))
  } finally {
    dispatch(setLoading(false))
  }
}

// Thunk: 게시글 생성
export const createPost = (postData: {
  title: string
  content: string
  category: string
}) => async (dispatch: AppDispatch, getState: () => any) => {
  try {
    console.log('📝 [postsSlice] createPost 시작:', postData)
    
    // 토큰 검증
    const token = validateTokenForAction('createPost')
    if (!token) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.')
    }
    
    const response = await postsApi.create(postData)
    
    // 서버 응답에서 data 추출 및 id 검증
    const newPost = response.data?.data
    if (!newPost || !newPost.id) {
      throw new Error('서버에서 게시글 ID를 반환하지 않았습니다.')
    }
    
    console.log('📝 [postsSlice] 서버 응답 검증 완료:', { 
      hasId: !!newPost.id, 
      id: newPost.id,
      title: newPost.title 
    })
    
    // API 성공 후 Redux 상태에 새 게시글 추가
    dispatch(upsertPosts([newPost]))
    console.log('📝 [postsSlice] createPost 성공 및 상태 업데이트 완료')
    return response
  } catch (error: any) {
    console.error('❌ [postsSlice] createPost 실패:', error)
    throw error
  }
}

// Thunk: 게시글 수정
export const updatePostThunk = (postId: number, updateData: {
  title: string
  content: string
  category: string
}) => async (dispatch: AppDispatch) => {
  try {
    console.log('✏️ [postsSlice] updatePost 시작:', { postId, updateData })
    const response = await postsApi.update(postId, updateData)
    console.log('✏️ [postsSlice] updatePost 성공')
    return response
  } catch (error: any) {
    console.error('❌ [postsSlice] updatePost 실패:', error)
    throw error
  }
}

// Thunk: 게시글 삭제
export const deletePost = (postId: number) => async (dispatch: AppDispatch) => {
  try {
    console.log('🗑️ [postsSlice] deletePost 시작:', postId)
    await postsApi.remove(postId)
    dispatch(removePost(postId))
    console.log('🗑️ [postsSlice] deletePost 성공')
  } catch (error: any) {
    console.error('❌ [postsSlice] deletePost 실패:', error)
    throw error
  }
}
