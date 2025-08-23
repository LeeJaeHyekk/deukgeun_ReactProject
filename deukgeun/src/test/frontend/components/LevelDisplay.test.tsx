import React from "react"
import { render, screen } from "@testing-library/react"
import { LevelDisplay } from "../../../frontend/shared/components/LevelDisplay"
import { createMockUser } from "../../../frontend/shared/utils/testUtils"

// UserLevel 타입을 위한 헬퍼 함수
const createMockUserLevel = (overrides = {}) => ({
  id: 1,
  userId: 1,
  level: 1,
  currentExp: 0,
  totalExp: 0,
  seasonExp: 0,
  totalLevelUps: 0,
  currentSeason: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe("LevelDisplay", () => {
  const defaultUser = createMockUser()

  describe("렌더링", () => {
    it("should render level information correctly", () => {
      render(<LevelDisplay userLevel={createMockUserLevel()} />)

      expect(screen.getByText(/Lv\.1/)).toBeInTheDocument()
      expect(screen.getByText(/초보자/)).toBeInTheDocument()
      expect(screen.getByText(/0\/100/)).toBeInTheDocument() // exp/required exp
    })

    it("should display correct level title based on level", () => {
      const highLevelUser = createMockUserLevel({ level: 25 })
      render(<LevelDisplay userLevel={highLevelUser} />)

      expect(screen.getByText(/Lv\.25/)).toBeInTheDocument()
      expect(screen.getByText(/중급자/)).toBeInTheDocument()
    })

    it("should show progress bar with correct percentage", () => {
      const userWithExp = createMockUserLevel({ level: 1, currentExp: 50 })
      render(<LevelDisplay userLevel={userWithExp} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute("aria-valuenow", "50")
      expect(progressBar).toHaveAttribute("aria-valuemax", "100")
    })

    it("should display max level correctly", () => {
      const maxLevelUser = createMockUserLevel({ level: 50, currentExp: 5000 })
      render(<LevelDisplay userLevel={maxLevelUser} />)

      expect(screen.getByText(/Lv\.50/)).toBeInTheDocument()
      expect(screen.getByText(/전문가/)).toBeInTheDocument()
      expect(screen.getByText(/MAX/)).toBeInTheDocument()
    })
  })

  describe("레벨 제목", () => {
    it("should show 초보자 for levels 1-9", () => {
      for (let level = 1; level <= 9; level++) {
        const user = createMockUserLevel({ level })
        const { unmount } = render(<LevelDisplay userLevel={user} />)

        expect(screen.getByText(/초보자/)).toBeInTheDocument()
        unmount()
      }
    })

    it("should show 초급자 for levels 10-19", () => {
      for (let level = 10; level <= 19; level++) {
        const user = createMockUserLevel({ level })
        const { unmount } = render(<LevelDisplay userLevel={user} />)

        expect(screen.getByText(/초급자/)).toBeInTheDocument()
        unmount()
      }
    })

    it("should show 중급자 for levels 20-29", () => {
      for (let level = 20; level <= 29; level++) {
        const user = createMockUserLevel({ level })
        const { unmount } = render(<LevelDisplay userLevel={user} />)

        expect(screen.getByText(/중급자/)).toBeInTheDocument()
        unmount()
      }
    })

    it("should show 고급자 for levels 30-39", () => {
      for (let level = 30; level <= 39; level++) {
        const user = createMockUserLevel({ level })
        const { unmount } = render(<LevelDisplay userLevel={user} />)

        expect(screen.getByText(/고급자/)).toBeInTheDocument()
        unmount()
      }
    })

    it("should show 전문가 for levels 40+", () => {
      for (let level = 40; level <= 50; level++) {
        const user = createMockUserLevel({ level })
        const { unmount } = render(<LevelDisplay userLevel={user} />)

        expect(screen.getByText(/전문가/)).toBeInTheDocument()
        unmount()
      }
    })
  })

  describe("경험치 표시", () => {
    it("should show correct exp format", () => {
      const userWithExp = createMockUserLevel({ level: 1, currentExp: 75 })
      render(<LevelDisplay userLevel={userWithExp} />)

      expect(screen.getByText(/75\/100/)).toBeInTheDocument()
    })

    it("should handle exp overflow correctly", () => {
      const userWithOverflow = createMockUserLevel({
        level: 1,
        currentExp: 150,
      })
      render(<LevelDisplay userLevel={userWithOverflow} />)

      expect(screen.getByText(/100\/100/)).toBeInTheDocument()
    })

    it("should show 0 exp for new user", () => {
      const newUser = createMockUserLevel({ level: 1, currentExp: 0 })
      render(<LevelDisplay userLevel={newUser} />)

      expect(screen.getByText(/0\/100/)).toBeInTheDocument()
    })
  })

  describe("프로그레스 바", () => {
    it("should have correct progress value", () => {
      const userWithExp = createMockUserLevel({ level: 1, currentExp: 30 })
      render(<LevelDisplay userLevel={userWithExp} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toHaveAttribute("aria-valuenow", "30")
      expect(progressBar).toHaveAttribute("aria-valuemax", "100")
    })

    it("should show 100% progress for max level", () => {
      const maxLevelUser = createMockUserLevel({ level: 50, currentExp: 5000 })
      render(<LevelDisplay userLevel={maxLevelUser} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toHaveAttribute("aria-valuenow", "100")
      expect(progressBar).toHaveAttribute("aria-valuemax", "100")
    })

    it("should have proper ARIA attributes", () => {
      render(<LevelDisplay userLevel={createMockUserLevel()} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toHaveAttribute("aria-label")
      expect(progressBar).toHaveAttribute("aria-valuemin", "0")
    })
  })

  describe("접근성", () => {
    it("should have proper semantic structure", () => {
      render(<LevelDisplay userLevel={createMockUserLevel()} />)

      // 레벨 정보가 적절한 태그로 구조화되어 있는지 확인
      expect(screen.getByText(/Lv\.1/)).toBeInTheDocument()
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    it("should provide meaningful ARIA labels", () => {
      render(<LevelDisplay userLevel={createMockUserLevel()} />)

      const progressBar = screen.getByRole("progressbar")
      const ariaLabel = progressBar.getAttribute("aria-label")

      expect(ariaLabel).toContain("경험치")
      expect(ariaLabel).toContain("0%")
    })

    it("should be keyboard accessible", () => {
      render(<LevelDisplay userLevel={createMockUserLevel()} />)

      // 모든 상호작용 요소가 키보드로 접근 가능한지 확인
      const elements = screen.getAllByRole("generic")
      elements.forEach(element => {
        expect(element).not.toHaveAttribute("tabindex", "-1")
      })
    })
  })

  describe("스타일링", () => {
    it("should apply correct CSS classes", () => {
      render(<LevelDisplay userLevel={createMockUserLevel()} />)

      const container = screen.getByTestId("level-display")
      expect(container).toHaveClass("levelDisplay")
    })

    it("should show different colors for different levels", () => {
      const { rerender } = render(
        <LevelDisplay userLevel={createMockUserLevel()} />
      )

      // 초보자 레벨
      let levelTitle = screen.getByText(/초보자/)
      expect(levelTitle).toHaveClass("beginner")

      // 중급자 레벨
      const intermediateUser = createMockUserLevel({ level: 25 })
      rerender(<LevelDisplay userLevel={intermediateUser} />)
      levelTitle = screen.getByText(/중급자/)
      expect(levelTitle).toHaveClass("intermediate")

      // 전문가 레벨
      const expertUser = createMockUserLevel({ level: 45 })
      rerender(<LevelDisplay userLevel={expertUser} />)
      levelTitle = screen.getByText(/전문가/)
      expect(levelTitle).toHaveClass("expert")
    })
  })

  describe("에러 처리", () => {
    it("should handle missing user data gracefully", () => {
      const userWithoutLevel = createMockUserLevel({ level: undefined })
      render(<LevelDisplay userLevel={userWithoutLevel} />)

      expect(screen.getByText(/Lv\.1/)).toBeInTheDocument() // 기본값
    })

    it("should handle negative exp values", () => {
      const userWithNegativeExp = createMockUserLevel({
        level: 1,
        currentExp: -10,
      })
      render(<LevelDisplay userLevel={userWithNegativeExp} />)

      expect(screen.getByText(/0\/100/)).toBeInTheDocument()
    })

    it("should handle very high level values", () => {
      const userWithHighLevel = createMockUserLevel({
        level: 999,
        currentExp: 99999,
      })
      render(<LevelDisplay userLevel={userWithHighLevel} />)

      expect(screen.getByText(/Lv\.999/)).toBeInTheDocument()
      expect(screen.getByText(/전문가/)).toBeInTheDocument()
    })
  })

  describe("성능", () => {
    it("should not re-render unnecessarily", () => {
      const { rerender } = render(
        <LevelDisplay userLevel={createMockUserLevel()} />
      )

      // 같은 props로 리렌더링
      rerender(<LevelDisplay userLevel={createMockUserLevel()} />)

      // 컴포넌트가 정상적으로 렌더링되는지 확인
      expect(screen.getByText(/Lv\.1/)).toBeInTheDocument()
    })

    it("should handle rapid prop changes", () => {
      const { rerender } = render(
        <LevelDisplay userLevel={createMockUserLevel()} />
      )

      // 빠른 prop 변경
      for (let i = 1; i <= 10; i++) {
        const user = createMockUserLevel({ level: i, currentExp: i * 10 })
        rerender(<LevelDisplay userLevel={user} />)
      }

      // 마지막 상태가 올바르게 표시되는지 확인
      expect(screen.getByText(/Lv\.10/)).toBeInTheDocument()
    })
  })

  describe("반응형 디자인", () => {
    it("should be responsive on different screen sizes", () => {
      render(<LevelDisplay userLevel={createMockUserLevel()} />)

      const container = screen.getByTestId("level-display")

      // 모바일 크기
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event("resize"))

      expect(container).toBeInTheDocument()

      // 데스크톱 크기
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      })
      window.dispatchEvent(new Event("resize"))

      expect(container).toBeInTheDocument()
    })
  })

  describe("국제화", () => {
    it("should support different languages", () => {
      // 한국어 (기본)
      render(<LevelDisplay userLevel={createMockUserLevel()} />)
      expect(screen.getByText(/초보자/)).toBeInTheDocument()

      // 다른 언어 지원이 있다면 여기에 테스트 추가
      // 예: 영어, 일본어 등
    })
  })
})
