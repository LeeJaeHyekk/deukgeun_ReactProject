import { getRepository } from "typeorm"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutSession } from "../entities/WorkoutSession"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { WorkoutStats } from "../entities/WorkoutStats"
import { WorkoutProgress } from "../entities/WorkoutProgress"
import { ExerciseSet } from "../entities/ExerciseSet"

// 타입 정의
interface CreatePlanData {
  plan_name: string
  description?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  estimated_duration_minutes?: number
  target_muscle_groups?: string[]
  is_template?: boolean
  is_public?: boolean
}

interface UpdatePlanData {
  name?: string
  description?: string
  difficulty?: string
  estimated_duration_minutes?: number
  target_muscle_groups?: string[]
  is_template?: boolean
  is_public?: boolean
}

interface CreateSessionData {
  plan_id?: number
  gym_id?: number
  session_name: string
  start_time?: string | Date
  mood_rating?: number
  energy_level?: number
  notes?: string
}

interface UpdateSessionData {
  plan_id?: number
  gym_id?: number
  name?: string
  start_time?: Date
  end_time?: Date
  mood_rating?: number
  energy_level?: number
  notes?: string
  status?: string
  total_duration_minutes?: number
}

interface CreateGoalData {
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  currentValue?: number
  unit: string
  deadline?: string | Date
}

interface UpdateGoalData {
  title?: string
  description?: string
  type?: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue?: number
  currentValue?: number
  unit?: string
  deadline?: string | Date
  isCompleted?: boolean
  completedAt?: Date
}

interface CreateSetData {
  session_id: number
  machine_id: number
  set_number: number
  reps_completed: number
  weight_kg?: number
  duration_seconds?: number
  distance_meters?: number
  rpe_rating?: number
  notes?: string
}

export class WorkoutJournalService {
  // 운동 계획 관련
  async getUserPlans(userId: number) {
    const planRepository = getRepository(WorkoutPlan)
    return await planRepository.find({
      where: { userId: userId },
      order: { createdAt: "DESC" },
    })
  }

  async createWorkoutPlan(userId: number, planData: CreatePlanData) {
    const planRepository = getRepository(WorkoutPlan)
    const plan = planRepository.create({
      userId: userId,
      name: planData.plan_name,
      description: planData.description,
      difficulty: planData.difficulty || "beginner",
      estimatedDurationMinutes: planData.estimated_duration_minutes,
      targetMuscleGroups: planData.target_muscle_groups || [],
      isTemplate: planData.is_template || false,
      isPublic: planData.is_public || false,
    })
    return await planRepository.save(plan)
  }

  async updateWorkoutPlan(
    planId: number,
    userId: number,
    updateData: UpdatePlanData
  ) {
    const planRepository = getRepository(WorkoutPlan)
    const plan = await planRepository.findOne({
      where: { id: planId, userId: userId },
    })

    if (!plan) {
      throw new Error("운동 계획을 찾을 수 없습니다.")
    }

    Object.assign(plan, updateData)
    return await planRepository.save(plan)
  }

  async deleteWorkoutPlan(planId: number, userId: number) {
    const planRepository = getRepository(WorkoutPlan)
    const plan = await planRepository.findOne({
      where: { id: planId, userId: userId },
    })

    if (!plan) {
      throw new Error("운동 계획을 찾을 수 없습니다.")
    }

    await planRepository.remove(plan)
  }

  // 운동 세션 관련
  async getUserSessions(userId: number) {
    const sessionRepository = getRepository(WorkoutSession)
    return await sessionRepository.find({
      where: { userId: userId },
      order: { startTime: "DESC" },
      relations: ["exerciseSets"],
    })
  }

  async createWorkoutSession(userId: number, sessionData: CreateSessionData) {
    const sessionRepository = getRepository(WorkoutSession)
    const session = sessionRepository.create({
      userId: userId,
      planId: sessionData.plan_id,
      gymId: sessionData.gym_id,
      name: sessionData.session_name,
      startTime: new Date(sessionData.start_time || new Date()),
      moodRating: sessionData.mood_rating,
      energyLevel: sessionData.energy_level,
      notes: sessionData.notes,
      status: "in_progress",
    })
    return await sessionRepository.save(session)
  }

