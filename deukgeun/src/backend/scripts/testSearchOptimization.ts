/**
 * 검색 최적화 테스트 스크립트
 */

import {
  filterSearchQuery,
  containsProfanity,
  sanitizeProfanity,
} from '../utils/profanityFilter'
import { seoulGuDongList } from '../controllers/seoulGuDong'

// 검색어 전처리 함수 (컨트롤러에서 복사)
function preprocessSearchQuery(query: string): {
  locationFilter: string | null
  gymFilter: string | null
  originalQuery: string
} {
  // 욕설 필터링 먼저 적용
  const filteredQuery = filterSearchQuery(query)

  if (!filteredQuery) {
    // 욕설만 있거나 유효하지 않은 검색어인 경우
    return {
      locationFilter: null,
      gymFilter: null,
      originalQuery: query.trim(),
    }
  }

  // 검색어 정규화 (공백 제거, 소문자 변환)
  let processedQuery = filteredQuery.trim().toLowerCase()

  // 접미사 패턴 정의
  const suffixes = [
    '검색',
    '검색해',
    '검색해줘',
    '검색해주세요',
    '찾아',
    '찾아줘',
    '찾아주세요',
    '찾기',
    '알려줘',
    '알려주세요',
    '알려줘요',
    '보여줘',
    '보여주세요',
    '보여줘요',
    '추천',
    '추천해',
    '추천해줘',
    '추천해주세요',
    '어디',
    '어디에',
    '어디에있어',
    '어디있어',
    '가까운',
    '근처',
    '주변',
    '해줘',
    '해주세요',
    '해줘요',
    '해',
    '해요',
    '해주세요',
  ]

  // 접미사 제거
  for (const suffix of suffixes) {
    if (processedQuery.endsWith(suffix)) {
      processedQuery = processedQuery.slice(0, -suffix.length).trim()
      break // 첫 번째 매칭되는 접미사만 제거
    }
  }

  // 구/동 정보와 헬스장 정보 분리
  let locationFilter: string | null = null
  let gymFilter: string | null = null

  // 지역명 매핑 (일반적인 지역명을 구/동으로 매핑)
  const locationMapping: { [key: string]: string } = {
    강남: '강남구',
    홍대: '마포구',
    잠실: '송파구',
    강서: '강서구',
    서초: '서초구',
    송파: '송파구',
    마포: '마포구',
    영등포: '영등포구',
    용산: '용산구',
    성동: '성동구',
    광진: '광진구',
    동대문: '동대문구',
    중랑: '중랑구',
    성북: '성북구',
    노원: '노원구',
    도봉: '도봉구',
    양천: '양천구',
    구로: '구로구',
    금천: '금천구',
    동작: '동작구',
    관악: '관악구',
    서대문: '서대문구',
    종로: '종로구',
    중구: '중구',
    은평: '은평구',
    강동: '강동구',
    강북: '강북구',
  }

  // 지역명 매핑으로 구 정보 추출
  for (const [regionName, guName] of Object.entries(locationMapping)) {
    if (processedQuery.includes(regionName.toLowerCase())) {
      locationFilter = guName
      processedQuery = processedQuery
        .replace(regionName.toLowerCase(), '')
        .trim()
      // "구" 단어도 제거
      processedQuery = processedQuery.replace(/구\s*/, '').trim()
      break
    }
  }

  // 구 정보 추출 (매핑에서 찾지 못한 경우)
  if (!locationFilter) {
    for (const guDong of seoulGuDongList) {
      if (processedQuery.includes(guDong.gu.toLowerCase())) {
        locationFilter = guDong.gu
        processedQuery = processedQuery
          .replace(guDong.gu.toLowerCase(), '')
          .trim()
        // "구" 단어도 제거
        processedQuery = processedQuery.replace(/구\s*/, '').trim()
        break
      }
    }
  }

  // 동 정보 추출 (구가 없는 경우)
  if (!locationFilter) {
    for (const guDong of seoulGuDongList) {
      for (const dong of guDong.dong) {
        if (processedQuery.includes(dong.toLowerCase())) {
          locationFilter = guDong.gu // 동이 속한 구를 locationFilter로 설정
          processedQuery = processedQuery.replace(dong.toLowerCase(), '').trim()
          break
        }
      }
      if (locationFilter) break
    }
  }

  // 남은 텍스트를 헬스장 필터로 사용
  if (processedQuery) {
    gymFilter = processedQuery
  }

  return {
    locationFilter,
    gymFilter,
    originalQuery: query.trim(),
  }
}

