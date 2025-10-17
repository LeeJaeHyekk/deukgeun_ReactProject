# 서버 모듈 (Server Module)

이 모듈은 백엔드 서버의 초기화, 설정, 검증, 데이터베이스 연결, 서버 시작 등의 기능을 모듈화하여 관리합니다.

## 모듈 구조

```
src/backend/modules/server/
├── index.ts                 # 모듈 인덱스 (모든 export)
├── ServerConfig.ts          # 서버 설정 관리 (캐싱 최적화)
├── ServerValidator.ts       # 환경 변수 검증 (캐싱 최적화)
├── DatabaseManager.ts       # 데이터베이스 연결 관리 (지연 로딩)
├── ServerStarter.ts         # Express 서버 시작
├── ServerManager.ts         # 메인 서버 관리 (성능 모니터링)
├── ConfigCache.ts           # 설정 캐시 관리
├── LazyLoader.ts            # 지연 로딩 관리
├── PerformanceMonitor.ts    # 성능 모니터링
└── README.md               # 이 파일
```

## 주요 컴포넌트

### 1. ServerConfig.ts
- **역할**: 서버 설정 생성 및 관리
- **주요 함수**:
  - `createServerConfig()`: 환경 변수에서 서버 설정 생성
  - `logServerConfig()`: 서버 설정 정보 로그 출력

### 2. ServerValidator.ts
- **역할**: 환경 변수 검증
- **주요 함수**:
  - `validateEnvironmentVariables()`: 환경 변수 검증 수행
  - `shouldStartServer()`: 검증 결과 기반 서버 시작 여부 결정

### 3. DatabaseManager.ts
- **역할**: 데이터베이스 연결 관리
- **주요 함수**:
  - `connectDatabase()`: 데이터베이스 연결 시도
  - `isDatabaseConnected()`: 데이터베이스 연결 상태 확인
  - `logDatabaseStatus()`: 데이터베이스 상태 로그 출력

### 4. ServerStarter.ts
- **역할**: Express 서버 시작
- **주요 함수**:
  - `startExpressServer()`: Express 서버 시작
  - `setupGracefulShutdown()`: Graceful shutdown 핸들러 설정

### 5. ServerManager.ts
- **역할**: 메인 서버 관리 (모든 단계 통합)
- **주요 함수**:
  - `initializeAndStartServer()`: 서버 완전 초기화 및 시작 (성능 모니터링 포함)
  - `handleServerStartupError()`: 서버 시작 실패 시 에러 처리

### 6. ConfigCache.ts
- **역할**: 설정 캐시 관리
- **주요 함수**:
  - `getCachedServerConfig()`: 캐시된 서버 설정 반환
  - `getCachedValidationResult()`: 캐시된 검증 결과 반환
  - `invalidateCache()`: 캐시 무효화

### 7. LazyLoader.ts
- **역할**: 지연 로딩 관리
- **주요 함수**:
  - `lazyLoad()`: 모듈 지연 로딩
  - `lazyLoadDatabase()`: 데이터베이스 지연 로딩
  - `getLazyModuleStatus()`: 지연 로딩 상태 확인

### 8. PerformanceMonitor.ts
- **역할**: 성능 모니터링
- **주요 함수**:
  - `measureAsyncPerformance()`: 비동기 함수 성능 측정
  - `logPerformanceMetrics()`: 성능 메트릭 로그 출력
  - `logMemoryUsage()`: 메모리 사용량 로그 출력

## 사용법

### 기본 사용법
```typescript
import { initializeAndStartServer, handleServerStartupError } from "./modules/server"

// 서버 초기화 및 시작
initializeAndStartServer()
  .then((result) => {
    console.log("Server started successfully!")
    console.log(`Port: ${result.startup.port}`)
    console.log(`Database connected: ${result.database.connected}`)
  })
  .catch(handleServerStartupError)
```

### 개별 모듈 사용법

#### 서버 설정 생성
```typescript
import { createServerConfig } from "./modules/server"

const config = createServerConfig()
console.log(`Port: ${config.port}`)
console.log(`Environment: ${config.environment}`)
```

