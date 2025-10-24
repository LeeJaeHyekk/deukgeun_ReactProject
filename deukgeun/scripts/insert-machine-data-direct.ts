// ============================================================================
// Machine Data Direct Database Insert Script
// ============================================================================

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// JSON 파일 읽기
const machineDataPath = join(__dirname, '../machine_cards_data.json')
const machineData = JSON.parse(readFileSync(machineDataPath, 'utf8'))

console.log('🚀 기구 데이터베이스 직접 삽입 스크립트 시작...')
console.log(`📊 총 ${machineData.length}개의 기구 데이터를 처리합니다.`)

// 데이터베이스 연결을 위한 TypeORM 설정
import { DataSource } from 'typeorm'
import { Machine } from '../src/backend/entities/Machine'

// 데이터베이스 설정
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'deukgeun',
  entities: [Machine],
  synchronize: false,
  logging: true,
})

async function insertMachineData() {
  try {
    // 데이터베이스 연결
    console.log('🔌 데이터베이스 연결 중...')
    await dataSource.initialize()
    console.log('✅ 데이터베이스 연결 성공!')

    const machineRepository = dataSource.getRepository(Machine)

    // 기존 데이터 확인
    const existingCount = await machineRepository.count()
    console.log(`📊 기존 기구 데이터: ${existingCount}개`)

    // 기존 데이터 삭제 (선택사항)
    if (existingCount > 0) {
      console.log('🗑️ 기존 데이터 삭제 중...')
      await machineRepository.clear()
      console.log('✅ 기존 데이터 삭제 완료!')
    }

    // 새 데이터 삽입
    console.log('📥 새 기구 데이터 삽입 중...')
    
    for (const machineDataItem of machineData) {
      const machine = new Machine()
      
      // 기본 필드 설정
      machine.id = machineDataItem.id
      machine.machineKey = machineDataItem.machineKey
      machine.name = machineDataItem.name
      machine.nameKo = machineDataItem.nameKo
      machine.nameEn = machineDataItem.nameEn
      machine.imageUrl = machineDataItem.imageUrl
      machine.shortDesc = machineDataItem.shortDesc
      machine.detailDesc = machineDataItem.detailDesc
      machine.description = machineDataItem.description
      machine.instructions = machineDataItem.instructions
      machine.positiveEffect = machineDataItem.positiveEffect
      machine.category = machineDataItem.category
      machine.targetMuscles = machineDataItem.targetMuscles
      machine.difficulty = machineDataItem.difficulty
      machine.videoUrl = machineDataItem.videoUrl
      machine.isActive = machineDataItem.isActive
      machine.createdAt = new Date(machineDataItem.createdAt)
      machine.updatedAt = new Date(machineDataItem.updatedAt)

      await machineRepository.save(machine)
      console.log(`✅ ${machine.nameKo} (${machine.name}) 삽입 완료`)
    }

    // 최종 확인
    const finalCount = await machineRepository.count()
    console.log(`🎉 데이터 삽입 완료! 총 ${finalCount}개의 기구 데이터가 있습니다.`)

  } catch (error) {
    console.error('❌ 데이터 삽입 중 오류 발생:', error)
  } finally {
    // 데이터베이스 연결 종료
    if (dataSource.isInitialized) {
      await dataSource.destroy()
      console.log('🔌 데이터베이스 연결 종료')
    }
  }
}

// 스크립트 실행
insertMachineData()
  .then(() => {
    console.log('🎉 스크립트 실행 완료!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })
