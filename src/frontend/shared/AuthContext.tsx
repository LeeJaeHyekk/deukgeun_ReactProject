// ============================================================================
// Frontend 인증 컨텍스트
// ============================================================================

import React, { createContext, useContext, ReactNode } from "react"
import { useAuth } from "./hooks/useAuth"
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthContextType,
} from "../types/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext는 AuthProvider 내에서 사용되어야 합니다")
  }
  return context
}

// 편의 함수들
export const useIsLoggedIn = (): boolean => {
  const { isLoggedIn } = useAuthContext()
  return isLoggedIn
}

export const useCurrentUser = (): User | null => {
  const { user } = useAuthContext()
  return user
}

export const useAuthActions = () => {
  const { login, register, logout, updateUser } = useAuthContext()
  return { login, register, logout, updateUser }
}
