// ============================================================================
// Workout Redux Slice - 새로운 구조
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@frontend/shared/store"
import { goalApi } from "@frontend/shared/api/goalApi"

/** ---------- 타입 정의 ---------- **/

export type TaskStatus = "pending" | "in_progress" | "completed"

export interface Task {
  taskId: string
  name: string
  category?: string
  setCount: number
  repsPerSet: number
  restTimeSec?: number
  completedSets: number
  weightPerSet?: number
  status: TaskStatus
  notes?: string
  photos?: string[]
  createdAt: string
  updatedAt: string
}

export interface Goal {
  goalId: string
  title: string
  description?: string
  category?: string
  status: "planned" | "active" | "done"
  createdAt: string
  updatedAt: string
  targetDate?: string
  expReward?: number
  difficulty?: "beginner" | "intermediate" | "advanced"
  tasks: Task[]
}

export interface User {
  userId: string
  nickname?: string
  level: number
  exp: number
  totalWorkoutCount?: number
  weeklyWorkoutCount?: number
  lastActiveAt?: string
}

export interface ActiveWorkout {
  sessionId: string
  goalId: string
  startTime: string
  endTime?: string | null
  progress: number
  activeTaskId?: string
  currentSet?: number
  restTimerSec?: number
  addedTasks: Task[]
  notes?: string
  photos?: string[]
}

export interface CompletedWorkout {
  completedId: string
  goalId: string
  goalTitle?: string
  completedAt: string
  totalSets: number
  totalReps: number
  avgIntensity?: number
  expEarned: number
  durationMin?: number
  summary?: {
    muscleGroups?: string[]
    equipmentUsed?: string[]
    comment?: string
  }
  graphData?: any
}

