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

type TabType = "overview" | "plans" | "sessions" | "goals" | "progress"

export default function WorkoutJournalPage() {
  const { isLoggedIn, user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

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
      console.log("🚀 [WorkoutJournalPage] openPlanModal called with:", plan)
      // localSelectedPlan 초기화
      const localPlan = plan ? { ...plan } : null
      console.log(
        "📝 [WorkoutJournalPage] Setting localSelectedPlan:",
        localPlan
      )
      setLocalSelectedPlan(localPlan)
      updateModalState("plan", { isOpen: true, data: plan || null })
    },
    [updateModalState]
  )

  const openSessionModal = useCallback(
    (session?: WorkoutSession | null) => {
      updateModalState("session", { isOpen: true, data: session || null })
    },
    [updateModalState]
  )

  const openGoalModal = useCallback(
    (goal?: WorkoutGoal | null) => {
      updateModalState("goal", { isOpen: true, data: goal || null })
    },
    [updateModalState]
  )

  const openSectionModal = useCallback(
    (exercise?: WorkoutPlanExercise | null) => {
      updateModalState("section", { isOpen: true, data: exercise || null })
    },
    [updateModalState]
  )

  // 모달 닫기 함수들
  const closePlanModal = useCallback(() => {
    console.log("🚪 [WorkoutJournalPage] closePlanModal called")
    // localSelectedPlan 초기화
    console.log("📝 [WorkoutJournalPage] Clearing localSelectedPlan")
    setLocalSelectedPlan(null)
    // 모달 상태 초기화
    updateModalState("plan", { isOpen: false, data: null })
    // 섹션 모달도 함께 닫기 (상태 정리)
    updateModalState("section", { isOpen: false, data: null })
  }, [updateModalState])

  const closeSessionModal = useCallback(() => {
    updateModalState("session", { isOpen: false, data: null })
  }, [updateModalState])

  const closeGoalModal = useCallback(() => {
    updateModalState("goal", { isOpen: false, data: null })
  }, [updateModalState])

  const closeSectionModal = useCallback(() => {
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
    setLocalSelectedPlan(selectedPlan)
  }, [selectedPlan])

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
      setGlobalError(errors[0])
    } else {
      setGlobalError(null)
    }
  }, [plansError, sessionsError, goalsError, machinesError])

  // 데이터 로딩
  const loadData = useCallback(async () => {
    if (!isLoggedIn || !user) {
      return
    }

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
    } catch (error) {
      console.error("데이터 로딩 실패:", error)
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
      loadData()
    }
  }, [isLoggedIn, user?.id])

  // 계획 생성/수정 핸들러
  const handlePlanSave = useCallback(
    async (planData: Partial<WorkoutPlan>) => {
      console.log(
        "💾 [WorkoutJournalPage] handlePlanSave called with:",
        planData
      )
      console.log(
        "📋 [WorkoutJournalPage] Current localSelectedPlan:",
        localSelectedPlan
      )

      try {
        let savedPlan: WorkoutPlan | null = null

        if (localSelectedPlan && localSelectedPlan.id) {
          // 기존 계획 수정 - localSelectedPlan의 최신 데이터 사용
          const planDataToSave = {
            ...planData,
            exercises: localSelectedPlan.exercises || planData.exercises || [],
          }
          console.log(
            "📤 [WorkoutJournalPage] Updating existing plan with:",
            planDataToSave
          )
          savedPlan = await updatePlan(localSelectedPlan.id, planDataToSave)
        } else {
          // 새 계획 생성 - exercises 배열 포함
          const newPlanData = {
            ...planData,
            exercises: planData.exercises || [],
          }
          console.log(
            "📤 [WorkoutJournalPage] Creating new plan with:",
            newPlanData
          )
          savedPlan = await createPlan(newPlanData)
        }

        clearPlansError()

        // 저장된 계획으로 모달 상태 즉시 업데이트
        if (savedPlan) {
          console.log(
            "📝 [WorkoutJournalPage] Plan saved successfully:",
            savedPlan
          )
          updateModalState("plan", { data: savedPlan })
          // localSelectedPlan도 갱신
          setLocalSelectedPlan(savedPlan)
        }

        // useWorkoutPlans 훅에서 이미 즉시 UI 업데이트를 처리하므로
        // 추가적인 getUserPlans() 호출은 불필요
      } catch (error) {
        console.error("❌ [WorkoutJournalPage] 계획 저장 실패:", error)
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
      openPlanModal(plan)
    },
    [openPlanModal]
  )

  // 계획 삭제 핸들러
  const handlePlanDelete = useCallback(
    async (planId: number) => {
      if (window.confirm("정말로 이 운동 계획을 삭제하시겠습니까?")) {
        try {
          await deletePlan(planId)
          clearPlansError()
        } catch (error) {
          console.error("계획 삭제 실패:", error)
          // 에러는 hook에서 처리됨
        }
      }
    },
    [deletePlan, clearPlansError]
  )

  // 세션 시작 핸들러
  const handleSessionStart = useCallback(
    (plan?: WorkoutPlan) => {
      if (plan) {
        updateModalState("plan", { data: plan })
      }
      openSessionModal()
    },
    [openSessionModal, updateModalState]
  )

  // 세션 저장 핸들러
  const handleSessionSave = useCallback(
    async (sessionData: Partial<WorkoutSession>) => {
      try {
        await createSession(sessionData)
        closeSessionModal()
        updateModalState("plan", { data: null })
        clearSessionsError()
      } catch (error) {
        console.error("세션 저장 실패:", error)
        // 에러는 hook에서 처리됨
      }
    },
    [createSession, closeSessionModal, updateModalState, clearSessionsError]
  )

  // 세션 삭제 핸들러
  const handleSessionDelete = useCallback(
    async (sessionId: number) => {
      if (window.confirm("정말로 이 운동 세션을 삭제하시겠습니까?")) {
        try {
          await deleteSession(sessionId)
          clearSessionsError()
        } catch (error) {
          console.error("세션 삭제 실패:", error)
          // 에러는 hook에서 처리됨
        }
      }
    },
    [deleteSession, clearSessionsError]
  )

  // 목표 저장 핸들러
  const handleGoalSave = useCallback(
    async (goalData: Partial<WorkoutGoal>) => {
      try {
        if (selectedGoal && selectedGoal.id) {
          // 기존 목표 수정
          await updateGoal(selectedGoal.id, goalData)
        } else {
          // 새 목표 생성
          await createGoal(goalData)
        }
        closeGoalModal()
        clearGoalsError()
      } catch (error) {
        console.error("목표 저장 실패:", error)
        // 에러는 hook에서 처리됨
      }
    },
    [selectedGoal, updateGoal, createGoal, closeGoalModal, clearGoalsError]
  )

  // 목표 편집 핸들러
  const handleGoalEdit = useCallback(
    (goal: WorkoutGoal) => {
      openGoalModal(goal)
    },
    [openGoalModal]
  )

  // 목표 삭제 핸들러
  const handleGoalDelete = useCallback(
    async (goalId: number) => {
      if (window.confirm("정말로 이 운동 목표를 삭제하시겠습니까?")) {
        try {
          await deleteGoal(goalId)
          clearGoalsError()
        } catch (error) {
          console.error("목표 삭제 실패:", error)
          // 에러는 hook에서 처리됨
        }
      }
    },
    [deleteGoal, clearGoalsError]
  )

  // 운동 섹션 저장 핸들러
  const handleSectionSave = useCallback(
    async (exerciseData: Partial<WorkoutPlanExercise>) => {
      console.log(
        "💾 [WorkoutJournalPage] handleSectionSave called with:",
        exerciseData
      )
      console.log(
        "📋 [WorkoutJournalPage] Current localSelectedPlan:",
        localSelectedPlan
      )
      console.log(
        "🎯 [WorkoutJournalPage] Current selectedExercise:",
        selectedExercise
      )

      try {
        if (!localSelectedPlan || !localSelectedPlan.id) {
          throw new Error("선택된 운동 계획이 없습니다.")
        }

        // 필수 필드 검증
        if (!exerciseData.machineId || exerciseData.machineId === 0) {
          throw new Error("운동 기구를 선택해주세요")
        }
        if (!exerciseData.exerciseName || !exerciseData.exerciseName.trim()) {
          throw new Error("운동 이름을 입력해주세요")
        }

        // 편집 모드인지 확인 (selectedExercise가 있고 id가 유효한 경우만 편집)
        const isEditMode =
          selectedExercise && selectedExercise.id && selectedExercise.id > 0
        console.log(
          "🔄 [WorkoutJournalPage] Section save mode:",
          isEditMode ? "EDIT" : "ADD"
        )
        console.log("🔍 [WorkoutJournalPage] selectedExercise details:", {
          hasSelectedExercise: !!selectedExercise,
          selectedExerciseId: selectedExercise?.id,
          selectedExerciseName: selectedExercise?.exerciseName,
          isEditMode,
        })
        let updatedExercises: any[] = []

        if (isEditMode) {
          // 편집 모드: 기존 운동 업데이트
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
          console.log(
            "➕ [WorkoutJournalPage] Adding new exercise:",
            newExercise
          )
          updatedExercises = [
            ...(localSelectedPlan.exercises || []),
            newExercise,
          ]
        }

        console.log(
          "📝 [WorkoutJournalPage] Updated exercises:",
          updatedExercises
        )

        // localSelectedPlan 즉시 업데이트 (UI 반응성 향상)
        const updatedLocalPlan = {
          ...localSelectedPlan,
          exercises: updatedExercises,
        }
        console.log(
          "📝 [WorkoutJournalPage] Setting updatedLocalPlan:",
          updatedLocalPlan
        )
        setLocalSelectedPlan(updatedLocalPlan)

        // API 호출로 서버 저장
        console.log("📤 [WorkoutJournalPage] Calling updatePlan with:", {
          planId: localSelectedPlan.id,
          exercises: updatedExercises,
        })
        const updatedPlanResult = await updatePlan(localSelectedPlan.id, {
          exercises: updatedExercises,
        })

        console.log(
          "📥 [WorkoutJournalPage] updatePlan returned:",
          updatedPlanResult
        )

        if (updatedPlanResult) {
          // 모달 상태 즉시 갱신
          console.log(
            "🔄 [WorkoutJournalPage] Updating modal state with:",
            updatedPlanResult
          )
          updateModalState("plan", { data: updatedPlanResult })

          // localSelectedPlan을 서버 응답으로 갱신
          console.log(
            "📝 [WorkoutJournalPage] Setting localSelectedPlan to server result:",
            updatedPlanResult
          )
          setLocalSelectedPlan(updatedPlanResult)
        }

        // 섹션 모달 닫기
        console.log("🚪 [WorkoutJournalPage] Closing section modal")
        closeSectionModal()
      } catch (error) {
        console.error("❌ [WorkoutJournalPage] 운동 섹션 저장 실패:", error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : "운동 섹션 저장에 실패했습니다."
        alert(errorMessage)
      }
    },
    [
      localSelectedPlan,
      selectedExercise,
      updatePlan,
      updateModalState,
      closeSectionModal,
    ]
  )

  // 운동 계획에서 섹션 추가 핸들러
  const handleAddSectionToPlan = useCallback(
    (exerciseData: Partial<WorkoutPlanExercise>) => {
      console.log(
        "➕ [WorkoutJournalPage] handleAddSectionToPlan called with:",
        exerciseData
      )
      openSectionModal(exerciseData as WorkoutPlanExercise)
    },
    [openSectionModal]
  )

  // 섹션 편집 핸들러
  const handleSectionEdit = useCallback(
    (exercise: WorkoutPlanExercise) => {
      console.log(
        "✏️ [WorkoutJournalPage] handleSectionEdit called with:",
        exercise
      )
      openSectionModal(exercise)
    },
    [openSectionModal]
  )

  // 섹션 삭제 핸들러
  const handleSectionDelete = useCallback(
    async (exerciseIndex: number) => {
      console.log(
        "🗑️ [WorkoutJournalPage] handleSectionDelete called with index:",
        exerciseIndex
      )
      console.log(
        "📋 [WorkoutJournalPage] Current localSelectedPlan:",
        localSelectedPlan
      )

      if (!localSelectedPlan || !localSelectedPlan.id) {
        alert("선택된 운동 계획이 없습니다.")
        return
      }

      if (window.confirm("정말로 이 운동을 삭제하시겠습니까?")) {
        try {
          const updatedExercises =
            localSelectedPlan.exercises?.filter(
              (_, index) => index !== exerciseIndex
            ) || []

          console.log(
            "📝 [WorkoutJournalPage] Updated exercises after deletion:",
            updatedExercises
          )

          // localSelectedPlan 즉시 업데이트 (UI 반응성 향상)
          const updatedLocalPlan = {
            ...localSelectedPlan,
            exercises: updatedExercises,
          }
          console.log(
            "📝 [WorkoutJournalPage] Setting updatedLocalPlan:",
            updatedLocalPlan
          )
          setLocalSelectedPlan(updatedLocalPlan)

          // API 호출로 서버 저장
          console.log(
            "📤 [WorkoutJournalPage] Calling updatePlan for deletion with:",
            {
              planId: localSelectedPlan.id,
              exercises: updatedExercises,
            }
          )
          const updatedPlanResult = await updatePlan(localSelectedPlan.id, {
            exercises: updatedExercises,
          })

          console.log(
            "📥 [WorkoutJournalPage] updatePlan returned:",
            updatedPlanResult
          )

          if (updatedPlanResult) {
            // 모달 상태 즉시 갱신
            console.log(
              "🔄 [WorkoutJournalPage] Updating modal state with:",
              updatedPlanResult
            )
            updateModalState("plan", { data: updatedPlanResult })

            // localSelectedPlan을 서버 응답으로 갱신
            console.log(
              "📝 [WorkoutJournalPage] Setting localSelectedPlan to server result:",
              updatedPlanResult
            )
            setLocalSelectedPlan(updatedPlanResult)
          }
        } catch (error) {
          console.error("❌ [WorkoutJournalPage] 운동 섹션 삭제 실패:", error)
          const errorMessage =
            error instanceof Error
              ? error.message
              : "운동 섹션 삭제에 실패했습니다."
          alert(errorMessage)
        }
      }
    },
    [localSelectedPlan, updatePlan, updateModalState]
  )

  // 목표 생성 핸들러
  const handleGoalCreate = useCallback(
    async (goalData: any) => {
      try {
        await createGoal(goalData)
        clearGoalsError()
      } catch (error) {
        console.error("목표 생성 실패:", error)
        // 에러는 hook에서 처리됨
      }
    },
    [createGoal, clearGoalsError]
  )

  // 차트 데이터 생성
  const chartData = useMemo(() => {
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

    return data
  }, [sessions])

  // 로딩 상태 통합
  const isDataLoading =
    isLoading ||
    plansLoading ||
    sessionsLoading ||
    goalsLoading ||
    machinesLoading

  if (!isLoggedIn) {
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
    return (
      <div className="workout-journal-page">
        <Navigation />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="workout-journal-page">
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
            <button onClick={() => setGlobalError(null)}>닫기</button>
          </div>
        )}

        <nav className="workout-journal-tabs">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            개요
          </button>
          <button
            className={`tab-button ${activeTab === "plans" ? "active" : ""}`}
            onClick={() => setActiveTab("plans")}
          >
            운동 계획
          </button>
          <button
            className={`tab-button ${activeTab === "sessions" ? "active" : ""}`}
            onClick={() => setActiveTab("sessions")}
          >
            운동 세션
          </button>
          <button
            className={`tab-button ${activeTab === "goals" ? "active" : ""}`}
            onClick={() => setActiveTab("goals")}
          >
            목표
          </button>
          <button
            className={`tab-button ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => setActiveTab("progress")}
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
                onClick={() => (window.location.href = "/login")}
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
                          key={`goal-${goal.goal_id || index}`}
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
                  onClick={() => openPlanModal(null)}
                >
                  새 계획 만들기
                </button>
              </div>

              {plansLoading ? (
                <LoadingSpinner />
              ) : plansError ? (
                <div className="error-message">
                  {plansError}
                  <button onClick={clearPlansError}>다시 시도</button>
                </div>
              ) : (
                <div className="plans-grid">
                  {plans?.map((plan, index) => (
                    <WorkoutPlanCard
                      key={`plan-${plan.plan_id || plan.id || index}`}
                      plan={plan}
                      onEdit={() => handlePlanEdit(plan)}
                      onDelete={() => {
                        if (plan.plan_id) {
                          handlePlanDelete(plan.plan_id)
                        }
                      }}
                      onStart={() => handleSessionStart(plan)}
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
                  onClick={() => handleSessionStart()}
                >
                  새 세션 시작
                </button>
              </div>

              {sessionsLoading ? (
                <LoadingSpinner />
              ) : sessionsError ? (
                <div className="error-message">
                  {sessionsError}
                  <button onClick={clearSessionsError}>다시 시도</button>
                </div>
              ) : (
                <div className="sessions-list">
                  {sessions?.map(session => (
                    <div key={session.session_id} className="session-item">
                      <h3>{session.session_name}</h3>
                      {session.start_time && (
                        <p>
                          시작: {new Date(session.start_time).toLocaleString()}
                        </p>
                      )}
                      {session.end_time && (
                        <p>
                          완료: {new Date(session.end_time).toLocaleString()}
                        </p>
                      )}
                      <span className={`status-badge ${session.status}`}>
                        {session.status === "completed"
                          ? "완료"
                          : session.status === "in_progress"
                            ? "진행 중"
                            : session.status === "paused"
                              ? "일시정지"
                              : "취소됨"}
                      </span>
                      <button
                        className="delete-session-button"
                        onClick={() => {
                          if (session.session_id) {
                            handleSessionDelete(session.session_id)
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
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
                  onClick={() => openGoalModal(null)}
                >
                  새 목표 설정
                </button>
              </div>

              {goalsLoading ? (
                <LoadingSpinner />
              ) : goalsError ? (
                <div className="error-message">
                  {goalsError}
                  <button onClick={clearGoalsError}>다시 시도</button>
                </div>
              ) : (
                <div className="goals-list">
                  {goals?.map(goal => (
                    <div key={goal.id} className="goal-item">
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
        plan={selectedPlan}
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
