// ============================================================================
// Machine Data Insert Script
// ============================================================================

import { MachineService } from '../src/backend/services/machineService'
import { readFileSync } from 'fs'
import { join } from 'path'

// JSON 파일 읽기
const machineDataPath = join(__dirname, '../machine_cards_data.json')
const machineData = JSON.parse(readFileSync(machineDataPath, 'utf8'))

interface MachineData {
  id: number
  machineKey: string
  name: string
  nameKo: string
  nameEn: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  description?: string
  instructions: string[]
  positiveEffect: string
  category: string
  targetMuscles: string[]
  difficulty: string
  videoUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

async function insertMachineData() {
  try {
    console.log('🚀 기구 데이터 삽입 시작...')
    
    const machineService = new MachineService()
    let successCount = 0
    let errorCount = 0
    
    for (const machine of machineData as MachineData[]) {
      try {
        // 기존 기구가 있는지 확인
        const existingMachine = await machineService.getMachineByKey(machine.machineKey)
        
        if (existingMachine) {
          console.log(`⚠️  기구 이미 존재: ${machine.nameKo} (${machine.machineKey})`)
          continue
        }
        
        // 기구 데이터 변환
        const machineCreateData = {
          id: machine.id,
          machineKey: machine.machineKey,
          name: machine.name,
          nameKo: machine.nameKo,
          nameEn: machine.nameEn,
          imageUrl: machine.imageUrl,
          shortDesc: machine.shortDesc,
          detailDesc: machine.detailDesc,
          description: machine.description,
          instructions: machine.instructions,
          positiveEffect: machine.positiveEffect,
          category: machine.category,
          targetMuscles: machine.targetMuscles,
          difficulty: machine.difficulty,
          videoUrl: machine.videoUrl,
          isActive: machine.isActive,
          createdAt: new Date(machine.createdAt),
          updatedAt: new Date(machine.updatedAt)
        }
        
        // 기구 생성
        const createdMachine = await machineService.createMachine(machineCreateData as any)
        
        console.log(`✅ 기구 생성 성공: ${machine.nameKo} (ID: ${createdMachine.id})`)
        successCount++
        
      } catch (error) {
        console.error(`❌ 기구 생성 실패: ${machine.nameKo}`, error)
        errorCount++
      }
    }
    
    console.log('\n📊 삽입 결과:')
    console.log(`✅ 성공: ${successCount}개`)
    console.log(`❌ 실패: ${errorCount}개`)
    console.log(`📝 총 처리: ${machineData.length}개`)
    
  } catch (error) {
    console.error('💥 스크립트 실행 오류:', error)
  }
}

// 스크립트 실행
if (require.main === module) {
  insertMachineData()
    .then(() => {
      console.log('🎉 기구 데이터 삽입 완료!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error)
      process.exit(1)
    })
}

export { insertMachineData }
