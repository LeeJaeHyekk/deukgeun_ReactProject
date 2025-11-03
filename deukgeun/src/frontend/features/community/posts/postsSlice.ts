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
      console.log('📝 [postsSlice] setPosts 실행:', {
        previousCount: Object.keys(state.entities).length,
        newCount: action.payload.length,
        newPostIds: action.payload.map(p => p.id),
        timestamp: new Date().toISOString()
      })
      postsAdapter.setAll(state, action.payload)
      console.log('📝 [postsSlice] setPosts 완료:', {
        finalCount: Object.keys(state.entities).length,
        finalIds: Object.keys(state.entities),
        timestamp: new Date().toISOString()
      })
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setPagination: (state, action: PayloadAction<{ page: number; totalPages: number; total: number }>) => {
      const previousPage = state.page
      const previousTotalPages = state.totalPages
      const previousTotal = state.total
      
      console.log('📄 [postsSlice] setPagination reducer 실행:', {
        previous: {
          page: previousPage,
          totalPages: previousTotalPages,
          total: previousTotal
        },
        new: {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          total: action.payload.total
        },
        willChange: previousPage !== action.payload.page,
        timestamp: new Date().toISOString()
      })
      
      state.page = action.payload.page
      state.totalPages = action.payload.totalPages
      state.total = action.payload.total
      
      console.log('📄 [postsSlice] setPagination reducer 완료:', {
        final: {
          page: state.page,
          totalPages: state.totalPages,
          total: state.total
        },
        timestamp: new Date().toISOString()
      })
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

// Thunk: 게시글 목록 가져오기 (타입 가드 및 예외 처리 강화)
export const fetchPosts = (params?: {
  category?: string
  page?: number
  limit?: number
}) => async (dispatch: AppDispatch, getState: () => any) => {
  const currentState = getState()
  const previousPagination = {
    page: currentState.posts.page,
    totalPages: currentState.posts.totalPages,
    total: currentState.posts.total
  }
  
  console.log('📥 [postsSlice] fetchPosts 시작:', {
    params,
    previousPagination,
    timestamp: new Date().toISOString()
  })
  
  dispatch(setLoading(true))
  dispatch(setError(null))
  
  try {
    const response = await postsApi.list(params)
    
    // API 응답 타입 가드 적용
    const { isValidPostsApiResponse } = await import('../utils/typeGuards')
    if (!isValidPostsApiResponse(response.data)) {
      throw new Error('게시글 API 응답이 유효하지 않습니다.')
    }
    
    // 안전한 매핑 함수 사용
    const { safeLoadPosts } = await import('../utils/postMappers')
    const { posts: mappedPosts, pagination: mappedPagination } = safeLoadPosts(response.data)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 [postsSlice] API 응답 받음:', {
        postsCount: mappedPosts.length,
        pagination: mappedPagination
      })
    }
    
    // commentCount 기본값 보장하여 초기 싱크 문제 해결
    dispatch(setPosts(
      mappedPosts.map(p => ({ ...p, commentCount: p.commentCount ?? 0 }))
    ))
    
    // pagination 업데이트
    if (mappedPagination) {
      const newPagination = {
        page: mappedPagination.page,
        totalPages: mappedPagination.totalPages,
        total: mappedPagination.total
      }
      console.log('📄 [postsSlice] Pagination 업데이트:', {
        previous: previousPagination,
        new: newPagination,
        requestedParams: params,
        willUpdate: previousPagination.page !== newPagination.page || 
                     previousPagination.totalPages !== newPagination.totalPages,
        timestamp: new Date().toISOString()
      })
      dispatch(setPagination(newPagination))
    } else {
      // pagination이 없는 경우 기본값 사용
      const limit = params?.limit || 12
      const fallbackPagination = {
        page: params?.page || 1,
        totalPages: Math.ceil(mappedPosts.length / limit),
        total: mappedPosts.length
      }
      console.log('📄 [postsSlice] Pagination 기본값 사용:', {
        fallback: fallbackPagination,
        requestedParams: params,
        postsCount: mappedPosts.length,
        timestamp: new Date().toISOString()
      })
      dispatch(setPagination(fallbackPagination))
    }
    
    console.log('📥 [postsSlice] posts 상태 업데이트 완료:', {
      postsCount: mappedPosts.length,
      pagination: mappedPagination || {
        page: params?.page || 1,
        totalPages: Math.ceil(mappedPosts.length / (params?.limit || 12)),
        total: mappedPosts.length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    const { getUserFriendlyMessage } = await import('../utils/errorHandlers')
    console.error('❌ [postsSlice] fetchPosts 실패:', error)
    dispatch(setError(getUserFriendlyMessage(error)))
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
    console.log('📝 [postsSlice] createPost 시작:', {
      title: postData.title,
      contentLength: postData.content?.length || 0,
      category: postData.category,
      timestamp: new Date().toISOString()
    })
    
    // Redux 상태 확인
    const state = getState()
    console.log('📝 [postsSlice] Redux 상태:', {
      auth: {
        isLoggedIn: state?.auth?.isLoggedIn,
        hasUser: !!state?.auth?.user,
        userId: state?.auth?.user?.id || state?.auth?.user?.userId || null,
        userEmail: state?.auth?.user?.email || null,
        hasAccessToken: !!state?.auth?.accessToken,
        accessTokenPreview: state?.auth?.accessToken ? `${String(state?.auth?.accessToken).substring(0, 20)}...` : '없음'
      }
    })
    
    // 토큰 검증
    console.log('🔐 [postsSlice] validateTokenForAction 호출 전')
    const token = validateTokenForAction('createPost')
    console.log('🔐 [postsSlice] validateTokenForAction 결과:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
      tokenLength: token?.length || 0
    })
    
    if (!token) {
      console.error('❌ [postsSlice] 토큰 검증 실패 - 에러 발생')
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.')
    }
    
    console.log('📡 [postsSlice] postsApi.create 호출 시작:', {
      url: '/api/posts',
      method: 'POST',
      data: { title: postData.title, contentLength: postData.content?.length || 0, category: postData.category }
    })
    const response = await postsApi.create(postData)
    console.log('📡 [postsSlice] postsApi.create 응답 받음:', {
      status: response.status,
      hasData: !!response.data,
      success: response.data?.success,
      message: response.data?.message
    })
    
    // 서버 응답 타입 가드 적용
    if (!response?.data?.success || !response.data.data) {
      throw new Error(response?.data?.message || '서버에서 게시글을 반환하지 않았습니다.')
    }
    
    // 서버 응답에서 data 추출 및 타입 검증
    const newPost = response.data.data as PostDTO
    const { isValidPost } = await import('../utils/typeGuards')
    
    if (!isValidPost(newPost)) {
      throw new Error('서버에서 반환된 게시글이 유효하지 않습니다.')
    }
    
    if (!newPost.id) {
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

// Thunk: 게시글 수정 (타입 가드 및 예외 처리 강화)
export const updatePostThunk = (postId: number, updateData: {
  title: string
  content: string
  category: string
}) => async (dispatch: AppDispatch) => {
  try {
    // 입력 데이터 검증
    const { isValidPostId, isValidString } = await import('../utils/typeGuards')
    
    if (!isValidPostId(postId)) {
      throw new Error('유효하지 않은 게시글 ID입니다.')
    }
    
    if (!isValidString(updateData.title) || !isValidString(updateData.content) || !isValidString(updateData.category)) {
      throw new Error('게시글 제목, 내용, 카테고리를 모두 입력해주세요.')
    }
    
    console.log('✏️ [postsSlice] updatePost 시작:', { postId, updateData })
    const response = await postsApi.update(postId, updateData)
    
    // 응답 검증
    if (!response?.data?.success || !response.data.data) {
      throw new Error(response?.data?.message || '게시글 수정에 실패했습니다.')
    }
    
    const updatedPost = response.data.data as PostDTO
    const { isValidPost } = await import('../utils/typeGuards')
    
    if (!isValidPost(updatedPost)) {
      throw new Error('서버에서 반환된 게시글이 유효하지 않습니다.')
    }
    
    // Redux 상태 업데이트
    dispatch(upsertPosts([updatedPost]))
    
    console.log('✏️ [postsSlice] updatePost 성공')
    return response
  } catch (error: any) {
    console.error('❌ [postsSlice] updatePost 실패:', error)
    throw error
  }
}

// Thunk: 게시글 삭제 (타입 가드 및 예외 처리 강화)
export const deletePost = (postId: number) => async (dispatch: AppDispatch) => {
  try {
    // 입력 데이터 검증
    const { isValidPostId } = await import('../utils/typeGuards')
    
    if (!isValidPostId(postId)) {
      throw new Error('유효하지 않은 게시글 ID입니다.')
    }
    
    console.log('🗑️ [postsSlice] deletePost 시작:', postId)
    const response = await postsApi.remove(postId)
    
    // 응답 검증
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || '게시글 삭제에 실패했습니다.')
    }
    
    dispatch(removePost(postId))
    console.log('🗑️ [postsSlice] deletePost 성공')
  } catch (error: any) {
    console.error('❌ [postsSlice] deletePost 실패:', error)
    throw error
  }
}
