// ============================================================================
// 통합 DB Seed 스크립트 - EC2 배포용
// ============================================================================
// 모든 초기 데이터를 통합하여 관리하는 스크립트
// EC2 환경에서 최적화된 성능으로 실행

import { AppDataSource } from '@backend/config/databaseConfig'
import { logger } from '@backend/utils/logger'
import bcrypt from 'bcrypt'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// 엔티티 imports - 동적 import로 변경
// import { User } from '@backend/entities/User'
// import { Gym } from '@backend/entities/Gym'
// import { Machine } from '@backend/entities/Machine'
// import { UserLevel } from '@backend/entities/UserLevel'
// import { WorkoutPlan } from '@backend/entities/WorkoutPlan'
// import { WorkoutGoal } from '@backend/entities/WorkoutGoal'
// import { WorkoutSession } from '@backend/entities/WorkoutSession'
// import { ExerciseSet } from '@backend/entities/ExerciseSet'
// import { Post } from '@backend/entities/Post'
// import { Comment } from '@backend/entities/Comment'
// import { HomePageConfig } from '@backend/entities/HomePageConfig'
// import { WorkoutStats } from '@backend/entities/WorkoutStats'
// import { WorkoutProgress } from '@backend/entities/WorkoutProgress'

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================================================
// 모듈 1: 데이터 정리 및 초기화
// ============================================================================
export class DatabaseCleaner {
  private static readonly TABLES_TO_CLEAR = [
    'user_rewards',
    'milestones', 
    'user_streaks',
    'exp_history',
    'workout_plan_exercises',
    'workout_sessions',
    'workout_goals',
    'workout_plans',
    'exercise_sets',
    'post_likes',
    'comments',
    'posts',
    'user_levels',
    'machines',
    'gym',
    'users',
    'home_page_configs'
  ]

  static async clearDatabase(): Promise<void> {
    logger.info('🧹 데이터베이스 정리 시작...')
    
    try {
      // 외래키 제약조건 비활성화
      await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0')
      logger.info('✅ 외래키 제약조건 비활성화 완료')

      // 테이블별 데이터 삭제
      for (const table of this.TABLES_TO_CLEAR) {
        try {
          await AppDataSource.query(`DELETE FROM ${table}`)
          logger.info(`✅ ${table} 테이블 데이터 삭제 완료`)
        } catch (error) {
          logger.info(`ℹ️ ${table} 테이블이 존재하지 않거나 이미 비어있습니다`)
        }
      }

      // 외래키 제약조건 재활성화
      await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1')
      logger.info('✅ 외래키 제약조건 재활성화 완료')
      
    } catch (error) {
      logger.error('❌ 데이터베이스 정리 실패:', error)
      throw error
    }
  }
}

// ============================================================================
// 모듈 2: 기구 데이터 시드
// ============================================================================
export class MachineSeeder {
  private static readonly MACHINE_DATA_PATH = join(__dirname, '../../../machine_cards_data.json')

  static async seedMachines(): Promise<any[]> {
    logger.info('🔧 기구 데이터 시드 시작...')
    
    try {
      // JSON 파일에서 기구 데이터 읽기
      const machineData = JSON.parse(readFileSync(this.MACHINE_DATA_PATH, 'utf8'))
      const { Machine } = await import('@backend/entities/Machine')
      const machineRepository = AppDataSource.getRepository(Machine)
      const createdMachines: any[] = []

      // 카테고리 매핑 함수
      const mapCategory = (category: string): string => {
        const categoryMap: Record<string, string> = {
          'strength': 'fullbody',
          'cardio': 'cardio',
          'chest': 'chest',
          'back': 'back',
          'shoulders': 'shoulders',
          'arms': 'arms',
          'legs': 'legs',
          'core': 'core'
        }
        return categoryMap[category] || 'fullbody'
      }

      // 날짜 형식 변환 함수
      const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 19).replace('T', ' ')
      }

