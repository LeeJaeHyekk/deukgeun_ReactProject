import { useState, useCallback } from "react"
import { useAuthContext } from "../contexts/AuthContext"
import type { User, LoginRequest, RegisterRequest } from "../types/auth/auth.types"

// API 응답 타입
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 로그인 응답 타입
interface LoginApiResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// 회원가입 응답 타입
interface RegisterApiResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// 토큰 갱신 응답 타입
interface RefreshApiResponse {
  accessToken: string
  refreshToken: string
}

export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 로그인
  const signIn = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const result: ApiResponse<LoginApiResponse> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "로그인에 실패했습니다.")
      }

      if (result.data) {
        login(result.data.user, result.data.accessToken)
        return true
      }

      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다."
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [login])

  // 회원가입
  const signUp = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result: ApiResponse<RegisterApiResponse> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "회원가입에 실패했습니다.")
      }

      if (result.data) {
        login(result.data.user, result.data.accessToken)
        return true
      }

      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다."
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [login])

  // 로그아웃
  const signOut = useCallback(async (): Promise<void> => {
    try {
      if (user?.accessToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
        })
      }
    } catch (err) {
      console.error("Logout API call failed:", err)
    } finally {
      logout()
    }
  }, [user?.accessToken, logout])

  // 토큰 갱신
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) {
        return false
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      const result: ApiResponse<RefreshApiResponse> = await response.json()

      if (!response.ok || !result.success || !result.data) {
        return false
      }

      // 새로운 토큰으로 사용자 정보 업데이트
      if (user) {
        updateUser({ ...user })
        localStorage.setItem("accessToken", result.data.accessToken)
        localStorage.setItem("refreshToken", result.data.refreshToken)
      }

      return true
    } catch (err) {
      console.error("Token refresh failed:", err)
      return false
    }
  }, [user, updateUser])

  // 에러 클리어
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshToken,
    updateUser,
    clearError,
  }
}
