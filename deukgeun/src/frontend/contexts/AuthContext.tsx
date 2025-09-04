"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
import type {
  AuthContextType,
  AuthState,
  User,
  AuthUser,
} from "../types/auth/auth.types"

// 초기 상태
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// 액션 타입
type AuthAction =
  | { type: "LOGIN"; payload: { user: User; accessToken: string } }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" }

// 리듀서
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: {
          ...action.payload.user,
          accessToken: action.payload.accessToken,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 프로바이더 컴포넌트
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // 로그인
  const login = (user: User, accessToken: string) => {
    dispatch({ type: "LOGIN", payload: { user, accessToken } })
    // 로컬 스토리지에 저장
    localStorage.setItem("user", JSON.stringify({ ...user, accessToken }))
    localStorage.setItem("accessToken", accessToken)
  }

  // 로그아웃
  const logout = () => {
    dispatch({ type: "LOGOUT" })
    // 로컬 스토리지 정리
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
  }

  // 사용자 정보 업데이트
  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: userData })
  }

  // 에러 클리어
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  // 초기 로드 시 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("accessToken")

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser) as AuthUser
        dispatch({
          type: "LOGIN",
          payload: { user: userData, accessToken: storedToken },
        })
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 훅
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
