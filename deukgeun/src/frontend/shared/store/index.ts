import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice.js'
import appSlice from './appSlice'
import statsReducer from './statsSlice'
import homeReducer from './homeSlice'
import locationReducer from '@frontend/pages/location/slices/locationSlice'
import postsReducer from '@frontend/features/community/posts/postsSlice'
import likesReducer from '@frontend/features/community/likes/likesSlice'
import commentsReducer from '@frontend/features/community/comments/commentsSlice'
import { likesPersistenceMiddleware } from '@frontend/features/community/likes/likesPersistenceMiddleware'
import { logger } from '../utils/logger'

export const store = configureStore({
  reducer: {
    // homeSlice가 통계 관련 기능을 통합 관리하므로 우선순위
    home: homeReducer,
    auth: authSlice.reducer,
    app: appSlice.reducer,
    stats: statsReducer,
    location: locationReducer,
    posts: postsReducer,
    likes: likesReducer,
    comments: commentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: [
          'auth.user.createdAt', 
          'auth.user.updatedAt', 
          'auth.user.birthDate', 
          'auth.user.lastLoginAt', 
          'auth.user.lastActivityAt',
          'auth.tokenRefreshTimer',
          'app.lastUpdated'
        ],
      },
    }).concat(likesPersistenceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Store 초기화 시 로깅 (개발 환경에서만)
let lastLoggedState: any = null
let lastCommentCountState: any = null
store.subscribe(() => {
  const state = store.getState()
  const currentState = {
    auth: {
      isAuthenticated: state.auth.isAuthenticated,
      isLoading: state.auth.isLoading,
      userId: state.auth.user?.id,
      userEmail: state.auth.user?.email,
    }
  }
  
  // 상태가 실제로 변경된 경우에만 로깅
  if (JSON.stringify(currentState) !== JSON.stringify(lastLoggedState)) {
    logger.debug('REDUX_STORE', 'Store 상태 변화', currentState)
    lastLoggedState = currentState
  }
  
  // 댓글 수 상태 변화 추적
  const commentCountState = state.comments
  if (JSON.stringify(commentCountState) !== JSON.stringify(lastCommentCountState)) {
    console.log('🔥 [Redux Store] comments 상태 변화:', {
      previous: lastCommentCountState,
      current: commentCountState,
      timestamp: new Date().toISOString()
    })
    lastCommentCountState = commentCountState
  }
})
