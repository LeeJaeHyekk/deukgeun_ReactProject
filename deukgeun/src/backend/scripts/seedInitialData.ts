// ============================================================================
// 초기 데이터 생성 스크립트
// ============================================================================

import { AppDataSource } from "../config/database"
import { User } from "../entities/User"
import { UserLevel } from "../entities/UserLevel"
import { UserReward } from "../entities/UserReward"
import { Milestone } from "../entities/Milestone"
import { UserStreak } from "../entities/UserStreak"
import { Gym } from "../entities/Gym"
import { Machine } from "../entities/Machine"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutPlanExercise } from "../entities/WorkoutPlanExercise"
import { ExpHistory } from "../entities/ExpHistory"
import bcrypt from "bcrypt"

async function seedInitialData() {
  try {
    console.log("🚀 Starting initial data seeding...")

    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ Database connected")

    // 기존 데이터 삭제 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.log("🧹 Cleaning existing data...")
      await AppDataSource.dropDatabase()
      await AppDataSource.synchronize()
    }

    // 1. 테스트 사용자 생성
    console.log("👤 Creating test users...")
    const testUsers = await createTestUsers()

    // 2. 헬스장 데이터 생성
    console.log("🏋️ Creating gym data...")
    const testGyms = await createTestGyms()

    // 3. 기계 데이터 생성
    console.log("🔧 Creating machine data...")
    const testMachines = await createTestMachines()

    // 4. 워크아웃 플랜 생성
    console.log("📋 Creating workout plans...")
    await createTestWorkoutPlans(testUsers, testMachines)

    // 5. 레벨 시스템 초기화
    console.log("⭐ Initializing level system...")
    await initializeLevelSystem(testUsers)

    // 6. 보상 및 마일스톤 생성
    console.log("🏆 Creating rewards and milestones...")
    await createRewardsAndMilestones(testUsers)

    // 7. 스트릭 초기화
    console.log("🔥 Initializing streaks...")
    await initializeStreaks(testUsers)

    console.log("✅ Initial data seeding completed successfully!")
    console.log(
      `📊 Created ${testUsers.length} users, ${testGyms.length} gyms, ${testMachines.length} machines`
    )
  } catch (error) {
    console.error("❌ Error seeding initial data:", error)
    throw error
  } finally {
    await AppDataSource.destroy()
  }
}

async function createTestUsers() {
  const userRepository = AppDataSource.getRepository(User)
  const userLevelRepository = AppDataSource.getRepository(UserLevel)

  const testUsers = [
    {
      email: "admin@deukgeun.com",
      password: await bcrypt.hash(
        process.env.TEST_ADMIN_PASSWORD || "admin123!",
        10
      ),
      nickname: "관리자",
      role: "admin" as const,
      isEmailVerified: true,
      isActive: true,
    },
    {
      email: "user1@test.com",
      password: await bcrypt.hash(
        process.env.TEST_USER_PASSWORD || "user123!",
        10
      ),
      nickname: "테스트유저1",
      role: "user" as const,
      isEmailVerified: true,
      isActive: true,
    },
    {
      email: "user2@test.com",
      password: await bcrypt.hash(
        process.env.TEST_USER_PASSWORD || "user123!",
        10
      ),
      nickname: "테스트유저2",
      role: "user" as const,
      isEmailVerified: true,
      isActive: true,
    },
    {
      email: "premium@test.com",
      password: await bcrypt.hash(
        process.env.TEST_PREMIUM_PASSWORD || "premium123!",
        10
      ),
      nickname: "프리미엄유저",
      role: "user" as const,
      isEmailVerified: true,
      isActive: true,
    },
  ]

  const createdUsers = []
  for (const userData of testUsers) {
    const user = userRepository.create(userData)
    const savedUser = await userRepository.save(user)

    // 사용자 레벨 생성
    const userLevel = userLevelRepository.create({
      userId: savedUser.id,
      level: 1,
      currentExp: 0,
      totalExp: 0,
      seasonExp: 0,
      totalLevelUps: 0,
      currentSeason: 1,
      seasonStartDate: new Date(),
    })
    await userLevelRepository.save(userLevel)

    createdUsers.push(savedUser)
  }

  return createdUsers
}

