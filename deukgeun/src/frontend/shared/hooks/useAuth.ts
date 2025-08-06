// // ✅ useAuth.ts (자동 로그인 기능 개선)
// import { useCallback, useEffect, useRef, useState } from "react";
// import { storage } from "../lib";
// import { authApi } from "../../features/auth/api/authApi";
// import { useUserStore } from "../store/userStore"; // ✅ zustand store 사용
// import { User } from "@shared/types/user";

// // JWT 토큰 유효성 검사 함수
// function isTokenValid(token: string): boolean {
//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     const currentTime = Date.now() / 1000;
//     const isValid = payload.exp > currentTime;
//     console.log("🔍 토큰 유효성 검사:", {
//       token: token.substring(0, 20) + "...",
//       exp: payload.exp,
//       currentTime,
//       isValid,
//     });
//     return isValid;
//   } catch (error) {
//     console.error("🔍 토큰 유효성 검사 실패:", error);
//     return false;
//   }
// }

// // 토큰 만료 시간까지 남은 시간 계산 (밀리초)
// function getTokenExpiryTime(token: string): number {
//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     const currentTime = Date.now() / 1000;
//     const expiryTime = (payload.exp - currentTime) * 1000; // 밀리초로 변환
//     console.log("⏰ 토큰 만료 시간 계산:", {
//       exp: payload.exp,
//       currentTime,
//       expiryTime: `${Math.round(expiryTime / 1000)}초`,
//     });
//     return expiryTime;
//   } catch (error) {
//     console.error("⏰ 토큰 만료 시간 계산 실패:", error);
//     return 0;
//   }
// }

// export function useAuth() {
//   const { user, setUser, clearUser } = useUserStore(); // ✅ zustand state 구독
//   const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
//   const isInitialized = useRef(false); // 초기화 상태 추적
//   const tokenRefreshTimer = useRef<NodeJS.Timeout | null>(null); // 토큰 갱신 타이머

//   const isLoggedIn = !!user;

//   // 🧪 디버깅용 로그
//   console.log("🧪 useAuth 훅 실행");
//   console.log("🧪 현재 Zustand user:", user);
//   console.log("🧪 로딩 상태:", isLoading);
//   console.log("🧪 초기화 상태:", isInitialized.current);
//   console.log("🧪 계산된 로그인 상태:", isLoggedIn);

//   // 토큰 자동 갱신 설정
//   const setupTokenRefresh = useCallback(
//     (token: string) => {
//       console.log("🔄 토큰 갱신 설정 시작:", {
//         token: token.substring(0, 20) + "...",
//       });

//       // 기존 타이머 클리어
//       if (tokenRefreshTimer.current) {
//         console.log("🔄 기존 타이머 클리어");
//         clearTimeout(tokenRefreshTimer.current);
//         tokenRefreshTimer.current = null;
//       }

//       const expiryTime = getTokenExpiryTime(token);
//       if (expiryTime > 0) {
//         // 토큰 만료 5분 전에 갱신 시도
//         const refreshTime = Math.max(expiryTime - 5 * 60 * 1000, 60000); // 최소 1분

//         console.log(
//           `🔄 토큰 갱신 타이머 설정: ${Math.round(refreshTime / 1000)}초 후`
//         );

//         tokenRefreshTimer.current = setTimeout(async () => {
//           try {
//             console.log("🔄 토큰 자동 갱신 시도");
//             const response = await authApi.refreshToken();
//             if (response && response.accessToken) {
//               console.log("✅ 토큰 자동 갱신 성공");
//               storage.set("accessToken", response.accessToken);
//               const existingUser = storage.get("user");
//               if (existingUser) {
//                 setUser({ ...existingUser, accessToken: response.accessToken });
//                 // 새로운 토큰으로 타이머 재설정
//                 setupTokenRefresh(response.accessToken);
//               }
//             }
//           } catch (error) {
//             console.warn("❌ 토큰 자동 갱신 실패:", error);
//             // 갱신 실패 시 로그아웃
//             storage.clear();
//             clearUser();
//           }
//         }, refreshTime);
//       } else {
//         console.log("⚠️ 토큰 만료 시간이 0 이하 - 갱신 타이머 설정 안함");
//       }
//     },
//     [setUser, clearUser]
//   );

