import { AppDataSource } from "../config/database"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutSession } from "../entities/WorkoutSession"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { WorkoutStats } from "../entities/WorkoutStats"
import { WorkoutProgress } from "../entities/WorkoutProgress"
import { ExerciseSet } from "../entities/ExerciseSet"
import { WorkoutPlanExercise } from "../entities/WorkoutPlanExercise"

// 타입 정의
interface CreatePlanData {
  plan_name?: string
  name?: string // 프론트엔드 호환성을 위해 추가
  description?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  estimated_duration_minutes?: number
  target_muscle_groups?: string[]
  is_template?: boolean
  is_public?: boolean
  exercises?: {
    machine_id?: number
    machineId?: number
    order?: number
    sets: number
    reps?: number
    reps_min?: number
    reps_max?: number
    weight?: number
    weight_min?: number
    weight_max?: number
    rest_time?: number
    restTime?: number
    notes?: string
    exerciseName?: string // 프론트엔드 호환성을 위해 추가
  }[]
}

interface UpdatePlanData {
  name?: string
  plan_name?: string // 프론트엔드 호환성을 위해 추가
  description?: string
  difficulty?: string
  estimated_duration_minutes?: number
  target_muscle_groups?: string[]
  is_template?: boolean
  is_public?: boolean
  exercises?: {
    machine_id?: number
    machineId?: number
    order?: number
    sets: number
    reps?: number
    reps_min?: number
    reps_max?: number
    weight?: number
    weight_min?: number
    weight_max?: number
    rest_time?: number
    restTime?: number
    notes?: string
    exerciseName?: string // 프론트엔드 호환성을 위해 추가
  }[]
}

