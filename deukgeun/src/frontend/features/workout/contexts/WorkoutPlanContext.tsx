import React, { createContext, useContext, useReducer, ReactNode } from "react"
import type { WorkoutPlan } from "../../../../shared/types"
import type { WorkoutPlanExerciseDTO } from "../../../../shared/types/dto/workoutplanexercise.dto"

// 상태 타입 정의
interface WorkoutPlanState {
  currentPlan: WorkoutPlan | null
  draftPlan: WorkoutPlan | null
  // 현재 편집 중인 계획의 운동 목록만 관리
  currentPlanExercises: WorkoutPlanExerciseDTO[]
  confirmedExerciseIndices: Set<number> // 확정된 운동 인덱스들
  finalizedExercises: WorkoutPlanExerciseDTO[] // 최종 확정된 운동 목록
  isEditing: boolean
  modalState: {
    isOpen: boolean
    mode: "create" | "edit" | "view"
  }
}

// 액션 타입 정의
type WorkoutPlanAction =
  | { type: "SET_CURRENT_PLAN"; payload: WorkoutPlan | null }
  | { type: "SET_DRAFT_PLAN"; payload: WorkoutPlan | null }
  | { type: "ADD_EXERCISE"; payload: WorkoutPlanExerciseDTO }
  | {
      type: "UPDATE_EXERCISE"
      payload: { index: number; exercise: WorkoutPlanExerciseDTO }
    }
  | { type: "REMOVE_EXERCISE"; payload: number }
  | {
      type: "SAVE_EXERCISE"
      payload: { index: number; exercise: WorkoutPlanExerciseDTO }
    }
  | {
      type: "CONFIRM_EXERCISE"
      payload: { index: number; exercise: WorkoutPlanExerciseDTO }
    }
  | { type: "REMOVE_SAVED_EXERCISE"; payload: number }
  | { type: "REORDER_EXERCISES"; payload: WorkoutPlanExerciseDTO[] }
  | { type: "SET_EDITING"; payload: boolean }
  | {
      type: "OPEN_MODAL"
      payload: { mode: "create" | "edit" | "view"; plan?: WorkoutPlan }
    }
  | { type: "CLOSE_MODAL" }
  | { type: "RESET_STATE" }

// 초기 상태
const initialState: WorkoutPlanState = {
  currentPlan: null,
  draftPlan: null,
  currentPlanExercises: [], // 현재 계획의 운동 목록
  confirmedExerciseIndices: new Set(),
  finalizedExercises: [],
  isEditing: false,
  modalState: {
    isOpen: false,
    mode: "create",
  },
}

