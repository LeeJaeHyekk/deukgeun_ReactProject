// ============================================================================
// 완전한 Redux Slice: 홈페이지/사용자 통합 데이터 관리
// ============================================================================

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { GlobalApiManager } from "@frontend/shared/api/globalApiManager"
import { logger } from "@frontend/shared/utils/logger"

// -----------------------------------------------------------------------------
// 초기 상태
// -----------------------------------------------------------------------------
interface HomeState {
  userStats: any | null
  platformStats: any | null
  loading: boolean
  error: string | null
  lastFetchedAt: number | null
}

const initialState: HomeState = {
  userStats: null,
  platformStats: null,
  loading: false,
  error: null,
  lastFetchedAt: null,
}

/** 플랫폼 통계 요청 */
export const fetchPlatformStats = createAsyncThunk(
  "home/fetchPlatformStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await GlobalApiManager.request("platform-stats", {
        url: "/api/stats/platform",
        method: "GET",
      })
      return data
    } catch (err: any) {
      logger.error("[fetchPlatformStats] 실패", err.message)
      return rejectWithValue(err.message)
    }
  },
  {
    condition: (_, { getState }) => {
      const { home } = getState() as { home: HomeState }
      if (home.loading || home.platformStats) {
        logger.debug("[fetchPlatformStats] 캐시 존재 → 요청 스킵", "")
        return false
      }
      return true
    },
  }
)

/** 사용자 통계 요청 */
export const fetchUserStats = createAsyncThunk(
  "home/fetchUserStats",
  async (_, { rejectWithValue, getState }) => {
    try {
      // 현재 사용자 ID 가져오기
      const state = getState() as any
      const userId = state.auth?.user?.id ?? 'guest'
      const cacheKey = `user-stats-${userId}`
      
      logger.debug("[fetchUserStats] 사용자 통계 요청", `userId: ${userId}, cacheKey: ${cacheKey}`)
      
      const data = await GlobalApiManager.request(cacheKey, {
        url: "/api/stats/user",
        method: "GET",
      })
      return data
    } catch (err: any) {
      logger.error("[fetchUserStats] 실패", err.message)
      return rejectWithValue(err.message)
    }
  },
  {
    condition: (_, { getState }) => {
      const { home, auth } = getState() as { home: HomeState; auth: any }
      const userId = auth?.user?.id ?? 'guest'
      const isLoggedIn = auth?.isLoggedIn ?? false
      
      // 로그인하지 않은 경우 요청 스킵
      if (!isLoggedIn) {
        logger.debug("[fetchUserStats] 로그인하지 않음 → 요청 스킵", `userId: ${userId}`)
        return false
      }
      
      if (home.loading || home.userStats) {
        logger.debug("[fetchUserStats] 캐시 존재 → 요청 스킵", `userId: ${userId}`)
        return false
      }
      return true
    },
  }
)

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    clearHomeData(state) {
      state.userStats = null
      state.platformStats = null
      state.lastFetchedAt = null
    },
    clearUserStats(state) {
      state.userStats = null
      state.lastFetchedAt = null
      logger.debug("[homeSlice] 사용자 통계 캐시 초기화", "")
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.platformStats = action.payload
        state.loading = false
        state.lastFetchedAt = Date.now()
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload
        state.loading = false
        state.lastFetchedAt = Date.now()
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearHomeData, clearUserStats } = homeSlice.actions
export default homeSlice.reducer
