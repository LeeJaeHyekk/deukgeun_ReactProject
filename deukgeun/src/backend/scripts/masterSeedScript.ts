#!/usr/bin/env node

/**
 * ============================================================================
 * Master Seed Script - Deukgeun 프로젝트 초기 데이터 설정
 * ============================================================================
 *
 * 목적:
 * 1. 프로덕션 배포 시 초기 데이터 설정
 * 2. 3일마다 API 데이터 업데이트
 * 3. 시스템 초기화 및 데이터 동기화
 *
 * 실행 방법:
 * - 초기 설정: npm run seed:master
 * - API 업데이트: npm run seed:update-api
 * - 전체 재설정: npm run seed:reset
 *
 * ============================================================================
 */

import { AppDataSource } from '../config/database'
import { User } from '../entities/User'
import { UserLevel } from '../entities/UserLevel'
import { UserReward } from '../entities/UserReward'
import { Milestone } from '../entities/Milestone'
import { UserStreak } from '../entities/UserStreak'
import { Gym } from '../entities/Gym'
import { Machine } from '../entities/Machine'
import { WorkoutPlan } from '../entities/WorkoutPlan'
import { WorkoutPlanExercise } from '../entities/WorkoutPlanExercise'
import { ExpHistory } from '../entities/ExpHistory'
import { Post } from '../entities/Post'
import { Comment } from '../entities/Comment'
import { Like } from '../entities/Like'
import { WorkoutSession } from '../entities/WorkoutSession'
import { ExerciseSet } from '../entities/ExerciseSet'
import { WorkoutGoal } from '../entities/WorkoutGoal'
import { WorkoutStats } from '../entities/WorkoutStats'
import { WorkoutProgress } from '../entities/WorkoutProgress'
import { WorkoutReminder } from '../entities/WorkoutReminder'
import { VerificationToken } from '../entities/VerificationToken'
import { PasswordResetToken } from '../entities/PasswordResetToken'

import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import { logger } from '../utils/logger'
import { config } from '../config/env'

// ============================================================================
// 타입 정의
// ============================================================================

interface SeedOptions {
  mode: 'initial' | 'update' | 'reset' | 'api-only'
  skipUsers?: boolean
  skipGyms?: boolean
  skipMachines?: boolean
  skipWorkoutData?: boolean
  skipCommunityData?: boolean
  forceUpdate?: boolean
}

interface SeedResult {
  success: boolean
  message: string
  data: {
    users: number
    gyms: number
    machines: number
    workoutPlans: number
    posts: number
    errors: string[]
  }
  executionTime: number
}

// ============================================================================
// 메인 시드 클래스
// ============================================================================

class MasterSeedScript {
  private startTime: number = 0
  private result: SeedResult = {
    success: false,
    message: '',
    data: {
      users: 0,
      gyms: 0,
      machines: 0,
      workoutPlans: 0,
      posts: 0,
      errors: [],
    },
    executionTime: 0,
  }

  constructor(private options: SeedOptions) {
    this.startTime = Date.now()
  }

