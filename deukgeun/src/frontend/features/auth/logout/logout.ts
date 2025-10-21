import { store } from "@frontend/shared/store"
import { resetAuth } from "@frontend/shared/store/authSlice"

export const logout = () => {
  store.dispatch(resetAuth())
  localStorage.removeItem("accessToken")
  localStorage.removeItem("user")
}
