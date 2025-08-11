# 타입 시스템 마이그레이션 가이드

## 개요

프로젝트의 타입 관리 구조를 중앙화하여 일관성과 유지보수성을 향상시켰습니다.

## 새로운 타입 시스템 구조

```
src/
├── types/                    # 중앙화된 타입 정의
│   ├── index.ts             # 모든 타입 내보내기
│   ├── common.ts            # 공통 유틸리티 타입
│   ├── auth.ts              # 인증 관련 타입
│   ├── gym.ts               # 헬스장 관련 타입
│   ├── machine.ts           # 머신 관련 타입
│   ├── post.ts              # 게시글 관련 타입
│   ├── workout.ts           # 운동 관련 타입
│   └── stats.ts             # 통계 관련 타입
├── frontend/
│   └── shared/types/        # 기존 타입 (마이그레이션 중)
└── backend/
    └── types/               # 기존 타입 (마이그레이션 중)
```

## 주요 변경사항

### 1. 중앙화된 타입 정의
- 모든 타입이 `src/types/` 디렉토리에 중앙화됨
- 도메인별로 파일 분리 (auth, gym, machine, post, workout, stats)
- 공통 유틸리티 타입은 `common.ts`에 정의

### 2. 일관된 타입 네이밍
- 모든 타입이 일관된 네이밍 컨벤션 사용
- 중복된 타입 정의 제거
- 타입 간 의존성 명확화

### 3. 개선된 TypeScript 설정
- 프로젝트 루트의 `tsconfig.json` 업데이트
- 백엔드 전용 `tsconfig.json` 생성
- Path mapping 개선

## 마이그레이션 단계

### 1단계: 기존 타입 파일 업데이트

기존 타입 파일들은 새로운 중앙화된 타입을 재내보내도록 업데이트되었습니다:

```typescript
// 기존: src/frontend/shared/types/user.ts
export interface User {
  id: number
  email: string
  nickname: string
  accessToken: string
}

// 새로운: src/frontend/shared/types/user.ts
export { User, UserProfile } from "@types/common"
```

### 2단계: import 문 업데이트

기존 코드에서 타입 import를 새로운 경로로 변경:

```typescript
// 기존
import { User } from "@shared/types/user"
import { Machine } from "@shared/types/machine"

// 새로운
import { User, Machine } from "@types"
// 또는
import { User } from "@types/common"
import { Machine } from "@types/machine"
```

### 3단계: 타입 사용법

```typescript
// 공통 유틸리티 타입
import type { ApiResponse, Nullable, Optional } from "@types/common"

// 도메인별 타입
import type { User, UserProfile } from "@types/common"
import type { Machine, MachineCategory } from "@types/machine"
import type { Post, Comment } from "@types/post"
import type { Gym, GymType } from "@types/gym"
import type { WorkoutPlan, WorkoutSession } from "@types/workout"
import type { PlatformStats } from "@types/stats"

// 인증 관련 타입
import type { LoginRequest, LoginResponse } from "@types/auth"
```

## 새로운 타입 정의

### 공통 유틸리티 타입 (`@types/common`)

```typescript
// 유틸리티 타입
type Nullable<T> = T | null
type Optional<T> = T | undefined
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

// API 응답 타입
type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
  error?: string
}

// 사용자 타입
interface User {
  id: number
  email: string
  nickname: string
  role: UserRole
  // ... 기타 필드
}
```

### 도메인별 타입

각 도메인별로 관련 타입들이 정의되어 있습니다:

- **Auth**: `LoginRequest`, `LoginResponse`, `RegisterRequest` 등
- **Gym**: `Gym`, `GymType`, `GymCrawlerData` 등
- **Machine**: `Machine`, `MachineCategory`, `DifficultyLevel` 등
- **Post**: `Post`, `Comment`, `Like` 등
- **Workout**: `WorkoutPlan`, `WorkoutSession`, `ExerciseSet` 등
- **Stats**: `PlatformStats`, `DetailedStats` 등

## 마이그레이션 체크리스트

- [ ] 기존 타입 import 문을 새로운 경로로 변경
- [ ] 중복된 타입 정의 제거
- [ ] 타입 네이밍 일관성 확인
- [ ] TypeScript 컴파일 에러 해결
- [ ] 테스트 코드 타입 업데이트
- [ ] 문서 업데이트

## 주의사항

1. **점진적 마이그레이션**: 모든 파일을 한 번에 변경하지 말고 단계적으로 진행
2. **타입 호환성**: 기존 타입과 새로운 타입 간의 호환성 확인
3. **테스트**: 마이그레이션 후 모든 기능이 정상 작동하는지 확인
4. **문서화**: 변경된 타입 구조에 대한 문서 업데이트

## 문제 해결

### TypeScript 컴파일 에러
- Path mapping이 제대로 작동하지 않는 경우 `tsconfig.json` 확인
- 타입 import 경로가 올바른지 확인

### 타입 불일치
- 기존 타입과 새로운 타입 간의 필드 차이 확인
- 필요한 경우 타입 변환 함수 작성

### 순환 의존성
- 타입 간 순환 의존성이 발생하는 경우 구조 재검토
- 공통 타입을 별도 파일로 분리

## 추가 개선사항

1. **Zod 스키마 통합**: 런타임 타입 검증을 위한 Zod 스키마 추가
2. **타입 가드**: 타입 안전성을 위한 타입 가드 함수 추가
3. **API 타입 자동 생성**: OpenAPI 스펙에서 타입 자동 생성
4. **타입 테스트**: 타입 정의의 정확성을 검증하는 테스트 추가
