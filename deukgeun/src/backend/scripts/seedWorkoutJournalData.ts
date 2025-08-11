import { getRepository } from "typeorm"
import { User } from "../entities/User"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { WorkoutSession } from "../entities/WorkoutSession"
import { ExerciseSet } from "../entities/ExerciseSet"
import { WorkoutStats } from "../entities/WorkoutStats"
import { WorkoutProgress } from "../entities/WorkoutProgress"
import { Machine } from "../entities/Machine"

async function seedWorkoutJournalData() {
  try {
    console.log("🏋️ WorkoutJournal 초기 데이터 생성 시작...")

    // 사용자 조회 (테스트용 사용자)
    const userRepository = getRepository(User)
    const user = await userRepository.findOne({
      where: { email: "test@example.com" },
    })

    if (!user) {
      console.log(
        "❌ 테스트 사용자를 찾을 수 없습니다. 먼저 사용자를 생성해주세요."
      )
      return
    }

    console.log(`✅ 사용자 찾음: ${user.nickname} (ID: ${user.id})`)

    // 기계 데이터 조회
    const machineRepository = getRepository(Machine)
    const machines = await machineRepository.find({ take: 10 })

    if (machines.length === 0) {
      console.log("❌ 기계 데이터가 없습니다. 먼저 기계 데이터를 생성해주세요.")
      return
    }

    console.log(`✅ 기계 데이터 찾음: ${machines.length}개`)

    // 1. 운동 계획 생성
    const planRepository = getRepository(WorkoutPlan)
    const samplePlans = [
      {
        user_id: user.id,
        name: "초보자 전체 운동",
        description: "전신을 골고루 발달시키는 초보자용 운동 계획",
        difficulty_level: "beginner" as const,
        estimated_duration_minutes: 60,
        target_muscle_groups: ["chest", "back", "legs", "shoulders"],
        is_template: false,
        is_public: false,
      },
      {
        user_id: user.id,
        name: "상체 집중 운동",
        description: "가슴, 등, 어깨를 집중적으로 발달시키는 운동",
        difficulty_level: "intermediate" as const,
        estimated_duration_minutes: 45,
        target_muscle_groups: ["chest", "back", "shoulders", "arms"],
        is_template: false,
        is_public: false,
      },
      {
        user_id: user.id,
        name: "하체 강화 운동",
        description: "다리 근력을 강화하는 운동 계획",
        difficulty_level: "intermediate" as const,
        estimated_duration_minutes: 50,
        target_muscle_groups: ["legs", "glutes"],
        is_template: false,
        is_public: false,
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
    const goalRepository = getRepository(WorkoutGoal)
    const sampleGoals = [
      {
        user_id: user.id,
        goal_type: "strength" as const,
        target_value: 100,
        current_value: 60,
        unit: "kg",
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        start_date: new Date(),
        status: "active" as const,
        progress_percentage: 60,
      },
      {
        user_id: user.id,
        goal_type: "weight_loss" as const,
        target_value: 5,
        current_value: 2,
        unit: "kg",
        target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60일 후
        start_date: new Date(),
        status: "active" as const,
        progress_percentage: 40,
      },
      {
        user_id: user.id,
        goal_type: "endurance" as const,
        target_value: 30,
        current_value: 15,
        unit: "분",
        target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45일 후
        start_date: new Date(),
        status: "active" as const,
        progress_percentage: 50,
      },
    ]

    const createdGoals = []
    for (const goalData of sampleGoals) {
      const goal = goalRepository.create(goalData)
      const savedGoal = await goalRepository.save(goal)
      createdGoals.push(savedGoal)
      console.log(
        `✅ 운동 목표 생성: ${savedGoal.goal_type} - ${savedGoal.target_value}${savedGoal.unit}`
      )
    }

    // 3. 운동 세션 생성 (최근 2주간)
    const sessionRepository = getRepository(WorkoutSession)
    const setRepository = getRepository(ExerciseSet)

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
        user_id: user.id,
        plan_id: plan.plan_id,
        session_name: `${plan.name} 세션`,
        start_time: new Date(sessionDate.getTime() + 9 * 60 * 60 * 1000), // 오전 9시
        end_time: new Date(sessionDate.getTime() + 10 * 60 * 60 * 1000), // 오전 10시
        total_duration_minutes: 60,
        mood_rating: Math.floor(Math.random() * 3) + 3, // 3-5
        energy_level: Math.floor(Math.random() * 3) + 3, // 3-5
        notes: "좋은 운동이었다!",
        status: "completed" as const,
      }

      const session = sessionRepository.create(sessionData)
      const savedSession = await sessionRepository.save(session)
      console.log(`✅ 운동 세션 생성: ${savedSession.session_name}`)

      // 운동 세트 생성
      const machine = machines[i % machines.length]
      for (let setNum = 1; setNum <= 3; setNum++) {
        const setData = {
          session_id: savedSession.session_id,
          machine_id: machine.id,
          set_number: setNum,
          reps_completed: Math.floor(Math.random() * 5) + 8, // 8-12
          weight_kg: Math.floor(Math.random() * 20) + 30, // 30-50kg
          duration_seconds: undefined,
          distance_meters: undefined,
          rpe_rating: Math.floor(Math.random() * 3) + 7, // 7-9
          notes: `${setNum}세트 완료`,
        }

        const exerciseSet = setRepository.create(setData)
        await setRepository.save(exerciseSet)
      }
    }

    // 4. 운동 통계 생성
    const statsRepository = getRepository(WorkoutStats)
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const statsData = {
        user_id: user.id,
        workout_date: date,
        total_sessions: i % 3 === 0 ? 1 : 0,
        total_duration_minutes: i % 3 === 0 ? 60 : 0,
        total_sets: i % 3 === 0 ? 9 : 0,
        total_reps: i % 3 === 0 ? 90 : 0,
        total_weight_kg: i % 3 === 0 ? 360 : 0,
        total_distance_meters: 0,
        average_mood: i % 3 === 0 ? 4.2 : 0,
        average_energy: i % 3 === 0 ? 4.0 : 0,
        average_rpe: i % 3 === 0 ? 8.0 : 0,
        calories_burned: i % 3 === 0 ? 480 : 0,
      }

      const stats = statsRepository.create(statsData)
      await statsRepository.save(stats)
    }
    console.log("✅ 운동 통계 생성 완료")

    // 5. 운동 진행 상황 생성
    const progressRepository = getRepository(WorkoutProgress)
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
