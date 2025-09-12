import { useAuthContext } from '../contexts/AuthContext'

export function useAuth() {
  const authContext = useAuthContext()

  return {
    isLoggedIn: authContext.isAuthenticated,
    user: authContext.user,
    isLoading: authContext.isLoading,
    login: authContext.login,
    logout: authContext.logout,
    updateUser: authContext.updateUser,
    checkAuthStatus: authContext.checkAuthStatus,
  }
}
