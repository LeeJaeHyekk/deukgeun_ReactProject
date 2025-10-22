import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { GlobalApiManager } from '../api/globalApiManager'
import { statsApi, PlatformStats, UserStats, DetailedStats } from '../api/statsApi'
import { levelApiWrapper } from '../api/levelApiWrapper'
import { authApi } from '../../features/auth/api/authApi'
import { logger } from '../utils/logger'

// ============================================================================
// 앱 전체 상태 인터페이스
// ============================================================================

interface AppState {
  // 로딩 상태 (분리된 로딩 상태)
  isLoading: boolean
  isInitialized: boolean
  loadingStates: {
    platformStats: boolean
    userStats: boolean
    detailedStats: boolean
  }
  
  // 데이터 상태
  platformStats: PlatformStats | null
  userStats: UserStats | null
  detailedStats: DetailedStats | null
  
  // 에러 상태
  error: string | null
  lastError: string | null
  
  // 캐시 상태
  lastUpdated: number | null
  cacheStatus: {
    platformStats: boolean
    userStats: boolean
    detailedStats: boolean
  }
}

// 초기 상태
const initialState: AppState = {
  isLoading: false,
  isInitialized: false,
  loadingStates: {
    platformStats: false,
    userStats: false,
    detailedStats: false
  },
  platformStats: null,
  userStats: null,
  detailedStats: null,
  error: null,
  lastError: null,
  lastUpdated: null,
  cacheStatus: {
    platformStats: false,
    userStats: false,
    detailedStats: false
  }
}

// ============================================================================
// 비동기 액션들
// ============================================================================

// 플랫폼 통계 조회는 homeSlice.ts로 이동됨

// 사용자 통계 조회 (개선된 버전 - condition으로 dispatch 차단)
export const fetchUserStats = createAsyncThunk(
  'app/fetchUserStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      // 현재 사용자 ID 가져오기
      const state = getState() as any
      const userId = state.auth?.user?.id ?? 'guest'
      const cacheKey = `user-stats-${userId}`
      
      logger.debug('APP', '사용자 통계 조회 시작', { userId, cacheKey })
      
      const stats = await GlobalApiManager.request(
        cacheKey,
        {
          url: '/api/stats/user',
          method: 'GET'
        }
      )
      
      // 응답 검증 강화
      if (!stats || typeof stats !== 'object') {
        throw new Error('유효하지 않은 사용자 통계 응답')
      }
      
      logger.info('APP', '사용자 통계 조회 성공', { stats, userId })
      return stats
    } catch (error) {
      logger.error('APP', '사용자 통계 조회 실패', error)
      return rejectWithValue(error instanceof Error ? error.message : '사용자 통계 조회 실패')
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any
      const userId = state.auth?.user?.id ?? 'guest'
      
      // 이미 로딩 중이면 dispatch 자체를 차단 (rejectWithValue 사용 안함)
      if (state.app.loadingStates.userStats) {
        logger.debug('APP', 'fetchUserStats condition - 이미 로딩 중 -> dispatch 차단', { userId })
        return false
      }
      
      return true
    }
  }
)

// 상세 통계 조회
export const fetchDetailedStats = createAsyncThunk(
  'app/fetchDetailedStats',
  async (_, { rejectWithValue }) => {
    try {
      logger.debug('APP', '상세 통계 조회 시작')
      
      const stats = await GlobalApiManager.request(
        'detailed-stats',
        {
          url: '/api/stats/detailed',
          method: 'GET'
        }
      )
      
      logger.info('APP', '상세 통계 조회 성공', stats)
      return stats
    } catch (error) {
      logger.error('APP', '상세 통계 조회 실패', error)
      return rejectWithValue(error instanceof Error ? error.message : '상세 통계 조회 실패')
    }
  }
)

// 앱 초기화 (수정된 버전 - 강제 리셋 추가)
export const initializeApp = createAsyncThunk(
  'app/initializeApp',
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      logger.info('APP', '앱 초기화 시작')
      
      // 인증 상태 확인
      const state = getState() as any
      const isAuthenticated = state.auth?.isAuthenticated
      
      if (!isAuthenticated) {
        logger.debug('APP', '비로그인 상태 - 사용자 통계 요청 스킵')
        return {
          userStats: null
        }
      }
      
      // 이전 비정상 플래그 초기화 (영구 스킵 방지)
      dispatch(resetUserStats())
      logger.debug('APP', '사용자 통계 상태 초기화 완료')
      
      // 병렬로 모든 데이터 조회 (fetchPlatformStats는 homeSlice로 이동)
      const [userStats] = await Promise.allSettled([
        dispatch(fetchUserStats()).unwrap()
      ])
      
      logger.info('APP', '앱 초기화 완료')
      return {
        userStats: userStats.status === 'fulfilled' ? userStats.value : null
      }
    } catch (error) {
      logger.error('APP', '앱 초기화 실패', error)
      return rejectWithValue(error instanceof Error ? error.message : '앱 초기화 실패')
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any
      // 이미 초기화되었거나 초기화 중이면 dispatch 차단
      if (state.app?.isInitialized || state.app?.isLoading) {
        logger.debug('APP', 'initializeApp condition - 이미 초기화됨 또는 초기화 중 - 스킵')
        return false
      }
      return true
    }
  }
)

