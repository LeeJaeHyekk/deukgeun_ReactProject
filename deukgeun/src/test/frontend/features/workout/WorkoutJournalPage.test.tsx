import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import WorkoutJournalPage from "../../../../../frontend/features/workout/WorkoutJournalPage"
import { AuthContext } from "../../../../../frontend/shared/contexts/AuthContext"
import { WorkoutTimerContext } from "../../../../../frontend/shared/contexts/WorkoutTimerContext"
import type { User } from "../../../../../types"

// Mock the hooks
jest.mock("../../../../../frontend/features/workout/hooks/useWorkoutPlans")
jest.mock("../../../../../frontend/features/workout/hooks/useWorkoutSessions")
jest.mock("../../../../../frontend/features/workout/hooks/useWorkoutGoals")
jest.mock("../../../../../frontend/shared/hooks/useMachines")
jest.mock("../../../../../frontend/shared/api/workoutJournalApi")
jest.mock(
  "../../../../../frontend/features/workout/services/WorkoutSessionService"
)

// Mock components
jest.mock("../../../../../frontend/widgets/Navigation/Navigation", () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}))

jest.mock("../../../../../frontend/shared/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}))

jest.mock(
  "../../../../../frontend/features/workout/components/GlobalWorkoutTimer",
  () => ({
    GlobalWorkoutTimer: ({
      onOpenSessionModal,
    }: {
      onOpenSessionModal: () => void
    }) => (
      <div data-testid="global-workout-timer">
        <button onClick={onOpenSessionModal}>Open Session Modal</button>
      </div>
    ),
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/WorkoutPlanCard",
  () => ({
    WorkoutPlanCard: ({ plan, onEdit, onDelete, onStart }: any) => (
      <div data-testid={`plan-card-${plan.id}`}>
        <h3>{plan.name}</h3>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onStart}>Start</button>
      </div>
    ),
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/SessionCard",
  () => ({
    SessionCard: ({ session, onEdit, onDelete, onStart }: any) => (
      <div data-testid={`session-card-${session.id}`}>
        <h3>{session.name}</h3>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onStart}>Start</button>
      </div>
    ),
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/WorkoutPlanModal",
  () => ({
    WorkoutPlanModal: ({ isOpen, onClose, onSave }: any) =>
      isOpen ? (
        <div data-testid="workout-plan-modal">
          <h2>Workout Plan Modal</h2>
          <button onClick={onClose}>Close</button>
          <button onClick={() => onSave({ name: "Test Plan" })}>Save</button>
        </div>
      ) : null,
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/WorkoutSessionModal",
  () => ({
    WorkoutSessionModal: ({ isOpen, onClose, onSave }: any) =>
      isOpen ? (
        <div data-testid="workout-session-modal">
          <h2>Workout Session Modal</h2>
          <button onClick={onClose}>Close</button>
          <button onClick={() => onSave({ name: "Test Session" })}>Save</button>
        </div>
      ) : null,
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/WorkoutGoalModal",
  () => ({
    WorkoutGoalModal: ({ isOpen, onClose, onSave }: any) =>
      isOpen ? (
        <div data-testid="workout-goal-modal">
          <h2>Workout Goal Modal</h2>
          <button onClick={onClose}>Close</button>
          <button onClick={() => onSave({ title: "Test Goal" })}>Save</button>
        </div>
      ) : null,
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/WorkoutSectionModal",
  () => ({
    WorkoutSectionModal: ({ isOpen, onClose, onSave }: any) =>
      isOpen ? (
        <div data-testid="workout-section-modal">
          <h2>Workout Section Modal</h2>
          <button onClick={onClose}>Close</button>
          <button onClick={() => onSave({ exerciseName: "Test Exercise" })}>
            Save
          </button>
        </div>
      ) : null,
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/ProgressChart",
  () => ({
    ProgressChart: ({ data, title }: any) => (
      <div data-testid="progress-chart">
        <h3>{title}</h3>
        <div>Data: {data.length} items</div>
      </div>
    ),
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/GoalProgressBar",
  () => ({
    GoalProgressBar: ({ goal }: any) => (
      <div data-testid="goal-progress-bar">
        <div>Goal: {goal.title}</div>
        <div>
          Progress: {goal.currentValue}/{goal.targetValue}
        </div>
      </div>
    ),
  })
)

jest.mock(
  "../../../../../frontend/features/workout/components/WorkoutCalendar",
  () => ({
    WorkoutCalendar: ({ sessions }: any) => (
      <div data-testid="workout-calendar">
        <h3>Workout Calendar</h3>
        <div>Sessions: {sessions.length}</div>
      </div>
    ),
  })
)

// Mock data
const mockUser: User = {
  id: 1,
  email: "test@example.com",
  nickname: "TestUser",
  birthDate: new Date("1990-01-01"),
  gender: "male",
  phoneNumber: "010-1234-5678",
  level: 1,
  exp: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockPlans = [
  {
    id: 1,
    userId: 1,
    name: "상체 운동",
    description: "상체 근력 향상을 위한 운동",
    difficulty: "intermediate",
    estimatedDurationMinutes: 60,
    targetMuscleGroups: ["chest", "back", "shoulders"],
    isActive: true,
    exercises: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockSessions = [
  {
    id: 1,
    userId: 1,
    name: "오늘의 상체 운동",
    description: "상체 근력 향상을 위한 운동 세션",
    startTime: new Date("2024-01-15T10:00:00Z"),
    endTime: new Date("2024-01-15T11:00:00Z"),
    duration: 60,
    caloriesBurned: 300,
    notes: "컨디션이 좋았다",
    isCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockGoals = [
  {
    id: 1,
    userId: 1,
    title: "벤치프레스 100kg 달성",
    description: "3개월 내에 벤치프레스 100kg 달성",
    type: "weight" as const,
    targetValue: 100,
    currentValue: 80,
    unit: "kg",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockMachines = [
  {
    id: 1,
    name: "벤치프레스",
    description: "가슴 근육을 발달시키는 운동",
    category: "chest",
    difficulty: "intermediate",
    instructions: "벤치에 누워서 바벨을 밀어올리는 운동",
    imageUrl: "/images/bench-press.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Mock hook implementations
const mockUseWorkoutPlans = {
  plans: mockPlans,
  loading: false,
  error: null,
  getUserPlans: jest.fn(),
  createPlan: jest.fn(),
  updatePlan: jest.fn(),
  deletePlan: jest.fn(),
  clearError: jest.fn(),
}

const mockUseWorkoutSessions = {
  sessions: mockSessions,
  loading: false,
  error: null,
  getUserSessions: jest.fn(),
  createSession: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  clearError: jest.fn(),
}

const mockUseWorkoutGoals = {
  goals: mockGoals,
  loading: false,
  error: null,
  getUserGoals: jest.fn(),
  createGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
  clearError: jest.fn(),
}

const mockUseMachines = {
  machines: mockMachines,
  loading: false,
  error: null,
  getMachines: jest.fn(),
}

const mockWorkoutTimer = {
  timerState: { isRunning: false, elapsedTime: 0 },
  sessionState: { isActive: false, currentSession: null },
  startTimer: jest.fn(),
  pauseTimer: jest.fn(),
  resumeTimer: jest.fn(),
  stopTimer: jest.fn(),
  isSessionActive: false,
}

// Mock the hooks
const {
  useWorkoutPlans,
} = require("../../../../../frontend/features/workout/hooks/useWorkoutPlans")
const {
  useWorkoutSessions,
} = require("../../../../../frontend/features/workout/hooks/useWorkoutSessions")
const {
  useWorkoutGoals,
} = require("../../../../../frontend/features/workout/hooks/useWorkoutGoals")
const {
  useMachines,
} = require("../../../../../frontend/shared/hooks/useMachines")

useWorkoutPlans.mockReturnValue(mockUseWorkoutPlans)
useWorkoutSessions.mockReturnValue(mockUseWorkoutSessions)
useWorkoutGoals.mockReturnValue(mockUseWorkoutGoals)
useMachines.mockReturnValue(mockUseMachines)

// Mock API
const {
  WorkoutJournalApi,
} = require("../../../../../frontend/shared/api/workoutJournalApi")
WorkoutJournalApi.getDashboardData = jest.fn().mockResolvedValue({
  summary: {
    totalPlans: 5,
    totalSessions: 20,
    completedSessions: 18,
    activeGoals: 3,
  },
  weeklyStats: {
    totalSessions: 4,
    totalDuration: 240,
    averageMood: 4.2,
    averageEnergy: 3.8,
  },
  recentSessions: [],
  recentProgress: [],
  activeGoals: [],
})

// Mock service
const WorkoutSessionService = require("../../../../../frontend/features/workout/services/WorkoutSessionService")
WorkoutSessionService.getInstance = jest.fn().mockReturnValue({
  startSession: jest.fn(),
  pauseSession: jest.fn(),
  resumeSession: jest.fn(),
  completeSession: jest.fn(),
})

describe("WorkoutJournalPage", () => {
  const renderWithProviders = (isLoggedIn = true) => {
    return render(
      <AuthContext.Provider
        value={{
          isLoggedIn,
          user: isLoggedIn ? mockUser : null,
          login: jest.fn(),
          logout: jest.fn(),
          register: jest.fn(),
          loading: false,
        }}
      >
        <WorkoutTimerContext.Provider value={mockWorkoutTimer}>
          <WorkoutJournalPage />
        </WorkoutTimerContext.Provider>
      </AuthContext.Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Authentication", () => {
    it("should show login required message when user is not logged in", () => {
      renderWithProviders(false)

      expect(screen.getByText("로그인이 필요합니다")).toBeInTheDocument()
      expect(
        screen.getByText("운동일지를 사용하려면 로그인해주세요.")
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "로그인하기" })
      ).toBeInTheDocument()
    })

    it("should render the page when user is logged in", () => {
      renderWithProviders(true)

      expect(screen.getByText("운동일지")).toBeInTheDocument()
      expect(
        screen.getByText("당신의 운동 여정을 기록하고 추적하세요")
      ).toBeInTheDocument()
    })
  })

  describe("Navigation", () => {
    it("should render navigation component", () => {
      renderWithProviders(true)

      expect(screen.getByTestId("navigation")).toBeInTheDocument()
    })

    it("should render global workout timer", () => {
      renderWithProviders(true)

      expect(screen.getByTestId("global-workout-timer")).toBeInTheDocument()
    })
  })

  describe("Tab Navigation", () => {
    it("should render all tab buttons", () => {
      renderWithProviders(true)

      expect(screen.getByText("개요")).toBeInTheDocument()
      expect(screen.getByText("운동 계획")).toBeInTheDocument()
      expect(screen.getByText("운동 세션")).toBeInTheDocument()
      expect(screen.getByText("운동 목표")).toBeInTheDocument()
      expect(screen.getByText("진행 상황")).toBeInTheDocument()
    })

    it("should switch between tabs when clicked", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      // Click on "운동 계획" tab
      await user.click(screen.getByText("운동 계획"))
      expect(screen.getByText("운동 계획")).toBeInTheDocument()

      // Click on "운동 세션" tab
      await user.click(screen.getByText("운동 세션"))
      expect(screen.getByText("운동 세션")).toBeInTheDocument()

      // Click on "운동 목표" tab
      await user.click(screen.getByText("운동 목표"))
      expect(screen.getByText("운동 목표")).toBeInTheDocument()

      // Click on "진행 상황" tab
      await user.click(screen.getByText("진행 상황"))
      expect(screen.getByText("진행 상황")).toBeInTheDocument()
    })
  })

  describe("Overview Tab", () => {
    it("should render overview content by default", () => {
      renderWithProviders(true)

      expect(screen.getByText("개요")).toBeInTheDocument()
      expect(screen.getByText("운동 계획")).toBeInTheDocument()
      expect(screen.getByText("운동 세션")).toBeInTheDocument()
      expect(screen.getByText("운동 목표")).toBeInTheDocument()
    })

    it("should render dashboard summary", async () => {
      renderWithProviders(true)

      await waitFor(() => {
        expect(WorkoutJournalApi.getDashboardData).toHaveBeenCalled()
      })
    })
  })

  describe("Plans Tab", () => {
    it("should render workout plans", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 계획"))

      expect(screen.getByText("운동 계획")).toBeInTheDocument()
      expect(screen.getByText("새 계획 만들기")).toBeInTheDocument()
      expect(screen.getByTestId("plan-card-1")).toBeInTheDocument()
      expect(screen.getByText("상체 운동")).toBeInTheDocument()
    })

    it("should open plan modal when create button is clicked", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 계획"))
      await user.click(screen.getByText("새 계획 만들기"))

      expect(screen.getByTestId("workout-plan-modal")).toBeInTheDocument()
    })

    it("should handle plan card actions", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 계획"))

      const planCard = screen.getByTestId("plan-card-1")
      expect(planCard).toBeInTheDocument()

      // Test edit button
      await user.click(screen.getByText("Edit"))
      expect(screen.getByTestId("workout-plan-modal")).toBeInTheDocument()

      // Close modal
      await user.click(screen.getByText("Close"))

      // Test delete button
      await user.click(screen.getByText("Delete"))
      // Should show confirmation dialog (mocked by window.confirm)
    })
  })

  describe("Sessions Tab", () => {
    it("should render workout sessions", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 세션"))

      expect(screen.getByText("운동 세션")).toBeInTheDocument()
      expect(screen.getByText("새 세션 시작")).toBeInTheDocument()
      expect(screen.getByTestId("session-card-1")).toBeInTheDocument()
      expect(screen.getByText("오늘의 상체 운동")).toBeInTheDocument()
    })

    it("should open session modal when create button is clicked", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 세션"))
      await user.click(screen.getByText("새 세션 시작"))

      expect(screen.getByTestId("workout-session-modal")).toBeInTheDocument()
    })

    it("should handle session card actions", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 세션"))

      const sessionCard = screen.getByTestId("session-card-1")
      expect(sessionCard).toBeInTheDocument()

      // Test edit button
      await user.click(screen.getByText("Edit"))
      expect(screen.getByTestId("workout-session-modal")).toBeInTheDocument()

      // Close modal
      await user.click(screen.getByText("Close"))

      // Test delete button
      await user.click(screen.getByText("Delete"))
      // Should show confirmation dialog
    })
  })

  describe("Goals Tab", () => {
    it("should render workout goals", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 목표"))

      expect(screen.getByText("운동 목표")).toBeInTheDocument()
      expect(screen.getByText("새 목표 설정")).toBeInTheDocument()
      expect(screen.getByText("벤치프레스 100kg 달성")).toBeInTheDocument()
    })

    it("should open goal modal when create button is clicked", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 목표"))
      await user.click(screen.getByText("새 목표 설정"))

      expect(screen.getByTestId("workout-goal-modal")).toBeInTheDocument()
    })

    it("should render goal progress bars", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 목표"))

      expect(screen.getByTestId("goal-progress-bar")).toBeInTheDocument()
      expect(
        screen.getByText("Goal: 벤치프레스 100kg 달성")
      ).toBeInTheDocument()
      expect(screen.getByText("Progress: 80/100")).toBeInTheDocument()
    })
  })

  describe("Progress Tab", () => {
    it("should render progress charts", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("진행 상황"))

      expect(screen.getByText("진행 상황")).toBeInTheDocument()
      expect(screen.getByTestId("progress-chart")).toBeInTheDocument()
      expect(screen.getByTestId("workout-calendar")).toBeInTheDocument()
    })
  })

  describe("Loading States", () => {
    it("should show loading spinner when data is loading", () => {
      // Mock loading state
      useWorkoutPlans.mockReturnValue({ ...mockUseWorkoutPlans, loading: true })
      useWorkoutSessions.mockReturnValue({
        ...mockUseWorkoutSessions,
        loading: true,
      })
      useWorkoutGoals.mockReturnValue({ ...mockUseWorkoutGoals, loading: true })
      useMachines.mockReturnValue({ ...mockUseMachines, loading: true })

      renderWithProviders(true)

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
    })
  })

  describe("Error Handling", () => {
    it("should show error message when there is an error", () => {
      // Mock error state
      useWorkoutPlans.mockReturnValue({
        ...mockUseWorkoutPlans,
        error: "Failed to load plans",
      })

      renderWithProviders(true)

      expect(screen.getByText("Failed to load plans")).toBeInTheDocument()
    })

    it("should allow retrying when there is an error", async () => {
      const user = userEvent.setup()
      const mockGetUserPlans = jest.fn()
      const mockClearError = jest.fn()

      useWorkoutPlans.mockReturnValue({
        ...mockUseWorkoutPlans,
        error: "Failed to load plans",
        getUserPlans: mockGetUserPlans,
        clearError: mockClearError,
      })

      renderWithProviders(true)

      const retryButton = screen.getByText("다시 시도")
      await user.click(retryButton)

      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe("Modal Interactions", () => {
    it("should open and close plan modal", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("운동 계획"))
      await user.click(screen.getByText("새 계획 만들기"))

      expect(screen.getByTestId("workout-plan-modal")).toBeInTheDocument()

      await user.click(screen.getByText("Close"))
      expect(screen.queryByTestId("workout-plan-modal")).not.toBeInTheDocument()
    })

    it("should save plan when save button is clicked", async () => {
      const user = userEvent.setup()
      const mockCreatePlan = jest.fn().mockResolvedValue(mockPlans[0])
      useWorkoutPlans.mockReturnValue({
        ...mockUseWorkoutPlans,
        createPlan: mockCreatePlan,
      })

      renderWithProviders(true)

      await user.click(screen.getByText("운동 계획"))
      await user.click(screen.getByText("새 계획 만들기"))
      await user.click(screen.getByText("Save"))

      expect(mockCreatePlan).toHaveBeenCalledWith({ name: "Test Plan" })
    })
  })

  describe("Global Workout Timer", () => {
    it("should open session modal from global timer", async () => {
      const user = userEvent.setup()
      renderWithProviders(true)

      await user.click(screen.getByText("Open Session Modal"))

      expect(screen.getByTestId("workout-session-modal")).toBeInTheDocument()
    })
  })

  describe("Data Loading", () => {
    it("should load all data on mount", async () => {
      renderWithProviders(true)

      await waitFor(() => {
        expect(WorkoutJournalApi.getDashboardData).toHaveBeenCalled()
        expect(mockUseWorkoutPlans.getUserPlans).toHaveBeenCalled()
        expect(mockUseWorkoutSessions.getUserSessions).toHaveBeenCalled()
        expect(mockUseWorkoutGoals.getUserGoals).toHaveBeenCalled()
        expect(mockUseMachines.getMachines).toHaveBeenCalled()
      })
    })
  })
})
