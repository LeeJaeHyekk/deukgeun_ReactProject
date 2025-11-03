import { useSelector } from 'react-redux'
import { RootState } from '@frontend/shared/store'
import { getCurrentToken } from '@frontend/shared/utils/tokenUtils'
import { showToast } from '@frontend/shared/lib'

export function useAuthGuard() {
  // authSlice에는 isLoggedIn 필드가 없고 isAuthenticated 필드만 있음
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const user = useSelector((state: RootState) => state.auth.user)
  
  // isLoggedIn은 isAuthenticated와 user, token을 기반으로 계산
  // useAuthRedux의 로직과 일관성 유지
  const token = getCurrentToken()
  const isLoggedIn = !!isAuthenticated && !!user && !!token && !!user.accessToken

  function ensureAuthenticated(): boolean {
    console.log('🔐 [useAuthGuard] ensureAuthenticated 호출')
    
    // getCurrentToken을 사용하여 일관된 토큰 소스 확인 (Redux > memory > localStorage)
    const currentToken = getCurrentToken()
    
    // 인증 확인: isAuthenticated, user, token 모두 필요
    const authenticated = !!isAuthenticated && !!user && !!currentToken
    
    console.log('🔐 [useAuthGuard] 인증 상태 확인:', {
      isAuthenticated,
      isLoggedIn,
      hasUser: !!user,
      userId: user?.id || null,
      userEmail: user?.email || null,
      hasUserAccessToken: !!user?.accessToken,
      hasCurrentToken: !!currentToken,
      tokenPreview: currentToken ? `${currentToken.substring(0, 20)}...` : '없음',
      tokenLength: currentToken?.length || 0,
      authenticated,
      timestamp: new Date().toISOString()
    })

    if (!authenticated) {
      console.error('❌ [useAuthGuard] 인증 실패:', {
        reason: {
          isAuthenticated: !isAuthenticated ? 'isAuthenticated가 false' : null,
          noUser: !user ? 'user가 null/undefined' : null,
          noToken: !currentToken ? 'token이 null/undefined' : null
        },
        state: {
          isAuthenticated,
          hasUser: !!user,
          hasToken: !!currentToken,
          userId: user?.id || null
        },
        stackTrace: new Error().stack
      })
      showToast('로그인이 필요합니다. 로그인 후 이용해주세요.', 'error')
      // 하드 리다이렉트 제거 (사용자가 직접 로그인 페이지로 이동하도록)
      return false
    }
    
    console.log('✅ [useAuthGuard] 인증 성공')
    return true
  }

  return { isLoggedIn, user, ensureAuthenticated }
}


