import { getRepository } from "typeorm"
import { WorkoutSession } from "../entities/WorkoutSession"
import { ExerciseSet } from "../entities/ExerciseSet"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutStats } from "../entities/WorkoutStats"
import { WorkoutProgress } from "../entities/WorkoutProgress"
import { WorkoutReminder } from "../entities/WorkoutReminder"
import { User } from "../entities/User"

export class WorkoutJournalService {
  // 운동 세션 생성
  static async createWorkoutSession(sessionData: {
    user_id: number
    plan_id?: number
    gym_id?: number
    session_name: string
    start_time: Date
    mood_rating?: number
    energy_level?: number
    notes?: string
  }) {
    const sessionRepository = getRepository(WorkoutSession)

    const session = sessionRepository.create({
      ...sessionData,
      status: "in_progress",
    })

    return await sessionRepository.save(session)
  }

  // 운동 세션 완료
  static async completeWorkoutSession(sessionId: number, endTime: Date) {
    const sessionRepository = getRepository(WorkoutSession)

    const session = await sessionRepository.findOne({
      where: { session_id: sessionId },
    })
    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    const duration = Math.round(
      (endTime.getTime() - session.start_time.getTime()) / (1000 * 60)
    )

    session.end_time = endTime
    session.total_duration_minutes = duration
    session.status = "completed"

    return await sessionRepository.save(session)
  }

  // 운동 세션 목록 조회
  static async getWorkoutSessions(
    userId: number,
    page: number = 1,
    limit: number = 10
  ) {
    const sessionRepository = getRepository(WorkoutSession)

    const [sessions, total] = await sessionRepository.findAndCount({
      where: { user_id: userId },
      relations: [
        "workout_plan",
        "gym",
        "exercise_sets",
        "exercise_sets.machine",
      ],
      order: { start_time: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return { sessions, total, page, limit }
  }

  // 운동 세션 상세 조회
  static async getWorkoutSession(sessionId: number, userId: number) {
    const sessionRepository = getRepository(WorkoutSession)

    const session = await sessionRepository.findOne({
      where: { session_id: sessionId, user_id: userId },
      relations: [
        "workout_plan",
        "gym",
        "exercise_sets",
        "exercise_sets.machine",
      ],
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    return session
  }

  // 운동 세트 추가
  static async addExerciseSet(setData: {
    session_id: number
    machine_id: number
    set_number: number
    reps_completed: number
    weight_kg?: number
    duration_seconds?: number
    distance_meters?: number
    rpe_rating?: number
    notes?: string
  }) {
    const setRepository = getRepository(ExerciseSet)

    const exerciseSet = setRepository.create(setData)
    return await setRepository.save(exerciseSet)
  }

  // 운동 목표 생성
  static async createWorkoutGoal(goalData: {
    user_id: number
    goal_type:
      | "weight_lift"
      | "endurance"
      | "weight_loss"
      | "muscle_gain"
      | "strength"
      | "flexibility"
    target_value: number
    unit: string
    target_date: Date
    start_date: Date
  }) {
    const goalRepository = getRepository(WorkoutGoal)

    const goal = goalRepository.create({
      ...goalData,
      current_value: 0,
      progress_percentage: 0,
      status: "active",
    })

    return await goalRepository.save(goal)
  }

  // 운동 목표 목록 조회
  static async getWorkoutGoals(userId: number) {
    const goalRepository = getRepository(WorkoutGoal)

    return await goalRepository.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    })
  }

  // 운동 목표 업데이트
  static async updateWorkoutGoal(
    goalId: number,
    userId: number,
    currentValue: number
  ) {
    const goalRepository = getRepository(WorkoutGoal)

    const goal = await goalRepository.findOne({
      where: { goal_id: goalId, user_id: userId },
    })
    if (!goal) {
      throw new Error("운동 목표를 찾을 수 없습니다.")
    }

    goal.current_value = currentValue
    goal.progress_percentage = Math.min(
      (currentValue / goal.target_value) * 100,
      100
    )

    if (goal.progress_percentage >= 100) {
      goal.status = "completed"
    }

    return await goalRepository.save(goal)
  }

  // 운동 통계 조회
  static async getWorkoutStats(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const statsRepository = getRepository(WorkoutStats)

    const query = statsRepository
      .createQueryBuilder("stats")
      .where("stats.user_id = :userId", { userId })

    if (startDate) {
      query.andWhere("stats.workout_date >= :startDate", { startDate })
    }

    if (endDate) {
      query.andWhere("stats.workout_date <= :endDate", { endDate })
    }

    return await query.getMany()
  }

  // 운동 진행 상황 조회
  static async getWorkoutProgress(
    userId: number,
    machineId?: number,
    limit: number = 10
  ) {
    const progressRepository = getRepository(WorkoutProgress)

    const query = progressRepository
      .createQueryBuilder("progress")
      .where("progress.user_id = :userId", { userId })

    if (machineId) {
      query.andWhere("progress.machine_id = :machineId", { machineId })
    }

    return await query
      .orderBy("progress.progress_date", "DESC")
      .limit(limit)
      .getMany()
  }

  // 운동 알림 생성
  static async createWorkoutReminder(reminderData: {
    user_id: number
    title: string
    description?: string
    reminder_time: string
    repeat_days: number[]
    notification_type: "push" | "email" | "sms"
  }) {
    const reminderRepository = getRepository(WorkoutReminder)

    const reminder = reminderRepository.create({
      ...reminderData,
      is_active: true,
      is_sent: false,
    })

    return await reminderRepository.save(reminder)
  }

  // 운동 알림 목록 조회
  static async getWorkoutReminders(userId: number) {
    const reminderRepository = getRepository(WorkoutReminder)

    return await reminderRepository.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    })
  }

  // 운동 알림 업데이트
  static async updateWorkoutReminder(
    reminderId: number,
    userId: number,
    updateData: Partial<WorkoutReminder>
  ) {
    const reminderRepository = getRepository(WorkoutReminder)

    const reminder = await reminderRepository.findOne({
      where: { reminder_id: reminderId, user_id: userId },
    })
    if (!reminder) {
      throw new Error("운동 알림을 찾을 수 없습니다.")
    }

    Object.assign(reminder, updateData)
    return await reminderRepository.save(reminder)
  }

  // 운동 알림 삭제
  static async deleteWorkoutReminder(reminderId: number, userId: number) {
    const reminderRepository = getRepository(WorkoutReminder)

    const reminder = await reminderRepository.findOne({
      where: { reminder_id: reminderId, user_id: userId },
    })
    if (!reminder) {
      throw new Error("운동 알림을 찾을 수 없습니다.")
    }

    await reminderRepository.remove(reminder)
    return { message: "운동 알림이 삭제되었습니다." }
  }

  // 사용자 운동 요약 통계
  static async getUserWorkoutSummary(userId: number) {
    const sessionRepository = getRepository(WorkoutSession)
    const goalRepository = getRepository(WorkoutGoal)

    const [totalSessions, completedSessions, activeGoals] = await Promise.all([
      sessionRepository.count({ where: { user_id: userId } }),
      sessionRepository.count({
        where: { user_id: userId, status: "completed" },
      }),
      goalRepository.count({ where: { user_id: userId, status: "active" } }),
    ])

    const recentSessions = await sessionRepository.find({
      where: { user_id: userId },
      order: { start_time: "DESC" },
      take: 5,
    })

    return {
      totalSessions,
      completedSessions,
      activeGoals,
      recentSessions,
    }
  }
}
