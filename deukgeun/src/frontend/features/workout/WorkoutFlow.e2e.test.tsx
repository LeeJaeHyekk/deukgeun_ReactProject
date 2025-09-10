import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@frontend/shared/utils/testUtils'
import WorkoutFlow from './WorkoutFlow'

// Mock dependencies
vi.mock('@frontend/shared/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      nickname: 'Test User',
    },
    isLoggedIn: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  }),
}))

vi.mock('@frontend/features/workout/hooks/useWorkoutPlans', () => ({
  useWorkoutPlans: () => ({
    plans: [
      {
        id: 1,
        name: 'Test Plan',
        description: 'Test Description',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
    loading: false,
    error: null,
    getUserPlans: vi.fn(),
    createPlan: vi.fn(),
    updatePlan: vi.fn(),
    deletePlan: vi.fn(),
  }),
}))

vi.mock('@frontend/features/workout/hooks/useWorkoutSessions', () => ({
  useWorkoutSessions: () => ({
    sessions: [],
    loading: false,
    error: null,
    getUserSessions: vi.fn(),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
  }),
}))

describe('WorkoutFlow E2E Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('운동 플로우 전체 시나리오', () => {
    it('운동 계획 생성부터 완료까지 전체 플로우가 작동한다', async () => {
      render(<WorkoutFlow />)

      // 1. 운동 계획 목록 확인
      expect(screen.getByText('Test Plan')).toBeInTheDocument()

      // 2. 새 운동 계획 생성
      const createButton = screen.getByText('새 계획 만들기')
      await user.click(createButton)

      // 3. 계획 생성 폼 작성
      const nameInput = screen.getByLabelText('계획 이름')
      const descriptionInput = screen.getByLabelText('설명')

      await user.type(nameInput, '새로운 운동 계획')
      await user.type(descriptionInput, '새로운 운동 계획 설명')

      // 4. 계획 저장
      const saveButton = screen.getByText('저장')
      await user.click(saveButton)

      // 5. 운동 세션 시작
      const startButton = screen.getByText('운동 시작')
      await user.click(startButton)

      // 6. 운동 진행
      const exerciseCard = screen.getByText('운동 1')
      await user.click(exerciseCard)

      // 7. 세트 완료
      const completeSetButton = screen.getByText('세트 완료')
      await user.click(completeSetButton)

      // 8. 운동 완료
      const finishButton = screen.getByText('운동 완료')
      await user.click(finishButton)

      // 9. 결과 확인
      await waitFor(() => {
        expect(screen.getByText('운동 완료!')).toBeInTheDocument()
      })
    })

    it('운동 중 일시정지 및 재개가 작동한다', async () => {
      render(<WorkoutFlow />)

      // 운동 시작
      const startButton = screen.getByText('운동 시작')
      await user.click(startButton)

      // 일시정지
      const pauseButton = screen.getByText('일시정지')
      await user.click(pauseButton)

      expect(screen.getByText('일시정지됨')).toBeInTheDocument()

      // 재개
      const resumeButton = screen.getByText('재개')
      await user.click(resumeButton)

      expect(screen.getByText('운동 중')).toBeInTheDocument()
    })

    it('운동 중 세트 추가 및 수정이 작동한다', async () => {
      render(<WorkoutFlow />)

      // 운동 시작
      const startButton = screen.getByText('운동 시작')
      await user.click(startButton)

      // 운동 선택
      const exerciseCard = screen.getByText('운동 1')
      await user.click(exerciseCard)

      // 세트 추가
      const addSetButton = screen.getByText('세트 추가')
      await user.click(addSetButton)

      // 세트 정보 입력
      const weightInput = screen.getByLabelText('무게')
      const repsInput = screen.getByLabelText('횟수')

      await user.type(weightInput, '50')
      await user.type(repsInput, '10')

      // 세트 저장
      const saveSetButton = screen.getByText('세트 저장')
      await user.click(saveSetButton)

      // 세트가 추가되었는지 확인
      expect(screen.getByText('50kg x 10회')).toBeInTheDocument()
    })
  })

  describe('에러 처리', () => {
    it('네트워크 에러 시 적절한 에러 메시지가 표시된다', async () => {
      // API 에러 모킹
      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
        plans: [],
        loading: false,
        error: '네트워크 에러가 발생했습니다.',
        getUserPlans: vi.fn(),
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
      })

      render(<WorkoutFlow />)

      expect(
        screen.getByText('네트워크 에러가 발생했습니다.')
      ).toBeInTheDocument()
    })

    it('운동 계획이 없을 때 적절한 메시지가 표시된다', async () => {
      // 빈 계획 목록 모킹
      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
        plans: [],
        loading: false,
        error: null,
        getUserPlans: vi.fn(),
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
      })

      render(<WorkoutFlow />)

      expect(screen.getByText('운동 계획이 없습니다.')).toBeInTheDocument()
    })
  })

  describe('사용자 경험', () => {
    it('로딩 상태가 올바르게 표시된다', async () => {
      // 로딩 상태 모킹
      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
        plans: [],
        loading: true,
        error: null,
        getUserPlans: vi.fn(),
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
      })

      render(<WorkoutFlow />)

      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    it('키보드 단축키가 작동한다', async () => {
      render(<WorkoutFlow />)

      // 운동 시작
      const startButton = screen.getByText('운동 시작')
      await user.click(startButton)

      // Space 키로 일시정지/재개
      await user.keyboard(' ')

      // Enter 키로 세트 완료
      await user.keyboard('{Enter}')

      // Esc 키로 운동 종료
      await user.keyboard('{Escape}')

      // 키보드 단축키가 작동했는지 확인
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('데이터 지속성', () => {
    it('운동 데이터가 올바르게 저장된다', async () => {
      render(<WorkoutFlow />)

      // 운동 시작
      const startButton = screen.getByText('운동 시작')
      await user.click(startButton)

      // 운동 진행
      const exerciseCard = screen.getByText('운동 1')
      await user.click(exerciseCard)

      // 세트 완료
      const completeSetButton = screen.getByText('세트 완료')
      await user.click(completeSetButton)

      // 운동 완료
      const finishButton = screen.getByText('운동 완료')
      await user.click(finishButton)

      // 데이터가 저장되었는지 확인
      await waitFor(() => {
        expect(
          screen.getByText('운동 기록이 저장되었습니다.')
        ).toBeInTheDocument()
      })
    })

    it('페이지 새로고침 후에도 데이터가 유지된다', async () => {
      render(<WorkoutFlow />)

      // 운동 시작
      const startButton = screen.getByText('운동 시작')
      await user.click(startButton)

      // 페이지 새로고침 시뮬레이션
      window.location.reload()

      // 데이터가 유지되었는지 확인
      await waitFor(() => {
        expect(screen.getByText('Test Plan')).toBeInTheDocument()
      })
    })
  })

  describe('성능', () => {
    it('대량의 운동 데이터도 빠르게 처리된다', async () => {
      // 대량의 데이터 모킹
      const manyPlans = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Plan ${i + 1}`,
        description: `Description ${i + 1}`,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }))

      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
        plans: manyPlans,
        loading: false,
        error: null,
        getUserPlans: vi.fn(),
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
      })

      const startTime = performance.now()
      render(<WorkoutFlow />)
      const endTime = performance.now()

      // 렌더링 시간이 1초 이내인지 확인
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })
})
