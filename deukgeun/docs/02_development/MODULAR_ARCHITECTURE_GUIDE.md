# 모듈화된 크롤링 시스템 아키텍처 가이드

## 개요

크롤링 시스템이 모듈화된 구조로 리팩토링되어 유지보수성, 확장성, 테스트 용이성이 크게 향상되었습니다. 이 문서는 새로운 아키텍처와 각 모듈의 역할을 설명합니다.

## 아키텍처 개요

```
src/backend/modules/crawling/
├── sources/
│   └── OptimizedGymCrawlingSource.ts    # 메인 크롤링 소스 (리팩토링됨)
├── processors/
│   ├── BatchProcessor.ts                # 배치 처리 모듈 (신규)
│   ├── CrossValidator.ts                # 기존
│   └── PriceExtractor.ts                # 기존
├── utils/
│   └── PerformanceMonitor.ts            # 성능 모니터링 모듈 (신규)
├── config/
│   └── CrawlingConfigManager.ts         # 설정 관리 모듈 (신규)
└── types/
    └── CrawlingTypes.ts                 # 기존
```

## 모듈별 상세 설명

### 1. CrawlingConfigManager (설정 관리)

**역할**: 크롤링 시스템의 모든 설정을 중앙에서 관리

**주요 기능**:
- 설정 중앙화 및 검증
- 설정 히스토리 관리
- 설정 가져오기/내보내기
- 동적 설정 업데이트

**사용 예시**:
```typescript
const configManager = new CrawlingConfigManager({
  batchProcessing: {
    initialBatchSize: 10,
    maxConsecutiveFailures: 3
  },
  successRate: {
    targetRate: 95
  }
})

// 설정 업데이트
configManager.setConfigValue('batchProcessing.initialBatchSize', 15)

// 설정 검증
const validation = configManager.validateConfig(newConfig)
```

### 2. PerformanceMonitor (성능 모니터링)

**역할**: 크롤링 성능을 실시간으로 추적하고 분석

**주요 기능**:
- 실시간 성능 통계 수집
- 성공률 모니터링
- 처리 시간 추적
- 성능 리포트 생성

**사용 예시**:
```typescript
const monitor = new PerformanceMonitor({
  enableRealTimeMonitoring: true,
  reportInterval: 10000
})

// 통계 기록
monitor.recordBatchAttempt(true, 1500)
monitor.recordIndividualAttempt(false, 0)

// 리포트 생성
const report = monitor.generatePerformanceReport()
```

### 3. BatchProcessor (배치 처리)

**역할**: 헬스장 데이터를 배치 단위로 처리하고 동적 배치 크기 조정

**주요 기능**:
- 동적 배치 크기 조정
- 연속 실패 처리
- 개별 처리 폴백
- 성공률 기반 최적화

**사용 예시**:
```typescript
const batchProcessor = new BatchProcessor({
  initialBatchSize: 10,
  maxConsecutiveFailures: 3
}, performanceMonitor)

// 배치 처리 실행
const result = await batchProcessor.processBatches(
  gyms,
  (batch) => processBatch(batch)
)
```

### 4. OptimizedGymCrawlingSource (메인 크롤링 소스)

**역할**: 모든 모듈을 통합하여 크롤링 작업을 조율

**주요 개선사항**:
- 모듈화된 구조로 책임 분리
- 설정 기반 초기화
- 성능 모니터링 통합
- 배치 처리 위임

**사용 예시**:
```typescript
const crawlingSource = new OptimizedGymCrawlingSource(30000, 1000, {
  batchProcessing: {
    initialBatchSize: 5,
    maxConsecutiveFailures: 2
  },
  performanceMonitoring: {
    enableRealTimeMonitoring: true
  }
})

const results = await crawlingSource.crawlGymsFromRawData(gyms)
```

## 모듈 간 상호작용

### 데이터 흐름

```
CrawlingConfigManager
    ↓ (설정 제공)
OptimizedGymCrawlingSource
    ↓ (배치 위임)
BatchProcessor
    ↓ (통계 전달)
PerformanceMonitor
    ↓ (결과 반환)
OptimizedGymCrawlingSource
```

### 의존성 관계

- **OptimizedGymCrawlingSource** → **CrawlingConfigManager**
- **OptimizedGymCrawlingSource** → **PerformanceMonitor**
- **OptimizedGymCrawlingSource** → **BatchProcessor**
- **BatchProcessor** → **PerformanceMonitor**

## 장점

### 1. 유지보수성 향상
- 각 모듈이 단일 책임을 가짐
- 코드 변경 시 영향 범위 최소화
- 명확한 인터페이스로 모듈 간 결합도 감소

### 2. 확장성 향상
- 새로운 기능 추가 시 기존 모듈에 영향 없음
- 플러그인 방식으로 모듈 교체 가능
- 설정 기반으로 동작 방식 변경 가능

### 3. 테스트 용이성 향상
- 각 모듈을 독립적으로 테스트 가능
- Mock 객체를 통한 단위 테스트 용이
- 통합 테스트 시 모듈별 검증 가능

### 4. 성능 최적화
- 모듈별 성능 모니터링 가능
- 병목 지점 식별 용이
- 설정 기반 성능 튜닝 가능

