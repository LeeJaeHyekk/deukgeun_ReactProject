import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useAuthContext } from "../../shared/contexts/AuthContext"
import { Navigation } from "../../widgets/Navigation/Navigation"
import { LoadingSpinner } from "../../shared/ui/LoadingSpinner"
import { WorkoutPlanCard } from "./components/WorkoutPlanCard"
import { WorkoutSessionTimer } from "./components/WorkoutSessionTimer"
import { WorkoutCalendar } from "./components/WorkoutCalendar"
import { ProgressChart } from "./components/ProgressChart"
import { GoalProgressBar } from "./components/GoalProgressBar"
import { WorkoutPlanModal } from "./components/WorkoutPlanModal"
import { WorkoutSessionModal } from "./components/WorkoutSessionModal"
import { WorkoutGoalModal } from "./components/WorkoutGoalModal"
import { WorkoutSectionModal } from "./components/WorkoutSectionModal"
import { SessionCard } from "./components/SessionCard"
import { useWorkoutPlans } from "./hooks/useWorkoutPlans"
import { useWorkoutSessions } from "./hooks/useWorkoutSessions"
import { useWorkoutGoals } from "./hooks/useWorkoutGoals"
import { useMachines } from "../../shared/hooks/useMachines"
import {
  WorkoutJournalApi,
  DashboardData,
  WorkoutPlan,
  WorkoutSession,
} from "../../shared/api/workoutJournalApi"
import type { WorkoutGoal, WorkoutPlanExercise } from "../../../types"
import "./WorkoutJournalPage.css"
import { GlobalWorkoutTimer } from "./components/GlobalWorkoutTimer"
import { useWorkoutTimer } from "../../shared/contexts/WorkoutTimerContext"
import WorkoutSessionService from "./services/WorkoutSessionService"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    console.log(`📝 [WorkoutJournal] ${message}`, data || "")
  },
  success: (message: string, data?: any) => {
    console.log(`✅ [WorkoutJournal] ${message}`, data || "")
  },
  warning: (message: string, data?: any) => {
    console.warn(`⚠️ [WorkoutJournal] ${message}`, data || "")
  },
  error: (message: string, error?: any) => {
    console.error(`❌ [WorkoutJournal] ${message}`, error || "")
  },
  debug: (message: string, data?: any) => {
    console.debug(`🔍 [WorkoutJournal] ${message}`, data || "")
  },
  userAction: (action: string, details?: any) => {
    console.log(`👤 [WorkoutJournal] User Action: ${action}`, details || "")
  },
  dataOperation: (operation: string, data?: any) => {
    console.log(`💾 [WorkoutJournal] Data Operation: ${operation}`, data || "")
  },
  modalOperation: (operation: string, modalType: string, data?: any) => {
    console.log(
      `🚪 [WorkoutJournal] Modal ${operation}: ${modalType}`,
      data || ""
    )
  },
  performance: (operation: string, duration: number) => {
    console.log(
      `⚡ [WorkoutJournal] Performance: ${operation} took ${duration}ms`
    )
  },
}

type TabType = "overview" | "plans" | "sessions" | "goals" | "progress"

