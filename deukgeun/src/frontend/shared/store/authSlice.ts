import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { User } from '../../../shared/types'
import { authApi } from '../../features/auth/api/authApi'
import { storage } from '../lib'
import { logger } from '../utils/logger'

// JWT 토큰 유효성 검사
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch {
    return false
  }
}

// 토큰 만료 시간까지 남은 시간 계산 (밀리초)
function getTokenExpiryTime(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    return (payload.exp - currentTime) * 1000
  } catch {
    return 0
  }
}

// API 응답 타입 검증 함수
function validateRefreshTokenResponse(response: unknown): { accessToken: string } | null {
  if (
    typeof response === 'object' &&
    response !== null &&
    typeof (response as any).accessToken === 'string'
  ) {
    return response as { accessToken: string }
  }
  console.warn("유효하지 않은 토큰 갱신 응답:", response)
  return null
}

// 사용자 데이터 타입 검증 함수
function validateUser(userData: unknown): User | null {
  if (
    typeof userData === 'object' &&
    userData !== null &&
    typeof (userData as any).id === 'number' &&
    typeof (userData as any).email === 'string'
  ) {
    return userData as User
  }
  console.warn("유효하지 않은 사용자 데이터:", userData)
  return null
}

// 인증 상태 인터페이스
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string | null
  tokenRefreshTimer: NodeJS.Timeout | null
}

// 초기 상태
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  tokenRefreshTimer: null,
}

// 자동 로그인 체크 액션
export const checkAutoLogin = createAsyncThunk(
  'auth/checkAutoLogin',
  async (_, { rejectWithValue }) => {
    try {
      logger.debug('AUTH', '자동 로그인 체크 시작')
      
      const token = storage.get("accessToken")
      const storedUser = storage.get("user")

      logger.debug('AUTH', '저장된 토큰 상태', {
        hasToken: !!token,
        hasUser: !!storedUser,
        tokenValid: token ? isTokenValid(token) : false,
      })

      // 1. localStorage에서 유효한 토큰 확인
      if (token && storedUser && isTokenValid(token)) {
        const validatedUser = validateUser(storedUser)
        if (validatedUser) {
          const userWithToken = { ...validatedUser, accessToken: token }
          logger.debug('AUTH', '유효한 토큰으로 자동 로그인 성공')
          return { user: userWithToken, token }
        }
      }

      // 2. refresh token으로 갱신 시도
      if (storedUser) {
        const validatedUser = validateUser(storedUser)
        if (validatedUser) {
          try {
            logger.debug('AUTH', '토큰 갱신 시도')
            const response = await authApi.refreshToken()
            const validatedResponse = validateRefreshTokenResponse(response)
            
            if (validatedResponse?.accessToken) {
              storage.set("accessToken", validatedResponse.accessToken)
              const userWithToken = { ...validatedUser, accessToken: validatedResponse.accessToken }
              logger.debug('AUTH', '토큰 갱신 성공')
              return { user: userWithToken, token: validatedResponse.accessToken }
            }
          } catch (err) {
            logger.error('AUTH', '토큰 갱신 실패', err)
            storage.remove("accessToken")
            storage.remove("user")
            throw err
          }
        }
      }

      // 3. 자동 로그인 실패
      logger.debug('AUTH', '자동 로그인 실패')
      storage.remove("accessToken")
      storage.remove("user")
      return { user: null, token: null }
    } catch (error) {
      logger.error('AUTH', 'checkAutoLogin 오류', error)
      storage.remove("accessToken")
      storage.remove("user")
      return rejectWithValue(error instanceof Error ? error.message : '자동 로그인 실패')
    }
  }
)

// 토큰 갱신 액션
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState }
      
      // 이미 로그인되지 않은 상태라면 갱신하지 않음
      if (!state.auth.isAuthenticated || !state.auth.user) {
        throw new Error("로그인되지 않은 상태에서는 토큰을 갱신할 수 없습니다.")
      }

      logger.debug('AUTH', '토큰 갱신 시작')
      const response = await authApi.refreshToken()
      const validatedResponse = validateRefreshTokenResponse(response)
      
      if (validatedResponse?.accessToken) {
        storage.set("accessToken", validatedResponse.accessToken)
        logger.debug('AUTH', '토큰 갱신 성공')
        return validatedResponse.accessToken
      } else {
        throw new Error("토큰 갱신 응답이 유효하지 않습니다.")
      }
    } catch (error) {
      logger.error('AUTH', '토큰 갱신 실패', error)
      return rejectWithValue(error instanceof Error ? error.message : '토큰 갱신 실패')
    }
  }
)

