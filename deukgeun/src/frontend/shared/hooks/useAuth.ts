import { useCallback, useEffect, useRef, useState } from "react"
import { storage } from "../lib"
import { authApi } from "../../features/auth/api/authApi"
import { useUserStore } from "../store/userStore"
import { User } from "@shared/types/user"

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

export function useAuth() {
  const { user, setUser, clearUser } = useUserStore()
  const [isLoading, setIsLoading] = useState(true)
  const isInitialized = useRef(false)
  const tokenRefreshTimer = useRef<NodeJS.Timeout | null>(null)
  const isLoggedIn = !!user

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
            if (response?.accessToken) {
              storage.set("accessToken", response.accessToken)
              const existingUser = storage.get("user")
              if (existingUser) {
                setUser({ ...existingUser, accessToken: response.accessToken })
                setupTokenRefresh(response.accessToken)
              }
            }
          } catch (error) {
            clearUser()
            storage.remove("accessToken")
          }
        }, refreshTime)
      }
    },
    [setUser, clearUser]
  )

  // 자동 로그인 체크 (localStorage → refresh token)
  const checkAutoLogin = useCallback(async () => {
    try {
      const token = storage.get("accessToken")
      const storedUser = storage.get("user")

      // 1. localStorage에서 유효한 토큰 확인
      if (token && storedUser && isTokenValid(token)) {
        setUser({ ...storedUser, accessToken: token })
        setupTokenRefresh(token)
        setIsLoading(false)
        return true
      }

      // 2. refresh token으로 갱신 시도
      if (storedUser) {
        try {
          const response = await authApi.refreshToken()
          if (response?.accessToken) {
            storage.set("accessToken", response.accessToken)
            setUser({ ...storedUser, accessToken: response.accessToken })
            setupTokenRefresh(response.accessToken)
            setIsLoading(false)
            return true
          }
        } catch (err) {
          clearUser()
          storage.remove("accessToken")
        }
      }

      // 3. 자동 로그인 실패
      clearUser()
      setIsLoading(false)
      return false
    } catch (error) {
      clearUser()
      setIsLoading(false)
      return false
    }
  }, [setUser, clearUser, setupTokenRefresh])

  const checkAuthStatus = useCallback(() => checkAutoLogin(), [checkAutoLogin])

  // 로그인 처리 (localStorage + Zustand 저장)
  const login = useCallback(
    (user: User, token: string) => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current)
      }
      storage.set("accessToken", token)
      storage.set("user", user)
      setUser({ ...user, accessToken: token })
      setupTokenRefresh(token)
    },
    [setUser, setupTokenRefresh]
  )

  // 로그아웃 처리 (서버 + 클라이언트 정리)
  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (e) {
      // 서버 로그아웃 실패 시에도 클라이언트 정리는 진행
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
    checkAuthStatus,
  }
}