export default function WorkoutJournalPage() {
  const { isLoggedIn, user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // 워크아웃 타이머 컨텍스트 사용
  const {
    timerState,
    sessionState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    isSessionActive,
  } = useWorkoutTimer()

  // 세션 서비스 인스턴스
  const [sessionService] = useState(() => WorkoutSessionService.getInstance())

  // 페이지 로드 로깅
  useEffect(() => {
    logger.info("Page loaded", {
      isLoggedIn,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    })
  }, [isLoggedIn, user?.id])

  // 모달 상태 통합 관리
  const [modalState, setModalState] = useState({
    plan: {
      isOpen: false,
      data: null as WorkoutPlan | null,
    },
    session: {
      isOpen: false,
      data: null as WorkoutSession | null,
    },
    goal: {
      isOpen: false,
      data: null as WorkoutGoal | null,
    },
    section: {
      isOpen: false,
      data: null as WorkoutPlanExercise | null,
    },
  })

  // 모달 상태 업데이트 함수들
  const updateModalState = useCallback(
    (
      modalType: keyof typeof modalState,
      updates: Partial<(typeof modalState)[keyof typeof modalState]>
    ) => {
      logger.debug("Updating modal state", { modalType, updates })
      setModalState(prev => ({
        ...prev,
        [modalType]: { ...prev[modalType], ...updates },
      }))
    },
    []
  )

  // 모달 열기 함수들
  const openPlanModal = useCallback(
    (plan?: WorkoutPlan | null) => {
      logger.modalOperation("Opening", "Plan", {
        planId: plan?.id,
        planName: plan?.name,
      })
      // localSelectedPlan 초기화
      const localPlan = plan ? { ...plan } : null
      logger.debug("Setting localSelectedPlan", localPlan)
      setLocalSelectedPlan(localPlan)
      updateModalState("plan", { isOpen: true, data: plan || null })
    },
    [updateModalState]
  )

  const openSessionModal = useCallback(
    (session?: WorkoutSession | null) => {
      logger.modalOperation("Opening", "Session", {
        sessionId: session?.id,
        sessionName: session?.session_name,
      })
      updateModalState("session", { isOpen: true, data: session || null })
    },
    [updateModalState]
  )

  const openGoalModal = useCallback(
    (goal?: WorkoutGoal | null) => {
      logger.modalOperation("Opening", "Goal", {
        goalId: goal?.id,
        goalTitle: goal?.title,
      })
      updateModalState("goal", { isOpen: true, data: goal || null })
    },
    [updateModalState]
  )

  const openSectionModal = useCallback(
    (exercise?: WorkoutPlanExercise | null) => {
      logger.modalOperation("Opening", "Section", {
        exerciseId: exercise?.id,
        exerciseName: exercise?.exerciseName,
        machineId: exercise?.machineId,
        sets: exercise?.sets,
        reps: exercise?.reps,
        weight: exercise?.weight,
        restTime: exercise?.restTime,
        order: exercise?.order,
        isEditMode: !!(exercise && exercise.id && exercise.id > 0),
      })
      logger.debug("Opening section modal", {
        exercise,
      })
      updateModalState("section", { isOpen: true, data: exercise || null })
    },
    [updateModalState]
  )

  // 모달 닫기 함수들
  const closePlanModal = useCallback(() => {
    logger.modalOperation("Closing", "Plan")
    // localSelectedPlan 초기화
    logger.debug("Clearing localSelectedPlan")
    setLocalSelectedPlan(null)
    // 모달 상태 초기화
    updateModalState("plan", { isOpen: false, data: null })
    // 섹션 모달도 함께 닫기 (상태 정리)
    updateModalState("section", { isOpen: false, data: null })
  }, [updateModalState])

  const closeSessionModal = useCallback(() => {
    logger.modalOperation("Closing", "Session")
    updateModalState("session", { isOpen: false, data: null })
  }, [updateModalState])

  const closeGoalModal = useCallback(() => {
    logger.modalOperation("Closing", "Goal")
    updateModalState("goal", { isOpen: false, data: null })
  }, [updateModalState])

  const closeSectionModal = useCallback(() => {
    logger.modalOperation("Closing", "Section")
    logger.debug("Closing section modal")
    updateModalState("section", { isOpen: false, data: null })
  }, [updateModalState])

  // 현재 선택된 데이터들 - 메모이제이션
  const selectedPlan = useMemo(
    () => modalState.plan.data,
    [modalState.plan.data]
  )
  const selectedSession = useMemo(
    () => modalState.session.data,
    [modalState.session.data]
  )
  const selectedGoal = useMemo(
    () => modalState.goal.data,
    [modalState.goal.data]
  )
  const selectedExercise = useMemo(
    () => modalState.section.data,
    [modalState.section.data]
  )

  // 선택된 계획의 exercises 즉시 반영을 위한 상태
  const [localSelectedPlan, setLocalSelectedPlan] =
    useState<WorkoutPlan | null>(null)

  // selectedPlan이 변경될 때 localSelectedPlan 동기화
  useEffect(() => {
    logger.debug("Selected plan changed", {
      planId: selectedPlan?.id,
      planName: selectedPlan?.name,
    })
    setLocalSelectedPlan(selectedPlan)
  }, [selectedPlan])

  // selectedExercise 변경 추적
  useEffect(() => {
    logger.debug("Selected exercise changed", {
      exerciseId: selectedExercise?.id,
      exerciseName: selectedExercise?.exerciseName,
      machineId: selectedExercise?.machineId,
      isEditMode: !!(
        selectedExercise &&
        selectedExercise.id &&
        selectedExercise.id > 0
      ),
    })
  }, [selectedExercise])

  // 모달 상태 메모이제이션
  const modalStates = useMemo(
    () => ({
      plan: modalState.plan.isOpen,
      session: modalState.session.isOpen,
      goal: modalState.goal.isOpen,
      section: modalState.section.isOpen,
    }),
    [
      modalState.plan.isOpen,
      modalState.session.isOpen,
      modalState.goal.isOpen,
      modalState.section.isOpen,
    ]
  )

  const {
    plans,
    loading: plansLoading,
    error: plansError,
    getUserPlans,
    createPlan,
    updatePlan,
    deletePlan,
    clearError: clearPlansError,
  } = useWorkoutPlans()

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    getUserSessions,
    createSession,
    updateSession,
    deleteSession,
    clearError: clearSessionsError,
  } = useWorkoutSessions()

  const {
    goals,
    loading: goalsLoading,
    error: goalsError,
    getUserGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    clearError: clearGoalsError,
  } = useWorkoutGoals()

  const {
    machines,
    loading: machinesLoading,
    error: machinesError,
    getMachines,
  } = useMachines()

  // 에러 처리
  useEffect(() => {
    const errors = [
      plansError,
      sessionsError,
      goalsError,
      machinesError,
    ].filter(Boolean)
    if (errors.length > 0) {
      logger.error("Global error detected", errors[0])
      setGlobalError(errors[0])
    } else {
      setGlobalError(null)
    }
  }, [plansError, sessionsError, goalsError, machinesError])

  // 데이터 로딩
  const loadData = useCallback(async () => {
    if (!isLoggedIn || !user) {
      logger.warning("User not logged in, skipping data load")
      return
    }

    const startTime = performance.now()
    logger.info("Starting data load", { userId: user.id })
    setIsLoading(true)
    setGlobalError(null)

    try {
      const [dashboard] = await Promise.all([
        WorkoutJournalApi.getDashboardData(),
        getUserPlans(),
        getUserSessions(),
        getUserGoals(),
        getMachines(),
      ])
      setDashboardData(dashboard)

      const duration = performance.now() - startTime
      logger.success("Data load completed", {
        duration: Math.round(duration),
        dashboardData: !!dashboard,
        plansCount: plans?.length || 0,
        sessionsCount: sessions?.length || 0,
        goalsCount: goals?.length || 0,
        machinesCount: machines?.length || 0,
      })
      logger.performance("Data load", duration)
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error("Data load failed", error)
      logger.performance("Data load (failed)", duration)
      setGlobalError("데이터를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [
    isLoggedIn,
    user,
    getUserPlans,
    getUserSessions,
    getUserGoals,
    getMachines,
  ])

  // 데이터 로딩 실행 - 의존성 최적화
  useEffect(() => {
    if (isLoggedIn && user) {
      logger.info("Triggering data load", { userId: user.id })
      loadData()
    }
  }, [isLoggedIn, user?.id])

  // 계획 생성/수정 핸들러
  const handlePlanSave = useCallback(
    async (planData: Partial<WorkoutPlan>) => {
      const startTime = performance.now()
      logger.dataOperation("Plan save started", planData)
      logger.debug("Current localSelectedPlan", localSelectedPlan)

      try {
        let savedPlan: WorkoutPlan | null = null

        if (localSelectedPlan && localSelectedPlan.id) {
          // 기존 계획 수정 - localSelectedPlan의 최신 데이터 사용
          const planDataToSave = {
            ...planData,
            exercises: localSelectedPlan.exercises || planData.exercises || [],
          }
          logger.dataOperation("Updating existing plan", planDataToSave)
          savedPlan = await updatePlan(localSelectedPlan.id, planDataToSave)
        } else {
          // 새 계획 생성 - exercises 배열 포함
          const newPlanData = {
            ...planData,
            exercises: planData.exercises || [],
          }
          logger.dataOperation("Creating new plan", newPlanData)
          savedPlan = await createPlan(newPlanData)
        }

        clearPlansError()

        // 저장된 계획으로 모달 상태 즉시 업데이트
        if (savedPlan) {
          logger.success("Plan saved successfully", savedPlan)
          updateModalState("plan", { data: savedPlan })
          // localSelectedPlan도 갱신
          setLocalSelectedPlan(savedPlan)
        }

        const duration = performance.now() - startTime
        logger.performance("Plan save", duration)
      } catch (error) {
        const duration = performance.now() - startTime
        logger.error("Plan save failed", error)
        logger.performance("Plan save (failed)", duration)
        const errorMessage =
          error instanceof Error ? error.message : "계획 저장에 실패했습니다."
        alert(errorMessage)
      }
    },
    [
      localSelectedPlan,
      updatePlan,
      createPlan,
      clearPlansError,
      updateModalState,
    ]
  )

  // 계획 편집 핸들러
  const handlePlanEdit = useCallback(
    (plan: WorkoutPlan) => {
      logger.userAction("Edit plan", { planId: plan.id, planName: plan.name })
      openPlanModal(plan)
    },
    [openPlanModal]
  )

  // 계획 삭제 핸들러
  const handlePlanDelete = useCallback(
    async (planId: number) => {
      logger.userAction("Delete plan requested", { planId })
      if (window.confirm("정말로 이 운동 계획을 삭제하시겠습니까?")) {
        const startTime = performance.now()
        try {
          logger.dataOperation("Deleting plan", { planId })
          await deletePlan(planId)
          clearPlansError()
          const duration = performance.now() - startTime
          logger.success("Plan deleted successfully", { planId })
          logger.performance("Plan delete", duration)
        } catch (error) {
          const duration = performance.now() - startTime
          logger.error("Plan delete failed", error)
          logger.performance("Plan delete (failed)", duration)
          // 에러는 hook에서 처리됨
        }
      } else {
        logger.info("Plan deletion cancelled by user")
      }
    },
    [deletePlan, clearPlansError]
  )

  // 세션 저장 핸들러 (WorkoutSessionModal용)
  const handleSessionSave = useCallback(
    async (sessionData: Partial<WorkoutSession>) => {
      const startTime = performance.now()
      logger.dataOperation("Session save started", sessionData)

      try {
        // 세션 데이터를 백엔드 API 형식에 맞게 변환
        const sessionRequestData = {
          name: sessionData.name || "새 운동 세션",
          session_name: sessionData.name || "새 운동 세션", // 백엔드 호환성
          description: sessionData.description || "",
          planId: selectedPlan?.id, // 계획 ID 추가
          plan_id: selectedPlan?.id, // 백엔드 호환성
          startTime: sessionData.startTime,
          start_time: sessionData.startTime, // 백엔드 호환성
          endTime: sessionData.endTime,
          end_time: sessionData.endTime, // 백엔드 호환성
          duration: sessionData.duration,
          caloriesBurned: sessionData.caloriesBurned,
          calories_burned: sessionData.caloriesBurned, // 백엔드 호환성
          notes: sessionData.notes || "",
          isCompleted: sessionData.isCompleted || false,
          is_completed: sessionData.isCompleted || false, // 백엔드 호환성
          exercises: (sessionData as any).exercises || [], // 운동 세부사항 추가
        }

        logger.debug("Converted session data for API", {
          ...sessionRequestData,
          planId: selectedPlan?.id,
          planName: selectedPlan?.name,
          exercisesCount: (sessionData as any).exercises?.length || 0,
        })

        await createSession(sessionRequestData)
        closeSessionModal()
        updateModalState("plan", { data: null })
        clearSessionsError()
        const duration = performance.now() - startTime
        logger.success("Session saved successfully")
        logger.performance("Session save", duration)
      } catch (error) {
        const duration = performance.now() - startTime
        logger.error("Session save failed", error)
        logger.performance("Session save (failed)", duration)
        // 에러는 hook에서 처리됨
      }
    },
    [
      createSession,
      closeSessionModal,
      updateModalState,
      clearSessionsError,
      selectedPlan,
    ]
  )

  // 목표 저장 핸들러
  const handleGoalSave = useCallback(
    async (goalData: Partial<WorkoutGoal>) => {
      const startTime = performance.now()
      logger.dataOperation("Goal save started", goalData)
      try {
        if (selectedGoal && selectedGoal.id) {
          // 기존 목표 수정
          logger.dataOperation("Updating existing goal", {
            goalId: selectedGoal.id,
          })
          await updateGoal(selectedGoal.id, goalData)
        } else {
          // 새 목표 생성
          logger.dataOperation("Creating new goal", goalData)
          await createGoal(goalData)
        }
        closeGoalModal()
        clearGoalsError()
        const duration = performance.now() - startTime
        logger.success("Goal saved successfully")
        logger.performance("Goal save", duration)
      } catch (error) {
        const duration = performance.now() - startTime
        logger.error("Goal save failed", error)
        logger.performance("Goal save (failed)", duration)
        // 에러는 hook에서 처리됨
      }
    },
    [selectedGoal, updateGoal, createGoal, closeGoalModal, clearGoalsError]
  )

  // 목표 편집 핸들러
  const handleGoalEdit = useCallback(
    (goal: WorkoutGoal) => {
      logger.userAction("Edit goal", { goalId: goal.id, goalTitle: goal.title })
      openGoalModal(goal)
    },
    [openGoalModal]
  )

  // 목표 삭제 핸들러
  const handleGoalDelete = useCallback(
    async (goalId: number) => {
      logger.userAction("Delete goal requested", { goalId })
      if (window.confirm("정말로 이 운동 목표를 삭제하시겠습니까?")) {
        const startTime = performance.now()
        try {
          logger.dataOperation("Deleting goal", { goalId })
          await deleteGoal(goalId)
          clearGoalsError()
          const duration = performance.now() - startTime
          logger.success("Goal deleted successfully", { goalId })
          logger.performance("Goal delete", duration)
        } catch (error) {
          const duration = performance.now() - startTime
          logger.error("Goal delete failed", error)
          logger.performance("Goal delete (failed)", duration)
          // 에러는 hook에서 처리됨
        }
      } else {
        logger.info("Goal deletion cancelled by user")
      }
    },
    [deleteGoal, clearGoalsError]
  )

  // 운동 섹션 저장 핸들러
  const handleSectionSave = useCallback(
    async (exerciseData: Partial<WorkoutPlanExercise>) => {
      const startTime = performance.now()
      logger.dataOperation("Section save started", {
        exerciseName: exerciseData.exerciseName,
        machineId: exerciseData.machineId,
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        weight: exerciseData.weight,
        restTime: exerciseData.restTime,
        notes: exerciseData.notes,
        order: exerciseData.order,
      })
      logger.debug("Current localSelectedPlan", {
        planId: localSelectedPlan?.id,
        planName: localSelectedPlan?.name,
        exercisesCount: localSelectedPlan?.exercises?.length || 0,
      })
      logger.debug("Current selectedExercise", {
        exerciseId: selectedExercise?.id,
        exerciseName: selectedExercise?.exerciseName,
        machineId: selectedExercise?.machineId,
        isEditMode: !!(
          selectedExercise &&
          selectedExercise.id &&
          selectedExercise.id > 0
        ),
      })

      try {
        // 새 계획을 만들고 있는 경우 (localSelectedPlan이 없거나 id가 0인 경우)
        if (!localSelectedPlan) {
          logger.error("No selected plan for section save", {
            hasLocalSelectedPlan: false,
            planId: undefined,
          })
          throw new Error("선택된 운동 계획이 없습니다.")
        }

        // 필수 필드 검증
        if (!exerciseData.machineId || exerciseData.machineId === 0) {
          logger.warning("Missing machine selection", {
            machineId: exerciseData.machineId,
          })
          throw new Error("운동 기구를 선택해주세요")
        }
        if (!exerciseData.exerciseName || !exerciseData.exerciseName.trim()) {
          logger.warning("Missing exercise name", {
            exerciseName: exerciseData.exerciseName,
          })
          throw new Error("운동 이름을 입력해주세요")
        }

        // 편집 모드인지 확인 (selectedExercise가 있고 id가 유효한 경우만 편집)
        const isEditMode =
          selectedExercise && selectedExercise.id && selectedExercise.id > 0
        if (localSelectedPlan) {
          logger.debug("Section save mode", {
            isEditMode,
            selectedExerciseId: selectedExercise?.id,
            selectedExerciseName: selectedExercise?.exerciseName,
            planId: localSelectedPlan.id,
            planName: localSelectedPlan.name,
          })
        }

        let updatedExercises: any[] = []

        if (isEditMode) {
          // 편집 모드: 기존 운동 업데이트
          logger.dataOperation("Updating existing exercise", {
            exerciseId: selectedExercise.id,
            exerciseName: selectedExercise.exerciseName,
            newData: {
              machineId: exerciseData.machineId,
              exerciseName: exerciseData.exerciseName?.trim(),
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              weight: exerciseData.weight,
              restTime: exerciseData.restTime,
            },
          })
          updatedExercises =
            localSelectedPlan.exercises?.map(exercise =>
              exercise.id === selectedExercise.id
                ? {
                    ...exercise,
                    machineId: exerciseData.machineId,
                    machine_id: exerciseData.machineId,
                    exerciseName: exerciseData.exerciseName?.trim(),
                    sets: exerciseData.sets || exercise.sets,
                    reps: exerciseData.reps || exercise.reps,
                    weight: exerciseData.weight || exercise.weight,
                    restTime: exerciseData.restTime || exercise.restTime,
                    rest_time: exerciseData.restTime || exercise.restTime,
                    notes: exerciseData.notes || exercise.notes,
                  }
                : exercise
            ) || []
        } else {
          // 추가 모드: 새 운동 추가
          const newExercise = {
            machineId: exerciseData.machineId,
            machine_id: exerciseData.machineId,
            exerciseName: exerciseData.exerciseName?.trim(),
            order:
              exerciseData.order || localSelectedPlan.exercises?.length || 0,
            sets: exerciseData.sets || 3,
            reps: exerciseData.reps || 10,
            weight: exerciseData.weight || 0,
            restTime: exerciseData.restTime || 60,
            rest_time: exerciseData.restTime || 60,
            notes: exerciseData.notes || "",
          }
          logger.dataOperation("Adding new exercise", {
            newExercise,
            currentExercisesCount: localSelectedPlan.exercises?.length || 0,
            newOrder: newExercise.order,
          })
          updatedExercises = [
            ...(localSelectedPlan.exercises || []),
            newExercise,
          ]
        }

        logger.debug("Updated exercises", {
          totalCount: updatedExercises.length,
          exercises: updatedExercises.map((ex, idx) => ({
            index: idx,
            id: ex.id,
            name: ex.exerciseName,
            machineId: ex.machineId,
            sets: ex.sets,
            reps: ex.reps,
            order: ex.order,
          })),
        })

        // localSelectedPlan 즉시 업데이트 (UI 반응성 향상)
        const updatedLocalPlan = {
          ...localSelectedPlan,
          exercises: updatedExercises,
        }
        logger.debug("Setting updatedLocalPlan", {
          planId: updatedLocalPlan.id,
          planName: updatedLocalPlan.name,
          exercisesCount: updatedLocalPlan.exercises?.length || 0,
        })
        setLocalSelectedPlan(updatedLocalPlan)

        // 새 계획인 경우 (id가 0) 서버 저장하지 않음
        if (localSelectedPlan && localSelectedPlan.id === 0) {
          logger.debug(
            "New plan - skipping server save, only updating local state",
            {
              planId: localSelectedPlan.id,
              exercisesCount: updatedExercises.length,
            }
          )

          // 섹션 모달 닫기
          logger.modalOperation("Closing", "Section")
          closeSectionModal()

          const duration = performance.now() - startTime
          logger.success("Section added to new plan successfully", {
            mode: "ADD_TO_NEW_PLAN",
            exerciseName: exerciseData.exerciseName,
            duration: Math.round(duration),
          })
          logger.performance("Section save (new plan)", duration)
          return
        }

        // API 호출로 서버 저장
        logger.dataOperation("Calling updatePlan for section", {
          planId: localSelectedPlan.id,
          exercisesCount: updatedExercises.length,
          requestData: { exercises: updatedExercises },
        })
        const updatedPlanResult = await updatePlan(localSelectedPlan.id, {
          exercises: updatedExercises,
        })

        logger.debug("updatePlan returned", {
          success: !!updatedPlanResult,
          planId: updatedPlanResult?.id,
          exercisesCount: updatedPlanResult?.exercises?.length || 0,
        })

        if (updatedPlanResult) {
          // 모달 상태 즉시 갱신
          logger.debug("Updating modal state with server result", {
            planId: updatedPlanResult.id,
            planName: updatedPlanResult.name,
            exercisesCount: updatedPlanResult.exercises?.length || 0,
          })
          updateModalState("plan", { data: updatedPlanResult })

          // localSelectedPlan을 서버 응답으로 갱신
          logger.debug("Setting localSelectedPlan to server result", {
            planId: updatedPlanResult.id,
            planName: updatedPlanResult.name,
            exercisesCount: updatedPlanResult.exercises?.length || 0,
          })
          setLocalSelectedPlan(updatedPlanResult)
        }

        // 섹션 모달 닫기
        logger.modalOperation("Closing", "Section")
        closeSectionModal()

        const duration = performance.now() - startTime
        logger.success("Section saved successfully", {
          mode: isEditMode ? "EDIT" : "ADD",
          exerciseName: exerciseData.exerciseName,
          duration: Math.round(duration),
        })
        logger.performance("Section save", duration)
      } catch (error) {
        const duration = performance.now() - startTime
        logger.error("Section save failed", {
          error: error instanceof Error ? error.message : error,
          exerciseName: exerciseData.exerciseName,
          machineId: exerciseData.machineId,
          planId: localSelectedPlan?.id,
        })
        logger.performance("Section save (failed)", duration)

        // 사용자에게 에러 메시지 표시
        alert(
          error instanceof Error
            ? error.message
            : "운동 섹션 저장에 실패했습니다."
        )
      }
    },
    [
      localSelectedPlan,
      selectedExercise,
      setLocalSelectedPlan,
      updatePlan,
      updateModalState,
      closeSectionModal,
    ]
  )

  // 운동 계획에서 섹션 추가 핸들러
  const handleAddSectionToPlan = useCallback(
    (exerciseData: Partial<WorkoutPlanExercise>) => {
      logger.userAction("Add section to plan", {
        exerciseName: exerciseData.exerciseName,
        machineId: exerciseData.machineId,
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        weight: exerciseData.weight,
        restTime: exerciseData.restTime,
        planId: localSelectedPlan?.id,
        planName: localSelectedPlan?.name,
      })

      // 새 계획을 만들고 있는 경우 (localSelectedPlan이 없거나 id가 0인 경우)
      if (!localSelectedPlan || !localSelectedPlan.id) {
        logger.debug("Adding section to new plan - plan not yet saved", {
          hasLocalSelectedPlan: !!localSelectedPlan,
          planId: localSelectedPlan?.id,
        })

        // 임시로 localSelectedPlan을 설정하여 섹션 추가 가능하게 함
        const tempPlan = {
          id: 0,
          userId: 0,
          name: localSelectedPlan?.name || "새 운동 계획",
          description: localSelectedPlan?.description || "",
          isActive: true,
          exercises: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // 임시 계획에 섹션 추가
        const exerciseWithOrder: WorkoutPlanExercise = {
          id: 0,
          planId: 0,
          machineId: exerciseData.machineId || 0,
          exerciseName: exerciseData.exerciseName || "",
          order: tempPlan.exercises.length,
          sets: exerciseData.sets || 3,
          reps: exerciseData.reps || 10,
          weight: exerciseData.weight,
          restTime: exerciseData.restTime,
          notes: exerciseData.notes,
        }

        const updatedTempPlan = {
          ...tempPlan,
          exercises: [...tempPlan.exercises, exerciseWithOrder],
        }

        setLocalSelectedPlan(updatedTempPlan)
        logger.debug("Temporary plan updated with new exercise", {
          exercisesCount: updatedTempPlan.exercises.length,
          newExercise: exerciseWithOrder,
        })

        return
      }

      logger.debug("Opening section modal for new exercise", exerciseData)
      openSectionModal(exerciseData as WorkoutPlanExercise)
    },
    [openSectionModal, localSelectedPlan, setLocalSelectedPlan]
  )

  // 섹션 편집 핸들러
  const handleSectionEdit = useCallback(
    (exercise: WorkoutPlanExercise) => {
      logger.userAction("Edit section", {
        exerciseId: exercise.id,
        exerciseName: exercise.exerciseName,
        machineId: exercise.machineId,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        restTime: exercise.restTime,
        order: exercise.order,
        planId: localSelectedPlan?.id,
        planName: localSelectedPlan?.name,
      })
      logger.debug("Opening section modal for editing", {
        exercise,
        currentPlanExercises: localSelectedPlan?.exercises?.length || 0,
      })
      openSectionModal(exercise)
    },
    [openSectionModal, localSelectedPlan]
  )

  // 섹션 삭제 핸들러
  const handleSectionDelete = useCallback(
    async (exerciseIndex: number) => {
      const exerciseToDelete = localSelectedPlan?.exercises?.[exerciseIndex]
      logger.userAction("Delete section requested", {
        exerciseIndex,
        exerciseId: exerciseToDelete?.id,
        exerciseName: exerciseToDelete?.exerciseName,
        machineId: exerciseToDelete?.machineId,
        planId: localSelectedPlan?.id,
        planName: localSelectedPlan?.name,
        totalExercises: localSelectedPlan?.exercises?.length || 0,
      })
      logger.debug("Current localSelectedPlan", {
        planId: localSelectedPlan?.id,
        planName: localSelectedPlan?.name,
        exercisesCount: localSelectedPlan?.exercises?.length || 0,
        exercises: localSelectedPlan?.exercises?.map((ex, idx) => ({
          index: idx,
          id: ex.id,
          name: ex.exerciseName,
          machineId: ex.machineId,
        })),
      })

      if (!localSelectedPlan || !localSelectedPlan.id) {
        logger.error("No selected plan for section deletion", {
          hasLocalSelectedPlan: !!localSelectedPlan,
          planId: localSelectedPlan?.id,
        })
        alert("선택된 운동 계획이 없습니다.")
        return
      }

      if (window.confirm("정말로 이 운동을 삭제하시겠습니까?")) {
        const startTime = performance.now()
        try {
          logger.info("User confirmed section deletion", {
            exerciseIndex,
            exerciseName: exerciseToDelete?.exerciseName,
          })

          const updatedExercises =
            localSelectedPlan.exercises?.filter(
              (_, index) => index !== exerciseIndex
            ) || []

          logger.dataOperation("Updated exercises after deletion", {
            originalCount: localSelectedPlan.exercises?.length || 0,
            newCount: updatedExercises.length,
            deletedExercise: exerciseToDelete,
            remainingExercises: updatedExercises.map((ex, idx) => ({
              newIndex: idx,
              id: ex.id,
              name: ex.exerciseName,
              machineId: ex.machineId,
            })),
          })

          // localSelectedPlan 즉시 업데이트 (UI 반응성 향상)
          const updatedLocalPlan = {
            ...localSelectedPlan,
            exercises: updatedExercises,
          }
          logger.debug("Setting updatedLocalPlan", {
            planId: updatedLocalPlan.id,
            planName: updatedLocalPlan.name,
            exercisesCount: updatedLocalPlan.exercises?.length || 0,
          })
          setLocalSelectedPlan(updatedLocalPlan)

          // API 호출로 서버 저장
          logger.dataOperation("Calling updatePlan for deletion", {
            planId: localSelectedPlan.id,
            exercisesCount: updatedExercises.length,
            requestData: { exercises: updatedExercises },
          })
          const updatedPlanResult = await updatePlan(localSelectedPlan.id, {
            exercises: updatedExercises,
          })

          logger.debug("updatePlan returned", {
            success: !!updatedPlanResult,
            planId: updatedPlanResult?.id,
            exercisesCount: updatedPlanResult?.exercises?.length || 0,
          })

          if (updatedPlanResult) {
            // 모달 상태 즉시 갱신
            logger.debug("Updating modal state with server result", {
              planId: updatedPlanResult.id,
              planName: updatedPlanResult.name,
              exercisesCount: updatedPlanResult.exercises?.length || 0,
            })
            updateModalState("plan", { data: updatedPlanResult })

            // localSelectedPlan을 서버 응답으로 갱신
            logger.debug("Setting localSelectedPlan to server result", {
              planId: updatedPlanResult.id,
              planName: updatedPlanResult.name,
              exercisesCount: updatedPlanResult.exercises?.length || 0,
            })
            setLocalSelectedPlan(updatedPlanResult)
          }

          const duration = performance.now() - startTime
          logger.success("Section deleted successfully", {
            exerciseIndex,
            exerciseName: exerciseToDelete?.exerciseName,
            duration: Math.round(duration),
          })
          logger.performance("Section delete", duration)
        } catch (error) {
          const duration = performance.now() - startTime
          logger.error("Section delete failed", {
            error: error instanceof Error ? error.message : error,
            exerciseIndex,
            exerciseName: exerciseToDelete?.exerciseName,
            planId: localSelectedPlan.id,
          })
          logger.performance("Section delete (failed)", duration)
          const errorMessage =
            error instanceof Error
              ? error.message
              : "운동 섹션 삭제에 실패했습니다."
          alert(errorMessage)
        }
      } else {
        logger.info("Section deletion cancelled by user", {
          exerciseIndex,
          exerciseName: exerciseToDelete?.exerciseName,
        })
      }
    },
    [localSelectedPlan, updatePlan, updateModalState]
  )

  // 목표 생성 핸들러
  const handleGoalCreate = useCallback(
    async (goalData: any) => {
      const startTime = performance.now()
      logger.dataOperation("Goal create started", goalData)
      try {
        await createGoal(goalData)
        clearGoalsError()
        const duration = performance.now() - startTime
        logger.success("Goal created successfully")
        logger.performance("Goal create", duration)
      } catch (error) {
        const duration = performance.now() - startTime
        logger.error("Goal create failed", error)
        logger.performance("Goal create (failed)", duration)
        // 에러는 hook에서 처리됨
      }
    },
    [createGoal, clearGoalsError]
  )

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (newTab: TabType) => {
      logger.userAction("Tab changed", { from: activeTab, to: newTab })
      setActiveTab(newTab)
    },
    [activeTab]
  )

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    logger.debug("Generating chart data", {
      sessionsCount: sessions?.length || 0,
    })
    const today = new Date()
    const data = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // 해당 날짜의 운동 세션 수 계산
      const sessionsOnDate =
        sessions?.filter(session => {
          if (session.start_time) {
            const sessionDate = new Date(session.start_time)
            return (
              sessionDate.getDate() === date.getDate() &&
              sessionDate.getMonth() === date.getMonth() &&
              sessionDate.getFullYear() === date.getFullYear()
            )
          }
          return false
        }) || []

      data.push({
        date: date.toISOString().split("T")[0],
        value: sessionsOnDate.length,
        label: date.toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
      })
    }

    logger.debug("Chart data generated", { dataPoints: data.length })
    return data
  }, [sessions])

  // 로딩 상태 통합
  const isDataLoading =
    isLoading ||
    plansLoading ||
    sessionsLoading ||
    goalsLoading ||
    machinesLoading

  // 로딩 상태 변경 로깅
  useEffect(() => {
    logger.debug("Loading state changed", {
      isLoading,
      plansLoading,
      sessionsLoading,
      goalsLoading,
      machinesLoading,
      isDataLoading,
    })
  }, [
    isLoading,
    plansLoading,
    sessionsLoading,
    goalsLoading,
    machinesLoading,
    isDataLoading,
  ])

  // 글로벌 타이머에서 세션 모달 열기 핸들러
  const handleOpenSessionModalFromTimer = useCallback(() => {
    const currentSession = sessionService.getCurrentSession()
    if (currentSession) {
      // 현재 세션으로 모달 열기
      openSessionModal(currentSession as any)
    } else {
      // 새 세션 모달 열기
      openSessionModal()
    }
  }, [sessionService])

  if (!isLoggedIn) {
    logger.info("User not logged in, showing auth required message")
    return (
      <div className="workout-journal-page">
        <Navigation />
        <div className="workout-journal-auth-required">
          <h2>로그인이 필요합니다</h2>
          <p>운동일지를 사용하려면 로그인해주세요.</p>
        </div>
      </div>
    )
  }

  if (isDataLoading) {
    logger.debug("Showing loading spinner")
    return (
      <div className="workout-journal-page">
        <Navigation />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="workout-journal-page">
      {/* 글로벌 워크아웃 타이머 */}
      <GlobalWorkoutTimer
        onOpenSessionModal={handleOpenSessionModalFromTimer}
      />

      <Navigation />

      <div className="workout-journal-container">
        <header className="workout-journal-header">
          <h1>운동일지</h1>
          <p>당신의 운동 여정을 기록하고 추적하세요</p>
        </header>

        {/* 전역 에러 메시지 */}
        {globalError && (
          <div className="global-error-message">
            <p>{globalError}</p>
            <button
              onClick={() => {
                logger.userAction("Dismiss global error")
                setGlobalError(null)
              }}
            >
              닫기
            </button>
          </div>
        )}

        <nav className="workout-journal-tabs">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => handleTabChange("overview")}
          >
            개요
          </button>
          <button
            className={`tab-button ${activeTab === "plans" ? "active" : ""}`}
            onClick={() => handleTabChange("plans")}
          >
            운동 계획
          </button>
          <button
            className={`tab-button ${activeTab === "sessions" ? "active" : ""}`}
            onClick={() => handleTabChange("sessions")}
          >
            운동 세션
          </button>
          <button
            className={`tab-button ${activeTab === "goals" ? "active" : ""}`}
            onClick={() => handleTabChange("goals")}
          >
            목표
          </button>
          <button
            className={`tab-button ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => handleTabChange("progress")}
          >
            진행 상황
          </button>
        </nav>

        <main className="workout-journal-content">
          {!isLoggedIn || !user ? (
            <div className="login-required">
              <h2>로그인이 필요합니다</h2>
              <p>운동 저널을 사용하려면 로그인해주세요.</p>
              <button
                className="login-button"
                onClick={() => {
                  logger.userAction("Navigate to login")
                  window.location.href = "/login"
                }}
              >
                로그인하기
              </button>
            </div>
          ) : (
            activeTab === "overview" && (
              <div className="overview-section">
                <div className="overview-stats">
                  <div className="stat-card">
                    <h3>총 운동 계획</h3>
                    <p className="stat-number">
                      {dashboardData?.summary.totalPlans || 0}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>완료된 세션</h3>
                    <p className="stat-number">
                      {dashboardData?.summary.completedSessions || 0}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>활성 목표</h3>
                    <p className="stat-number">
                      {dashboardData?.summary.activeGoals || 0}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>주간 운동</h3>
                    <p className="stat-number">
                      {dashboardData?.weeklyStats.totalSessions || 0}
                    </p>
                  </div>
                </div>

                <div className="overview-widgets">
                  <div className="widget">
                    <h3>주간 통계</h3>
                    <div className="weekly-stats">
                      <p>
                        총 운동 시간:{" "}
                        {dashboardData?.weeklyStats.totalDuration || 0}분
                      </p>
                      <p>
                        평균 기분:{" "}
                        {dashboardData?.weeklyStats.averageMood?.toFixed(1) ||
                          0}
                        /5
                      </p>
                      <p>
                        평균 에너지:{" "}
                        {dashboardData?.weeklyStats.averageEnergy?.toFixed(1) ||
                          0}
                        /5
                      </p>
                    </div>
                  </div>

                  <div className="widget">
                    <h3>목표 진행률</h3>
                    {dashboardData?.activeGoals
                      .slice(0, 3)
                      .map((goal, index) => (
                        <GoalProgressBar
                          key={goal.goal_id || `goal-${index}`}
                          goal={goal}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === "plans" && (
            <div className="plans-section">
              <div className="section-header">
                <h2>운동 계획</h2>
                <button
                  className="create-plan-button"
                  onClick={() => {
                    logger.userAction("Create new plan")
                    openPlanModal(null)
                  }}
                >
                  새 계획 만들기
                </button>
              </div>

              {plansLoading ? (
                <LoadingSpinner />
              ) : plansError ? (
                <div className="error-message">
                  {plansError}
                  <button
                    onClick={() => {
                      logger.userAction("Retry plans load")
                      clearPlansError()
                    }}
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                <div className="plans-grid">
                  {plans?.map((plan, index) => (
                    <WorkoutPlanCard
                      key={plan.plan_id || plan.id || `plan-${index}`}
                      plan={plan}
                      onEdit={() => handlePlanEdit(plan)}
                      onDelete={() => {
                        if (plan.plan_id) {
                          handlePlanDelete(plan.plan_id)
                        }
                      }}
                      onStart={() => {
                        logger.userAction("Start session from plan", {
                          planId: plan.id,
                          planName: plan.name,
                        })
                        // 계획이 있으면 세션 모달에 전달
                        logger.debug("Starting session with plan", {
                          planId: plan.id,
                          planName: plan.name,
                          exercisesCount: plan.exercises?.length || 0,
                        })
                        updateModalState("plan", { data: plan })
                        openSessionModal()
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="sessions-section">
              <div className="section-header">
                <h2>운동 세션</h2>
                <button
                  className="start-session-button"
                  onClick={() => {
                    logger.userAction("Start new session")
                    openSessionModal()
                  }}
                >
                  새 세션 시작
                </button>
              </div>

              {sessionsLoading ? (
                <LoadingSpinner />
              ) : sessionsError ? (
                <div className="error-message">
                  {sessionsError}
                  <button
                    onClick={() => {
                      logger.userAction("Retry sessions load")
                      clearSessionsError()
                    }}
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                <div className="sessions-grid">
                  {sessions && sessions.length > 0 ? (
                    sessions.map((session, index) => (
                      <SessionCard
                        key={
                          session.session_id || session.id || `session-${index}`
                        }
                        session={session}
                        onEdit={() => {
                          logger.userAction("Edit session", {
                            sessionId: session.id,
                          })
                          openSessionModal(session)
                        }}
                        onDelete={() => {
                          const sessionId = session.session_id || session.id
                          if (sessionId) {
                            logger.userAction("Delete session", {
                              sessionId,
                            })
                            if (
                              window.confirm(
                                "정말로 이 운동 세션을 삭제하시겠습니까?"
                              )
                            ) {
                              deleteSession(sessionId)
                            }
                          }
                        }}
                        onStart={() => {
                          logger.userAction("Start session", {
                            sessionId: session.id,
                          })
                          openSessionModal(session)
                        }}
                        onPause={() => {
                          logger.userAction("Pause session", {
                            sessionId: session.id,
                          })
                          // 일시정지된 세션으로 모달 열기
                          const pausedSession = {
                            ...session,
                            status: "paused",
                          }
                          openSessionModal(pausedSession)
                        }}
                        onComplete={() => {
                          logger.userAction("Complete session", {
                            sessionId: session.id,
                          })
                          // 완료된 세션으로 모달 열기
                          const completedSession = {
                            ...session,
                            isCompleted: true,
                            status: "completed",
                          }
                          openSessionModal(completedSession)
                        }}
                      />
                    ))
                  ) : (
                    <div className="empty-sessions">
                      <p>아직 운동 세션이 없습니다.</p>
                      <button
                        className="start-first-session-button"
                        onClick={() => {
                          logger.userAction("Start first session")
                          openSessionModal()
                        }}
                      >
                        첫 세션 시작하기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "goals" && (
            <div className="goals-section">
              <div className="section-header">
                <h2>운동 목표</h2>
                <button
                  className="create-goal-button"
                  onClick={() => {
                    logger.userAction("Create new goal")
                    openGoalModal(null)
                  }}
                >
                  새 목표 설정
                </button>
              </div>

              {goalsLoading ? (
                <LoadingSpinner />
              ) : goalsError ? (
                <div className="error-message">
                  {goalsError}
                  <button
                    onClick={() => {
                      logger.userAction("Retry goals load")
                      clearGoalsError()
                    }}
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                <div className="goals-list">
                  {goals?.map((goal, index) => (
                    <div key={goal.id || `goal-${index}`} className="goal-item">
                      <h3>{goal.title || goal.type}</h3>
                      <p>
                        목표: {goal.targetValue} {goal.unit}
                      </p>
                      <p>
                        현재: {goal.currentValue} {goal.unit}
                      </p>
                      <GoalProgressBar goal={goal} />
                      <div className="goal-actions">
                        <button
                          className="edit-goal-button"
                          onClick={() => handleGoalEdit(goal)}
                        >
                          수정
                        </button>
                        <button
                          className="delete-goal-button"
                          onClick={() => handleGoalDelete(goal.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "progress" && (
            <div className="progress-section">
              <h2>진행 상황</h2>
              <div className="progress-charts">
                <div className="chart-container">
                  <h3>운동 빈도</h3>
                  <ProgressChart
                    data={chartData}
                    title="주간 운동 빈도"
                    unit="회"
                    color="#4caf50"
                  />
                </div>
                <div className="chart-container">
                  <h3>근력 진행</h3>
                  <ProgressChart
                    data={[]}
                    title="근력 진행 상황"
                    unit="kg"
                    color="#2196f3"
                  />
                </div>
              </div>
              <WorkoutCalendar sessions={sessions || []} />
            </div>
          )}
        </main>
      </div>

      {/* 모달들 */}
      <WorkoutPlanModal
        isOpen={modalStates.plan}
        onClose={closePlanModal}
        onSave={handlePlanSave}
        plan={localSelectedPlan || selectedPlan}
        machines={machines || []}
        onAddSection={handleAddSectionToPlan}
        onSectionEdit={handleSectionEdit}
        onSectionDelete={handleSectionDelete}
      />

      <WorkoutSessionModal
        isOpen={modalStates.session}
        onClose={closeSessionModal}
        onSave={handleSessionSave}
        session={selectedSession}
        plan={localSelectedPlan || selectedPlan}
        machines={machines || []}
      />

      <WorkoutGoalModal
        isOpen={modalStates.goal}
        onClose={closeGoalModal}
        onSave={handleGoalSave}
        goal={selectedGoal}
      />

      <WorkoutSectionModal
        isOpen={modalStates.section}
        onClose={closeSectionModal}
        onSave={handleSectionSave}
        exercise={selectedExercise}
        machines={machines || []}
        planId={selectedPlan?.id || 0}
      />
    </div>
  )
}