// 로그아웃 액션
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
    } catch (error) {
      logger.warn('AUTH', '서버 로그아웃 실패', error)
    } finally {
      storage.remove("accessToken")
      storage.remove("user")
    }
  }
)

// 인증 슬라이스 생성
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그인 처리
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload
      
      logger.debug('AUTH', '로그인 처리 시작', {
        userId: user.id,
        userEmail: user.email,
        hasToken: !!token
      })

      // 중복 로그인 방지 - 같은 사용자로 이미 로그인된 경우
      if (state.isAuthenticated && state.user?.id === user.id) {
        logger.warn('AUTH', '이미 로그인된 사용자입니다.', { userId: user.id })
        return
      }

      // Date 객체를 직렬화 안전하게 변환
      const sanitizedUser = {
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt),
      }

      // 사용자 데이터와 토큰 저장
      storage.set("accessToken", token)
      storage.set("user", sanitizedUser)
      
      const userWithToken = { ...sanitizedUser, accessToken: token }
      state.isAuthenticated = true
      state.user = userWithToken
      state.isLoading = false
      state.error = null

      logger.info('AUTH', '로그인 완료', {
        userId: userWithToken.id,
        userEmail: userWithToken.email,
        isAuthenticated: true
      })
    },

    // 사용자 정보 업데이트
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload }
        state.user = updatedUser
        storage.set("user", updatedUser)
        logger.debug('AUTH', '사용자 정보 업데이트', { userId: updatedUser.id })
      }
    },

    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // 에러 상태 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    // 토큰 갱신 타이머 설정
    setTokenRefreshTimer: (state, action: PayloadAction<NodeJS.Timeout | null>) => {
      if (state.tokenRefreshTimer) {
        clearTimeout(state.tokenRefreshTimer)
      }
      state.tokenRefreshTimer = action.payload
    },

    // 토큰 갱신 타이머 정리
    clearTokenRefreshTimer: (state) => {
      if (state.tokenRefreshTimer) {
        clearTimeout(state.tokenRefreshTimer)
        state.tokenRefreshTimer = null
      }
    },

    // 상태 초기화
    resetAuth: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.isLoading = false
      state.error = null
      if (state.tokenRefreshTimer) {
        clearTimeout(state.tokenRefreshTimer)
        state.tokenRefreshTimer = null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 자동 로그인 체크
      .addCase(checkAutoLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkAutoLogin.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.user && action.payload.token) {
          state.isAuthenticated = true
          state.user = action.payload.user
          logger.info('AUTH', '자동 로그인 성공', {
            userId: action.payload.user.id,
            userEmail: action.payload.user.email
          })
        } else {
          state.isAuthenticated = false
          state.user = null
          logger.debug('AUTH', '자동 로그인 실패 - 저장된 인증 정보 없음')
        }
      })
      .addCase(checkAutoLogin.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload as string
        logger.error('AUTH', '자동 로그인 실패', action.payload)
      })

      // 토큰 갱신
      .addCase(refreshToken.fulfilled, (state, action) => {
        if (state.user) {
          const updatedUser = { ...state.user, accessToken: action.payload }
          state.user = updatedUser
          storage.set("user", updatedUser)
          logger.debug('AUTH', '토큰 갱신 성공')
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        // 토큰 갱신 실패 시 상태 정리
        state.isAuthenticated = false
        state.user = null
        state.isLoading = false
        state.error = action.payload as string
        
        // 타이머 정리
        if (state.tokenRefreshTimer) {
          clearTimeout(state.tokenRefreshTimer)
          state.tokenRefreshTimer = null
        }
        
        // 로컬 스토리지 정리
        storage.remove("accessToken")
        storage.remove("user")
        
        logger.error('AUTH', '토큰 갱신 실패', action.payload)
      })

      // 로그아웃
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.isLoading = false
        state.error = null
        if (state.tokenRefreshTimer) {
          clearTimeout(state.tokenRefreshTimer)
          state.tokenRefreshTimer = null
        }
        logger.info('AUTH', '로그아웃 완료')
      })
      .addCase(logout.rejected, (state, action) => {
        // 로그아웃 실패 시에도 클라이언트 상태는 정리
        state.isAuthenticated = false
        state.user = null
        state.isLoading = false
        state.error = action.payload as string
        logger.error('AUTH', '로그아웃 실패', action.payload)
      })
  }
})

export const {
  login,
  updateUser,
  setLoading,
  setError,
  setTokenRefreshTimer,
  clearTokenRefreshTimer,
  resetAuth
} = authSlice.actions

export default authSlice
