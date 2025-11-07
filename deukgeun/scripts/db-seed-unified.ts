// ============================================================================
// 통합 DB Seed 스크립트 - EC2 배포용 (최종 통합 버전)
// ============================================================================
// 모든 초기 데이터를 통합하여 관리하는 스크립트
// EC2 환경에서 최적화된 성능으로 실행
// 안전장치 및 타입가드 포함
// ============================================================================

import "reflect-metadata"
import { DataSource } from "typeorm"
import { config } from "dotenv"
import bcrypt from 'bcrypt'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ============================================================================
// 타입 정의
// ============================================================================

interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
}

interface UserSeedData {
  email: string
  password: string
  nickname: string
  name?: string
  phone?: string
  birthday?: string
  gender?: 'male' | 'female' | 'other'
  isActive: boolean
  role: 'user' | 'admin' | 'moderator'
}

interface GymSeedData {
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  is24Hours: boolean
  hasParking: boolean
  hasShower: boolean
  facilities?: string
  openHour?: string
  closeHour?: string
  price?: string
}

interface PostSeedData {
  title: string
  content: string
  author: string
  authorId: number
  category: 'general' | 'workout' | 'nutrition' | 'motivation' | 'tips' | 'questions' | 'achievements' | 'challenges'
  tags?: string[]
}

interface CommentSeedData {
  content: string
  author: string
  authorId: number
  postId: number
}

interface HomePageConfigSeedData {
  key: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'json'
  description?: string
}

interface MachineSeedData {
  id: number
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  positiveEffect?: string
  category: string
  targetMuscles?: string[]
  difficulty: string
  videoUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// 환경 변수 로드 및 검증
// ============================================================================

function loadEnvironmentVariables(): DatabaseConfig {
  // 환경 변수 파일 순차 로드
  config({ path: 'src/backend/env.production' })
  config({ path: '.env.production' })
  config() // 기본 .env 파일도 로드

  const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db",
  }

  // 환경 변수 검증
  if (!dbConfig.password) {
    throw new Error("❌ DB_PASSWORD 환경 변수가 설정되지 않았습니다.")
  }

  if (!dbConfig.database) {
    throw new Error("❌ DB_DATABASE 또는 DB_NAME 환경 변수가 설정되지 않았습니다.")
  }

  console.log('📊 데이터베이스 연결 설정:')
  console.log(`   - Host: ${dbConfig.host}`)
  console.log(`   - Port: ${dbConfig.port}`)
  console.log(`   - Username: ${dbConfig.username}`)
  console.log(`   - Database: ${dbConfig.database}`)
  console.log(`   - Password: ${dbConfig.password ? '***' : 'NOT SET'}`)

  return dbConfig
}

// ============================================================================
// 타입 가드 및 검증 함수
// ============================================================================

function isValidId(id: unknown): id is number {
  return (
    typeof id === "number" &&
    !isNaN(id) &&
    isFinite(id) &&
    id > 0 &&
    Number.isInteger(id)
  )
}

function isValidString(value: unknown, maxLength?: number): value is string {
  if (typeof value !== "string") return false
  if (maxLength !== undefined && value.length > maxLength) return false
  return value.trim().length > 0
}