      // 배치 처리로 성능 최적화
      const batchSize = 10
      for (let i = 0; i < machineData.length; i += batchSize) {
        const batch = machineData.slice(i, i + batchSize)
        const machines = batch.map((machine: any) => {
          return machineRepository.create({
            id: machine.id,
            machineKey: machine.machineKey,
            name: machine.name,
            nameKo: machine.nameKo,
            nameEn: machine.nameEn,
            imageUrl: machine.imageUrl,
            shortDesc: machine.shortDesc,
            detailDesc: machine.detailDesc,
            positiveEffect: machine.positiveEffect,
            category: mapCategory(machine.category),
            targetMuscles: machine.targetMuscles,
            difficulty: machine.difficulty,
            videoUrl: machine.videoUrl,
            isActive: machine.isActive,
            createdAt: new Date(formatDate(machine.createdAt)),
            updatedAt: new Date(formatDate(machine.updatedAt))
          })
        })

        const savedMachines = await machineRepository.save(machines)
        createdMachines.push(...savedMachines)
        logger.info(`✅ 기구 배치 ${Math.floor(i / batchSize) + 1} 완료 (${savedMachines.length}개)`)
      }

      logger.info(`✅ 총 ${createdMachines.length}개 기구 데이터 시드 완료`)
      return createdMachines
      
    } catch (error) {
      logger.error('❌ 기구 데이터 시드 실패:', error)
      throw error
    }
  }
}

// ============================================================================
// 모듈 3: 사용자 데이터 시드
// ============================================================================
export class UserSeeder {
  private static readonly SAMPLE_USERS = [
    {
      email: 'admin@deukgeun.com',
      password: 'admin123!',
      nickname: '관리자',
      name: '관리자',
      phone: '010-1234-5678',
      birthDate: '1990-01-01',
      gender: 'male',
      isActive: true,
      role: 'admin'
    },
    {
      email: 'user1@deukgeun.com',
      password: 'user123!',
      nickname: '헬스초보',
      name: '김철수',
      phone: '010-2345-6789',
      birthDate: '1995-05-15',
      gender: 'male',
      isActive: true,
      role: 'user'
    },
    {
      email: 'user2@deukgeun.com',
      password: 'user123!',
      nickname: '피트니스러버',
      name: '이영희',
      phone: '010-3456-7890',
      birthDate: '1992-08-20',
      gender: 'female',
      isActive: true,
      role: 'user'
    },
    {
      email: 'user3@deukgeun.com',
      password: 'user123!',
      nickname: '근육왕',
      name: '박민수',
      phone: '010-4567-8901',
      birthDate: '1988-12-10',
      gender: 'male',
      isActive: true,
      role: 'user'
    }
  ]

  static async seedUsers(): Promise<any[]> {
    logger.info('👤 사용자 데이터 시드 시작...')
    
    try {
      const { User } = await import('@backend/entities/User')
      const userRepository = AppDataSource.getRepository(User)
      const createdUsers: any[] = []

      for (const userData of this.SAMPLE_USERS) {
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        const user = userRepository.create({
          ...userData,
          password: hashedPassword
        })
        const savedUser = await userRepository.save(user)
        createdUsers.push(savedUser)
        logger.info(`✅ 사용자 생성 완료: ${savedUser.nickname}`)
      }

      logger.info(`✅ 총 ${createdUsers.length}명 사용자 데이터 시드 완료`)
      return createdUsers
      
    } catch (error) {
      logger.error('❌ 사용자 데이터 시드 실패:', error)
      throw error
    }
  }
}

// ============================================================================
// 모듈 4: 헬스장 데이터 시드
// ============================================================================
export class GymSeeder {
  private static readonly SAMPLE_GYMS = [
    {
      name: '강남 피트니스',
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      latitude: 37.5665,
      longitude: 126.978,
      is24Hours: true,
      hasParking: true,
      hasShower: true,
      description: '강남 최고의 피트니스 센터',
      facilities: ['샤워실', '주차장', '락커룸', '프리웨이트존'],
      operatingHours: '24시간',
      price: 80000
    },
    {
      name: '홍대 헬스장',
      address: '서울특별시 마포구 홍대로 456',
      phone: '02-2345-6789',
      latitude: 37.5575,
      longitude: 126.925,
      is24Hours: false,
      hasParking: false,
      hasShower: true,
      description: '홍대 지역 대표 헬스장',
      facilities: ['샤워실', '락커룸', '프리웨이트존'],
      operatingHours: '06:00-24:00',
      price: 60000
    },
    {
      name: '잠실 스포츠센터',
      address: '서울특별시 송파구 올림픽로 789',
      phone: '02-3456-7890',
      latitude: 37.5139,
      longitude: 127.1006,
      is24Hours: true,
      hasParking: true,
      hasShower: true,
      description: '올림픽공원 인근 대형 스포츠센터',
      facilities: ['샤워실', '주차장', '락커룸', '프리웨이트존', '수영장'],
      operatingHours: '24시간',
      price: 100000
    }
  ]

