import { AppDataSource } from '../config/database'
import { User } from '../entities/User'
import { Gym } from '../entities/Gym'
import { Post } from '../entities/Post'
import { Comment } from '../entities/Comment'
import { Like } from '../entities/Like'
import { UserLevel } from '../entities/UserLevel'
import { ExpHistory } from '../entities/ExpHistory'
import { UserReward } from '../entities/UserReward'
import { Milestone } from '../entities/Milestone'
import { UserStreak } from '../entities/UserStreak'
import { WorkoutSession } from '../entities/WorkoutSession'
import { ExerciseSet } from '../entities/ExerciseSet'
import { WorkoutGoal } from '../entities/WorkoutGoal'
import { WorkoutPlan } from '../entities/WorkoutPlan'
import { WorkoutPlanExercise } from '../entities/WorkoutPlanExercise'
import { WorkoutStats } from '../entities/WorkoutStats'
import { WorkoutProgress } from '../entities/WorkoutProgress'
import { WorkoutReminder } from '../entities/WorkoutReminder'
import { logger } from '../utils/logger'
import bcrypt from 'bcrypt'

/**
 * Machines를 제외한 모든 테이블에 초기 데이터를 시드하는 스크립트
 *
 * 실행 방법:
 * npm run seed:without-machines
 */

// 샘플 사용자 데이터
const sampleUsers = [
  {
    email: 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123!',
    nickname: '관리자',
    name: '관리자',
    username: 'admin',
    phone: '010-1234-5678',
    gender: 'male' as const,
    birthday: new Date('1990-01-01'),
    profileImage: 'https://via.placeholder.com/150',
    role: 'admin' as const,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
  },
  {
    email: 'moderator@test.com',
    password: 'mod123!',
    nickname: '모더레이터',
    name: '모더레이터',
    username: 'moderator',
    phone: '010-1111-2222',
    gender: 'female' as const,
    birthday: new Date('1988-03-15'),
    profileImage: 'https://via.placeholder.com/150',
    role: 'moderator' as const,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
  },
  {
    email: 'user1@test.com',
    password: process.env.TEST_USER_PASSWORD || 'user123!',
    nickname: '운동맨',
    name: '김운동',
    username: 'workout_man',
    phone: '010-2345-6789',
    gender: 'male' as const,
    birthday: new Date('1995-05-15'),
    profileImage: 'https://via.placeholder.com/150',
    role: 'user' as const,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
  },
  {
    email: 'user2@test.com',
    password: process.env.TEST_USER_PASSWORD || 'user123!',
    nickname: '피트니스여신',
    name: '이피트',
    username: 'fitness_goddess',
    phone: '010-3456-7890',
    gender: 'female' as const,
    birthday: new Date('1992-08-20'),
    profileImage: 'https://via.placeholder.com/150',
    role: 'user' as const,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
  },
  {
    email: 'user3@test.com',
    password: process.env.TEST_USER_PASSWORD || 'user123!',
    nickname: '헬스초보',
    name: '박헬스',
    username: 'health_beginner',
    phone: '010-4567-8901',
    gender: 'male' as const,
    birthday: new Date('1998-12-10'),
    profileImage: 'https://via.placeholder.com/150',
    role: 'user' as const,
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false,
  },
  {
    email: 'user4@test.com',
    password: process.env.TEST_USER_PASSWORD || 'user123!',
    nickname: '근육맨',
    name: '최근육',
    username: 'muscle_man',
    phone: '010-5678-9012',
    gender: 'male' as const,
    birthday: new Date('1993-07-22'),
    profileImage: 'https://via.placeholder.com/150',
    role: 'user' as const,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
  },
  {
    email: 'user5@test.com',
    password: process.env.TEST_USER_PASSWORD || 'user123!',
    nickname: '요가여신',
    name: '정요가',
    username: 'yoga_goddess',
    phone: '010-6789-0123',
    gender: 'female' as const,
    birthday: new Date('1991-04-18'),
    profileImage: 'https://via.placeholder.com/150',
    role: 'user' as const,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
  },
]

