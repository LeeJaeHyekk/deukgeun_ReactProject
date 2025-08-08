import { getRepository } from "typeorm"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutSession } from "../entities/WorkoutSession"
import { ExerciseSet } from "../entities/ExerciseSet"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { Machine } from "../entities/Machine"
import { LevelService } from "./levelService"
import { logger } from "../utils/logger"

export interface CreateWorkoutPlanRequest {
  user_id: number
  name: string
  description?: string
  difficulty_level: "beginner" | "intermediate" | "advanced"
  estimated_duration_minutes: number
  target_muscle_groups?: string[]
  is_template?: boolean
  is_public?: boolean
  exercises: CreateWorkoutPlanExerciseRequest[]
}

export interface CreateWorkoutPlanExerciseRequest {
  machine_id: number
  exercise_order: number
  sets: number
  reps_range: { min: number; max: number }
  weight_range?: { min: number; max: number }
  rest_seconds?: number
  notes?: string
}

export interface CreateWorkoutSessionRequest {
  user_id: number
  plan_id?: number
  gym_id?: number
  session_name: string
  start_time: Date
}

export interface CreateExerciseSetRequest {
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

export interface CreateWorkoutGoalRequest {
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
}

export class WorkoutService {
  private levelService: LevelService

  constructor() {
    this.levelService = new LevelService()
  }

  /**
   * 운동 계획 생성
   */
  async createWorkoutPlan(
    request: CreateWorkoutPlanRequest
  ): Promise<WorkoutPlan> {
    const workoutPlanRepo = getRepository(WorkoutPlan)
    const workoutPlanExerciseRepo = getRepository("WorkoutPlanExercise")

    try {
      // 운동 계획 생성
      const workoutPlan = workoutPlanRepo.create({
        user_id: request.user_id,
        name: request.name,
        description: request.description,
        difficulty_level: request.difficulty_level,
        estimated_duration_minutes: request.estimated_duration_minutes,
        target_muscle_groups: request.target_muscle_groups,
        is_template: request.is_template || false,
        is_public: request.is_public || false,
      })

      const savedPlan = await workoutPlanRepo.save(workoutPlan)

      // 운동 계획의 운동들 생성
      for (const exercise of request.exercises) {
        await workoutPlanExerciseRepo.save({
          plan_id: savedPlan.plan_id,
          machine_id: exercise.machine_id,
          exercise_order: exercise.exercise_order,
          sets: exercise.sets,
          reps_range: exercise.reps_range,
          weight_range: exercise.weight_range,
          rest_seconds: exercise.rest_seconds || 90,
          notes: exercise.notes,
        })
      }

      logger.info(
        `운동 계획 생성 완료: User ID ${request.user_id}, Plan ID ${savedPlan.plan_id}`
      )
      return savedPlan
    } catch (error) {
      logger.error(`운동 계획 생성 실패: ${error}`)
      throw new Error("운동 계획 생성에 실패했습니다.")
    }
  }

  /**
   * 사용자의 운동 계획 목록 조회
   */
  async getUserWorkoutPlans(userId: number): Promise<WorkoutPlan[]> {
    const workoutPlanRepo = getRepository(WorkoutPlan)

    try {
      const plans = await workoutPlanRepo.find({
        where: { user_id: userId },
        relations: ["exercises", "exercises.machine"],
        order: { created_at: "DESC" },
      })

      return plans
    } catch (error) {
      logger.error(`운동 계획 조회 실패: ${error}`)
      throw new Error("운동 계획 조회에 실패했습니다.")
    }
  }

