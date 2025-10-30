# 향상된 크롤링 시스템 가이드

## 개요

이 문서는 새로 구현된 향상된 크롤링 시스템에 대한 종합적인 가이드입니다. 기존 크롤링 시스템을 개선하여 공공 API 스케줄링, API 목록 업데이트, 크롤링 우회, 타입 가드, 데이터 병합을 통합한 시스템입니다.

## 시스템 아키텍처

### 1. 공공 API 스케줄러 (PublicApiScheduler)
- **목적**: 정기적으로 공공 API에서 헬스장 데이터를 가져와서 업데이트
- **기능**:
  - 크론 작업을 통한 자동 스케줄링 (매일 새벽 2시)
  - 서울시 공공데이터 API 호출
  - 국민체육진흥공단 체육시설 정보 API 호출
  - 데이터 검증 및 정리
  - 파일 저장 (src/data/gyms_raw.json)

### 2. API 목록 업데이터 (ApiListUpdater)
- **목적**: 다양한 공공 API들의 상태를 모니터링하고 헬스장 데이터를 수집
- **지원 API**:
  - 서울시 공공데이터
  - 국민체육진흥공단 체육시설 정보
  - 카카오 로컬 API
  - 구글 플레이스 API
- **기능**:
  - 동시 요청 수 제한
  - Rate limit 관리
  - 재시도 로직
  - 데이터 변환 및 정리

### 3. 크롤링 우회 서비스 (CrawlingBypassService)
- **목적**: API 키 없이 웹 크롤링을 통해 헬스장 정보를 수집
- **지원 사이트**:
  - 네이버 플레이스
  - 카카오 플레이스
  - 구글 맵스
  - 다음 플레이스
  - 헬스장 전용 사이트
- **기능**:
  - User-Agent 로테이션
  - Rate limit 관리
  - HTML 파싱 (Cheerio 사용)
  - 데이터 추출 및 정리

### 4. 타입 가드 서비스 (TypeGuardService)
- **목적**: 데이터 처리 시 타입 안전성과 데이터 품질을 보장
- **기능**:
  - 공공 API 데이터 검증
  - 크롤링 데이터 검증
  - 통합 데이터 검증
  - 필드별 검증 규칙 적용
  - 데이터 정리 및 변환

### 5. 통합 크롤링 서비스 (IntegratedCrawlingService)
- **목적**: 모든 서비스를 통합하여 완전한 크롤링 워크플로우 제공
- **워크플로우**:
  1. 공공 API 스케줄링
  2. API 목록 업데이트
  3. 크롤링 실행
  4. 데이터 병합
  5. 데이터 품질 검사
  6. 최종 데이터 저장

## 데이터 흐름

```
1. 스케줄링 → 2. 공공 API 목록 업데이트 → 3. 크롤링 → 4. 타입 가드 → 5. 데이터 병합 → 6. src/data/gyms_raw 저장
```

### 상세 흐름:
1. **스케줄링**: 매일 새벽 2시에 자동으로 공공 API에서 기본 헬스장 목록을 가져옴
2. **API 목록 업데이트**: 다양한 공공 API에서 추가 헬스장 정보를 수집
3. **크롤링**: API 키 없이 웹 크롤링으로 상세 정보 수집
4. **타입 가드**: 모든 데이터에 대해 타입 안전성 및 품질 검증
5. **데이터 병합**: 중복 제거 및 데이터 통합
6. **저장**: 최종 결과를 src/data/gyms_raw.json에 저장

## API 엔드포인트

### 통합 크롤링
- `POST /api/enhanced-gym/integrated-crawling` - 통합 크롤링 실행
- `GET /api/enhanced-gym/integrated-crawling/status` - 통합 크롤링 상태 조회
- `POST /api/enhanced-gym/integrated-crawling/stop` - 통합 크롤링 중단

### 공공 API 스케줄러
- `GET /api/enhanced-gym/public-api-scheduler/status` - 스케줄러 상태 조회
- `POST /api/enhanced-gym/public-api-scheduler/control` - 스케줄러 시작/중지

### API 목록 업데이트
- `POST /api/enhanced-gym/api-list-update` - API 목록 업데이트 실행

### 크롤링 우회
- `GET /api/enhanced-gym/crawl-bypass/:gymName` - 특정 헬스장 크롤링

### 타입 가드
- `POST /api/enhanced-gym/validate-type-guard` - 데이터 검증

## 환경 설정

### 필요한 환경 변수
```env
# 서울시 공공데이터 API
SEOUL_OPENAPI_KEY=your_seoul_openapi_key

# 카카오 API
KAKAO_API_KEY=your_kakao_api_key

# 구글 플레이스 API
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# 네이버 API (크롤링용)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# 다음 API
DAUM_API_KEY=your_daum_api_key

# 소셜 미디어 API
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# 국민체육진흥공단 API
SPORTS_DATA_API_KEY=your_sports_data_api_key
```

## 사용 방법

### 1. 통합 크롤링 실행
```bash
curl -X POST http://localhost:5000/api/enhanced-gym/integrated-crawling
```