#### 환경 변수 검증
```typescript
import { validateEnvironmentVariables } from "./modules/server"

const validation = await validateEnvironmentVariables(config)
if (validation.isValid) {
  console.log("All configurations are valid")
} else {
  console.log("Validation errors:", validation.errors)
}
```

#### 데이터베이스 연결
```typescript
import { connectDatabase } from "./modules/server"

const dbResult = await connectDatabase(config)
if (dbResult.connected) {
  console.log("Database connected successfully")
} else {
  console.log("Database connection failed:", dbResult.error)
}
```

## 타입 정의

### ServerConfig
```typescript
interface ServerConfig {
  port: number
  environment: string
  corsOrigin: string[]
}
```

### ValidationResult
```typescript
interface ValidationResult {
  isValid: boolean
  errors: string[]
  configs: {
    server: any
    database: any
    jwt: any
  }
}
```

### DatabaseConnectionResult
```typescript
interface DatabaseConnectionResult {
  connected: boolean
  error?: string
}
```

### ServerStartResult
```typescript
interface ServerStartResult {
  server: Server
  port: number
  startupTime: number
}
```

## 환경별 동작

### 개발 환경 (development)
- 환경 변수 검증 실패 시에도 서버 시작 허용
- 데이터베이스 연결 실패 시에도 서버 시작 허용 (제한된 기능)
- 상세한 디버그 로그 출력

### 프로덕션 환경 (production)
- 모든 환경 변수 검증 필수
- 데이터베이스 연결 필수
- 검증 실패 시 서버 시작 중단

## 에러 처리

모든 모듈은 적절한 에러 처리를 포함하고 있습니다:

1. **환경 변수 검증 실패**: 개발 환경에서는 경고, 프로덕션에서는 종료
2. **데이터베이스 연결 실패**: 개발 환경에서는 제한된 기능으로 계속, 프로덕션에서는 종료
3. **서버 시작 실패**: 상세한 에러 메시지와 함께 종료

## 성능 최적화

### 1. 캐싱 시스템
- **설정 캐싱**: 서버 설정과 검증 결과를 30초간 캐시
- **메모리 효율성**: 중복 계산 방지로 CPU 사용량 감소
- **TTL 설정**: `setCacheTTL()`로 캐시 만료 시간 조정 가능

### 2. 지연 로딩
- **모듈 지연 로딩**: 필요할 때만 모듈 로드
- **데이터베이스 지연 로딩**: 실제 사용 시점에 DB 연결
- **상태 추적**: 로딩 상태와 성능 메트릭 추적

### 3. 성능 모니터링
- **자동 성능 측정**: 모든 주요 함수의 실행 시간 측정
- **메모리 모니터링**: 실시간 메모리 사용량 추적
- **메트릭 수집**: 평균, 최소, 최대 실행 시간 통계

### 4. 절대 경로 최적화
- **간소화된 경로**: `@/` 접두사로 깔끔한 import
- **빠른 해석**: TypeScript 컴파일러의 경로 해석 최적화
- **IDE 지원**: 자동완성과 리팩토링 지원 향상

## 확장성

이 모듈 구조는 다음과 같이 확장할 수 있습니다:

1. **새로운 설정 추가**: `ServerConfig.ts`에 새로운 설정 필드 추가
2. **새로운 검증 로직**: `ServerValidator.ts`에 새로운 검증 함수 추가
3. **새로운 데이터베이스**: `DatabaseManager.ts`에 새로운 DB 연결 로직 추가
4. **새로운 서버 기능**: `ServerStarter.ts`에 새로운 서버 설정 추가
5. **성능 모니터링 확장**: `PerformanceMonitor.ts`에 새로운 메트릭 추가
6. **캐싱 전략 확장**: `ConfigCache.ts`에 새로운 캐싱 로직 추가

## 테스트

각 모듈은 독립적으로 테스트할 수 있도록 설계되었습니다:

```typescript
// 예: ServerConfig 테스트
import { createServerConfig } from "./modules/server"

describe("ServerConfig", () => {
  it("should create config with default values", () => {
    const config = createServerConfig()
    expect(config.port).toBe(5000)
    expect(config.environment).toBe("development")
  })
})
```
