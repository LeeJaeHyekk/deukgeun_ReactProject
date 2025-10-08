const { create  } = require('zustand')
const { persist  } = require('zustand/middleware')
const { User  } = require('@shared/types/dto/user.dto')

interface UserState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  updateUser: (userData: Partial<User>) => void
  clearUser: () => void
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: user => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      updateUser: userData => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'user-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
