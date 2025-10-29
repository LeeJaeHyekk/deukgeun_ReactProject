import { useSelector } from 'react-redux'
import { RootState } from '@frontend/shared/store'
import { tokenManager } from '@frontend/shared/utils/tokenManager'
import { showToast } from '@frontend/shared/lib'

export function useAuthGuard() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)
  const user = useSelector((state: RootState) => state.auth.user)

  function ensureAuthenticated(): boolean {
    const token = tokenManager.getAccessToken()
    const authenticated = !!isLoggedIn && !!user && !!token

    if (!authenticated) {
      showToast('로그인이 필요합니다. 로그인 페이지로 이동합니다.', 'error')
      window.location.href = '/login'
      return false
    }
    return true
  }

  return { isLoggedIn, user, ensureAuthenticated }
}


