import { AppDataSource } from '@backend/config/database'
import { WorkoutPlan } from "@backend/entities/WorkoutPlan"
import { WorkoutPlanExercise } from "@backend/entities/WorkoutPlanExercise"
import { WorkoutSession } from '@backend/entities/WorkoutSession'
import { ExerciseSet } from "@backend/entities/ExerciseSet"
import { WorkoutGoal } from "@backend/entities/WorkoutGoal"
import { In } from "typeorm"

export class WorkoutService {
  // 워크아웃 플랜 생성
  async createWorkoutPlan(
    planData: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan | null> {
    try {
      const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan)
      const plan = workoutPlanRepo.create(planData)
      return await workoutPlanRepo.save(plan)
    } catch (error) {
      console.error("워크아웃 플랜 생성 오류:", error)
      return null
    }
  }

  // 사용자의 워크아웃 플랜 조회
  async getUserWorkoutPlans(userId: number): Promise<WorkoutPlan[]> {
    try {
      const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan)
      return await workoutPlanRepo.find({
        where: { userId: userId },
        order: { createdAt: "DESC" },
      })
    } catch (error) {
      console.error("워크아웃 플랜 조회 오류:", error)
      return []
    }
  }

  // 워크아웃 플랜 상세 조회 (운동 포함)
  async getWorkoutPlanWithExercises(
    planId: number
  ): Promise<WorkoutPlan | null> {
    try {
      const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan)
      return await workoutPlanRepo.findOne({
        where: { id: planId },
        relations: ["exercises"],
      })
    } catch (error) {
      console.error("워크아웃 플랜 상세 조회 오류:", error)
      return null
    }
  }

  // 워크아웃 플랜 수정
  async updateWorkoutPlan(
    planId: number,
    updateData: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan | null> {
    try {
      const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan)
      const plan = await workoutPlanRepo.findOne({ where: { id: planId } })
      if (!plan) return null

      Object.assign(plan, updateData)
      return await workoutPlanRepo.save(plan)
    } catch (error) {
      console.error("워크아웃 플랜 수정 오류:", error)
      return null
    }
  }

  // 워크아웃 플랜 삭제
  async deleteWorkoutPlan(planId: number): Promise<boolean> {
    try {
      const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan)
      const plan = await workoutPlanRepo.findOne({ where: { id: planId } })
      if (!plan) return false

      await workoutPlanRepo.remove(plan)
      return true
    } catch (error) {
      console.error("워크아웃 플랜 삭제 오류:", error)
      return false
    }
  }

  // 워크아웃 세션 시작
  async startWorkoutSession(
    sessionData: Partial<WorkoutSession>
  ): Promise<WorkoutSession | null> {
    try {
      const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession)
      const session = workoutSessionRepo.create({
        ...sessionData,
        startTime: new Date(),
        status: "in_progress",
      })
      return await workoutSessionRepo.save(session)
    } catch (error) {
      console.error("워크아웃 세션 시작 오류:", error)
      return null
    }
  }

  // 워크아웃 세션 종료
  async endWorkoutSession(sessionId: number): Promise<WorkoutSession | null> {
    try {
      const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession)
      const session = await workoutSessionRepo.findOne({
        where: { id: sessionId },
      })
      if (!session) return null

      session.endTime = new Date()
      session.status = "completed"
      session.totalDurationMinutes = Math.round(
        (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      )

      return await workoutSessionRepo.save(session)
    } catch (error) {
      console.error("워크아웃 세션 종료 오류:", error)
      return null
    }
  }

  // 워크아웃 세션 완료 (completeWorkoutSession)
  async completeWorkoutSession(
    sessionId: number,
    userId: number
  ): Promise<WorkoutSession | null> {
    try {
      const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession)
      const session = await workoutSessionRepo.findOne({
        where: { id: sessionId, userId: userId },
      })
      if (!session) return null

      session.endTime = new Date()
      session.status = "completed"
      session.totalDurationMinutes = Math.round(
        (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      )

      return await workoutSessionRepo.save(session)
    } catch (error) {
      console.error("워크아웃 세션 완료 오류:", error)
      return null
    }
  }

  // 사용자의 워크아웃 세션 조회
  async getUserWorkoutSessions(
    userId: number,
    limit: number = 20
  ): Promise<WorkoutSession[]> {
    try {
      const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession)
      return await workoutSessionRepo.find({
        where: { userId: userId },
        order: { startTime: "DESC" },
        take: limit,
      })
    } catch (error) {
      console.error("워크아웃 세션 조회 오류:", error)
      return []
    }
  }

  // 운동 세트 추가
  async addExerciseSet(
    setData: Partial<ExerciseSet>
  ): Promise<ExerciseSet | null> {
    try {
      const exerciseSetRepo = AppDataSource.getRepository(ExerciseSet)
      const set = exerciseSetRepo.create(setData)
      return await exerciseSetRepo.save(set)
    } catch (error) {
      console.error("운동 세트 추가 오류:", error)
      return null
    }
  }

  // 세션의 운동 세트 조회
  async getSessionExerciseSets(sessionId: number): Promise<ExerciseSet[]> {
    try {
      const exerciseSetRepo = AppDataSource.getRepository(ExerciseSet)
      return await exerciseSetRepo.find({
        where: { sessionId: sessionId },
        order: { createdAt: "ASC" },
      })
    } catch (error) {
      console.error("운동 세트 조회 오류:", error)
      return []
    }
  }

  // 워크아웃 목표 생성
  async createWorkoutGoal(
    goalData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal | null> {
    try {
      const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal)
      const goal = workoutGoalRepo.create(goalData)
      return await workoutGoalRepo.save(goal)
    } catch (error) {
      console.error("워크아웃 목표 생성 오류:", error)
      return null
    }
  }

  // 사용자의 워크아웃 목표 조회
  async getUserWorkoutGoals(userId: number): Promise<WorkoutGoal[]> {
    try {
      const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal)
      return await workoutGoalRepo.find({
        where: { userId: userId },
        order: { createdAt: "DESC" },
      })
    } catch (error) {
      console.error("워크아웃 목표 조회 오류:", error)
      return []
    }
  }

  // 워크아웃 목표 수정
  async updateWorkoutGoal(
    goalId: number,
    updateData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal | null> {
    try {
      const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal)
      const goal = await workoutGoalRepo.findOne({ where: { id: goalId } })
      if (!goal) return null

      Object.assign(goal, updateData)
      return await workoutGoalRepo.save(goal)
    } catch (error) {
      console.error("워크아웃 목표 수정 오류:", error)
      return null
    }
  }

  // 워크아웃 목표 삭제
  async deleteWorkoutGoal(goalId: number): Promise<boolean> {
    try {
      const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal)
      const goal = await workoutGoalRepo.findOne({ where: { id: goalId } })
      if (!goal) return false

      await workoutGoalRepo.remove(goal)
      return true
    } catch (error) {
      console.error("워크아웃 목표 삭제 오류:", error)
      return false
    }
  }

  // 운동 진행 상황 조회 (getWorkoutProgress)
  async getWorkoutProgress(userId: number, machineId?: number): Promise<any> {
    try {
      const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession)
      const exerciseSetRepo = AppDataSource.getRepository(ExerciseSet)

      // 기본 쿼리 조건
      const sessionWhere: any = { userId: userId, status: "completed" }
      const setWhere: any = {}

      if (machineId) {
        setWhere.machineId = machineId
      }

      // 완료된 세션 조회
      const sessions = await workoutSessionRepo.find({
        where: sessionWhere,
        order: { endTime: "DESC" },
        take: 10,
      })

      // 운동 세트 조회
      const sessionIds = sessions.map(s => s.id)
      const sets =
        sessionIds.length > 0
          ? await exerciseSetRepo.find({
              where: machineId
                ? { sessionId: In(sessionIds), machineId: machineId }
                : { sessionId: In(sessionIds) },
              order: { createdAt: "DESC" },
            })
          : []

      return {
        sessions,
        sets,
        totalSessions: sessions.length,
        totalSets: sets.length,
      }
    } catch (error) {
      console.error("운동 진행 상황 조회 오류:", error)
      return {
        sessions: [],
        sets: [],
        totalSessions: 0,
        totalSets: 0,
      }
    }
  }

  // 운동 세트 삭제
  async deleteExerciseSet(setId: number): Promise<boolean> {
    try {
      const exerciseSetRepo = AppDataSource.getRepository(ExerciseSet)
      const set = await exerciseSetRepo.findOne({ where: { id: setId } })
      if (!set) return false

      await exerciseSetRepo.remove(set)
      return true
    } catch (error) {
      console.error("운동 세트 삭제 오류:", error)
      return false
    }
  }
}
