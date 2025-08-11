import React, { createContext, useContext, ReactNode } from "react"
import { useAuth } from "../hooks/useAuth"
import { User } from "../../../types"

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<boolean>
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  console.log("🧪 AuthProvider 렌더링 시작")

  const auth = useAuth()

  // 🧪 디버깅용 로그 (기존 코드에 영향 없음)
  console.log("🧪 AuthProvider 렌더링")
  console.log("🧪 로그인 여부:", auth.isLoggedIn)
  console.log(
    "🧪 현재 유저:",
    auth.user
      ? {
          id: auth.user.id,
          email: auth.user.email,
          nickname: auth.user.nickname,
        }
      : null
  )
  console.log("🧪 로딩 상태:", auth.isLoading)
  console.log("🧪 AuthProvider Context 값:", {
    isLoggedIn: auth.isLoggedIn,
    user: auth.user ? { id: auth.user.id, email: auth.user.email } : null,
    isLoading: auth.isLoading,
    hasLogin: !!auth.login,
    hasLogout: !!auth.logout,
    hasCheckAuthStatus: !!auth.checkAuthStatus,
  })

  console.log("🧪 AuthProvider 렌더링 완료")

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  console.log("🧪 useAuthContext 호출")

  const context = useContext(AuthContext)
  if (!context) {
    console.error("❌ useAuthContext must be used within an AuthProvider")
    throw new Error("useAuthContext must be used within an AuthProvider")
  }

  console.log("🧪 useAuthContext 반환:", {
    isLoggedIn: context.isLoggedIn,
    user: context.user
      ? { id: context.user.id, email: context.user.email }
      : null,
    isLoading: context.isLoading,
  })

  return context
}

// interface User {
//   id: number;
//   email: string;
//   nickname: string;
//   accessToken: string;
// }

// interface UserStore {
//   user: User | null;
//   isLoggedIn: boolean;
//   setUser: (user: User) => void;
//   clearUser: () => void;
// }

// interface AuthContextType {
//   isLoggedIn: boolean;
//   user: User | null;
//   isLoading: boolean;
//   login: (user: User, token: string) => void;
//   logout: () => Promise<void>;
//   checkAuthStatus: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export function AuthProvider({ children }: AuthProviderProps) {
//   const auth = useAuth();

//   return (
//     <AuthContext.Provider value={auth}>
//       {!auth.isLoading && children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuthContext() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuthContext must be used within an AuthProvider");
//   }
//   return context;
// }

// export const useUserStore = create<UserStore>((set) => ({
//   user: null,
//   isLoggedIn: false,
//   setUser: (user: User) => set({ user, isLoggedIn: true }),
//   clearUser: () => set({ user: null, isLoggedIn: false }),
// }));
