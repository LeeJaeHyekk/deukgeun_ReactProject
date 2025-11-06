// ============================================================================
// 최종 통합 DB Seed 스크립트 - EC2 배포용
// ============================================================================
// 기존 TypeORM 설정을 활용하되 엔티티 import 문제를 회피
// EC2 환경에서 안정적으로 실행

import { AppDataSource } from '../src/backend/config/databaseConfig.js'
import bcrypt from 'bcrypt'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================================================
// 데이터베이스 정리
// ============================================================================
async function clearDatabase(): Promise<void> {
  console.log('🧹 데이터베이스 정리 시작...')
  
  const tablesToClear = [
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

  try {
    // 외래키 제약조건 비활성화
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0')
    console.log('✅ 외래키 제약조건 비활성화 완료')

    // 테이블별 데이터 삭제
    for (const table of tablesToClear) {
      try {
        await AppDataSource.query(`DELETE FROM ${table}`)
        console.log(`✅ ${table} 테이블 데이터 삭제 완료`)
      } catch (error) {
        console.log(`ℹ️ ${table} 테이블이 존재하지 않거나 이미 비어있습니다`)
      }
    }

    // 외래키 제약조건 재활성화
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1')
    console.log('✅ 외래키 제약조건 재활성화 완료')
    
  } catch (error) {
    console.error('❌ 데이터베이스 정리 실패:', error)
    throw error
  }
}

// ============================================================================
// 기구 데이터 시드
// ============================================================================
async function seedMachines(): Promise<void> {
  console.log('🔧 기구 데이터 시드 시작...')
  
  try {
    // JSON 파일에서 기구 데이터 읽기
    const machineDataPath = join(__dirname, '../machine_cards_data.json')
    const machineData = JSON.parse(readFileSync(machineDataPath, 'utf8'))

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
      
      for (const machine of batch) {
        await AppDataSource.query(`
          INSERT INTO machines (id, machineKey, name, nameKo, nameEn, imageUrl, shortDesc, detailDesc, positiveEffect, category, targetMuscles, difficulty, videoUrl, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          machine.id,
          machine.machineKey,
          machine.name,
          machine.nameKo,
          machine.nameEn,
          machine.imageUrl,
          machine.shortDesc,
          machine.detailDesc,
          machine.positiveEffect,
          mapCategory(machine.category),
          JSON.stringify(machine.targetMuscles),
          machine.difficulty,
          machine.videoUrl,
          machine.isActive ? 1 : 0,
          formatDate(machine.createdAt),
          formatDate(machine.updatedAt)
        ])
      }
      
      console.log(`✅ 기구 배치 ${Math.floor(i / batchSize) + 1} 완료 (${batch.length}개)`)
    }

    console.log(`✅ 총 ${machineData.length}개 기구 데이터 시드 완료`)
    
  } catch (error) {
    console.error('❌ 기구 데이터 시드 실패:', error)
    throw error
  }
}

// ============================================================================
// 사용자 데이터 시드
// ============================================================================
async function seedUsers(): Promise<any[]> {
  console.log('👤 사용자 데이터 시드 시작...')
  
  const sampleUsers = [
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
    }
  ]

  try {
    const createdUsers: any[] = []

    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      const result = await AppDataSource.query(`
        INSERT INTO users (email, password, nickname, name, phone, birthDate, gender, isActive, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        userData.email,
        hashedPassword,
        userData.nickname,
        userData.name,
        userData.phone,
        userData.birthDate,
        userData.gender,
        userData.isActive,
        userData.role
      ])

      const userId = result.insertId
      createdUsers.push({ id: userId, ...userData })
      console.log(`✅ 사용자 생성 완료: ${userData.nickname}`)
    }

    console.log(`✅ 총 ${createdUsers.length}명 사용자 데이터 시드 완료`)
    return createdUsers
    
  } catch (error) {
    console.error('❌ 사용자 데이터 시드 실패:', error)
    throw error
  }
}

// ============================================================================
// 헬스장 데이터 시드
// ============================================================================
async function seedGyms(): Promise<void> {
  console.log('🏋️ 헬스장 데이터 시드 시작...')
  
  const sampleGyms = [
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
      facilities: '샤워실,주차장,락커룸,프리웨이트존',
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
      facilities: '샤워실,락커룸,프리웨이트존',
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
      facilities: '샤워실,주차장,락커룸,프리웨이트존,수영장',
      operatingHours: '24시간',
      price: 100000
    }
  ]

  try {
    for (const gymData of sampleGyms) {
      await AppDataSource.query(`
        INSERT INTO gym (name, address, phone, latitude, longitude, is24Hours, hasParking, hasShower, description, facilities, operatingHours, price, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        gymData.name,
        gymData.address,
        gymData.phone,
        gymData.latitude,
        gymData.longitude,
        gymData.is24Hours,
        gymData.hasParking,
        gymData.hasShower,
        gymData.description,
        gymData.facilities,
        gymData.operatingHours,
        gymData.price
      ])
      console.log(`✅ 헬스장 생성 완료: ${gymData.name}`)
    }

    console.log(`✅ 총 ${sampleGyms.length}개 헬스장 데이터 시드 완료`)
    
  } catch (error) {
    console.error('❌ 헬스장 데이터 시드 실패:', error)
    throw error
  }
}

// ============================================================================
// 사용자 레벨 시스템 시드
// ============================================================================
async function seedUserLevels(users: any[]): Promise<void> {
  console.log('⭐ 사용자 레벨 시스템 시드 시작...')
  
  try {
    for (const user of users) {
      await AppDataSource.query(`
        INSERT INTO user_levels (userId, level, experience, totalExperience, nextLevelExp, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [user.id, 1, 0, 0, 1000])
      console.log(`✅ 사용자 레벨 생성 완료: ${user.nickname} (레벨 1)`)
    }

    console.log(`✅ 총 ${users.length}명 사용자 레벨 시스템 시드 완료`)
    
  } catch (error) {
    console.error('❌ 사용자 레벨 시스템 시드 실패:', error)
    throw error
  }
}

// ============================================================================
// 홈페이지 설정 시드
// ============================================================================
async function seedHomePageConfigs(): Promise<void> {
  console.log('🏠 홈페이지 설정 시드 시작...')
  
  const defaultConfigs = [
    { key: 'heroTitle', value: '득근득근', type: 'text', description: '메인 타이틀' },
    { key: 'heroSubtitle', value: '과거의 나를 뛰어넘는 것이 진정한 성장이다.', type: 'text', description: '메인 부제목' },
    { key: 'heroPrimaryButtonText', value: '헬스장 찾기', type: 'text', description: '주요 버튼 텍스트' },
    { key: 'heroSecondaryButtonText', value: '머신 가이드', type: 'text', description: '보조 버튼 텍스트' },
    { key: 'heroVideoUrl', value: '/video/serviceMovie.mp4', type: 'text', description: '히어로 비디오 URL' },
    { key: 'serviceTitle', value: '우리의 서비스', type: 'text', description: '서비스 섹션 타이틀' },
    { key: 'serviceSubtitle', value: '개인 맞춤형 헬스 솔루션을 제공합니다', type: 'text', description: '서비스 섹션 부제목' },
    { key: 'featureTitle', value: '주요 기능', type: 'text', description: '기능 섹션 타이틀' },
    { key: 'featureSubtitle', value: '다양한 기능으로 당신의 운동을 도와드립니다', type: 'text', description: '기능 섹션 부제목' }
  ]

  try {
    for (const config of defaultConfigs) {
      await AppDataSource.query(`
        INSERT INTO home_page_configs (key, value, type, description, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [config.key, config.value, config.type, config.description])
    }

    console.log(`✅ 총 ${defaultConfigs.length}개 홈페이지 설정 시드 완료`)
    
  } catch (error) {
    console.error('❌ 홈페이지 설정 시드 실패:', error)
    throw error
  }
}

// ============================================================================
// 커뮤니티 데이터 시드
// ============================================================================
async function seedCommunityData(users: any[]): Promise<void> {
  console.log('📝 커뮤니티 데이터 시드 시작...')
  
  const samplePosts = [
    {
      title: '벤치프레스 100kg 달성 후기',
      content: '드디어 벤치프레스 100kg을 띄웠습니다! 6개월간의 노력이 결실을 맺었네요.',
      authorId: users[1]?.id || 2,
      category: 'achievement',
      tags: '벤치프레스,100kg,달성'
    },
    {
      title: '초보자를 위한 스쿼트 가이드',
      content: '스쿼트 자세와 호흡법에 대해 자세히 설명드립니다.',
      authorId: users[2]?.id || 3,
      category: 'guide',
      tags: '스쿼트,초보자,가이드'
    },
    {
      title: '헬스장에서의 매너',
      content: '모두가 편안하게 운동할 수 있도록 지켜야 할 매너들을 정리했습니다.',
      authorId: users[0]?.id || 1,
      category: 'etiquette',
      tags: '매너,에티켓,헬스장'
    }
  ]

  try {
    for (const postData of samplePosts) {
      const result = await AppDataSource.query(`
        INSERT INTO posts (title, content, authorId, category, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [postData.title, postData.content, postData.authorId, postData.category, postData.tags])

      const postId = result.insertId
      console.log(`✅ 게시글 생성 완료: ${postData.title}`)

      // 댓글 생성
      const sampleComments = [
        { content: '축하드립니다! 정말 대단해요!', authorId: users[2]?.id || 3, postId },
        { content: '저도 도전해보고 싶네요', authorId: users[1]?.id || 2, postId }
      ]

      for (const commentData of sampleComments) {
        await AppDataSource.query(`
          INSERT INTO comments (content, authorId, postId, createdAt, updatedAt)
          VALUES (?, ?, ?, NOW(), NOW())
        `, [commentData.content, commentData.authorId, commentData.postId])
      }
    }

    console.log('✅ 커뮤니티 데이터 시드 완료')
    
  } catch (error) {
    console.error('❌ 커뮤니티 데이터 시드 실패:', error)
    throw error
  }
}

// ============================================================================
// 통합 시드 실행
// ============================================================================
async function runUnifiedSeed(): Promise<void> {
  const startTime = Date.now()
  
  try {
    console.log('🚀 통합 DB 시드 스크립트 시작...')
    console.log('='.repeat(60))

    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log('✅ 데이터베이스 연결 성공')

    // 1. 기존 데이터 정리
    await clearDatabase()

    // 2. 기구 데이터 시드
    await seedMachines()

    // 3. 사용자 데이터 시드
    const users = await seedUsers()

    // 4. 헬스장 데이터 시드
    await seedGyms()

    // 5. 사용자 레벨 시스템 시드
    await seedUserLevels(users)

    // 6. 홈페이지 설정 시드
    await seedHomePageConfigs()

    // 7. 커뮤니티 데이터 시드
    await seedCommunityData(users)

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log('='.repeat(60))
    console.log('🎉 통합 DB 시드 완료!')
    console.log(`⏱️ 실행 시간: ${duration.toFixed(2)}초`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ 통합 DB 시드 실패:', error)
    throw error
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('✅ 데이터베이스 연결 종료')
    }
  }
}

// ============================================================================
// 스크립트 실행
// ============================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
  runUnifiedSeed()
    .then(() => {
      console.log('✅ 스크립트 실행 완료')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error)
      process.exit(1)
    })
}

export default runUnifiedSeed