  /**
   * 운동 계획 수정
   */
  async updateWorkoutPlan(
    planId: number,
    planData: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan> {
    const workoutPlanRepo = getRepository(WorkoutPlan)

    try {
      const plan = await workoutPlanRepo.findOne({
        where: { plan_id: planId },
      })

      if (!plan) {
        throw new Error("운동 계획을 찾을 수 없습니다.")
      }

      Object.assign(plan, planData)
      const updatedPlan = await workoutPlanRepo.save(plan)

      logger.info(`운동 계획 수정 완료: Plan ID ${planId}`)
      return updatedPlan
    } catch (error) {
      logger.error(`운동 계획 수정 실패: ${error}`)
      throw new Error("운동 계획 수정에 실패했습니다.")
    }
  }

  /**
   * 운동 계획 삭제
   */
  async deleteWorkoutPlan(planId: number): Promise<void> {
    const workoutPlanRepo = getRepository(WorkoutPlan)

    try {
      const plan = await workoutPlanRepo.findOne({
        where: { plan_id: planId },
      })

      if (!plan) {
        throw new Error("운동 계획을 찾을 수 없습니다.")
      }

      await workoutPlanRepo.remove(plan)
      logger.info(`운동 계획 삭제 완료: Plan ID ${planId}`)
    } catch (error) {
      logger.error(`운동 계획 삭제 실패: ${error}`)
      throw new Error("운동 계획 삭제에 실패했습니다.")
    }
  }

  /**
   * 운동 세션 시작
   */
  async startWorkoutSession(
    request: CreateWorkoutSessionRequest
  ): Promise<WorkoutSession> {
    const workoutSessionRepo = getRepository(WorkoutSession)

    try {
      const session = workoutSessionRepo.create({
        user_id: request.user_id,
        plan_id: request.plan_id,
        gym_id: request.gym_id,
        session_name: request.session_name,
        start_time: request.start_time,
        status: "in_progress",
      })

      const savedSession = await workoutSessionRepo.save(session)
      logger.info(
        `운동 세션 시작: User ID ${request.user_id}, Session ID ${savedSession.session_id}`
      )

      return savedSession
    } catch (error) {
      logger.error(`운동 세션 시작 실패: ${error}`)
      throw new Error("운동 세션 시작에 실패했습니다.")
    }
  }

  /**
   * 사용자의 운동 세션 목록 조회
   */
  async getUserWorkoutSessions(userId: number): Promise<WorkoutSession[]> {
    const workoutSessionRepo = getRepository(WorkoutSession)

    try {
      const sessions = await workoutSessionRepo.find({
        where: { user_id: userId },
        relations: ["workout_plan", "gym"],
        order: { created_at: "DESC" },
      })

      return sessions
    } catch (error) {
      logger.error(`운동 세션 조회 실패: ${error}`)
      throw new Error("운동 세션 조회에 실패했습니다.")
    }
  }

  /**
   * 운동 세션 완료
   */
  async completeWorkoutSession(
    sessionId: number,
    userId: number
  ): Promise<WorkoutSession> {
    const workoutSessionRepo = getRepository(WorkoutSession)

    try {
      const session = await workoutSessionRepo.findOne({
        where: { session_id: sessionId, user_id: userId },
      })

      if (!session) {
        throw new Error("운동 세션을 찾을 수 없습니다.")
      }

      if (session.status !== "in_progress") {
        throw new Error("이미 완료된 세션입니다.")
      }

      const endTime = new Date()
      const durationMinutes = Math.round(
        (endTime.getTime() - session.start_time.getTime()) / (1000 * 60)
      )

      session.end_time = endTime
      session.total_duration_minutes = durationMinutes
      session.status = "completed"

      const updatedSession = await workoutSessionRepo.save(session)

      // 경험치 부여
      await this.levelService.grantExp(
        userId,
        "workout_session_complete",
        `운동 세션 완료: ${session.session_name}`,
        {
          session_id: sessionId,
          duration_minutes: durationMinutes,
        }
      )

      logger.info(
        `운동 세션 완료: Session ID ${sessionId}, Duration ${durationMinutes}분`
      )
      return updatedSession
    } catch (error) {
      logger.error(`운동 세션 완료 실패: ${error}`)
      throw new Error("운동 세션 완료에 실패했습니다.")
    }
  }

  /**
   * 운동 세트 기록
   */
  async logExerciseSet(
    request: CreateExerciseSetRequest
  ): Promise<ExerciseSet> {
    const exerciseSetRepo = getRepository(ExerciseSet)

    try {
      const exerciseSet = exerciseSetRepo.create({
        session_id: request.session_id,
        machine_id: request.machine_id,
        set_number: request.set_number,
        reps_completed: request.reps_completed,
        weight_kg: request.weight_kg,
        duration_seconds: request.duration_seconds,
        distance_meters: request.distance_meters,
        rpe_rating: request.rpe_rating,
        notes: request.notes,
      })

      const savedSet = await exerciseSetRepo.save(exerciseSet)
      logger.info(
        `운동 세트 기록: Session ID ${request.session_id}, Set ${request.set_number}`
      )

      return savedSet
    } catch (error) {
      logger.error(`운동 세트 기록 실패: ${error}`)
      throw new Error("운동 세트 기록에 실패했습니다.")
    }
  }

  /**
   * 운동 목표 생성
   */
  async createWorkoutGoal(
    request: CreateWorkoutGoalRequest
  ): Promise<WorkoutGoal> {
    const workoutGoalRepo = getRepository(WorkoutGoal)

    try {
      const goal = workoutGoalRepo.create({
        user_id: request.user_id,
        goal_type: request.goal_type,
        target_value: request.target_value,
        unit: request.unit,
        target_date: request.target_date,
        start_date: request.start_date,
        status: "active",
        progress_percentage: 0,
      })

      const savedGoal = await workoutGoalRepo.save(goal)
      logger.info(
        `운동 목표 생성: User ID ${request.user_id}, Goal ID ${savedGoal.goal_id}`
      )

      return savedGoal
    } catch (error) {
      logger.error(`운동 목표 생성 실패: ${error}`)
      throw new Error("운동 목표 생성에 실패했습니다.")
    }
  }

  /**
   * 사용자의 운동 목표 목록 조회
   */
  async getUserWorkoutGoals(userId: number): Promise<WorkoutGoal[]> {
    const workoutGoalRepo = getRepository(WorkoutGoal)

    try {
      const goals = await workoutGoalRepo.find({
        where: { user_id: userId },
        order: { created_at: "DESC" },
      })

      return goals
    } catch (error) {
      logger.error(`운동 목표 조회 실패: ${error}`)
      throw new Error("운동 목표 조회에 실패했습니다.")
    }
  }

  /**
   * 운동 목표 수정
   */
  async updateWorkoutGoal(
    goalId: number,
    goalData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal> {
    const workoutGoalRepo = getRepository(WorkoutGoal)

    try {
      const goal = await workoutGoalRepo.findOne({
        where: { goal_id: goalId },
      })

      if (!goal) {
        throw new Error("운동 목표를 찾을 수 없습니다.")
      }

      Object.assign(goal, goalData)
      const updatedGoal = await workoutGoalRepo.save(goal)

      logger.info(`운동 목표 수정 완료: Goal ID ${goalId}`)
      return updatedGoal
    } catch (error) {
      logger.error(`운동 목표 수정 실패: ${error}`)
      throw new Error("운동 목표 수정에 실패했습니다.")
    }
  }

  /**
   * 운동 목표 삭제
   */
  async deleteWorkoutGoal(goalId: number): Promise<void> {
    const workoutGoalRepo = getRepository(WorkoutGoal)

    try {
      const goal = await workoutGoalRepo.findOne({
        where: { goal_id: goalId },
      })

      if (!goal) {
        throw new Error("운동 목표를 찾을 수 없습니다.")
      }

      await workoutGoalRepo.remove(goal)
      logger.info(`운동 목표 삭제 완료: Goal ID ${goalId}`)
    } catch (error) {
      logger.error(`운동 목표 삭제 실패: ${error}`)
      throw new Error("운동 목표 삭제에 실패했습니다.")
    }
  }

  /**
   * 운동 진행 상황 조회
   */
  async getWorkoutProgress(userId: number, machineId?: number): Promise<any> {
    const exerciseSetRepo = getRepository(ExerciseSet)

    try {
      let query = exerciseSetRepo
        .createQueryBuilder("set")
        .leftJoinAndSelect("set.machine", "machine")
        .leftJoinAndSelect("set.workout_session", "session")
        .where("session.user_id = :userId", { userId })

      if (machineId) {
        query = query.andWhere("set.machine_id = :machineId", { machineId })
      }

      const sets = await query
        .orderBy("set.created_at", "DESC")
        .limit(100)
        .getMany()

      // 진행 상황 분석
      const progress = {
        total_sessions: 0,
        total_sets: sets.length,
        total_duration_minutes: 0,
        machines_used: new Set(),
        recent_activity: sets.slice(0, 10),
      }

      const sessionIds = new Set(sets.map(set => set.session_id))
      progress.total_sessions = sessionIds.size

      sets.forEach(set => {
        progress.machines_used.add(set.machine_id)
      })

      return progress
    } catch (error) {
      logger.error(`운동 진행 상황 조회 실패: ${error}`)
      throw new Error("운동 진행 상황 조회에 실패했습니다.")
    }
  }
}
