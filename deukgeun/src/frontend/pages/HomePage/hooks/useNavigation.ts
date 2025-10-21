import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAVIGATION_PATHS } from '../constants'

/**
 * 네비게이션 관리 훅
 */
export const useNavigation = () => {
  const navigate = useNavigate()

  // 네비게이션 함수들 (메모이제이션)
  const handleLogin = useCallback(() => navigate(NAVIGATION_PATHS.LOGIN), [navigate])
  const handleLocation = useCallback(() => navigate(NAVIGATION_PATHS.LOCATION), [navigate])
  const handleMachineGuide = useCallback(() => navigate(NAVIGATION_PATHS.MACHINE_GUIDE), [navigate])
  const handleMypage = useCallback(() => navigate(NAVIGATION_PATHS.MYPAGE), [navigate])
  const handleRegister = useCallback(() => navigate(NAVIGATION_PATHS.REGISTER), [navigate])

  // 동적 네비게이션 함수
  const navigateTo = useCallback((path: string) => {
    navigate(path)
  }, [navigate])

  return {
    handleLogin,
    handleLocation,
    handleMachineGuide,
    handleMypage,
    handleRegister,
    navigateTo,
  }
}
