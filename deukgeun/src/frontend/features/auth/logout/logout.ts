import { useUserStore } from "@shared/store/userStore"

export const logout = () => {
  useUserStore.getState().clearUser()
  localStorage.removeItem("accessToken") // 필요시
}
