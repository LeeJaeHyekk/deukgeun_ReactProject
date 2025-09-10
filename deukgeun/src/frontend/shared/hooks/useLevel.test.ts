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
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() => useLevel())

      expect(result.current.levelProgress).toBeNull()
      expect(result.current.rewards).toEqual([])
      expect(result.current.cooldownInfo).toBeNull()
      expect(result.current.dailyLimitInfo).toBeNull()
      expect(result.current.isLoading).toBe(false)
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
      expect(mockLevelApiWrapper.getUserProgress).toHaveBeenCalledTimes(1)
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

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.isLoading).toBe(false)
    })

    it('API 매니저가 비활성화되어 있으면 호출하지 않는다', async () => {
      mockLevelApiManager.isEnabled.mockReturnValue(false)

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      expect(mockLevelApiWrapper.getUserProgress).not.toHaveBeenCalled()
    })

    it('연속 에러가 발생하면 API 호출을 건너뛴다', async () => {
      mockLevelApiManager.shouldSkip.mockReturnValue(true)

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      expect(mockLevelApiWrapper.getUserProgress).not.toHaveBeenCalled()
    })

    it('쿨다운 중이면 API 호출을 건너뛴다', async () => {
      const { result } = renderHook(() => useLevel())

      // 첫 번째 호출
      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      // 즉시 두 번째 호출 (쿨다운 중)
      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      expect(mockLevelApiWrapper.getUserProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('getRewards', () => {
    it('보상을 성공적으로 가져온다', async () => {
      mockLevelApiWrapper.getUserRewards.mockResolvedValue(mockRewards)

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchRewards()
      })

      expect(result.current.rewards).toEqual(mockRewards)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLevelApiWrapper.getUserRewards).toHaveBeenCalledTimes(1)
    })

    it('API 에러가 발생하면 에러 상태가 설정된다', async () => {
      const errorMessage = '보상 조회 실패'
      mockLevelApiWrapper.getUserRewards.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.fetchRewards()
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('grantExp', () => {
    it('경험치를 성공적으로 부여한다', async () => {
      const updatedProgress = {
        ...mockLevelProgress,
        currentExp: 800,
        totalExp: 1300,
      }

      const grantResponse = {
        success: true,
        expGained: 50,
        levelProgress: updatedProgress,
        rewards: [],
        cooldownInfo: undefined,
        dailyLimitInfo: undefined,
      }

      mockLevelApiWrapper.grantExp.mockResolvedValue(grantResponse)

      const { result } = renderHook(() => useLevel())

      let returnedResult: any
      await act(async () => {
        returnedResult = await result.current.grantExp(
          'test-activity',
          'test-source'
        )
      })

      expect(returnedResult!).toEqual(grantResponse)
      expect(result.current.levelProgress).toEqual(updatedProgress)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLevelApiWrapper.grantExp).toHaveBeenCalledWith({
        actionType: 'test-activity',
        source: 'test-source',
        metadata: undefined,
      })
    })

    it('레벨업이 발생하면 토스트가 표시된다', async () => {
      const updatedProgress = {
        ...mockLevelProgress,
        level: 6, // 레벨업
        currentExp: 50,
        totalExp: 1300,
      }

      const grantResponse = {
        success: true,
        expGained: 50,
        levelProgress: updatedProgress,
        rewards: [],
        cooldownInfo: undefined,
        dailyLimitInfo: undefined,
      }

      mockLevelApiWrapper.grantExp.mockResolvedValue(grantResponse)

      const { result } = renderHook(() => useLevel())

      // 초기 레벨 설정
      act(() => {
        result.current.levelProgress = mockLevelProgress
      })

      await act(async () => {
        await result.current.grantExp('test-activity', 'test-source')
      })

      expect(mockShowToast).toHaveBeenCalledWith(
        '레벨업!',
        '축하합니다! 레벨 6에 도달했습니다!',
        'success'
      )
    })

    it('API 에러가 발생하면 에러 상태가 설정된다', async () => {
      const errorMessage = '경험치 부여 실패'
      mockLevelApiWrapper.grantExp.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useLevel())

      await act(async () => {
        await result.current.grantExp('test-activity', 'test-source')
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('로딩 상태 관리', () => {
    it('모든 작업에서 로딩 상태가 올바르게 관리된다', async () => {
      const { result } = renderHook(() => useLevel())

      // getLevelProgress 로딩 테스트
      let resolveGetLevelProgress: (value: LevelProgress) => void
      const getLevelProgressPromise = new Promise<LevelProgress>(resolve => {
        resolveGetLevelProgress = resolve
      })
      mockLevelApiWrapper.getUserProgress.mockReturnValue(
        getLevelProgressPromise
      )

      act(() => {
        result.current.fetchLevelProgress()
      })
      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolveGetLevelProgress!(mockLevelProgress)
        await getLevelProgressPromise
      })
      expect(result.current.isLoading).toBe(false)

      // grantExp 로딩 테스트
      let resolveGrantExp: (value: any) => void
      const grantExpPromise = new Promise<any>(resolve => {
        resolveGrantExp = resolve
      })
      mockLevelApiWrapper.grantExp.mockReturnValue(grantExpPromise)

      act(() => {
        result.current.grantExp('test', 'test-source')
      })
      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolveGrantExp!({
          success: true,
          expGained: 50,
          levelProgress: mockLevelProgress,
          rewards: [],
          cooldownInfo: undefined,
          dailyLimitInfo: undefined,
        })
        await grantExpPromise
      })
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('사용자 인증 상태', () => {
    it('사용자가 로그인되어 있지 않으면 API 호출하지 않는다', async () => {
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

      expect(mockLevelApiWrapper.getUserProgress).not.toHaveBeenCalled()
    })
  })

  describe('에러 처리', () => {
    it('에러 발생 시 이전 상태가 유지된다', async () => {
      const { result } = renderHook(() => useLevel())

      // 초기 상태 설정
      act(() => {
        result.current.levelProgress = mockLevelProgress
      })

      mockLevelApiWrapper.getUserProgress.mockRejectedValue(
        new Error('API 에러')
      )

      await act(async () => {
        await result.current.fetchLevelProgress()
      })

      expect(result.current.levelProgress).toEqual(mockLevelProgress) // 이전 상태 유지
      expect(result.current.error).toBe('API 에러')
    })
  })
})
