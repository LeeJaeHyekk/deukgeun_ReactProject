import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useRef,
} from "react"
import { useAuth } from "../hooks/useAuth"
import { User } from "../types/common"

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<User>) => void
  checkAuthStatus: () => Promise<boolean>
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()
  const prevContextRef = useRef<AuthContextType | null>(null)

  // useMemo로 context 값 최적화 - 실제 변경사항이 있을 때만 업데이트
  const contextValue = useMemo(() => {
    const newContext = {
      isLoggedIn: auth.isLoggedIn,
      user: auth.user,
      isLoading: auth.isLoading,
      login: auth.login,
      logout: auth.logout,
      updateUser: auth.updateUser,
      checkAuthStatus: auth.checkAuthStatus,
    }

    // 이전 값과 비교하여 실제 변경사항이 있는지 확인
    const prevContext = prevContextRef.current
    if (
      prevContext &&
      prevContext.isLoggedIn === newContext.isLoggedIn &&
      prevContext.isLoading === newContext.isLoading &&
      prevContext.user?.id === newContext.user?.id &&
      prevContext.user?.email === newContext.user?.email
    ) {
      return prevContext
    }

    prevContextRef.current = newContext
    return newContext
  }, [
    auth.isLoggedIn,
    auth.user?.id,
    auth.user?.email,
    auth.isLoading,
    auth.login,
    auth.logout,
    auth.updateUser,
    auth.checkAuthStatus,
  ])

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