  async updateWorkoutSession(
    sessionId: number,
    userId: number,
    updateData: UpdateSessionData
  ) {
    const sessionRepository = getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { id: sessionId, userId: userId },
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    Object.assign(session, updateData)
    return await sessionRepository.save(session)
  }

  async deleteWorkoutSession(sessionId: number, userId: number) {
    const sessionRepository = getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { id: sessionId, userId: userId },
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    await sessionRepository.remove(session)
  }

  // 운동 목표 관련
  async getUserGoals(userId: number) {
    const goalRepository = getRepository(WorkoutGoal)
    return await goalRepository.find({
      where: { userId: userId },
      order: { createdAt: "DESC" },
    })
  }

  async createWorkoutGoal(userId: number, goalData: CreateGoalData) {
    const goalRepository = getRepository(WorkoutGoal)
    const goal = goalRepository.create({
      userId: userId,
      title: goalData.title,
      description: goalData.description,
      type: goalData.type,
      targetValue: goalData.targetValue,
      currentValue: goalData.currentValue || 0,
      unit: goalData.unit,
      deadline: goalData.deadline ? new Date(goalData.deadline) : undefined,
      isCompleted: false,
    })
    return await goalRepository.save(goal)
  }

  async updateWorkoutGoal(
    goalId: number,
    userId: number,
    updateData: UpdateGoalData
  ) {
    const goalRepository = getRepository(WorkoutGoal)
    const goal = await goalRepository.findOne({
      where: { id: goalId, userId: userId },
    })

    if (!goal) {
      throw new Error("운동 목표를 찾을 수 없습니다.")
    }

    // 목표 달성 시 완료 시간 설정
    if (updateData.isCompleted && !goal.isCompleted) {
      updateData.completedAt = new Date()
    }

    Object.assign(goal, updateData)
    return await goalRepository.save(goal)
  }

  async deleteWorkoutGoal(goalId: number, userId: number) {
    const goalRepository = getRepository(WorkoutGoal)
    const goal = await goalRepository.findOne({
      where: { id: goalId, userId: userId },
    })

    if (!goal) {
      throw new Error("운동 목표를 찾을 수 없습니다.")
    }

    await goalRepository.remove(goal)
  }

  // 운동 통계 관련
  async getUserStats(userId: number) {
    const statsRepository = getRepository(WorkoutStats)
    return await statsRepository.find({
      where: { userId: userId },
      order: { workoutDate: "DESC" },
      take: 30, // 최근 30일
    })
  }

  // 운동 진행 상황 관련
  async getUserProgress(userId: number) {
    const progressRepository = getRepository(WorkoutProgress)
    return await progressRepository.find({
      where: { userId: userId },
      order: { progressDate: "DESC" },
      relations: ["machine"],
      take: 50, // 최근 50개 기록
    })
  }

  // 대시보드 데이터
  async getDashboardData(userId: number) {
    const [
      totalPlans,
      totalSessions,
      activeGoals,
      recentSessions,
      recentProgress,
    ] = await Promise.all([
      this.getUserPlans(userId),
      this.getUserSessions(userId),
      this.getUserGoals(userId),
      this.getUserSessions(userId).then(sessions => sessions.slice(0, 5)),
      this.getUserProgress(userId).then(progress => progress.slice(0, 10)),
    ])

    const completedSessions = totalSessions.filter(
      s => s.status === "completed"
    )
    const activeGoalsCount = activeGoals.filter(g => !g.isCompleted).length

    // 주간 운동 통계
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklySessions = completedSessions.filter(
      session => new Date(session.startTime) >= oneWeekAgo
    )

    const weeklyStats = {
      totalSessions: weeklySessions.length,
      totalDuration: weeklySessions.reduce(
        (sum, session) => sum + (session.totalDurationMinutes || 0),
        0
      ),
      averageMood:
        weeklySessions.length > 0
          ? weeklySessions.reduce(
              (sum, session) => sum + (session.moodRating || 0),
              0
            ) / weeklySessions.length
          : 0,
      averageEnergy:
        weeklySessions.length > 0
          ? weeklySessions.reduce(
              (sum, session) => sum + (session.energyLevel || 0),
              0
            ) / weeklySessions.length
          : 0,
    }

    return {
      summary: {
        totalPlans: totalPlans.length,
        totalSessions: totalSessions.length,
        completedSessions: completedSessions.length,
        activeGoals: activeGoalsCount,
      },
      weeklyStats,
      recentSessions,
      recentProgress,
      activeGoals: activeGoals.filter(g => !g.isCompleted),
    }
  }