// 샘플 헬스장 데이터
const sampleGyms = [
  {
    name: '강남 피트니스 센터',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    latitude: 37.5665,
    longitude: 126.978,
    facilities: '24시간 운영, 주차장, 샤워시설, PT, GX',
    openHour: '24시간',
    is24Hours: true,
    hasGX: true,
    hasPT: true,
    hasGroupPT: true,
    hasParking: true,
    hasShower: true,
  },
  {
    name: '홍대 헬스장',
    address: '서울특별시 마포구 홍대로 456',
    phone: '02-2345-6789',
    latitude: 37.5575,
    longitude: 126.925,
    facilities: '샤워시설, PT',
    openHour: '06:00-24:00',
    is24Hours: false,
    hasGX: false,
    hasPT: true,
    hasGroupPT: false,
    hasParking: false,
    hasShower: true,
  },
  {
    name: '잠실 스포츠센터',
    address: '서울특별시 송파구 올림픽로 789',
    phone: '02-3456-7890',
    latitude: 37.5139,
    longitude: 127.1006,
    facilities: '24시간 운영, 주차장, 샤워시설, PT, GX, 수영장',
    openHour: '24시간',
    is24Hours: true,
    hasGX: true,
    hasPT: true,
    hasGroupPT: true,
    hasParking: true,
    hasShower: true,
  },
  {
    name: '건대 피트니스',
    address: '서울특별시 광진구 능동로 123',
    phone: '02-4567-8901',
    latitude: 37.5407,
    longitude: 127.0828,
    facilities: '샤워시설, PT, GX',
    openHour: '06:00-24:00',
    is24Hours: false,
    hasGX: true,
    hasPT: true,
    hasGroupPT: false,
    hasParking: true,
    hasShower: true,
  },
  {
    name: '신촌 헬스클럽',
    address: '서울특별시 서대문구 신촌로 456',
    phone: '02-5678-9012',
    latitude: 37.5552,
    longitude: 126.9368,
    facilities: '샤워시설, PT',
    openHour: '07:00-23:00',
    is24Hours: false,
    hasGX: false,
    hasPT: true,
    hasGroupPT: false,
    hasParking: false,
    hasShower: true,
  },
]

