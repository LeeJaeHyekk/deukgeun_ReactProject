// ============================================================================
// Machine Data API Insert Script
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

console.log('🚀 기구 데이터 API 삽입 스크립트 시작...')
console.log(`📊 총 ${machineData.length}개의 기구 데이터를 처리합니다.`)

// API 엔드포인트
const API_BASE_URL = 'http://localhost:3001'
const MACHINE_ENDPOINT = `${API_BASE_URL}/api/machines`

async function insertMachineData() {
  try {
    console.log('🔌 API 서버 연결 확인 중...')
    
    // 서버 연결 확인
    const healthCheck = await fetch(`${API_BASE_URL}/api/health`)
    if (!healthCheck.ok) {
      throw new Error('API 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    }
    console.log('✅ API 서버 연결 성공!')

    // 각 기구 데이터를 API로 삽입
    for (const [index, machineDataItem] of machineData.entries()) {
      try {
        console.log(`📥 ${index + 1}/${machineData.length}: ${machineDataItem.nameKo} 삽입 중...`)
        
        const response = await fetch(MACHINE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(machineDataItem)
        })

        if (response.ok) {
          const result = await response.json()
          console.log(`✅ ${machineDataItem.nameKo} 삽입 완료`)
        } else {
          const error = await response.text()
          console.log(`⚠️ ${machineDataItem.nameKo} 삽입 실패: ${error}`)
        }
      } catch (error) {
        console.log(`❌ ${machineDataItem.nameKo} 삽입 중 오류: ${error}`)
      }
    }

    // 최종 확인
    console.log('\n🔍 삽입된 데이터 확인 중...')
    const checkResponse = await fetch(MACHINE_ENDPOINT)
    if (checkResponse.ok) {
      const result = await checkResponse.json()
      console.log(`🎉 총 ${result.count || result.data?.length || 0}개의 기구 데이터가 있습니다.`)
    }

  } catch (error) {
    console.error('❌ 데이터 삽입 중 오류 발생:', error)
    console.log('\n💡 해결 방법:')
    console.log('1. 백엔드 서버가 실행 중인지 확인하세요 (npm start)')
    console.log('2. 데이터베이스 연결이 정상인지 확인하세요')
    console.log('3. API 엔드포인트가 올바른지 확인하세요')
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
