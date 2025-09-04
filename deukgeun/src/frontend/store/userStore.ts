// 프론트엔드 전용 User Store

import { create } from 'zustand'
import type { User } from '../types/auth/auth.types'

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
