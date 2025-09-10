import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@frontend/shared/utils/testUtils'
import WorkoutPage from './WorkoutPage'

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

describe('WorkoutPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('운동 페이지가 올바르게 렌더링된다', () => {
      render(<WorkoutPage />)

      expect(screen.getByText('운동 계획')).toBeInTheDocument()
      expect(screen.getByText('Test Plan')).toBeInTheDocument()
    })

    it('새 계획 만들기 버튼이 표시된다', () => {
      render(<WorkoutPage />)

      expect(screen.getByText('새 계획 만들기')).toBeInTheDocument()
    })

    it('운동 계획 목록이 표시된다', () => {
      render(<WorkoutPage />)

      expect(screen.getByText('Test Plan')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용', () => {
    it('새 계획 만들기 버튼 클릭 시 모달이 열린다', async () => {
      render(<WorkoutPage />)

      const createButton = screen.getByText('새 계획 만들기')
      await user.click(createButton)

      expect(screen.getByText('새 운동 계획 만들기')).toBeInTheDocument()
    })

    it('운동 계획 카드 클릭 시 상세 페이지로 이동한다', async () => {
      render(<WorkoutPage />)

      const planCard = screen.getByText('Test Plan')
      await user.click(planCard)

      // 상세 페이지로 이동했는지 확인
      expect(screen.getByText('운동 계획 상세')).toBeInTheDocument()
    })

    it('계획 편집 버튼 클릭 시 편집 모달이 열린다', async () => {
      render(<WorkoutPage />)

      const editButton = screen.getByTitle('편집')
      await user.click(editButton)

      expect(screen.getByText('운동 계획 편집')).toBeInTheDocument()
    })

    it('계획 삭제 버튼 클릭 시 확인 다이얼로그가 표시된다', async () => {
      render(<WorkoutPage />)

      const deleteButton = screen.getByTitle('삭제')
      await user.click(deleteButton)

      expect(screen.getByText('정말로 삭제하시겠습니까?')).toBeInTheDocument()
    })
  })

  describe('계획 생성', () => {
    it('새 계획을 성공적으로 생성한다', async () => {
      const mockCreatePlan = vi.fn().mockResolvedValue({
        id: 2,
        name: 'New Plan',
        description: 'New Description',
        isActive: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      })

      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
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
        createPlan: mockCreatePlan,
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
      })

      render(<WorkoutPage />)

      // 새 계획 만들기 버튼 클릭
      const createButton = screen.getByText('새 계획 만들기')
      await user.click(createButton)

      // 폼 작성
      const nameInput = screen.getByLabelText('계획 이름')
      const descriptionInput = screen.getByLabelText('설명')

      await user.type(nameInput, 'New Plan')
      await user.type(descriptionInput, 'New Description')

      // 저장 버튼 클릭
      const saveButton = screen.getByText('저장')
      await user.click(saveButton)

      expect(mockCreatePlan).toHaveBeenCalledWith({
        name: 'New Plan',
        description: 'New Description',
        isActive: true,
      })
    })

    it('계획 생성 실패 시 에러 메시지가 표시된다', async () => {
      const mockCreatePlan = vi.fn().mockRejectedValue(new Error('생성 실패'))

      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
        plans: [],
        loading: false,
        error: null,
        getUserPlans: vi.fn(),
        createPlan: mockCreatePlan,
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
      })

      render(<WorkoutPage />)

      // 새 계획 만들기 버튼 클릭
      const createButton = screen.getByText('새 계획 만들기')
      await user.click(createButton)

      // 폼 작성
      const nameInput = screen.getByLabelText('계획 이름')
      await user.type(nameInput, 'New Plan')

      // 저장 버튼 클릭
      const saveButton = screen.getByText('저장')
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('생성 실패')).toBeInTheDocument()
      })
    })
  })

  describe('계획 편집', () => {
    it('계획을 성공적으로 편집한다', async () => {
      const mockUpdatePlan = vi.fn().mockResolvedValue({
        id: 1,
        name: 'Updated Plan',
        description: 'Updated Description',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      })

      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
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
        updatePlan: mockUpdatePlan,
        deletePlan: vi.fn(),
      })

      render(<WorkoutPage />)

      // 편집 버튼 클릭
      const editButton = screen.getByTitle('편집')
      await user.click(editButton)

      // 폼 수정
      const nameInput = screen.getByLabelText('계획 이름')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Plan')

      // 저장 버튼 클릭
      const saveButton = screen.getByText('저장')
      await user.click(saveButton)

      expect(mockUpdatePlan).toHaveBeenCalledWith(1, {
        name: 'Updated Plan',
        description: 'Test Description',
        isActive: true,
      })
    })
  })

  describe('계획 삭제', () => {
    it('계획을 성공적으로 삭제한다', async () => {
      const mockDeletePlan = vi.fn().mockResolvedValue(undefined)

      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
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
        deletePlan: mockDeletePlan,
      })

      render(<WorkoutPage />)

      // 삭제 버튼 클릭
      const deleteButton = screen.getByTitle('삭제')
      await user.click(deleteButton)

      // 확인 다이얼로그에서 확인 버튼 클릭
      const confirmButton = screen.getByText('확인')
      await user.click(confirmButton)

      expect(mockDeletePlan).toHaveBeenCalledWith(1)
    })

    it('삭제 취소 시 계획이 삭제되지 않는다', async () => {
      const mockDeletePlan = vi.fn()

      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
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
        deletePlan: mockDeletePlan,
      })

      render(<WorkoutPage />)

      // 삭제 버튼 클릭
      const deleteButton = screen.getByTitle('삭제')
      await user.click(deleteButton)

      // 확인 다이얼로그에서 취소 버튼 클릭
      const cancelButton = screen.getByText('취소')
      await user.click(cancelButton)

      expect(mockDeletePlan).not.toHaveBeenCalled()
    })
  })

  describe('로딩 상태', () => {
    it('로딩 중일 때 로딩 스피너가 표시된다', () => {
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

      render(<WorkoutPage />)

      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('에러 발생 시 에러 메시지가 표시된다', () => {
      vi.mocked(
        require('@frontend/features/workout/hooks/useWorkoutPlans')
          .useWorkoutPlans
      ).mockReturnValue({
        plans: [],
        loading: false,
        error: '데이터를 불러올 수 없습니다.',
        getUserPlans: vi.fn(),
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
      })

      render(<WorkoutPage />)

      expect(
        screen.getByText('데이터를 불러올 수 없습니다.')
      ).toBeInTheDocument()
    })
  })

  describe('빈 상태', () => {
    it('계획이 없을 때 적절한 메시지가 표시된다', () => {
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

      render(<WorkoutPage />)

      expect(screen.getByText('아직 운동 계획이 없습니다.')).toBeInTheDocument()
      expect(screen.getByText('새 계획을 만들어보세요!')).toBeInTheDocument()
    })
  })
})
