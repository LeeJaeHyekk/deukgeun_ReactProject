# 헬스장 검색 최적화 가이드

## 🎯 개요

이 문서는 헬스장 찾기 및 검색 기능의 성능 최적화에 대한 종합적인 가이드입니다. 82,046개의 헬스장 데이터를 효율적으로 검색하고 사용자 경험을 향상시키기 위한 최적화 방안을 제시합니다.

## 📊 현재 시스템 분석

### 데이터 규모

- **GYMS_RAW 데이터**: 82,046개 헬스장 (서울시 공공데이터)
- **DB GYM 엔티티**: 18개 필드 (id, name, address, phone, latitude, longitude, facilities, openHour, is24Hours, hasGX, hasPT, hasGroupPT, hasParking, hasShower, createdAt, updatedAt)

### 기존 문제점

1. **인덱스 부족**: 위치 기반 검색에 필요한 인덱스가 없음
2. **비효율적인 거리 계산**: 매번 하버사인 공식으로 전체 데이터를 스캔
3. **LIKE 검색**: `%query%` 패턴으로 인한 풀 테이블 스캔
4. **중복 쿼리**: 정확한 매칭을 위해 여러 번의 DB 호출
5. **제한 없는 결과**: LIMIT이 없어 대량 데이터 반환 가능

## 🚀 최적화 구현

### 1. 데이터베이스 인덱스 최적화

#### 생성된 인덱스

```sql
-- 헬스장명 검색 최적화
CREATE INDEX idx_gym_name_search ON gym (name) USING BTREE;

-- 주소 검색 최적화
CREATE INDEX idx_gym_address_search ON gym (address) USING BTREE;

-- 위치 기반 검색 최적화
CREATE INDEX idx_gym_location ON gym (latitude, longitude) USING BTREE;

-- 시설 정보 검색 최적화
CREATE INDEX idx_gym_24hours ON gym (is24Hours) USING BTREE;
CREATE INDEX idx_gym_pt ON gym (hasPT) USING BTREE;
CREATE INDEX idx_gym_gx ON gym (hasGX) USING BTREE;
CREATE INDEX idx_gym_parking ON gym (hasParking) USING BTREE;
CREATE INDEX idx_gym_shower ON gym (hasShower) USING BTREE;

-- 복합 검색 최적화
CREATE INDEX idx_gym_name_location ON gym (name, latitude, longitude) USING BTREE;
CREATE INDEX idx_gym_facilities ON gym (is24Hours, hasPT, hasGX, hasParking, hasShower) USING BTREE;
```

#### 인덱스 실행

```bash
# 마이그레이션 실행
npm run ts-node src/backend/scripts/runGymOptimization.ts
```

### 2. 최적화된 검색 서비스

#### 주요 기능

- **Bounding Box 최적화**: 위치 기반 검색 시 먼저 대략적인 영역을 필터링
- **인덱스 활용**: 효율적인 쿼리 실행을 위한 인덱스 활용
- **페이지네이션**: 대량 데이터 처리를 위한 LIMIT/OFFSET 적용
- **캐싱 지원**: 자주 사용되는 검색 결과 캐싱

#### 사용 예시

```typescript
import { optimizedGymSearchService } from '../services/optimizedGymSearchService'

// 위치 기반 검색
const nearbyGyms = await optimizedGymSearchService.getNearbyGyms(
  37.5665,
  126.978,
  5,
  20
)

// 복합 검색
const searchResult = await optimizedGymSearchService.searchGyms({
  name: '헬스',
  latitude: 37.5665,
  longitude: 126.978,
  radius: 10,
  hasPT: true,
  is24Hours: true,
  limit: 50,
  offset: 0,
})
```

### 3. 새로운 API 엔드포인트

#### 추가된 엔드포인트

- `GET /api/gyms/search/suggestions` - 헬스장명 자동완성
- `GET /api/gyms/stats` - 헬스장 통계 정보
- `GET /api/gyms/search` - 최적화된 검색 (페이지네이션 지원)

#### API 사용 예시

```typescript
// 자동완성
const suggestions = await fetch(
  '/api/gyms/search/suggestions?query=헬스&limit=10'
)

// 통계 조회
const stats = await fetch('/api/gyms/stats')

// 최적화된 검색
const searchResult = await fetch(
  '/api/gyms/search?query=헬스&latitude=37.5665&longitude=126.978&radius=5&hasPT=true&limit=20'
)
```

### 4. 프론트엔드 최적화

#### 최적화된 검색 훅

```typescript
import { useOptimizedGymSearch } from '../hooks/useOptimizedGymSearch'

function GymSearchComponent() {
  const {
    gyms,
    isLoading,
    error,
    searchGyms,
    searchNearbyGyms,
    getSuggestions,
  } = useOptimizedGymSearch({
    initialPosition: { lat: 37.5665, lng: 126.978 },
    enableCache: true,
    debounceMs: 300,
  })

  // 사용 예시
  const handleSearch = (query: string) => {
    searchGyms({ name: query, limit: 20 })
  }
}
```

