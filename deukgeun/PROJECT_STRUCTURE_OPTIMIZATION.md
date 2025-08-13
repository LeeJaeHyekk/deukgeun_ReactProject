# 프로젝트 구조 최적화 가이드

## 개요

이 문서는 타입 시스템 중앙화 후 프로젝트 구조를 최적화하고 일관성을 유지하기 위한 가이드입니다.

## 현재 구조 분석

### ✅ 완료된 작업

1. **타입 시스템 중앙화**
   - `src/types/` 디렉토리에 모든 타입 정의 통합
   - 중복된 타입 정의 제거
   - 일관된 네이밍 컨벤션 적용

2. **백엔드 엔티티 업데이트**
   - Machine, WorkoutGoal, User 엔티티 필드명 camelCase로 통일
   - ENUM 값 영문화 및 표준화
   - TypeORM 데코레이터 최적화

3. **프론트엔드 컴포넌트 업데이트**
   - Machine, WorkoutGoal 관련 컴포넌트 타입 불일치 해결
   - API 응답 타입 통일
   - 중앙화된 타입 시스템 적용

### 🔄 진행 중인 작업

1. **데이터베이스 마이그레이션**
   - 외래 키 제약 조건 문제 해결 필요
   - 단계적 마이그레이션 접근법 적용

## 권장 프로젝트 구조

```
deukgeun/
├── src/
│   ├── types/                    # 중앙화된 타입 시스템
│   │   ├── index.ts             # 메인 타입 export
│   │   ├── auth.ts              # 인증 관련 타입
│   │   ├── machine.ts           # 기계 관련 타입
│   │   ├── workout.ts           # 운동 관련 타입
│   │   ├── user.ts              # 사용자 관련 타입
│   │   └── ...
│   ├── backend/
│   │   ├── entities/            # TypeORM 엔티티
│   │   ├── controllers/         # API 컨트롤러
│   │   ├── services/            # 비즈니스 로직
│   │   ├── routes/              # 라우트 정의
│   │   └── ...
│   ├── frontend/
│   │   ├── features/            # 기능별 컴포넌트
│   │   │   ├── auth/
│   │   │   ├── workout/
│   │   │   └── machine/
│   │   ├── shared/              # 공통 컴포넌트
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── ...
│   └── shared/                  # 백엔드/프론트엔드 공통
│       ├── constants/           # 상수 정의
│       ├── utils/               # 유틸리티 함수
│       └── ...
├── docs/                        # 프로젝트 문서
├── scripts/                     # 유틸리티 스크립트
└── ...
```

## 타입 시스템 가이드라인

### 1. 타입 정의 원칙

```typescript
// ✅ 좋은 예
export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// ❌ 나쁜 예
export interface User {
  user_id: number
  user_email: string
  user_name: string
  user_role: string
  created_at: string
  updated_at: string
}
```

### 2. ENUM 사용 가이드

```typescript
// ✅ 좋은 예
export type UserRole = "admin" | "user" | "moderator"
export type MachineCategory = "strength" | "cardio" | "flexibility"

// ❌ 나쁜 예
export type UserRole = "관리자" | "사용자" | "모더레이터"
export type MachineCategory = "상체" | "하체" | "전신"
```

### 3. API 응답 타입

```typescript
// ✅ 일관된 API 응답 형식
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

## 컴포넌트 구조 가이드라인

### 1. 기능별 구조

```
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── AuthGuard.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useLogin.ts
│   ├── types/
│   │   └── index.ts (재내보내기)
│   └── index.ts
├── workout/
│   ├── components/
│   │   ├── WorkoutPlanModal.tsx
│   │   ├── WorkoutSessionModal.tsx
│   │   └── GoalProgressBar.tsx
│   ├── hooks/
│   │   ├── useWorkoutPlans.ts
│   │   └── useWorkoutGoals.ts
│   └── index.ts
└── machine/
    ├── components/
    │   ├── MachineCard.tsx
    │   └── MachineModal.tsx
    ├── hooks/
    │   └── useMachines.ts
    └── index.ts