// ============================================================================
// 슬라이스 생성
// ============================================================================

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // 에러 상태 초기화
    clearError: (state) => {
      state.error = null
      state.lastError = null
    },
    
    // 캐시 무효화 (개선된 버전)
    invalidateCache: (state, action: PayloadAction<keyof AppState['cacheStatus']>) => {
      const key = action.payload
      state.cacheStatus[key] = false
      
      // 데이터 초기화
      if (key === 'userStats') {
        state.userStats = null
        state.loadingStates.userStats = false
      } else if (key === 'platformStats') {
        state.platformStats = null
        state.loadingStates.platformStats = false
      } else if (key === 'detailedStats') {
        state.detailedStats = null
        state.loadingStates.detailedStats = false
      }
      
      // API 캐시 무효화
      // GlobalApiManager는 캐시 무효화 기능이 없으므로 제거
      logger.info('APP', `캐시 무효화 완료: ${key}`)
    },
    
    // 전체 캐시 무효화
    clearAllCache: (state) => {
      state.cacheStatus = {
        platformStats: false,
        userStats: false,
        detailedStats: false
      }
      // GlobalApiManager는 캐시 클리어 기능이 없으므로 제거
    },
    
    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    // 사용자 통계 리셋
    resetUserStats: (state) => {
      state.userStats = null
      state.loadingStates.userStats = false
      state.cacheStatus.userStats = false
      logger.info('APP', '사용자 통계 리셋 완료')
    }
  },
  extraReducers: (builder) => {
    builder
      // 앱 초기화
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoading = false
        state.isInitialized = true
        state.lastUpdated = Date.now()
        
        // platformStats는 homeSlice에서 관리
        
        if (action.payload.userStats) {
          state.userStats = action.payload.userStats as UserStats
          state.cacheStatus.userStats = true
        }
        
        logger.info('APP', '앱 초기화 완료')
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.lastError = action.payload as string
        logger.error('APP', '앱 초기화 실패', action.payload)
      })

      // 플랫폼 통계는 homeSlice.ts로 이동됨

      // 사용자 통계 (개선된 예외 처리)
      .addCase(fetchUserStats.pending, (state) => {
        state.loadingStates.userStats = true
        state.error = null
        logger.debug('APP', '사용자 통계 조회 시작')
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loadingStates.userStats = false
        
        // 응답 검증 및 안전한 데이터 설정
        if (action.payload !== null && typeof action.payload === 'object') {
          state.userStats = action.payload as UserStats
          state.cacheStatus.userStats = true
          state.lastUpdated = Date.now()
          logger.info('APP', '사용자 통계 업데이트 완료')
        } else {
          logger.warn('APP', '사용자 통계 응답이 유효하지 않음', action.payload)
        }
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loadingStates.userStats = false
        
        // condition으로 차단된 경우는 rejected가 발생하지 않으므로
        // 여기서는 실제 API 실패만 처리
        const payload = action.payload as string | undefined
        if (payload) {
          state.error = payload
          state.lastError = payload
          logger.error('APP', '사용자 통계 조회 실패', payload)
        }
      })

      // 상세 통계
      .addCase(fetchDetailedStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDetailedStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.detailedStats = action.payload as DetailedStats
        state.cacheStatus.detailedStats = true
        state.lastUpdated = Date.now()
        logger.info('APP', '상세 통계 업데이트 완료')
      })
      .addCase(fetchDetailedStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.lastError = action.payload as string
        logger.error('APP', '상세 통계 조회 실패', action.payload)
      })
      
      // 안전 리셋 - 요청이 끝나면 무조건 로딩 상태 false 처리
      .addMatcher(
        (action) => action.type.startsWith('app/fetchUserStats/'),
        (state, action) => {
          // 요청이 끝나면 무조건 false (영구 스킵 방지)
          if (
            action.type.endsWith('/fulfilled') ||
            action.type.endsWith('/rejected')
          ) {
            state.loadingStates.userStats = false
            logger.debug('APP', 'fetchUserStats 안전 리셋 - 로딩 상태 false')
          }
        }
      )
  }
})

export const { clearError, invalidateCache, clearAllCache, setLoading, resetUserStats } = appSlice.actions
export default appSlice