#### 캐싱 서비스

```typescript
import { cachedGymSearchService } from '../API/optimizedGymApi'

// 캐시를 활용한 검색
const result = await cachedGymSearchService.searchGyms({
  name: '헬스',
  latitude: 37.5665,
  longitude: 126.978,
})

// 캐시 관리
cachedGymSearchService.clearCache()
console.log('캐시 크기:', cachedGymSearchService.getCacheSize())
```

## 📈 성능 개선 결과

### 예상 성능 향상

- **위치 기반 검색**: 70-80% 성능 향상 (인덱스 + bounding box)
- **텍스트 검색**: 60-70% 성능 향상 (인덱스 활용)
- **복합 검색**: 50-60% 성능 향상 (복합 인덱스)
- **자동완성**: 80-90% 성능 향상 (전용 인덱스)

### 성능 테스트 실행

```bash
# 성능 테스트 실행
npm run ts-node src/backend/scripts/performanceTest.ts
```

## 🛠️ 설치 및 설정

### 1. 의존성 설치

```bash
# 백엔드 의존성
cd deukgeun/src/backend
npm install

# 프론트엔드 의존성
cd deukgeun/src/frontend
npm install
```

### 2. 데이터베이스 설정

```bash
# 환경 변수 설정
cp deukgeun/src/backend/env.sample deukgeun/src/backend/.env

# 데이터베이스 마이그레이션 실행
npm run ts-node src/backend/scripts/runGymOptimization.ts
```

### 3. 헬스장 데이터 시드

```bash
# 헬스장 데이터 시드 (필요한 경우)
npm run ts-node src/backend/scripts/seedGyms.ts
```

## 🔧 사용법

### 백엔드 API 사용

```typescript
// 1. 기본 검색
GET /api/gyms/search?query=헬스&limit=20

// 2. 위치 기반 검색
GET /api/gyms/search?latitude=37.5665&longitude=126.978&radius=5&limit=20

// 3. 시설 필터링
GET /api/gyms/search?hasPT=true&is24Hours=true&hasParking=true

// 4. 자동완성
GET /api/gyms/search/suggestions?query=헬스&limit=10

// 5. 통계 조회
GET /api/gyms/stats
```

### 프론트엔드 컴포넌트 사용

```tsx
import { OptimizedSearchBar } from './components/OptimizedSearchBar/OptimizedSearchBar'
import { OptimizedFilters } from './components/OptimizedFilters/OptimizedFilters'

function GymFinderPage() {
  return (
    <div>
      <OptimizedSearchBar
        onSearch={handleSearch}
        showSuggestions={true}
        maxSuggestions={10}
      />

      <OptimizedFilters
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        showCounts={true}
      />
    </div>
  )
}
```

## 📊 모니터링 및 유지보수

### 성능 모니터링

```bash
# 정기적인 성능 테스트
npm run ts-node src/backend/scripts/performanceTest.ts

# 인덱스 상태 확인
SHOW INDEX FROM gym;
```

### 캐시 관리

```typescript
// 캐시 크기 모니터링
const cacheSize = cachedGymSearchService.getCacheSize()

// 주기적인 캐시 클리어 (예: 1시간마다)
setInterval(
  () => {
    cachedGymSearchService.clearCache()
  },
  60 * 60 * 1000
)
```

## 🚨 주의사항

### 데이터베이스

- 인덱스 생성 시 데이터베이스 락이 발생할 수 있음
- 대용량 데이터의 경우 인덱스 생성에 시간이 소요될 수 있음
- 정기적인 인덱스 최적화 필요

### 메모리 사용량

- 캐싱 서비스 사용 시 메모리 사용량 증가
- 적절한 캐시 크기 제한 설정 필요

### API 제한

- 페이지네이션을 통한 대량 데이터 요청 제한
- 적절한 LIMIT 값 설정 (권장: 20-50개)

## 🔮 향후 개선 계획

### 단기 계획

- [ ] Redis 캐싱 도입
- [ ] Elasticsearch 통합 검색
- [ ] 실시간 검색 통계 대시보드

### 장기 계획

- [ ] AI 기반 검색 추천
- [ ] 사용자 행동 분석 기반 개인화
- [ ] 지도 기반 시각화 최적화

## 📞 지원

문제가 발생하거나 추가 지원이 필요한 경우:

1. 성능 테스트 결과 확인
2. 데이터베이스 인덱스 상태 점검
3. 캐시 서비스 상태 확인
4. API 응답 시간 모니터링

---

**최적화 완료일**: 2025년 1월
**버전**: 1.0.0
**작성자**: AI Assistant