```

### 2. 공통 컴포넌트

```
shared/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   └── ...
├── hooks/
│   ├── useApi.ts
│   ├── useDebounce.ts
│   └── ...
└── utils/
    ├── date.ts
    ├── validation.ts
    └── ...
```

## 마이그레이션 체크리스트

### 데이터베이스 마이그레이션

- [ ] 데이터베이스 백업 완료
- [ ] Machine 테이블 마이그레이션
- [ ] WorkoutGoal 테이블 마이그레이션
- [ ] User 테이블 마이그레이션
- [ ] 외래 키 제약 조건 재설정
- [ ] 데이터 무결성 검증

### 프론트엔드 업데이트

- [ ] 모든 컴포넌트에서 중앙화된 타입 사용
- [ ] API 응답 타입 통일
- [ ] 필드명 camelCase로 통일
- [ ] ENUM 값 영문화
- [ ] 타입 오류 해결

### 백엔드 업데이트

- [ ] 엔티티 필드명 camelCase로 통일
- [ ] 서비스 로직 타입 오류 해결
- [ ] 컨트롤러 응답 형식 통일
- [ ] API 문서 업데이트

## 테스트 전략

### 1. 단위 테스트

```typescript
// 컴포넌트 테스트
describe('MachineCard', () => {
  it('should render machine information correctly', () => {
    const machine: Machine = {
      id: 1,
      name: 'Bench Press',
      category: 'strength',
      difficulty: 'intermediate',
      targetMuscles: ['chest', 'triceps'],
      // ...
    }

    render(<MachineCard machine={machine} />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })
})
```

### 2. 통합 테스트

```typescript
// API 통합 테스트
describe("Machine API", () => {
  it("should create machine with correct data", async () => {
    const machineData: CreateMachineRequest = {
      name: "New Machine",
      category: "strength",
      difficulty: "beginner",
      // ...
    }

    const response = await machineApi.createMachine(machineData)
    expect(response.machine.name).toBe("New Machine")
  })
})
```

## 성능 최적화

### 1. 타입 최적화

```typescript
// ✅ 타입 가드 사용
function isMachine(obj: unknown): obj is Machine {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "category" in obj
  )
}

// ✅ 조건부 타입 사용
type MachineWithDetails = Machine & {
  usageStats?: MachineUsageStats
  reviews?: MachineReview[]
}
```

### 2. 컴포넌트 최적화

```typescript
// ✅ React.memo 사용
export const MachineCard = React.memo<MachineCardProps>(
  ({ machine, onClick }) => {
    // 컴포넌트 로직
  }
)

// ✅ useMemo 사용
const filteredMachines = useMemo(() => {
  return machines.filter(machine => machine.category === selectedCategory)
}, [machines, selectedCategory])
```

## 모니터링 및 유지보수

### 1. 타입 안전성 모니터링

- TypeScript 컴파일 오류 추적
- 런타임 타입 오류 로깅
- API 응답 타입 검증

### 2. 성능 모니터링

- 컴포넌트 렌더링 성능
- API 응답 시간
- 메모리 사용량

### 3. 코드 품질

- ESLint 규칙 준수
- Prettier 포맷팅
- 코드 리뷰 프로세스

## 다음 단계

1. **데이터베이스 마이그레이션 완료**
   - 외래 키 제약 조건 문제 해결
   - 단계적 마이그레이션 실행

2. **테스트 코드 업데이트**
   - 기존 테스트 타입 수정
   - 새로운 테스트 케이스 추가

3. **문서 업데이트**
   - API 문서 최신화
   - 개발자 가이드 업데이트

4. **성능 최적화**
   - 번들 크기 최적화
   - 로딩 성능 개선

---

**마지막 업데이트**: 2024년 12월
**버전**: 1.0.0
