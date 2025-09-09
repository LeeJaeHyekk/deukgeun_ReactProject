// ============================================================================
// Frontend 사용자 스토어
// ============================================================================

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types/auth"

interface UserState {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      setUser: (user: User | null) => {
        set({
          user,
          isLoggedIn: !!user,
        })
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          })
        }
      },

      clearUser: () => {
        set({
          user: null,
          isLoggedIn: false,
        })
      },
    }),
    {
      name: "user-store",
      partialize: state => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