interface CreateSessionData {
  plan_id?: number
  gym_id?: number
  session_name?: string
  name?: string // 프론트엔드 호환성을 위해 추가
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
    try {
      const planRepository = AppDataSource.getRepository(WorkoutPlan)
      const plans = await planRepository.find({
        where: { userId: userId },
        order: { createdAt: "DESC" },
        relations: ["exercises", "exercises.machine"],
      })

      // 프론트엔드 호환성을 위해 필드명 변환
      return plans.map(plan => ({
        ...plan,
        exercises:
          plan.exercises?.map(exercise => ({
            id: exercise.id,
            planId: exercise.planId,
            machineId: exercise.machineId, // machineId로 통일
            exerciseName: exercise.exerciseName || "", // exerciseName 필드 사용
            order: exercise.exerciseOrder,
            sets: exercise.sets,
            reps: exercise.repsRange?.min || 10,
            weight: exercise.weightRange?.min || 0,
            restTime: exercise.restSeconds,
            notes: exercise.notes || "",
          })) || [],
      }))
    } catch (error) {
      console.error("운동 계획 조회 중 오류:", error)
      throw new Error(
        `운동 계획 조회에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      )
    }
  }

  async createWorkoutPlan(userId: number, planData: CreatePlanData) {
    const planRepository = AppDataSource.getRepository(WorkoutPlan)
    const exerciseRepository = AppDataSource.getRepository(WorkoutPlanExercise)

    console.log("운동 계획 생성 시작:", { userId, planData })

    // 트랜잭션 시작
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 운동 계획 생성 - name과 plan_name 모두 처리
      const plan = planRepository.create({
        userId: userId,
        name: planData.plan_name || planData.name || "", // plan_name 또는 name 사용
        description: planData.description,
        difficulty: planData.difficulty || "beginner",
        estimatedDurationMinutes: planData.estimated_duration_minutes || 60,
        targetMuscleGroups: planData.target_muscle_groups || [],
        isTemplate: planData.is_template || false,
        isPublic: planData.is_public || false,
      })

      console.log("생성할 계획:", plan)
      const savedPlan = await queryRunner.manager.save(plan)
      console.log("저장된 계획:", savedPlan)

      // exercises 배열이 있으면 WorkoutPlanExercise 엔티티들 생성
      if (planData.exercises && planData.exercises.length > 0) {
        console.log("운동 추가 시작:", planData.exercises)
        console.log("운동 개수:", planData.exercises.length)

        const exercises = planData.exercises.map((exercise, index) => {
          console.log(`운동 ${index + 1} 데이터:`, exercise)

          const exerciseEntity = exerciseRepository.create({
            planId: savedPlan.id,
            machineId: exercise.machine_id || exercise.machineId || 1,
            exerciseName: exercise.exerciseName || exercise.notes || "",
            exerciseOrder: exercise.order || index,
            sets: exercise.sets || 3,
            repsRange: {
              min: exercise.reps || 10,
              max: exercise.reps || 10,
            },
            weightRange: exercise.weight
              ? {
                  min: exercise.weight,
                  max: exercise.weight,
                }
              : undefined,
            restSeconds: exercise.rest_time || exercise.restTime || 60,
            notes: exercise.notes || "",
          })
          console.log(`생성할 운동 ${index + 1}:`, exerciseEntity)
          return exerciseEntity
        })

        console.log("저장할 운동들:", exercises)
        const savedExercises = await queryRunner.manager.save(exercises)
        console.log("저장된 운동들:", savedExercises)
      } else {
        console.log("exercises 배열이 없거나 비어있음")
      }

      await queryRunner.commitTransaction()
      console.log("운동 계획 생성 완료")

      // 저장된 계획을 다시 조회하여 exercises 포함
      const planWithExercises = await planRepository.findOne({
        where: { id: savedPlan.id },
        relations: ["exercises", "exercises.machine"],
      })

      // 프론트엔드 호환성을 위해 필드명 변환
      const planForFrontend = {
        ...planWithExercises,
        exercises:
          planWithExercises?.exercises?.map(exercise => ({
            id: exercise.id,
            planId: exercise.planId,
            machineId: exercise.machineId, // machineId로 통일
            exerciseName: exercise.exerciseName || "", // exerciseName 필드 사용
            order: exercise.exerciseOrder,
            sets: exercise.sets,
            reps: exercise.repsRange?.min || 10,
            weight: exercise.weightRange?.min || 0,
            restTime: exercise.restSeconds,
            notes: exercise.notes || "",
          })) || [],
      }

      return planForFrontend
    } catch (error) {
      await queryRunner.rollbackTransaction()
      console.error("운동 계획 생성 중 오류:", error)
      throw new Error(`운동 계획 생성에 실패했습니다: ${error.message}`)
    } finally {
      await queryRunner.release()
    }
  }

  async updateWorkoutPlan(
    planId: number,
    userId: number,
    updateData: UpdatePlanData
  ) {
    const planRepository = AppDataSource.getRepository(WorkoutPlan)
    const exerciseRepository = AppDataSource.getRepository(WorkoutPlanExercise)

    console.log("운동 계획 업데이트 시작:", { planId, userId, updateData })

    // 트랜잭션 시작
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const plan = await planRepository.findOne({
        where: { id: planId, userId: userId },
        relations: ["exercises", "exercises.machine"],
      })

      if (!plan) {
        throw new Error("운동 계획을 찾을 수 없습니다.")
      }

      console.log("기존 계획:", plan)
      console.log("기존 exercises:", plan.exercises)

      // 기본 계획 정보 업데이트
      Object.assign(plan, updateData)

      // name 필드가 있으면 plan_name으로도 설정 (호환성)
      if (updateData.name && !updateData.plan_name) {
        plan.name = updateData.name
      } else if (updateData.plan_name && !updateData.name) {
        plan.name = updateData.plan_name
      }

      await queryRunner.manager.save(plan)

      // exercises 배열이 있으면 기존 exercises 삭제 후 새로 생성
      if (updateData.exercises) {
        console.log("업데이트할 exercises:", updateData.exercises)
        console.log("exercises 배열 길이:", updateData.exercises.length)

        // 기존 exercises 삭제 - 안전한 방법으로 삭제
        console.log("기존 exercises 삭제 시작")
        await queryRunner.manager.delete(WorkoutPlanExercise, {
          planId: planId,
        })
        console.log("기존 exercises 삭제 완료")

        // 새로운 exercises 생성
        if (updateData.exercises.length > 0) {
          console.log("새로운 exercises 생성 시작")
          const exercises = updateData.exercises.map((exercise, index) => {
            console.log(`운동 ${index + 1} 데이터:`, exercise)

            // machineId 처리 개선
            const machineId = exercise.machine_id || exercise.machineId
            if (!machineId) {
              console.error(`운동 ${index + 1}에 machineId가 없음:`, exercise)
              throw new Error(`운동 ${index + 1}에 machineId가 필요합니다.`)
            }

            const exerciseEntity = exerciseRepository.create({
              planId: planId,
              machineId: machineId,
              exerciseName: exercise.exerciseName || exercise.notes || "",
              exerciseOrder: exercise.order || index,
              sets: exercise.sets || 3,
              repsRange: {
                min: exercise.reps || 10,
                max: exercise.reps || 10,
              },
              weightRange: exercise.weight
                ? {
                    min: exercise.weight,
                    max: exercise.weight,
                  }
                : undefined,
              restSeconds: exercise.rest_time || exercise.restTime || 60,
              notes: exercise.notes || "",
            })

            console.log(`생성할 운동 ${index + 1}:`, exerciseEntity)
            return exerciseEntity
          })

          console.log("저장할 exercises:", exercises)
          const savedExercises = await queryRunner.manager.save(exercises)
          console.log("저장된 exercises:", savedExercises)

          // plan.exercises 배열 업데이트
          plan.exercises = savedExercises
        } else {
          console.log("exercises 배열이 비어있음")
          plan.exercises = []
        }
      } else {
        console.log("updateData.exercises가 없음")
      }

      await queryRunner.commitTransaction()
      console.log("운동 계획 업데이트 완료")

      // 프론트엔드 호환성을 위해 필드명 변환
      const planForFrontend = {
        ...plan,
        exercises:
          plan.exercises?.map(exercise => ({
            id: exercise.id,
            planId: exercise.planId,
            machineId: exercise.machineId, // machineId로 통일
            exerciseName: exercise.exerciseName || "", // exerciseName 필드 사용
            order: exercise.exerciseOrder,
            sets: exercise.sets,
            reps: exercise.repsRange?.min || 10,
            weight: exercise.weightRange?.min || 0,
            restTime: exercise.restSeconds,
            notes: exercise.notes || "",
          })) || [],
      }

      return planForFrontend
    } catch (error) {
      await queryRunner.rollbackTransaction()
      console.error("운동 계획 업데이트 중 오류:", error)
      throw new Error("운동 계획 업데이트에 실패했습니다.")
    } finally {
      await queryRunner.release()
    }
  }

  async deleteWorkoutPlan(planId: number, userId: number) {
    const planRepository = AppDataSource.getRepository(WorkoutPlan)
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
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
    return await sessionRepository.find({
      where: { userId: userId },
      order: { startTime: "DESC" },
      relations: ["exerciseSets"],
    })
  }

  async createWorkoutSession(userId: number, sessionData: CreateSessionData) {
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)

    // 필수 필드 검증 - name 또는 session_name 중 하나는 있어야 함
    if (!sessionData.name && !sessionData.session_name) {
      throw new Error("세션 이름은 필수입니다.")
    }

    const session = sessionRepository.create({
      userId: userId,
      planId: sessionData.plan_id,
      gymId: sessionData.gym_id,
      name: sessionData.name || sessionData.session_name, // name 또는 session_name 사용
      startTime: new Date(sessionData.start_time || new Date()),
      moodRating: sessionData.mood_rating,
      energyLevel: sessionData.energy_level,
      notes: sessionData.notes,
      status: "in_progress",
    })

    try {
      return await sessionRepository.save(session)
    } catch (error) {
      console.error("운동 세션 생성 중 오류:", error)
      throw new Error("운동 세션 생성에 실패했습니다.")
    }
  }

  async updateWorkoutSession(
    sessionId: number,
    userId: number,
    updateData: UpdateSessionData
  ) {
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
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
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
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
    const goalRepository = AppDataSource.getRepository(WorkoutGoal)
    return await goalRepository.find({
      where: { userId: userId },
      order: { createdAt: "DESC" },
    })
  }

  async createWorkoutGoal(userId: number, goalData: CreateGoalData) {
    const goalRepository = AppDataSource.getRepository(WorkoutGoal)
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
    const goalRepository = AppDataSource.getRepository(WorkoutGoal)
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
    const goalRepository = AppDataSource.getRepository(WorkoutGoal)

    try {
      const goal = await goalRepository.findOne({
        where: { id: goalId, userId: userId },
      })

      if (!goal) {
        throw new Error("운동 목표를 찾을 수 없습니다.")
      }

      await goalRepository.remove(goal)
    } catch (error) {
      console.error("운동 목표 삭제 중 오류:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("운동 목표 삭제에 실패했습니다.")
    }
  }

  // 실시간 세션 상태 관리 메서드들
  async startWorkoutSession(
    userId: number,
    sessionId: number,
    sessionData?: any
  ): Promise<WorkoutSession> {
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { id: sessionId, userId: userId },
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    session.status = "in_progress"
    session.startTime = new Date()

    return await sessionRepository.save(session)
  }

  async pauseWorkoutSession(
    userId: number,
    sessionId: number
  ): Promise<WorkoutSession> {
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { id: sessionId, userId: userId },
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    session.status = "paused"

    return await sessionRepository.save(session)
  }

  async resumeWorkoutSession(
    userId: number,
    sessionId: number
  ): Promise<WorkoutSession> {
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { id: sessionId, userId: userId },
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    session.status = "in_progress"

    return await sessionRepository.save(session)
  }

  async completeWorkoutSession(
    userId: number,
    sessionId: number,
    sessionData?: any
  ): Promise<WorkoutSession> {
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
    const session = await sessionRepository.findOne({
      where: { id: sessionId, userId: userId },
    })

    if (!session) {
      throw new Error("운동 세션을 찾을 수 없습니다.")
    }

    session.status = "completed"
    session.endTime = new Date()
    session.totalDurationMinutes = Math.round(
      (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
    )

    // 추가 데이터가 있으면 업데이트
    if (sessionData) {
      Object.assign(session, sessionData)
    }

    return await sessionRepository.save(session)
  }

  // ExerciseSet 관련 메서드들 (기존 addExerciseSet 활용)
  async getExerciseSets(sessionId?: number): Promise<ExerciseSet[]> {
    const exerciseSetRepository = AppDataSource.getRepository(ExerciseSet)
    const whereCondition: any = {}

    if (sessionId) {
      whereCondition.sessionId = sessionId
    }

    return await exerciseSetRepository.find({
      where: whereCondition,
      order: { createdAt: "ASC" },
      relations: ["workoutSession", "machine"],
    })
  }

  async createExerciseSet(setData: any): Promise<ExerciseSet> {
    // 기존 addExerciseSet 메서드 활용
    return await this.addExerciseSet(setData)
  }

  async updateExerciseSet(
    setId: number,
    updateData: any
  ): Promise<ExerciseSet> {
    const exerciseSetRepository = AppDataSource.getRepository(ExerciseSet)
    const set = await exerciseSetRepository.findOne({
      where: { id: setId },
      relations: ["workoutSession"],
    })

    if (!set) {
      throw new Error("운동 세트를 찾을 수 없습니다.")
    }

    // 세션의 userId를 통해 권한 확인 (컨트롤러에서 이미 확인했지만 추가 보안)
    if (!set.workoutSession || !set.workoutSession.userId) {
      throw new Error("운동 세트에 대한 권한이 없습니다.")
    }

    Object.assign(set, {
      ...updateData,
      updatedAt: new Date(),
    })

    return await exerciseSetRepository.save(set)
  }

  async deleteExerciseSet(setId: number): Promise<void> {
    const exerciseSetRepository = AppDataSource.getRepository(ExerciseSet)
    const set = await exerciseSetRepository.findOne({
      where: { id: setId },
      relations: ["workoutSession"],
    })

    if (!set) {
      throw new Error("운동 세트를 찾을 수 없습니다.")
    }

    // 세션의 userId를 통해 권한 확인 (컨트롤러에서 이미 확인했지만 추가 보안)
    if (!set.workoutSession || !set.workoutSession.userId) {
      throw new Error("운동 세트에 대한 권한이 없습니다.")
    }

    await exerciseSetRepository.remove(set)
  }

  // 운동 통계 관련
  async getUserStats(userId: number) {
    const statsRepository = AppDataSource.getRepository(WorkoutStats)
    return await statsRepository.find({
      where: { userId: userId },
      order: { workoutDate: "DESC" },
      take: 30, // 최근 30일
    })
  }

  // 운동 진행 상황 관련
  async getUserProgress(userId: number) {
    const progressRepository = AppDataSource.getRepository(WorkoutProgress)
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
    const setRepository = AppDataSource.getRepository(ExerciseSet)
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

  // 운동 통계 업데이트
  async updateWorkoutStats(userId: number, sessionId: number) {
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
    const setRepository = AppDataSource.getRepository(ExerciseSet)
    const statsRepository = AppDataSource.getRepository(WorkoutStats)

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
