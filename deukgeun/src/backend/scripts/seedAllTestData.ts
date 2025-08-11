import { createConnection } from "typeorm"
import { User } from "../entities/User"
import { Gym } from "../entities/Gym"
import { Machine } from "../entities/Machine"
import { Post } from "../entities/Post"
import { Comment } from "../entities/Comment"
import { PostLike } from "../entities/Like"
import { UserLevel } from "../entities/UserLevel"
import { ExpHistory } from "../entities/ExpHistory"
import { UserReward } from "../entities/UserReward"
import { Milestone } from "../entities/Milestone"
import { UserStreak } from "../entities/UserStreak"
import { WorkoutSession } from "../entities/WorkoutSession"
import { ExerciseSet } from "../entities/ExerciseSet"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutPlanExercise } from "../entities/WorkoutPlanExercise"
import { WorkoutStats } from "../entities/WorkoutStats"
import { WorkoutProgress } from "../entities/WorkoutProgress"
import { WorkoutReminder } from "../entities/WorkoutReminder"
import { config } from "../config/env"
import bcrypt from "bcrypt"

// 샘플 사용자 데이터
const sampleUsers = [
  {
    email: "admin@test.com",
    password: "admin123!",
    nickname: "관리자",
    phone: "010-1234-5678",
    gender: "male" as const,
    birthday: new Date("1990-01-01"),
    profileImage: "https://via.placeholder.com/150",
    role: "admin" as const,
  },
  {
    email: "user1@test.com",
    password: "user123!",
    nickname: "운동맨",
    phone: "010-2345-6789",
    gender: "male" as const,
    birthday: new Date("1995-05-15"),
    profileImage: "https://via.placeholder.com/150",
    role: "user" as const,
  },
  {
    email: "user2@test.com",
    password: "user123!",
    nickname: "피트니스여신",
    phone: "010-3456-7890",
    gender: "female" as const,
    birthday: new Date("1992-08-20"),
    profileImage: "https://via.placeholder.com/150",
    role: "user" as const,
  },
  {
    email: "user3@test.com",
    password: "user123!",
    nickname: "헬스초보",
    phone: "010-4567-8901",
    gender: "male" as const,
    birthday: new Date("1998-12-10"),
    profileImage: "https://via.placeholder.com/150",
    role: "user" as const,
  },
]

// 샘플 헬스장 데이터
const sampleGyms = [
  {
    name: "강남 피트니스 센터",
    address: "서울특별시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    latitude: 37.5665,
    longitude: 126.978,
    facilities: "24시간 운영, 주차장, 샤워시설, PT, GX",
    openHour: "24시간",
    is24Hours: true,
    hasGX: true,
    hasPT: true,
    hasGroupPT: true,
    hasParking: true,
    hasShower: true,
  },
  {
    name: "홍대 헬스장",
    address: "서울특별시 마포구 홍대로 456",
    phone: "02-2345-6789",
    latitude: 37.5575,
    longitude: 126.925,
    facilities: "샤워시설, PT",
    openHour: "06:00-24:00",
    is24Hours: false,
    hasGX: false,
    hasPT: true,
    hasGroupPT: false,
    hasParking: false,
    hasShower: true,
  },
  {
    name: "잠실 스포츠센터",
    address: "서울특별시 송파구 올림픽로 789",
    phone: "02-3456-7890",
    latitude: 37.5139,
    longitude: 127.1006,
    facilities: "24시간 운영, 주차장, 샤워시설, PT, GX, 수영장",
    openHour: "24시간",
    is24Hours: true,
    hasGX: true,
    hasPT: true,
    hasGroupPT: true,
    hasParking: true,
    hasShower: true,
  },
  {
    name: "건대 피트니스",
    address: "서울특별시 광진구 능동로 123",
    phone: "02-4567-8901",
    latitude: 37.5407,
    longitude: 127.0828,
    facilities: "샤워시설, PT, GX",
    openHour: "06:00-24:00",
    is24Hours: false,
    hasGX: true,
    hasPT: true,
    hasGroupPT: false,
    hasParking: true,
    hasShower: true,
  },
  {
    name: "신촌 헬스클럽",
    address: "서울특별시 서대문구 신촌로 456",
    phone: "02-5678-9012",
    latitude: 37.5552,
    longitude: 126.9368,
    facilities: "샤워시설, PT",
    openHour: "07:00-23:00",
    is24Hours: false,
    hasGX: false,
    hasPT: true,
    hasGroupPT: false,
    hasParking: false,
    hasShower: true,
  },
]

