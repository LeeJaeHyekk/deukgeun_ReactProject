import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@frontend/shared/utils/testUtils'
import LevelDisplay from './LevelDisplay'
import type { UserLevel } from '../../../shared/types/dto'

// Mock useLevel hook
vi.mock('../hooks/useLevel', () => ({
  useLevel: vi.fn(() => ({
    levelProgress: {
      level: 5,
      currentExp: 750,
      expToNextLevel: 250,
      totalExp: 1250,
      progressPercentage: 75,
    },
    rewards: [],
    cooldownInfo: null,
    dailyLimitInfo: null,
    isLoading: false,
    error: null,
  })),
}))

describe('LevelDisplay', () => {
  const mockUserLevel: UserLevel = {
    id: 1,
    userId: 1,
    level: 5,
    currentExp: 750,
    totalExp: 1250,
    seasonExp: 750,
    totalLevelUps: 4,
    lastLevelUpAt: new Date('2024-01-01'),
    currentSeason: 1,
    seasonStartDate: new Date('2024-01-01'),
    seasonEndDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('레벨 정보가 올바르게 렌더링된다', () => {
      render(<LevelDisplay userLevel={mockUserLevel} />)

      expect(screen.getByText('Lv.5')).toBeInTheDocument()
      expect(screen.getByText('750')).toBeInTheDocument()
    })

    it('경험치 진행률 바가 올바르게 렌더링된다', () => {
      render(<LevelDisplay userLevel={mockUserLevel} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
    })

    it('경험치 정보가 표시된다', () => {
      render(<LevelDisplay userLevel={mockUserLevel} />)

      expect(screen.getByText('750')).toBeInTheDocument()
      expect(screen.getByText('EXP')).toBeInTheDocument()
    })
  })

  describe('다양한 레벨 상태', () => {
    it('레벨 1 상태가 올바르게 표시된다', () => {
      const level1UserLevel: UserLevel = {
        ...mockUserLevel,
        level: 1,
        currentExp: 0,
        totalExp: 0,
      }

      render(<LevelDisplay userLevel={level1UserLevel} />)

      expect(screen.getByText('Lv.1')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('높은 레벨 상태가 올바르게 표시된다', () => {
      const highLevelUserLevel: UserLevel = {
        ...mockUserLevel,
        level: 50,
        currentExp: 5000,
        totalExp: 50000,
      }

      render(<LevelDisplay userLevel={highLevelUserLevel} />)

      expect(screen.getByText('Lv.50')).toBeInTheDocument()
      expect(screen.getByText('5000')).toBeInTheDocument()
    })
  })

  describe('옵션 props', () => {
    it('showProgress가 false일 때 진행률이 표시되지 않는다', () => {
      render(<LevelDisplay userLevel={mockUserLevel} showProgress={false} />)

      expect(screen.getByText('Lv.5')).toBeInTheDocument()
      expect(screen.queryByText('750')).not.toBeInTheDocument()
    })

    it('showRewards가 true일 때 보상 섹션이 표시된다', () => {
      const { useLevel } = require('../hooks/useLevel')
      useLevel.mockReturnValue({
        levelProgress: {
          level: 5,
          currentExp: 750,
          expToNextLevel: 250,
          totalExp: 1250,
          progressPercentage: 75,
        },
        rewards: [
          {
            id: 1,
            rewardId: 'test-reward',
            metadata: { description: 'Test Reward', icon: '🏆' },
          },
        ],
        cooldownInfo: null,
        dailyLimitInfo: null,
        isLoading: false,
        error: null,
      })

      render(<LevelDisplay userLevel={mockUserLevel} showRewards={true} />)

      expect(screen.getByText('획득한 보상')).toBeInTheDocument()
      expect(screen.getByText('Test Reward')).toBeInTheDocument()
    })

    it('showCooldown이 true일 때 쿨다운 정보가 표시된다', () => {
      const { useLevel } = require('../hooks/useLevel')
      useLevel.mockReturnValue({
        levelProgress: {
          level: 5,
          currentExp: 750,
          expToNextLevel: 250,
          totalExp: 1250,
          progressPercentage: 75,
        },
        rewards: [],
        cooldownInfo: {
          isOnCooldown: true,
          remainingTime: 5000,
        },
        dailyLimitInfo: null,
        isLoading: false,
        error: null,
      })

      render(<LevelDisplay userLevel={mockUserLevel} showCooldown={true} />)

      expect(screen.getByText('쿨다운: 5초 남음')).toBeInTheDocument()
    })

    it('showDailyLimit이 true일 때 일일 한도 정보가 표시된다', () => {
      const { useLevel } = require('../hooks/useLevel')
      useLevel.mockReturnValue({
        levelProgress: {
          level: 5,
          currentExp: 750,
          expToNextLevel: 250,
          totalExp: 1250,
          progressPercentage: 75,
        },
        rewards: [],
        cooldownInfo: null,
        dailyLimitInfo: {
          dailyExp: 800,
          limit: 1000,
        },
        isLoading: false,
        error: null,
      })

      render(<LevelDisplay userLevel={mockUserLevel} showDailyLimit={true} />)

      expect(screen.getByText('일일 경험치: 800/1000')).toBeInTheDocument()
    })
  })

  describe('로딩 및 에러 상태', () => {
    it('로딩 중일 때 로딩 메시지가 표시된다', () => {
      const { useLevel } = require('../hooks/useLevel')
      useLevel.mockReturnValue({
        levelProgress: null,
        rewards: [],
        cooldownInfo: null,
        dailyLimitInfo: null,
        isLoading: true,
        error: null,
      })

      render(<LevelDisplay />)

      expect(screen.getByText('레벨 정보 로딩 중...')).toBeInTheDocument()
    })

    it('에러가 발생했을 때 에러 메시지가 표시된다', () => {
      const { useLevel } = require('../hooks/useLevel')
      useLevel.mockReturnValue({
        levelProgress: null,
        rewards: [],
        cooldownInfo: null,
        dailyLimitInfo: null,
        isLoading: false,
        error: '레벨 정보를 불러올 수 없습니다.',
      })

      render(<LevelDisplay />)

      expect(
        screen.getByText('레벨 정보를 불러올 수 없습니다.')
      ).toBeInTheDocument()
    })

    it('userLevel이 제공되면 로딩 상태를 무시한다', () => {
      const { useLevel } = require('../hooks/useLevel')
      useLevel.mockReturnValue({
        levelProgress: null,
        rewards: [],
        cooldownInfo: null,
        dailyLimitInfo: null,
        isLoading: true,
        error: '에러 발생',
      })

      render(<LevelDisplay userLevel={mockUserLevel} />)

      expect(screen.getByText('Lv.5')).toBeInTheDocument()
      expect(screen.queryByText('레벨 정보 로딩 중...')).not.toBeInTheDocument()
      expect(screen.queryByText('에러 발생')).not.toBeInTheDocument()
    })
  })

  describe('스타일링', () => {
    it('커스텀 className이 적용된다', () => {
      const { container } = render(
        <LevelDisplay userLevel={mockUserLevel} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('기본 스타일이 적용된다', () => {
      const { container } = render(<LevelDisplay userLevel={mockUserLevel} />)

      expect(container.firstChild).toHaveClass('levelDisplay')
    })
  })

  describe('접근성', () => {
    it('적절한 ARIA 속성이 설정된다', () => {
      render(<LevelDisplay userLevel={mockUserLevel} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
    })

    it('레벨 정보가 스크린 리더에서 읽을 수 있다', () => {
      render(<LevelDisplay userLevel={mockUserLevel} />)

      expect(screen.getByText('Lv.5')).toBeInTheDocument()
      expect(screen.getByText('750')).toBeInTheDocument()
    })
  })
})