//   // 자동 로그인 체크 함수
//   const checkAutoLogin = useCallback(async () => {
//     console.log("🔄 자동 로그인 체크 시작");
//     console.log("🔄 현재 Zustand 상태:", useUserStore.getState());

//     try {
//       // 1. 먼저 localStorage에서 토큰과 사용자 정보 확인
//       const token = storage.get("accessToken");
//       const storedUser = storage.get("user");

//       console.log("🔄 localStorage 확인:", {
//         hasToken: !!token,
//         hasUser: !!storedUser,
//         token: token ? token.substring(0, 20) + "..." : null,
//         user: storedUser
//           ? { id: storedUser.id, email: storedUser.email }
//           : null,
//       });

//       if (token && storedUser) {
//         console.log("🔄 localStorage에서 사용자 정보 발견");

//         if (isTokenValid(token)) {
//           console.log("✅ localStorage 토큰이 유효합니다");
//           // Zustand store에 동기화
//           setUser({ ...storedUser, accessToken: token });
//           setupTokenRefresh(token);
//           setIsLoading(false);
//           console.log("✅ localStorage 기반 자동 로그인 완료");
//           return true;
//         } else {
//           console.log("❌ localStorage 토큰이 만료되었습니다");
//         }
//       }

//       // 2. Zustand store에서 사용자 정보 확인 (fallback)
//       const currentUser = useUserStore.getState().user;
//       console.log("🔄 Zustand store 확인:", {
//         hasUser: !!currentUser,
//         user: currentUser
//           ? { id: currentUser.id, email: currentUser.email }
//           : null,
//       });

//       if (currentUser && currentUser.accessToken) {
//         console.log("✅ Zustand에서 사용자 정보 발견");

//         if (isTokenValid(currentUser.accessToken)) {
//           console.log("✅ Zustand 토큰이 유효합니다 - 자동 로그인 성공");
//           storage.set("accessToken", currentUser.accessToken);
//           storage.set("user", currentUser);
//           setupTokenRefresh(currentUser.accessToken);
//           setIsLoading(false);
//           console.log("✅ Zustand 기반 자동 로그인 완료");
//           return true;
//         } else {
//           console.log("❌ Zustand 토큰이 만료되었습니다");
//         }
//       }

//       // 3. 토큰이 없거나 만료된 경우 refresh token으로 갱신 시도
//       // 단, 기존 토큰이 유효하다면 refresh 실패해도 로그인 상태 유지
//       let shouldTryRefresh = true;
//       let hasValidToken = false;

//       if (token && storedUser && isTokenValid(token)) {
//         console.log(
//           "🔄 기존 토큰이 유효하므로 refresh 실패해도 로그인 상태 유지"
//         );
//         hasValidToken = true;
//         setUser({ ...storedUser, accessToken: token });
//         setupTokenRefresh(token);
//       }

//       if (shouldTryRefresh) {
//         try {
//           console.log("🔄 Refresh token으로 갱신 시도");
//           const response = await authApi.refreshToken();
//           console.log("🔄 Refresh token 응답:", response);

//           if (response && response.accessToken) {
//             console.log("✅ Refresh token 갱신 성공");
//             storage.set("accessToken", response.accessToken);
//             const existingUser = storage.get("user");
//             if (existingUser) {
//               setUser({ ...existingUser, accessToken: response.accessToken });
//               setupTokenRefresh(response.accessToken);
//               setIsLoading(false);
//               console.log("✅ Refresh token 기반 자동 로그인 완료");
//               return true;
//             } else {
//               console.log("⚠️ Refresh token 성공했지만 사용자 정보가 없음");
//             }
//           } else {
//             console.log("❌ Refresh token 응답에 accessToken이 없음");
//           }
//         } catch (error) {
//           console.warn("❌ Refresh token 갱신 실패:", error);

//           // 기존 토큰이 유효했다면 로그인 상태 유지
//           if (hasValidToken) {
//             console.log("✅ 기존 토큰이 유효하므로 로그인 상태 유지");
//             setIsLoading(false);
//             return true;
//           }
//         }
//       }

//       // 4. 모든 시도 실패 시 - 로그인이 안된 상태로 설정
//       console.log("❌ 자동 로그인 실패 - 로그아웃 상태로 설정");
//       storage.clear();
//       clearUser();
//       setIsLoading(false);
//       console.log("✅ 로그아웃 상태로 초기화 완료");
//       return false;
//     } catch (error) {
//       console.error("❌ 자동 로그인 체크 중 오류:", error);
//       storage.clear();
//       clearUser();
//       setIsLoading(false);
//       console.log("✅ 오류 발생으로 로그아웃 상태로 초기화 완료");
//       return false;
//     }
//   }, [setUser, clearUser, setupTokenRefresh]);