  static async seedGyms(): Promise<any[]> {
    logger.info('🏋️ 헬스장 데이터 시드 시작...')
    
    try {
      const { Gym } = await import('@backend/entities/Gym')
      const gymRepository = AppDataSource.getRepository(Gym)
      const createdGyms: any[] = []

      for (const gymData of this.SAMPLE_GYMS) {
        const gym = gymRepository.create(gymData)
        const savedGym = await gymRepository.save(gym)
        createdGyms.push(savedGym)
        logger.info(`✅ 헬스장 생성 완료: ${savedGym.name}`)
      }

      logger.info(`✅ 총 ${createdGyms.length}개 헬스장 데이터 시드 완료`)
      return createdGyms
      
    } catch (error) {
      logger.error('❌ 헬스장 데이터 시드 실패:', error)
      throw error
    }
  }
}

// ============================================================================
// 모듈 5: 사용자 레벨 시스템 시드
// ============================================================================
export class UserLevelSeeder {
  static async seedUserLevels(users: any[]): Promise<void> {
    logger.info('⭐ 사용자 레벨 시스템 시드 시작...')
    
    try {
      const { UserLevel } = await import('@backend/entities/UserLevel')
      const userLevelRepository = AppDataSource.getRepository(UserLevel)

      for (const user of users) {
        const userLevel = userLevelRepository.create({
          userId: user.id,
          level: 1,
          experience: 0,
          totalExperience: 0,
          nextLevelExp: 1000
        })
        await userLevelRepository.save(userLevel)
        logger.info(`✅ 사용자 레벨 생성 완료: ${user.nickname} (레벨 1)`)
      }

      logger.info(`✅ 총 ${users.length}명 사용자 레벨 시스템 시드 완료`)
      
    } catch (error) {
      logger.error('❌ 사용자 레벨 시스템 시드 실패:', error)
      throw error
    }
  }
}

// ============================================================================
// 모듈 6: 홈페이지 설정 시드
// ============================================================================
export class HomePageConfigSeeder {
  private static readonly DEFAULT_CONFIGS = [
    // Hero 섹션
    { key: 'heroTitle', value: '득근득근', type: 'text', description: '메인 타이틀' },
    { key: 'heroSubtitle', value: '과거의 나를 뛰어넘는 것이 진정한 성장이다.', type: 'text', description: '메인 부제목' },
    { key: 'heroPrimaryButtonText', value: '헬스장 찾기', type: 'text', description: '주요 버튼 텍스트' },
    { key: 'heroSecondaryButtonText', value: '머신 가이드', type: 'text', description: '보조 버튼 텍스트' },
    { key: 'heroVideoUrl', value: '/video/serviceMovie.mp4', type: 'text', description: '히어로 비디오 URL' },
    
    // 서비스 섹션
    { key: 'serviceTitle', value: '우리의 서비스', type: 'text', description: '서비스 섹션 타이틀' },
    { key: 'serviceSubtitle', value: '개인 맞춤형 헬스 솔루션을 제공합니다', type: 'text', description: '서비스 섹션 부제목' },
    
    // 기능 섹션
    { key: 'featureTitle', value: '주요 기능', type: 'text', description: '기능 섹션 타이틀' },
    { key: 'featureSubtitle', value: '다양한 기능으로 당신의 운동을 도와드립니다', type: 'text', description: '기능 섹션 부제목' }
  ]

  static async seedHomePageConfigs(): Promise<void> {
    logger.info('🏠 홈페이지 설정 시드 시작...')
    
    try {
      const { HomePageConfig } = await import('@backend/entities/HomePageConfig')
      const configRepository = AppDataSource.getRepository(HomePageConfig)

      for (const config of this.DEFAULT_CONFIGS) {
        const homePageConfig = configRepository.create(config)
        await configRepository.save(homePageConfig)
      }

      logger.info(`✅ 총 ${this.DEFAULT_CONFIGS.length}개 홈페이지 설정 시드 완료`)
      
    } catch (error) {
      logger.error('❌ 홈페이지 설정 시드 실패:', error)
      throw error
    }
  }
}

