# 향상된 헬스장 데이터 크롤링 시스템 가이드

## 개요

이 시스템은 공공데이터 API와 다양한 크롤링 소스를 통합하여 풍부한 헬스장 정보를 수집하고 관리하는 시스템입니다.

## 주요 기능

### 1. 통합 데이터 수집
- **공공데이터 API**: 서울시 공공데이터에서 기본 헬스장 정보 수집
- **다중 소스 크롤링**: 네이버, 구글, 소셜미디어 등에서 상세 정보 수집
- **지능적 데이터 병합**: 중복 제거 및 품질 기반 데이터 통합

### 2. 크롤링 소스
- **네이버 블로그**: 헬스장 후기 및 상세 정보
- **네이버 지식인**: Q&A에서 헬스장 정보 추출
- **네이버 카페**: 지역 커뮤니티 정보
- **다음 블로그**: 추가 블로그 정보
- **구글 플레이스**: 상세 시설 정보 및 평점
- **카카오 맵**: 위치 및 기본 정보
- **페이스북**: 페이지 정보 및 운영시간
- **인스타그램**: 해시태그 기반 정보
- **트위터**: 실시간 정보 및 후기

### 3. 데이터 품질 관리
- **자동 검증**: 데이터 완성도, 정확성, 일관성 검증
- **품질 점수**: 각 헬스장 데이터의 품질 점수 제공
- **개선 제안**: 데이터 품질 향상을 위한 구체적 제안

### 4. 배치 처리
- **효율적 처리**: 대량 데이터를 배치 단위로 처리
- **병렬 처리**: 동시성 제어를 통한 성능 최적화
- **재시도 로직**: 실패한 요청에 대한 자동 재시도
- **진행 상황 모니터링**: 실시간 처리 상태 확인

## API 엔드포인트

### 1. 통합 데이터 업데이트
```http
POST /api/enhanced-gym/update-data
Content-Type: application/json

{
  "batchSize": 20,
  "concurrency": 3,
  "delayBetweenBatches": 2000,
  "maxRetries": 3,
  "timeout": 30000
}
```

**응답:**
```json
{
  "success": true,
  "message": "헬스장 데이터 업데이트가 완료되었습니다",
  "data": {
    "total": 1000,
    "success": 950,
    "failed": 50,
    "successRate": "95.0",
    "duration": 120000,
    "errors": [...]
  }
}
```

### 2. 특정 헬스장 크롤링
```http
GET /api/enhanced-gym/crawl/{gymName}
```

**응답:**
```json
{
  "success": true,
  "message": "헬스장 상세 정보 크롤링이 완료되었습니다",
  "data": {
    "gymName": "강남 피트니스",
    "searchResult": {...},
    "crawlingResults": [...],
    "mergedData": [...],
    "totalSources": 8
  }
}
```

### 3. 데이터 품질 검증
```http
GET /api/enhanced-gym/validate-quality
```

**응답:**
```json
{
  "success": true,
  "message": "전체 데이터 품질 검증이 완료되었습니다",
  "data": {
    "stats": {
      "totalRecords": 1000,
      "validRecords": 950,
      "invalidRecords": 50,
      "averageScore": 85.5,
      "scoreDistribution": {
        "excellent": 300,
        "good": 400,
        "fair": 200,
        "poor": 80,
        "bad": 20
      },
      "commonIssues": [...]
    },
    "suggestions": [...]
  }
}
```

### 4. 크롤링 통계
```http
GET /api/enhanced-gym/crawling-stats
```

**응답:**
```json
{
  "success": true,
  "message": "크롤링 통계 조회가 완료되었습니다",
  "data": {
    "total": 1000,
    "sourceStats": {
      "seoul_opendata": 1000,
      "google_places": 800,
      "naver_blog": 600,
      "kakao_map": 700
    },
    "facilityStats": {
      "is24Hours": 200,
      "hasParking": 600,
      "hasShower": 800,
      "hasPT": 900,
      "hasGX": 850
    },
    "completenessPercentage": {
      "phone": "85.0",
      "address": "100.0",
      "coordinates": "95.0",
      "rating": "60.0",
      "price": "40.0"
    }
  }
}
```

### 5. 크롤링 설정 업데이트
```http
PUT /api/enhanced-gym/config
Content-Type: application/json

{
  "batchSize": 30,
  "concurrency": 5,
  "delayBetweenBatches": 1500,
  "maxRetries": 5,
  "timeout": 45000
}
```

### 6. 크롤링 상태 모니터링
```http
GET /api/enhanced-gym/status
```

### 7. 크롤링 중단
```http
POST /api/enhanced-gym/stop
```

### 8. 성능 통계
```http
GET /api/enhanced-gym/performance
```

## 환경 설정

### 필요한 API 키들

`.env` 파일에 다음 API 키들을 설정해야 합니다:

