import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './index'

// ============================================================================
// 기본 셀렉터들
// ============================================================================

const selectAppState = (state: RootState) => state.app
const selectAuthState = (state: RootState) => state.auth
const selectHomeState = (state: RootState) => state.home

// ============================================================================
// 앱 상태 셀렉터들 (메모이제이션)
// ============================================================================

// 로딩 상태 셀렉터
export const selectAppLoading = createSelector(
  [selectAppState],
  (app) => app.isLoading
)

export const selectAppInitialized = createSelector(
  [selectAppState],
  (app) => app.isInitialized
)

export const selectAppError = createSelector(
  [selectAppState],
  (app) => app.error
)

// 개별 로딩 상태 셀렉터들
export const selectPlatformStatsLoading = createSelector(
  [selectAppState],
  (app) => app.loadingStates.platformStats
)

export const selectUserStatsLoading = createSelector(
  [selectAppState],
  (app) => app.loadingStates.userStats
)

export const selectDetailedStatsLoading = createSelector(
  [selectAppState],
  (app) => app.loadingStates.detailedStats
)

// 데이터 셀렉터들
export const selectPlatformStats = createSelector(
  [selectAppState],
  (app) => app.platformStats
)

export const selectUserStats = createSelector(
  [selectAppState],
  (app) => app.userStats
)

export const selectDetailedStats = createSelector(
  [selectAppState],
  (app) => app.detailedStats
)

// 캐시 상태 셀렉터들
export const selectCacheStatus = createSelector(
  [selectAppState],
  (app) => app.cacheStatus
)

export const selectLastUpdated = createSelector(
  [selectAppState],
  (app) => app.lastUpdated
)

// ============================================================================
// 복합 셀렉터들 (여러 상태를 조합)
// ============================================================================

// 전체 로딩 상태
export const selectAnyLoading = createSelector(
  [
    selectAppLoading,
    selectPlatformStatsLoading,
    selectUserStatsLoading,
    selectDetailedStatsLoading
  ],
  (appLoading, platformLoading, userLoading, detailedLoading) => 
    appLoading || platformLoading || userLoading || detailedLoading
)

// 데이터 존재 여부
export const selectHasPlatformData = createSelector(
  [selectPlatformStats],
  (platformStats) => !!platformStats
)

export const selectHasUserData = createSelector(
  [selectUserStats],
  (userStats) => !!userStats
)

export const selectHasDetailedData = createSelector(
  [selectDetailedStats],
  (detailedStats) => !!detailedStats
)

// ============================================================================
// 인증 상태 셀렉터들
// ============================================================================

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
)

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
)

export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
)

export const selectUserId = createSelector(
  [selectUser],
  (user) => user?.id ?? null
)

// ============================================================================
// 홈페이지용 복합 셀렉터
// ============================================================================

export const selectHomePageData = createSelector(
  [
    selectAppInitialized,
    selectAppLoading,
    selectPlatformStatsLoading,
    selectUserStatsLoading,
    selectPlatformStats,
    selectUserStats,
    selectAppError
  ],
  (
    isInitialized,
    appLoading,
    platformLoading,
    userLoading,
    platformStats,
    userStats,
    error
  ) => ({
    isInitialized,
    isLoading: appLoading || platformLoading || userLoading,
    platformStats,
    userStats,
    error,
    hasPlatformData: !!platformStats,
    hasUserData: !!userStats
  })
)

// ============================================================================
// 홈 슬라이스 셀렉터들
// ============================================================================

// 홈 상태 셀렉터들
export const selectHomeInitialized = createSelector(
  [selectHomeState],
  (home) => !!home.lastFetchedAt
)

export const selectHomeLoading = createSelector(
  [selectHomeState],
  (home) => home.loading
)

export const selectHomeError = createSelector(
  [selectHomeState],
  (home) => home.error
)

// 홈 개별 로딩 상태 셀렉터들
export const selectHomeConfigLoading = createSelector(
  [selectHomeState],
  (home) => home.loading
)

export const selectHomeUserStatsLoading = createSelector(
  [selectHomeState],
  (home) => home.loading
)

export const selectHomePlatformStatsLoading = createSelector(
  [selectHomeState],
  (home) => home.loading
)

// 홈 데이터 셀렉터들
export const selectHomeConfig = createSelector(
  [selectHomeState],
  (home) => null // config는 homeSlice에서 관리하지 않음
)

export const selectHomeUserStats = createSelector(
  [selectHomeState],
  (home) => home.userStats
)

export const selectHomePlatformStats = createSelector(
  [selectHomeState],
  (home) => home.platformStats
)

// 홈 복합 셀렉터
export const selectHomePageDataNew = createSelector(
  [
    selectHomeInitialized,
    selectHomeLoading,
    selectHomeConfigLoading,
    selectHomeUserStatsLoading,
    selectHomePlatformStatsLoading,
    selectHomeConfig,
    selectHomeUserStats,
    selectHomePlatformStats,
    selectHomeError
  ],
  (
    isInitialized,
    globalLoading,
    configLoading,
    userStatsLoading,
    platformStatsLoading,
    config,
    userStats,
    platformStats,
    globalError
  ) => ({
    isInitialized,
    globalLoading,
    configLoading,
    userStatsLoading,
    platformStatsLoading,
    config,
    userStats,
    platformStats,
    globalError,
    hasConfig: !!config,
    hasUserStats: !!userStats,
    hasPlatformStats: !!platformStats
  })
)