// ============================================================================
// 모듈 7: 커뮤니티 데이터 시드
// ============================================================================
export class CommunitySeeder {
  static async seedCommunityData(users: any[]): Promise<void> {
    logger.info('📝 커뮤니티 데이터 시드 시작...')
    
    try {
      const { Post } = await import('@backend/entities/Post')
      const { Comment } = await import('@backend/entities/Comment')
      const postRepository = AppDataSource.getRepository(Post)
      const commentRepository = AppDataSource.getRepository(Comment)

      // 샘플 게시글 생성
      const samplePosts = [
        {
          title: '벤치프레스 100kg 달성 후기',
          content: '드디어 벤치프레스 100kg을 띄웠습니다! 6개월간의 노력이 결실을 맺었네요.',
          authorId: users[1].id,
          category: 'achievement',
          tags: ['벤치프레스', '100kg', '달성']
        },
        {
          title: '초보자를 위한 스쿼트 가이드',
          content: '스쿼트 자세와 호흡법에 대해 자세히 설명드립니다.',
          authorId: users[2].id,
          category: 'guide',
          tags: ['스쿼트', '초보자', '가이드']
        },
        {
          title: '헬스장에서의 매너',
          content: '모두가 편안하게 운동할 수 있도록 지켜야 할 매너들을 정리했습니다.',
          authorId: users[0].id,
          category: 'etiquette',
          tags: ['매너', '에티켓', '헬스장']
        }
      ]

      for (const postData of samplePosts) {
        const post = postRepository.create(postData)
        const savedPost = await postRepository.save(post)
        logger.info(`✅ 게시글 생성 완료: ${savedPost.title}`)

        // 댓글 생성
        const sampleComments = [
          { content: '축하드립니다! 정말 대단해요!', authorId: users[2].id, postId: savedPost.id },
          { content: '저도 도전해보고 싶네요', authorId: users[3].id, postId: savedPost.id }
        ]

        for (const commentData of sampleComments) {
          const comment = commentRepository.create(commentData)
          await commentRepository.save(comment)
        }
      }

      logger.info('✅ 커뮤니티 데이터 시드 완료')
      
    } catch (error) {
      logger.error('❌ 커뮤니티 데이터 시드 실패:', error)
      throw error
    }
  }
}

// ============================================================================
// 통합 시드 실행기
// ============================================================================
export class UnifiedSeeder {
  static async run(): Promise<void> {
    const startTime = Date.now()
    
    try {
      logger.info('🚀 통합 DB 시드 스크립트 시작...')
      logger.info('='.repeat(60))

      // 데이터베이스 연결
      await AppDataSource.initialize()
      logger.info('✅ 데이터베이스 연결 성공')

      // 1. 기존 데이터 정리
      await DatabaseCleaner.clearDatabase()

      // 2. 기구 데이터 시드
      const machines = await MachineSeeder.seedMachines()

      // 3. 사용자 데이터 시드
      const users = await UserSeeder.seedUsers()

      // 4. 헬스장 데이터 시드
      const gyms = await GymSeeder.seedGyms()

      // 5. 사용자 레벨 시스템 시드
      await UserLevelSeeder.seedUserLevels(users)

      // 6. 홈페이지 설정 시드
      await HomePageConfigSeeder.seedHomePageConfigs()

      // 7. 커뮤니티 데이터 시드
      await CommunitySeeder.seedCommunityData(users)

      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000

      logger.info('='.repeat(60))
      logger.info('🎉 통합 DB 시드 완료!')
      logger.info(`📊 생성된 데이터:`)
      logger.info(`   - 기구: ${machines.length}개`)
      logger.info(`   - 사용자: ${users.length}명`)
      logger.info(`   - 헬스장: ${gyms.length}개`)
      logger.info(`⏱️ 실행 시간: ${duration.toFixed(2)}초`)
      logger.info('='.repeat(60))

    } catch (error) {
      logger.error('❌ 통합 DB 시드 실패:', error)
      throw error
    } finally {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy()
        logger.info('✅ 데이터베이스 연결 종료')
      }
    }
  }
}

// ============================================================================
// 스크립트 실행
// ============================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
  UnifiedSeeder.run()
    .then(() => {
      logger.info('✅ 스크립트 실행 완료')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('❌ 스크립트 실행 실패:', error)
      process.exit(1)
    })
}

export default UnifiedSeeder
