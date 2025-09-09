// ============================================================================
// 전역 상태 관리 스토어
// ============================================================================

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
  role: string
  level: number
  exp: number
}

interface AppState {
  // 사용자 상태
  user: User | null
  isAuthenticated: boolean

  // UI 상태
  isLoading: boolean
  theme: "light" | "dark"
  sidebarOpen: boolean

  // 액션들
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setTheme: (theme: "light" | "dark") => void
  toggleSidebar: () => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        user: null,
        isAuthenticated: false,
        isLoading: false,
        theme: "light",
        sidebarOpen: false,

        // 액션들
        setUser: user =>
          set(
            {
              user,
              isAuthenticated: !!user,
            },
            false,
            "setUser"
          ),

        setLoading: isLoading => set({ isLoading }, false, "setLoading"),

        setTheme: theme => set({ theme }, false, "setTheme"),

        toggleSidebar: () =>
          set(
            state => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            "toggleSidebar"
          ),

        logout: () =>
          set(
            {
              user: null,
              isAuthenticated: false,
            },
            false,
            "logout"
          ),
      }),
      {
        name: "deukgeun-store",
        partialize: state => ({
          user: state.user,
          theme: state.theme,
        }),
      }
    ),
    {
      name: "deukgeun-store",
    }
  )
)