// 리듀서
function workoutPlanReducer(
  state: WorkoutPlanState,
  action: WorkoutPlanAction
): WorkoutPlanState {
  console.log(`🔄 [WorkoutPlanReducer] 액션 처리: ${action.type}`)

  switch (action.type) {
    case "SET_CURRENT_PLAN":
      console.log(
        `📋 [WorkoutPlanReducer] SET_CURRENT_PLAN - ${action.payload ? `ID: ${action.payload.id}, 운동 ${action.payload.exercises?.length || 0}개` : "계획 해제"}`
      )
      return {
        ...state,
        currentPlan: action.payload,
        draftPlan: action.payload ? { ...action.payload } : null,
        currentPlanExercises: action.payload?.exercises || [], // 현재 계획의 운동 목록 설정
      }

    case "SET_DRAFT_PLAN":
      console.log(
        `📝 [WorkoutPlanReducer] SET_DRAFT_PLAN - ${action.payload ? `ID: ${action.payload.id}, 운동 ${action.payload.exercises?.length || 0}개` : "드래프트 해제"}`
      )
      return {
        ...state,
        draftPlan: action.payload,
        currentPlanExercises: action.payload?.exercises || [], // 드래프트 계획의 운동 목록 설정
      }

    case "ADD_EXERCISE": {
      const newExercise = {
        ...action.payload,
        order: state.currentPlanExercises.length, // 현재 계획의 운동 개수로 순서 설정
      }
      console.log(
        `➕ [WorkoutPlanReducer] ADD_EXERCISE - 운동 추가: ${newExercise.exerciseName}, 순서: ${newExercise.order}, 현재 계획 ID: ${state.draftPlan?.id || "새 계획"}`
      )
      const updatedExercises = [...state.currentPlanExercises, newExercise]
      return {
        ...state,
        currentPlanExercises: updatedExercises,
        draftPlan: state.draftPlan
          ? {
              ...state.draftPlan,
              exercises: updatedExercises, // 드래프트 계획의 운동 목록도 업데이트
            }
          : null,
      }
    }

    case "UPDATE_EXERCISE": {
      const updatedExercisesForUpdate = [...state.currentPlanExercises]
      updatedExercisesForUpdate[action.payload.index] = action.payload.exercise
      return {
        ...state,
        currentPlanExercises: updatedExercisesForUpdate,
        draftPlan: state.draftPlan
          ? {
              ...state.draftPlan,
              exercises: updatedExercisesForUpdate,
            }
          : null,
      }
    }

    case "REMOVE_EXERCISE": {
      const filteredExercises = state.currentPlanExercises.filter(
        (_, index) => index !== action.payload
      )
      // 순서 재정렬
      const reorderedExercises = filteredExercises.map((exercise, index) => ({
        ...exercise,
        order: index,
      }))
      return {
        ...state,
        currentPlanExercises: reorderedExercises,
        draftPlan: state.draftPlan
          ? {
              ...state.draftPlan,
              exercises: reorderedExercises,
            }
          : null,
      }
    }

    case "SAVE_EXERCISE": {
      const exerciseToSave = action.payload.exercise
      const currentExercises = [...state.currentPlanExercises]

      // 해당 인덱스의 운동을 제거하고 새로운 운동으로 교체
      currentExercises[action.payload.index] = {
        ...exerciseToSave,
        order: action.payload.index,
      }

      return {
        ...state,
        currentPlanExercises: currentExercises,
        draftPlan: state.draftPlan
          ? {
              ...state.draftPlan,
              exercises: currentExercises,
            }
          : null,
      }
    }

    case "CONFIRM_EXERCISE": {
      const updatedConfirmedIndices = new Set(state.confirmedExerciseIndices)
      updatedConfirmedIndices.add(action.payload.index)
      return {
        ...state,
        confirmedExerciseIndices: updatedConfirmedIndices,
      }
    }

    case "REMOVE_SAVED_EXERCISE": {
      const filteredFinalizedExercises = state.finalizedExercises.filter(
        (_, index) => index !== action.payload
      )
      // 순서 재정렬
      const reorderedFinalizedExercises = filteredFinalizedExercises.map(
        (exercise, index) => ({
          ...exercise,
          order: index,
        })
      )
      return {
        ...state,
        finalizedExercises: reorderedFinalizedExercises,
      }
    }

    case "REORDER_EXERCISES":
      return {
        ...state,
        currentPlanExercises: action.payload,
        draftPlan: state.draftPlan
          ? {
              ...state.draftPlan,
              exercises: action.payload,
            }
          : null,
      }

    case "SET_EDITING":
      return {
        ...state,
        isEditing: action.payload,
      }

    case "OPEN_MODAL": {
      const exercises = action.payload.plan?.exercises || []
      // 편집 모드일 때 기존 운동들을 모두 확정된 상태로 설정
      const initialConfirmedIndices: Set<number> =
        action.payload.mode === "edit"
          ? new Set(exercises.map((_, index) => index))
          : new Set()

      return {
        ...state,
        modalState: {
          isOpen: true,
          mode: action.payload.mode,
        },
        currentPlan: action.payload.plan || null,
        draftPlan: action.payload.plan ? { ...action.payload.plan } : null,
        currentPlanExercises: exercises, // 현재 계획의 운동 목록 설정
        confirmedExerciseIndices: initialConfirmedIndices,
        isEditing: action.payload.mode === "edit",
      }
    }

    case "CLOSE_MODAL": {
      return {
        ...state,
        modalState: {
          isOpen: false,
          mode: "create",
        },
        isEditing: false,
        // 모달이 닫힐 때 상태 초기화
        currentPlanExercises: [],
        confirmedExerciseIndices: new Set(),
        finalizedExercises: [],
      }
    }

    case "RESET_STATE": {
      return initialState
    }

    default:
      return state
  }
}

