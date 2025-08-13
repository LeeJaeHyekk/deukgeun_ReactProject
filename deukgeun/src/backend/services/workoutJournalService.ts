import { getRepository } from "typeorm"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutSession } from "../entities/WorkoutSession"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { WorkoutStats } from "../entities/WorkoutStats"
import { WorkoutProgress } from "../entities/WorkoutProgress"
import { ExerciseSet } from "../entities/ExerciseSet"

export class WorkoutJournalService {
  // 운동 계획 관련
  async getUserPlans(userId: number) {
    const planRepository = getRepository(WorkoutPlan)
    return await planRepository.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    })
  }

  async createWorkoutPlan(userId: number, planData: any) {
    const planRepository = getRepository(WorkoutPlan)
    const plan = planRepository.create({
      user_id: userId,
      plan_name: planData.plan_name,
      description: planData.description,
      difficulty: planData.difficulty || "beginner",
      estimated_duration_minutes: planData.estimated_duration_minutes,
      target_muscle_groups: planData.target_muscle_groups || [],
      is_template: planData.is_template || false,
      is_public: planData.is_public || false,
    })
    return await planRepository.save(plan)
  }

  async updateWorkoutPlan(planId: number, userId: number, updateData: any) {
    const planRepository = getRepository(WorkoutPlan)
    const plan = await planRepository.findOne({
      where: { plan_id: planId, user_id: userId },
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
      where: { plan_id: planId, user_id: userId },
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
      where: { user_id: userId },
      order: { start_time: "DESC" },
      relations: ["exercise_sets"],
    })
  }

  async createWorkoutSession(userId: number, sessionData: any) {
    const sessionRepository = getRepository(WorkoutSession)
    const session = sessionRepository.create({
      user_id: userId,
      plan_id: sessionData.plan_id,
      gym_id: sessionData.gym_id,
      session_name: sessionData.session_name,
      start_time: new Date(sessionData.start_time || new Date()),
      mood_rating: sessionData.mood_rating,
      energy_level: sessionData.energy_level,
      notes: sessionData.notes,
      status: "in_progress",
    })
    return await sessionRepository.save(session)
  }

  async updateWorkoutSession(
    sessionId: number,
    userId: number,
    updateData: any
  ) {
    const sessionRepository = getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { session_id: sessionId, user_id: userId },
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
      where: { session_id: sessionId, user_id: userId },
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

  async createWorkoutGoal(userId: number, goalData: any) {
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

  async updateWorkoutGoal(goalId: number, userId: number, updateData: any) {
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
      where: { user_id: userId },
      order: { workout_date: "DESC" },
      take: 30, // 최근 30일
    })
  }

  // 운동 진행 상황 관련
  async getUserProgress(userId: number) {
    const progressRepository = getRepository(WorkoutProgress)
    return await progressRepository.find({
      where: { user_id: userId },
      order: { progress_date: "DESC" },
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
      session => new Date(session.start_time) >= oneWeekAgo
    )

    const weeklyStats = {
      totalSessions: weeklySessions.length,
      totalDuration: weeklySessions.reduce(
        (sum, session) => sum + (session.total_duration_minutes || 0),
        0
      ),
      averageMood:
        weeklySessions.length > 0
          ? weeklySessions.reduce(
              (sum, session) => sum + (session.mood_rating || 0),
              0
            ) / weeklySessions.length
          : 0,
      averageEnergy:
        weeklySessions.length > 0
          ? weeklySessions.reduce(
              (sum, session) => sum + (session.energy_level || 0),
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
  async addExerciseSet(setData: any) {
    const setRepository = getRepository(ExerciseSet)
    const exerciseSet = setRepository.create({
      session_id: setData.session_id,
      machine_id: setData.machine_id,
      set_number: setData.set_number,
      reps_completed: setData.reps_completed,
      weight_kg: setData.weight_kg,
      duration_seconds: setData.duration_seconds,
      distance_meters: setData.distance_meters,
      rpe_rating: setData.rpe_rating,
      notes: setData.notes,
    })
    return await setRepository.save(exerciseSet)
  }

  // 운동 세션 완료
  async completeWorkoutSession(sessionId: number, endTime: Date) {
    const sessionRepository = getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { session_id: sessionId },
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    session.end_time = endTime
    session.status = "completed"
    session.total_duration_minutes = Math.round(
      (endTime.getTime() - session.start_time.getTime()) / (1000 * 60)
    )

    return await sessionRepository.save(session)
  }

  // 운동 통계 업데이트
  async updateWorkoutStats(userId: number, sessionId: number) {
    const sessionRepository = getRepository(WorkoutSession)
    const setRepository = getRepository(ExerciseSet)
    const statsRepository = getRepository(WorkoutStats)

    const session = await sessionRepository.findOne({
      where: { session_id: sessionId },
      relations: ["exercise_sets"],
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    const workoutDate = new Date(session.start_time).toISOString().split("T")[0]

    // 기존 통계 확인
    let stats = await statsRepository.findOne({
      where: { user_id: userId, workout_date: new Date(workoutDate) },
    })

    if (!stats) {
      stats = statsRepository.create({
        user_id: userId,
        workout_date: workoutDate,
        total_sessions: 0,
        total_duration_minutes: 0,
        total_sets: 0,
        total_reps: 0,
        total_weight_kg: 0,
        total_distance_meters: 0,
        average_mood: 0,
        average_energy: 0,
        average_rpe: 0,
        calories_burned: 0,
      })
    }

    // 통계 업데이트
    stats.total_sessions += 1
    stats.total_duration_minutes += session.total_duration_minutes || 0

    if (session.exercise_sets) {
      stats.total_sets += session.exercise_sets.length
      stats.total_reps += session.exercise_sets.reduce(
        (sum, set) => sum + set.reps_completed,
        0
      )
      stats.total_weight_kg += session.exercise_sets.reduce(
        (sum, set) => sum + (set.weight_kg || 0),
        0
      )
      stats.total_distance_meters += session.exercise_sets.reduce(
        (sum, set) => sum + (set.distance_meters || 0),
        0
      )

      const validRpe = session.exercise_sets
        .filter(set => set.rpe_rating)
        .map(set => set.rpe_rating!)
      if (validRpe.length > 0) {
        stats.average_rpe =
          validRpe.reduce((sum, rpe) => sum + rpe, 0) / validRpe.length
      }
    }

    if (session.mood_rating) {
      stats.average_mood = session.mood_rating
    }
    if (session.energy_level) {
      stats.average_energy = session.energy_level
    }

    // 간단한 칼로리 계산 (예시)
    stats.calories_burned = Math.round(
      (session.total_duration_minutes || 0) * 8
    )

    return await statsRepository.save(stats)
  }
}
