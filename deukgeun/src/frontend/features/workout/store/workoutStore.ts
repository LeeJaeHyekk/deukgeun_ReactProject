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
  OverviewTabState,
  PlansTabState,
  SessionsTabState,
  GoalsTabState,
  ProgressTabState,
  Notification,
  TimerState,
} from "../types"
import { workoutApi } from "../api/workoutApi"
import { TAB_CONFIG } from "../constants"

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
    overview: OverviewTabState
    plans: PlansTabState
    sessions: SessionsTabState
    goals: GoalsTabState
    workoutProgress: ProgressTabState
  }

  // Shared State - 전역 공유 상태
  sharedState: {
    lastUpdatedPlan: WorkoutPlan | null
    lastUpdatedSession: WorkoutSession | null
    lastUpdatedGoal: WorkoutGoal | null
    notifications: Notification[]
    globalLoading: boolean
    globalError: string | null
    timer: TimerState
  }
}

// ============================================================================
// Store Actions Interface
// ============================================================================

export interface WorkoutStoreActions {
  // Plans Actions
  fetchPlans: () => Promise<void>
  createPlan: (plan: CreatePlanRequest) => Promise<WorkoutPlan | null>
  updatePlan: (
    planId: number,
    updates: UpdatePlanRequest
  ) => Promise<WorkoutPlan | null>
  deletePlan: (planId: number) => Promise<boolean>
  duplicatePlan: (planId: number) => Promise<WorkoutPlan | null>

  // Sessions Actions
  fetchSessions: () => Promise<void>
  createSession: (
    session: CreateSessionRequest
  ) => Promise<WorkoutSession | null>
  updateSession: (
    sessionId: number,
    updates: UpdateSessionRequest
  ) => Promise<WorkoutSession | null>
  deleteSession: (sessionId: number) => Promise<boolean>
  startSession: (sessionId: number) => Promise<void>
  pauseSession: (sessionId: number) => Promise<void>
  completeSession: (sessionId: number) => Promise<void>

  // Goals Actions
  fetchGoals: () => Promise<void>
  createGoal: (goal: CreateGoalRequest) => Promise<WorkoutGoal | null>
  updateGoal: (
    goalId: number,
    updates: UpdateGoalRequest
  ) => Promise<WorkoutGoal | null>
  deleteGoal: (goalId: number) => Promise<boolean>
  completeGoal: (goalId: number) => Promise<void>

  // Dashboard Actions
  fetchDashboardData: () => Promise<void>
  refreshDashboard: () => Promise<void>

  // UI Actions
  setActiveTab: (tab: TabType) => void
  openPlanModal: (
    mode: "create" | "edit" | "view" | "duplicate",
    data?: WorkoutPlan
  ) => void
  closePlanModal: () => void
  openSessionModal: (
    mode: "create" | "edit" | "view" | "active",
    data?: WorkoutSession
  ) => void
  closeSessionModal: () => void
  openGoalModal: (mode: "create" | "edit" | "view", data?: WorkoutGoal) => void
  closeGoalModal: () => void

  // Notification Actions
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Error Actions
  setGlobalError: (error: string | null) => void
  clearGlobalError: () => void

  // Timer Actions
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  updateTimer: (elapsedTime: number) => void

  // Tab State Actions
  updateOverviewTabState: (updates: Partial<OverviewTabState>) => void
  updatePlansTabState: (updates: Partial<PlansTabState>) => void
  updateSessionsTabState: (updates: Partial<SessionsTabState>) => void
  updateGoalsTabState: (updates: Partial<GoalsTabState>) => void
  updateProgressTabState: (updates: Partial<ProgressTabState>) => void

  // Utility Actions
  resetStore: () => void
  clearCache: () => void
}

// ============================================================================
// Store Type
// ============================================================================

export type WorkoutStore = WorkoutStoreState & WorkoutStoreActions

// ============================================================================
// Initial State
// ============================================================================

