// ============================================================================
// Machine Data Insert Script (Simple Version)
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

console.log('🚀 기구 데이터 삽입 스크립트 시작...')
console.log(`📊 총 ${machineData.length}개의 기구 데이터를 처리합니다.`)

// 각 기구 데이터 출력
machineData.forEach((machine: any, index: number) => {
  console.log(`\n${index + 1}. ${machine.nameKo} (${machine.name})`)
  console.log(`   - ID: ${machine.id}`)
  console.log(`   - Key: ${machine.machineKey}`)
  console.log(`   - 카테고리: ${machine.category}`)
  console.log(`   - 난이도: ${machine.difficulty}`)
  console.log(`   - 타겟 근육: ${machine.targetMuscles.join(', ')}`)
  console.log(`   - 이미지: ${machine.imageUrl}`)
  console.log(`   - 설명: ${machine.shortDesc}`)
})

console.log('\n✅ 기구 데이터 분석 완료!')
console.log('📝 다음 단계: 이 데이터를 데이터베이스에 삽입하세요.')
