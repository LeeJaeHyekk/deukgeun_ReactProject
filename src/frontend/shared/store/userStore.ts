import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  name?: string
  nickname: string
  phone?: string
  level: number
  exp: number
  maxExp?: number
  experience?: number
  maxExperience?: number
  isEmailVerified: boolean
  role: "user" | "admin" | "moderator"
  profileImage?: string
  avatar?: string
  bio?: string
  birthDate?: string
  gender?: string
  accessToken?: string
  createdAt: Date
  updatedAt: Date
}

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  updateUser: (userData: Partial<User>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      
      setUser: (user) => set({ user, error: null }),
      
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearUser: () => set({ user: null, error: null }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