// 샘플 운동 기구 데이터
const sampleMachines = [
  {
    machine_key: "chin_up_dip_station_001",
    name_ko: "친업 앤 딥 스테이션",
    name_en: "Chin-up and Dip Station",
    image_url: "/img/machine/chin-up-and-dip-station.png",
    short_desc: "상체 근력을 종합적으로 발달시키는 기구입니다.",
    detail_desc: "친업과 딥스 운동을 할 수 있는 복합 운동 기구로, 가슴, 등, 삼두근 등 상체 전반의 근력을 발달시키는데 매우 효과적입니다.",
    category: "상체" as const,
    difficulty_level: "중급" as const,
    target_muscle: ["광배근", "대흉근", "삼두근", "이두근"],
    positive_effect: "상체 근력 향상, 코어 강화, 전반적인 근지구력 향상",
    video_url: "https://example.com/videos/chin_up_dip.mp4",
  },
  {
    machine_key: "chest_press_001",
    name_ko: "체스트 프레스",
    name_en: "Chest Press",
    image_url: "/img/machine/chest-press.png",
    short_desc: "가슴 근육을 강화하는 대표적인 운동 기구입니다.",
    detail_desc: "체스트 프레스는 가슴 근육(대흉근)을 주로 발달시키는 운동 기구입니다. 앉아서 하는 운동으로 안정적이고 효과적인 가슴 운동을 할 수 있습니다.",
    category: "상체" as const,
    difficulty_level: "초급" as const,
    target_muscle: ["대흉근", "삼두근", "삼각근"],
    positive_effect: "가슴 근육 발달, 상체 근력 향상, 자세 개선",
    video_url: "https://example.com/videos/chest_press.mp4",
  },
  {
    machine_key: "lat_pulldown_001",
    name_ko: "랫 풀다운",
    name_en: "Lat Pulldown",
    image_url: "/img/machine/lat-pulldown.png",
    short_desc: "등 근육을 발달시키는 효과적인 운동 기구입니다.",
    detail_desc: "랫 풀다운은 광배근을 주로 발달시키는 운동 기구입니다. 넓은 등 근육을 만드는 데 매우 효과적이며, 자세 개선에도 도움이 됩니다.",
    category: "상체" as const,
    difficulty_level: "중급" as const,
    target_muscle: ["광배근", "승모근", "이두근"],
    positive_effect: "등 근육 발달, 자세 개선, 상체 근력 향상",
    video_url: "https://example.com/videos/lat_pulldown.mp4",
  },
  {
    machine_key: "leg_press_001",
    name_ko: "레그 프레스",
    name_en: "Leg Press",
    image_url: "/img/machine/leg-press.png",
    short_desc: "하체 근력을 발달시키는 대표적인 운동 기구입니다.",
    detail_desc: "레그 프레스는 하체 근육을 종합적으로 발달시키는 운동 기구입니다. 무릎 관절에 부담을 줄이면서도 효과적인 하체 운동을 할 수 있습니다.",
    category: "하체" as const,
    difficulty_level: "초급" as const,
    target_muscle: ["대퇴사두근", "햄스트링", "둔근"],
    positive_effect: "하체 근력 향상, 체력 증진, 기초 대사량 증가",
    video_url: "https://example.com/videos/leg_press.mp4",
  },
  {
    machine_key: "shoulder_press_001",
    name_ko: "숄더 프레스",
    name_en: "Shoulder Press",
    image_url: "/img/machine/shoulder-press.png",
    short_desc: "어깨 근육을 발달시키는 효과적인 운동 기구입니다.",
    detail_desc: "숄더 프레스는 어깨 근육(삼각근)을 발달시키는 운동 기구입니다. 상체의 균형 잡힌 발달을 위해 중요한 운동입니다.",
    category: "상체" as const,
    difficulty_level: "중급" as const,
    target_muscle: ["삼각근", "삼두근", "승모근"],
    positive_effect: "어깨 근육 발달, 상체 균형 개선, 자세 교정",
    video_url: "https://example.com/videos/shoulder_press.mp4",
  },
  {
    machine_key: "squat_rack_001",
    name_ko: "스쿼트 랙",
    name_en: "Squat Rack",
    image_url: "/img/machine/squat-rack.png",
    short_desc: "전신 근력을 발달시키는 기본 운동 기구입니다.",
    detail_desc: "스쿼트 랙은 스쿼트 운동을 위한 기구로, 전신 근력을 발달시키는 가장 효과적인 운동 중 하나입니다.",
    category: "전신" as const,
    difficulty_level: "고급" as const,
    target_muscle: ["대퇴사두근", "햄스트링", "둔근", "복근", "척추기립근"],
    positive_effect: "전신 근력 향상, 체력 증진, 기초 대사량 증가",
    video_url: "https://example.com/videos/squat.mp4",
  },
  {
    machine_key: "treadmill_001",
    name_ko: "러닝머신",
    name_en: "Treadmill",
    image_url: "/img/machine/treadmill-running.gif",
    short_desc: "유산소 운동을 위한 기본적인 운동 기구입니다.",
    detail_desc: "러닝머신은 실내에서 달리기 운동을 할 수 있는 기구로, 심폐 지구력 향상과 체지방 감소에 효과적입니다.",
    category: "전신" as const,
    difficulty_level: "초급" as const,
    target_muscle: ["대퇴사두근", "비복근", "둔근"],
    positive_effect: "심폐 지구력 향상, 체지방 감소, 스트레스 해소",
    video_url: "https://example.com/videos/treadmill.mp4",
  },
  {
    machine_key: "bicep_curl_001",
    name_ko: "바이셉 컬",
    name_en: "Bicep Curl",
    image_url: "/img/machine/bicep-curl.png",
    short_desc: "이두근을 발달시키는 기본적인 운동 기구입니다.",
    detail_desc: "바이셉 컬은 이두근을 집중적으로 발달시키는 운동 기구입니다. 팔 근력을 강화하고 상체 균형을 개선하는데 도움이 됩니다.",
    category: "상체" as const,
    difficulty_level: "초급" as const,
    target_muscle: ["이두근", "전완근"],
    positive_effect: "이두근 발달, 팔 근력 향상, 상체 균형 개선",
    video_url: "https://example.com/videos/bicep_curl.mp4",
  },
  {
    machine_key: "leg_extension_001",
    name_ko: "레그 익스텐션",
    name_en: "Leg Extension",
    image_url: "/img/machine/leg-extension.png",
    short_desc: "대퇴사두근을 집중적으로 발달시키는 기구입니다.",
    detail_desc: "레그 익스텐션은 대퇴사두근을 집중적으로 발달시키는 운동 기구입니다. 무릎 관절의 안정성과 하체 근력을 향상시킵니다.",
    category: "하체" as const,
    difficulty_level: "초급" as const,
    target_muscle: ["대퇴사두근"],
    positive_effect: "대퇴사두근 발달, 무릎 관절 안정성 향상",
    video_url: "https://example.com/videos/leg_extension.mp4",
  },
]

