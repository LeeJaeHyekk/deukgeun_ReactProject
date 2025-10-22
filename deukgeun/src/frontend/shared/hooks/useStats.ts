import { usePlatformStats, useUserStatsData } from './useAppData'
import { DEFAULT_PLATFORM_STATS, DEFAULT_USER_STATS } from '../api/statsApi'
import { withRequestManagement, autoReconnectManager, stateSafetyManager } from '../utils/apiRequestManager'
import { logger } from '../utils/logger'

const useStats = () => {
  const { stats, isLoading, error, refresh } = usePlatformStats()

  return {
    stats: stats || DEFAULT_PLATFORM_STATS,
    isLoading,
    error,
    refetch: refresh,
  }
}

// 사용자 개인 통계 훅 - useAppData의 useUserStatsData 사용
const useUserStats = () => {
  const { userStats, isLoading, error, refresh } = useUserStatsData()

  return {
    userStats: userStats || DEFAULT_USER_STATS,
    isLoading,
    error,
    refetch: refresh,
  }
}

// Export all hooks
export {
  useStats,
  useUserStats,
}