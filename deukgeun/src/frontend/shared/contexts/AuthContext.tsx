import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { create } from "zustand";
import { User } from "@shared/types/user";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // 🧪 디버깅용 로그 (기존 코드에 영향 없음)
  console.log("🧪 로그인 여부:", auth.isLoggedIn);
  console.log("🧪 현재 유저:", auth.user);

  return (
    <AuthContext.Provider value={auth}>
      {!auth.isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
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
