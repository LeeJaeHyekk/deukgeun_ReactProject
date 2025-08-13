import { render, screen } from "../../../utils/testUtils"
import { LevelDisplay } from "../LevelDisplay"
import { createMockUserLevel } from "../../../utils/testUtils"

describe("LevelDisplay", () => {
  const mockUserLevel = createMockUserLevel()

  beforeEach(() => {
    // 테스트 환경 설정
    jest.clearAllMocks()
  })

  it("레벨 정보를 올바르게 표시한다", () => {
    render(<LevelDisplay userLevel={mockUserLevel} />)

    // 레벨 번호가 표시되는지 확인
    expect(screen.getByText("5")).toBeInTheDocument()

    // 경험치 정보가 표시되는지 확인
    expect(screen.getByText("1,500")).toBeInTheDocument()
    expect(screen.getByText("5,000")).toBeInTheDocument()
  })

  it("레벨 1일 때 기본 정보를 표시한다", () => {
    const levelOneUser = createMockUserLevel({
      level: 1,
      currentExp: 0,
      totalExp: 0,
    })
    render(<LevelDisplay userLevel={levelOneUser} />)

    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("0")).toBeInTheDocument()
  })

  it("높은 레벨일 때도 올바르게 표시한다", () => {
    const highLevelUser = createMockUserLevel({
      level: 50,
      currentExp: 50000,
      totalExp: 100000,
    })
    render(<LevelDisplay userLevel={highLevelUser} />)

    expect(screen.getByText("50")).toBeInTheDocument()
    expect(screen.getByText("50,000")).toBeInTheDocument()
    expect(screen.getByText("100,000")).toBeInTheDocument()
  })

  it("컴포넌트가 스냅샷과 일치한다", () => {
    const { container } = render(<LevelDisplay userLevel={mockUserLevel} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it("접근성 속성이 올바르게 설정되어 있다", () => {
    render(<LevelDisplay userLevel={mockUserLevel} />)

    // 레벨 정보가 스크린 리더에서 읽을 수 있는지 확인
    const levelElement = screen.getByText("5")
    expect(levelElement).toHaveAttribute(
      "aria-label",
      expect.stringContaining("레벨")
    )
  })
})
