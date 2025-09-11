import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLevel } from './useLevel'
import { useAuth } from './useAuth'
import { levelApiWrapper, levelApiManager } from '../api/levelApiWrapper'
import { showToast } from '../lib'
import type { LevelProgress, UserReward } from '../api/levelApi'

// Mock dependencies
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../api/levelApiWrapper', () => ({
  levelApiWrapper: {
    getUserProgress: vi.fn(),
    getUserRewards: vi.fn(),
    grantExp: vi.fn(),
    checkCooldown: vi.fn(),
    getGlobalLeaderboard: vi.fn(),
  },
  levelApiManager: {
    isEnabled: vi.fn(() => true),
    enable: vi.fn(),
    disable: vi.fn(),
    getConsecutiveErrors: vi.fn(() => 0),
    shouldSkip: vi.fn(() => false),
    reset: vi.fn(),
  },
}))

vi.mock('../lib', () => ({
  showToast: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)
const mockLevelApiWrapper = vi.mocked(levelApiWrapper)
const mockLevelApiManager = vi.mocked(levelApiManager)
const mockShowToast = vi.mocked(showToast)

describe('useLevel', () => {
  const mockUser = {
    id: 1,
    userId: 1,
    email: 'test@example.com',
    nickname: 'Test User',
    role: 'user' as const,
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  const mockLevelProgress: LevelProgress = {
    level: 5,
    currentExp: 750,
    totalExp: 1250,
    seasonExp: 750,
    expToNextLevel: 250,
    progressPercentage: 75,
  }

  const mockRewards: UserReward[] = [
    {
      id: 1,
      userId: 1,
      rewardType: 'exp',
      rewardId: 'reward-1',
      claimedAt: '2024-01-01T00:00:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
      metadata: { name: 'Test Reward', value: 100 },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // 콘솔 로그 모킹으로 테스트 출력 정리
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoggedIn: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      checkAuthStatus: vi.fn(),
    })
    mockLevelApiManager.isEnabled.mockReturnValue(true)
    mockLevelApiManager.getConsecutiveErrors.mockReturnValue(0)
    mockLevelApiManager.shouldSkip.mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정된다', async () => {
      const { result } = renderHook(() => useLevel())

      // 초기 로딩이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.levelProgress).toEqual({
        level: 1,
        currentExp: 0,
        totalExp: 0,
        seasonExp: 0,
        expToNextLevel: 100,
        progressPercentage: 0,
      })
      expect(result.current.rewards).toEqual([])
      expect(result.current.cooldownInfo).toBeNull()
      expect(result.current.dailyLimitInfo).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('fetchLevelProgress', () => {
    it('레벨 진행률을 성공적으로 가져온다', async () => {
      mockLevelApiWrapper.getUserProgress.mockResolvedValue(mockLevelProgress)

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      expect(result.current.levelProgress).toEqual(mockLevelProgress)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLevelApiWrapper.getUserProgress).toHaveBeenCalledWith(
        mockUser.id
      )
    })

    it('API 에러가 발생하면 에러 상태가 설정된다', async () => {
      const errorMessage = 'API 에러 발생'
      mockLevelApiWrapper.getUserProgress.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      expect(result.current.error).toBe('레벨 정보를 불러오는데 실패했습니다.')
      expect(result.current.levelProgress).toEqual({
        level: 1,
        currentExp: 0,
        totalExp: 0,
        seasonExp: 0,
        expToNextLevel: 100,
        progressPercentage: 0,
      })
      expect(result.current.isLoading).toBe(false)
    })

    it('로그인하지 않은 상태에서는 기본값을 반환한다', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoggedIn: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
        checkAuthStatus: vi.fn(),
      })

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      expect(result.current.levelProgress).toEqual({
        level: 1,
        currentExp: 0,
        totalExp: 0,
        seasonExp: 0,
        expToNextLevel: 100,
        progressPercentage: 0,
      })
      expect(mockLevelApiWrapper.getUserProgress).not.toHaveBeenCalled()
    })
  })

  describe('fetchRewards', () => {
    it('보상을 성공적으로 가져온다', async () => {
      mockLevelApiWrapper.getUserRewards.mockResolvedValue(mockRewards)

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchRewards()
      })

      expect(result.current.rewards).toEqual(mockRewards)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLevelApiWrapper.getUserRewards).toHaveBeenCalledWith(
        mockUser.id
      )
    })

    it('API 에러가 발생하면 에러 상태가 설정된다', async () => {
      const errorMessage = 'API 에러 발생'
      mockLevelApiWrapper.getUserRewards.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchRewards()
      })

      expect(result.current.error).toBe('보상 정보를 불러오는데 실패했습니다.')
      expect(result.current.rewards).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('grantExp', () => {
    it('경험치를 성공적으로 부여한다', async () => {
      const mockGrantResult = {
        success: true,
        expGained: 50,
        levelUp: false,
        rewards: [],
        cooldownInfo: null,
        dailyLimitInfo: null,
      }

      mockLevelApiWrapper.grantExp.mockResolvedValue(mockGrantResult)
      mockLevelApiWrapper.getUserProgress.mockResolvedValue(mockLevelProgress)
      mockLevelApiWrapper.getUserRewards.mockResolvedValue(mockRewards)

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        const grantResult = await result.current.grantExp('workout', 'test')
        expect(grantResult).toEqual(mockGrantResult)
      })

      expect(mockLevelApiWrapper.grantExp).toHaveBeenCalledWith({
        actionType: 'workout',
        source: 'test',
        metadata: undefined,
      })
      expect(mockShowToast).not.toHaveBeenCalled()
    })

    it('레벨업이 발생하면 토스트가 표시된다', async () => {
      const mockGrantResult = {
        success: true,
        expGained: 50,
        levelUp: true,
        rewards: [],
        cooldownInfo: null,
        dailyLimitInfo: null,
      }

      mockLevelApiWrapper.grantExp.mockResolvedValue(mockGrantResult)
      mockLevelApiWrapper.getUserProgress.mockResolvedValue(mockLevelProgress)
      mockLevelApiWrapper.getUserRewards.mockResolvedValue(mockRewards)

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.grantExp('workout', 'test')
      })

      expect(mockShowToast).toHaveBeenCalledWith(
        '🎉 레벨업! 축하합니다!',
        'success'
      )
    })

    it('API 에러가 발생하면 에러 상태가 설정된다', async () => {
      const errorMessage = '경험치 부여 실패'
      mockLevelApiWrapper.grantExp.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        const grantResult = await result.current.grantExp('workout', 'test')
        expect(grantResult).toBeNull()
      })

      expect(mockShowToast).toHaveBeenCalledWith(
        '경험치 부여 중 오류가 발생했습니다.',
        'error'
      )
    })
  })

  describe('API 관리', () => {
    it('API 활성화/비활성화가 올바르게 작동한다', () => {
      const { result } = renderHook(() => useLevel())

      act(() => {
        result.current.enableLevelApi()
      })

      expect(mockLevelApiManager.enable).toHaveBeenCalled()

      act(() => {
        result.current.disableLevelApi()
      })

      expect(mockLevelApiManager.disable).toHaveBeenCalled()
    })

    it('레벨 데이터 리셋이 올바르게 작동한다', () => {
      const { result } = renderHook(() => useLevel())

      act(() => {
        result.current.resetLevelData()
      })

      expect(result.current.levelProgress).toEqual({
        level: 1,
        currentExp: 0,
        totalExp: 0,
        seasonExp: 0,
        expToNextLevel: 100,
        progressPercentage: 0,
      })
      expect(result.current.rewards).toEqual([])
      expect(result.current.cooldownInfo).toBeNull()
      expect(result.current.dailyLimitInfo).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('로딩 상태 관리', () => {
    it('모든 작업에서 로딩 상태가 올바르게 관리된다', async () => {
      mockLevelApiWrapper.getUserProgress.mockResolvedValue(mockLevelProgress)

      const { result } = renderHook(() => useLevel())

      // 초기 로딩 완료 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // fetchLevelProgress 로딩 테스트
      let fetchPromise: Promise<void>
      await act(async () => {
        fetchPromise = result.current.fetchLevelProgress()
        expect(result.current.isLoading).toBe(true)
      })

      await act(async () => {
        await fetchPromise!
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('에러 처리', () => {
    it('에러 발생 시 이전 상태가 유지된다', async () => {
      // 먼저 성공적으로 데이터 로드
      mockLevelApiWrapper.getUserProgress.mockResolvedValueOnce(
        mockLevelProgress
      )

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      const previousProgress = result.current.levelProgress

      // 그 다음 에러 발생
      mockLevelApiWrapper.getUserProgress.mockRejectedValueOnce(
        new Error('API 에러')
      )

      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      // 에러 발생 시에도 이전 상태 유지
      expect(result.current.levelProgress).toEqual(previousProgress)
      expect(result.current.error).toBe('레벨 정보를 불러오는데 실패했습니다.')
    })
  })
})
