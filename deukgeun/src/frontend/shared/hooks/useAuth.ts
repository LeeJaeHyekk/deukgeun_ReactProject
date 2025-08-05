import { useState, useEffect, useCallback } from "react";
import { storage } from "../lib";
import { authApi } from "../../features/auth/api/authApi";

interface User {
  id: number;
  email: string;
  nickname: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    isLoading: true,
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = storage.get("accessToken");
      const user = storage.get("user");

      if (token && user) {
        const isValid = await authApi.checkAuth();
        if (isValid) {
          setAuthState({ isLoggedIn: true, user, isLoading: false });
          return;
        }
      }

      // refreshToken 기반 재로그인 시도
      const response = await authApi.refreshToken();
      if (response && response.accessToken) {
        storage.set("accessToken", response.accessToken);
        // refresh 응답에는 user 정보가 없으므로 기존 user 정보 유지
        const existingUser = storage.get("user");
        if (existingUser) {
          setAuthState({
            isLoggedIn: true,
            user: existingUser,
            isLoading: false,
          });
        } else {
          throw new Error("No user data available");
        }
      } else {
        throw new Error("Refresh failed");
      }
    } catch (error) {
      storage.clear();
      setAuthState({
        isLoggedIn: false,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback((user: User, token: string) => {
    storage.set("accessToken", token);
    storage.set("user", user);
    setAuthState({
      isLoggedIn: true,
      user,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("Logout API failed:", error);
    } finally {
      storage.clear();
      setAuthState({
        isLoggedIn: false,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
  };
}
