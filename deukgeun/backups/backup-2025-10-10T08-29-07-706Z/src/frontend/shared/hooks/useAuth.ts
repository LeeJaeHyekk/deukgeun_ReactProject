// Browser API polyfills for Node.js environment
if (typeof window === 'undefined') {
  global.window = global.window || {}
  global.document = global.document || {}
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.File = global.File || class File {}
  global.StorageEvent = global.StorageEvent || class StorageEvent {}
  global.requestAnimationFrame = global.requestAnimationFrame || (cb => setTimeout(cb, 16))
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { storage } from '../lib'
import { authApi } from '../../features/auth/api/authApi'
import { useUserStore } from '../store/userStore'
import type { 
  User, 
  ApiResponse, 
  ErrorResponse,
  LoginRequest,
  RefreshResponse 
} from "../../../shared/types"

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

// useAuth 훅 반환 타입 정의
interface UseAuthReturn {
  isLoggedIn: boolean
  user: User | null
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<User>) => void
  checkAuthStatus: () => Promise<boolean>
}

function useAuth(): UseAuthReturn {
  const { user, setUser, clearUser } = useUserStore()
  const [isLoading, setIsLoading] = useState(true)
  const isInitialized = useRef(false)
  const tokenRefreshTimer = useRef<NodeJS.Timeout | null>(null)
  const isLoggedIn = !!user

  // API 응답 타입 검증 함수
  const validateRefreshTokenResponse = (response: unknown): RefreshResponse | null => {
    if (
      typeof response === 'object' &&
      response !== null &&
      typeof (response as any).accessToken === 'string'
    ) {
      return response as RefreshResponse
    }
    console.warn("유효하지 않은 토큰 갱신 응답:", response)
    return null
  }

  // 토큰 자동 갱신 설정 (만료 5분 전)
  const setupTokenRefresh = useCallback(
    (token: string) => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current)
      }
      const expiryTime = getTokenExpiryTime(token)
      if (expiryTime > 0) {
        const refreshTime = Math.max(expiryTime - 5 * 60 * 1000, 60000)
        tokenRefreshTimer.current = setTimeout(async () => {
          try {
            const response = await authApi.refreshToken()
            const validatedResponse = validateRefreshTokenResponse(response)
            
            if (validatedResponse?.accessToken) {
              storage.set("accessToken", validatedResponse.accessToken)
              const existingUser = storage.get("user")
              if (existingUser) {
                setUser({ ...existingUser, accessToken: validatedResponse.accessToken })
                setupTokenRefresh(validatedResponse.accessToken)
              }
            } else {
              throw new Error("토큰 갱신 응답이 유효하지 않습니다.")
            }
          } catch (error) {
            console.error("토큰 갱신 실패:", error)
            clearUser()
            storage.remove("accessToken")
          }
        }, refreshTime)
      }
    },
    [setUser, clearUser]
  )

  // 사용자 데이터 타입 검증 함수
  const validateUser = (userData: unknown): User | null => {
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

  // 자동 로그인 체크 (localStorage → refresh token)
  const checkAutoLogin = useCallback(async (): Promise<boolean> => {
    try {
      const token = storage.get("accessToken")
      const storedUser = storage.get("user")

      // 1. localStorage에서 유효한 토큰 확인
      if (token && storedUser && isTokenValid(token)) {
        const validatedUser = validateUser(storedUser)
        if (validatedUser) {
          setUser({ ...validatedUser, accessToken: token })
          setupTokenRefresh(token)
          setIsLoading(false)
          return true
        }
      }

      // 2. refresh token으로 갱신 시도 (최대 1회만)
      if (storedUser) {
        const validatedUser = validateUser(storedUser)
        if (validatedUser) {
          try {
            console.log("🔄 토큰 갱신 시도...")
            const response = await authApi.refreshToken()
            const validatedResponse = validateRefreshTokenResponse(response)
            
            if (validatedResponse?.accessToken) {
              console.log("✅ 토큰 갱신 성공")
              storage.set("accessToken", validatedResponse.accessToken)
              setUser({ ...validatedUser, accessToken: validatedResponse.accessToken })
              setupTokenRefresh(validatedResponse.accessToken)
              setIsLoading(false)
              return true
            }
          } catch (err) {
            console.log("❌ 토큰 갱신 실패, 로그아웃 처리")
            clearUser()
            storage.remove("accessToken")
            storage.remove("user")
          }
        }
      }

      // 3. 자동 로그인 실패
      console.log("❌ 자동 로그인 실패")
      clearUser()
      storage.remove("accessToken")
      storage.remove("user")
      setIsLoading(false)
      return false
    } catch (error) {
      console.error("❌ checkAutoLogin 오류:", error)
      clearUser()
      storage.remove("accessToken")
      storage.remove("user")
      setIsLoading(false)
      return false
    }
  }, [setUser, clearUser, setupTokenRefresh])

  const checkAuthStatus = useCallback((): Promise<boolean> => checkAutoLogin(), [checkAutoLogin])

  // 로그인 처리 (localStorage + Zustand 저장)
  const login = useCallback(
    (user: User, token: string): void => {
      // 입력 데이터 검증
      if (!user || !token) {
        console.error("로그인 데이터가 유효하지 않습니다.")
        return
      }

      // 중복 로그인 방지 - 현재 사용자와 동일한 경우 스킵
      if (isLoggedIn && user.id === user?.id) {
        console.log("이미 로그인된 사용자입니다.")
        return
      }

      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current)
      }
      storage.set("accessToken", token)
      storage.set("user", user)
      setUser({ ...user, accessToken: token })
      setupTokenRefresh(token)
    },
    [setUser, setupTokenRefresh, isLoggedIn]
  )

  // 사용자 정보 업데이트
  const updateUser = useCallback(
    (updatedUser: Partial<User>): void => {
      if (user && updatedUser) {
        const newUser = { ...user, ...updatedUser }
        setUser(newUser)
        storage.set("user", newUser)
      }
    },
    [user, setUser]
  )

  // 로그아웃 처리 (서버 + 클라이언트 정리)
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout()
    } catch (e) {
      // 서버 로그아웃 실패 시에도 클라이언트 정리는 진행
      console.warn("서버 로그아웃 실패:", e)
    } finally {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current)
        tokenRefreshTimer.current = null
      }
      storage.remove("accessToken")
      storage.remove("user")
      clearUser()
      window.location.reload()
    }
  }, [clearUser])

  // 컴포넌트 마운트 시 자동 로그인 체크
  useEffect(() => {
    if (!isInitialized.current) {
      checkAutoLogin().finally(() => {
        isInitialized.current = true
      })
    }
  }, [checkAutoLogin])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current)
      }
    }
  }, [])

  return {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  }
}

export { useAuth }