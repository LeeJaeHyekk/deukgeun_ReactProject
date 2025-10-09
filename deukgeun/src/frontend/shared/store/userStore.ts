// Browser API polyfills for Node.js environment
if (typeof window === 'undefined') {
  global.window = global.window || {}
  global.document = global.document || {}
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.File = global.File || class File {}
  global.StorageEvent = global.StorageEvent || class StorageEvent {}
  global.requestAnimationFrame = global.requestAnimationFrame || (cb => setTimeout(cb, 16))
}

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from "../../../shared/types"

interface UserStore {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  clearUser: () => void
  // 선택적: 사용자 정보 업데이트
  updateUser: (updates: Partial<User>) => void
}

// const useUserStore = create<UserStore>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       isLoggedIn: false,
//       setUser: (user: User) => {
//         console.log("🧪 userStore - setUser 호출:", {
//           id: user.id,
//           email: user.email,
//           nickname: user.nickname,
//         });
//         set({ user, isLoggedIn: true });
//         console.log("🧪 userStore - 사용자 설정 완료");
//       },
//       clearUser: () => {
//         console.log("🧪 userStore - clearUser 호출");
//         set({ user: null, isLoggedIn: false });
//         console.log("🧪 userStore - 사용자 클리어 완료");
//       },
//       // 선택적: 사용자 정보 업데이트
//       updateUser: (updates: Partial<User>) => {
//         console.log("🧪 userStore - updateUser 호출:", updates);
//         const currentUser = get().user;
//         if (currentUser) {
//           const updatedUser = { ...currentUser, ...updates };
//           console.log("🧪 userStore - 사용자 업데이트:", {
//             id: updatedUser.id,
//             email: updatedUser.email,
//             nickname: updatedUser.nickname,
//           });
//           set({ user: updatedUser });
//         } else {
//           console.log("🧪 userStore - 업데이트할 사용자가 없음");
//         }
//       },
//     }),
//     {
//       name: "user-storage", // localStorage 키 이름
//       partialize: (state) => {
//         console.log("🧪 userStore - localStorage 저장:", {
//           user: state.user
//             ? { id: state.user.id, email: state.user.email }
//             : null,
//           isLoggedIn: state.isLoggedIn,
//         });
//         return {
//           user: state.user,
//           isLoggedIn: state.isLoggedIn,
//         };
//       }, // 저장할 상태만 선택
//       onRehydrateStorage: () => (state) => {
//         console.log("🧪 userStore - localStorage 복원:", {
//           user: state?.user
//             ? { id: state.user.id, email: state.user.email }
//             : null,
//           isLoggedIn: state?.isLoggedIn,
//         });
//       },
//     }
//   )
// );
const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user: User) => {
        const currentUser = get().user
        // 중복 설정 방지
        if (currentUser && currentUser.id === user.id) {
          return
        }
        set({ user, isLoggedIn: true })
      },
      clearUser: () => {
        set({ user: null, isLoggedIn: false })
      },
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates }
          set({ user: updatedUser })
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage), // ✅ 올바른 storage 설정
      partialize: state => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)

export { useUserStore }