// 샘플 포스트 데이터
const samplePosts = [
  {
    title: "초보자를 위한 운동 루틴 가이드",
    content: "헬스장에 처음 가는 분들을 위한 기본 운동 루틴을 소개합니다. 체스트 프레스, 레그 프레스, 랫 풀다운으로 시작하세요!",
    author: "운동맨",
    category: "운동루틴" as const,
    tags: ["초보자", "루틴", "가이드"],
    thumbnail_url: "https://via.placeholder.com/300x200",
    like_count: 15,
    comment_count: 8,
  },
  {
    title: "가슴 운동의 모든 것",
    content: "체스트 프레스, 벤치프레스, 딥스 등 가슴 운동의 종류와 효과적인 방법을 자세히 설명합니다.",
    author: "피트니스여신",
    category: "기구가이드" as const,
    tags: ["가슴", "체스트", "운동법"],
    thumbnail_url: "https://via.placeholder.com/300x200",
    like_count: 23,
    comment_count: 12,
  },
  {
    title: "다이어트 성공 팁 10가지",
    content: "운동과 식단을 병행한 다이어트 성공 경험을 공유합니다. 꾸준함이 가장 중요한 비결입니다.",
    author: "헬스초보",
    category: "다이어트" as const,
    tags: ["다이어트", "팁", "성공"],
    thumbnail_url: "https://via.placeholder.com/300x200",
    like_count: 45,
    comment_count: 20,
  },
  {
    title: "등 운동의 중요성",
    content: "등 근육을 강화하면 자세가 좋아지고 전반적인 건강에 도움이 됩니다. 랫 풀다운과 친업 운동을 추천합니다.",
    author: "운동맨",
    category: "팁" as const,
    tags: ["등", "자세", "건강"],
    thumbnail_url: "https://via.placeholder.com/300x200",
    like_count: 18,
    comment_count: 6,
  },
  {
    title: "하체 운동의 효과",
    content: "하체는 전신의 기초가 되는 중요한 부위입니다. 스쿼트와 레그 프레스로 강한 하체를 만들어보세요.",
    author: "피트니스여신",
    category: "운동루틴" as const,
    tags: ["하체", "스쿼트", "근력"],
    thumbnail_url: "https://via.placeholder.com/300x200",
    like_count: 32,
    comment_count: 15,
  },
]

