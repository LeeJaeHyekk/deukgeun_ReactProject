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
            console.log("[workoutStore] fetchPlans 완료", {
              plansCount: plans.length,
            })
            set(state => ({
              plans,
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
          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const newPlan = await workoutApi.createPlan(planData)
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
          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const updatedPlan = await workoutApi.updatePlan(planId, updates)
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
          const plan = get().plans.find(p => p.id === planId)
          if (!plan) return null

          const duplicateData: CreatePlanRequest = {
            name: `${plan.name} (복사본)`,
            description: plan.description,
            difficulty: plan.difficulty,
            estimatedDurationMinutes: plan.estimatedDurationMinutes,
            targetMuscleGroups: plan.targetMuscleGroups,
            isTemplate: plan.isTemplate,
            isPublic: false,
            exercises: plan.exercises.map((exercise: any) => ({
              machineId: exercise.machineId,
              exerciseName: exercise.exerciseName,
              exerciseOrder: exercise.exerciseOrder,
              sets: exercise.sets,
              repsRange: exercise.repsRange,
              weightRange: exercise.weightRange,
              restSeconds: exercise.restSeconds,
              notes: exercise.notes,
            })),
          }

          return get().createPlan(duplicateData)
        },

        // ============================================================================
        // Sessions Actions
        // ============================================================================

        fetchSessions: async () => {
          set(state => ({
            loading: {
              ...state.loading,
              sessions: { isLoading: true, error: null },
            },
          }))

          try {
            const sessions = await workoutApi.getSessions()
            set(state => ({
              sessions,
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
          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const newSession = await workoutApi.createSession(sessionData)
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
          const session = get().sessions.find(s => s.id === sessionId)
          if (!session) return

          await get().updateSession(sessionId, {
            id: sessionId,
            status: "in_progress",
            startTime: new Date(),
          })

          // Start timer
          get().startTimer()
        },

        pauseSession: async (sessionId: number) => {
          await get().updateSession(sessionId, {
            id: sessionId,
            status: "paused",
          })

          // Pause timer
          get().pauseTimer()
        },

        completeSession: async (sessionId: number) => {
          const session = get().sessions.find(s => s.id === sessionId)
          if (!session) return

          const endTime = new Date()
          const duration = session.startTime
            ? Math.round(
                (endTime.getTime() - session.startTime.getTime()) / 60000
              )
            : 0

          await get().updateSession(sessionId, {
            id: sessionId,
            status: "completed",
            endTime,
            totalDurationMinutes: duration,
          })

          // Stop timer
          get().resetTimer()
        },

        // ============================================================================
        // Goals Actions
        // ============================================================================

        fetchGoals: async () => {
          console.log("🎯 [workoutStore] fetchGoals 시작")
          set(state => ({
            loading: {
              ...state.loading,
              goals: { isLoading: true, error: null },
            },
          }))

          try {
            const goals = await workoutApi.getGoals()
            console.log("🎯 [workoutStore] fetchGoals 성공", {
              goalsCount: goals.length,
              goals,
            })
            set(state => ({
              goals,
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
          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const newGoal = await workoutApi.createGoal(goalData)
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
          set(state => ({
            sharedState: {
              ...state.sharedState,
              globalLoading: true,
            },
          }))

          try {
            const updatedGoal = await workoutApi.updateGoal(goalId, updates)
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
          await get().updateGoal(goalId, {
            id: goalId,
            isCompleted: true,
          })
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
            const dashboardData = await workoutApi.getDashboardData()
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
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
          }

          set(state => ({
            sharedState: {
              ...state.sharedState,
              notifications: [
                ...state.sharedState.notifications,
                newNotification,
              ],
            },
          }))
        },

        removeNotification: (id: string) => {
          set(state => ({
            sharedState: {
              ...state.sharedState,
              notifications: state.sharedState.notifications.filter(
                n => n.id !== id
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
          set(state => ({
            sharedState: {
              ...state.sharedState,
              timer: {
                ...state.sharedState.timer,
                elapsedTime,
              },
            },
          }))
        },

        // ============================================================================
        // Tab State Actions
        // ============================================================================

        updateOverviewTabState: (updates: Partial<OverviewTabState>) => {
          set(state => ({
            tabStates: {
              ...state.tabStates,
              overview: { ...state.tabStates.overview, ...updates },
            },
          }))
        },

        updatePlansTabState: (updates: Partial<PlansTabState>) => {
          set(state => ({
            tabStates: {
              ...state.tabStates,
              plans: { ...state.tabStates.plans, ...updates },
            },
          }))
        },

        updateSessionsTabState: (updates: Partial<SessionsTabState>) => {
          set(state => ({
            tabStates: {
              ...state.tabStates,
              sessions: { ...state.tabStates.sessions, ...updates },
            },
          }))
        },

        updateGoalsTabState: (updates: Partial<GoalsTabState>) => {
          set(state => ({
            tabStates: {
              ...state.tabStates,
              goals: { ...state.tabStates.goals, ...updates },
            },
          }))
        },

        updateProgressTabState: (updates: Partial<ProgressTabState>) => {
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
