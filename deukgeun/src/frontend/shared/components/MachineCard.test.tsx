import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@frontend/shared/utils/testUtils'
import MachineCard from './MachineCard'
import type { Machine } from '../../../shared/types/dto'

describe('MachineCard', () => {
  const user = userEvent.setup()

  const mockMachine: Machine = {
    id: 1,
    machineKey: 'test-machine-1',
    name: 'Test Machine',
    nameKo: '테스트 머신',
    nameEn: 'Test Machine',
    imageUrl: '/img/machine/test-machine.png',
    shortDesc: '테스트용 머신입니다.',
    detailDesc: '이것은 테스트용 머신의 상세 설명입니다.',
    description: '테스트용 머신',
    instructions: '사용법: 1. 준비 2. 시작 3. 완료',
    positiveEffect: '근력 향상에 도움이 됩니다.',
    category: 'chest',
    targetMuscles: ['가슴', '삼각근'],
    difficulty: 'beginner',
    videoUrl: 'https://example.com/video.mp4',
    isActive: true,
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
    it('머신 카드가 올바르게 렌더링된다', () => {
      render(<MachineCard machine={mockMachine} />)

      expect(screen.getByText(mockMachine.name)).toBeInTheDocument()
      expect(screen.getByText(mockMachine.shortDesc)).toBeInTheDocument()
      expect(screen.getByText(String(mockMachine.category))).toBeInTheDocument()
      expect(
        screen.getByText(String(mockMachine.difficulty))
      ).toBeInTheDocument()
    })

    it('머신 이미지가 올바르게 표시된다', () => {
      render(<MachineCard machine={mockMachine} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', mockMachine.name)
      expect(image).toHaveAttribute('loading', 'lazy')
    })

    it('머신 카테고리가 올바르게 표시된다', () => {
      render(<MachineCard machine={mockMachine} />)

      expect(screen.getByText(String(mockMachine.category))).toBeInTheDocument()
    })

    it('머신 난이도가 올바르게 표시된다', () => {
      render(<MachineCard machine={mockMachine} />)

      expect(
        screen.getByText(String(mockMachine.difficulty))
      ).toBeInTheDocument()
    })

    it('타겟 근육이 올바르게 표시된다', () => {
      render(<MachineCard machine={mockMachine} />)

      expect(screen.getByText('타겟 근육:')).toBeInTheDocument()
      expect(screen.getByText('가슴')).toBeInTheDocument()
      expect(screen.getByText('삼각근')).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용', () => {
    it('카드 클릭 시 onClick 콜백이 호출된다', async () => {
      const mockOnClick = vi.fn()
      render(<MachineCard machine={mockMachine} onClick={mockOnClick} />)

      const card = screen.getByRole('button', { hidden: true })
      await user.click(card)

      expect(mockOnClick).toHaveBeenCalledWith(mockMachine)
    })

    it('showActions가 true일 때 액션 버튼들이 표시된다', () => {
      const mockOnEdit = vi.fn()
      const mockOnDelete = vi.fn()

      render(
        <MachineCard
          machine={mockMachine}
          showActions={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByTitle('편집')).toBeInTheDocument()
      expect(screen.getByTitle('삭제')).toBeInTheDocument()
    })

    it('편집 버튼 클릭 시 onEdit 콜백이 호출된다', async () => {
      const mockOnEdit = vi.fn()

      render(
        <MachineCard
          machine={mockMachine}
          showActions={true}
          onEdit={mockOnEdit}
        />
      )

      const editButton = screen.getByTitle('편집')
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledWith(mockMachine)
    })

    it('삭제 버튼 클릭 시 onDelete 콜백이 호출된다', async () => {
      const mockOnDelete = vi.fn()

      render(
        <MachineCard
          machine={mockMachine}
          showActions={true}
          onDelete={mockOnDelete}
        />
      )

      const deleteButton = screen.getByTitle('삭제')
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledWith(mockMachine)
    })

    it('액션 버튼 클릭 시 이벤트 전파가 중단된다', async () => {
      const mockOnClick = vi.fn()
      const mockOnEdit = vi.fn()

      render(
        <MachineCard
          machine={mockMachine}
          onClick={mockOnClick}
          showActions={true}
          onEdit={mockOnEdit}
        />
      )

      const editButton = screen.getByTitle('편집')
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledWith(mockMachine)
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })

  describe('다양한 머신 타입', () => {
    it('카테고리가 객체 형태일 때 올바르게 처리된다', () => {
      const machineWithObjectCategory: Machine = {
        ...mockMachine,
        category: {
          id: 'chest',
          name: '가슴',
          description: '가슴 운동',
        },
      }

      render(<MachineCard machine={machineWithObjectCategory} />)

      expect(screen.getByText('가슴')).toBeInTheDocument()
    })

    it('난이도가 객체 형태일 때 올바르게 처리된다', () => {
      const machineWithObjectDifficulty: Machine = {
        ...mockMachine,
        difficulty: {
          id: 'beginner',
          name: '초급',
          description: '초급자용',
          level: 1,
        },
      }

      render(<MachineCard machine={machineWithObjectDifficulty} />)

      expect(screen.getByText('초급')).toBeInTheDocument()
    })

    it('타겟 근육이 없는 경우 타겟 근육 섹션이 표시되지 않는다', () => {
      const machineWithoutTargetMuscles: Machine = {
        ...mockMachine,
        targetMuscles: undefined,
      }

      render(<MachineCard machine={machineWithoutTargetMuscles} />)

      expect(screen.queryByText('타겟 근육:')).not.toBeInTheDocument()
    })

    it('타겟 근육이 빈 배열인 경우 타겟 근육 섹션이 표시되지 않는다', () => {
      const machineWithEmptyTargetMuscles: Machine = {
        ...mockMachine,
        targetMuscles: [],
      }

      render(<MachineCard machine={machineWithEmptyTargetMuscles} />)

      expect(screen.queryByText('타겟 근육:')).not.toBeInTheDocument()
    })
  })

  describe('스타일링', () => {
    it('카드에 올바른 CSS 클래스가 적용된다', () => {
      const { container } = render(<MachineCard machine={mockMachine} />)

      expect(container.firstChild).toHaveClass('machine-card')
    })

    it('카테고리 배지에 올바른 색상이 적용된다', () => {
      render(<MachineCard machine={mockMachine} />)

      const categoryBadge = screen.getByText(String(mockMachine.category))
      expect(categoryBadge).toHaveStyle('background-color: #2196F3') // chest color
    })

    it('난이도 배지에 올바른 색상이 적용된다', () => {
      render(<MachineCard machine={mockMachine} />)

      const difficultyBadge = screen.getByText(String(mockMachine.difficulty))
      expect(difficultyBadge).toHaveStyle('background-color: #4CAF50') // beginner color
    })
  })

  describe('이미지 처리', () => {
    it('이미지 로딩 실패 시 기본 처리가 된다', () => {
      render(<MachineCard machine={mockMachine} />)

      const image = screen.getByRole('img')

      // 이미지 에러 이벤트 시뮬레이션
      fireEvent.error(image)

      // 이미지가 여전히 존재하는지 확인
      expect(image).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('이미지에 적절한 alt 텍스트가 설정된다', () => {
      render(<MachineCard machine={mockMachine} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', mockMachine.name)
    })

    it('액션 버튼에 적절한 title이 설정된다', () => {
      render(
        <MachineCard
          machine={mockMachine}
          showActions={true}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.getByTitle('편집')).toBeInTheDocument()
      expect(screen.getByTitle('삭제')).toBeInTheDocument()
    })
  })
})
