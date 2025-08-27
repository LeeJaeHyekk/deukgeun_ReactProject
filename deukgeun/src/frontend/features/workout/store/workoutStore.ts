// ============================================================================
// Workout Feature Store - Zustand-based State Management
// ============================================================================

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  WorkoutPlanExercise,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  ModalState,
  WorkoutPlanModalState,
  WorkoutSessionModalState,
  WorkoutGoalModalState,
  TabType,
  LoadingState,
  ApiResponse,
  DashboardData,
} from "../types"
import { workoutApi } from "../api/workoutApi"

// ============================================================================
// Store State Interface
// ============================================================================

export interface WorkoutStoreState {
  // Data State
  plans: WorkoutPlan[]
  sessions: WorkoutSession[]
  goals: WorkoutGoal[]
  dashboardData: DashboardData | null

  // Loading States - 개별 탭별 로딩 상태
  loading: {
    overview: LoadingState
    plans: LoadingState
    sessions: LoadingState
    goals: LoadingState
    progress: LoadingState
  }

  // UI State
  activeTab: TabType
  modals: {
    plan: WorkoutPlanModalState
    session: WorkoutSessionModalState
    goal: WorkoutGoalModalState
  }

  // Current Working State - 탭 간 공유 상태
  currentPlan: WorkoutPlan | null
  currentSession: WorkoutSession | null
  currentGoal: WorkoutGoal | null

  // Tab-specific State - 각 탭의 상태 저장
  tabStates: {
    overview: {
      selectedTimeRange: string
      selectedMetrics: string[]
      chartType: string
    }
    plans: {
      selectedPlanId: number | null
      filterStatus: string
      sortBy: string
      viewMode: "grid" | "list"
    }
    sessions: {
      selectedSessionId: number | null
      filterStatus: string
      sortBy: string
      activeSessionId: number | null
    }
    goals: {
      selectedGoalId: number | null
      filterType: string
      sortBy: string
      showCompleted: boolean
    }
    reminders: {
      selectedReminderId: number | null
      filterStatus: string
      sortBy: string
    }
    workoutProgress: {
      selectedTimeRange: string
      selectedMetric: string
      chartType: string
    }
    progress: {
      selectedTimeRange: string
      selectedMetrics: string[]
      chartType: string
      comparisonMode: boolean
    }
  }

  // Cross-tab Shared State - 탭 간 공유되는 상태
  sharedState: {
    lastUpdatedPlan: WorkoutPlan | null
    lastUpdatedSession: WorkoutSession | null
    lastUpdatedGoal: WorkoutGoal | null
    notifications: Array<{
      id: string
      type: "success" | "error" | "info"
      message: string
      timestamp: Date
    }>
    globalLoading: boolean
    globalError: string | null
  }

  // Actions
  // Plans
  fetchPlans: () => Promise<void>
  createPlan: (planData: CreatePlanRequest) => Promise<WorkoutPlan>
  updatePlan: (
    planId: number,
    planData: UpdatePlanRequest
  ) => Promise<WorkoutPlan>
  deletePlan: (planId: number) => Promise<void>

  // Sessions
  fetchSessions: () => Promise<void>
  createSession: (sessionData: CreateSessionRequest) => Promise<WorkoutSession>
  updateSession: (
    sessionId: number,
    sessionData: UpdateSessionRequest
  ) => Promise<WorkoutSession>
  deleteSession: (sessionId: number) => Promise<void>

  // Goals
  fetchGoals: () => Promise<void>
  createGoal: (goalData: CreateGoalRequest) => Promise<WorkoutGoal>
  updateGoal: (
    goalId: number,
    goalData: UpdateGoalRequest
  ) => Promise<WorkoutGoal>
  deleteGoal: (goalId: number) => Promise<void>

  // Dashboard
  fetchDashboardData: () => Promise<void>

  // UI Actions
  setActiveTab: (tab: TabType) => void
  openPlanModal: (mode: "create" | "edit" | "view", plan?: WorkoutPlan) => void
  closePlanModal: () => void
  openSessionModal: (
    mode: "create" | "edit" | "view",
    session?: WorkoutSession
  ) => void
  closeSessionModal: () => void
  openGoalModal: (mode: "create" | "edit" | "view", goal?: WorkoutGoal) => void
  closeGoalModal: () => void

  // Plan Exercise Management
  addPlanExercise: (
    exercise: Omit<WorkoutPlanExercise, "id" | "createdAt" | "updatedAt">
  ) => void
  updatePlanExercise: (index: number, exercise: WorkoutPlanExercise) => void
  removePlanExercise: (index: number) => void
  confirmPlanExercise: (index: number) => void
  unconfirmPlanExercise: (index: number) => void

  // Session Exercise Management
  addSessionExercise: (sessionId: number, exercise: any) => Promise<void>
  removeSessionExercise: (
    sessionId: number,
    exerciseId: number
  ) => Promise<void>
  updateSessionExercise: (
    sessionId: number,
    exerciseId: number,
    exercise: any
  ) => Promise<void>

