import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchUserStatsApi, fetchPlatformStatsApi, fetchDetailedStatsApi } from '../utils/api'
import { logger } from '../utils/logger'
import type { RootState } from './index'
import type { UserStats, PlatformStats, DetailedStats } from '../types/stats'

// Stats 상태 인터페이스 (개선된 버전)
interface StatsState {
  // 사용자 통계 상태
  userStats: {
    data: UserStats | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
    lastFetched: number | null
    retries: number
  }
  
  // 플랫폼 통계 상태
  platformStats: {
    data: PlatformStats | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
    lastFetched: number | null
    retries: number
  }
  
  // 상세 통계 상태
  detailedStats: {
    data: DetailedStats | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
    lastFetched: number | null
    retries: number
  }
}

// 초기 상태
const initialState: StatsState = {
  userStats: {
    data: null,
    status: 'idle',
    error: null,
    lastFetched: null,
    retries: 0,
  },
  platformStats: {
    data: null,
    status: 'idle',
    error: null,
    lastFetched: null,
    retries: 0,
  },
  detailedStats: {
    data: null,
    status: 'idle',
    error: null,
    lastFetched: null,
    retries: 0,
  },
}

// ✅ 안전한 사용자 통계 요청 (재시도/스킵 로직 포함)
export const fetchUserStats = createAsyncThunk<
  UserStats,
  void,
  { state: RootState }
>('stats/fetchUserStats', async (_, { getState, rejectWithValue }) => {
  const { stats } = getState()
  const userStatsState = stats.userStats

  // 1분 이내 재요청 방지
  if (userStatsState.lastFetched && Date.now() - userStatsState.lastFetched < 60000) {
    logger.debug('STATS', '사용자 통계 재요청 방지 - 1분 이내 요청')
    return rejectWithValue('skip_request')
  }

  try {
    logger.debug('STATS', '사용자 통계 조회 시작')
    const data = await fetchUserStatsApi()
    logger.info('STATS', '사용자 통계 조회 성공', data)
    return data
  } catch (err: any) {
    logger.error('STATS', '사용자 통계 조회 실패', err)
    if (userStatsState.retries < 2) throw err
    return rejectWithValue(err.message)
  }
})

// ✅ 안전한 플랫폼 통계 요청
export const fetchPlatformStats = createAsyncThunk<
  PlatformStats,
  void,
  { state: RootState }
>('stats/fetchPlatformStats', async (_, { getState, rejectWithValue }) => {
  const { stats } = getState()
  const platformStatsState = stats.platformStats

  // 5분 이내 재요청 방지
  if (platformStatsState.lastFetched && Date.now() - platformStatsState.lastFetched < 300000) {
    logger.debug('STATS', '플랫폼 통계 재요청 방지 - 5분 이내 요청')
    return rejectWithValue('skip_request')
  }

  try {
    logger.debug('STATS', '플랫폼 통계 조회 시작')
    const data = await fetchPlatformStatsApi()
    logger.info('STATS', '플랫폼 통계 조회 성공', data)
    return data
  } catch (err: any) {
    logger.error('STATS', '플랫폼 통계 조회 실패', err)
    if (platformStatsState.retries < 2) throw err
    return rejectWithValue(err.message)
  }
})

// ✅ 안전한 상세 통계 요청
export const fetchDetailedStats = createAsyncThunk<
  DetailedStats,
  void,
  { state: RootState }
>('stats/fetchDetailedStats', async (_, { getState, rejectWithValue }) => {
  const { stats } = getState()
  const detailedStatsState = stats.detailedStats

  // 10분 이내 재요청 방지
  if (detailedStatsState.lastFetched && Date.now() - detailedStatsState.lastFetched < 600000) {
    logger.debug('STATS', '상세 통계 재요청 방지 - 10분 이내 요청')
    return rejectWithValue('skip_request')
  }

  try {
    logger.debug('STATS', '상세 통계 조회 시작')
    const data = await fetchDetailedStatsApi()
    logger.info('STATS', '상세 통계 조회 성공', data)
    return data
  } catch (err: any) {
    logger.error('STATS', '상세 통계 조회 실패', err)
    if (detailedStatsState.retries < 2) throw err
    return rejectWithValue(err.message)
  }
})