## 마이그레이션 가이드

### 기존 코드에서 새 구조로 전환

**Before (기존)**:
```typescript
const crawlingSource = new OptimizedGymCrawlingSource()
crawlingSource.setBatchSize(5)
crawlingSource.setMaxConsecutiveFailures(3)
const results = await crawlingSource.crawlGymsFromRawData(gyms)
```

**After (새 구조)**:
```typescript
const crawlingSource = new OptimizedGymCrawlingSource(30000, 1000, {
  batchProcessing: {
    initialBatchSize: 5,
    maxConsecutiveFailures: 3
  }
})
const results = await crawlingSource.crawlGymsFromRawData(gyms)
```

### 설정 관리 개선

**Before**:
```typescript
// 하드코딩된 설정
const batchSize = 10
const maxFailures = 3
```

**After**:
```typescript
// 중앙화된 설정 관리
const configManager = new CrawlingConfigManager()
const batchSize = configManager.getConfigValue('batchProcessing.initialBatchSize')
```

## 모듈별 설정 옵션

### CrawlingConfigManager 설정

```typescript
interface CrawlingSystemConfig {
  // 기본 크롤링 설정
  timeout: number
  delay: number
  maxRetries: number
  
  // 배치 처리 설정
  batchProcessing: {
    initialBatchSize: number
    minBatchSize: number
    maxBatchSize: number
    maxConsecutiveFailures: number
    batchDelay: { min: number; max: number }
    lowSuccessRateDelay: { min: number; max: number }
    lowSuccessRateThreshold: number
  }
  
  // 성능 모니터링 설정
  performanceMonitoring: {
    enableDetailedStats: boolean
    enableRealTimeMonitoring: boolean
    reportInterval: number
    maxHistorySize: number
  }
  
  // 성공률 목표 설정
  successRate: {
    targetRate: number
    warningThreshold: number
    criticalThreshold: number
  }
}
```

### PerformanceMonitor 설정

```typescript
interface PerformanceConfig {
  enableDetailedStats: boolean
  enableRealTimeMonitoring: boolean
  reportInterval: number
  maxHistorySize: number
}
```

### BatchProcessor 설정

```typescript
interface BatchProcessorConfig {
  initialBatchSize: number
  minBatchSize: number
  maxBatchSize: number
  maxConsecutiveFailures: number
  batchDelay: { min: number; max: number }
  lowSuccessRateDelay: { min: number; max: number }
  lowSuccessRateThreshold: number
}
```

## 성능 모니터링

### 실시간 모니터링

```typescript
const monitor = new PerformanceMonitor({
  enableRealTimeMonitoring: true,
  reportInterval: 5000 // 5초마다 리포트
})

// 자동으로 실시간 리포트 생성
```

### 성능 통계 수집

```typescript
// 배치 처리 통계
monitor.recordBatchAttempt(success, processingTime)

// 개별 처리 통계
monitor.recordIndividualAttempt(success, processingTime)

// 폴백 통계
monitor.recordFallbackSuccess()

// 재시도 통계
monitor.recordRetryAttempt(success)

// 최적화 통계
monitor.recordOptimizationAttempt(success)
```

### 성능 리포트

```typescript
// 상세 리포트
const report = monitor.generatePerformanceReport()

// 통계 데이터
const stats = monitor.getStats()

// 평균 성능
const average = monitor.getAveragePerformance()
```

## 확장 예시

### 새로운 모듈 추가

```typescript
// 새로운 모듈 예시: CacheManager
export class CacheManager {
  private cache: Map<string, any> = new Map()
  
  constructor(config: CacheConfig) {
    // 초기화
  }
  
  async get(key: string): Promise<any> {
    // 캐시 조회
  }
  
  async set(key: string, value: any): Promise<void> {
    // 캐시 저장
  }
}

// OptimizedGymCrawlingSource에 통합
export class OptimizedGymCrawlingSource {
  private cacheManager: CacheManager
  
  constructor(config) {
    this.cacheManager = new CacheManager(config.cache)
    // 기존 초기화 코드...
  }
}
```

### 새로운 설정 추가

```typescript
// CrawlingConfigManager에 새로운 설정 추가
interface CrawlingSystemConfig {
  // 기존 설정들...
  
  // 새로운 캐시 설정
  cache: {
    enableCaching: boolean
    cacheSize: number
    ttl: number
  }
}
```

## 결론

모듈화된 아키텍처를 통해 크롤링 시스템의 유지보수성, 확장성, 테스트 용이성이 크게 향상되었습니다. 각 모듈은 명확한 책임을 가지며, 설정 기반으로 동작하여 다양한 환경에서 유연하게 사용할 수 있습니다.

### 주요 개선사항 요약

1. **모듈화**: 단일 책임 원칙에 따른 모듈 분리
2. **설정 중앙화**: 모든 설정을 한 곳에서 관리
3. **성능 모니터링**: 실시간 성능 추적 및 분석
4. **배치 처리**: 동적 배치 크기 조정 및 폴백 메커니즘
5. **확장성**: 새로운 기능 추가 시 기존 코드에 영향 최소화

이러한 구조를 통해 더욱 안정적이고 효율적인 크롤링 시스템을 구축할 수 있습니다.
