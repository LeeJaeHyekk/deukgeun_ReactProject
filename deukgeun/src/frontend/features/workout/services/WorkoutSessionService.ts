import {
  WorkoutPlan,
  WorkoutSession,
  WorkoutPlanExercise,
} from "../../../../types"

// 세션 상태 타입
export interface SessionStatus {
  isActive: boolean
  isPaused: boolean
  currentExerciseIndex: number
  currentSetIndex: number
  completedSets: { [exerciseIndex: number]: number }
  totalExercises: number
  progress: number
}

// 세션 데이터 타입
export interface SessionData {
  sessionId: string
  planId: number | null
  plan: WorkoutPlan | null
  exercises: WorkoutPlanExercise[]
  startTime: Date
  endTime?: Date
  notes: string
  status: SessionStatus
}

// 세션 저장 타입
export interface SessionSaveData {
  sessionId: string
  planId?: number
  name: string
  startTime: Date
  endTime: Date
  duration: number
  exercises: Array<{
    exerciseId: number
    machineId: number
    exerciseName: string
    sets: number
    reps: number
    weight?: number
    completedSets: number
    notes?: string
  }>
  notes: string
}

class WorkoutSessionService {
  private static instance: WorkoutSessionService
  private currentSession: SessionData | null = null
  private sessionStorageKey = "workout_session_data"

  // 싱글톤 패턴
  static getInstance(): WorkoutSessionService {
    if (!WorkoutSessionService.instance) {
      WorkoutSessionService.instance = new WorkoutSessionService()
    }
    return WorkoutSessionService.instance
  }

  // 새 세션 시작 (계획 기반)
  startSessionWithPlan(plan: WorkoutPlan): SessionData {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    this.currentSession = {
      sessionId,
      planId: plan.id,
      plan,
      exercises: plan.exercises || [],
      startTime: new Date(),
      notes: "",
      status: {
        isActive: true,
        isPaused: false,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        completedSets: {},
        totalExercises: plan.exercises?.length || 0,
        progress: 0,
      },
    }

    this.saveSessionToStorage()
    return this.currentSession
  }

  // 자유 운동 세션 시작
  startFreeSession(): SessionData {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    this.currentSession = {
      sessionId,
      planId: null,
      plan: null,
      exercises: [],
      startTime: new Date(),
      notes: "",
      status: {
        isActive: true,
        isPaused: false,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        completedSets: {},
        totalExercises: 0,
        progress: 0,
      },
    }

    this.saveSessionToStorage()
    return this.currentSession
  }

  // 세션 일시정지
  pauseSession(): void {
    if (this.currentSession) {
      this.currentSession.status.isPaused = true
      this.currentSession.status.isActive = false
      this.saveSessionToStorage()
    }
  }

  // 세션 재개
  resumeSession(): void {
    if (this.currentSession) {
      this.currentSession.status.isPaused = false
      this.currentSession.status.isActive = true
      this.saveSessionToStorage()
    }
  }

  // 세션 완료
  completeSession(): SessionSaveData | null {
    if (!this.currentSession) return null

    const endTime = new Date()
    const duration = Math.floor(
      (endTime.getTime() - this.currentSession.startTime.getTime()) / 60000
    ) // 분 단위

    const saveData: SessionSaveData = {
      sessionId: this.currentSession.sessionId,
      planId: this.currentSession.planId || undefined,
      name: this.currentSession.plan?.name || "자유 운동",
      startTime: this.currentSession.startTime,
      endTime,
      duration,
      exercises: this.currentSession.exercises.map((exercise, index) => ({
        exerciseId: exercise.id,
        machineId: exercise.machineId,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        completedSets: this.currentSession!.status.completedSets[index] || 0,
        notes: exercise.notes,
      })),
      notes: this.currentSession.notes,
    }

    // 세션 데이터 정리
    this.clearSession()
    return saveData
  }

  // 세션 취소
  cancelSession(): void {
    this.clearSession()
  }

  // 현재 운동 설정
  setCurrentExercise(exerciseIndex: number): void {
    if (
      this.currentSession &&
      exerciseIndex >= 0 &&
      exerciseIndex < this.currentSession.exercises.length
    ) {
      this.currentSession.status.currentExerciseIndex = exerciseIndex
      this.currentSession.status.currentSetIndex = 0
      this.updateProgress()
      this.saveSessionToStorage()
    }
  }

  // 세트 완료
  completeSet(exerciseIndex: number): void {
    if (this.currentSession) {
      const currentCompleted =
        this.currentSession.status.completedSets[exerciseIndex] || 0
      this.currentSession.status.completedSets[exerciseIndex] =
        currentCompleted + 1

      // 현재 운동의 모든 세트가 완료되었는지 확인
      const exercise = this.currentSession.exercises[exerciseIndex]
      if (exercise && currentCompleted + 1 >= exercise.sets) {
        // 다음 운동으로 이동
        if (exerciseIndex + 1 < this.currentSession.exercises.length) {
          this.setCurrentExercise(exerciseIndex + 1)
        } else {
          // 모든 운동 완료
          this.currentSession.status.isActive = false
        }
      } else {
        // 같은 운동의 다음 세트
        this.currentSession.status.currentSetIndex += 1
      }

      this.updateProgress()
      this.saveSessionToStorage()
    }
  }