// Stats 슬라이스 생성
const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    // 사용자 통계 리셋
    resetUserStats: (state) => {
      state.userStats = {
        data: null,
        status: 'idle',
        error: null,
        lastFetched: null,
        retries: 0,
      }
    },
    // 플랫폼 통계 리셋
    resetPlatformStats: (state) => {
      state.platformStats = {
        data: null,
        status: 'idle',
        error: null,
        lastFetched: null,
        retries: 0,
      }
    },
    // 상세 통계 리셋
    resetDetailedStats: (state) => {
      state.detailedStats = {
        data: null,
        status: 'idle',
        error: null,
        lastFetched: null,
        retries: 0,
      }
    },
    // 전체 통계 리셋
    resetAllStats: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // 사용자 통계
      .addCase(fetchUserStats.pending, (state) => {
        state.userStats.status = 'loading'
        state.userStats.error = null
        logger.debug('STATS', '사용자 통계 조회 시작')
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats.status = 'succeeded'
        state.userStats.data = action.payload
        state.userStats.lastFetched = Date.now()
        state.userStats.retries = 0
        logger.info('STATS', '사용자 통계 업데이트 완료')
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        if (action.payload === 'skip_request') {
          state.userStats.status = 'idle'
          logger.debug('STATS', '사용자 통계 요청 스킵')
          return
        }
        state.userStats.status = 'failed'
        state.userStats.error = action.error.message || null
        state.userStats.retries += 1
        logger.error('STATS', '사용자 통계 조회 실패', action.payload)
      })

      // 플랫폼 통계
      .addCase(fetchPlatformStats.pending, (state) => {
        state.platformStats.status = 'loading'
        state.platformStats.error = null
        logger.debug('STATS', '플랫폼 통계 조회 시작')
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.platformStats.status = 'succeeded'
        state.platformStats.data = action.payload
        state.platformStats.lastFetched = Date.now()
        state.platformStats.retries = 0
        logger.info('STATS', '플랫폼 통계 업데이트 완료')
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        if (action.payload === 'skip_request') {
          state.platformStats.status = 'idle'
          logger.debug('STATS', '플랫폼 통계 요청 스킵')
          return
        }
        state.platformStats.status = 'failed'
        state.platformStats.error = action.error.message || null
        state.platformStats.retries += 1
        logger.error('STATS', '플랫폼 통계 조회 실패', action.payload)
      })

      // 상세 통계
      .addCase(fetchDetailedStats.pending, (state) => {
        state.detailedStats.status = 'loading'
        state.detailedStats.error = null
        logger.debug('STATS', '상세 통계 조회 시작')
      })
      .addCase(fetchDetailedStats.fulfilled, (state, action) => {
        state.detailedStats.status = 'succeeded'
        state.detailedStats.data = action.payload
        state.detailedStats.lastFetched = Date.now()
        state.detailedStats.retries = 0
        logger.info('STATS', '상세 통계 업데이트 완료')
      })
      .addCase(fetchDetailedStats.rejected, (state, action) => {
        if (action.payload === 'skip_request') {
          state.detailedStats.status = 'idle'
          logger.debug('STATS', '상세 통계 요청 스킵')
          return
        }
        state.detailedStats.status = 'failed'
        state.detailedStats.error = action.error.message || null
        state.detailedStats.retries += 1
        logger.error('STATS', '상세 통계 조회 실패', action.payload)
      })
  },
})

export const { 
  resetUserStats, 
  resetPlatformStats, 
  resetDetailedStats, 
  resetAllStats 
} = statsSlice.actions
export default statsSlice.reducer