const initialState: WorkoutStoreState = {
  // Data State
  plans: [],
  sessions: [],
  goals: [],
  dashboardData: null,

  // Loading States
  loading: {
    overview: { isLoading: false, error: null, lastUpdated: undefined },
    plans: { isLoading: false, error: null, lastUpdated: undefined },
    sessions: { isLoading: false, error: null, lastUpdated: undefined },
    goals: { isLoading: false, error: null, lastUpdated: undefined },
    progress: { isLoading: false, error: null, lastUpdated: undefined },
  },

  // UI State
  activeTab: "overview",
  modals: {
    plan: { isOpen: false, mode: "create" },
    session: { isOpen: false, mode: "create" },
    goal: { isOpen: false, mode: "create" },
  },

  // Current Working State
  currentPlan: null,
  currentSession: null,
  currentGoal: null,

  // Tab States
  tabStates: {
    overview: {
      selectedTimeRange: "week",
      selectedMetric: "sessions",
    },
    plans: {
      selectedDifficulty: "all",
      selectedStatus: "all",
      searchQuery: "",
      filterStatus: "all",
      sortBy: "date_desc",
      viewMode: "grid",
      selectedPlanId: null,
    },
    sessions: {
      selectedStatus: "all",
      selectedDateRange: "all",
      searchQuery: "",
      filterStatus: "all",
      sortBy: "startTime",
    },
    goals: {
      selectedType: "all",
      selectedStatus: "all",
      searchQuery: "",
      showCompleted: false,
      sortBy: "progress",
      selectedGoalId: undefined,
    },
    workoutProgress: {
      selectedTimeRange: "month",
      selectedMetric: "sessions",
      chartType: "line",
      compareMode: false,
    },
  },

  // Shared State
  sharedState: {
    lastUpdatedPlan: null,
    lastUpdatedSession: null,
    lastUpdatedGoal: null,
    notifications: [],
    globalLoading: false,
    globalError: null,
    timer: {
      isRunning: false,
      seconds: 0,
      totalSeconds: 0,
    },
  },
}

// ============================================================================
// Helper Functions for Validation
// ============================================================================

/**
 * ID 유효성 검증
 */
function isValidId(id: number): boolean {
  return (
    typeof id === "number" &&
    !isNaN(id) &&
    isFinite(id) &&
    id > 0 &&
    Number.isInteger(id)
  )
}

/**
 * 배열 타입 검증 및 정규화
 */
function ensureArray<T>(data: T[] | null | undefined): T[] {
  if (!data) return []
  if (!Array.isArray(data)) {
    console.warn("[workoutStore] 배열이 아닌 데이터를 배열로 변환:", data)
    return []
  }
  return data
}

/**
 * 객체 타입 검증
 */
