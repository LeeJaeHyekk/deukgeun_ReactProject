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
} from "../types"
import { workoutApi } from "../api/workoutApi"

// ============================================================================
// Store State Interface
// ============================================================================

interface WorkoutStoreState {
  // Data State
  plans: WorkoutPlan[]
  sessions: WorkoutSession[]
  goals: WorkoutGoal[]

  // Loading States
  loading: {
    plans: LoadingState
    sessions: LoadingState
    goals: LoadingState
  }

  // UI State
  activeTab: TabType
  modals: {
    plan: WorkoutPlanModalState
    session: WorkoutSessionModalState
    goal: WorkoutGoalModalState
  }

  // Current Working State
  currentPlan: WorkoutPlan | null
  currentSession: WorkoutSession | null
  currentGoal: WorkoutGoal | null

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

  // Utility Actions
  resetStore: () => void
  clearErrors: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  plans: [],
  sessions: [],
  goals: [],
  loading: {
    plans: { isLoading: false, error: null },
    sessions: { isLoading: false, error: null },
    goals: { isLoading: false, error: null },
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
        // Utility Actions
        // ============================================================================

        resetStore: () => {
          console.log("🔄 [WorkoutStore] Resetting store")
          set(initialState)
        },

        clearErrors: () => {
          console.log("🧹 [WorkoutStore] Clearing errors")
          set({
            loading: {
              plans: { isLoading: false, error: null },
              sessions: { isLoading: false, error: null },
              goals: { isLoading: false, error: null },
            },
          })
        },
      }),
      {
        name: "workout-store",
        partialize: state => ({
          activeTab: state.activeTab,
          modals: state.modals,
        }),
      }
    ),
    {
      name: "workout-store",
    }
  )
)
