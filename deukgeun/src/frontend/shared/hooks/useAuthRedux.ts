import { useCallback, useEffect } from 'react'
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

  // 토큰 자동 갱신 설정 (만료 5분 전)
  const setupTokenRefresh = useCallback(
    (token: string) => {
      // 기존 타이머 정리
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
      }

      const expiryTime = getTokenExpiryTime(token)
      if (expiryTime > 0) {
        const refreshTime = Math.max(expiryTime - 5 * 60 * 1000, 60000) // 최소 1분
        const timer = setTimeout(async () => {
          try {
            logger.debug('AUTH', '토큰 자동 갱신 시작')
            const newToken = await dispatch(refreshToken()).unwrap()
            
            // 새로운 토큰으로 다시 갱신 타이머 설정
            if (newToken) {
              setupTokenRefresh(newToken)
            }
            logger.debug('AUTH', '토큰 자동 갱신 성공')
          } catch (error) {
            logger.error('AUTH', '토큰 자동 갱신 실패', error)
            // 토큰 갱신 실패 시 로그아웃 처리
            dispatch(resetAuth())
            storage.remove("accessToken")
            storage.remove("user")
          }
        }, refreshTime)
        
        dispatch(setTokenRefreshTimer(timer))
        logger.debug('AUTH', '토큰 갱신 타이머 설정', { refreshTime })
      }
    },
    [dispatch] // tokenRefreshTimer 의존성 제거
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

      // 중복 로그인 방지
      if (isAuthenticated && user.id === user?.id) {
        logger.warn('AUTH', '이미 로그인된 사용자입니다.', { userId: user.id })
        return
      }

      logger.debug('AUTH', '로그인 프로세스 시작', {
        userId: user.id,
        userEmail: user.email,
        hasToken: !!token,
        currentIsAuthenticated: isAuthenticated
      })

      // Redux 액션 디스패치
      dispatch(login({ user, token }))
      
      // 토큰 갱신 설정
      setupTokenRefresh(token)
      
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

  // 토큰 갱신 타이머 정리
  useEffect(() => {
    return () => {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
      }
    }
  }, [tokenRefreshTimer])

  // 로그인 상태가 변경될 때 토큰 갱신 설정 (한 번만 실행)
  useEffect(() => {
    if (isAuthenticated && user?.accessToken && !tokenRefreshTimer) {
      setupTokenRefresh(user.accessToken)
    }
  }, [isAuthenticated, user?.accessToken, tokenRefreshTimer, setupTokenRefresh])

  return {
    isLoggedIn: isAuthenticated,
    user,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    checkAuthStatus,
  }
}