function isValidEmail(email: unknown): email is string {
  if (!isValidString(email)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidDate(dateString: unknown): dateString is string {
  if (!isValidString(dateString)) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

function validateUserData(userData: unknown): userData is UserSeedData {
  if (!userData || typeof userData !== "object") return false
  
  const user = userData as Partial<UserSeedData>
  
  if (!isValidEmail(user.email)) return false
  if (!isValidString(user.password, 255)) return false
  if (!isValidString(user.nickname, 100)) return false
  if (user.phone && !isValidString(user.phone, 20)) return false
  if (user.birthday && !isValidDate(user.birthday)) return false
  if (user.gender && !['male', 'female', 'other'].includes(user.gender)) return false
  if (typeof user.isActive !== "boolean") return false
  if (!['user', 'admin', 'moderator'].includes(user.role || '')) return false
  
  return true
}

function validateGymData(gymData: unknown): gymData is GymSeedData {
  if (!gymData || typeof gymData !== "object") return false
  
  const gym = gymData as Partial<GymSeedData>
  
  if (!isValidString(gym.name, 255)) return false
  if (!isValidString(gym.address, 255)) return false
  if (typeof gym.latitude !== "number" || isNaN(gym.latitude)) return false
  if (typeof gym.longitude !== "number" || isNaN(gym.longitude)) return false
  if (typeof gym.is24Hours !== "boolean") return false
  if (typeof gym.hasParking !== "boolean") return false
  if (typeof gym.hasShower !== "boolean") return false
  
  return true
}

function validateMachineData(machineData: unknown): machineData is MachineSeedData {
  if (!machineData || typeof machineData !== "object") return false
  
  const machine = machineData as Partial<MachineSeedData>
  
  if (!isValidId(machine.id)) return false
  if (!isValidString(machine.machineKey, 100)) return false
  if (!isValidString(machine.name, 100)) return false
  if (!isValidString(machine.imageUrl, 255)) return false
  if (!isValidString(machine.shortDesc, 255)) return false
  if (!isValidString(machine.detailDesc)) return false
  if (typeof machine.isActive !== "boolean") return false
  
  return true
}

// ============================================================================
// 데이터베이스 연결 설정
// ============================================================================

const dbConfig = loadEnvironmentVariables()

const AppDataSource = new DataSource({
  type: "mysql",
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: false,
  logging: false,
  entities: [], // 엔티티는 사용하지 않음 (직접 SQL 쿼리 사용)
  extra: {
    connectionLimit: 10,
    charset: 'utf8mb4',
    timezone: '+09:00'
  }
})

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================================================
// 유틸리티 함수
// ============================================================================

function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    return date.toISOString().slice(0, 19).replace('T', ' ')
  } catch (error) {
    console.warn(`⚠️ 날짜 형식 변환 실패: ${dateString}, 현재 시간 사용`)
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
}

function mapCategory(category: string): string {
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
  return categoryMap[category.toLowerCase()] || 'fullbody'
}

function sanitizeString(value: string): string {
  if (typeof value !== 'string') return ''
  return value.replace(/'/g, "''").trim()
}

function safeJsonStringify(value: unknown): string {
  try {
    if (value === null || value === undefined) return 'NULL'
    if (Array.isArray(value) || typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  } catch (error) {
    console.warn(`⚠️ JSON 직렬화 실패: ${value}`)
    return 'NULL'
  }
}

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
    'homepage_configs'
  ]

  try {
    // 외래키 제약조건 비활성화
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0')
    console.log('✅ 외래키 제약조건 비활성화 완료')

    // 테이블별 데이터 삭제
    for (const table of tablesToClear) {
      try {
        const result = await AppDataSource.query(`DELETE FROM ${table}`)
        const affectedRows = Array.isArray(result) ? result.length : (result as any)?.affectedRows || 0
        console.log(`✅ ${table} 테이블 데이터 삭제 완료 (${affectedRows}개 행)`)
      } catch (error: any) {
        // 테이블이 존재하지 않거나 이미 비어있는 경우 무시
        if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_TABLE_ERROR') {
          console.log(`ℹ️ ${table} 테이블이 존재하지 않습니다 (건너뜀)`)
        } else {
          console.warn(`⚠️ ${table} 테이블 데이터 삭제 중 오류: ${error?.message || error}`)
        }
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
    // JSON 파일 경로 확인
    const machineDataPath = join(__dirname, '../machine_cards_data.json')
    
    if (!existsSync(machineDataPath)) {
      console.warn(`⚠️ 기구 데이터 파일을 찾을 수 없습니다: ${machineDataPath}`)
      console.log('ℹ️ 기구 데이터 시드를 건너뜁니다.')
      return
    }

    // JSON 파일에서 기구 데이터 읽기
    let machineData: MachineSeedData[]
    try {
      const fileContent = readFileSync(machineDataPath, 'utf8')
      const parsed = JSON.parse(fileContent)
      
      // 배열인지 확인
      if (!Array.isArray(parsed)) {
        throw new Error('기구 데이터가 배열 형식이 아닙니다.')
      }
      
      machineData = parsed
    } catch (error) {
      console.error('❌ 기구 데이터 파일 읽기 실패:', error)
      throw error
    }

    if (machineData.length === 0) {
      console.log('ℹ️ 기구 데이터가 비어있습니다.')
      return
    }

    // 배치 처리로 성능 최적화
    const batchSize = 10
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < machineData.length; i += batchSize) {
      const batch = machineData.slice(i, i + batchSize)
      
      for (const machine of batch) {
        try {
          // 데이터 검증
          if (!validateMachineData(machine)) {
            console.warn(`⚠️ 유효하지 않은 기구 데이터 건너뜀: ${machine.id || 'unknown'}`)
            errorCount++
            continue
          }

          // 카테고리 매핑
          const category = mapCategory(machine.category)
          
          // targetMuscles JSON 변환
          const targetMusclesJson = machine.targetMuscles 
            ? safeJsonStringify(machine.targetMuscles)
            : null

          await AppDataSource.query(`
            INSERT INTO machines (
              id, machineKey, name, nameKo, nameEn, imageUrl, shortDesc, detailDesc, 
              positiveEffect, category, targetMuscles, difficulty, videoUrl, isActive, 
              createdAt, updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            machine.id,
            machine.machineKey,
            machine.name,
            machine.nameKo || null,
            machine.nameEn || null,
            machine.imageUrl,
            machine.shortDesc,
            machine.detailDesc,
            machine.positiveEffect || null,
            category,
            targetMusclesJson,
            machine.difficulty,
            machine.videoUrl || null,
            machine.isActive ? 1 : 0,
            formatDate(machine.createdAt),
            formatDate(machine.updatedAt)
          ])
          
          successCount++
        } catch (error: any) {
          errorCount++
          console.warn(`⚠️ 기구 데이터 삽입 실패 (ID: ${machine.id}): ${error?.message || error}`)
          
          // 중복 키 오류는 무시
          if (error?.code === 'ER_DUP_ENTRY') {
            console.log(`ℹ️ 기구 ID ${machine.id}는 이미 존재합니다 (건너뜀)`)
          }
        }
      }
      
      console.log(`✅ 기구 배치 ${Math.floor(i / batchSize) + 1} 완료 (${batch.length}개 중 ${successCount}개 성공, ${errorCount}개 실패)`)
    }

    console.log(`✅ 총 ${successCount}개 기구 데이터 시드 완료 (${errorCount}개 실패)`)
    
  } catch (error) {
    console.error('❌ 기구 데이터 시드 실패:', error)
    throw error
  }
}

// ============================================================================
// 사용자 데이터 시드
// ============================================================================

async function seedUsers(): Promise<UserSeedData[]> {
  console.log('👤 사용자 데이터 시드 시작...')
  
  const sampleUsers: UserSeedData[] = [
    {
      email: 'admin@deukgeun.com',
      password: 'admin123!',
      nickname: '관리자',
      name: '관리자',
      phone: '010-1234-5678',
      birthday: '1990-01-01',
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
      birthday: '1995-05-15',
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
      birthday: '1992-08-20',
      gender: 'female',
      isActive: true,
      role: 'user'
    }
  ]

  try {
    const createdUsers: UserSeedData[] = []

    for (const userData of sampleUsers) {
      try {
        // 데이터 검증
        if (!validateUserData(userData)) {
          console.warn(`⚠️ 유효하지 않은 사용자 데이터 건너뜀: ${userData.email}`)
          continue
        }

        // 비밀번호 해시
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        
        // 사용자 삽입
        const result = await AppDataSource.query(`
          INSERT INTO users (
            email, password, nickname, name, phone, birthday, gender, isActive, role, 
            createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          userData.email,
          hashedPassword,
          userData.nickname,
          userData.name || null,
          userData.phone || null,
          userData.birthday || null,
          userData.gender || null,
          userData.isActive ? 1 : 0,
          userData.role
        ])

        const userId = (result as any)?.insertId
        if (!isValidId(userId)) {
          throw new Error('사용자 ID를 가져올 수 없습니다.')
        }

        createdUsers.push({ ...userData, id: userId } as any)
        console.log(`✅ 사용자 생성 완료: ${userData.nickname} (ID: ${userId})`)
      } catch (error: any) {
        // 중복 키 오류는 무시
        if (error?.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ 사용자 ${userData.email}는 이미 존재합니다 (건너뜀)`)
          
          // 기존 사용자 ID 가져오기
          try {
            const existingUser = await AppDataSource.query(
              'SELECT id FROM users WHERE email = ?',
              [userData.email]
            )
            if (Array.isArray(existingUser) && existingUser.length > 0) {
              const userId = (existingUser[0] as any)?.id
              if (isValidId(userId)) {
                createdUsers.push({ ...userData, id: userId } as any)
              }
            }
          } catch (lookupError) {
            console.warn(`⚠️ 기존 사용자 조회 실패: ${userData.email}`)
          }
        } else {
          console.error(`❌ 사용자 생성 실패 (${userData.email}): ${error?.message || error}`)
          throw error
        }
      }
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
  
  const sampleGyms: GymSeedData[] = [
    {
      name: '강남 피트니스',
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      latitude: 37.5665,
      longitude: 126.978,
      is24Hours: true,
      hasParking: true,
      hasShower: true,
      facilities: '샤워실,주차장,락커룸,프리웨이트존',
      openHour: '00:00',
      closeHour: '24:00',
      price: '80000'
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
      facilities: '샤워실,락커룸,프리웨이트존',
      openHour: '06:00',
      closeHour: '24:00',
      price: '60000'
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
      facilities: '샤워실,주차장,락커룸,프리웨이트존,수영장',
      openHour: '00:00',
      closeHour: '24:00',
      price: '100000'
    }
  ]

  try {
    for (const gymData of sampleGyms) {
      try {
        // 데이터 검증
        if (!validateGymData(gymData)) {
          console.warn(`⚠️ 유효하지 않은 헬스장 데이터 건너뜀: ${gymData.name}`)
          continue
        }

        await AppDataSource.query(`
          INSERT INTO gym (
            name, address, phone, latitude, longitude, is24Hours, hasParking, hasShower, 
            facilities, openHour, closeHour, price, createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          gymData.name,
          gymData.address,
          gymData.phone || null,
          gymData.latitude,
          gymData.longitude,
          gymData.is24Hours ? 1 : 0,
          gymData.hasParking ? 1 : 0,
          gymData.hasShower ? 1 : 0,
          gymData.facilities || null,
          gymData.openHour || null,
          gymData.closeHour || null,
          gymData.price || null
        ])
        
        console.log(`✅ 헬스장 생성 완료: ${gymData.name}`)
      } catch (error: any) {
        // 중복 키 오류는 무시
        if (error?.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ 헬스장 ${gymData.name}는 이미 존재합니다 (건너뜀)`)
        } else {
          console.error(`❌ 헬스장 생성 실패 (${gymData.name}): ${error?.message || error}`)
          throw error
        }
      }
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

async function seedUserLevels(users: UserSeedData[]): Promise<void> {
  console.log('⭐ 사용자 레벨 시스템 시드 시작...')
  
  try {
    for (const user of users) {
      try {
        const userId = (user as any).id
        
        if (!isValidId(userId)) {
          console.warn(`⚠️ 유효하지 않은 사용자 ID 건너뜀: ${user.email}`)
          continue
        }

        // 기존 레벨 확인
        const existingLevel = await AppDataSource.query(
          'SELECT id FROM user_levels WHERE userId = ?',
          [userId]
        )

        if (Array.isArray(existingLevel) && existingLevel.length > 0) {
          console.log(`ℹ️ 사용자 ${user.nickname}의 레벨이 이미 존재합니다 (건너뜀)`)
          continue
        }

        await AppDataSource.query(`
          INSERT INTO user_levels (userId, level, currentExp, totalExp, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [userId, 1, 0, 0])
        
        console.log(`✅ 사용자 레벨 생성 완료: ${user.nickname} (레벨 1)`)
      } catch (error: any) {
        // 중복 키 오류는 무시
        if (error?.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ 사용자 ${user.nickname}의 레벨이 이미 존재합니다 (건너뜀)`)
        } else {
          console.error(`❌ 사용자 레벨 생성 실패 (${user.nickname}): ${error?.message || error}`)
          throw error
        }
      }
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
  
  const defaultConfigs: HomePageConfigSeedData[] = [
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
      try {
        // 기존 설정 확인
        const existing = await AppDataSource.query(
          'SELECT id FROM homepage_configs WHERE `key` = ?',
          [config.key]
        )

        if (Array.isArray(existing) && existing.length > 0) {
          console.log(`ℹ️ 설정 ${config.key}가 이미 존재합니다 (건너뜀)`)
          continue
        }

        await AppDataSource.query(`
          INSERT INTO homepage_configs (\`key\`, value, type, description, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [config.key, config.value, config.type, config.description || null, 1])
      } catch (error: any) {
        // 중복 키 오류는 무시
        if (error?.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ 설정 ${config.key}가 이미 존재합니다 (건너뜀)`)
        } else {
          console.warn(`⚠️ 설정 삽입 실패 (${config.key}): ${error?.message || error}`)
        }
      }
    }

    console.log(`✅ 총 ${defaultConfigs.length}개 홈페이지 설정 시드 완료`)
    
  } catch (error) {
    console.error('❌ 홈페이지 설정 시드 실패:', error)
    // 홈페이지 설정 실패는 치명적이지 않으므로 계속 진행
    console.log('ℹ️ 홈페이지 설정 시드 실패했지만 계속 진행합니다.')
  }
}

// ============================================================================
// 커뮤니티 데이터 시드
// ============================================================================

async function seedCommunityData(users: UserSeedData[]): Promise<void> {
  console.log('📝 커뮤니티 데이터 시드 시작...')
  
  if (!users || users.length === 0) {
    console.log('ℹ️ 사용자 데이터가 없어 커뮤니티 데이터 시드를 건너뜁니다.')
    return
  }

  const samplePosts: PostSeedData[] = [
    {
      title: '벤치프레스 100kg 달성 후기',
      content: '드디어 벤치프레스 100kg을 띄웠습니다! 6개월간의 노력이 결실을 맺었네요.',
      author: users[1]?.nickname || '헬스초보',
      authorId: (users[1] as any)?.id || 2,
      category: 'achievements',
      tags: ['벤치프레스', '100kg', '달성']
    },
    {
      title: '초보자를 위한 스쿼트 가이드',
      content: '스쿼트 자세와 호흡법에 대해 자세히 설명드립니다.',
      author: users[2]?.nickname || '피트니스러버',
      authorId: (users[2] as any)?.id || 3,
      category: 'tips',
      tags: ['스쿼트', '초보자', '가이드']
    },
    {
      title: '헬스장에서의 매너',
      content: '모두가 편안하게 운동할 수 있도록 지켜야 할 매너들을 정리했습니다.',
      author: users[0]?.nickname || '관리자',
      authorId: (users[0] as any)?.id || 1,
      category: 'general',
      tags: ['매너', '에티켓', '헬스장']
    }
  ]

  try {
    for (const postData of samplePosts) {
      try {
        const authorId = postData.authorId
        
        if (!isValidId(authorId)) {
          console.warn(`⚠️ 유효하지 않은 작성자 ID 건너뜀: ${postData.title}`)
          continue
        }

        // 게시글 삽입
        const result = await AppDataSource.query(`
          INSERT INTO posts (
            title, content, author, userId, category, tags, like_count, comment_count, 
            createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          postData.title,
          postData.content,
          postData.author,
          authorId,
          postData.category,
          postData.tags ? safeJsonStringify(postData.tags) : null,
          0,
          0
        ])

        const postId = (result as any)?.insertId
        if (!isValidId(postId)) {
          console.warn(`⚠️ 게시글 ID를 가져올 수 없습니다: ${postData.title}`)
          continue
        }

        console.log(`✅ 게시글 생성 완료: ${postData.title} (ID: ${postId})`)

        // 댓글 생성
        const sampleComments: CommentSeedData[] = [
          { 
            content: '축하드립니다! 정말 대단해요!', 
            author: users[2]?.nickname || '피트니스러버', 
            authorId: (users[2] as any)?.id || 3, 
            postId 
          },
          { 
            content: '저도 도전해보고 싶네요', 
            author: users[1]?.nickname || '헬스초보', 
            authorId: (users[1] as any)?.id || 2, 
            postId 
          }
        ]

        for (const commentData of sampleComments) {
          try {
            if (!isValidId(commentData.authorId)) {
              console.warn(`⚠️ 유효하지 않은 댓글 작성자 ID 건너뜀`)
              continue
            }

            await AppDataSource.query(`
              INSERT INTO comments (content, author, userId, postId, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, NOW(), NOW())
            `, [
              commentData.content,
              commentData.author,
              commentData.authorId,
              commentData.postId
            ])
          } catch (error: any) {
            console.warn(`⚠️ 댓글 삽입 실패: ${error?.message || error}`)
          }
        }
      } catch (error: any) {
        console.warn(`⚠️ 게시글 삽입 실패 (${postData.title}): ${error?.message || error}`)
      }
    }

    console.log('✅ 커뮤니티 데이터 시드 완료')
    
  } catch (error) {
    console.error('❌ 커뮤니티 데이터 시드 실패:', error)
    // 커뮤니티 데이터 실패는 치명적이지 않으므로 계속 진행
    console.log('ℹ️ 커뮤니티 데이터 시드 실패했지만 계속 진행합니다.')
  }
}

// ============================================================================
// 통합 시드 실행
// ============================================================================

async function runUnifiedSeed(): Promise<void> {
  const startTime = Date.now()
  let isDatabaseInitialized = false
  
  try {
    console.log('🚀 통합 DB 시드 스크립트 시작...')
    console.log('='.repeat(60))

    // 데이터베이스 연결
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      isDatabaseInitialized = true
      console.log('✅ 데이터베이스 연결 성공')
    } else {
      console.log('ℹ️ 데이터베이스가 이미 연결되어 있습니다.')
    }

    // 연결 테스트
    try {
      await AppDataSource.query('SELECT 1')
      console.log('✅ 데이터베이스 연결 테스트 성공')
    } catch (error) {
      throw new Error(`데이터베이스 연결 테스트 실패: ${error}`)
    }

    // 1. 기존 데이터 정리
    await clearDatabase()

    // 2. 기구 데이터 시드
    await seedMachines()

    // 3. 사용자 데이터 시드
    const users = await seedUsers()

    if (!users || users.length === 0) {
      throw new Error('사용자 데이터 시드 실패: 사용자가 생성되지 않았습니다.')
    }

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
    console.log(`📊 생성된 데이터:`)
    console.log(`   - 사용자: ${users.length}명`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ 통합 DB 시드 실패:', error)
    throw error
  } finally {
    if (isDatabaseInitialized && AppDataSource.isInitialized) {
      try {
        await AppDataSource.destroy()
        console.log('✅ 데이터베이스 연결 종료')
      } catch (error) {
        console.warn('⚠️ 데이터베이스 연결 종료 중 오류:', error)
      }
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