//   const checkAuthStatus = useCallback(async () => {
//     console.log("🔍 checkAuthStatus 호출");
//     return await checkAutoLogin();
//   }, [checkAutoLogin]);

//   const login = useCallback(
//     (user: User, token: string) => {
//       console.log("🔐 로그인 처리 시작");
//       console.log("🔐 저장할 유저:", {
//         id: user.id,
//         email: user.email,
//         nickname: user.nickname,
//       });
//       console.log("🔐 저장할 토큰:", token.substring(0, 20) + "...");

//       // 기존 타이머 클리어
//       if (tokenRefreshTimer.current) {
//         console.log("🔐 기존 토큰 갱신 타이머 클리어");
//         clearTimeout(tokenRefreshTimer.current);
//         tokenRefreshTimer.current = null;
//       }

//       // localStorage와 Zustand 모두 업데이트
//       console.log("🔐 localStorage 업데이트");
//       storage.set("accessToken", token);
//       storage.set("user", user);

//       console.log("🔐 Zustand store 업데이트");
//       setUser({ ...user, accessToken: token });

//       console.log("🔐 토큰 갱신 설정");
//       setupTokenRefresh(token);

//       console.log("✅ 로그인 완료");
//     },
//     [setUser, setupTokenRefresh]
//   );

//   const logout = useCallback(async () => {
//     console.log("🚪 로그아웃 시작");

//     try {
//       console.log("🚪 서버 로그아웃 API 호출");
//       await authApi.logout();
//       console.log("✅ 서버 로그아웃 성공");
//     } catch (e) {
//       console.warn("⚠️ 서버 로그아웃 실패:", e);
//     } finally {
//       // 타이머 클리어
//       if (tokenRefreshTimer.current) {
//         console.log("🚪 토큰 갱신 타이머 클리어");
//         clearTimeout(tokenRefreshTimer.current);
//         tokenRefreshTimer.current = null;
//       }

//       // 모든 인증 관련 데이터 클리어
//       console.log("🚪 localStorage 클리어");
//       storage.clear();

//       console.log("🚪 Zustand store 클리어");
//       clearUser();

//       console.log("🧹 로그아웃 완료 - 모든 데이터 클리어됨");

//       // 로그아웃 후 새로고침하여 완전히 초기 상태로 리셋
//       console.log("🔄 페이지 새로고침");
//       window.location.reload();
//     }
//   }, [clearUser]);

//   // 🧪 컴포넌트 마운트 시 자동 로그인 체크
//   useEffect(() => {
//     console.log("🧪 useAuth useEffect 실행");
//     console.log("🧪 초기화 상태 확인:", isInitialized.current);

//     if (isInitialized.current) {
//       console.log("🧪 이미 초기화됨 - 스킵");
//       return;
//     }

//     console.log("🧪 자동 로그인 체크 시작");

//     const initializeAuth = async () => {
//       try {
//         console.log("🧪 initializeAuth 함수 실행");
//         const result = await checkAutoLogin();
//         console.log("🧪 자동 로그인 결과:", result);
//       } catch (error) {
//         console.error("❌ 자동 로그인 초기화 중 오류:", error);
//         // 오류 발생 시에도 로딩 상태를 false로 설정
//         setIsLoading(false);
//       } finally {
//         console.log("🧪 초기화 완료 플래그 설정");
//         isInitialized.current = true;
//       }
//     };

//     initializeAuth();
//   }, []); // 빈 의존성 배열로 한 번만 실행

//   // 컴포넌트 언마운트 시 타이머 클리어
//   useEffect(() => {
//     return () => {
//       console.log("🧪 useAuth 컴포넌트 언마운트 - 타이머 클리어");
//       if (tokenRefreshTimer.current) {
//         clearTimeout(tokenRefreshTimer.current);
//       }
//     };
//   }, []);

//   console.log("🧪 useAuth 훅 반환값:", {
//     isLoggedIn,
//     user: user ? { id: user.id, email: user.email } : null,
//     isLoading,
//   });