// 샘플 게시글 데이터
const samplePosts = [
  {
    title: '운동 초보자를 위한 팁',
    content:
      '운동을 처음 시작하는 분들을 위한 기본적인 팁들을 공유합니다. 꾸준함이 가장 중요합니다!',
    author: '운동맨',
    category: 'tips' as const,
    tags: ['초보자', '팁', '운동'],
    like_count: 25,
    comment_count: 5,
  },
  {
    title: '가슴 운동 루틴 공유',
    content:
      '체스트 프레스와 덤벨 플라이를 조합한 효과적인 가슴 운동 루틴을 공유합니다.',
    author: '피트니스여신',
    category: 'workout' as const,
    tags: ['가슴', '루틴', '체스트프레스'],
    like_count: 18,
    comment_count: 3,
  },
  {
    title: '다이어트 성공 후기',
    content:
      '3개월간 꾸준한 운동과 식단 관리로 10kg 감량에 성공했습니다. 여러분도 할 수 있어요!',
    author: '헬스초보',
    category: 'nutrition' as const,
    tags: ['다이어트', '성공후기', '감량'],
    like_count: 45,
    comment_count: 12,
  },
  {
    title: '헬스장 추천',
    content:
      '강남 지역 헬스장들을 비교해보고 추천드립니다. 각 헬스장의 장단점을 정리했습니다.',
    author: '운동맨',
    category: 'general' as const,
    tags: ['헬스장', '추천', '강남'],
    like_count: 32,
    comment_count: 8,
  },
  {
    title: '하체 운동의 중요성',
    content:
      '하체 운동이 왜 중요한지, 그리고 어떤 효과가 있는지 자세히 설명드립니다.',
    author: '근육맨',
    category: 'tips' as const,
    tags: ['하체', '스쿼트', '근력'],
    like_count: 28,
    comment_count: 6,
  },
  {
    title: '요가와 필라테스의 차이점',
    content: '요가와 필라테스의 차이점과 각각의 장점에 대해 알아보겠습니다.',
    author: '요가여신',
    category: 'workout' as const,
    tags: ['요가', '필라테스', '스트레칭'],
    like_count: 35,
    comment_count: 9,
  },
  {
    title: '운동 전후 영양 섭취 가이드',
    content:
      '운동 전후에 어떤 영양소를 언제 섭취해야 하는지 상세히 안내드립니다.',
    author: '피트니스여신',
    category: 'general' as const,
    tags: ['영양', '프로틴', '탄수화물'],
    like_count: 42,
    comment_count: 15,
  },
  {
    title: '집에서 할 수 있는 홈트레이닝',
    content:
      '헬스장에 가지 않고도 집에서 효과적으로 할 수 있는 운동들을 소개합니다.',
    author: '헬스초보',
    category: 'workout' as const,
    tags: ['홈트레이닝', '집운동', '체중운동'],
    like_count: 38,
    comment_count: 11,
  },
  {
    title: '운동 부상 예방법',
    content:
      '운동 중 부상을 예방하는 방법과 안전한 운동을 위한 팁들을 공유합니다.',
    author: '근육맨',
    category: 'tips' as const,
    tags: ['부상예방', '안전', '워밍업'],
    like_count: 31,
    comment_count: 7,
  },
  {
    title: '여성들을 위한 근력 운동 가이드',
    content:
      '여성들이 근력 운동을 할 때 주의해야 할 점들과 효과적인 루틴을 제안합니다.',
    author: '요가여신',
    category: 'workout' as const,
    tags: ['여성', '근력운동', '호르몬'],
    like_count: 29,
    comment_count: 8,
  },
]

// 샘플 운동 목표 데이터
const sampleWorkoutGoals = [
  {
    title: '체중 감량 목표',
    description: '3개월간 10kg 감량하기',
    type: 'weight' as const,
    targetValue: 70.0,
    currentValue: 80.0,
    unit: 'kg',
    deadline: new Date('2024-12-31'),
    isCompleted: false,
  },
  {
    title: '벤치프레스 기록 향상',
    description: '벤치프레스 1RM 100kg 달성하기',
    type: 'weight' as const,
    targetValue: 100.0,
    currentValue: 80.0,
    unit: 'kg',
    deadline: new Date('2024-11-30'),
    isCompleted: false,
  },
  {
    title: '주 3회 운동하기',
    description: '일주일에 3회 이상 운동하기',
    type: 'frequency' as const,
    targetValue: 3.0,
    currentValue: 1.0,
    unit: '회/주',
    deadline: new Date('2024-12-31'),
    isCompleted: false,
  },
]