### 2. 공공 API 스케줄러 시작
```bash
curl -X POST http://localhost:5000/api/enhanced-gym/public-api-scheduler/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

### 3. 특정 헬스장 크롤링
```bash
curl -X GET http://localhost:5000/api/enhanced-gym/crawl-bypass/스포츠몬스터
```

### 4. 데이터 검증
```bash
curl -X POST http://localhost:5000/api/enhanced-gym/validate-type-guard \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "테스트 헬스장",
      "address": "서울시 강남구 테헤란로 123",
      "latitude": 37.5665,
      "longitude": 126.9780
    },
    "dataType": "integrated"
  }'
```

## 데이터 구조

### 공공 API 데이터
```typescript
interface PublicApiGymData {
  id: string
  name: string
  type: string
  address: string
  phone: string
  latitude: number
  longitude: number
  businessStatus: string
  lastUpdated: string
  source: string
}
```

### 크롤링 데이터
```typescript
interface CrawlingResult {
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  is24Hours: boolean
  hasParking: boolean
  hasShower: boolean
  hasPT: boolean
  hasGX: boolean
  hasGroupPT: boolean
  openHour: string
  closeHour: string
  price: string
  rating: number
  reviewCount: number
  source: string
  confidence: number
  additionalInfo: Record<string, any>
}
```

## 타입 가드 규칙

### 필수 필드
- `name`: 헬스장 이름 (1-200자)
- `address`: 주소 (5-500자)
- `latitude`: 위도 (33.0-38.0)
- `longitude`: 경도 (124.0-132.0)

### 선택 필드
- `phone`: 전화번호 (8-15자리 숫자)
- `rating`: 평점 (0-5)
- `reviewCount`: 리뷰 수 (0 이상의 정수)
- `confidence`: 신뢰도 (0-1)

### 검증 패턴
- 이름: 한글, 영문, 숫자, 공백, 하이픈, 언더스코어, 괄호
- 주소: 한글, 영문, 숫자, 공백, 하이픈, 언더스코어, 점, 쉼표, 괄호
- 전화번호: 숫자, 하이픈, 공백, 괄호
- 운영시간: HH:MM 형식 또는 "24시간"

## 성능 최적화

### 배치 처리
- 기본 배치 크기: 50개
- 최대 동시 요청: 3개
- 배치 간 지연: 2초

### Rate Limit 관리
- 네이버 플레이스: 30회/분, 1000회/일
- 카카오 플레이스: 20회/분, 500회/일
- 구글 맵스: 10회/분, 200회/일
- 다음 플레이스: 25회/분, 800회/일

### 재시도 로직
- 최대 재시도: 3회
- 재시도 지연: 1-3초 (지수 백오프)
- 타임아웃: 30초

## 모니터링 및 로깅

### 로그 레벨
- `🚀`: 시작
- `✅`: 성공
- `⚠️`: 경고
- `❌`: 오류
- `📊`: 통계
- `🔍`: 검증
- `💾`: 저장

### 상태 모니터링
- 실행 상태 (실행 중/중지)
- 진행률 (현재/전체/퍼센트)
- 시작 시간/예상 완료 시간
- 오류 목록

## 문제 해결

### 일반적인 문제
1. **API 키 오류**: 환경 변수 확인
2. **Rate limit 초과**: 재시도 지연 시간 증가
3. **타임아웃**: 네트워크 상태 확인
4. **데이터 검증 실패**: 입력 데이터 형식 확인

### 디버깅
```bash
# 로그 확인
tail -f logs/backend-combined-0.log

# 상태 확인
curl -X GET http://localhost:5000/api/enhanced-gym/integrated-crawling/status
```

## 보안 고려사항

### API 키 보안
- 환경 변수로 관리
- 프로덕션에서는 암호화 저장
- 정기적인 키 로테이션

### 크롤링 윤리
- robots.txt 준수
- 적절한 지연 시간
- Rate limit 준수
- 개인정보 보호

## 확장 가능성

### 새로운 API 추가
1. `ApiListUpdater`에 새 엔드포인트 추가
2. 데이터 변환 로직 구현
3. 타입 가드 규칙 추가

### 새로운 크롤링 사이트 추가
1. `CrawlingBypassService`에 새 소스 추가
2. HTML 파싱 로직 구현
3. 셀렉터 정의

### 새로운 검증 규칙 추가
1. `TypeGuardService`에 새 규칙 추가
2. 커스텀 검증 함수 구현
3. 오류 메시지 정의

## 결론

이 향상된 크롤링 시스템은 기존 시스템의 한계를 극복하고, 더 안정적이고 확장 가능한 데이터 수집 환경을 제공합니다. 공공 API와 크롤링을 통합하여 풍부한 헬스장 정보를 수집하고, 타입 가드를 통해 데이터 품질을 보장합니다.

시스템은 모듈화되어 있어 각 컴포넌트를 독립적으로 사용할 수 있으며, 새로운 요구사항에 따라 쉽게 확장할 수 있습니다.