// 샘플 댓글 데이터
const sampleComments = [
  "정말 도움이 되는 글이네요!",
  "저도 이 루틴으로 시작해보겠습니다.",
  "추가로 궁금한 점이 있어요.",
  "실제로 효과가 있었나요?",
  "다음 글도 기대하겠습니다!",
]

async function seedAllTestData() {
  let connection
  try {
    console.log("🚀 전체 테스트 데이터 생성 시작...")

    // 데이터베이스 연결
    connection = await createConnection({
      type: "mysql",
      host: config.DB_HOST,
      port: config.DB_PORT,
      username: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      synchronize: false,
      logging: false,
      entities: [
        User, Gym, Machine, Post, Comment, PostLike, UserLevel, ExpHistory,
        UserReward, Milestone, UserStreak, WorkoutSession, ExerciseSet,
        WorkoutGoal, WorkoutPlan, WorkoutPlanExercise, WorkoutStats,
        WorkoutProgress, WorkoutReminder
      ],
    })

    console.log("✅ 데이터베이스 연결 성공")

    // 1. 사용자 생성
    console.log("\n👥 사용자 데이터 생성 중...")
    const userRepository = connection.getRepository(User)
    const createdUsers = []

    for (const userData of sampleUsers) {
      try {
        // 기존 사용자 확인
        const existingUser = await userRepository.findOne({
          where: { email: userData.email }
        })
        
        if (existingUser) {
          createdUsers.push(existingUser)
          console.log(`ℹ️ 사용자 이미 존재: ${existingUser.nickname} (${existingUser.email})`)
        } else {
          const hashedPassword = await bcrypt.hash(userData.password, 10)
          const user = userRepository.create({
            ...userData,
            password: hashedPassword,
          })
          const savedUser = await userRepository.save(user)
          createdUsers.push(savedUser)
          console.log(`✅ 사용자 생성: ${savedUser.nickname} (${savedUser.email})`)
        }
      } catch (error) {
        console.log(`⚠️ 사용자 생성 중 오류: ${userData.email}`, error.message)
        // 기존 사용자 조회 시도
        const existingUser = await userRepository.findOne({
          where: { email: userData.email }
        })
        if (existingUser) {
          createdUsers.push(existingUser)
        }
      }
    }

    // 2. 헬스장 데이터 생성
    console.log("\n🏋️ 헬스장 데이터 생성 중...")
    const gymRepository = connection.getRepository(Gym)
    const createdGyms = []

    for (const gymData of sampleGyms) {
      try {
        // 기존 헬스장 확인
        const existingGym = await gymRepository.findOne({
          where: { name: gymData.name, address: gymData.address }
        })
        
        if (existingGym) {
          createdGyms.push(existingGym)
          console.log(`ℹ️ 헬스장 이미 존재: ${existingGym.name}`)
        } else {
          const gym = gymRepository.create(gymData)
          const savedGym = await gymRepository.save(gym)
          createdGyms.push(savedGym)
          console.log(`✅ 헬스장 생성: ${savedGym.name}`)
        }
      } catch (error) {
        console.log(`⚠️ 헬스장 생성 중 오류: ${gymData.name}`, error.message)
        // 기존 헬스장 조회 시도
        const existingGym = await gymRepository.findOne({
          where: { name: gymData.name, address: gymData.address }
        })
        if (existingGym) {
          createdGyms.push(existingGym)
        }
      }
    }

    // 3. 운동 기구 데이터 생성
    console.log("\n💪 운동 기구 데이터 생성 중...")
    const machineRepository = connection.getRepository(Machine)
    const createdMachines = []

    for (const machineData of sampleMachines) {
      try {
        // 기존 데이터 확인
        const existingMachine = await machineRepository.findOne({
          where: { machine_key: machineData.machine_key }
        })
        
        if (existingMachine) {
          createdMachines.push(existingMachine)
          console.log(`ℹ️ 기구 이미 존재: ${existingMachine.name_ko}`)
        } else {
          const machine = machineRepository.create(machineData)
          const savedMachine = await machineRepository.save(machine)
          createdMachines.push(savedMachine)
          console.log(`✅ 기구 생성: ${savedMachine.name_ko}`)
        }
      } catch (error) {
        console.log(`⚠️ 기구 생성 중 오류: ${machineData.name_ko}`, error.message)
        // 기존 데이터 조회 시도
        const existingMachine = await machineRepository.findOne({
          where: { machine_key: machineData.machine_key }
        })
        if (existingMachine) {
          createdMachines.push(existingMachine)
        }
      }
    }

    // 4. 포스트 데이터 생성
    console.log("\n📝 포스트 데이터 생성 중...")
    const postRepository = connection.getRepository(Post)
    const createdPosts = []

    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i]
      const user = createdUsers[i % createdUsers.length]
      
      const post = postRepository.create({
        ...postData,
        userId: user.id,
      })
      const savedPost = await postRepository.save(post)
      createdPosts.push(savedPost)
      console.log(`✅ 포스트 생성: ${savedPost.title}`)
    }

    // 5. 댓글 데이터 생성
    console.log("\n💬 댓글 데이터 생성 중...")
    const commentRepository = connection.getRepository(Comment)

    for (let i = 0; i < createdPosts.length; i++) {
      const post = createdPosts[i]
      const user = createdUsers[i % createdUsers.length]
      
      for (let j = 0; j < 3; j++) {
        const comment = commentRepository.create({
          content: sampleComments[j % sampleComments.length],
          userId: user.id,
          postId: post.id,
          author: user.nickname,
        })
        await commentRepository.save(comment)
      }
      console.log(`✅ 포스트 "${post.title}"에 댓글 3개 생성`)
    }

    // 6. 좋아요 데이터 생성
    console.log("\n❤️ 좋아요 데이터 생성 중...")
    const likeRepository = connection.getRepository(PostLike)

    for (const post of createdPosts) {
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const user = createdUsers[i % createdUsers.length]
        const like = likeRepository.create({
          userId: user.id,
          postId: post.id,
        })
        await likeRepository.save(like)
      }
    }
    console.log("✅ 좋아요 데이터 생성 완료")

    // 7. 사용자 레벨 데이터 생성
    console.log("\n📊 사용자 레벨 데이터 생성 중...")
    const userLevelRepository = connection.getRepository(UserLevel)

    for (const user of createdUsers) {
      const level = userLevelRepository.create({
        userId: user.id,
        level: Math.floor(Math.random() * 10) + 1,
        currentExp: Math.floor(Math.random() * 1000),
        totalExp: Math.floor(Math.random() * 5000) + 1000,
        seasonExp: Math.floor(Math.random() * 500),
      })
      await userLevelRepository.save(level)
      console.log(`✅ 사용자 레벨 생성: ${user.nickname} (레벨 ${level.level})`)
    }

    // 8. 경험치 히스토리 생성
    console.log("\n📈 경험치 히스토리 생성 중...")
    const expHistoryRepository = connection.getRepository(ExpHistory)

    for (const user of createdUsers) {
      for (let i = 0; i < 5; i++) {
        const expHistory = expHistoryRepository.create({
          userId: user.id,
          actionType: ["workout", "post", "comment", "like"][Math.floor(Math.random() * 4)],
          expGained: Math.floor(Math.random() * 100) + 10,
          source: "테스트 경험치 획득",
        })
        await expHistoryRepository.save(expHistory)
      }
    }
    console.log("✅ 경험치 히스토리 생성 완료")

    // 9. 운동 계획 생성
    console.log("\n📋 운동 계획 생성 중...")
    const workoutPlanRepository = connection.getRepository(WorkoutPlan)
    const createdPlans = []

    for (const user of createdUsers) {
      const plan = workoutPlanRepository.create({
        user_id: user.id,
        name: `${user.nickname}의 운동 계획`,
        description: "개인 맞춤 운동 계획",
        difficulty_level: "beginner" as const,
        estimated_duration_minutes: 60,
        target_muscle_groups: ["chest", "back", "legs"],
        is_template: false,
        is_public: false,
      })
      const savedPlan = await workoutPlanRepository.save(plan)
      createdPlans.push(savedPlan)
      console.log(`✅ 운동 계획 생성: ${savedPlan.name}`)
    }

    // 10. 운동 목표 생성
    console.log("\n🎯 운동 목표 생성 중...")
    const workoutGoalRepository = connection.getRepository(WorkoutGoal)

    for (const user of createdUsers) {
      const goal = workoutGoalRepository.create({
        user_id: user.id,
        goal_type: "strength" as const,
        target_value: 100,
        current_value: Math.floor(Math.random() * 80) + 20,
        unit: "kg",
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        start_date: new Date(),
        status: "active" as const,
        progress_percentage: Math.floor(Math.random() * 80) + 20,
      })
      await workoutGoalRepository.save(goal)
      console.log(`✅ 운동 목표 생성: ${user.nickname}`)
    }

    // 11. 운동 세션 생성
    console.log("\n🏃 운동 세션 생성 중...")
    const workoutSessionRepository = connection.getRepository(WorkoutSession)
    const exerciseSetRepository = connection.getRepository(ExerciseSet)

    for (const user of createdUsers) {
      for (let i = 0; i < 3; i++) {
        const sessionDate = new Date()
        sessionDate.setDate(sessionDate.getDate() - i * 2)
        
        const session = workoutSessionRepository.create({
          user_id: user.id,
          plan_id: createdPlans[0]?.plan_id,
          gym_id: createdGyms[0]?.id,
          session_name: `${user.nickname}의 운동 세션 ${i + 1}`,
          start_time: new Date(sessionDate.getTime() + 9 * 60 * 60 * 1000),
          end_time: new Date(sessionDate.getTime() + 10 * 60 * 60 * 1000),
          total_duration_minutes: 60,
          mood_rating: Math.floor(Math.random() * 3) + 3,
          energy_level: Math.floor(Math.random() * 3) + 3,
          notes: "좋은 운동이었다!",
          status: "completed" as const,
        })
        const savedSession = await workoutSessionRepository.save(session)
        
        // 운동 세트 생성
        for (let j = 0; j < 3; j++) {
          const machine = createdMachines[j % createdMachines.length]
          const exerciseSet = exerciseSetRepository.create({
            session_id: savedSession.session_id,
            machine_id: machine.id,
            set_number: j + 1,
            reps_completed: Math.floor(Math.random() * 5) + 8,
            weight_kg: Math.floor(Math.random() * 20) + 30,
            rpe_rating: Math.floor(Math.random() * 3) + 7,
            notes: `${j + 1}세트 완료`,
          })
          await exerciseSetRepository.save(exerciseSet)
        }
        console.log(`✅ 운동 세션 생성: ${savedSession.session_name}`)
      }
    }

    // 12. 운동 통계 생성
    console.log("\n📊 운동 통계 생성 중...")
    const workoutStatsRepository = connection.getRepository(WorkoutStats)

    for (const user of createdUsers) {
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        const stats = workoutStatsRepository.create({
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
        })
        await workoutStatsRepository.save(stats)
      }
    }
    console.log("✅ 운동 통계 생성 완료")

    // 13. 운동 진행 상황 생성
    console.log("\n📈 운동 진행 상황 생성 중...")
    const workoutProgressRepository = connection.getRepository(WorkoutProgress)

    for (const user of createdUsers) {
      for (let i = 0; i < 5; i++) {
        const machine = createdMachines[i % createdMachines.length]
        const date = new Date()
        date.setDate(date.getDate() - i * 3)
        
        const progress = workoutProgressRepository.create({
          user_id: user.id,
          machine_id: machine.id,
          progress_date: date,
          set_number: 1,
          reps_completed: Math.floor(Math.random() * 5) + 8,
          weight_kg: Math.floor(Math.random() * 20) + 30 + i * 2,
          rpe_rating: Math.floor(Math.random() * 3) + 7,
          notes: "진행 상황 기록",
          is_personal_best: i === 0,
          improvement_percentage: i * 5,
        })
        await workoutProgressRepository.save(progress)
      }
    }
    console.log("✅ 운동 진행 상황 생성 완료")

    // 14. 운동 알림 생성
    console.log("\n⏰ 운동 알림 생성 중...")
    const workoutReminderRepository = connection.getRepository(WorkoutReminder)

    for (const user of createdUsers) {
      const reminder = workoutReminderRepository.create({
        user_id: user.id,
        title: "운동 알림",
        description: "오늘도 운동하세요! 💪",
        reminder_time: "09:00",
        repeat_days: [1, 3, 5], // 월, 수, 금
        is_active: true,
        notification_type: "push" as const,
      })
      await workoutReminderRepository.save(reminder)
      console.log(`✅ 운동 알림 생성: ${user.nickname}`)
    }

    // 15. 사용자 스트릭 생성
    console.log("\n🔥 사용자 스트릭 생성 중...")
    const userStreakRepository = connection.getRepository(UserStreak)

    for (const user of createdUsers) {
      const streak = userStreakRepository.create({
        userId: user.id,
        streakType: "workout",
        currentCount: Math.floor(Math.random() * 10) + 1,
        lastActivity: new Date(),
      })
      await userStreakRepository.save(streak)
      console.log(`✅ 사용자 스트릭 생성: ${user.nickname} (현재 ${streak.currentCount}일)`)
    }

    // 16. 마일스톤 생성
    console.log("\n🏆 마일스톤 생성 중...")
    const milestoneRepository = connection.getRepository(Milestone)

    // 각 사용자별로 마일스톤 생성
    for (const user of createdUsers) {
      const milestoneData = [
        { milestoneType: "first_workout", description: "첫 번째 운동 완료" },
        { milestoneType: "one_week_streak", description: "1주일 연속 운동" },
        { milestoneType: "first_post", description: "첫 번째 포스트 작성" },
        { milestoneType: "ten_workouts", description: "10회 운동 완료" },
      ]

      for (const data of milestoneData) {
        const milestone = milestoneRepository.create({
          userId: user.id,
          ...data,
          achieved: Math.random() > 0.5, // 50% 확률로 달성
          achievedAt: Math.random() > 0.5 ? new Date() : undefined,
        })
        await milestoneRepository.save(milestone)
        console.log(`✅ 마일스톤 생성: ${user.nickname} - ${data.milestoneType}`)
      }
    }

    // 17. 사용자 보상 생성
    console.log("\n🎁 사용자 보상 생성 중...")
    const userRewardRepository = connection.getRepository(UserReward)

    for (const user of createdUsers) {
      const reward = userRewardRepository.create({
        userId: user.id,
        rewardType: "badge",
        rewardId: "beginner_badge",
        claimedAt: new Date(),
      })
      await userRewardRepository.save(reward)
      console.log(`✅ 사용자 보상 생성: ${user.nickname}`)
    }

    console.log("\n🎉 전체 테스트 데이터 생성 완료!")
    console.log("\n📊 생성된 데이터 요약:")
    console.log(`   👥 사용자: ${createdUsers.length}명`)
    console.log(`   🏋️ 헬스장: ${createdGyms.length}개`)
    console.log(`   💪 운동 기구: ${createdMachines.length}개`)
    console.log(`   📝 포스트: ${createdPosts.length}개`)
    console.log(`   💬 댓글: ${createdPosts.length * 3}개`)
    console.log(`   ❤️ 좋아요: ${createdPosts.length}개`)
    console.log(`   📊 사용자 레벨: ${createdUsers.length}개`)
    console.log(`   📈 경험치 히스토리: ${createdUsers.length * 5}개`)
    console.log(`   📋 운동 계획: ${createdPlans.length}개`)
    console.log(`   🎯 운동 목표: ${createdUsers.length}개`)
    console.log(`   🏃 운동 세션: ${createdUsers.length * 3}개`)
    console.log(`   📊 운동 통계: ${createdUsers.length * 7}개`)
    console.log(`   📈 운동 진행 상황: ${createdUsers.length * 5}개`)
    console.log(`   ⏰ 운동 알림: ${createdUsers.length}개`)
    console.log(`   🔥 사용자 스트릭: ${createdUsers.length}개`)
    console.log(`   🏆 마일스톤: ${createdUsers.length * 4}개`)
    console.log(`   🎁 사용자 보상: ${createdUsers.length}개`)

    console.log("\n🔑 테스트 계정 정보:")
    console.log("   관리자: admin@test.com / admin123!")
    console.log("   일반 사용자: user1@test.com / user123!")
    console.log("   일반 사용자: user2@test.com / user123!")
    console.log("   일반 사용자: user3@test.com / user123!")

  } catch (error) {
    console.error("❌ 테스트 데이터 생성 실패:", error)
    throw error
  } finally {
    if (connection) {
      await connection.close()
      console.log("🔌 데이터베이스 연결 종료")
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  seedAllTestData()
    .then(() => {
      console.log("✅ 스크립트 실행 완료")
      process.exit(0)
    })
    .catch(error => {
      console.error("❌ 스크립트 실행 실패:", error)
      process.exit(1)
    })
}

export { seedAllTestData }