async function createTestGyms() {
  const gymRepository = AppDataSource.getRepository(Gym)

  const testGyms = [
    {
      name: "강남 피트니스",
      address: "서울특별시 강남구 테헤란로 123",
      phone: "02-1234-5678",
      latitude: 37.5665,
      longitude: 126.978,
      facilities: "헬스장,수영장,사우나",
      openHour: "06:00-24:00",
      is24Hours: true,
      hasGX: true,
      hasPT: true,
      hasGroupPT: true,
      hasParking: true,
      hasShower: true,
    },
    {
      name: "홍대 피트니스",
      address: "서울특별시 마포구 홍대로 456",
      phone: "02-2345-6789",
      latitude: 37.5575,
      longitude: 126.925,
      facilities: "헬스장,요가룸,필라테스",
      openHour: "06:00-24:00",
      is24Hours: true,
      hasGX: true,
      hasPT: false,
      hasGroupPT: true,
      hasParking: false,
      hasShower: true,
    },
    {
      name: "잠실 피트니스",
      address: "서울특별시 송파구 올림픽로 789",
      phone: "02-3456-7890",
      latitude: 37.5139,
      longitude: 127.1006,
      facilities: "헬스장,수영장,테니스장,골프연습장",
      openHour: "05:00-24:00",
      is24Hours: true,
      hasGX: true,
      hasPT: true,
      hasGroupPT: true,
      hasParking: true,
      hasShower: true,
    },
  ]

  const createdGyms = []
  for (const gymData of testGyms) {
    const gym = gymRepository.create(gymData)
    const savedGym = await gymRepository.save(gym)
    createdGyms.push(savedGym)
  }

  return createdGyms
}

async function createTestMachines() {
  const machineRepository = AppDataSource.getRepository(Machine)

  const machineTypes = [
    {
      machine_key: "bench_press",
      name_ko: "벤치프레스",
      name_en: "Bench Press",
      image_url: "/img/machine/chest-press.png",
      short_desc: "가슴 근육을 발달시키는 기본 운동 기구",
      detail_desc:
        "벤치프레스는 가슴 근육을 발달시키는 가장 효과적인 운동 중 하나입니다. 벤치에 누워 바를 어깨 너비로 잡고, 바를 가슴까지 내렸다가 올리는 동작을 반복합니다.",
      positive_effect: "가슴 근육 발달, 삼두근 강화, 어깨 안정성 향상",
      category: "상체" as const,
      target_muscle: ["가슴", "삼두근", "어깨"],
      difficulty_level: "초급" as const,
    },
    {
      machine_key: "squat_rack",
      name_ko: "스쿼트랙",
      name_en: "Squat Rack",
      image_url: "/img/machine/squat-rack.png",
      short_desc: "하체 근육을 발달시키는 복합 운동 기구",
      detail_desc:
        "스쿼트랙은 하체 근육을 발달시키는 복합 운동 기구입니다. 바를 어깨에 올리고 무릎을 구부려 앉았다가 일어나는 동작을 반복합니다.",
      positive_effect: "하체 근육 발달, 코어 강화, 전신 밸런스 향상",
      category: "하체" as const,
      target_muscle: ["대퇴사두근", "둔근", "햄스트링"],
      difficulty_level: "중급" as const,
    },
    {
      machine_key: "lat_pulldown",
      name_ko: "랫풀다운",
      name_en: "Lat Pulldown",
      image_url: "/img/machine/lat-pulldown.png",
      short_desc: "등 근육을 발달시키는 상체 운동 기구",
      detail_desc:
        "랫풀다운은 등 근육을 발달시키는 상체 운동 기구입니다. 바를 어깨 너비로 잡고 바를 가슴까지 당기는 동작을 반복합니다.",
      positive_effect: "등 근육 발달, 자세 개선, 어깨 안정성 향상",
      category: "상체" as const,
      target_muscle: ["광배근", "승모근", "이두근"],
      difficulty_level: "초급" as const,
    },
    {
      machine_key: "leg_press",
      name_ko: "레그프레스",
      name_en: "Leg Press",
      image_url: "/img/machine/leg-press.png",
      short_desc: "하체 근육을 발달시키는 기계식 운동 기구",
      detail_desc:
        "레그프레스는 하체 근육을 발달시키는 기계식 운동 기구입니다. 발을 플랫폼에 올리고 무릎을 구부렸다가 펴는 동작을 반복합니다.",
      positive_effect: "하체 근육 발달, 무릎 안정성 향상, 하체 힘 증가",
      category: "하체" as const,
      target_muscle: ["대퇴사두근", "둔근"],
      difficulty_level: "초급" as const,
    },
    {
      machine_key: "dumbbell",
      name_ko: "덤벨",
      name_en: "Dumbbell",
      image_url: "/img/machine/default.png",
      short_desc: "자유 중량 운동을 위한 기본 도구",
      detail_desc:
        "덤벨은 다양한 운동에 활용할 수 있는 자유 중량 도구입니다. 전신 운동에 활용할 수 있으며, 근육의 균형을 발달시킵니다.",
      positive_effect: "전신 근육 발달, 균형감각 향상, 기능적 움직임 개선",
      category: "전신" as const,
      target_muscle: ["전신"],
      difficulty_level: "초급" as const,
    },
  ]

  const createdMachines = []
  for (const machineData of machineTypes) {
    const machine = machineRepository.create(machineData)
    const savedMachine = await machineRepository.save(machine)
    createdMachines.push(savedMachine)
  }

  return createdMachines
}

