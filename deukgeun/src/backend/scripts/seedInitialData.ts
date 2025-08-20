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
import { Post } from "../entities/Post"
import { Comment } from "../entities/Comment"
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

    // 커뮤니티 데이터 생성
    console.log("📝 Creating community posts...")
    await createCommunityPosts(testUsers)

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
      machineKey: "bench_press",
      name: "벤치프레스",
      nameKo: "벤치프레스",
      nameEn: "Bench Press",
      imageUrl: "/img/machine/chest-press.png",
      shortDesc: "가슴 근육을 발달시키는 기본 운동 기구",
      detailDesc:
        "벤치프레스는 가슴 근육을 발달시키는 가장 효과적인 운동 중 하나입니다. 벤치에 누워 바를 어깨 너비로 잡고, 바를 가슴까지 내렸다가 올리는 동작을 반복합니다.",
      positiveEffect: "가슴 근육 발달, 삼두근 강화, 어깨 안정성 향상",
      category: "strength" as const,
      targetMuscles: ["가슴", "삼두근", "어깨"],
      difficulty: "beginner" as const,
    },
    {
      machineKey: "squat_rack",
      name: "스쿼트랙",
      nameKo: "스쿼트랙",
      nameEn: "Squat Rack",
      imageUrl: "/img/machine/squat-rack.png",
      shortDesc: "하체 근육을 발달시키는 복합 운동 기구",
      detailDesc:
        "스쿼트랙은 하체 근육을 발달시키는 복합 운동 기구입니다. 바를 어깨에 올리고 무릎을 구부려 앉았다가 일어나는 동작을 반복합니다.",
      positiveEffect: "하체 근육 발달, 코어 강화, 전신 밸런스 향상",
      category: "strength" as const,
      targetMuscles: ["대퇴사두근", "둔근", "햄스트링"],
      difficulty: "intermediate" as const,
    },
    {
      machineKey: "lat_pulldown",
      name: "랫풀다운",
      nameKo: "랫풀다운",
      nameEn: "Lat Pulldown",
      imageUrl: "/img/machine/lat-pulldown.png",
      shortDesc: "등 근육을 발달시키는 상체 운동 기구",
      detailDesc:
        "랫풀다운은 등 근육을 발달시키는 상체 운동 기구입니다. 바를 어깨 너비로 잡고 바를 가슴까지 당기는 동작을 반복합니다.",
      positiveEffect: "등 근육 발달, 자세 개선, 어깨 안정성 향상",
      category: "strength" as const,
      targetMuscles: ["광배근", "승모근", "이두근"],
      difficulty: "beginner" as const,
    },
    {
      machineKey: "leg_press",
      name: "레그프레스",
      nameKo: "레그프레스",
      nameEn: "Leg Press",
      imageUrl: "/img/machine/leg-press.png",
      shortDesc: "하체 근육을 발달시키는 기계식 운동 기구",
      detailDesc:
        "레그프레스는 하체 근육을 발달시키는 기계식 운동 기구입니다. 발을 플랫폼에 올리고 무릎을 구부렸다가 펴는 동작을 반복합니다.",
      positiveEffect: "하체 근육 발달, 무릎 안정성 향상, 하체 힘 증가",
      category: "strength" as const,
      targetMuscles: ["대퇴사두근", "둔근"],
      difficulty: "beginner" as const,
    },
    {
      machineKey: "dumbbell",
      name: "덤벨",
      nameKo: "덤벨",
      nameEn: "Dumbbell",
      imageUrl: "/img/machine/default.png",
      shortDesc: "자유 중량 운동을 위한 기본 도구",
      detailDesc:
        "덤벨은 다양한 운동에 활용할 수 있는 자유 중량 도구입니다. 전신 운동에 활용할 수 있으며, 근육의 균형을 발달시킵니다.",
      positiveEffect: "전신 근육 발달, 균형감각 향상, 기능적 움직임 개선",
      category: "strength" as const,
      targetMuscles: ["전신"],
      difficulty: "beginner" as const,
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
      name: "초보자 전체 운동",
      description: "운동을 처음 시작하는 분들을 위한 기본 운동 루틴",
      difficulty: "beginner" as const,
      estimatedDurationMinutes: 60,
      targetMuscleGroups: ["전신"],
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "중급자 상체 집중",
      description: "상체 근육을 집중적으로 발달시키는 루틴",
      difficulty: "intermediate" as const,
      estimatedDurationMinutes: 75,
      targetMuscleGroups: ["가슴", "등", "어깨", "팔"],
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "고급자 하체 집중",
      description: "하체 근육을 집중적으로 발달시키는 고강도 루틴",
      difficulty: "advanced" as const,
      estimatedDurationMinutes: 90,
      targetMuscleGroups: ["대퇴사두근", "둔근", "햄스트링"],
      isTemplate: true,
      isPublic: true,
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
          exerciseName: "벤치프레스",
          sets: 3,
          repsRange: { min: 8, max: 12 },
          restSeconds: 60,
        },
        {
          machineId: machines[1].id,
          exerciseName: "스쿼트",
          sets: 3,
          repsRange: { min: 10, max: 15 },
          restSeconds: 90,
        },
        {
          machineId: machines[2].id,
          exerciseName: "랫풀다운",
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

async function createCommunityPosts(users: any[]) {
  const postRepository = AppDataSource.getRepository(Post)
  const commentRepository = AppDataSource.getRepository(Comment)

  const samplePosts = [
    {
      title: "헬스 초보자를 위한 첫 운동 루틴",
      content:
        "안녕하세요! 헬스를 처음 시작하는 분들을 위해 간단한 운동 루틴을 공유해드려요.\n\n1. 스쿼트 3세트 x 15회\n2. 푸시업 3세트 x 10회\n3. 플랭크 3세트 x 30초\n\n꾸준히 하는 것이 가장 중요해요!",
      category: "운동루틴",
      tags: ["초보자", "운동루틴", "기초"],
      author: users[1].nickname,
      userId: users[1].id,
    },
    {
      title: "단백질 섭취 시간 언제가 좋을까요?",
      content:
        "운동 후 30분 이내에 단백질을 섭취하는 것이 근육 합성에 가장 효과적이라고 들었는데, 정말인가요? 다른 분들은 언제 단백질을 드시는지 궁금해요.",
      category: "팁",
      tags: ["단백질", "영양", "운동후"],
      author: users[2].nickname,
      userId: users[2].id,
    },
    {
      title: "다이어트 중인데 치팅데이 어떻게 관리하시나요?",
      content:
        "다이어트를 시작한 지 한 달이 되었는데, 치팅데이를 어떻게 관리해야 할지 모르겠어요. 너무 엄격하게 하면 스트레스가 쌓이고, 너무 자주 하면 다이어트가 안 될 것 같고... 조언 부탁드려요!",
      category: "다이어트",
      tags: ["다이어트", "치팅데이", "스트레스"],
      author: users[3].nickname,
      userId: users[3].id,
    },
    {
      title: "벤치프레스 자세 교정 도움 요청",
      content:
        "벤치프레스를 할 때 어깨가 자꾸 앞으로 말리는 것 같아요. 정확한 자세를 알려주시면 감사하겠습니다. 무게는 60kg 정도 들고 있어요.",
      category: "기구가이드",
      tags: ["벤치프레스", "자세교정", "어깨"],
      author: users[1].nickname,
      userId: users[1].id,
    },
    {
      title: "헬스장 에티켓에 대해 알려주세요",
      content:
        "헬스장을 처음 가는데, 지켜야 할 에티켓이나 매너가 있나요? 다른 사람들에게 피해를 주지 않으려고 해요.",
      category: "기타",
      tags: ["헬스장", "에티켓", "매너"],
      author: users[2].nickname,
      userId: users[2].id,
    },
    {
      title: "홈트레이닝 vs 헬스장, 어떤 게 더 효과적일까요?",
      content:
        "집에서 운동하는 것과 헬스장에서 운동하는 것 중 어떤 게 더 효과적일까요? 각각의 장단점이 궁금해요. 현재 홈트를 하고 있는데 헬스장 등록을 고민 중입니다.",
      category: "팁",
      tags: ["홈트레이닝", "헬스장", "비교"],
      author: users[3].nickname,
      userId: users[3].id,
    },
    {
      title: "근력운동 후 유산소 vs 유산소 후 근력운동",
      content:
        "체중감량이 목표인데, 근력운동과 유산소 운동 순서를 어떻게 하는 게 좋을까요? 인터넷에서 찾아보니 의견이 다양해서 혼란스럽네요.",
      category: "운동루틴",
      tags: ["근력운동", "유산소", "체중감량"],
      author: users[1].nickname,
      userId: users[1].id,
    },
    {
      title: "간헐적 단식과 운동 병행 후기",
      content:
        "간헐적 단식을 시작한 지 2주가 되었어요. 16:8 방법으로 하고 있는데, 운동과 병행하니까 확실히 효과가 있는 것 같아요. 다만 운동 시간 조절이 조금 어렵네요. 다른 분들은 어떻게 하시는지 궁금해요.",
      category: "다이어트",
      tags: ["간헐적단식", "16:8", "운동병행"],
      author: users[2].nickname,
      userId: users[2].id,
    },
    {
      title: "스쿼트할 때 무릎이 아픈데 정상인가요?",
      content:
        "스쿼트를 할 때 무릎에서 약간의 통증이 느껴져요. 자세가 잘못된 건지, 아니면 근육이 적응하는 과정인지 궁금합니다. 계속 해도 괜찮을까요?",
      category: "기구가이드",
      tags: ["스쿼트", "무릎통증", "자세"],
      author: users[3].nickname,
      userId: users[3].id,
    },
    {
      title: "운동 일지 작성하시나요?",
      content:
        "운동할 때마다 일지를 작성하는 게 도움이 될까요? 어떤 내용을 기록하면 좋은지, 추천하는 앱이나 방법이 있으면 알려주세요!",
      category: "기타",
      tags: ["운동일지", "기록", "앱추천"],
      author: users[1].nickname,
      userId: users[1].id,
    },
  ]

  const createdPosts = []

  for (let i = 0; i < samplePosts.length; i++) {
    const postData = samplePosts[i]
    const postCreateDate = new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    )

    const post = postRepository.create({
      title: postData.title,
      content: postData.content,
      category: postData.category as
        | "운동루틴"
        | "팁"
        | "다이어트"
        | "기구가이드"
        | "기타",
      tags: postData.tags,
      author: postData.author,
      userId: postData.userId,
      like_count: Math.floor(Math.random() * 20), // 0-19 랜덤 좋아요
      comment_count: Math.floor(Math.random() * 10), // 0-9 랜덤 댓글 수
    })

    const savedPost = await postRepository.save(post)

    // createdAt 업데이트 (save 후에 수동으로 업데이트)
    await postRepository.update(savedPost.id, { createdAt: postCreateDate })

    createdPosts.push(savedPost)

    // 각 게시글에 댓글 추가 (1-3개)
    const commentCount = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < commentCount; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const comments = [
        "정말 도움이 되는 정보네요! 감사합니다.",
        "저도 비슷한 경험이 있어요. 공감합니다.",
        "좋은 팁 공유해주셔서 고마워요!",
        "따라해보겠습니다. 좋은 하루 되세요!",
        "질문이 있는데, 더 자세히 설명해주실 수 있나요?",
        "이런 정보를 찾고 있었는데 완벽해요!",
        "경험담 공유해주셔서 감사드려요.",
        "저도 시도해보고 후기 남기겠습니다!",
      ]

      const comment = commentRepository.create({
        postId: savedPost.id,
        userId: randomUser.id,
        author: randomUser.nickname,
        content: comments[Math.floor(Math.random() * comments.length)],
      })

      const savedComment = await commentRepository.save(comment)

      // 댓글 생성 시간 업데이트 (게시글 생성 시간 이후)
      const commentCreateDate = new Date(
        postCreateDate.getTime() + Math.random() * 24 * 60 * 60 * 1000
      )
      await commentRepository.update(savedComment.id, {
        createdAt: commentCreateDate,
      })
    }
  }

  console.log(`✅ Created ${createdPosts.length} community posts with comments`)
  return createdPosts
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