  // 운동 추가 (자유 운동 모드)
  addExercise(exercise: WorkoutPlanExercise): void {
    if (this.currentSession && !this.currentSession.planId) {
      this.currentSession.exercises.push(exercise)
      this.currentSession.status.totalExercises =
        this.currentSession.exercises.length
      this.updateProgress()
      this.saveSessionToStorage()
    }
  }

  // 운동 제거 (자유 운동 모드)
  removeExercise(exerciseIndex: number): void {
    if (
      this.currentSession &&
      !this.currentSession.planId &&
      exerciseIndex >= 0 &&
      exerciseIndex < this.currentSession.exercises.length
    ) {
      this.currentSession.exercises.splice(exerciseIndex, 1)
      this.currentSession.status.totalExercises =
        this.currentSession.exercises.length

      // 완료된 세트 정보도 제거
      const newCompletedSets: { [key: number]: number } = {}
      Object.keys(this.currentSession.status.completedSets).forEach(key => {
        const index = parseInt(key)
        if (index < exerciseIndex) {
          newCompletedSets[index] =
            this.currentSession!.status.completedSets[index]
        } else if (index > exerciseIndex) {
          newCompletedSets[index - 1] =
            this.currentSession!.status.completedSets[index]
        }
      })
      this.currentSession.status.completedSets = newCompletedSets

      this.updateProgress()
      this.saveSessionToStorage()
    }
  }

  // 세션 메모 업데이트
  updateNotes(notes: string): void {
    if (this.currentSession) {
      this.currentSession.notes = notes
      this.saveSessionToStorage()
    }
  }

  // 진행률 업데이트
  private updateProgress(): void {
    if (this.currentSession && this.currentSession.exercises.length > 0) {
      const totalSets = this.currentSession.exercises.reduce(
        (sum, exercise) => sum + exercise.sets,
        0
      )
      const completedSets = Object.values(
        this.currentSession.status.completedSets
      ).reduce((sum, count) => sum + count, 0)
      this.currentSession.status.progress =
        totalSets > 0 ? (completedSets / totalSets) * 100 : 0
    }
  }

  // 현재 세션 가져오기
  getCurrentSession(): SessionData | null {
    return this.currentSession
  }

  // 세션 상태 가져오기
  getSessionStatus(): SessionStatus | null {
    return this.currentSession?.status || null
  }

  // 세션 활성 상태 확인
  isSessionActive(): boolean {
    return this.currentSession?.status.isActive || false
  }

  // 세션 일시정지 상태 확인
  isSessionPaused(): boolean {
    return this.currentSession?.status.isPaused || false
  }

  // 로컬 스토리지에 세션 저장
  private saveSessionToStorage(): void {
    if (this.currentSession) {
      try {
        localStorage.setItem(
          this.sessionStorageKey,
          JSON.stringify(this.currentSession)
        )
      } catch (error) {
        console.error("세션 저장 실패:", error)
      }
    }
  }

  // 로컬 스토리지에서 세션 복원
  restoreSessionFromStorage(): SessionData | null {
    try {
      const savedSession = localStorage.getItem(this.sessionStorageKey)
      if (savedSession) {
        const sessionData = JSON.parse(savedSession)

        // 세션이 24시간 이내인지 확인
        const sessionAge =
          Date.now() - new Date(sessionData.startTime).getTime()
        const maxSessionAge = 24 * 60 * 60 * 1000 // 24시간

        if (sessionAge < maxSessionAge) {
          this.currentSession = {
            ...sessionData,
            startTime: new Date(sessionData.startTime),
            endTime: sessionData.endTime
              ? new Date(sessionData.endTime)
              : undefined,
          }
          return this.currentSession
        } else {
          // 오래된 세션 제거
          this.clearSession()
        }
      }
    } catch (error) {
      console.error("세션 복원 실패:", error)
      this.clearSession()
    }
    return null
  }

  // 세션 데이터 정리
  private clearSession(): void {
    this.currentSession = null
    try {
      localStorage.removeItem(this.sessionStorageKey)
    } catch (error) {
      console.error("세션 데이터 정리 실패:", error)
    }
  }

  // 세션 통계 계산
  calculateSessionStats(): {
    totalTime: number
    totalSets: number
    completedSets: number
    progress: number
    estimatedTimeRemaining: number
  } {
    if (!this.currentSession) {
      return {
        totalTime: 0,
        totalSets: 0,
        completedSets: 0,
        progress: 0,
        estimatedTimeRemaining: 0,
      }
    }

    const totalTime = Date.now() - this.currentSession.startTime.getTime()
    const totalSets = this.currentSession.exercises.reduce(
      (sum, exercise) => sum + exercise.sets,
      0
    )
    const completedSets = Object.values(
      this.currentSession.status.completedSets
    ).reduce((sum, count) => sum + count, 0)
    const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

    // 예상 남은 시간 계산 (세트당 평균 3분 가정)
    const remainingSets = totalSets - completedSets
    const estimatedTimeRemaining = remainingSets * 3 * 60 * 1000 // 분을 밀리초로 변환

    return {
      totalTime,
      totalSets,
      completedSets,
      progress,
      estimatedTimeRemaining,
    }
  }
}

export default WorkoutSessionService