  // 운동 세트 추가
  async addExerciseSet(setData: CreateSetData) {
    const setRepository = getRepository(ExerciseSet)
    const exerciseSet = setRepository.create({
      sessionId: setData.session_id,
      machineId: setData.machine_id,
      setNumber: setData.set_number,
      repsCompleted: setData.reps_completed,
      weightKg: setData.weight_kg,
      durationSeconds: setData.duration_seconds,
      distanceMeters: setData.distance_meters,
      rpeRating: setData.rpe_rating,
      notes: setData.notes,
    })
    return await setRepository.save(exerciseSet)
  }

  // 운동 세션 완료
  async completeWorkoutSession(sessionId: number, endTime: Date) {
    const sessionRepository = getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    session.endTime = endTime
    session.status = "completed"
    session.totalDurationMinutes = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
    )

    return await sessionRepository.save(session)
  }

  // 운동 통계 업데이트
  async updateWorkoutStats(userId: number, sessionId: number) {
    const sessionRepository = getRepository(WorkoutSession)
    const setRepository = getRepository(ExerciseSet)
    const statsRepository = getRepository(WorkoutStats)

    const session = await sessionRepository.findOne({
      where: { id: sessionId },
      relations: ["exerciseSets"],
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    const workoutDate = new Date(session.startTime).toISOString().split("T")[0]

    // 기존 통계 확인
    let stats = await statsRepository.findOne({
      where: { userId: userId, workoutDate: new Date(workoutDate) },
    })

    if (!stats) {
      stats = statsRepository.create({
        userId: userId,
        workoutDate: workoutDate,
        totalSessions: 0,
        totalDurationMinutes: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeightKg: 0,
        totalDistanceMeters: 0,
        averageMood: 0,
        averageEnergy: 0,
        averageRpe: 0,
        caloriesBurned: 0,
      })
    }

    // 통계 업데이트
    stats.totalSessions += 1
    stats.totalDurationMinutes += session.totalDurationMinutes || 0

    if (session.exerciseSets) {
      stats.totalSets += session.exerciseSets.length
      stats.totalReps += session.exerciseSets.reduce(
        (sum, set) => sum + set.repsCompleted,
        0
      )
      stats.totalWeightKg += session.exerciseSets.reduce(
        (sum, set) => sum + (set.weightKg || 0),
        0
      )
      stats.totalDistanceMeters += session.exerciseSets.reduce(
        (sum, set) => sum + (set.distanceMeters || 0),
        0
      )

      const validRpe = session.exerciseSets
        .filter(set => set.rpeRating)
        .map(set => set.rpeRating!)
      if (validRpe.length > 0) {
        stats.averageRpe =
          validRpe.reduce((sum, rpe) => sum + rpe, 0) / validRpe.length
      }
    }

    if (session.moodRating) {
      stats.averageMood = session.moodRating
    }
    if (session.energyLevel) {
      stats.averageEnergy = session.energyLevel
    }

    // 간단한 칼로리 계산 (예시)
    stats.caloriesBurned = Math.round((session.totalDurationMinutes || 0) * 8)

    return await statsRepository.save(stats)
  }
}