// 샘플 운동 계획 데이터
const sampleWorkoutPlans = [
  {
    name: '초보자 상체 루틴',
    description: '운동 초보자를 위한 상체 중심 루틴',
    difficulty: 'beginner' as const,
    estimatedDuration: 60,
    isPublic: true,
    tags: ['초보자', '상체', '루틴'],
  },
  {
    name: '중급자 하체 루틴',
    description: '하체 근력 향상을 위한 중급자 루틴',
    difficulty: 'intermediate' as const,
    estimatedDuration: 75,
    isPublic: true,
    tags: ['중급자', '하체', '루틴'],
  },
  {
    name: '고급자 전신 루틴',
    description: '전신 근력 향상을 위한 고급자 루틴',
    difficulty: 'advanced' as const,
    estimatedDuration: 90,
    isPublic: true,
    tags: ['고급자', '전신', '루틴'],
  },
  {
    name: '카디오 중심 루틴',
    description: '심폐지구력 향상을 위한 카디오 루틴',
    difficulty: 'beginner' as const,
    estimatedDuration: 45,
    isPublic: true,
    tags: ['카디오', '지구력', '다이어트'],
  },
  {
    name: '근력 중심 루틴',
    description: '근력 향상에 특화된 루틴',
    difficulty: 'intermediate' as const,
    estimatedDuration: 80,
    isPublic: true,
    tags: ['근력', '벌크업', '중급자'],
  },
  {
    name: '여성 전용 루틴',
    description: '여성의 신체 특성에 맞춘 루틴',
    difficulty: 'beginner' as const,
    estimatedDuration: 50,
    isPublic: true,
    tags: ['여성', '초보자', '톤업'],
  },
  {
    name: '고강도 인터벌 트레이닝',
    description: '짧은 시간에 높은 효과를 내는 HIIT 루틴',
    difficulty: 'advanced' as const,
    estimatedDuration: 30,
    isPublic: true,
    tags: ['HIIT', '고강도', '지방연소'],
  },
]