// Context 생성
interface WorkoutPlanContextType {
  state: WorkoutPlanState
  dispatch: React.Dispatch<WorkoutPlanAction>
  // 편의 함수들
  openCreateModal: () => void
  openEditModal: (plan: WorkoutPlan) => void
  openViewModal: (plan: WorkoutPlan) => void
  closeModal: () => void
  addExercise: (exercise: Omit<WorkoutPlanExerciseDTO, "order">) => void
  updateExercise: (index: number, exercise: WorkoutPlanExerciseDTO) => void
  removeExercise: (index: number) => void
  saveExercise: (index: number, exercise: WorkoutPlanExerciseDTO) => void
  confirmExercise: (index: number, exercise: WorkoutPlanExerciseDTO) => void
  removeSavedExercise: (index: number) => void
  reorderExercises: (exercises: WorkoutPlanExerciseDTO[]) => void
  saveDraft: (planData: Partial<WorkoutPlan>) => void
  getFinalPlan: () => WorkoutPlan | null
  resetState: () => void
}

export const WorkoutPlanContext = createContext<
  WorkoutPlanContextType | undefined
>(undefined)

// Provider 컴포넌트
interface WorkoutPlanProviderProps {
  children: ReactNode
}

export function WorkoutPlanProvider({ children }: WorkoutPlanProviderProps) {
  const [state, dispatch] = useReducer(workoutPlanReducer, initialState)

  // 편의 함수들
  const openCreateModal = () => {
    console.log(`🆕 [WorkoutPlanContext] openCreateModal - 생성 모달 열기`)
    dispatch({ type: "OPEN_MODAL", payload: { mode: "create" } })
  }

  const openEditModal = (plan: WorkoutPlan) => {
    console.log(
      `✏️ [WorkoutPlanContext] openEditModal - 수정 모달 열기: ID ${plan.id}, 이름 ${plan.name}`
    )
    dispatch({ type: "OPEN_MODAL", payload: { mode: "edit", plan } })
  }

  const openViewModal = (plan: WorkoutPlan) => {
    console.log(
      `👁️ [WorkoutPlanContext] openViewModal - 보기 모달 열기: ID ${plan.id}, 이름 ${plan.name}`
    )
    dispatch({ type: "OPEN_MODAL", payload: { mode: "view", plan } })
  }

  const closeModal = () => {
    console.log(`❌ [WorkoutPlanContext] closeModal - 모달 닫기`)
    dispatch({ type: "CLOSE_MODAL" })
  }

  const addExercise = (exercise: Omit<WorkoutPlanExerciseDTO, "order">) => {
    const newExercise: WorkoutPlanExerciseDTO = {
      ...exercise,
      order: state.currentPlanExercises.length, // 현재 계획의 운동 개수로 순서 설정
    }
    console.log(
      `➕ [WorkoutPlanContext] addExercise - 운동 추가: ${newExercise.exerciseName}, 순서: ${newExercise.order}, 현재 계획 ID: ${state.draftPlan?.id || "새 계획"}`
    )
    dispatch({ type: "ADD_EXERCISE", payload: newExercise })
  }

  const updateExercise = (index: number, exercise: WorkoutPlanExerciseDTO) => {
    console.log(
      `✏️ [WorkoutPlanContext] updateExercise - 운동 수정: 인덱스 ${index}, 운동명: ${exercise.exerciseName}`
    )
    dispatch({ type: "UPDATE_EXERCISE", payload: { index, exercise } })
  }

  const removeExercise = (index: number) => {
    console.log(
      `🗑️ [WorkoutPlanContext] removeExercise - 운동 삭제: 인덱스 ${index}`
    )
    dispatch({ type: "REMOVE_EXERCISE", payload: index })
  }

  const saveExercise = (index: number, exercise: WorkoutPlanExerciseDTO) => {
    dispatch({ type: "SAVE_EXERCISE", payload: { index, exercise } })
  }

  const confirmExercise = (index: number, exercise: WorkoutPlanExerciseDTO) => {
    dispatch({ type: "CONFIRM_EXERCISE", payload: { index, exercise } })
  }

  const removeSavedExercise = (index: number) => {
    dispatch({ type: "REMOVE_SAVED_EXERCISE", payload: index })
  }

  const reorderExercises = (exercises: WorkoutPlanExerciseDTO[]) => {
    dispatch({ type: "REORDER_EXERCISES", payload: exercises })
  }

  const saveDraft = (planData: Partial<WorkoutPlan>) => {
    console.log(
      `📝 [WorkoutPlanContext] saveDraft 호출 - 받은 데이터:`,
      planData
    )

    const draftPlan: WorkoutPlan = {
      id: state.draftPlan?.id || 0,
      userId: state.draftPlan?.userId || 0,
      name: planData.name || state.draftPlan?.name || "",
      description: planData.description || state.draftPlan?.description || "",
      difficulty:
        planData.difficulty || state.draftPlan?.difficulty || "beginner",
      duration: planData.duration || state.draftPlan?.duration || 60,
      estimated_duration_minutes:
        planData.estimated_duration_minutes ||
        state.draftPlan?.estimated_duration_minutes ||
        60,
      exercises: state.currentPlanExercises, // 현재 계획의 운동 목록 사용
      isActive: planData.isActive ?? state.draftPlan?.isActive ?? true,
      createdAt: state.draftPlan?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    console.log(`📝 [WorkoutPlanContext] saveDraft - 생성된 드래프트:`, {
      id: draftPlan.id,
      name: draftPlan.name,
      estimated_duration_minutes: draftPlan.estimated_duration_minutes,
      exercisesCount: draftPlan.exercises?.length || 0,
    })

    dispatch({ type: "SET_DRAFT_PLAN", payload: draftPlan })
  }

  const getFinalPlan = () => {
    if (!state.draftPlan) return null

    // 확정된 운동들만 필터링하여 최종 계획 생성
    const finalExercises = state.currentPlanExercises.filter((_, index) =>
      state.confirmedExerciseIndices.has(index)
    )

    console.log("🔍 [WorkoutPlanContext] getFinalPlan - 확정된 운동들:", {
      confirmedIndices: Array.from(state.confirmedExerciseIndices),
      allExercises: state.currentPlanExercises,
      finalExercises,
    })

    const finalPlan = {
      ...state.draftPlan,
      exercises: finalExercises,
    }

    console.log("📋 [WorkoutPlanContext] getFinalPlan - 최종 계획:", finalPlan)
    return finalPlan
  }

  const resetState = () => {
    dispatch({ type: "RESET_STATE" })
  }

  const value: WorkoutPlanContextType = {
    state,
    dispatch,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    addExercise,
    updateExercise,
    removeExercise,
    saveExercise,
    confirmExercise,
    removeSavedExercise,
    reorderExercises,
    saveDraft,
    getFinalPlan,
    resetState,
  }

  return (
    <WorkoutPlanContext.Provider value={value}>
      {children}
    </WorkoutPlanContext.Provider>
  )
}

// Hook
export function useWorkoutPlan() {
  const context = useContext(WorkoutPlanContext)
  if (context === undefined) {
    throw new Error("useWorkoutPlan must be used within a WorkoutPlanProvider")
  }
  return context
}