// 테스트 케이스
const testCases = [
  // 정상적인 검색어들
  {
    query: '강남 피트니스',
    expected: { locationFilter: '강남구', gymFilter: '피트니스' },
    description: '강남구 + 피트니스 분리',
  },
  {
    query: '홍대 헬스장',
    expected: { locationFilter: '마포구', gymFilter: '헬스장' },
    description: '홍대(마포구) + 헬스장 분리',
  },
  {
    query: '잠실 크로스핏',
    expected: { locationFilter: '송파구', gymFilter: '크로스핏' },
    description: '잠실(송파구) + 크로스핏 분리',
  },
  {
    query: '역삼동 헬스',
    expected: { locationFilter: '강남구', gymFilter: '헬스' },
    description: '역삼동(강남구) + 헬스 분리',
  },
  {
    query: '강남구 피트니스 검색',
    expected: { locationFilter: '강남구', gymFilter: '피트니스' },
    description: '접미사 제거 후 구/동 분리',
  },
  {
    query: '헬스장',
    expected: { locationFilter: null, gymFilter: '헬스장' },
    description: '헬스장명만 있는 경우',
  },
  {
    query: '강남구',
    expected: { locationFilter: '강남구', gymFilter: null },
    description: '지역만 있는 경우',
  },

  // 욕설이 포함된 검색어들
  {
    query: '씨발 헬스장',
    expected: { locationFilter: null, gymFilter: '헬스장' },
    description: '욕설 + 헬스장명 (욕설 제거 후 헬스장명만 남음)',
  },
  {
    query: '개새끼 피트니스',
    expected: { locationFilter: null, gymFilter: '피트니스' },
    description: '욕설 + 피트니스 (욕설 제거 후 피트니스만 남음)',
  },
  {
    query: '씨발',
    expected: { locationFilter: null, gymFilter: null },
    description: '욕설만 있는 경우 (현재 위치 기반 검색으로 대체)',
  },
  {
    query: '병신 개새끼',
    expected: { locationFilter: null, gymFilter: null },
    description: '욕설만 있는 경우 (현재 위치 기반 검색으로 대체)',
  },

  // 복합적인 경우들
  {
    query: '강남구 씨발 피트니스',
    expected: { locationFilter: '강남구', gymFilter: '피트니스' },
    description: '지역 + 욕설 + 헬스장명 (욕설 제거 후 지역과 헬스장명만 남음)',
  },
  {
    query: '개새끼 강남구 헬스장',
    expected: { locationFilter: '강남구', gymFilter: '헬스장' },
    description: '욕설 + 지역 + 헬스장명 (욕설 제거 후 지역과 헬스장명만 남음)',
  },
]

// 테스트 실행
function runTests() {
  console.log('🧪 검색 최적화 테스트 시작\n')

  let passedTests = 0
  let totalTests = testCases.length

  testCases.forEach((testCase, index) => {
    console.log(`테스트 ${index + 1}: ${testCase.description}`)
    console.log(`입력: "${testCase.query}"`)

    const result = preprocessSearchQuery(testCase.query)

    console.log(
      `결과: location="${result.locationFilter}", gym="${result.gymFilter}"`
    )
    console.log(
      `예상: location="${testCase.expected.locationFilter}", gym="${testCase.expected.gymFilter}"`
    )

    const isLocationMatch =
      result.locationFilter === testCase.expected.locationFilter
    const isGymMatch = result.gymFilter === testCase.expected.gymFilter

    if (isLocationMatch && isGymMatch) {
      console.log('✅ 통과\n')
      passedTests++
    } else {
      console.log('❌ 실패\n')
    }
  })

  console.log(`테스트 결과: ${passedTests}/${totalTests} 통과`)

  if (passedTests === totalTests) {
    console.log('🎉 모든 테스트가 통과했습니다!')
  } else {
    console.log('⚠️ 일부 테스트가 실패했습니다.')
  }
}

// 욕설 필터링 테스트
function testProfanityFilter() {
  console.log('\n🚫 욕설 필터링 테스트\n')

  const profanityTests = [
    { input: '씨발', expected: true },
    { input: '개새끼', expected: true },
    { input: '병신', expected: true },
    { input: '헬스장', expected: false },
    { input: '강남구', expected: false },
    { input: '피트니스', expected: false },
    { input: '씨발 헬스장', expected: true },
    { input: '강남구 씨발', expected: true },
  ]

  profanityTests.forEach((test, index) => {
    const result = containsProfanity(test.input)
    const status = result === test.expected ? '✅' : '❌'
    console.log(
      `${status} 테스트 ${index + 1}: "${test.input}" → ${result} (예상: ${test.expected})`
    )
  })
}

// 메인 실행
if (require.main === module) {
  runTests()
  testProfanityFilter()
}

export { runTests, testProfanityFilter }
