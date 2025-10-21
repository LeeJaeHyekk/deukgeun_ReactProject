import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice.js'
import { logger } from '../utils/logger'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Store 초기화 시 로깅
store.subscribe(() => {
  const state = store.getState()
  logger.debug('REDUX_STORE', 'Store 상태 변화', {
    auth: {
      isAuthenticated: state.auth.isAuthenticated,
      isLoading: state.auth.isLoading,
      userId: state.auth.user?.id,
      userEmail: state.auth.user?.email,
    }
  })
})