async function seedDataWithoutMachines() {
  logger.info('Machines를 제외한 초기 데이터 시드 시작...')

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    logger.info('데이터베이스 연결 성공')

    // 1. 사용자 생성
    logger.info('사용자 데이터 생성 중...')
    const userRepository = AppDataSource.getRepository(User)
    const createdUsers = []

    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      })
      const savedUser = await userRepository.save(user)
      createdUsers.push(savedUser)
      logger.info(`사용자 생성 완료: ${savedUser.nickname}`)
    }

    // 2. 헬스장 생성
    logger.info('헬스장 데이터 생성 중...')
    const gymRepository = AppDataSource.getRepository(Gym)
    const createdGyms = []

    for (const gymData of sampleGyms) {
      const gym = gymRepository.create(gymData)
      const savedGym = await gymRepository.save(gym)
      createdGyms.push(savedGym)
      logger.info(`헬스장 생성 완료: ${savedGym.name}`)
    }

    // 3. 사용자 레벨 생성
    logger.info('사용자 레벨 데이터 생성 중...')
    const userLevelRepository = AppDataSource.getRepository(UserLevel)

    for (const user of createdUsers) {
      const userLevel = userLevelRepository.create({
        userId: user.id,
        level: 1,
        currentExp: 0,
        totalExp: 0,
        seasonExp: 0,
        totalLevelUps: 0,
        currentSeason: 1,
      })
      await userLevelRepository.save(userLevel)
      logger.info(`사용자 레벨 생성 완료: ${user.nickname}`)
    }

    // 4. 게시글 생성
    logger.info('게시글 데이터 생성 중...')
    const postRepository = AppDataSource.getRepository(Post)
    const createdPosts = []

    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i]
      const user = createdUsers[i % createdUsers.length]

      const post = postRepository.create({
        title: postData.title,
        content: postData.content,
        author: postData.author,
        category: postData.category,
        tags: postData.tags,
        like_count: postData.like_count,
        comment_count: postData.comment_count,
        userId: user.id,
      })
      const savedPost = await postRepository.save(post)
      createdPosts.push(savedPost)
      logger.info(`게시글 생성 완료: ${savedPost.title}`)
    }

    // 5. 댓글 생성
    logger.info('댓글 데이터 생성 중...')
    const commentRepository = AppDataSource.getRepository(Comment)

    for (const post of createdPosts) {
      for (let i = 0; i < 3; i++) {
        const user = createdUsers[i % createdUsers.length]
        const comment = commentRepository.create({
          content: `정말 유용한 정보네요! ${i + 1}번째 댓글입니다.`,
          userId: user.id,
          postId: post.id,
          author: user.nickname,
        })
        await commentRepository.save(comment)
      }
      logger.info(`댓글 생성 완료: ${post.title}`)
    }

    // 6. 좋아요 생성
    logger.info('좋아요 데이터 생성 중...')
    const postLikeRepository = AppDataSource.getRepository(Like)

    for (const post of createdPosts) {
      for (let i = 0; i < 2; i++) {
        const user = createdUsers[i % createdUsers.length]
        const postLike = postLikeRepository.create({
          userId: user.id,
          postId: post.id,
        })
        await postLikeRepository.save(postLike)
      }
      logger.info(`좋아요 생성 완료: ${post.title}`)
    }

    // 7. 운동 목표 생성
    logger.info('운동 목표 데이터 생성 중...')
    const workoutGoalRepository = AppDataSource.getRepository(WorkoutGoal)

    for (let i = 0; i < sampleWorkoutGoals.length; i++) {
      const goalData = sampleWorkoutGoals[i]
      const user = createdUsers[i % createdUsers.length]

      const workoutGoal = workoutGoalRepository.create({
        ...goalData,
        userId: user.id,
      })
      await workoutGoalRepository.save(workoutGoal)
      logger.info(`운동 목표 생성 완료: ${workoutGoal.title}`)
    }

    // 8. 운동 계획 생성
    logger.info('운동 계획 데이터 생성 중...')
    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan)
    const createdWorkoutPlans = []

    for (let i = 0; i < sampleWorkoutPlans.length; i++) {
      const planData = sampleWorkoutPlans[i]
      const user = createdUsers[i % createdUsers.length]

      const workoutPlan = workoutPlanRepository.create({
        ...planData,
        userId: user.id,
        estimatedDurationMinutes: planData.estimatedDuration,
      })
      const savedPlan = await workoutPlanRepository.save(workoutPlan)
      createdWorkoutPlans.push(savedPlan)
      logger.info(`운동 계획 생성 완료: ${savedPlan.name}`)
    }

    // 9. 운동 세션 생성 (machineId 없이)
    logger.info('운동 세션 데이터 생성 중...')
    const workoutSessionRepository = AppDataSource.getRepository(WorkoutSession)
    const createdWorkoutSessions = []

    for (let i = 0; i < 15; i++) {
      const user = createdUsers[i % createdUsers.length]
      const gym = createdGyms[i % createdGyms.length]
      const plan = createdWorkoutPlans[i % createdWorkoutPlans.length]

      const workoutSession = workoutSessionRepository.create({
        userId: user.id,
        gymId: gym.id,
        planId: plan.id,
        name: `${user.nickname}의 운동 세션 ${i + 1}`,
        startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // 최근 15일간
        endTime: new Date(
          Date.now() - i * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
        ), // 1시간 후
        totalDurationMinutes: 60,
        moodRating: Math.floor(Math.random() * 5) + 1,
        energyLevel: Math.floor(Math.random() * 5) + 1,
        notes: '좋은 운동이었다!',
        status: 'completed' as const,
      })
      const savedSession = await workoutSessionRepository.save(workoutSession)
      createdWorkoutSessions.push(savedSession)
      logger.info(`운동 세션 생성 완료: ${workoutSession.name}`)
    }

    // 10. 경험치 히스토리 생성
    logger.info('경험치 히스토리 데이터 생성 중...')
    const expHistoryRepository = AppDataSource.getRepository(ExpHistory)

    for (const user of createdUsers) {
      for (let i = 0; i < 8; i++) {
        const expHistory = expHistoryRepository.create({
          userId: user.id,
          actionType: 'workout_complete' as const,
          expGained: 100 + Math.floor(Math.random() * 50),
          source: '운동 완료',
          metadata: { sessionId: i + 1 },
        })
        await expHistoryRepository.save(expHistory)
      }
      logger.info(`경험치 히스토리 생성 완료: ${user.nickname}`)
    }

    // 11. 사용자 보상 생성
    logger.info('사용자 보상 데이터 생성 중...')
    const userRewardRepository = AppDataSource.getRepository(UserReward)

    for (const user of createdUsers) {
      const userReward = userRewardRepository.create({
        userId: user.id,
        rewardType: 'badge' as const,
        rewardId: 'first_workout',
        rewardName: '첫 운동 완료',
        rewardDescription: '첫 번째 운동을 완료했습니다!',
        isClaimed: true,
        claimedAt: new Date(),
      })
      await userRewardRepository.save(userReward)
      logger.info(`사용자 보상 생성 완료: ${user.nickname}`)
    }

    // 12. 마일스톤 생성
    logger.info('마일스톤 데이터 생성 중...')
    const milestoneRepository = AppDataSource.getRepository(Milestone)

    for (const user of createdUsers) {
      const milestone = milestoneRepository.create({
        userId: user.id,
        milestoneType: 'workout_count' as const,
        milestoneName: '운동 10회 달성',
        milestoneDescription: '운동을 10회 완료하세요',
        targetValue: 10,
        currentValue: 5,
        achieved: false,
      })
      await milestoneRepository.save(milestone)
      logger.info(`마일스톤 생성 완료: ${user.nickname}`)
    }

    // 13. 사용자 스트릭 생성
    logger.info('사용자 스트릭 데이터 생성 중...')
    const userStreakRepository = AppDataSource.getRepository(UserStreak)

    for (const user of createdUsers) {
      const userStreak = userStreakRepository.create({
        userId: user.id,
        streakType: 'workout' as const,
        currentCount: 3,
        maxCount: 7,
        lastActivity: new Date(),
        streakStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      })
      await userStreakRepository.save(userStreak)
      logger.info(`사용자 스트릭 생성 완료: ${user.nickname}`)
    }

    // 14. 운동 알림 데이터 생성
    logger.info('운동 알림 데이터 생성 중...')
    const workoutReminderRepository =
      AppDataSource.getRepository(WorkoutReminder)

    for (const user of createdUsers.slice(0, 3)) {
      // 처음 3명의 사용자만
      const reminderTimes = ['09:00:00', '18:00:00', '20:00:00']
      const repeatDaysOptions = [
        [1, 3, 5], // 월, 수, 금
        [2, 4, 6], // 화, 목, 토
        [0, 1, 2, 3, 4, 5, 6], // 매일
      ]

      for (let i = 0; i < 2; i++) {
        // 사용자당 2개의 알림
        const workoutReminder = workoutReminderRepository.create({
          userId: user.id,
          title: `운동 알림 ${i + 1}`,
          description: `${user.nickname}님의 운동 시간입니다!`,
          reminderTime: reminderTimes[i % reminderTimes.length],
          repeatDays: repeatDaysOptions[i % repeatDaysOptions.length],
          isActive: true,
          isSent: false,
          notificationType: ['push', 'email', 'sms'][i % 3] as
            | 'push'
            | 'email'
            | 'sms',
        })
        await workoutReminderRepository.save(workoutReminder)
      }
      logger.info(`운동 알림 생성 완료: ${user.nickname}`)
    }

    logger.info('🎉 Machines를 제외한 모든 초기 데이터 생성 완료!')
    logger.info(`생성된 데이터:`)
    logger.info(`- 사용자: ${createdUsers.length}명`)
    logger.info(`- 헬스장: ${createdGyms.length}개`)
    logger.info(`- 게시글: ${samplePosts.length}개`)
    logger.info(`- 운동 목표: ${sampleWorkoutGoals.length}개`)
    logger.info(`- 운동 계획: ${createdWorkoutPlans.length}개`)
    logger.info(`- 운동 세션: ${createdWorkoutSessions.length}개`)
    logger.info(`- 운동 알림: ${createdUsers.slice(0, 3).length * 2}개`)
  } catch (error) {
    logger.error('데이터 시드 실패:', error)
    throw error
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  seedDataWithoutMachines()
    .then(() => {
      logger.info('✅ 데이터 시드 완료!')
      process.exit(0)
    })
    .catch(error => {
      logger.error('❌ 데이터 시드 실패:', error)
      process.exit(1)
    })
}

export { seedDataWithoutMachines }