  // Tab State Management
  updateTabState: <T extends TabType>(
    tab: T,
    updates: Partial<WorkoutStoreState["tabStates"][T]>
  ) => void
  resetTabState: (tab: TabType) => void

  // Shared State Management
  updateSharedState: (
    updates: Partial<WorkoutStoreState["sharedState"]>
  ) => void
  addNotification: (
    notification: Omit<
      WorkoutStoreState["sharedState"]["notifications"][0],
      "id" | "timestamp"
    >
  ) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Utility Actions
  resetStore: () => void
  clearErrors: () => void
  initializeWorkoutData: () => Promise<void>
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: Omit<
  WorkoutStoreState,
  keyof {
    fetchPlans: any
    createPlan: any
    updatePlan: any
    deletePlan: any
    fetchSessions: any
    createSession: any
    updateSession: any
    deleteSession: any
    fetchGoals: any
    createGoal: any
    updateGoal: any
    deleteGoal: any
    fetchDashboardData: any
    setActiveTab: any
    openPlanModal: any
    closePlanModal: any
    openSessionModal: any
    closeSessionModal: any
    openGoalModal: any
    closeGoalModal: any
    addPlanExercise: any
    updatePlanExercise: any
    removePlanExercise: any
    confirmPlanExercise: any
    unconfirmPlanExercise: any
    addSessionExercise: any
    removeSessionExercise: any
    updateSessionExercise: any
    updateTabState: any
    resetTabState: any
    updateSharedState: any
    addNotification: any
    removeNotification: any
    clearNotifications: any
    resetStore: any
    clearErrors: any
    initializeWorkoutData: any
  }
> = {
  plans: [
    {
      id: 1,
      userId: 1,
      name: "초보자 전체 운동",
      description: "운동을 처음 시작하는 분들을 위한 기본 운동 계획입니다.",
      difficulty: "beginner" as const,
      estimatedDurationMinutes: 45,
      targetMuscleGroups: ["전신"],
      isTemplate: false,
      isPublic: false,
      exercises: [
        {
          id: 1,
          planId: 1,
          exerciseName: "스쿼트",
          exerciseOrder: 1,
          sets: 3,
          repsRange: { min: 8, max: 12 },
          reps: 10,
          restSeconds: 90,
          restTime: 90,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-20"),
        },
        {
          id: 2,
          planId: 1,
          exerciseName: "푸시업",
          exerciseOrder: 2,
          sets: 3,
          repsRange: { min: 6, max: 10 },
          reps: 8,
          restSeconds: 90,
          restTime: 90,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-20"),
        },
      ],
      status: "active" as const,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
    },
    {
      id: 2,
      userId: 1,
      name: "중급자 상체 운동",
      description: "상체 근력을 키우고 싶은 분들을 위한 운동 계획입니다.",
      difficulty: "intermediate" as const,
      estimatedDurationMinutes: 60,
      targetMuscleGroups: ["가슴", "등", "어깨"],
      isTemplate: false,
      isPublic: false,
      exercises: [
        {
          id: 3,
          planId: 2,
          exerciseName: "벤치프레스",
          exerciseOrder: 1,
          sets: 4,
          repsRange: { min: 6, max: 10 },
          reps: 8,
          weightRange: { min: 40, max: 60 },
          weight: 50,
          restSeconds: 120,
          restTime: 120,
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-18"),
        },
        {
          id: 4,
          planId: 2,
          exerciseName: "풀업",
          exerciseOrder: 2,
          sets: 3,
          repsRange: { min: 4, max: 8 },
          reps: 6,
          restSeconds: 120,
          restTime: 120,
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-18"),
        },
      ],
      status: "active" as const,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-18"),
    },
    {
      id: 3,
      userId: 1,
      name: "고급자 하체 운동",
      description:
        "하체 근력을 극대화하고 싶은 분들을 위한 고강도 운동 계획입니다.",
      difficulty: "advanced" as const,
      estimatedDurationMinutes: 75,
      targetMuscleGroups: ["하체"],
      isTemplate: false,
      isPublic: false,
      exercises: [
        {
          id: 5,
          planId: 3,
          exerciseName: "데드리프트",
          exerciseOrder: 1,
          sets: 5,
          repsRange: { min: 3, max: 6 },
          reps: 5,
          weightRange: { min: 60, max: 100 },
          weight: 80,
          restSeconds: 180,
          restTime: 180,
          createdAt: new Date("2024-01-05"),
          updatedAt: new Date("2024-01-22"),
        },
        {
          id: 6,
          planId: 3,
          exerciseName: "레그프레스",
          exerciseOrder: 2,
          sets: 4,
          repsRange: { min: 8, max: 12 },
          reps: 10,
          weightRange: { min: 80, max: 120 },
          weight: 100,
          restSeconds: 120,
          restTime: 120,
          createdAt: new Date("2024-01-05"),
          updatedAt: new Date("2024-01-22"),
        },
      ],
      status: "active" as const,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-22"),
    },
  ],
  sessions: [
    {
      id: 1,
      userId: 1,
      planId: 1,
      name: "초보자 전체 운동 세션",
      startTime: new Date("2024-01-20T09:00:00"),
      endTime: new Date("2024-01-20T09:45:00"),
      totalDurationMinutes: 45,
      status: "completed" as const,
      exerciseSets: [
        {
          id: 1,
          sessionId: 1,
          machineId: 1,
          setNumber: 1,
          repsCompleted: 10,
          weightKg: 0,
          createdAt: new Date("2024-01-20T09:00:00"),
          updatedAt: new Date("2024-01-20T09:45:00"),
        },
        {
          id: 2,
          sessionId: 1,
          machineId: 1,
          setNumber: 2,
          repsCompleted: 10,
          weightKg: 0,
          createdAt: new Date("2024-01-20T09:00:00"),
          updatedAt: new Date("2024-01-20T09:45:00"),
        },
        {
          id: 3,
          sessionId: 1,
          machineId: 1,
          setNumber: 3,
          repsCompleted: 8,
          weightKg: 0,
          createdAt: new Date("2024-01-20T09:00:00"),
          updatedAt: new Date("2024-01-20T09:45:00"),
        },
      ],
      notes: "첫 번째 운동 세션! 잘 마쳤습니다.",
      createdAt: new Date("2024-01-20T09:00:00"),
      updatedAt: new Date("2024-01-20T09:45:00"),
    },
    {
      id: 2,
      userId: 1,
      planId: 2,
      name: "중급자 상체 운동 세션",
      startTime: new Date("2024-01-22T14:00:00"),
      endTime: undefined,
      totalDurationMinutes: 30,
      status: "in_progress" as const,
      exerciseSets: [
        {
          id: 4,
          sessionId: 2,
          machineId: 2,
          setNumber: 1,
          repsCompleted: 8,
          weightKg: 50,
          createdAt: new Date("2024-01-22T14:00:00"),
          updatedAt: new Date("2024-01-22T14:30:00"),
        },
        {
          id: 5,
          sessionId: 2,
          machineId: 2,
          setNumber: 2,
          repsCompleted: 8,
          weightKg: 50,
          createdAt: new Date("2024-01-22T14:00:00"),
          updatedAt: new Date("2024-01-22T14:30:00"),
        },
      ],
      notes: "벤치프레스 중...",
      createdAt: new Date("2024-01-22T14:00:00"),
      updatedAt: new Date("2024-01-22T14:30:00"),
    },
    {
      id: 3,
      userId: 1,
      planId: 3,
      name: "고급자 하체 운동 세션",
      startTime: new Date("2024-01-21T16:00:00"),
      endTime: undefined,
      totalDurationMinutes: 20,
      status: "paused" as const,
      exerciseSets: [
        {
          id: 6,
          sessionId: 3,
          machineId: 3,
          setNumber: 1,
          repsCompleted: 5,
          weightKg: 80,
          createdAt: new Date("2024-01-21T16:00:00"),
          updatedAt: new Date("2024-01-21T16:20:00"),
        },
        {
          id: 7,
          sessionId: 3,
          machineId: 3,
          setNumber: 2,
          repsCompleted: 5,
          weightKg: 80,
          createdAt: new Date("2024-01-21T16:00:00"),
          updatedAt: new Date("2024-01-21T16:20:00"),
        },
      ],
      notes: "휴식 중...",
      createdAt: new Date("2024-01-21T16:00:00"),
      updatedAt: new Date("2024-01-21T16:20:00"),
    },
  ],
  goals: [
    {
      id: 1,
      userId: 1,
      title: "체중 감량 목표",
      description: "3개월 내 5kg 감량하기",
      type: "weight" as const,
      targetValue: 5,
      currentValue: 2,
      unit: "kg",
      deadline: new Date("2024-04-15"),
      isCompleted: false,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-22"),
    },
    {
      id: 2,
      userId: 1,
      title: "근력 향상 목표",
      description: "벤치프레스 1RM 80kg 달성하기",
      type: "weight" as const,
      targetValue: 80,
      currentValue: 65,
      unit: "kg",
      deadline: new Date("2024-03-30"),
      isCompleted: false,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-22"),
    },
    {
      id: 3,
      userId: 1,
      title: "지속성 목표",
      description: "주 3회 운동 습관 만들기",
      type: "frequency" as const,
      targetValue: 12,
      currentValue: 8,
      unit: "주",
      deadline: new Date("2024-06-30"),
      isCompleted: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-22"),
    },
  ],
  dashboardData: {
    totalWorkouts: 3,
    totalSessions: 3,
    totalGoals: 3,
    completedGoals: 0,
    currentStreak: 5,
    totalExp: 1500,
    level: 3,
    summary: {
      totalWorkouts: 3,
      totalGoals: 3,
      totalSessions: 3,
      totalPlans: 3,
      completedSessions: 1,
      streak: 5,
      activeGoals: 3,
    },
    weeklyStats: {
      totalSessions: 3,
      totalDuration: 95,
      averageMood: 4,
      averageEnergy: 4,
    },
    recentSessions: [
      {
        id: 1,
        name: "초보자 전체 운동 세션",
        date: new Date("2024-01-20T09:00:00"),
        duration: 45,
      },
      {
        id: 2,
        name: "중급자 상체 운동 세션",
        date: new Date("2024-01-22T14:00:00"),
        duration: 30,
      },
      {
        id: 3,
        name: "고급자 하체 운동 세션",
        date: new Date("2024-01-21T16:00:00"),
        duration: 20,
      },
    ],
    activeGoals: [
      {
        id: 1,
        userId: 1,
        title: "체중 감량 목표",
        description: "3개월 내 5kg 감량하기",
        type: "weight" as const,
        targetValue: 5,
        currentValue: 2,
        unit: "kg",
        deadline: new Date("2024-04-15"),
        isCompleted: false,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-22"),
      },
      {
        id: 2,
        userId: 1,
        title: "근력 향상 목표",
        description: "벤치프레스 1RM 80kg 달성하기",
        type: "weight" as const,
        targetValue: 80,
        currentValue: 65,
        unit: "kg",
        deadline: new Date("2024-03-30"),
        isCompleted: false,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-22"),
      },
      {
        id: 3,
        userId: 1,
        title: "지속성 목표",
        description: "주 3회 운동 습관 만들기",
        type: "frequency" as const,
        targetValue: 12,
        currentValue: 8,
        unit: "주",
        deadline: new Date("2024-06-30"),
        isCompleted: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-22"),
      },
    ],
    recentProgress: [
      { date: new Date("2024-01-18"), value: 45, type: "duration" },
      { date: new Date("2024-01-19"), value: 0, type: "duration" },
      { date: new Date("2024-01-20"), value: 45, type: "duration" },
      { date: new Date("2024-01-21"), value: 20, type: "duration" },
      { date: new Date("2024-01-22"), value: 30, type: "duration" },
    ],
    upcomingGoals: [
      {
        id: 1,
        title: "체중 감량 목표",
        deadline: new Date("2024-04-15"),
        progress: 40,
      },
      {
        id: 2,
        title: "근력 향상 목표",
        deadline: new Date("2024-03-30"),
        progress: 81,
      },
      {
        id: 3,
        title: "지속성 목표",
        deadline: new Date("2024-06-30"),
        progress: 67,
      },
    ],
    weeklyProgress: [
      { date: new Date("2024-01-15"), workouts: 1, exp: 300 },
      { date: new Date("2024-01-16"), workouts: 0, exp: 0 },
      { date: new Date("2024-01-17"), workouts: 1, exp: 400 },
      { date: new Date("2024-01-18"), workouts: 1, exp: 300 },
      { date: new Date("2024-01-19"), workouts: 0, exp: 0 },
      { date: new Date("2024-01-20"), workouts: 1, exp: 300 },
      { date: new Date("2024-01-21"), workouts: 1, exp: 200 },
    ],
  },
  loading: {
    overview: { isLoading: false, error: null },
    plans: { isLoading: false, error: null },
    sessions: { isLoading: false, error: null },
    goals: { isLoading: false, error: null },
    progress: { isLoading: false, error: null },
  },
  activeTab: "overview" as TabType,
  modals: {
    plan: {
      isOpen: false,
      mode: "create" as const,
      exercises: [],
      confirmedExerciseIndices: new Set<number>(),
    },
    session: {
      isOpen: false,
      mode: "create" as const,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isTimerRunning: false,
      restTimer: 0,
    },
    goal: {
      isOpen: false,
      mode: "create" as const,
    },
  },
  currentPlan: null,
  currentSession: null,
  currentGoal: null,
  tabStates: {
    overview: {
      selectedTimeRange: "7days",
      selectedMetrics: ["sessions", "duration", "calories"],
      chartType: "line",
    },
    plans: {
      selectedPlanId: null,
      filterStatus: "all",
      sortBy: "createdAt",
      viewMode: "grid" as const,
    },
    sessions: {
      selectedSessionId: null,
      filterStatus: "all",
      sortBy: "startTime",
      activeSessionId: null,
    },
    goals: {
      selectedGoalId: null,
      filterType: "all",
      sortBy: "deadline",
      showCompleted: true,
    },
    reminders: {
      selectedReminderId: null,
      filterStatus: "all",
      sortBy: "time",
    },
    workoutProgress: {
      selectedTimeRange: "monthly",
      selectedMetric: "completedSets",
      chartType: "bar",
    },
    progress: {
      selectedTimeRange: "30days",
      selectedMetrics: ["sessions", "duration", "calories"],
      chartType: "bar",
      comparisonMode: false,
    },
  },
  sharedState: {
    lastUpdatedPlan: null,
    lastUpdatedSession: null,
    lastUpdatedGoal: null,
    notifications: [],
    globalLoading: false,
    globalError: null,
  },
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useWorkoutStore = create<WorkoutStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ============================================================================
        // Plan Actions
        // ============================================================================

        fetchPlans: async () => {
          set(state => ({
            loading: {
              ...state.loading,
              plans: { isLoading: true, error: null },
            },
          }))

          try {
            console.log("🔍 [WorkoutStore] Fetching plans...")
            const plans = await workoutApi.getPlans()
            console.log(`✅ [WorkoutStore] Fetched ${plans.length} plans`)

            set({
              plans,
              loading: {
                ...get().loading,
                plans: { isLoading: false, error: null },
              },
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch plans"
            console.error("❌ [WorkoutStore] Failed to fetch plans:", error)

            set(state => ({
              loading: {
                ...state.loading,
                plans: { isLoading: false, error: errorMessage },
              },
            }))
          }
        },

        createPlan: async (planData: CreatePlanRequest) => {
          set(state => ({
            loading: {
              ...state.loading,
              plans: { isLoading: true, error: null },
            },
          }))

          try {
            console.log("📝 [WorkoutStore] Creating plan...")
            const newPlan = await workoutApi.createPlan(planData)
            console.log("✅ [WorkoutStore] Plan created successfully")

            set(state => ({
              plans: [newPlan, ...state.plans],
              loading: {
                ...state.loading,
                plans: { isLoading: false, error: null },
              },
            }))

            return newPlan
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to create plan"
            console.error("❌ [WorkoutStore] Failed to create plan:", error)

            set(state => ({
              loading: {
                ...state.loading,
                plans: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        updatePlan: async (planId: number, planData: UpdatePlanRequest) => {
          set(state => ({
            loading: {
              ...state.loading,
              plans: { isLoading: true, error: null },
            },
          }))

          try {
            console.log(`📝 [WorkoutStore] Updating plan ${planId}...`)
            const updatedPlan = await workoutApi.updatePlan(planId, planData)
            console.log("✅ [WorkoutStore] Plan updated successfully")

            set(state => ({
              plans: state.plans.map(plan =>
                plan.id === planId ? updatedPlan : plan
              ),
              loading: {
                ...state.loading,
                plans: { isLoading: false, error: null },
              },
            }))

            return updatedPlan
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to update plan"
            console.error("❌ [WorkoutStore] Failed to update plan:", error)

            set(state => ({
              loading: {
                ...state.loading,
                plans: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        deletePlan: async (planId: number) => {
          set(state => ({
            loading: {
              ...state.loading,
              plans: { isLoading: true, error: null },
            },
          }))

          try {
            console.log(`🗑️ [WorkoutStore] Deleting plan ${planId}...`)
            await workoutApi.deletePlan(planId)
            console.log("✅ [WorkoutStore] Plan deleted successfully")

            set(state => ({
              plans: state.plans.filter(plan => plan.id !== planId),
              loading: {
                ...state.loading,
                plans: { isLoading: false, error: null },
              },
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to delete plan"
            console.error("❌ [WorkoutStore] Failed to delete plan:", error)

            set(state => ({
              loading: {
                ...state.loading,
                plans: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        // ============================================================================
        // Session Actions
        // ============================================================================

        fetchSessions: async () => {
          set(state => ({
            loading: {
              ...state.loading,
              sessions: { isLoading: true, error: null },
            },
          }))

          try {
            console.log("🔍 [WorkoutStore] Fetching sessions...")
            const sessions = await workoutApi.getSessions()
            console.log(`✅ [WorkoutStore] Fetched ${sessions.length} sessions`)

            set({
              sessions,
              loading: {
                ...get().loading,
                sessions: { isLoading: false, error: null },
              },
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch sessions"
            console.error("❌ [WorkoutStore] Failed to fetch sessions:", error)

            set(state => ({
              loading: {
                ...state.loading,
                sessions: { isLoading: false, error: errorMessage },
              },
            }))
          }
        },

        createSession: async (sessionData: CreateSessionRequest) => {
          set(state => ({
            loading: {
              ...state.loading,
              sessions: { isLoading: true, error: null },
            },
          }))

          try {
            console.log("📝 [WorkoutStore] Creating session...")
            const newSession = await workoutApi.createSession(sessionData)
            console.log("✅ [WorkoutStore] Session created successfully")

            set(state => ({
              sessions: [newSession, ...state.sessions],
              loading: {
                ...state.loading,
                sessions: { isLoading: false, error: null },
              },
            }))

            return newSession
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to create session"
            console.error("❌ [WorkoutStore] Failed to create session:", error)

            set(state => ({
              loading: {
                ...state.loading,
                sessions: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        updateSession: async (
          sessionId: number,
          sessionData: UpdateSessionRequest
        ) => {
          set(state => ({
            loading: {
              ...state.loading,
              sessions: { isLoading: true, error: null },
            },
          }))

          try {
            console.log(`📝 [WorkoutStore] Updating session ${sessionId}...`)
            const updatedSession = await workoutApi.updateSession(
              sessionId,
              sessionData
            )
            console.log("✅ [WorkoutStore] Session updated successfully")

            set(state => ({
              sessions: state.sessions.map(session =>
                session.id === sessionId ? updatedSession : session
              ),
              loading: {
                ...state.loading,
                sessions: { isLoading: false, error: null },
              },
            }))

            return updatedSession
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to update session"
            console.error("❌ [WorkoutStore] Failed to update session:", error)

            set(state => ({
              loading: {
                ...state.loading,
                sessions: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        deleteSession: async (sessionId: number) => {
          set(state => ({
            loading: {
              ...state.loading,
              sessions: { isLoading: true, error: null },
            },
          }))

          try {
            console.log(`🗑️ [WorkoutStore] Deleting session ${sessionId}...`)
            await workoutApi.deleteSession(sessionId)
            console.log("✅ [WorkoutStore] Session deleted successfully")

            set(state => ({
              sessions: state.sessions.filter(
                session => session.id !== sessionId
              ),
              loading: {
                ...state.loading,
                sessions: { isLoading: false, error: null },
              },
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to delete session"
            console.error("❌ [WorkoutStore] Failed to delete session:", error)

            set(state => ({
              loading: {
                ...state.loading,
                sessions: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        // ============================================================================
        // Goal Actions
        // ============================================================================

        fetchGoals: async () => {
          set(state => ({
            loading: {
              ...state.loading,
              goals: { isLoading: true, error: null },
            },
          }))

          try {
            console.log("🔍 [WorkoutStore] Fetching goals...")
            const goals = await workoutApi.getGoals()
            console.log(`✅ [WorkoutStore] Fetched ${goals.length} goals`)

            set({
              goals,
              loading: {
                ...get().loading,
                goals: { isLoading: false, error: null },
              },
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch goals"
            console.error("❌ [WorkoutStore] Failed to fetch goals:", error)

            set(state => ({
              loading: {
                ...state.loading,
                goals: { isLoading: false, error: errorMessage },
              },
            }))
          }
        },

        createGoal: async (goalData: CreateGoalRequest) => {
          set(state => ({
            loading: {
              ...state.loading,
              goals: { isLoading: true, error: null },
            },
          }))

          try {
            console.log("📝 [WorkoutStore] Creating goal...")
            const newGoal = await workoutApi.createGoal(goalData)
            console.log("✅ [WorkoutStore] Goal created successfully")

            set(state => ({
              goals: [newGoal, ...state.goals],
              loading: {
                ...state.loading,
                goals: { isLoading: false, error: null },
              },
            }))

            return newGoal
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to create goal"
            console.error("❌ [WorkoutStore] Failed to create goal:", error)

            set(state => ({
              loading: {
                ...state.loading,
                goals: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        updateGoal: async (goalId: number, goalData: UpdateGoalRequest) => {
          set(state => ({
            loading: {
              ...state.loading,
              goals: { isLoading: true, error: null },
            },
          }))

          try {
            console.log(`📝 [WorkoutStore] Updating goal ${goalId}...`)
            const updatedGoal = await workoutApi.updateGoal(goalId, goalData)
            console.log("✅ [WorkoutStore] Goal updated successfully")

            set(state => ({
              goals: state.goals.map(goal =>
                goal.id === goalId ? updatedGoal : goal
              ),
              loading: {
                ...state.loading,
                goals: { isLoading: false, error: null },
              },
            }))

            return updatedGoal
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to update goal"
            console.error("❌ [WorkoutStore] Failed to update goal:", error)

            set(state => ({
              loading: {
                ...state.loading,
                goals: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        deleteGoal: async (goalId: number) => {
          set(state => ({
            loading: {
              ...state.loading,
              goals: { isLoading: true, error: null },
            },
          }))

          try {
            console.log(`🗑️ [WorkoutStore] Deleting goal ${goalId}...`)
            await workoutApi.deleteGoal(goalId)
            console.log("✅ [WorkoutStore] Goal deleted successfully")

            set(state => ({
              goals: state.goals.filter(goal => goal.id !== goalId),
              loading: {
                ...state.loading,
                goals: { isLoading: false, error: null },
              },
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to delete goal"
            console.error("❌ [WorkoutStore] Failed to delete goal:", error)

            set(state => ({
              loading: {
                ...state.loading,
                goals: { isLoading: false, error: errorMessage },
              },
            }))
            throw error
          }
        },

        // ============================================================================
        // Dashboard Actions
        // ============================================================================

        fetchDashboardData: async () => {
          set(state => ({
            loading: {
              ...state.loading,
              overview: { isLoading: true, error: null },
            },
          }))

          try {
            console.log("🔍 [WorkoutStore] Fetching dashboard data...")
            const dashboardData = await workoutApi.getDashboardData()
            console.log("✅ [WorkoutStore] Dashboard data fetched successfully")

            set({
              dashboardData,
              loading: {
                ...get().loading,
                overview: { isLoading: false, error: null },
              },
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch dashboard data"
            console.error(
              "❌ [WorkoutStore] Failed to fetch dashboard data:",
              error
            )

            set(state => ({
              loading: {
                ...state.loading,
                overview: { isLoading: false, error: errorMessage },
              },
            }))
          }
        },

        // ============================================================================
        // UI Actions
        // ============================================================================

        setActiveTab: (tab: TabType) => {
          console.log(`🔄 [WorkoutStore] Setting active tab to: ${tab}`)
          set({ activeTab: tab })
        },

        openPlanModal: (
          mode: "create" | "edit" | "view",
          plan?: WorkoutPlan
        ) => {
          console.log(
            `📋 [WorkoutStore] Opening plan modal: ${mode}`,
            plan ? `ID: ${plan.id}` : "new plan"
          )
          set({
            modals: {
              ...get().modals,
              plan: {
                isOpen: true,
                mode,
                plan,
                exercises: plan?.exercises || [],
                confirmedExerciseIndices: new Set(),
              },
            },
            currentPlan: plan || null,
          })
        },

        closePlanModal: () => {
          console.log("❌ [WorkoutStore] Closing plan modal")
          set({
            modals: {
              ...get().modals,
              plan: {
                isOpen: false,
                mode: "create",
                exercises: [],
                confirmedExerciseIndices: new Set(),
              },
            },
            currentPlan: null,
          })
        },

        openSessionModal: (
          mode: "create" | "edit" | "view",
          session?: WorkoutSession
        ) => {
          console.log(
            `⏱️ [WorkoutStore] Opening session modal: ${mode}`,
            session ? `ID: ${session.id}` : "new session"
          )
          set({
            modals: {
              ...get().modals,
              session: {
                isOpen: true,
                mode,
                session,
                plan: session?.plan,
                currentExerciseIndex: 0,
                currentSetIndex: 0,
                isTimerRunning: false,
                restTimer: 0,
              },
            },
            currentSession: session || null,
          })
        },

        closeSessionModal: () => {
          console.log("❌ [WorkoutStore] Closing session modal")
          set({
            modals: {
              ...get().modals,
              session: {
                isOpen: false,
                mode: "create",
                currentExerciseIndex: 0,
                currentSetIndex: 0,
                isTimerRunning: false,
                restTimer: 0,
              },
            },
            currentSession: null,
          })
        },

        openGoalModal: (
          mode: "create" | "edit" | "view",
          goal?: WorkoutGoal
        ) => {
          console.log(
            `🎯 [WorkoutStore] Opening goal modal: ${mode}`,
            goal ? `ID: ${goal.id}` : "new goal"
          )
          set({
            modals: {
              ...get().modals,
              goal: {
                isOpen: true,
                mode,
                goal,
              },
            },
            currentGoal: goal || null,
          })
        },

        closeGoalModal: () => {
          console.log("❌ [WorkoutStore] Closing goal modal")
          set({
            modals: {
              ...get().modals,
              goal: {
                isOpen: false,
                mode: "create",
              },
            },
            currentGoal: null,
          })
        },

        // ============================================================================
        // Plan Exercise Management
        // ============================================================================

        addPlanExercise: exercise => {
          const state = get()
          const newExercise: WorkoutPlanExercise = {
            ...exercise,
            id: Date.now(), // 임시 ID
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          console.log(
            `➕ [WorkoutStore] Adding exercise: ${newExercise.exerciseName}`
          )

          set({
            modals: {
              ...state.modals,
              plan: {
                ...state.modals.plan,
                exercises: [...state.modals.plan.exercises, newExercise],
              },
            },
          })
        },

        updatePlanExercise: (index: number, exercise: WorkoutPlanExercise) => {
          const state = get()
          console.log(
            `✏️ [WorkoutStore] Updating exercise at index ${index}: ${exercise.exerciseName}`
          )

          const updatedExercises = [...state.modals.plan.exercises]
          updatedExercises[index] = exercise

          set({
            modals: {
              ...state.modals,
              plan: {
                ...state.modals.plan,
                exercises: updatedExercises,
              },
            },
          })
        },

        removePlanExercise: (index: number) => {
          const state = get()
          console.log(`🗑️ [WorkoutStore] Removing exercise at index ${index}`)

          const updatedExercises = state.modals.plan.exercises.filter(
            (_, i) => i !== index
          )
          const updatedConfirmedIndices = new Set<number>()

          // 인덱스 재조정
          state.modals.plan.confirmedExerciseIndices.forEach(idx => {
            if (idx < index) {
              updatedConfirmedIndices.add(idx)
            } else if (idx > index) {
              updatedConfirmedIndices.add(idx - 1)
            }
          })

          set({
            modals: {
              ...state.modals,
              plan: {
                ...state.modals.plan,
                exercises: updatedExercises,
                confirmedExerciseIndices: updatedConfirmedIndices,
              },
            },
          })
        },

        confirmPlanExercise: (index: number) => {
          const state = get()
          console.log(`✅ [WorkoutStore] Confirming exercise at index ${index}`)

          const updatedConfirmedIndices = new Set<number>(
            state.modals.plan.confirmedExerciseIndices
          )
          updatedConfirmedIndices.add(index)

          set({
            modals: {
              ...state.modals,
              plan: {
                ...state.modals.plan,
                confirmedExerciseIndices: updatedConfirmedIndices,
              },
            },
          })
        },

        unconfirmPlanExercise: (index: number) => {
          const state = get()
          console.log(
            `❌ [WorkoutStore] Unconfirming exercise at index ${index}`
          )

          const updatedConfirmedIndices = new Set<number>(
            state.modals.plan.confirmedExerciseIndices
          )
          updatedConfirmedIndices.delete(index)

          set({
            modals: {
              ...state.modals,
              plan: {
                ...state.modals.plan,
                confirmedExerciseIndices: updatedConfirmedIndices,
              },
            },
          })
        },

        // ============================================================================
        // Session Exercise Management
        // ============================================================================

        addSessionExercise: async (sessionId: number, exercise: any) => {
          try {
            console.log(
              `➕ [WorkoutStore] Adding exercise to session ${sessionId}`
            )
            await workoutApi.addSessionExercise(sessionId, exercise)
            console.log("✅ [WorkoutStore] Session exercise added successfully")
            // Refresh sessions to get updated data
            await get().fetchSessions()
          } catch (error) {
            console.error(
              "❌ [WorkoutStore] Failed to add session exercise:",
              error
            )
            throw error
          }
        },

        removeSessionExercise: async (
          sessionId: number,
          exerciseId: number
        ) => {
          try {
            console.log(
              `🗑️ [WorkoutStore] Removing exercise ${exerciseId} from session ${sessionId}`
            )
            await workoutApi.deleteSessionExercise(sessionId, exerciseId)
            console.log(
              "✅ [WorkoutStore] Session exercise removed successfully"
            )
            // Refresh sessions to get updated data
            await get().fetchSessions()
          } catch (error) {
            console.error(
              "❌ [WorkoutStore] Failed to remove session exercise:",
              error
            )
            throw error
          }
        },

        updateSessionExercise: async (
          sessionId: number,
          exerciseId: number,
          exercise: any
        ) => {
          try {
            console.log(
              `✏️ [WorkoutStore] Updating exercise ${exerciseId} in session ${sessionId}`
            )
            await workoutApi.updateSessionExercise(
              sessionId,
              exerciseId,
              exercise
            )
            console.log(
              "✅ [WorkoutStore] Session exercise updated successfully"
            )
            // Refresh sessions to get updated data
            await get().fetchSessions()
          } catch (error) {
            console.error(
              "❌ [WorkoutStore] Failed to update session exercise:",
              error
            )
            throw error
          }
        },

        // ============================================================================
        // Tab State Management
        // ============================================================================

        updateTabState: <T extends TabType>(
          tab: T,
          updates: Partial<WorkoutStoreState["tabStates"][T]>
        ) => {
          console.log(
            `🔄 [WorkoutStore] Updating tab state for ${tab}`,
            updates
          )
          set(state => ({
            tabStates: {
              ...state.tabStates,
              [tab]: {
                ...state.tabStates[tab],
                ...updates,
              },
            },
          }))
        },

        resetTabState: (tab: TabType) => {
          console.log(`🔄 [WorkoutStore] Resetting tab state for ${tab}`)
          set(state => ({
            tabStates: {
              ...state.tabStates,
              [tab]: initialState.tabStates[tab],
            },
          }))
        },

        // ============================================================================
        // Shared State Management
        // ============================================================================

        updateSharedState: (
          updates: Partial<WorkoutStoreState["sharedState"]>
        ) => {
          console.log(`🔄 [WorkoutStore] Updating shared state`, updates)
          set(state => ({
            sharedState: {
              ...state.sharedState,
              ...updates,
            },
          }))
        },

        addNotification: (
          notification: Omit<
            WorkoutStoreState["sharedState"]["notifications"][0],
            "id" | "timestamp"
          >
        ) => {
          console.log(`🔔 [WorkoutStore] Adding notification`, notification)
          set(state => ({
            sharedState: {
              ...state.sharedState,
              notifications: [
                ...state.sharedState.notifications,
                {
                  id: Date.now().toString(), // 임시 ID
                  timestamp: new Date(),
                  ...notification,
                },
              ],
            },
          }))
        },

        removeNotification: (id: string) => {
          console.log(`🧹 [WorkoutStore] Removing notification with ID: ${id}`)
          set(state => ({
            sharedState: {
              ...state.sharedState,
              notifications: state.sharedState.notifications.filter(
                notif => notif.id !== id
              ),
            },
          }))
        },

        clearNotifications: () => {
          console.log(`🧹 [WorkoutStore] Clearing all notifications`)
          set(state => ({
            sharedState: {
              ...state.sharedState,
              notifications: [],
            },
          }))
        },

        // ============================================================================
        // Utility Actions
        // ============================================================================

        resetStore: () => {
          console.log("🔄 [WorkoutStore] Resetting store")
          set(initialState)
        },

        clearErrors: () => {
          console.log("🧹 [WorkoutStore] Clearing errors")
          set(state => ({
            loading: {
              overview: { isLoading: false, error: null },
              plans: { isLoading: false, error: null },
              sessions: { isLoading: false, error: null },
              goals: { isLoading: false, error: null },
              progress: { isLoading: false, error: null },
            },
            sharedState: {
              ...state.sharedState,
              globalError: null,
            },
          }))
        },

        initializeWorkoutData: async () => {
          await get().fetchPlans()
          await get().fetchSessions()
          await get().fetchGoals()
          await get().fetchDashboardData()
        },
      }),
      {
        name: "workout-store",
        partialize: state => ({
          activeTab: state.activeTab,
          modals: state.modals,
          tabStates: state.tabStates,
        }),
      }
    )
  )
)