function ensureObject<T>(data: T | null | undefined, fallback: T): T {
  if (!data || typeof data !== "object") {
    console.warn("[workoutStore] 유효하지 않은 객체 데이터:", data)
    return fallback
  }
  return data
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useWorkoutStore = create<WorkoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ============================================================================
        // Plans Actions
        // ============================================================================

        fetchPlans: async () => {
          // 중복 실행 방지
          const currentState = get()
          if (currentState.loading.plans.isLoading) {
            console.warn("[workoutStore] fetchPlans 이미 로딩 중입니다")
            return
          }

          console.log("[workoutStore] fetchPlans 호출됨", {
            timestamp: new Date().toISOString(),
            stack: new Error().stack?.split("\n").slice(1, 4).join("\n"),
          })

          set(state => ({
            loading: {
              ...state.loading,
              plans: { isLoading: true, error: null },
            },
          }))

          try {
            const plans = await workoutApi.getPlans()
            // API 응답 검증
            const validatedPlans = ensureArray(plans)
            console.log("[workoutStore] fetchPlans 완료", {
              plansCount: validatedPlans.length,
            })
            set(state => ({
              plans: validatedPlans,
              loading: {
                ...state.loading,
                plans: {
                  isLoading: false,
                  error: null,
                  lastUpdated: new Date(),
                },
              },
            }))
          } catch (error) {
            console.error("[workoutStore] fetchPlans 실패", error)
            set(state => ({
              loading: {
                ...state.loading,
                plans: {
                  isLoading: false,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                },
              },
            }))
          }
        },

        createPlan: async (planData: CreatePlanRequest) => {
          // 입력 데이터 검증
          if (!planData || typeof planData !== "object") {
            console.error("[workoutStore] createPlan: 유효하지 않은 planData", planData)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 계획 데이터입니다",
              },
            }))
            return null
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const newPlan = await workoutApi.createPlan(planData)
            // API 응답 검증
            if (!newPlan || typeof newPlan !== "object") {
              throw new Error("생성된 계획 데이터가 유효하지 않습니다")
            }
            set(state => ({
              plans: [...state.plans, newPlan],
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                lastUpdatedPlan: newPlan,
              },
            }))
            return newPlan
          } catch (error) {
            console.error("[workoutStore] createPlan 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return null
          }
        },

        updatePlan: async (planId: number, updates: UpdatePlanRequest) => {
          // ID 유효성 검증
          if (!isValidId(planId)) {
            console.error("[workoutStore] updatePlan: 유효하지 않은 planId", planId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 계획 ID입니다",
              },
            }))
            return null
          }

          // 업데이트 데이터 검증
          if (!updates || typeof updates !== "object") {
            console.error("[workoutStore] updatePlan: 유효하지 않은 updates", updates)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 업데이트 데이터입니다",
              },
            }))
            return null
          }

          // 존재하는 계획인지 확인
          const existingPlan = get().plans.find(plan => plan.id === planId)
          if (!existingPlan) {
            console.warn("[workoutStore] updatePlan: 존재하지 않는 계획", planId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "존재하지 않는 계획입니다",
              },
            }))
            return null
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const updatedPlan = await workoutApi.updatePlan(planId, updates)
            // API 응답 검증
            if (!updatedPlan || typeof updatedPlan !== "object") {
              throw new Error("업데이트된 계획 데이터가 유효하지 않습니다")
            }
            set(state => ({
              plans: state.plans.map(plan =>
                plan.id === planId ? updatedPlan : plan
              ),
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                lastUpdatedPlan: updatedPlan,
              },
            }))
            return updatedPlan
          } catch (error) {
            console.error("[workoutStore] updatePlan 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return null
          }
        },

        deletePlan: async (planId: number) => {
          // ID 유효성 검증
          if (!isValidId(planId)) {
            console.error("[workoutStore] deletePlan: 유효하지 않은 planId", planId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 계획 ID입니다",
              },
            }))
            return false
          }

          // 존재하는 계획인지 확인
          const existingPlan = get().plans.find(plan => plan.id === planId)
          if (!existingPlan) {
            console.warn("[workoutStore] deletePlan: 존재하지 않는 계획", planId)
            // 존재하지 않아도 성공으로 처리 (이미 삭제된 상태)
            return true
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            await workoutApi.deletePlan(planId)
            set(state => ({
              plans: state.plans.filter(plan => plan.id !== planId),
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
              },
            }))
            return true
          } catch (error) {
            console.error("[workoutStore] deletePlan 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return false
          }
        },

        duplicatePlan: async (planId: number) => {
          // ID 유효성 검증
          if (!isValidId(planId)) {
            console.error("[workoutStore] duplicatePlan: 유효하지 않은 planId", planId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 계획 ID입니다",
              },
            }))
            return null
          }

          const plan = get().plans.find(p => p.id === planId)
          if (!plan) {
            console.warn("[workoutStore] duplicatePlan: 존재하지 않는 계획", planId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "존재하지 않는 계획입니다",
              },
            }))
            return null
          }

          // exercises 배열 검증 및 안전한 매핑
          const exercises = ensureArray(plan.exercises).map((exercise: any) => {
            // exercise 객체 검증
            if (!exercise || typeof exercise !== "object") {
              console.warn("[workoutStore] duplicatePlan: 유효하지 않은 exercise", exercise)
              return null
            }
            return {
              machineId: exercise.machineId ?? undefined,
              exerciseName: exercise.exerciseName ?? "",
              exerciseOrder: exercise.exerciseOrder ?? 0,
              sets: exercise.sets ?? 0,
              repsRange: exercise.repsRange ?? undefined,
              weightRange: exercise.weightRange ?? undefined,
              restSeconds: exercise.restSeconds ?? 0,
              notes: exercise.notes ?? undefined,
            }
          }).filter((exercise): exercise is NonNullable<typeof exercise> => exercise !== null)

          const duplicateData: CreatePlanRequest = {
            name: `${plan.name || "이름 없음"} (복사본)`,
            description: plan.description ?? undefined,
            difficulty: plan.difficulty ?? "beginner",
            estimatedDurationMinutes: plan.estimatedDurationMinutes ?? 0,
            targetMuscleGroups: ensureArray(plan.targetMuscleGroups),
            isTemplate: plan.isTemplate ?? false,
            isPublic: false,
            exercises,
          }

          return get().createPlan(duplicateData)
        },

        // ============================================================================
        // Sessions Actions
        // ============================================================================

        fetchSessions: async () => {
          // 중복 실행 방지
          const currentState = get()
          if (currentState.loading.sessions.isLoading) {
            console.warn("[workoutStore] fetchSessions 이미 로딩 중입니다")
            return
          }

          set(state => ({
            loading: {
              ...state.loading,
              sessions: { isLoading: true, error: null },
            },
          }))

          try {
            const sessions = await workoutApi.getSessions()
            // API 응답 검증
            const validatedSessions = ensureArray(sessions)
            set(state => ({
              sessions: validatedSessions,
              loading: {
                ...state.loading,
                sessions: {
                  isLoading: false,
                  error: null,
                  lastUpdated: new Date(),
                },
              },
            }))
          } catch (error) {
            console.error("[workoutStore] fetchSessions 실패", error)
            set(state => ({
              loading: {
                ...state.loading,
                sessions: {
                  isLoading: false,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                },
              },
            }))
          }
        },

        createSession: async (sessionData: CreateSessionRequest) => {
          // 입력 데이터 검증
          if (!sessionData || typeof sessionData !== "object") {
            console.error("[workoutStore] createSession: 유효하지 않은 sessionData", sessionData)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 세션 데이터입니다",
              },
            }))
            return null
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const newSession = await workoutApi.createSession(sessionData)
            // API 응답 검증
            if (!newSession || typeof newSession !== "object") {
              throw new Error("생성된 세션 데이터가 유효하지 않습니다")
            }
            set(state => ({
              sessions: [...state.sessions, newSession],
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                lastUpdatedSession: newSession,
              },
            }))
            return newSession
          } catch (error) {
            console.error("[workoutStore] createSession 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return null
          }
        },

        updateSession: async (
          sessionId: number,
          updates: UpdateSessionRequest
        ) => {
          // ID 유효성 검증
          if (!isValidId(sessionId)) {
            console.error("[workoutStore] updateSession: 유효하지 않은 sessionId", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 세션 ID입니다",
              },
            }))
            return null
          }

          // 업데이트 데이터 검증
          if (!updates || typeof updates !== "object") {
            console.error("[workoutStore] updateSession: 유효하지 않은 updates", updates)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 업데이트 데이터입니다",
              },
            }))
            return null
          }

          // 존재하는 세션인지 확인
          const existingSession = get().sessions.find(session => session.id === sessionId)
          if (!existingSession) {
            console.warn("[workoutStore] updateSession: 존재하지 않는 세션", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "존재하지 않는 세션입니다",
              },
            }))
            return null
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const updatedSession = await workoutApi.updateSession(
              sessionId,
              updates
            )
            // API 응답 검증
            if (!updatedSession || typeof updatedSession !== "object") {
              throw new Error("업데이트된 세션 데이터가 유효하지 않습니다")
            }
            set(state => ({
              sessions: state.sessions.map(session =>
                session.id === sessionId ? updatedSession : session
              ),
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                lastUpdatedSession: updatedSession,
              },
            }))
            return updatedSession
          } catch (error) {
            console.error("[workoutStore] updateSession 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return null
          }
        },

        deleteSession: async (sessionId: number) => {
          // ID 유효성 검증
          if (!isValidId(sessionId)) {
            console.error("[workoutStore] deleteSession: 유효하지 않은 sessionId", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 세션 ID입니다",
              },
            }))
            return false
          }

          // 존재하는 세션인지 확인
          const existingSession = get().sessions.find(session => session.id === sessionId)
          if (!existingSession) {
            console.warn("[workoutStore] deleteSession: 존재하지 않는 세션", sessionId)
            // 존재하지 않아도 성공으로 처리 (이미 삭제된 상태)
            return true
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            await workoutApi.deleteSession(sessionId)
            set(state => ({
              sessions: state.sessions.filter(
                session => session.id !== sessionId
              ),
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
              },
            }))
            return true
          } catch (error) {
            console.error("[workoutStore] deleteSession 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return false
          }
        },

        startSession: async (sessionId: number) => {
          // ID 유효성 검증
          if (!isValidId(sessionId)) {
            console.error("[workoutStore] startSession: 유효하지 않은 sessionId", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 세션 ID입니다",
              },
            }))
            return
          }

          const session = get().sessions.find(s => s.id === sessionId)
          if (!session) {
            console.warn("[workoutStore] startSession: 존재하지 않는 세션", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "존재하지 않는 세션입니다",
              },
            }))
            return
          }

          // 세션 상태 검증 (이미 진행 중이거나 완료된 세션은 시작할 수 없음)
          if (session.status === "in_progress") {
            console.warn("[workoutStore] startSession: 이미 진행 중인 세션", sessionId)
            return
          }
          if (session.status === "completed") {
            console.warn("[workoutStore] startSession: 이미 완료된 세션", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "이미 완료된 세션은 시작할 수 없습니다",
              },
            }))
            return
          }

          try {
            await get().updateSession(sessionId, {
              id: sessionId,
              status: "in_progress",
              startTime: new Date(),
            })

            // Start timer
            get().startTimer()
          } catch (error) {
            console.error("[workoutStore] startSession 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError:
                  error instanceof Error ? error.message : "세션 시작 실패",
              },
            }))
          }
        },

        pauseSession: async (sessionId: number) => {
          // ID 유효성 검증
          if (!isValidId(sessionId)) {
            console.error("[workoutStore] pauseSession: 유효하지 않은 sessionId", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 세션 ID입니다",
              },
            }))
            return
          }

          const session = get().sessions.find(s => s.id === sessionId)
          if (!session) {
            console.warn("[workoutStore] pauseSession: 존재하지 않는 세션", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "존재하지 않는 세션입니다",
              },
            }))
            return
          }

          // 세션 상태 검증 (진행 중인 세션만 일시정지 가능)
          if (session.status !== "in_progress") {
            console.warn("[workoutStore] pauseSession: 일시정지할 수 없는 세션 상태", {
              sessionId,
              status: session.status,
            })
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "진행 중인 세션만 일시정지할 수 있습니다",
              },
            }))
            return
          }

          try {
            await get().updateSession(sessionId, {
              id: sessionId,
              status: "paused",
            })

            // Pause timer
            get().pauseTimer()
          } catch (error) {
            console.error("[workoutStore] pauseSession 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError:
                  error instanceof Error ? error.message : "세션 일시정지 실패",
              },
            }))
          }
        },

        completeSession: async (sessionId: number) => {
          // ID 유효성 검증
          if (!isValidId(sessionId)) {
            console.error("[workoutStore] completeSession: 유효하지 않은 sessionId", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 세션 ID입니다",
              },
            }))
            return
          }

          const session = get().sessions.find(s => s.id === sessionId)
          if (!session) {
            console.warn("[workoutStore] completeSession: 존재하지 않는 세션", sessionId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "존재하지 않는 세션입니다",
              },
            }))
            return
          }

          // 세션 상태 검증 (이미 완료된 세션은 다시 완료할 수 없음)
          if (session.status === "completed") {
            console.warn("[workoutStore] completeSession: 이미 완료된 세션", sessionId)
            return
          }

          const endTime = new Date()
          // startTime 검증 및 duration 계산
          let duration = 0
          if (session.startTime) {
            const startTime = session.startTime instanceof Date
              ? session.startTime
              : new Date(session.startTime)
            const durationMs = endTime.getTime() - startTime.getTime()
            // 음수 duration 방지
            duration = Math.max(0, Math.round(durationMs / 60000))
          }

          try {
            await get().updateSession(sessionId, {
              id: sessionId,
              status: "completed",
              endTime,
              totalDurationMinutes: duration,
            })

            // Stop timer
            get().resetTimer()
          } catch (error) {
            console.error("[workoutStore] completeSession 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError:
                  error instanceof Error ? error.message : "세션 완료 실패",
              },
            }))
          }
        },

        // ============================================================================
        // Goals Actions
        // ============================================================================

        fetchGoals: async () => {
          // 중복 실행 방지
          const currentState = get()
          if (currentState.loading.goals.isLoading) {
            console.warn("[workoutStore] fetchGoals 이미 로딩 중입니다")
            return
          }

          console.log("🎯 [workoutStore] fetchGoals 시작")
          set(state => ({
            loading: {
              ...state.loading,
              goals: { isLoading: true, error: null },
            },
          }))

          try {
            const goals = await workoutApi.getGoals()
            // API 응답 검증
            const validatedGoals = ensureArray(goals)
            console.log("🎯 [workoutStore] fetchGoals 성공", {
              goalsCount: validatedGoals.length,
              goals: validatedGoals,
            })
            set(state => ({
              goals: validatedGoals,
              loading: {
                ...state.loading,
                goals: {
                  isLoading: false,
                  error: null,
                  lastUpdated: new Date(),
                },
              },
            }))
            console.log("🎯 [workoutStore] goals 상태 업데이트 완료")
          } catch (error) {
            console.error("🎯 [workoutStore] fetchGoals 실패", error)
            set(state => ({
              loading: {
                ...state.loading,
                goals: {
                  isLoading: false,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                },
              },
            }))
          }
        },

        createGoal: async (goalData: CreateGoalRequest) => {
          // 입력 데이터 검증
          if (!goalData || typeof goalData !== "object") {
            console.error("[workoutStore] createGoal: 유효하지 않은 goalData", goalData)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 목표 데이터입니다",
              },
            }))
            return null
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const newGoal = await workoutApi.createGoal(goalData)
            // API 응답 검증
            if (!newGoal || typeof newGoal !== "object") {
              throw new Error("생성된 목표 데이터가 유효하지 않습니다")
            }
            set(state => ({
              goals: [...state.goals, newGoal],
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                lastUpdatedGoal: newGoal,
              },
            }))
            return newGoal
          } catch (error) {
            console.error("[workoutStore] createGoal 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return null
          }
        },

        updateGoal: async (goalId: number, updates: UpdateGoalRequest) => {
          // ID 유효성 검증
          if (!isValidId(goalId)) {
            console.error("[workoutStore] updateGoal: 유효하지 않은 goalId", goalId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 목표 ID입니다",
              },
            }))
            return null
          }

          // 업데이트 데이터 검증
          if (!updates || typeof updates !== "object") {
            console.error("[workoutStore] updateGoal: 유효하지 않은 updates", updates)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 업데이트 데이터입니다",
              },
            }))
            return null
          }

          // 존재하는 목표인지 확인
          const existingGoal = get().goals.find(goal => goal.id === goalId)
          if (!existingGoal) {
            console.warn("[workoutStore] updateGoal: 존재하지 않는 목표", goalId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "존재하지 않는 목표입니다",
              },
            }))
            return null
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const updatedGoal = await workoutApi.updateGoal(goalId, updates)
            // API 응답 검증
            if (!updatedGoal || typeof updatedGoal !== "object") {
              throw new Error("업데이트된 목표 데이터가 유효하지 않습니다")
            }
            set(state => ({
              goals: state.goals.map(goal =>
                goal.id === goalId ? updatedGoal : goal
              ),
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                lastUpdatedGoal: updatedGoal,
              },
            }))
            return updatedGoal
          } catch (error) {
            console.error("[workoutStore] updateGoal 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return null
          }
        },

        deleteGoal: async (goalId: number) => {
          // ID 유효성 검증
          if (!isValidId(goalId)) {
            console.error("[workoutStore] deleteGoal: 유효하지 않은 goalId", goalId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 목표 ID입니다",
              },
            }))
            return false
          }

          // 존재하는 목표인지 확인
          const existingGoal = get().goals.find(goal => goal.id === goalId)
          if (!existingGoal) {
            console.warn("[workoutStore] deleteGoal: 존재하지 않는 목표", goalId)
            // 존재하지 않아도 성공으로 처리 (이미 삭제된 상태)
            return true
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            await workoutApi.deleteGoal(goalId)
            set(state => ({
              goals: state.goals.filter(goal => goal.id !== goalId),
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
              },
            }))
            return true
          } catch (error) {
            console.error("[workoutStore] deleteGoal 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalLoading: false,
                globalError:
                  error instanceof Error ? error.message : "Unknown error",
              },
            }))
            return false
          }
        },

        completeGoal: async (goalId: number) => {
          // ID 유효성 검증
          if (!isValidId(goalId)) {
            console.error("[workoutStore] completeGoal: 유효하지 않은 goalId", goalId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "유효하지 않은 목표 ID입니다",
              },
            }))
            return
          }

          const goal = get().goals.find(g => g.id === goalId)
          if (!goal) {
            console.warn("[workoutStore] completeGoal: 존재하지 않는 목표", goalId)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError: "존재하지 않는 목표입니다",
              },
            }))
            return
          }

          // 이미 완료된 목표인지 확인
          if (goal.isCompleted) {
            console.warn("[workoutStore] completeGoal: 이미 완료된 목표", goalId)
            return
          }

          try {
            await get().updateGoal(goalId, {
              id: goalId,
              isCompleted: true,
            })
          } catch (error) {
            console.error("[workoutStore] completeGoal 실패", error)
            set(state => ({
              sharedState: {
                ...state.sharedState,
                globalError:
                  error instanceof Error ? error.message : "목표 완료 실패",
              },
            }))
          }
        },

        // ============================================================================
        // Dashboard Actions
        // ============================================================================

        fetchDashboardData: async () => {
          // 중복 실행 방지
          const currentState = get()
          if (currentState.loading.overview.isLoading) {
            console.warn("[workoutStore] fetchDashboardData 이미 로딩 중입니다")
            return
          }

          set(state => ({
            loading: {
              ...state.loading,
              overview: { isLoading: true, error: null },
            },
          }))

          try {
            const dashboardData = await workoutApi.getProgress()
            // API 응답 검증
            if (!dashboardData || typeof dashboardData !== "object") {
              throw new Error("대시보드 데이터가 유효하지 않습니다")
            }
            set(state => ({
              dashboardData,
              loading: {
                ...state.loading,
                overview: {
                  isLoading: false,
                  error: null,
                  lastUpdated: new Date(),
                },
              },
            }))
          } catch (error) {
            console.error("[workoutStore] fetchDashboardData 실패", error)
            set(state => ({
              loading: {
                ...state.loading,
                overview: {
                  isLoading: false,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                },
              },
            }))
          }
        },

        refreshDashboard: async () => {
          await get().fetchDashboardData()
        },

        // ============================================================================
        // UI Actions
        // ============================================================================

        setActiveTab: (tab: TabType) => {
          // 유효한 탭인지 검증
          const validTabs: TabType[] = ["overview", "goals", "plans", "sessions", "workoutProgress"]
          if (!validTabs.includes(tab)) {
            console.error("[workoutStore] setActiveTab: 유효하지 않은 탭", tab)
            return
          }
          set({ activeTab: tab })
        },

        openPlanModal: (
          mode: "create" | "edit" | "view" | "duplicate",
          data?: WorkoutPlan
        ) => {
          set(state => ({
            modals: {
              ...state.modals,
              plan: {
                isOpen: true,
                mode,
                data,
                formData: data ? { ...data } : undefined,
              },
            },
          }))
        },

        closePlanModal: () => {
          set(state => ({
            modals: {
              ...state.modals,
              plan: { isOpen: false, mode: "create" },
            },
          }))
        },

        openSessionModal: (
          mode: "create" | "edit" | "view" | "active",
          data?: WorkoutSession
        ) => {
          set(state => ({
            modals: {
              ...state.modals,
              session: {
                isOpen: true,
                mode,
                data,
                formData: data ? { ...data } : undefined,
              },
            },
          }))
        },

        closeSessionModal: () => {
          set(state => ({
            modals: {
              ...state.modals,
              session: { isOpen: false, mode: "create" },
            },
          }))
        },

        openGoalModal: (
          mode: "create" | "edit" | "view",
          data?: WorkoutGoal
        ) => {
          set(state => ({
            modals: {
              ...state.modals,
              goal: {
                isOpen: true,
                mode,
                data,
                formData: data ? { ...data } : undefined,
              },
            },
          }))
        },

        closeGoalModal: () => {
          set(state => ({
            modals: {
              ...state.modals,
              goal: { isOpen: false, mode: "create" },
            },
          }))
        },

        // ============================================================================
        // Notification Actions
        // ============================================================================

        addNotification: (
          notification: Omit<Notification, "id" | "timestamp">
        ) => {
          // 알림 데이터 검증
          if (!notification || typeof notification !== "object") {
            console.error("[workoutStore] addNotification: 유효하지 않은 notification", notification)
            return
          }

          // 필수 필드 검증
          if (!notification.message || typeof notification.message !== "string") {
            console.error("[workoutStore] addNotification: message가 없거나 유효하지 않음", notification)
            return
          }

          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString() + Math.random().toString(36).substring(7), // 중복 방지
            timestamp: new Date(),
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              notifications: [
                ...(state.sharedState.notifications || []),
                newNotification,
              ],
            },
          }))
        },

        removeNotification: (id: string) => {
          // ID 검증
          if (!id || typeof id !== "string") {
            console.error("[workoutStore] removeNotification: 유효하지 않은 id", id)
            return
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              notifications: (state.sharedState.notifications || []).filter(
                n => n && n.id !== id
              ),
            },
          }))
        },

        clearNotifications: () => {
          set(state => ({
            sharedState: {
              ...state.sharedState,
              notifications: [],
            },
          }))
        },

        // ============================================================================
        // Error Actions
        // ============================================================================

        setGlobalError: (error: string | null) => {
          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalError: error,
            },
          }))
        },

        clearGlobalError: () => {
          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalError: null,
            },
          }))
        },

        // ============================================================================
        // Timer Actions
        // ============================================================================

        startTimer: () => {
          set(state => ({
            sharedState: {
              ...state.sharedState,
              timer: {
                ...state.sharedState.timer,
                isRunning: true,
                startTime: new Date(),
              },
            },
          }))
        },

        pauseTimer: () => {
          set(state => ({
            sharedState: {
              ...state.sharedState,
              timer: {
                ...state.sharedState.timer,
                isRunning: false,
                pauseTime: new Date(),
              },
            },
          }))
        },

        resetTimer: () => {
          set(state => ({
            sharedState: {
              ...state.sharedState,
              timer: {
                isRunning: false,
                seconds: 0,
                totalSeconds: 0,
              },
            },
          }))
        },

        updateTimer: (elapsedTime: number) => {
          // elapsedTime 검증 (음수, NaN, Infinity 방지)
          if (
            typeof elapsedTime !== "number" ||
            isNaN(elapsedTime) ||
            !isFinite(elapsedTime) ||
            elapsedTime < 0
          ) {
            console.warn("[workoutStore] updateTimer: 유효하지 않은 elapsedTime", elapsedTime)
            return
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              timer: {
                ...state.sharedState.timer,
                elapsedTime,
                seconds: Math.floor(elapsedTime),
                totalSeconds: Math.floor(elapsedTime),
              },
            },
          }))
        },

        // ============================================================================
        // Tab State Actions
        // ============================================================================

        updateOverviewTabState: (updates: Partial<OverviewTabState>) => {
          // 업데이트 데이터 검증
          if (!updates || typeof updates !== "object") {
            console.error("[workoutStore] updateOverviewTabState: 유효하지 않은 updates", updates)
            return
          }

          set(state => ({
            tabStates: {
              ...state.tabStates,
              overview: { ...state.tabStates.overview, ...updates },
            },
          }))
        },

        updatePlansTabState: (updates: Partial<PlansTabState>) => {
          // 업데이트 데이터 검증
          if (!updates || typeof updates !== "object") {
            console.error("[workoutStore] updatePlansTabState: 유효하지 않은 updates", updates)
            return
          }

          // selectedPlanId 검증 (유효한 ID인지 확인)
          if (updates.selectedPlanId !== undefined && updates.selectedPlanId !== null) {
            if (!isValidId(updates.selectedPlanId)) {
              console.warn("[workoutStore] updatePlansTabState: 유효하지 않은 selectedPlanId", updates.selectedPlanId)
              updates.selectedPlanId = null
            }
          }

          set(state => ({
            tabStates: {
              ...state.tabStates,
              plans: { ...state.tabStates.plans, ...updates },
            },
          }))
        },

        updateSessionsTabState: (updates: Partial<SessionsTabState>) => {
          // 업데이트 데이터 검증
          if (!updates || typeof updates !== "object") {
            console.error("[workoutStore] updateSessionsTabState: 유효하지 않은 updates", updates)
            return
          }

          set(state => ({
            tabStates: {
              ...state.tabStates,
              sessions: { ...state.tabStates.sessions, ...updates },
            },
          }))
        },

        updateGoalsTabState: (updates: Partial<GoalsTabState>) => {
          // 업데이트 데이터 검증
          if (!updates || typeof updates !== "object") {
            console.error("[workoutStore] updateGoalsTabState: 유효하지 않은 updates", updates)
            return
          }

          // selectedGoalId 검증 (유효한 ID인지 확인)
          if (updates.selectedGoalId !== undefined && updates.selectedGoalId !== null) {
            if (!isValidId(updates.selectedGoalId)) {
              console.warn("[workoutStore] updateGoalsTabState: 유효하지 않은 selectedGoalId", updates.selectedGoalId)
              updates.selectedGoalId = undefined
            }
          }

          set(state => ({
            tabStates: {
              ...state.tabStates,
              goals: { ...state.tabStates.goals, ...updates },
            },
          }))
        },

        updateProgressTabState: (updates: Partial<ProgressTabState>) => {
          // 업데이트 데이터 검증
          if (!updates || typeof updates !== "object") {
            console.error("[workoutStore] updateProgressTabState: 유효하지 않은 updates", updates)
            return
          }

          set(state => ({
            tabStates: {
              ...state.tabStates,
              workoutProgress: {
                ...state.tabStates.workoutProgress,
                ...updates,
              },
            },
          }))
        },

        // ============================================================================
        // Utility Actions
        // ============================================================================

        resetStore: () => {
          set(initialState)
        },

        clearCache: () => {
          // Clear cached data but keep UI state
          set(state => ({
            plans: [],
            sessions: [],
            goals: [],
            dashboardData: null,
            loading: {
              overview: { isLoading: false, error: null },
              plans: { isLoading: false, error: null },
              sessions: { isLoading: false, error: null },
              goals: { isLoading: false, error: null },
              progress: { isLoading: false, error: null },
            },
          }))
        },
      }),
      {
        name: "workout-store",
        partialize: state => ({
          activeTab: state.activeTab,
          tabStates: state.tabStates,
          sharedState: {
            ...state.sharedState,
            notifications: [], // Don't persist notifications
            globalLoading: false, // Don't persist loading state
            globalError: null, // Don't persist error state
          },
        }),
      }
    ),
    {
      name: "workout-store",
    }
  )
)