//   return {
//     isLoggedIn,
//     user,
//     isLoading,
//     login,
//     logout,
//     checkAuthStatus,
//   };
// }

// ✅ useAuth.ts (자동 로그인 기능 개선 - 수정 완료)
import { useCallback, useEffect, useRef, useState } from "react";
import { storage } from "../lib";
import { authApi } from "../../features/auth/api/authApi";
import { useUserStore } from "../store/userStore";
import { User } from "@shared/types/user";

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

function getTokenExpiryTime(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return (payload.exp - currentTime) * 1000;
  } catch {
    return 0;
  }
}

export function useAuth() {
  const { user, setUser, clearUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);
  const tokenRefreshTimer = useRef<NodeJS.Timeout | null>(null);
  const isLoggedIn = !!user;

  const setupTokenRefresh = useCallback(
    (token: string) => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
      const expiryTime = getTokenExpiryTime(token);
      if (expiryTime > 0) {
        const refreshTime = Math.max(expiryTime - 5 * 60 * 1000, 60000);
        tokenRefreshTimer.current = setTimeout(async () => {
          try {
            const response = await authApi.refreshToken();
            if (response?.accessToken) {
              storage.set("accessToken", response.accessToken);
              const existingUser = storage.get("user");
              if (existingUser) {
                setUser({ ...existingUser, accessToken: response.accessToken });
                setupTokenRefresh(response.accessToken);
              }
            }
          } catch (error) {
            console.warn("❌ 자동 갱신 실패:", error);
            // 🔧 갱신 실패 시 상태만 초기화, 로그아웃은 하지 않음
            clearUser();
            storage.remove("accessToken");
            // 여기서 logout() 또는 storage.clear() 하지 않음
          }
        }, refreshTime);
      }
    },
    [setUser, clearUser]
  );

  const checkAutoLogin = useCallback(async () => {
    console.log("🔍 checkAutoLogin 실행됨");
    try {
      const token = storage.get("accessToken");
      const storedUser = storage.get("user");

      console.log("🧪 저장된 token:", token);
      console.log("🧪 저장된 user:", storedUser);

      if (token && storedUser && isTokenValid(token)) {
        console.log("✅ 유효한 토큰, 자동 로그인 진행");
        setUser({ ...storedUser, accessToken: token });
        setupTokenRefresh(token);
        setIsLoading(false);
        return true;
      }

      if (storedUser) {
        try {
          const response = await authApi.refreshToken();
          if (response?.accessToken) {
            storage.set("accessToken", response.accessToken);
            setUser({ ...storedUser, accessToken: response.accessToken });
            setupTokenRefresh(response.accessToken);
            setIsLoading(false);
            return true;
          }
        } catch (err) {
          console.warn("❌ refreshToken 갱신 실패:", err);
          // 🔧 갱신 실패 시 유저 상태만 클리어 (logout 아님)
          clearUser();
          storage.remove("accessToken");
        }
      }

      // 🔧 자동 로그인 실패 → 로그인 페이지에서 수동 로그인 가능해야 하므로 상태만 초기화
      clearUser();
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("❌ 자동 로그인 중 에러:", error);
      clearUser();
      setIsLoading(false);
      return false;
    }
  }, [setUser, clearUser, setupTokenRefresh]);

  const checkAuthStatus = useCallback(() => checkAutoLogin(), [checkAutoLogin]);

  const login = useCallback(
    (user: User, token: string) => {
      console.log("🧪 login() 호출됨");
      console.log("🧪 저장할 user:", user);
      console.log("🧪 저장할 token:", token);
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
      storage.set("accessToken", token);
      storage.set("user", user);

      console.log("🧪 저장된 accessToken:", storage.get("accessToken"));
      console.log("🧪 저장된 user:", storage.get("user"));

      setUser({ ...user, accessToken: token });
      setupTokenRefresh(token);
    },
    [setUser, setupTokenRefresh]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn("🚪 서버 로그아웃 실패:", e);
    } finally {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
        tokenRefreshTimer.current = null;
      }
      storage.remove("accessToken");
      storage.remove("user");
      clearUser();
      window.location.reload();
    }
  }, [clearUser]);

  useEffect(() => {
    if (!isInitialized.current) {
      checkAutoLogin().finally(() => {
        isInitialized.current = true;
      });
    }
  }, [checkAutoLogin]);

  useEffect(() => {
    return () => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
    };
  }, []);

  return {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
}