export interface WorkoutState {
  user: User | null
  goals: Goal[]
  activeWorkout: ActiveWorkout | null
  completedWorkouts: CompletedWorkout[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error?: string | null
}

/** ---------- 초기 상태 ---------- **/

const initialState: WorkoutState = {
  user: null,
  goals: [],
  activeWorkout: null,
  completedWorkouts: [],
  status: "idle",
  error: null,
}

/** ---------- 헬퍼 함수 ---------- **/
// calcGoalProgress는 utils/goalUtils.ts로 이동 (재사용성 향상)
import { calcGoalProgress } from '../utils/goalUtils'
export { calcGoalProgress } // 하위 호환성을 위해 export 유지

/** ---------- 레벨 계산 함수 (백엔드와 동일한 공식 사용) ---------- **/

// 백엔드와 동일한 레벨 계산 공식 사용
import { calculateLevelFromTotalExp } from "@frontend/shared/utils/levelUtils"

const calcLevelFromExp = (exp: number): number => {
  // 백엔드 공식 사용: baseExp * multiplier^(level-1)
  const { level } = calculateLevelFromTotalExp(exp || 0)
  return level
}

/** ---------- Async Thunks ---------- **/

/**
 * 백엔드에서 목표 목록 불러오기
 */
export const fetchGoalsFromBackend = createAsyncThunk(
  "workout/fetchGoalsFromBackend",
  async (userId: number | string, { rejectWithValue }) => {
    try {
      const goals = await goalApi.fetchGoals(userId)
      
      // 디버깅: 백엔드 원본 응답 확인
      console.log('📥 [fetchGoalsFromBackend] 백엔드 원본 응답:', {
        goalsCount: goals.length,
        goals: goals.map((goal: any) => ({
          goalId: goal.goalId,
          goalTitle: goal.goalTitle,
          completedWorkouts: goal.completedWorkouts,
          history: goal.history,
          completedWorkoutsType: typeof goal.completedWorkouts,
          historyType: typeof goal.history,
          completedWorkoutsIsArray: Array.isArray(goal.completedWorkouts),
          historyIsArray: Array.isArray(goal.history),
          completedWorkoutsLength: Array.isArray(goal.completedWorkouts) ? goal.completedWorkouts.length : 'N/A',
          historyLength: Array.isArray(goal.history) ? goal.history.length : 'N/A',
        }))
      })
      
      // Goal 타입으로 변환 (백엔드 원본 데이터도 포함)
      return goals.map((goal) => ({
        goalId: String(goal.goalId || ''),
        title: goal.goalTitle,
        description: goal.description,
        category: goal.category,
        status: (goal.status || 'planned') as "planned" | "active" | "done",
        createdAt: goal.createdAt || new Date().toISOString(),
        updatedAt: goal.updatedAt || new Date().toISOString(),
        targetDate: goal.targetDate,
        expReward: goal.expReward,
        difficulty: goal.difficulty as "beginner" | "intermediate" | "advanced" | undefined,
        tasks: goal.tasks || [],
        // 백엔드 원본 데이터 유지 (completedWorkouts, history 포함)
        _backendData: goal,
      }))
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

/**
 * 운동 완료 및 백엔드 저장
 */
export const endSessionAndSaveToBackend = createAsyncThunk(
  "workout/endSessionAndSaveToBackend",
  async (
    {
      sessionId,
      goalId,
      userId,
      completedWorkout,
    }: {
      sessionId: string
      goalId: string
      userId: number | string
      completedWorkout: CompletedWorkout
    },
    { rejectWithValue }
  ) => {
    try {
      // 백엔드에 저장
      await goalApi.saveCompletedWorkout(goalId, {
        date: completedWorkout.completedAt,
        completedAt: completedWorkout.completedAt,
        totalDurationMinutes: completedWorkout.durationMin,
        totalSets: completedWorkout.totalSets,
        totalReps: completedWorkout.totalReps,
        expEarned: completedWorkout.expEarned,
        notes: completedWorkout.summary?.comment,
        summary: completedWorkout.summary,
      })
      return completedWorkout
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

/** ---------- Slice 정의 ---------- **/

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    // 초기 전체 데이터 세팅 (mock 로드용)
    setWorkoutData: (state, action: PayloadAction<Partial<WorkoutState>>) => {
      Object.assign(state, action.payload)
      state.status = "succeeded"
    },

    /** Goal CRUD **/
    addGoal: (state, action: PayloadAction<Goal>) => {
      state.goals.push(action.payload)
    },

    editGoal: (state, action: PayloadAction<{ goalId: string; patch: Partial<Goal> }>) => {
      // 시작된 운동의 목표는 수정 불가
      if (state.activeWorkout?.goalId === action.payload.goalId) {
        return
      }

      const g = state.goals.find((x) => x.goalId === action.payload.goalId)
      if (g) {
        // patch에 tasks가 포함된 경우, 기존 tasks의 completedSets 보존
        if (action.payload.patch.tasks && Array.isArray(action.payload.patch.tasks)) {
          // 기존 tasks의 completedSets 보존
          const existingTasks = [...(g.tasks || [])]
          
          const mergedTasks = action.payload.patch.tasks.map((newTask) => {
            // 기존 task에서 동일한 taskId의 task 찾기
            const existingTask = existingTasks.find((et) => et.taskId === newTask.taskId)
            
            // 기존 completedSets 보존 (taskId가 일치하는 경우)
            const preservedCompletedSets = existingTask?.completedSets !== undefined && existingTask.completedSets !== null && !isNaN(existingTask.completedSets)
              ? Number(existingTask.completedSets)
              : (newTask.completedSets !== undefined && newTask.completedSets !== null && !isNaN(newTask.completedSets)
                ? Number(newTask.completedSets)
                : 0)
            
            // 기존 status 보존
            const preservedStatus = existingTask?.status || newTask.status || "pending"
            
            return {
              ...newTask,
              completedSets: preservedCompletedSets,
              status: preservedStatus,
            }
          })
          
          // tasks를 병합한 결과로 업데이트
          Object.assign(g, {
            ...action.payload.patch,
            tasks: mergedTasks,
            updatedAt: new Date().toISOString()
          })
          
          // 진행 상태 로그 (디버깅)
          const totalCompletedSets = mergedTasks.reduce((sum, t) => sum + (t.completedSets || 0), 0)
          console.log(`✏️ 목표 "${g.title}" 수정 완료 (진행 상태 보존)`, {
            goalId: g.goalId,
            totalCompletedSets,
            tasks: mergedTasks.map(t => ({
              taskId: t.taskId,
              name: t.name,
              completedSets: t.completedSets,
              setCount: t.setCount,
              status: t.status
            }))
          })
        } else {
          // tasks가 포함되지 않은 경우 일반 업데이트
          Object.assign(g, action.payload.patch, { updatedAt: new Date().toISOString() })
        }
      }
    },

    deleteGoal: (state, action: PayloadAction<string>) => {
      // 진행 중인 운동의 목표는 삭제 불가
      if (state.activeWorkout?.goalId === action.payload) {
        return
      }
      state.goals = state.goals.filter((x) => x.goalId !== action.payload)
    },

    /** Task CRUD **/
    updateTask: (
      state,
      action: PayloadAction<{ goalId: string; taskId: string; patch: Partial<Task> }>
    ) => {
      const g = state.goals.find((x) => x.goalId === action.payload.goalId)
      if (!g) return

      const t = g.tasks.find((x) => x.taskId === action.payload.taskId)
      if (t) {
        Object.assign(t, action.payload.patch, { updatedAt: new Date().toISOString() })
      }
    },

    deleteTask: (state, action: PayloadAction<{ goalId: string; taskId: string }>) => {
      const g = state.goals.find((x) => x.goalId === action.payload.goalId)
      if (g) {
        g.tasks = g.tasks.filter((x) => x.taskId !== action.payload.taskId)
      }
    },

    recordSet: (state, action: PayloadAction<{ goalId: string; taskId: string }>) => {
      const g = state.goals.find((x) => x.goalId === action.payload.goalId)
      if (!g) {
        console.error("목표를 찾을 수 없습니다:", action.payload.goalId)
        return
      }

      const t = g.tasks.find((x) => x.taskId === action.payload.taskId)
      if (!t) {
        console.error("운동 항목을 찾을 수 없습니다:", action.payload.taskId)
        return
      }

      // 숫자형 검증 및 경계값 체크
      // completedSets가 없거나 유효하지 않은 경우, 이전 값 보존을 위해 0으로 설정하지 않음
      if (typeof t.completedSets !== "number" || isNaN(t.completedSets)) {
        // 이전에 저장된 값이 있을 수 있으므로 경고만 출력하고 0으로 초기화하지 않음
        console.warn(`completedSets가 유효한 숫자가 아닙니다. 기본값 0으로 설정:`, {
          taskId: t.taskId,
          taskName: t.name,
          currentValue: t.completedSets
        })
        // 0으로 초기화 (필요한 경우에만)
        t.completedSets = 0
      } else {
        // 유효한 숫자지만 이전 값이 있는지 확인 (디버깅)
        if (t.completedSets > 0) {
          console.log(`📊 세트 기록 전 상태:`, {
            taskId: t.taskId,
            taskName: t.name,
            currentCompletedSets: t.completedSets,
            setCount: t.setCount
          })
        }
      }

      if (typeof t.setCount !== "number" || isNaN(t.setCount) || t.setCount <= 0) {
        console.error("setCount가 유효한 숫자가 아닙니다:", t.setCount)
        return
      }

      // 세트 증가 가능 여부 체크
      if (t.completedSets < t.setCount) {
        const previousCompletedSets = t.completedSets
        t.completedSets = Math.min(t.completedSets + 1, t.setCount) // 초과 방지
        t.updatedAt = new Date().toISOString()

        // 모든 세트 완료 시 상태를 completed로 변경
        if (t.completedSets >= t.setCount) {
          t.status = "completed"
        } else if (t.status === "pending") {
          t.status = "in_progress"
        }

        // activeWorkout의 currentSet 업데이트 (완료된 세트 총합)
        if (state.activeWorkout && state.activeWorkout.goalId === action.payload.goalId) {
          const totalCompletedSets = g.tasks.reduce((sum, task) => sum + (task.completedSets || 0), 0)
          state.activeWorkout.currentSet = totalCompletedSets
        }

        // 진행률 계산 및 100% 도달 시 자동 완료 처리
        const progress = calcGoalProgress(g)
        if (progress >= 100 && g.status !== "done") {
          g.status = "done"
          g.updatedAt = new Date().toISOString()
          console.log(`✅ 목표 "${g.title}" 진행률 100% 도달 - 자동 완료 처리`)
        }
        
        // 세트 기록 후 로그 출력 (디버깅)
        const totalCompletedSets = g.tasks.reduce((sum, task) => sum + (task.completedSets || 0), 0)
        console.log(`✅ 세트 기록됨: ${t.name}`, {
          previousCompletedSets,
          currentCompletedSets: t.completedSets,
          setCount: t.setCount,
          goalTotalCompletedSets: totalCompletedSets,
          goalProgress: `${progress}%`
        })
      } else {
        console.warn("이미 모든 세트를 완료했습니다:", t.taskId)
      }
    },

    undoSet: (state, action: PayloadAction<{ goalId: string; taskId: string }>) => {
      const g = state.goals.find((x) => x.goalId === action.payload.goalId)
      if (!g) {
        console.error("목표를 찾을 수 없습니다:", action.payload.goalId)
        return
      }

      const t = g.tasks.find((x) => x.taskId === action.payload.taskId)
      if (!t) {
        console.error("운동 항목을 찾을 수 없습니다:", action.payload.taskId)
        return
      }

      // 숫자형 검증 및 경계값 체크
      if (typeof t.completedSets !== "number" || isNaN(t.completedSets)) {
        console.error("completedSets가 유효한 숫자가 아닙니다:", t.completedSets)
        t.completedSets = 0
        return
      }

      // 세트 감소 가능 여부 체크
      if (t.completedSets > 0) {
        t.completedSets = Math.max(t.completedSets - 1, 0) // 음수 방지
        t.updatedAt = new Date().toISOString()

        // 세트가 0이 되면 pending으로, 완료 상태면 in_progress로 변경
        if (t.completedSets === 0) {
          t.status = "pending"
        } else if (t.status === "completed") {
          t.status = "in_progress"
        }

        // activeWorkout의 currentSet 업데이트 (완료된 세트 총합)
        if (state.activeWorkout && state.activeWorkout.goalId === action.payload.goalId) {
          const totalCompletedSets = g.tasks.reduce((sum, task) => sum + (task.completedSets || 0), 0)
          state.activeWorkout.currentSet = totalCompletedSets
        }

        // 진행률이 100%에서 내려간 경우 goal 상태도 업데이트
        const progress = calcGoalProgress(g)
        if (progress < 100 && g.status === "done") {
          g.status = "active"
          g.updatedAt = new Date().toISOString()
          console.log(`⚠️ 목표 "${g.title}" 진행률이 100% 미만으로 떨어져 활성 상태로 변경`)
        }
      } else {
        console.warn("더 이상 되돌릴 세트가 없습니다:", t.taskId)
      }
    },

    /** User EXP/Level **/
    updateUserExpDirect: (state, action: PayloadAction<number>) => {
      if (!state.user) return
      state.user.exp = action.payload
      // 레벨 자동 계산
      state.user.level = calcLevelFromExp(action.payload)
    },

    setStatus: (state, action: PayloadAction<WorkoutState["status"]>) => {
      state.status = action.payload
    },

    /** Task 추가 (빠른 추가) **/
    quickAddTaskToActive: (state, action: PayloadAction<{ task: Task }>) => {
      if (!state.activeWorkout) return

      const now = new Date().toISOString()
      const newTask: Task = {
        ...action.payload.task,
        taskId: action.payload.task.taskId || `quick_${Date.now()}`,
        completedSets: 0,
        status: "pending",
        createdAt: action.payload.task.createdAt || now,
        updatedAt: now,
      }

      const g = state.goals.find((x) => x.goalId === state.activeWorkout?.goalId)
      if (g) {
        g.tasks.push(newTask)
      }
    },

    /** 세션 시작/종료 **/
    startSession: (state, action: PayloadAction<ActiveWorkout>) => {
      // 이미 활성 세션이 있는 경우 체크
      if (state.activeWorkout) {
        console.warn("이미 진행 중인 세션이 있습니다. 기존 세션을 먼저 종료하세요.")
        return
      }

      const goal = state.goals.find((g) => g.goalId === action.payload.goalId)
      if (!goal) {
        console.error("목표를 찾을 수 없습니다:", action.payload.goalId)
        return
      }

      // 목표에 운동 항목이 없는 경우 체크
      if (!goal.tasks || goal.tasks.length === 0) {
        console.error("운동 항목이 없는 목표입니다:", goal.goalId)
        return
      }

      // 깊은 복사로 activeWorkout 생성 (참조 공유 방지)
      // goal.tasks의 최신 상태(completedSets 포함)를 복사하여 진행 상태 복원
      // 중요: goal.tasks의 completedSets를 명시적으로 보존
      const currentTasks = goal.tasks.map(task => ({
        ...task,
        // completedSets가 명시적으로 포함되도록 보장
        completedSets: task.completedSets !== undefined && task.completedSets !== null 
          ? task.completedSets 
          : 0,
      }))
      
      // 완료된 세트 총합 계산 (복사 전 원본 데이터 사용)
      const totalCompletedSets = goal.tasks.reduce((sum, task) => {
        const completed = task.completedSets !== undefined && task.completedSets !== null 
          ? task.completedSets 
          : 0
        return sum + completed
      }, 0)
      
      state.activeWorkout = {
        ...action.payload,
        addedTasks: currentTasks, // completedSets가 명시적으로 포함된 tasks
        currentSet: totalCompletedSets, // 현재 완료된 세트 총합으로 초기화
      }

      // 목표 상태 active로 설정
      goal.status = "active"
      goal.updatedAt = new Date().toISOString()
      
      // 진행 상태 복원 로그 (디버깅 강화)
      const progress = calcGoalProgress(goal)
      console.log(`🔄 목표 "${goal.title}" 진행 상태 복원 완료`, {
        progress: `${progress}%`,
        totalCompletedSets,
        actionPayloadCurrentSet: action.payload.currentSet || 0,
        goalTasksCount: goal.tasks.length,
        tasks: goal.tasks.map(t => ({
          taskId: t.taskId,
          name: t.name,
          completedSets: t.completedSets,
          setCount: t.setCount,
          status: t.status,
          // 타입 체크
          completedSetsType: typeof t.completedSets,
          completedSetsIsNaN: typeof t.completedSets === 'number' ? isNaN(t.completedSets) : 'not a number'
        })),
        copiedTasks: currentTasks.map(t => ({
          taskId: t.taskId,
          name: t.name,
          completedSets: t.completedSets,
          setCount: t.setCount
        }))
      })
    },

    /** 운동 일시정지/재개 **/
    pauseWorkout: (state) => {
      if (state.activeWorkout) {
        // 일시정지: goal의 현재 진행 상태를 저장하고 activeWorkout 제거
        const goal = state.goals.find((g) => g.goalId === state.activeWorkout?.goalId)
        if (goal) {
          // goal.tasks의 completedSets는 이미 recordSet에서 업데이트되었으므로
          // 여기서는 상태만 변경하고 데이터는 유지
          goal.status = "planned"
          goal.updatedAt = new Date().toISOString()
          
          // goal의 진행 상태가 저장되었음을 로그
          const progress = calcGoalProgress(goal)
          const totalCompletedSets = goal.tasks.reduce((sum, task) => sum + (task.completedSets || 0), 0)
          console.log(`💾 목표 "${goal.title}" 진행 상태 저장 완료`, {
            progress: `${progress}%`,
            totalCompletedSets,
            tasks: goal.tasks.map(t => ({
              taskId: t.taskId,
              name: t.name,
              completedSets: t.completedSets,
              setCount: t.setCount,
              status: t.status
            }))
          })
        }
        // activeWorkout을 null로 설정하여 버튼이 "시작"으로 변경되도록 함
        // goal.tasks의 completedSets는 유지되므로 재시작 시 복원됨
        state.activeWorkout = null
      }
    },

    resumeWorkout: (state) => {
      if (state.activeWorkout) {
        // 일시정지 해제
      }
    },

    endSessionAndCompleteGoal: (
      state,
      action: PayloadAction<{ sessionId: string; force?: boolean }>
    ) => {
      if (!state.activeWorkout) return

      const sess = state.activeWorkout

      // compute summary -> CompletedWorkout
      const goal = state.goals.find((g) => g.goalId === sess.goalId)
      const totalSets = goal ? goal.tasks.reduce((s, t) => s + (t.completedSets || 0), 0) : 0
      const totalReps = goal
        ? goal.tasks.reduce((s, t) => s + (t.completedSets || 0) * t.repsPerSet, 0)
        : 0
      const expEarned = goal?.expReward ?? Math.round(totalSets * 10 + totalReps * 0.5)

      const completed: CompletedWorkout = {
        completedId: `completed_${Date.now()}`,
        goalId: sess.goalId,
        goalTitle: goal?.title,
        completedAt: new Date().toISOString(),
        totalSets,
        totalReps,
        expEarned,
        durationMin: sess.startTime
          ? Math.round((Date.now() - new Date(sess.startTime).getTime()) / 60000)
          : undefined,
      }

      state.completedWorkouts.push(completed)
      state.activeWorkout = null

      // EXP 추가
      if (state.user) {
        state.user.exp = (state.user.exp || 0) + expEarned
        state.user.level = calcLevelFromExp(state.user.exp)
        state.user.totalWorkoutCount = (state.user.totalWorkoutCount || 0) + 1
        state.user.lastActiveAt = new Date().toISOString()
      }

      // goal을 done으로 표시 및 진행률 체크
      if (goal) {
        const progress = calcGoalProgress(goal)
        const allTasksCompleted = goal.tasks.every(t => t.status === "completed")
        
        // 진행률이 100% 이상이거나 모든 태스크가 완료된 경우에만 완료 처리
        if (progress >= 100 || allTasksCompleted) {
          goal.status = "done"
          goal.updatedAt = new Date().toISOString()
          console.log(`✅ 목표 "${goal.title}" 완료 처리 (진행률: ${progress}%)`)
        } else {
          // 진행률이 100% 미만인 경우 active 상태로 유지
          goal.status = "active"
          goal.updatedAt = new Date().toISOString()
          console.log(`⚠️ 목표 "${goal.title}" 진행률이 ${progress}%로 완료되지 않아 활성 상태로 유지`)
        }
      }
    },

    /**
     * 완료된 운동 목록 설정 (백엔드에서 불러온 데이터)
     */
    setCompletedWorkouts: (state, action: PayloadAction<CompletedWorkout[]>) => {
      state.completedWorkouts = action.payload
    },

    /**
     * 목표 목록 설정 (백엔드에서 불러온 데이터)
     * 진행률 100%인 목표는 자동으로 완료 처리
     * goal.tasks의 completedSets를 보존하여 진행 상태 유지
     */
    setGoals: (state, action: PayloadAction<Goal[]>) => {
      // 기존 state.goals를 복사하여 completedSets 보존
      const existingGoals = [...state.goals]
      
      state.goals = action.payload.map((goal) => {
        // 기존 state에서 동일한 goalId의 goal 찾기 (이전 진행 상태 보존)
        const existingGoal = existingGoals.find((g) => g.goalId === goal.goalId)
        
        // goal.tasks의 completedSets 보존 (진행 상태 유지)
        // 기존 state의 completedSets를 우선 사용
        const tasksWithCompletedSets = goal.tasks?.map(task => {
          // 기존 goal에서 동일한 taskId의 task 찾기
          const existingTask = existingGoal?.tasks?.find((t) => t.taskId === task.taskId)
          
          // 기존 completedSets가 있으면 우선 사용 (이전 진행 상태 보존)
          // localStorage에서 로드한 값이 더 최신일 수 있으므로 우선 사용
          // 중요: 0도 유효한 값이므로 !== undefined && !== null로만 체크
          const existingCompletedSets = existingTask?.completedSets !== undefined && existingTask.completedSets !== null && !isNaN(existingTask.completedSets)
            ? Number(existingTask.completedSets)
            : null
          
          const newCompletedSets = task.completedSets !== undefined && task.completedSets !== null && !isNaN(task.completedSets)
            ? Number(task.completedSets)
            : null
          
          // 기존 값이 있으면 우선 사용, 없으면 새로 받은 값 사용, 둘 다 없으면 0
          const preservedCompletedSets = existingCompletedSets !== null
            ? existingCompletedSets
            : (newCompletedSets !== null ? newCompletedSets : 0)
          
          // status도 기존 값 우선, 없으면 새로 받은 값
          const preservedStatus = existingTask?.status || task.status || "pending"
          
          return {
            ...task,
            completedSets: preservedCompletedSets,
            status: preservedStatus,
          }
        }) || []
        
        const goalWithPreservedProgress = {
          ...goal,
          tasks: tasksWithCompletedSets,
        }
        
        // 진행률 계산
        const progress = calcGoalProgress(goalWithPreservedProgress)
        
        // 진행률이 100% 이상이거나 모든 태스크가 완료된 경우 완료 처리
        if ((progress >= 100 || goalWithPreservedProgress.tasks.every(t => t.status === "completed")) && goal.status !== "done") {
          return {
            ...goalWithPreservedProgress,
            status: "done" as const,
            updatedAt: new Date().toISOString(),
          }
        }
        
        // 진행 상태 로그 (디버깅)
        const totalCompletedSets = goalWithPreservedProgress.tasks.reduce((sum, t) => sum + (t.completedSets || 0), 0)
        if (totalCompletedSets > 0 || existingGoal) {
          console.log(`📊 목표 "${goal.title}" 진행 상태 복원 (setGoals)`, {
            progress: `${progress}%`,
            totalCompletedSets,
            hadExistingData: !!existingGoal,
            existingCompletedSets: existingGoal?.tasks?.reduce((sum, t) => sum + (t.completedSets || 0), 0) || 0,
            newCompletedSets: goal.tasks?.reduce((sum, t) => sum + (t.completedSets || 0), 0) || 0,
            tasks: goalWithPreservedProgress.tasks.map(t => ({
              taskId: t.taskId,
              name: t.name,
              completedSets: t.completedSets,
              setCount: t.setCount,
              status: t.status
            }))
          })
        }
        
        return goalWithPreservedProgress
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGoalsFromBackend
      .addCase(fetchGoalsFromBackend.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchGoalsFromBackend.fulfilled, (state, action) => {
        // 진행률 100%인 목표는 자동으로 완료 처리
        // goal.tasks의 completedSets를 보존하여 진행 상태 유지
        // 기존 state.goals의 completedSets와 백엔드 데이터를 병합
        // 중요: 기존 state.goals를 참조하기 전에 복사본을 만들어야 함
        const existingGoals = [...state.goals] // 기존 goals 복사
        
        // completedWorkouts 추출 (백엔드 데이터에서) - map 전에 먼저 추출
        const allCompletedWorkouts: CompletedWorkout[] = []
        
        // 디버깅: 백엔드 응답 데이터 확인
        console.log('📥 [fetchGoalsFromBackend.fulfilled] 백엔드 응답 데이터:', {
          goalsCount: action.payload.length,
          goals: action.payload.map((g: any) => ({
            goalId: g.goalId,
            title: g.title,
            hasBackendData: !!(g as any)._backendData,
            backendData: (g as any)._backendData ? {
              completedWorkouts: (g as any)._backendData.completedWorkouts,
              history: (g as any)._backendData.history,
              completedWorkoutsType: typeof (g as any)._backendData.completedWorkouts,
              historyType: typeof (g as any)._backendData.history,
              completedWorkoutsIsArray: Array.isArray((g as any)._backendData.completedWorkouts),
              historyIsArray: Array.isArray((g as any)._backendData.history),
            } : null
          }))
        })
        
        // 먼저 모든 goal에서 completedWorkouts 추출
        action.payload.forEach((backendGoal) => {
          const backendData = (backendGoal as any)._backendData
          if (backendData) {
            // completedWorkouts 추출
            if (backendData.completedWorkouts && Array.isArray(backendData.completedWorkouts)) {
              backendData.completedWorkouts.forEach((cw: any) => {
                allCompletedWorkouts.push({
                  completedId: cw.completedId || `completed_${Date.now()}_${Math.random()}`,
                  goalId: String(backendData.goalId || backendGoal.goalId),
                  goalTitle: cw.goalTitle || backendData.goalTitle || backendGoal.title,
                  completedAt: cw.completedAt || new Date().toISOString(),
                  totalSets: cw.totalSets || 0,
                  totalReps: cw.totalReps || 0,
                  expEarned: cw.expEarned || 0,
                  durationMin: cw.durationMin || cw.totalDurationMinutes,
                  summary: cw.summary,
                })
              })
            }
            
            // history에서도 추출
            if (backendData.history && Array.isArray(backendData.history)) {
              backendData.history.forEach((history: any) => {
                if (history && history.completedAt) {
                  allCompletedWorkouts.push({
                    completedId: `history_${history.date || history.completedAt}_${backendData.goalId}_${Math.random()}`,
                    goalId: String(backendData.goalId || backendGoal.goalId),
                    goalTitle: backendData.goalTitle || backendGoal.title,
                    completedAt: history.completedAt,
                    totalSets: history.totalSets || 0,
                    totalReps: history.totalReps || 0,
                    expEarned: history.expEarned || 0,
                    durationMin: history.totalDurationMinutes,
                    summary: history.summary,
                  })
                }
              })
            }
          }
        })
        
        state.goals = action.payload.map((backendGoal) => {
          // 기존 state에서 동일한 goalId의 goal 찾기 (이전 진행 상태 보존)
          // 복사본에서 찾아야 덮어쓰기 전의 값을 참조할 수 있음
          const existingGoal = existingGoals.find((g) => g.goalId === backendGoal.goalId)
          
          // 백엔드 tasks와 기존 tasks를 병합하여 completedSets 보존
          const mergedTasks = backendGoal.tasks?.map((backendTask) => {
            // 기존 goal에서 동일한 taskId의 task 찾기
            const existingTask = existingGoal?.tasks?.find((t) => t.taskId === backendTask.taskId)
            
            // 기존 completedSets가 있으면 우선 사용 (이전 진행 상태 보존)
            // localStorage에서 로드한 값이 더 최신일 수 있으므로 우선 사용
            // 중요: 0도 유효한 값이므로 !== undefined && !== null로만 체크
            const existingCompletedSets = existingTask?.completedSets !== undefined && existingTask.completedSets !== null && !isNaN(existingTask.completedSets)
              ? Number(existingTask.completedSets)
              : null
            
            const backendCompletedSets = backendTask.completedSets !== undefined && backendTask.completedSets !== null && !isNaN(backendTask.completedSets)
              ? Number(backendTask.completedSets)
              : null
            
            // 기존 값이 있으면 우선 사용, 없으면 백엔드 값 사용, 둘 다 없으면 0
            const preservedCompletedSets = existingCompletedSets !== null
              ? existingCompletedSets
              : (backendCompletedSets !== null ? backendCompletedSets : 0)
            
            // status도 기존 값 우선, 없으면 백엔드 값
            const preservedStatus = existingTask?.status || backendTask.status || "pending"
            
            return {
              ...backendTask,
              // 이전 진행 상태 보존 (기존 completedSets 우선)
              completedSets: preservedCompletedSets,
              status: preservedStatus,
            }
          }) || []
          
          const goalWithPreservedProgress = {
            ...backendGoal,
            tasks: mergedTasks,
          }
          
          const progress = calcGoalProgress(goalWithPreservedProgress)
          if ((progress >= 100 || goalWithPreservedProgress.tasks.every(t => t.status === "completed")) && backendGoal.status !== "done") {
            return {
              ...goalWithPreservedProgress,
              status: "done" as const,
              updatedAt: new Date().toISOString(),
            }
          }
          
          // 진행 상태 로그 (디버깅)
          const totalCompletedSets = goalWithPreservedProgress.tasks.reduce((sum, t) => sum + (t.completedSets || 0), 0)
          if (totalCompletedSets > 0 || existingGoal) {
            console.log(`📊 목표 "${backendGoal.title}" 진행 상태 병합 (백엔드 + localStorage)`, {
              progress: `${progress}%`,
              totalCompletedSets,
              hadExistingData: !!existingGoal,
              existingCompletedSets: existingGoal?.tasks?.reduce((sum, t) => sum + (t.completedSets || 0), 0) || 0,
              backendCompletedSets: backendGoal.tasks?.reduce((sum, t) => sum + (t.completedSets || 0), 0) || 0,
              tasks: goalWithPreservedProgress.tasks.map(t => ({
                taskId: t.taskId,
                name: t.name,
                completedSets: t.completedSets,
                setCount: t.setCount,
                status: t.status
              }))
            })
          }
          
          return goalWithPreservedProgress
        })
        
        // completedWorkouts 업데이트 (중복 제거)
        if (allCompletedWorkouts.length > 0) {
          // 기존 completedWorkouts와 병합 (중복 제거)
          const existingIds = new Set(state.completedWorkouts.map(cw => cw.completedId))
          const newCompletedWorkouts = allCompletedWorkouts.filter(cw => !existingIds.has(cw.completedId))
          state.completedWorkouts = [...state.completedWorkouts, ...newCompletedWorkouts]
          
          console.log(`✅ [fetchGoalsFromBackend] completedWorkouts 추출 완료`, {
            total: state.completedWorkouts.length,
            new: newCompletedWorkouts.length,
            existing: state.completedWorkouts.length - newCompletedWorkouts.length,
            allCompletedWorkoutsCount: allCompletedWorkouts.length
          })
        } else {
          // completedWorkouts가 없으면 빈 배열로 설정 (데이터가 없음을 명시)
          console.log(`⚠️ [fetchGoalsFromBackend] completedWorkouts 없음`, {
            goalsCount: action.payload.length,
            payload: action.payload.map((g: any) => ({
              goalId: g.goalId,
              title: g.title,
              hasBackendData: !!(g as any)._backendData,
              backendData: (g as any)._backendData ? {
                hasCompletedWorkouts: !!(g as any)._backendData.completedWorkouts,
                hasHistory: !!(g as any)._backendData.history,
                completedWorkoutsCount: Array.isArray((g as any)._backendData.completedWorkouts) ? (g as any)._backendData.completedWorkouts.length : 0,
                historyCount: Array.isArray((g as any)._backendData.history) ? (g as any)._backendData.history.length : 0,
              } : null
            }))
          })
        }
        
        state.status = "succeeded"
      })
      .addCase(fetchGoalsFromBackend.rejected, (state, action) => {
        state.status = "failed"
        state.error = String(action.payload || action.error?.message)
      })

      // endSessionAndSaveToBackend
      .addCase(endSessionAndSaveToBackend.fulfilled, (state, action) => {
        // 백엔드 저장 성공 - 이미 endSessionAndCompleteGoal에서 상태가 업데이트되었으므로
        // 여기서는 추가 처리 없음 (에러만 처리)
        console.log("✅ 완료된 운동이 백엔드에 저장되었습니다.")
      })
      .addCase(endSessionAndSaveToBackend.rejected, (state, action) => {
        state.error = String(action.payload || action.error?.message)
        console.error("❌ 완료된 운동 백엔드 저장 실패:", action.payload)
      })
  },
})

export const {
  setWorkoutData,
  addGoal,
  editGoal,
  deleteGoal,
  updateTask,
  deleteTask,
  recordSet,
  undoSet,
  updateUserExpDirect,
  setStatus,
  quickAddTaskToActive,
  startSession,
  pauseWorkout,
  resumeWorkout,
  endSessionAndCompleteGoal,
  setCompletedWorkouts,
  setGoals,
} = workoutSlice.actions

export default workoutSlice.reducer

/** ---------- Selectors ---------- **/

export const selectWorkoutState = (state: RootState) => state.workout
