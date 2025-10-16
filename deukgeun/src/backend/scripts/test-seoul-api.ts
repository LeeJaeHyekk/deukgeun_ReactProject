/**
 * 서울시 공공데이터 API 테스트 스크립트
 * 새로운 LOCALDATA_104201 API 구조 테스트
 */

import { PublicApiSource } from '../modules/crawling/sources/PublicApiSource.js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../../.env') })

// 테스트용 환경 변수 직접 설정
if (!process.env.SEOUL_OPENAPI_KEY) {
  process.env.SEOUL_OPENAPI_KEY = '467572475373737933314e4e494377'
}

async function testSeoulAPI() {
  console.log('🧪 서울시 공공데이터 API 테스트 시작')
  console.log('=' .repeat(50))
  
  try {
    const publicApiSource = new PublicApiSource()
    
    // API 키 확인
    const apiKey = process.env.SEOUL_OPENAPI_KEY
    if (!apiKey) {
      console.error('❌ SEOUL_OPENAPI_KEY가 설정되지 않았습니다')
      console.log('env.development 파일에 SEOUL_OPENAPI_KEY를 설정해주세요')
      return
    }
    
    console.log(`✅ API 키 확인됨: ${apiKey.substring(0, 8)}...`)
    
    // 서울시 API 호출 테스트
    console.log('\n📡 서울시 공공데이터 API 호출 중...')
    const gymData = await publicApiSource.fetchFromSeoulAPI()
    
    console.log(`\n📊 결과 요약:`)
    console.log(`- 총 수집된 헬스장 수: ${gymData.length}개`)
    
    if (gymData.length > 0) {
      console.log('\n📋 샘플 데이터 (처음 3개):')
      gymData.slice(0, 3).forEach((gym, index) => {
      console.log(`\n${index + 1}. ${gym.name}`)
      console.log(`   주소: ${gym.address}`)
      console.log(`   전화: ${gym.phone || '정보 없음'}`)
      console.log(`   영업상태: ${gym.businessStatus}`)
      console.log(`   업종: ${gym.businessType || '정보 없음'}`)
      console.log(`   세부업종: ${gym.detailBusinessType || '정보 없음'}`)
      console.log(`   서비스타입: ${gym.serviceType}`)
      console.log(`   좌표: ${gym.latitude}, ${gym.longitude}`)
      console.log(`   신뢰도: ${gym.confidence}`)
      
      // 추가 상세 정보 출력
      console.log(`   📍 주소 상세:`)
      console.log(`     - 지번주소: ${gym.siteAddress || '정보 없음'}`)
      console.log(`     - 도로명주소: ${gym.roadAddress || '정보 없음'}`)
      console.log(`     - 소재지우편번호: ${gym.sitePostalCode || '정보 없음'}`)
      console.log(`     - 도로명우편번호: ${gym.roadPostalCode || '정보 없음'}`)
      
      console.log(`   🏢 시설 정보:`)
      console.log(`     - 소재지면적: ${gym.siteArea || '정보 없음'}㎡`)
      console.log(`     - 건축물동수: ${gym.buildingCount || '정보 없음'}`)
      console.log(`     - 건축물연면적: ${gym.buildingArea || '정보 없음'}㎡`)
      console.log(`     - 지도자수: ${gym.leaderCount || '정보 없음'}명`)
      console.log(`     - 보험가입여부: ${gym.insuranceCode || '정보 없음'}`)
      
      console.log(`   📋 관리 정보:`)
      console.log(`     - 관리번호: ${gym.managementNumber || '정보 없음'}`)
      console.log(`     - 인허가일자: ${gym.approvalDate || '정보 없음'}`)
      })
      
      // 영업상태별 통계
      const statusStats = gymData.reduce((acc, gym) => {
        const status = gym.businessStatus || '정보 없음'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('\n📈 영업상태별 통계:')
      Object.entries(statusStats).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}개`)
      })
      
      // 서비스 타입별 통계
      const typeStats = gymData.reduce((acc, gym) => {
        const type = gym.serviceType || '기타'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('\n🏋️ 서비스 타입별 통계:')
      Object.entries(typeStats).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}개`)
      })
      
    } else {
      console.log('\n⚠️ 수집된 데이터가 없습니다')
      console.log('가능한 원인:')
      console.log('- API 키가 잘못되었거나 만료됨')
      console.log('- 네트워크 연결 문제')
      console.log('- API 서버 문제')
      console.log('- 필터링 조건이 너무 엄격함')
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('🏁 테스트 완료')
}

// 스크립트 실행
testSeoulAPI()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('스크립트 실행 실패:', error)
    process.exit(1)
  })

export { testSeoulAPI }
