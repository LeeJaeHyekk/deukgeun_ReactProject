/**
 * 검색어 전처리 테스트 스크립트
 */

// 검색어 전처리 함수 (컨트롤러에서 복사)
function preprocessSearchQuery(query: string): string {
  // 검색어 정규화 (공백 제거, 소문자 변환)
  let processedQuery = query.trim().toLowerCase()

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

  // 접두사 패턴 정의 (검색어 앞에 오는 불필요한 단어들)
  const prefixes = [
    '헬스장',
    '헬스',
    '짐',
    '피트니스',
    '운동',
    '근처',
    '주변',
    '가까운',
    '내',
    '우리',
    '서울',
    '강남',
    '홍대',
    '잠실',
    '강서',
  ]

  // 접두사 제거 (검색어가 접두사로 시작하는 경우)
  for (const prefix of prefixes) {
    if (processedQuery.startsWith(prefix)) {
      processedQuery = processedQuery.slice(prefix.length).trim()
      break
    }
  }

  // 빈 문자열이 되면 원본 검색어 반환
  if (!processedQuery) {
    return query.trim()
  }

  return processedQuery
}

// 테스트 케이스
const testCases = [
  // 접미사 테스트
  '강남 피트니스 검색',
  '홍대 헬스장 찾아줘',
  '잠실 스포츠센터 알려줘',
  '강서 피트니스클럽 보여줘',
  '종로 헬스장 추천해줘',
  '어디에 헬스장이 있어',
  '가까운 헬스장 해줘',

  // 접두사 테스트
  '헬스장 강남 피트니스',
  '헬스 홍대 헬스장',
  '짐 잠실 스포츠센터',
  '근처 강서 피트니스클럽',
  '주변 종로 헬스장',
  '서울 강남 피트니스',

  // 복합 테스트
  '헬스장 강남 피트니스 검색해줘',
  '근처 홍대 헬스장 찾아',
  '서울 잠실 스포츠센터 알려줘',

  // 정상 케이스
  '강남 피트니스',
  '홍대 헬스장',
  '잠실 스포츠센터',

  // 빈 문자열 및 특수 케이스
  '검색',
  '찾아줘',
  '헬스장',
  '',
  '   ',
]

console.log('🧪 검색어 전처리 테스트 시작\n')

testCases.forEach((testCase, index) => {
  const result = preprocessSearchQuery(testCase)
  const status = result !== testCase ? '✅ 처리됨' : '➡️ 변경없음'

  console.log(`${index + 1}. "${testCase}" → "${result}" ${status}`)
})

console.log('\n🎉 테스트 완료!')