  /**
   * 메인 실행 함수
   */
  async execute(): Promise<SeedResult> {
    try {
      logger.info('🚀 Master Seed Script 시작')
      logger.info(`📋 실행 모드: ${this.options.mode}`)

      // 데이터베이스 연결
      await this.initializeDatabase()

      // 모드별 실행
      switch (this.options.mode) {
        case 'initial':
          await this.runInitialSeed()
          break
        case 'update':
          await this.runUpdateSeed()
          break
        case 'reset':
          await this.runResetSeed()
          break
        case 'api-only':
          await this.runApiUpdateOnly()
          break
        default:
          throw new Error(`알 수 없는 모드: ${this.options.mode}`)
      }

      this.result.success = true
      this.result.message = '시드 스크립트가 성공적으로 완료되었습니다.'
    } catch (error) {
      this.result.success = false
      this.result.message = `시드 스크립트 실행 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      this.result.data.errors.push(this.result.message)
      logger.error('❌ 시드 스크립트 실행 실패:', error)
    } finally {
      this.result.executionTime = Date.now() - this.startTime
      await this.cleanup()
      this.printSummary()
    }

    return this.result
  }

  /**
   * 데이터베이스 초기화
   */
  private async initializeDatabase(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
        logger.info('✅ 데이터베이스 연결 성공')
      }
    } catch (error) {
      logger.error('❌ 데이터베이스 연결 실패:', error)
      throw error
    }
  }

  /**
   * 초기 시드 실행 (프로덕션 배포 시)
   */
  private async runInitialSeed(): Promise<void> {
    logger.info('🌱 초기 데이터 시드 시작')

    // 1. 필수 사용자 생성
    if (!this.options.skipUsers) {
      await this.createEssentialUsers()
    }

    // 2. 헬스장 데이터 로드
    if (!this.options.skipGyms) {
      await this.loadGymData()
    }

    // 3. 운동기구 데이터 로드
    if (!this.options.skipMachines) {
      await this.loadMachineData()
    }

    // 4. 워크아웃 템플릿 생성
    if (!this.options.skipWorkoutData) {
      await this.createWorkoutTemplates()
    }

    // 5. 커뮤니티 초기 데이터
    if (!this.options.skipCommunityData) {
      await this.createCommunityTemplates()
    }

    logger.info('✅ 초기 데이터 시드 완료')
  }

  /**
   * 업데이트 시드 실행 (3일마다)
   */
  private async runUpdateSeed(): Promise<void> {
    logger.info('🔄 데이터 업데이트 시작')

    // 1. API 데이터 업데이트
    await this.updateApiData()

    // 2. 운동기구 데이터 동기화
    await this.syncMachineData()

    // 3. 데이터 정리
    await this.cleanupData()

    logger.info('✅ 데이터 업데이트 완료')
  }

  /**
   * 리셋 시드 실행 (전체 재설정)
   */
  private async runResetSeed(): Promise<void> {
    logger.info('🔄 전체 데이터 리셋 시작')

    // 주의: 프로덕션에서는 실행하지 않도록 주의
    if (process.env.NODE_ENV === 'production' && !this.options.forceUpdate) {
      throw new Error('프로덕션 환경에서는 forceUpdate 옵션이 필요합니다.')
    }

    // 기존 데이터 삭제
    await this.clearAllData()

    // 초기 시드 실행
    await this.runInitialSeed()

    logger.info('✅ 전체 데이터 리셋 완료')
  }

  /**
   * API 데이터만 업데이트
   */
  private async runApiUpdateOnly(): Promise<void> {
    logger.info('📡 API 데이터 업데이트 시작')

    await this.updateApiData()
    await this.syncMachineData()

    logger.info('✅ API 데이터 업데이트 완료')
  }

  // ============================================================================
  // 데이터 생성 함수들
  // ============================================================================

  /**
   * 필수 사용자 생성
   */
  private async createEssentialUsers(): Promise<void> {
    logger.info('👤 필수 사용자 생성 중...')

    const userRepository = AppDataSource.getRepository(User)
    const userLevelRepository = AppDataSource.getRepository(UserLevel)

    // 관리자 계정 생성
    const adminExists = await userRepository.findOne({
      where: { role: 'admin' },
    })
    if (!adminExists) {
      const adminUser = userRepository.create({
        email: process.env.ADMIN_EMAIL || 'admin@deukgeun.com',
        password: await bcrypt.hash(
          process.env.ADMIN_PASSWORD || 'temp_admin_password_change_me',
          10
        ),
        nickname: process.env.ADMIN_NICKNAME || '시스템관리자',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
      })

      const savedAdmin = await userRepository.save(adminUser)

      // 관리자 레벨 초기화
      const adminLevel = userLevelRepository.create({
        userId: savedAdmin.id,
        level: 1,
        totalExp: 0,
        currentExp: 0,
      })
      await userLevelRepository.save(adminLevel)

      this.result.data.users++
      logger.info('✅ 관리자 계정 생성 완료')
    }

    // 개발 환경에서만 테스트 사용자 생성
    if (process.env.NODE_ENV === 'development') {
      await this.createTestUsers()
    }
  }

  /**
   * 테스트 사용자 생성 (개발 환경 전용)
   */
  private async createTestUsers(): Promise<void> {
    const userRepository = AppDataSource.getRepository(User)
    const userLevelRepository = AppDataSource.getRepository(UserLevel)

    const testUsers = [
      {
        email: process.env.TEST_USER1_EMAIL || 'test1@deukgeun.com',
        password: process.env.TEST_USER1_PASSWORD || 'test123!',
        nickname: process.env.TEST_USER1_NICKNAME || '테스트유저1',
        role: 'user' as const,
      },
      {
        email: process.env.TEST_USER2_EMAIL || 'test2@deukgeun.com',
        password: process.env.TEST_USER2_PASSWORD || 'test123!',
        nickname: process.env.TEST_USER2_NICKNAME || '테스트유저2',
        role: 'user' as const,
      },
    ]

    for (const userData of testUsers) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      })

      if (!existingUser) {
        const user = userRepository.create({
          ...userData,
          password: await bcrypt.hash(userData.password, 10),
          isEmailVerified: true,
          isActive: true,
        })

        const savedUser = await userRepository.save(user)

        // 사용자 레벨 초기화
        const userLevel = userLevelRepository.create({
          userId: savedUser.id,
          level: 1,
          totalExp: 0,
          currentExp: 0,
        })
        await userLevelRepository.save(userLevel)

        this.result.data.users++
      }
    }

    logger.info(`✅ 테스트 사용자 생성 완료 (${testUsers.length}명)`)
  }

  /**
   * 헬스장 데이터 로드
   */
  private async loadGymData(): Promise<void> {
    logger.info('🏋️ 헬스장 데이터 로드 중...')

    const gymRepository = AppDataSource.getRepository(Gym)
    const existingGymCount = await gymRepository.count()

    if (existingGymCount === 0) {
      // API에서 헬스장 데이터 가져오기
      await this.fetchGymsFromAPI()
    } else {
      logger.info(`✅ 기존 헬스장 데이터 ${existingGymCount}개 사용`)
    }

    const finalGymCount = await gymRepository.count()
    this.result.data.gyms = finalGymCount
  }

  /**
   * API에서 헬스장 데이터 가져오기
   */
  private async fetchGymsFromAPI(): Promise<void> {
    logger.info('📡 API에서 헬스장 데이터 가져오는 중...')

    const API_KEY = process.env.VITE_GYM_API_KEY
    if (!API_KEY || API_KEY === 'your_gym_api_key') {
      logger.warn('⚠️ 헬스장 API 키가 설정되지 않음. 기본 데이터 사용')
      await this.createDefaultGyms()
      return
    }

    try {
      // 서울시 공공데이터 API 호출
      const response = await fetch(
        `http://openapi.seoul.go.kr:8088/${API_KEY}/json/LOCALDATA_104201/1/1000`
      )

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`)
      }

      const data = (await response.json()) as any
      const gyms = data.LOCALDATA_104201?.row || []

      const gymRepository = AppDataSource.getRepository(Gym)
      let savedCount = 0

      for (const gymData of gyms) {
        try {
          const gym = gymRepository.create({
            name: gymData.BPLCNM,
            address: gymData.RDNWHLADDR || gymData.SITEWHLADDR,
            phone: gymData.SITETEL,
            latitude: parseFloat(gymData.latitude) || 0,
            longitude: parseFloat(gymData.longitude) || 0,
            facilities: '기본 시설',
            openHour: '06:00-24:00',
            is24Hours: false,
            hasGX: false,
            hasPT: false,
            hasGroupPT: false,
            hasParking: false,
            hasShower: false,
          })

          await gymRepository.save(gym)
          savedCount++
        } catch (error) {
          logger.warn(`헬스장 데이터 저장 실패: ${gymData.BPLCNM}`)
        }
      }

      logger.info(`✅ ${savedCount}개의 헬스장 데이터 저장 완료`)
    } catch (error) {
      logger.error('❌ API 데이터 가져오기 실패:', error)
      await this.createDefaultGyms()
    }
  }

  /**
   * 기본 헬스장 데이터 생성
   */
  private async createDefaultGyms(): Promise<void> {
    logger.info('🏋️ 기본 헬스장 데이터 생성 중...')

    const gymRepository = AppDataSource.getRepository(Gym)

    const defaultGyms = [
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
    ]

    for (const gymData of defaultGyms) {
      const gym = gymRepository.create(gymData)
      await gymRepository.save(gym)
    }

    logger.info(`✅ ${defaultGyms.length}개의 기본 헬스장 데이터 생성 완료`)
  }

  /**
   * 운동기구 데이터 로드
   */
  private async loadMachineData(): Promise<void> {
    logger.info('🔧 운동기구 데이터 로드 중...')

    const machineRepository = AppDataSource.getRepository(Machine)
    const existingMachineCount = await machineRepository.count()

    if (existingMachineCount === 0) {
      await this.createDefaultMachines()
    } else {
      logger.info(`✅ 기존 운동기구 데이터 ${existingMachineCount}개 사용`)
    }

    const finalMachineCount = await machineRepository.count()
    this.result.data.machines = finalMachineCount
  }

  /**
   * 기본 운동기구 데이터 생성
   */
  private async createDefaultMachines(): Promise<void> {
    logger.info('🔧 기본 운동기구 데이터 생성 중...')

    const machineRepository = AppDataSource.getRepository(Machine)

    const defaultMachines = [
      {
        machineKey: 'bench_press_001',
        name: '벤치프레스',
        nameEn: 'Bench Press',
        imageUrl: '/img/machine/chest-press.png',
        shortDesc: '가슴 근육을 발달시키는 기본 운동 기구',
        category: 'chest' as const,
        difficulty: 'beginner' as const,
        anatomy: {
          primaryMuscles: ['대흉근'],
          secondaryMuscles: ['삼두근', '삼각근'],
          antagonistMuscles: ['광배근', '후면삼각근'],
          easyExplanation: '가슴 근육을 발달시키는 기본 운동입니다.',
        },
        guide: {
          setup: '벤치에 누워 바를 어깨 너비로 잡습니다.',
          execution: ['바를 가슴까지 내렸다가 올립니다.'],
          movementDirection: '수직',
          idealStimulus: '가슴 근육에 집중',
          commonMistakes: ['어깨가 들리는 것', '바를 너무 높게 올리는 것'],
          breathing: '내릴 때 숨을 들이마시고, 올릴 때 내쉽니다.',
          safetyTips: [
            '어깨를 벤치에 고정하세요',
            '발은 바닥에 단단히 고정하세요',
          ],
        },
        training: {
          recommendedReps: '8-12',
          recommendedSets: '3-4',
          restTime: '60-90초',
          variations: ['인클라인 벤치프레스', '덤벨 벤치프레스'],
          levelUpOptions: ['무게 증가', '세트 수 증가'],
          beginnerTips: ['올바른 자세를 먼저 익히세요', '무리하지 마세요'],
        },
        extraInfo: {
          dailyUseCase: '가슴 근육 발달을 위한 기본 운동',
          searchKeywords: ['벤치프레스', '가슴운동', '상체운동', 'chest press'],
        },
        isActive: true,
      },
      {
        machineKey: 'squat_rack_001',
        name: '스쿼트랙',
        nameEn: 'Squat Rack',
        imageUrl: '/img/machine/squat-rack.png',
        shortDesc: '하체 근육을 발달시키는 복합 운동 기구',
        category: 'legs' as const,
        difficulty: 'intermediate' as const,
        anatomy: {
          primaryMuscles: ['대퇴사두근', '둔근'],
          secondaryMuscles: ['햄스트링', '비복근'],
          antagonistMuscles: ['대퇴이두근', '장딴지근'],
          easyExplanation: '하체 근육을 발달시키는 기본 운동입니다.',
        },
        guide: {
          setup: '바를 어깨에 올리고 스쿼트 자세를 취합니다.',
          execution: ['무릎을 구부려 앉았다가 일어납니다.'],
          movementDirection: '수직',
          idealStimulus: '하체 근육에 집중',
          commonMistakes: ['무릎이 안쪽으로 들어가는 것', '허리를 구부리는 것'],
          breathing: '앉을 때 숨을 들이마시고, 일어날 때 내쉽니다.',
          safetyTips: [
            '무릎이 발가락을 넘지 않도록 하세요',
            '가슴을 펴고 시선은 앞을 보세요',
          ],
        },
        training: {
          recommendedReps: '10-15',
          recommendedSets: '3-4',
          restTime: '60-90초',
          variations: ['프론트 스쿼트', '오버헤드 스쿼트'],
          levelUpOptions: ['무게 증가', '세트 수 증가'],
          beginnerTips: ['올바른 자세를 먼저 익히세요', '무리하지 마세요'],
        },
        extraInfo: {
          dailyUseCase: '하체 근육 발달을 위한 기본 운동',
          searchKeywords: ['스쿼트', '하체운동', '다리운동', 'squat'],
        },
        isActive: true,
      },
    ]

    for (const machineData of defaultMachines) {
      const machine = machineRepository.create(machineData)
      await machineRepository.save(machine)
    }

    logger.info(
      `✅ ${defaultMachines.length}개의 기본 운동기구 데이터 생성 완료`
    )
  }

  /**
   * 워크아웃 템플릿 생성
   */
  private async createWorkoutTemplates(): Promise<void> {
    logger.info('📋 워크아웃 템플릿 생성 중...')

    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan)
    const workoutPlanExerciseRepository =
      AppDataSource.getRepository(WorkoutPlanExercise)
    const machineRepository = AppDataSource.getRepository(Machine)

    const machines = await machineRepository.find()
    if (machines.length === 0) {
      logger.warn(
        '⚠️ 운동기구 데이터가 없어 워크아웃 템플릿을 생성할 수 없습니다.'
      )
      return
    }

    const templates = [
      {
        name: '초보자 전체 운동',
        description: '운동을 처음 시작하는 분들을 위한 기본 운동 루틴',
        difficulty: 'beginner' as const,
        estimatedDurationMinutes: 60,
        targetMuscleGroups: ['전신'],
        isTemplate: true,
        isPublic: true,
        exercises: [
          {
            machineKey: 'bench_press_001',
            sets: 3,
            reps: '8-12',
            rest: '60초',
          },
          {
            machineKey: 'squat_rack_001',
            sets: 3,
            reps: '10-15',
            rest: '60초',
          },
        ],
      },
      {
        name: '중급자 상체 집중',
        description: '상체 근육을 집중적으로 발달시키는 루틴',
        difficulty: 'intermediate' as const,
        estimatedDurationMinutes: 75,
        targetMuscleGroups: ['가슴', '등', '어깨', '팔'],
        isTemplate: true,
        isPublic: true,
        exercises: [
          {
            machineKey: 'bench_press_001',
            sets: 4,
            reps: '6-10',
            rest: '90초',
          },
        ],
      },
    ]

    for (const templateData of templates) {
      const plan = workoutPlanRepository.create({
        ...templateData,
        userId: 0, // 템플릿은 사용자별이 아님 (임시로 0 사용)
      })

      const savedPlan = await workoutPlanRepository.save(plan)

      // 운동 추가
      for (const exerciseData of templateData.exercises) {
        const machine = machines.find(
          m => m.machineKey === exerciseData.machineKey
        )
        if (machine) {
          const exercise = workoutPlanExerciseRepository.create({
            planId: savedPlan.id,
            machineId: machine.id,
            exerciseName: machine.name,
            exerciseOrder: templateData.exercises.indexOf(exerciseData) + 1,
            sets: exerciseData.sets,
            repsRange: {
              min: parseInt(exerciseData.reps.split('-')[0]),
              max: parseInt(exerciseData.reps.split('-')[1]),
            },
            restSeconds: parseInt(exerciseData.rest),
          })

          await workoutPlanExerciseRepository.save(exercise)
        }
      }

      this.result.data.workoutPlans++
    }

    logger.info(`✅ ${templates.length}개의 워크아웃 템플릿 생성 완료`)
  }

  /**
   * 커뮤니티 템플릿 생성
   */
  private async createCommunityTemplates(): Promise<void> {
    logger.info('📝 커뮤니티 템플릿 생성 중...')

    const postRepository = AppDataSource.getRepository(Post)
    const userRepository = AppDataSource.getRepository(User)

    // 관리자 사용자 찾기
    const adminUser = await userRepository.findOne({ where: { role: 'admin' } })
    if (!adminUser) {
      logger.warn(
        '⚠️ 관리자 사용자가 없어 커뮤니티 템플릿을 생성할 수 없습니다.'
      )
      return
    }

    const templates = [
      {
        title: '헬스 초보자를 위한 첫 운동 가이드',
        content: `안녕하세요! 헬스를 처음 시작하는 분들을 위한 기본 가이드를 공유합니다.

## 기본 운동 루틴
1. **스쿼트** 3세트 x 15회
2. **푸시업** 3세트 x 10회  
3. **플랭크** 3세트 x 30초

## 주의사항
- 운동 전 충분한 워밍업을 하세요
- 무리하지 말고 자신의 체력에 맞게 조절하세요
- 꾸준함이 가장 중요합니다!

궁금한 점이 있으시면 언제든 댓글로 질문해주세요. 💪`,
        category: 'workout' as const,
        tags: ['초보자', '운동루틴', '가이드'],
        author: adminUser.nickname,
        userId: adminUser.id,
        like_count: 0,
        comment_count: 0,
      },
      {
        title: '운동 후 영양 섭취 가이드',
        content: `운동 후 올바른 영양 섭취에 대해 알아보겠습니다.

## 운동 후 30분 내 섭취 권장
- **단백질**: 근육 회복과 성장에 필수
- **탄수화물**: 에너지 보충
- **수분**: 충분한 수분 섭취

## 추천 음식
- 닭가슴살, 계란, 요거트 (단백질)
- 바나나, 고구마, 현미 (탄수화물)
- 물, 이온음료 (수분)

균형 잡힌 식단과 꾸준한 운동으로 건강한 몸을 만들어가세요! 🥗`,
        category: 'nutrition' as const,
        tags: ['영양', '운동후', '식단'],
        author: adminUser.nickname,
        userId: adminUser.id,
        like_count: 0,
        comment_count: 0,
      },
    ]

    for (const templateData of templates) {
      const post = postRepository.create(templateData)
      await postRepository.save(post)
      this.result.data.posts++
    }

    logger.info(`✅ ${templates.length}개의 커뮤니티 템플릿 생성 완료`)
  }

  // ============================================================================
  // 업데이트 함수들
  // ============================================================================

  /**
   * API 데이터 업데이트
   */
  private async updateApiData(): Promise<void> {
    logger.info('📡 API 데이터 업데이트 중...')

    // 헬스장 데이터 업데이트
    await this.fetchGymsFromAPI()

    // 운동기구 데이터 동기화
    await this.syncMachineData()

    logger.info('✅ API 데이터 업데이트 완료')
  }

  /**
   * 운동기구 데이터 동기화
   */
  private async syncMachineData(): Promise<void> {
    logger.info('🔧 운동기구 데이터 동기화 중...')

    try {
      // JSON 파일에서 최신 데이터 가져오기
      const machinesDataPath = path.join(
        __dirname,
        '../../../shared/data/machines/machinesData.json'
      )

      if (fs.existsSync(machinesDataPath)) {
        const machinesData = JSON.parse(
          fs.readFileSync(machinesDataPath, 'utf8')
        )
        const machineRepository = AppDataSource.getRepository(Machine)

        for (const machineData of machinesData) {
          const existingMachine = await machineRepository.findOne({
            where: { machineKey: machineData.machineKey },
          })

          if (existingMachine) {
            // 기존 데이터 업데이트
            await machineRepository.update(
              { machineKey: machineData.machineKey },
              {
                name: machineData.name,
                nameEn: machineData.nameEn,
                imageUrl: machineData.imageUrl,
                shortDesc: machineData.shortDesc,
                category: machineData.category,
                difficulty: machineData.difficulty,
                anatomy: machineData.anatomy,
                guide: machineData.guide,
                training: machineData.training,
                extraInfo: machineData.extraInfo,
                isActive: machineData.isActive,
                updatedAt: new Date(),
              }
            )
          } else {
            // 새로운 데이터 추가
            const machine = machineRepository.create(machineData)
            await machineRepository.save(machine)
          }
        }

        logger.info('✅ 운동기구 데이터 동기화 완료')
      } else {
        logger.warn('⚠️ machinesData.json 파일을 찾을 수 없습니다.')
      }
    } catch (error) {
      logger.error('❌ 운동기구 데이터 동기화 실패:', error)
    }
  }

  /**
   * 데이터 정리
   */
  private async cleanupData(): Promise<void> {
    logger.info('🧹 데이터 정리 중...')

    // 비활성화된 운동기구 정리
    const machineRepository = AppDataSource.getRepository(Machine)
    await machineRepository.update(
      { isActive: false },
      { updatedAt: new Date() }
    )

    // 오래된 인증 토큰 정리
    const verificationTokenRepository =
      AppDataSource.getRepository(VerificationToken)
    const passwordResetTokenRepository =
      AppDataSource.getRepository(PasswordResetToken)

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    await verificationTokenRepository.delete({
      createdAt: { $lt: oneDayAgo } as any,
    })

    await passwordResetTokenRepository.delete({
      createdAt: { $lt: oneDayAgo } as any,
    })

    logger.info('✅ 데이터 정리 완료')
  }

  /**
   * 전체 데이터 삭제
   */
  private async clearAllData(): Promise<void> {
    logger.info('🗑️ 전체 데이터 삭제 중...')

    const entities = [
      VerificationToken,
      PasswordResetToken,
      WorkoutReminder,
      WorkoutProgress,
      WorkoutStats,
      ExerciseSet,
      WorkoutSession,
      WorkoutGoal,
      WorkoutPlanExercise,
      WorkoutPlan,
      Like,
      Comment,
      Post,
      UserStreak,
      Milestone,
      UserReward,
      ExpHistory,
      UserLevel,
      Machine,
      Gym,
      User,
    ]

    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity)
      await repository.clear()
    }

    logger.info('✅ 전체 데이터 삭제 완료')
  }

  /**
   * 정리 작업
   */
  private async cleanup(): Promise<void> {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy()
        logger.info('🔌 데이터베이스 연결 종료')
      }
    } catch (error) {
      logger.error('❌ 정리 작업 중 오류:', error)
    }
  }

  /**
   * 결과 요약 출력
   */
  private printSummary(): void {
    const executionTime = (this.result.executionTime / 1000).toFixed(2)

    console.log('\n' + '='.repeat(60))
    console.log('📊 Master Seed Script 실행 결과')
    console.log('='.repeat(60))
    console.log(`⏱️  실행 시간: ${executionTime}초`)
    console.log(`✅ 성공 여부: ${this.result.success ? '성공' : '실패'}`)
    console.log(`📝 메시지: ${this.result.message}`)
    console.log('\n📈 생성된 데이터:')
    console.log(`   👤 사용자: ${this.result.data.users}명`)
    console.log(`   🏋️ 헬스장: ${this.result.data.gyms}개`)
    console.log(`   🔧 운동기구: ${this.result.data.machines}개`)
    console.log(`   📋 워크아웃 플랜: ${this.result.data.workoutPlans}개`)
    console.log(`   📝 게시글: ${this.result.data.posts}개`)

    if (this.result.data.errors.length > 0) {
      console.log('\n❌ 오류 목록:')
      this.result.data.errors.forEach(error => {
        console.log(`   - ${error}`)
      })
    }

    console.log('='.repeat(60))
  }
}

// ============================================================================
// CLI 인터페이스
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const mode = (args[0] as SeedOptions['mode']) || 'initial'

  const options: SeedOptions = {
    mode,
    skipUsers: args.includes('--skip-users'),
    skipGyms: args.includes('--skip-gyms'),
    skipMachines: args.includes('--skip-machines'),
    skipWorkoutData: args.includes('--skip-workout'),
    skipCommunityData: args.includes('--skip-community'),
    forceUpdate: args.includes('--force'),
  }

  const seedScript = new MasterSeedScript(options)
  const result = await seedScript.execute()

  // 성공/실패에 따른 종료 코드
  process.exit(result.success ? 0 : 1)
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main().catch(error => {
    console.error('💥 치명적 오류:', error)
    process.exit(1)
  })
}

export { MasterSeedScript, type SeedOptions, type SeedResult }