async function createTestWorkoutPlans(users: any[], machines: any[]) {
  const planRepository = AppDataSource.getRepository(WorkoutPlan)
  const exerciseRepository = AppDataSource.getRepository(WorkoutPlanExercise)

  const workoutPlans = [
    {
      plan_name: "초보자 전체 운동",
      description: "운동을 처음 시작하는 분들을 위한 기본 운동 루틴",
      difficulty: "beginner" as const,
      estimated_duration_minutes: 60,
      target_muscle_groups: ["전신"],
      is_template: true,
      is_public: true,
    },
    {
      plan_name: "중급자 상체 집중",
      description: "상체 근육을 집중적으로 발달시키는 루틴",
      difficulty: "intermediate" as const,
      estimated_duration_minutes: 75,
      target_muscle_groups: ["가슴", "등", "어깨", "팔"],
      is_template: true,
      is_public: true,
    },
    {
      plan_name: "고급자 하체 집중",
      description: "하체 근육을 집중적으로 발달시키는 고강도 루틴",
      difficulty: "advanced" as const,
      estimated_duration_minutes: 90,
      target_muscle_groups: ["대퇴사두근", "둔근", "햄스트링"],
      is_template: true,
      is_public: true,
    },
  ]

  for (const user of users) {
    for (const planData of workoutPlans) {
      const plan = planRepository.create({
        ...planData,
        userId: user.id,
      })
      const savedPlan = await planRepository.save(plan)

      // 운동 계획에 운동 추가
      const exercises = [
        {
          machineId: machines[0].id,
          sets: 3,
          repsRange: { min: 8, max: 12 },
          restSeconds: 60,
        },
        {
          machineId: machines[1].id,
          sets: 3,
          repsRange: { min: 10, max: 15 },
          restSeconds: 90,
        },
        {
          machineId: machines[2].id,
          sets: 3,
          repsRange: { min: 8, max: 12 },
          restSeconds: 60,
        },
      ]

      for (const exerciseData of exercises) {
        const exercise = exerciseRepository.create({
          ...exerciseData,
          planId: savedPlan.id,
          exerciseOrder: exercises.indexOf(exerciseData) + 1,
        })
        await exerciseRepository.save(exercise)
      }
    }
  }
}

async function initializeLevelSystem(users: any[]) {
  const expHistoryRepository = AppDataSource.getRepository(ExpHistory)

  // 초기 경험치 히스토리 생성
  for (const user of users) {
    const initialExp = expHistoryRepository.create({
      userId: user.id,
      actionType: "daily_login",
      expGained: 5,
      source: "초기 가입 보너스",
      metadata: { type: "welcome_bonus" },
    })
    await expHistoryRepository.save(initialExp)
  }
}

async function createRewardsAndMilestones(users: any[]) {
  const rewardRepository = AppDataSource.getRepository(UserReward)
  const milestoneRepository = AppDataSource.getRepository(Milestone)

  for (const user of users) {
    // 초기 보상 생성
    const welcomeReward = rewardRepository.create({
      userId: user.id,
      rewardType: "badge",
      rewardId: "welcome_badge",
      rewardName: "환영 배지",
      rewardDescription: "서비스에 가입한 것을 축하합니다!",
      isClaimed: true,
      claimedAt: new Date(),
    })
    await rewardRepository.save(welcomeReward)

    // 초기 마일스톤 생성
    const firstWorkoutMilestone = milestoneRepository.create({
      userId: user.id,
      milestoneType: "workout_count",
      milestoneName: "첫 번째 운동",
      milestoneDescription: "첫 번째 운동을 완료하세요",
      targetValue: 1,
      currentValue: 0,
      achieved: false,
    })
    await milestoneRepository.save(firstWorkoutMilestone)
  }
}

async function initializeStreaks(users: any[]) {
  const streakRepository = AppDataSource.getRepository(UserStreak)

  for (const user of users) {
    // 로그인 스트릭 초기화
    const loginStreak = streakRepository.create({
      userId: user.id,
      streakType: "login",
      currentCount: 1,
      maxCount: 1,
      lastActivity: new Date(),
      streakStartDate: new Date(),
      isActive: true,
    })
    await streakRepository.save(loginStreak)

    // 운동 스트릭 초기화
    const workoutStreak = streakRepository.create({
      userId: user.id,
      streakType: "workout",
      currentCount: 0,
      maxCount: 0,
      lastActivity: new Date(),
      isActive: false,
    })
    await streakRepository.save(workoutStreak)
  }
}

// 스크립트 실행
if (require.main === module) {
  seedInitialData()
    .then(() => {
      console.log("🎉 Seeding completed!")
      process.exit(0)
    })
    .catch(error => {
      console.error("💥 Seeding failed:", error)
      process.exit(1)
    })
}

export { seedInitialData }
