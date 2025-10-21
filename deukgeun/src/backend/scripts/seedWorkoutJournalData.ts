import { AppDataSource } from '@backend/config/databaseConfig'
import { User } from '@backend/entities/User'
import { WorkoutPlan } from "@backend/entities/WorkoutPlan"
import { WorkoutGoal } from "@backend/entities/WorkoutGoal"
import { WorkoutSession } from '@backend/entities/WorkoutSession'
import { ExerciseSet } from "@backend/entities/ExerciseSet"
import { WorkoutStats } from '@backend/entities/WorkoutStats'
import { WorkoutProgress } from "@backend/entities/WorkoutProgress"
import { Machine } from '@backend/entities/Machine'

async function seedWorkoutJournalData() {
  try {
    // 데이터베이스 연결 초기화
    await AppDataSource.initialize()
    console.log("✅ 데이터베이스 연결 성공")
  } catch (error) {
    console.error("❌ 데이터베이스 연결 실패:", error)
    return
  }
  try {
    console.log("🏋️ WorkoutJournal 초기 데이터 생성 시작...")

    // 사용자 조회 (첫 번째 사용자)
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: {},
    })

    if (!user) {
      console.log(
        "❌ 테스트 사용자를 찾을 수 없습니다. 먼저 사용자를 생성해주세요."
      )
      return
    }

    console.log(`✅ 사용자 찾음: ${user.nickname} (ID: ${user.id})`)

    // 기계 데이터 조회
    const machineRepository = AppDataSource.getRepository(Machine)
    const machines = await machineRepository.find({ take: 10 })

    if (machines.length === 0) {
      console.log("❌ 기계 데이터가 없습니다. 먼저 기계 데이터를 생성해주세요.")
      return
    }

    console.log(`✅ 기계 데이터 찾음: ${machines.length}개`)

    // 1. 운동 계획 생성
    const planRepository = AppDataSource.getRepository(WorkoutPlan)
    const samplePlans = [
      {
        userId: user.id,
        name: "초보자 전체 운동",
        description: "전신을 골고루 발달시키는 초보자용 운동 계획",
        difficulty: "beginner" as const,
        estimatedDurationMinutes: 60,
        targetMuscleGroups: ["chest", "back", "legs", "shoulders"],
        isTemplate: false,
        isPublic: false,
      },
      {
        userId: user.id,
        name: "상체 집중 운동",
        description: "가슴, 등, 어깨를 집중적으로 발달시키는 운동",
        difficulty: "intermediate" as const,
        estimatedDurationMinutes: 45,
        targetMuscleGroups: ["chest", "back", "shoulders", "arms"],
        isTemplate: false,
        isPublic: false,
      },
      {
        userId: user.id,
        name: "하체 강화 운동",
        description: "다리 근력을 강화하는 운동 계획",
        difficulty: "intermediate" as const,
        estimatedDurationMinutes: 50,
        targetMuscleGroups: ["legs", "glutes"],
        isTemplate: false,
        isPublic: false,
      },
    ]

    const createdPlans = []
    for (const planData of samplePlans) {
      const plan = planRepository.create(planData)
      const savedPlan = await planRepository.save(plan)
      createdPlans.push(savedPlan)
      console.log(`✅ 운동 계획 생성: ${savedPlan.name}`)
    }

    // 2. 운동 목표 생성
    const goalRepository = AppDataSource.getRepository(WorkoutGoal)
    const sampleGoals = [
      {
        userId: user.id,
        title: "벤치프레스 100kg 달성",
        description: "벤치프레스 무게를 100kg까지 올리는 것이 목표입니다.",
        type: "weight" as const,
        targetValue: 100,
        currentValue: 60,
        unit: "kg",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        isCompleted: false,
      },
      {
        userId: user.id,
        title: "체중 5kg 감량",
        description: "현재 체중에서 5kg를 감량하는 것이 목표입니다.",
        type: "weight" as const,
        targetValue: 5,
        currentValue: 2,
        unit: "kg",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60일 후
        isCompleted: false,
      },
      {
        userId: user.id,
        title: "런닝 30분 지속",
        description: "런닝을 30분 동안 지속할 수 있도록 하는 것이 목표입니다.",
        type: "duration" as const,
        targetValue: 30,
        currentValue: 15,
        unit: "분",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45일 후
        isCompleted: false,
      },
    ]

    const createdGoals = []
    for (const goalData of sampleGoals) {
      const goal = goalRepository.create(goalData)
      const savedGoal = await goalRepository.save(goal)
      createdGoals.push(savedGoal)
      console.log(
        `✅ 운동 목표 생성: ${savedGoal.type} - ${savedGoal.targetValue}${savedGoal.unit}`
      )
    }

    // 3. 운동 세션 생성 (최근 2주간)
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
    const setRepository = AppDataSource.getRepository(ExerciseSet)

    const recentDates = []
    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      if (i % 3 === 0) {
        // 3일마다 운동
        recentDates.push(date)
      }
    }

    for (let i = 0; i < recentDates.length; i++) {
      const sessionDate = recentDates[i]
      const plan = createdPlans[i % createdPlans.length]

      const sessionData = {
        userId: user.id,
        planId: plan.id,
        name: `${plan.name} 세션`,
        startTime: new Date(sessionDate.getTime() + 9 * 60 * 60 * 1000), // 오전 9시
        endTime: new Date(sessionDate.getTime() + 10 * 60 * 60 * 1000), // 오전 10시
        totalDurationMinutes: 60,
        moodRating: Math.floor(Math.random() * 3) + 3, // 3-5
        energyLevel: Math.floor(Math.random() * 3) + 3, // 3-5
        notes: "좋은 운동이었다!",
        status: "completed" as const,
      }

      const session = sessionRepository.create(sessionData)
      const savedSession = await sessionRepository.save(session)
      console.log(`✅ 운동 세션 생성: ${savedSession.name}`)

      // 운동 세트 생성
      const machine = machines[i % machines.length]
      for (let setNum = 1; setNum <= 3; setNum++) {
        const setData = {
          sessionId: savedSession.id,
          machineId: machine.id,
          setNumber: setNum,
          repsCompleted: Math.floor(Math.random() * 5) + 8, // 8-12
          weightKg: Math.floor(Math.random() * 20) + 30, // 30-50kg
          durationSeconds: undefined,
          distanceMeters: undefined,
          rpeRating: Math.floor(Math.random() * 3) + 7, // 7-9
          notes: `${setNum}세트 완료`,
        }

        const exerciseSet = setRepository.create(setData)
        await setRepository.save(exerciseSet)
      }
    }

    // 4. 운동 통계 생성
    const statsRepository = AppDataSource.getRepository(WorkoutStats)
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const statsData = {
        userId: user.id,
        workoutDate: date,
        totalSessions: i % 3 === 0 ? 1 : 0,
        totalDurationMinutes: i % 3 === 0 ? 60 : 0,
        totalSets: i % 3 === 0 ? 9 : 0,
        totalReps: i % 3 === 0 ? 90 : 0,
        totalWeightKg: i % 3 === 0 ? 360 : 0,
        totalDistanceMeters: 0,
        averageMood: i % 3 === 0 ? 4.2 : 0,
        averageEnergy: i % 3 === 0 ? 4.0 : 0,
        averageRpe: i % 3 === 0 ? 8.0 : 0,
        caloriesBurned: i % 3 === 0 ? 480 : 0,
      }

      const stats = statsRepository.create(statsData)
      await statsRepository.save(stats)
    }
    console.log("✅ 운동 통계 생성 완료")

    // 5. 운동 진행 상황 생성
    const progressRepository = AppDataSource.getRepository(WorkoutProgress)
    for (let i = 0; i < 10; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i * 2)
      const machine = machines[i % machines.length]

      const progressData = {
        user_id: user.id,
        machine_id: machine.id,
        progress_date: date,
        set_number: 1,
        reps_completed: Math.floor(Math.random() * 5) + 8,
        weight_kg: Math.floor(Math.random() * 20) + 30 + i * 2, // 점진적 증가
        duration_seconds: undefined,
        distance_meters: undefined,
        rpe_rating: Math.floor(Math.random() * 3) + 7,
        notes: "진행 상황 기록",
        is_personal_best: i === 0,
        improvement_percentage: i * 5,
      }

      const progress = progressRepository.create(progressData)
      await progressRepository.save(progress)
    }
    console.log("✅ 운동 진행 상황 생성 완료")

    console.log("🎉 WorkoutJournal 초기 데이터 생성 완료!")
    console.log(`📊 생성된 데이터:`)
    console.log(`   - 운동 계획: ${createdPlans.length}개`)
    console.log(`   - 운동 목표: ${createdGoals.length}개`)
    console.log(`   - 운동 세션: ${recentDates.length}개`)
    console.log(`   - 운동 통계: 7일`)
    console.log(`   - 진행 상황: 10개`)
  } catch (error) {
    console.error("❌ WorkoutJournal 초기 데이터 생성 실패:", error)
  }
}

// 스크립트 실행
if (require.main === module) {
  seedWorkoutJournalData()
    .then(() => {
      console.log("✅ 스크립트 실행 완료")
      process.exit(0)
    })
    .catch(error => {
      console.error("❌ 스크립트 실행 실패:", error)
      process.exit(1)
    })
}

export { seedWorkoutJournalData }
