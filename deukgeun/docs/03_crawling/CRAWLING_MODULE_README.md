# 크롤링 모듈 구조

## 📁 디렉토리 구조

```
modules/crawling/
├── README.md                    # 이 파일
├── index.ts                     # 모듈 통합 인덱스
├── types/                       # 타입 정의
│   └── CrawlingTypes.ts
├── core/                        # 핵심 서비스
│   ├── CrawlingService.ts       # 통합 크롤링 서비스
│   └── DataProcessor.ts         # 데이터 처리 서비스
├── sources/                     # 크롤링 소스별 구현
│   ├── PublicApiSource.ts       # 서울시 공공 API 소스
│   └── WebCrawlingSource.ts     # 웹 크롤링 소스 (네이버, 구글, 다음)
├── processors/                  # 데이터 처리기
│   ├── DataValidator.ts         # 데이터 검증
│   └── DataMerger.ts            # 데이터 병합
└── utils/                       # 유틸리티
    └── CrawlingUtils.ts         # 크롤링 유틸리티
```

## 🔄 시스템 변경사항

### ✅ 완료된 변경사항
- **Google Place API 제거**: API 키가 필요하지 않음
- **Kakao Place API 제거**: API 키가 필요하지 않음
- **웹 크롤링 시스템 도입**: 인터넷 검색을 통한 헬스장 정보 수집
- **서울시 공공 API 중심**: 유일한 공공 API 소스로 활용

### 🎯 새로운 크롤링 플로우
1. **서울시 공공 API** → 기본 헬스장 데이터 수집
2. **웹 크롤링** → 각 헬스장별 추가 정보 수집 (네이버, 구글, 다음)
3. **데이터 병합** → 공공 API + 웹 크롤링 데이터 통합
4. **gyms_raw.json 저장** → 최종 데이터를 JSON 파일로 저장

## 🚀 사용법

### 기본 사용법
```typescript
import { CrawlingService } from './modules/crawling'

// 크롤링 서비스 초기화
const crawlingService = new CrawlingService(gymRepository)

// 통합 크롤링 실행 (권장)
const result = await crawlingService.executeIntegratedCrawling()
```

### 개별 기능 사용
```typescript
// 공공 API 데이터만 수집
const publicApiData = await crawlingService.collectFromPublicAPI()

// 특정 헬스장 웹 크롤링
const gymData = await crawlingService.crawlGymDetails({
  gymName: '헬스장명',
  gymAddress: '주소'
})
```

### 설정 커스터마이징
```typescript
// 크롤링 설정 업데이트
crawlingService.updateConfig({
  enablePublicApi: true,
  enableCrawling: true,
  batchSize: 10,
  maxConcurrentRequests: 2,
  delayBetweenBatches: 3000,
  saveToFile: true,
  saveToDatabase: false
})
```

## 🔧 환경 설정

### 필수 환경 변수
```bash
# 서울시 공공데이터 API 키 (필수)
SEOUL_OPENAPI_KEY=your_seoul_openapi_key
```

### 서울시 API 키 발급 방법
1. [서울시 공공데이터포털](https://data.seoul.go.kr/) 회원가입
2. 원하는 데이터셋 선택 (예: 공공체육시설 예약정보)
3. API 키 발급 및 복사
4. `.env` 파일에 `SEOUL_OPENAPI_KEY` 설정

## 🧪 테스트

### 테스트 스크립트 실행
```bash
# 크롤링 시스템 테스트
npm run test:crawling

# 또는 직접 실행
npx ts-node src/backend/scripts/test-crawling.ts
```

### 테스트 결과 확인
- `src/data/gyms_raw.json` 파일에 크롤링된 데이터 저장
- 콘솔에서 크롤링 진행 상황 및 결과 확인
- 오류 발생 시 상세한 오류 메시지 출력

## ⚠️ 주의사항

### 웹 크롤링 제한사항
- **Rate Limiting**: 요청 간 지연 시간 설정 (기본 2-3초)
- **User-Agent**: 적절한 User-Agent 헤더 사용
- **타임아웃**: 각 요청에 타임아웃 설정 (15초)
- **에러 처리**: 네트워크 오류 및 파싱 오류에 대한 적절한 처리

### 데이터 품질
- **신뢰도 점수**: 각 데이터 소스별 신뢰도 점수 부여
- **중복 제거**: 이름과 주소를 기준으로 중복 데이터 제거
- **데이터 검증**: 필수 필드(이름, 주소) 존재 여부 확인

## 🔄 마이그레이션 완료

### ✅ 완료된 작업
- Google Place API 제거
- Kakao Place API 제거  
- 웹 크롤링 시스템 구현
- 서울시 공공 API 통합
- gyms_raw.json 저장 기능
- 테스트 스크립트 작성

### 🎯 주요 개선사항
- **API 키 의존성 제거**: Google/Kakao API 키 불필요
- **웹 크롤링 도입**: 인터넷 검색을 통한 정보 수집
- **데이터 통합**: 공공 API + 웹 크롤링 데이터 병합
- **파일 저장**: JSON 형태로 크롤링 결과 저장