```env
# 서울시 공공데이터 API
SEOUL_OPENAPI_KEY=your_seoul_openapi_key

# Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Kakao Map API
KAKAO_API_KEY=your_kakao_api_key

# Naver API (블로그, 지식인, 카페 검색)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# Daum API (블로그 검색)
DAUM_API_KEY=your_daum_api_key

# Facebook API (페이지 검색)
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token

# Instagram API (해시태그 검색)
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token

# Twitter API (트윗 검색)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

## 사용 방법

### 1. 기본 데이터 업데이트
```bash
# 전체 헬스장 데이터를 공공데이터와 크롤링으로 업데이트
curl -X POST http://localhost:5000/api/enhanced-gym/update-data \
  -H "Content-Type: application/json" \
  -d '{
    "batchSize": 20,
    "concurrency": 3,
    "delayBetweenBatches": 2000
  }'
```

### 2. 특정 헬스장 크롤링
```bash
# 특정 헬스장의 상세 정보 크롤링
curl http://localhost:5000/api/enhanced-gym/crawl/강남피트니스
```

### 3. 데이터 품질 확인
```bash
# 전체 데이터 품질 검증
curl http://localhost:5000/api/enhanced-gym/validate-quality

# 특정 헬스장 품질 검증
curl http://localhost:5000/api/enhanced-gym/validate-quality/GYM_ID
```

### 4. 크롤링 통계 확인
```bash
# 크롤링 소스별 통계 조회
curl http://localhost:5000/api/enhanced-gym/crawling-stats
```

## 성능 최적화

### 1. 배치 설정 최적화
- **batchSize**: 20-50 (메모리 사용량과 처리 속도의 균형)
- **concurrency**: 3-5 (API 제한과 처리 속도의 균형)
- **delayBetweenBatches**: 1000-3000ms (API 제한 준수)

### 2. API 제한 고려사항
- **네이버 API**: 일일 25,000회 제한
- **구글 API**: 분당 100회 제한
- **카카오 API**: 일일 300,000회 제한
- **소셜미디어 API**: 각각 다른 제한 사항

### 3. 에러 처리
- 자동 재시도 로직 (최대 3회)
- 지수 백오프 (재시도 간격 증가)
- 타임아웃 설정 (30초 기본)

## 데이터 품질 관리

### 1. 품질 점수 기준
- **완성도 (30%)**: 필수 필드 완성도
- **정확성 (30%)**: 데이터 형식 및 유효성
- **일관성 (20%)**: 필드 간 논리적 일관성
- **유효성 (10%)**: 비즈니스 규칙 준수
- **시의성 (10%)**: 데이터 업데이트 시점

### 2. 품질 개선 제안
- 필수 필드 누락 시 입력 요청
- 주소/좌표 불일치 시 수정 제안
- 운영시간 정보 보완 제안
- 시설 정보 상세화 제안

## 모니터링 및 로깅

### 1. 진행 상황 모니터링
- 실시간 처리 상태 확인
- 성공/실패 비율 추적
- 처리 속도 모니터링
- 에러 로그 수집

### 2. 성능 지표
- 평균 처리 시간
- 성공률
- 에러율
- 처리량 (throughput)

## 문제 해결

### 1. 일반적인 문제들

**API 키 오류**
```bash
# API 키 설정 확인
curl http://localhost:5000/api/enhanced-gym/status
```

**메모리 부족**
```bash
# 배치 크기 줄이기
curl -X PUT http://localhost:5000/api/enhanced-gym/config \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10}'
```

**API 제한 초과**
```bash
# 지연 시간 증가
curl -X PUT http://localhost:5000/api/enhanced-gym/config \
  -H "Content-Type: application/json" \
  -d '{"delayBetweenBatches": 5000}'
```

### 2. 로그 확인
```bash
# 백엔드 로그 확인
tail -f logs/backend-combined-0.log

# 에러 로그 확인
tail -f logs/backend-error-0.log
```

## 보안 고려사항

### 1. API 키 보안
- 환경 변수로 API 키 관리
- 프로덕션에서는 암호화된 저장소 사용
- 정기적인 API 키 로테이션

### 2. Rate Limiting
- API별 요청 제한 준수
- 적절한 지연 시간 설정
- 백오프 전략 구현

### 3. 데이터 보호
- 개인정보 수집 최소화
- 크롤링 데이터 암호화
- 접근 권한 관리

## 확장 가능성

### 1. 새로운 크롤링 소스 추가
- `EnhancedCrawlingSources` 클래스에 새 메서드 추가
- API 키 설정에 새 키 추가
- 데이터 병합 로직 업데이트

### 2. 성능 향상
- Redis 캐싱 도입
- 데이터베이스 인덱싱 최적화
- 분산 처리 시스템 도입

### 3. 기능 확장
- 실시간 알림 시스템
- 데이터 시각화 대시보드
- 자동화된 품질 개선

## 결론

이 향상된 크롤링 시스템을 통해 공공데이터 API의 기본 정보와 다양한 소스에서 수집한 상세 정보를 통합하여 풍부하고 정확한 헬스장 데이터베이스를 구축할 수 있습니다. 

시스템의 모듈화된 구조와 품질 관리 기능을 통해 지속적으로 데이터 품질을 향상시키고, 사용자에게 더 나은 서비스를 제공할 수 있습니다.
