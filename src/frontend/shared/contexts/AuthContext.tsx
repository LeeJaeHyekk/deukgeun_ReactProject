// ============================================================================
// 인증 컨텍스트
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import type { User } from "../../types/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user
  const isLoggedIn = !!user

  useEffect(() => {
    // 토큰 확인 및 사용자 정보 로드
    const token = localStorage.getItem("accessToken")
    if (token) {
      // 토큰이 있으면 사용자 정보 로드
      loadUserFromToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUserFromToken = async (token: string) => {
    try {
      // 토큰에서 사용자 정보 추출 또는 API 호출
      // 실제 구현에서는 JWT 토큰을 디코딩하거나 API를 호출해야 함
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load user from token:", error)
      localStorage.removeItem("accessToken")
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      // 실제 로그인 API 호출
      // const response = await authApi.login(email, password)
      // setUser(response.user)
      // localStorage.setItem("accessToken", response.token)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("accessToken")
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      // 실제 회원가입 API 호출
      // const response = await authApi.register(email, password, name)
      // setUser(response.user)
      // localStorage.setItem("accessToken", response.token)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoggedIn,
    isLoading,
    login,
    logout,
    register,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
