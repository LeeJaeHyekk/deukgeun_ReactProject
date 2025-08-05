// import { create } from "zustand";
// import { User } from "@shared/types/user";

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   accessToken: string;
// }

// interface UserStore {
//   user: User | null;
//   token: string | null;
//   isLoggedIn: boolean;
//   setUser: (user: User) => void;
//   setToken: (token: string | null) => void;
//   clearUser: () => void;
// }

// export const useUserStore = create<UserStore>((set) => ({
//   user: JSON.parse(localStorage.getItem("user") || "null"),
//   setUser: (user: User | null) => {
//     if (user) localStorage.setItem("user", JSON.stringify(user));
//     else localStorage.removeItem("user");
//     set({ user });
//   },
//   clearUser: () => {
//     localStorage.removeItem("user");
//     set({ user: null });
//   },
// }));

// export const useUserStore = create<UserStore>((set) => ({
//   user: JSON.parse(localStorage.getItem("user") || "null"),
//   token: localStorage.getItem("token"),
//   setUser: (user) => {
//     if (user) localStorage.setItem("user", JSON.stringify(user));
//     else localStorage.removeItem("user");
//     set({ user });
//   },
//   setToken: (token) => {
//     if (token) localStorage.setItem("token", token);
//     else localStorage.removeItem("token");
//     set({ token });
//   },
//   clearUser: () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     set({ user: null, token: null });
//   },
// }));

// export const useUserStore = create<UserStore>((set) => ({
//   user: null,
//   isLoggedIn: false,
//   setUser: (user: User) => set({ user, isLoggedIn: true }),
// clearUser: () => set({ user: null, isLoggedIn: false }),
// }));

import { create } from "zustand";
import { User } from "@shared/types/user";

interface UserStore {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user: User) => set({ user, isLoggedIn: true }),
  clearUser: () => set({ user: null, isLoggedIn: false }),
}));
