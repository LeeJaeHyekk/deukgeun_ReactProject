import { useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { 
  login, 
  updateUser, 
  setLoading, 
  setError, 
  setTokenRefreshTimer,
  clearTokenRefreshTimer,
  resetAuth,
  refreshToken,
  logout as logoutAction
} from '../store/authSlice'
import { initializeAuth } from '../store/authInitializer'
import { logger } from '../utils/logger'
import { storage } from '../lib'
import type { User } from '../../../shared/types'

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

// useAuth 훅 반환 타입 정의
interface UseAuthReturn {
  isLoggedIn: boolean
  user: User | null
  isLoading: boolean
  error: string | null
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<User>) => void
  checkAuthStatus: () => Promise<boolean>
}

export function useAuthRedux(): UseAuthReturn {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, isLoading, error, tokenRefreshTimer } = useAppSelector((state: any) => state.auth)

  // 로그인 상태를 더 정확하게 판단 (Boolean으로 명시적 변환)
  // && 연산자가 토큰 문자열을 반환하는 것을 방지하기 위해 !! 사용
  const isLoggedIn = !!(isAuthenticated && user && user.id && user.accessToken)
  
  // 이전 상태 추적을 위한 ref (렌더링 최적화)
  const prevIsLoggedInRef = useRef<boolean | null>(null)
  const prevUserIdRef = useRef<number | undefined>(undefined)
  const prevTokenRef = useRef<string | undefined>(undefined)
  const tokenRefreshSetupRef = useRef<boolean>(false)
  
  // 로그인 상태 변경 감지 및 로깅 (렌더링 최적화)
  // 실제 상태 변경이 있을 때만 처리하도록 개선
  useEffect(() => {
    const currentUserId = user?.id
    const currentToken = user?.accessToken
    const currentIsLoggedIn = isLoggedIn
    
    const prevUserId = prevUserIdRef.current
    const prevToken = prevTokenRef.current
    const prevIsLoggedIn = prevIsLoggedInRef.current
    
    // 실제 변경 여부 확인 (엄격한 비교)
    const hasLoggedInChanged = prevIsLoggedIn !== currentIsLoggedIn
    const hasUserIdChanged = prevUserId !== currentUserId
    const hasTokenChanged = prevToken !== currentToken
    
    // 실제로 변경된 경우에만 처리
    if (hasLoggedInChanged || hasUserIdChanged || hasTokenChanged) {
      // 상태 업데이트 (다음 비교를 위해)
      prevIsLoggedInRef.current = currentIsLoggedIn
      prevUserIdRef.current = currentUserId
      prevTokenRef.current = currentToken
      
      // 로그인 상태가 실제로 변경될 때만 로그 출력 (중복 방지)
      if (process.env.NODE_ENV === 'development' && (hasLoggedInChanged || hasUserIdChanged)) {
        logger.debug('AUTH', '로그인 상태 변경', {
          isAuthenticated,
          hasUser: !!user,
          hasUserId: !!currentUserId,
          hasUserAccessToken: !!currentToken,
          isLoggedIn: currentIsLoggedIn,
          userIdChanged: hasUserIdChanged,
          loggedInChanged: hasLoggedInChanged,
          tokenChanged: hasTokenChanged
        })
      }
    }
  }, [isAuthenticated, user?.id, user?.accessToken, isLoggedIn, user])

  // 리프레시 토큰 만료 체크 (주기적으로 확인)
  const refreshTokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 토큰 자동 갱신 설정 (만료 5분 전) - 중복 설정 방지
  const setupTokenRefresh = useCallback(
    (token: string, force: boolean = false) => {
      // 중복 설정 방지 (force가 true인 경우에만 강제 설정)
      if (!force && tokenRefreshSetupRef.current) {
        logger.debug('AUTH', '토큰 갱신 타이머 이미 설정됨 - 스킵', { hasTimer: !!tokenRefreshTimer })
        return
      }
      
      // 기존 타이머 정리
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
        logger.debug('AUTH', '기존 토큰 갱신 타이머 정리')
      }

      const expiryTime = getTokenExpiryTime(token)
      if (expiryTime > 0) {
        const refreshTime = Math.max(expiryTime - 5 * 60 * 1000, 60000) // 최소 1분
        const timer = setTimeout(async () => {
          try {
            // 타이머 실행 후 즉시 ref 초기화 (다음 설정을 위해)
            tokenRefreshSetupRef.current = false
            
            logger.debug('AUTH', '토큰 자동 갱신 시작')
            const newToken = await dispatch(refreshToken()).unwrap()
            
            // 새로운 토큰으로 다시 갱신 타이머 설정
            if (newToken) {
              setupTokenRefresh(newToken, true) // force=true로 재설정
            }
            logger.debug('AUTH', '토큰 자동 갱신 성공')
          } catch (error: any) {
            logger.error('AUTH', '토큰 자동 갱신 실패', error)
            tokenRefreshSetupRef.current = false
            
            // 리프레시 토큰 만료 에러 확인
            const errorMessage = error?.message || ''
            const errorData = error?.response?.data || {}
            const isRefreshTokenExpired = 
              errorData?.error === 'REFRESH_TOKEN_EXPIRED' ||
              errorMessage.includes('Refresh token이 만료') ||
              errorMessage.includes('REFRESH_TOKEN_EXPIRED')
            
            if (isRefreshTokenExpired) {
              logger.warn('AUTH', '리프레시 토큰 만료 - 자동 로그아웃 처리')
              // 리프레시 토큰 만료 시 자동 로그아웃
              dispatch(resetAuth())
              storage.remove("accessToken")
              storage.remove("user")
              
              // 로그아웃 액션 호출하여 서버에도 알림
              dispatch(logoutAction()).catch((logoutError) => {
                logger.error('AUTH', '서버 로그아웃 실패', logoutError)
              })
              
              // 로그인 페이지로 리다이렉트
              if (typeof window !== 'undefined') {
                window.location.href = '/login'
              }
            } else {
              // 일반 토큰 갱신 실패 시 로그아웃 처리
              dispatch(resetAuth())
              storage.remove("accessToken")
              storage.remove("user")
            }
          }
        }, refreshTime)
        
        dispatch(setTokenRefreshTimer(timer))
        tokenRefreshSetupRef.current = true
        logger.debug('AUTH', '토큰 갱신 타이머 설정', { refreshTime })
      }
    },
    [dispatch, tokenRefreshTimer, logoutAction] // tokenRefreshTimer 의존성 추가 (최신 타이머 참조)
  )

  // 로그인 처리
  const handleLogin = useCallback(
    (user: User, token: string): void => {
      logger.info('AUTH', 'useAuthRedux login 함수 호출됨', { userId: user.id, hasToken: !!token })
      
      // 입력 데이터 검증
      if (!user || !token) {
        logger.error('AUTH', '로그인 데이터가 유효하지 않습니다.', { user: !!user, token: !!token })
        dispatch(setError('로그인 데이터가 유효하지 않습니다.'))
        return
      }

      // 중복 로그인 방지 (현재 사용자와 동일한 경우)
      if (isAuthenticated && user.id === user?.id && user.accessToken === token) {
        logger.debug('AUTH', '이미 로그인된 동일 사용자 - 스킵', { userId: user.id })
        return
      }
      
      // 토큰이 변경된 경우에만 갱신 타이머 재설정
      if (tokenRefreshSetupRef.current && user.accessToken === token) {
        logger.debug('AUTH', '동일 토큰 - 갱신 타이머 유지', { userId: user.id })
      }

      logger.debug('AUTH', '로그인 프로세스 시작', {
        userId: user.id,
        userEmail: user.email,
        hasToken: !!token,
        currentIsAuthenticated: isAuthenticated
      })

      // Redux 액션 디스패치
      dispatch(login({ user, token }))
      
      // 토큰 갱신 설정 (force=true로 초기 설정)
      // 토큰이 변경된 경우에만 설정
      if (!tokenRefreshSetupRef.current || user?.accessToken !== token) {
        setupTokenRefresh(token, true)
      }
      
      logger.info('AUTH', '로그인 완료', { 
        userId: user.id, 
        isAuthenticated: true,
        userEmail: user.email
      })
    },
    [dispatch, isAuthenticated, setupTokenRefresh]
  )

  // 사용자 정보 업데이트
  const handleUpdateUser = useCallback(
    (updatedUser: Partial<User>): void => {
      if (user && updatedUser) {
        dispatch(updateUser(updatedUser))
        logger.debug('AUTH', '사용자 정보 업데이트', { userId: user.id })
      }
    },
    [dispatch, user]
  )

  // 로그아웃 처리
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      logger.info('AUTH', '로그아웃 시작')
      await dispatch(logoutAction()).unwrap()
      dispatch(clearTokenRefreshTimer())
      logger.info('AUTH', '로그아웃 완료')
    } catch (error) {
      logger.error('AUTH', '로그아웃 실패', error)
      // 서버 로그아웃 실패 시에도 클라이언트 상태는 정리
      dispatch(resetAuth())
      dispatch(clearTokenRefreshTimer())
    }
  }, [dispatch])

  // 인증 상태 체크 (중앙 집중식 초기화 사용)
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    // 이미 초기화된 상태에서 현재 인증 상태만 확인
    return isAuthenticated
  }, [isAuthenticated])

  // 인증 초기화는 App.tsx에서 중앙 집중식으로 처리
  // 여기서는 추가 초기화 없음

  // 토큰 갱신 타이머 정리 (렌더링 최적화)
  useEffect(() => {
    return () => {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
        tokenRefreshSetupRef.current = false
      }
    }
  }, [tokenRefreshTimer])

  // 로그인 상태가 변경될 때 토큰 갱신 설정 (한 번만 실행 - 렌더링 최적화)
  useEffect(() => {
    // 토큰이 변경되었거나 처음 로그인한 경우에만 설정
    const currentToken = user?.accessToken
    const prevToken = prevTokenRef.current
    
    // 실제 토큰 변경 여부 확인 (엄격한 비교)
    const tokenChanged = currentToken !== prevToken
    const shouldSetup = isAuthenticated && 
                       currentToken && 
                       !tokenRefreshSetupRef.current &&
                       tokenChanged
    
    if (shouldSetup) {
      setupTokenRefresh(currentToken, true) // force=true로 초기 설정
      prevTokenRef.current = currentToken
    }
  }, [isAuthenticated, user?.accessToken, setupTokenRefresh])
  
  // 로그아웃 시 토큰 갱신 타이머 정리
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
        dispatch(clearTokenRefreshTimer())
      }
      // 리프레시 토큰 만료 체크 인터벌 정리
      if (refreshTokenCheckIntervalRef.current) {
        clearInterval(refreshTokenCheckIntervalRef.current)
        refreshTokenCheckIntervalRef.current = null
      }
      tokenRefreshSetupRef.current = false
      prevTokenRef.current = undefined
    }
  }, [isAuthenticated, user, tokenRefreshTimer, dispatch])

  // 리프레시 토큰 만료 주기적 체크 (1시간마다)
  useEffect(() => {
    if (isAuthenticated && user) {
      // 기존 인터벌 정리
      if (refreshTokenCheckIntervalRef.current) {
        clearInterval(refreshTokenCheckIntervalRef.current)
      }
      
      // 리프레시 토큰 만료 체크 함수
      const checkRefreshTokenExpiry = async () => {
        try {
          logger.debug('AUTH', '리프레시 토큰 만료 체크 시작')
          // 리프레시 토큰 유효성 확인을 위해 갱신 시도
          const newToken = await dispatch(refreshToken()).unwrap()
          
          if (newToken) {
            logger.debug('AUTH', '리프레시 토큰 유효 - 갱신 성공')
            // 새로운 액세스 토큰으로 갱신 타이머 재설정
            setupTokenRefresh(newToken, true)
          }
        } catch (error: any) {
          logger.error('AUTH', '리프레시 토큰 만료 체크 실패', error)
          
          // 리프레시 토큰 만료 에러 확인
          const errorMessage = error?.message || ''
          const errorData = error?.response?.data || {}
          const isRefreshTokenExpired = 
            errorData?.error === 'REFRESH_TOKEN_EXPIRED' ||
            errorMessage.includes('Refresh token이 만료') ||
            errorMessage.includes('REFRESH_TOKEN_EXPIRED')
          
          if (isRefreshTokenExpired) {
            logger.warn('AUTH', '리프레시 토큰 만료 - 자동 로그아웃 처리')
            // 리프레시 토큰 만료 시 자동 로그아웃
            dispatch(resetAuth())
            storage.remove("accessToken")
            storage.remove("user")
            
            // 로그아웃 액션 호출하여 서버에도 알림
            dispatch(logoutAction()).catch((logoutError) => {
              logger.error('AUTH', '서버 로그아웃 실패', logoutError)
            })
            
            // 로그인 페이지로 리다이렉트
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
          }
        }
      }
      
      // 1시간마다 리프레시 토큰 만료 체크
      refreshTokenCheckIntervalRef.current = setInterval(() => {
        checkRefreshTokenExpiry()
      }, 60 * 60 * 1000) // 1시간
      
      logger.debug('AUTH', '리프레시 토큰 만료 체크 인터벌 설정 (1시간)')
      
      return () => {
        if (refreshTokenCheckIntervalRef.current) {
          clearInterval(refreshTokenCheckIntervalRef.current)
          refreshTokenCheckIntervalRef.current = null
        }
      }
    } else {
      // 로그아웃 시 인터벌 정리
      if (refreshTokenCheckIntervalRef.current) {
        clearInterval(refreshTokenCheckIntervalRef.current)
        refreshTokenCheckIntervalRef.current = null
      }
    }
  }, [isAuthenticated, user, dispatch, setupTokenRefresh, logoutAction])

  // localStorage와 Redux 상태 동기화 체크 (렌더링 최적화)
  // 이전 상태 추적을 통한 불필요한 실행 방지
  const prevAuthStateRef = useRef<{ isAuthenticated: boolean; isLoading: boolean }>({
    isAuthenticated: false,
    isLoading: true
  })
  
  useEffect(() => {
    const prevState = prevAuthStateRef.current
    const currentState = { isAuthenticated, isLoading }
    
    // 실제 상태 변경이 있을 때만 체크
    const stateChanged = prevState.isAuthenticated !== currentState.isAuthenticated ||
                         prevState.isLoading !== currentState.isLoading
    
    if (!stateChanged) {
      return
    }
    
    // 상태 업데이트
    prevAuthStateRef.current = currentState
    
    const checkStorageSync = () => {
      const storedToken = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')
      
      // localStorage에 데이터가 없는데 Redux에는 있는 경우 (비정상 상태)
      if (!storedToken && !storedUser && isAuthenticated) {
        logger.warn('AUTH', 'localStorage와 Redux 상태 불일치 감지 - Redux 상태 초기화')
        dispatch(resetAuth())
      }
      
      // localStorage에 데이터가 있는데 Redux에는 없는 경우 (페이지 새로고침 등)
      if ((storedToken || storedUser) && !isAuthenticated && !isLoading) {
        logger.info('AUTH', 'localStorage 데이터 감지 - 인증 상태 재확인 필요')
        // 이 경우는 App.tsx의 initializeAuth에서 처리됨
      }
    }

    checkStorageSync()
  }, [isAuthenticated, isLoading, dispatch])

  return {
    isLoggedIn,
    user,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    checkAuthStatus,
  }
}
