# Workout Journal 테스트 가이드

이 문서는 Workout Journal 기능에 대한 Jest 테스트 환경과 실행 방법에 대한 가이드입니다.

## 📋 목차

- [테스트 구조](#테스트-구조)
- [테스트 실행](#테스트-실행)
- [테스트 커버리지](#테스트-커버리지)
- [개별 테스트 실행](#개별-테스트-실행)
- [테스트 작성 가이드](#테스트-작성-가이드)
- [문제 해결](#문제-해결)

## 🏗️ 테스트 구조

```
src/test/
├── frontend/
│   ├── shared/
│   │   └── api/
│   │       └── workoutJournalApi.test.ts          # API 레이어 테스트
│   └── features/
│       └── workout/
│           ├── hooks/
│           │   ├── useWorkoutPlans.test.ts        # Plans 훅 테스트
│           │   ├── useWorkoutSessions.test.ts     # Sessions 훅 테스트
│           │   └── useWorkoutGoals.test.ts        # Goals 훅 테스트
│           └── WorkoutJournalPage.test.tsx        # 메인 페이지 컴포넌트 테스트
└── backend/
    ├── controllers/
    │   └── workoutJournalController.test.ts       # 컨트롤러 테스트
    └── integration/
        └── workoutJournal.integration.test.ts     # 통합 테스트
```

## 🚀 테스트 실행

### 전체 Workout Journal 테스트 실행

```bash
# 모든 Workout Journal 관련 테스트 실행
npm run test:workout

# 프론트엔드 테스트만 실행
npm run test:frontend

# 백엔드 테스트만 실행
npm run test:backend
```

### 개별 테스트 실행

```bash
# API 레이어 테스트
npm run test:workout:api

# 훅 테스트
npm run test:workout:hooks

# 컴포넌트 테스트
npm run test:workout:components

# 백엔드 컨트롤러 테스트
npm run test:workout:backend

# 통합 테스트
npm run test:workout:integration
```

### 특정 테스트 파일 실행

```bash
# 특정 테스트 파일 실행
npm test -- src/test/frontend/shared/api/workoutJournalApi.test.ts

# 특정 테스트 패턴 실행
npm test -- --testNamePattern="should create workout plan"
```

## 📊 테스트 커버리지

### 커버리지 확인

```bash
# 전체 커버리지 확인
npm run test:coverage

# Workout Journal 관련 커버리지만 확인
npm test -- --coverage --testPathPattern=src/test/.*workout
```

### 커버리지 리포트

테스트 실행 후 `coverage/` 디렉토리에서 HTML 리포트를 확인할 수 있습니다:

```bash
# HTML 리포트 열기 (macOS)
open coverage/lcov-report/index.html

# HTML 리포트 열기 (Windows)
start coverage/lcov-report/index.html

# HTML 리포트 열기 (Linux)
xdg-open coverage/lcov-report/index.html
```

## 🧪 테스트 작성 가이드

### 프론트엔드 테스트

#### API 테스트 (`workoutJournalApi.test.ts`)

```typescript
describe("WorkoutJournalApi", () => {
  it("should fetch plans successfully", async () => {
    // Mock fetch response
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockPlans,
      }),
    }

    // Test API call
    const result = await WorkoutJournalApi.getWorkoutPlans()
    expect(result).toEqual(mockPlans)
  })
})
```

#### 훅 테스트 (`useWorkoutPlans.test.ts`)

```typescript
describe("useWorkoutPlans", () => {
  it("should fetch plans successfully", async () => {
    mockedWorkoutJournalApi.getWorkoutPlans.mockResolvedValue(mockPlans)

    const { result } = renderHook(() => useWorkoutPlans())

    await act(async () => {
      await result.current.getUserPlans()
    })

    expect(result.current.plans).toEqual(mockPlans)
  })
})
```

#### 컴포넌트 테스트 (`WorkoutJournalPage.test.tsx`)

```typescript
describe("WorkoutJournalPage", () => {
  it("should render workout plans", async () => {
    const user = userEvent.setup()
    renderWithProviders(true)

    await user.click(screen.getByText("운동 계획"))

    expect(screen.getByText("새 계획 만들기")).toBeInTheDocument()
  })
})
```

### 백엔드 테스트

#### 컨트롤러 테스트 (`workoutJournalController.test.ts`)

```typescript
describe("WorkoutJournalController", () => {
  it("should return user plans successfully", async () => {
    mockedWorkoutJournalService.prototype.getUserPlans.mockResolvedValue(
      mockPlans
    )

    await controller.getWorkoutPlans(mockRequest, mockResponse)

    expect(mockJson).toHaveBeenCalledWith({ success: true, data: mockPlans })
  })
})
```

#### 통합 테스트 (`workoutJournal.integration.test.ts`)

```typescript
describe("WorkoutJournal API Integration Tests", () => {
  it("should create a new workout plan", async () => {
    const response = await request(app)
      .post("/api/workout-journal/plans")
      .set("Authorization", `Bearer ${authToken}`)
      .send(planData)
      .expect(200)

    expect(response.body.data.name).toBe(planData.name)
  })
})
```

## 🔧 Mock 설정

### API Mock

```typescript
// Mock the API
jest.mock("../../../../../frontend/shared/api/workoutJournalApi")
const mockedWorkoutJournalApi = WorkoutJournalApi as jest.Mocked<
  typeof WorkoutJournalApi
>
```

### Service Mock

```typescript
// Mock the service
jest.mock("../../../../backend/services/workoutJournalService")
const mockedWorkoutJournalService = WorkoutJournalService as jest.MockedClass<
  typeof WorkoutJournalService
>
```

### Component Mock

```typescript
// Mock components
jest.mock("../../../../../frontend/widgets/Navigation/Navigation", () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}))
```

## 📝 테스트 데이터

### Mock 데이터 구조

```typescript
const mockPlans = [
  {
    id: 1,
    userId: 1,
    name: "상체 운동",
    description: "상체 근력 향상을 위한 운동",
    difficulty: "intermediate",
    estimatedDurationMinutes: 60,
    targetMuscleGroups: ["chest", "back", "shoulders"],
    isActive: true,
    exercises: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
```

### 테스트 유틸리티

```typescript
// 테스트 헬퍼 함수
const renderWithProviders = (isLoggedIn = true) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <WorkoutTimerContext.Provider value={mockWorkoutTimer}>
        <WorkoutJournalPage />
      </WorkoutTimerContext.Provider>
    </AuthContext.Provider>
  )
}
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. Mock 관련 오류

```bash
# 문제: Mock이 제대로 설정되지 않음
# 해결: beforeEach에서 jest.clearAllMocks() 호출
beforeEach(() => {
  jest.clearAllMocks()
})
```

#### 2. 비동기 테스트 오류

```typescript
// 문제: 비동기 작업이 완료되기 전에 테스트 종료
// 해결: act와 waitFor 사용
await act(async () => {
  await result.current.getUserPlans()
})

await waitFor(() => {
  expect(mockedApi.getUserPlans).toHaveBeenCalled()
})
```

#### 3. 데이터베이스 연결 오류 (통합 테스트)

```typescript
// 문제: 테스트 데이터베이스 연결 실패
// 해결: beforeAll에서 데이터베이스 초기화
beforeAll(async () => {
  await AppDataSource.initialize()
})

afterAll(async () => {
  await AppDataSource.destroy()
})
```

### 디버깅 팁

#### 1. 테스트 실행 중 로그 확인

```bash
# 상세한 로그와 함께 테스트 실행
npm test -- --verbose --testPathPattern=workoutJournalApi.test.ts
```

#### 2. 특정 테스트만 실행

```bash
# 특정 테스트만 실행
npm test -- --testNamePattern="should create workout plan"
```

#### 3. 테스트 타임아웃 설정

```typescript
// 긴 테스트의 경우 타임아웃 설정
it("should handle long running operation", async () => {
  // 테스트 로직
}, 10000) // 10초 타임아웃
```

## 📈 성능 최적화

### 테스트 실행 최적화

```bash
# 병렬 실행으로 속도 향상
npm test -- --maxWorkers=4

# 캐시 사용으로 재실행 속도 향상
npm test -- --cache
```

### Mock 최적화

```typescript
// 무거운 모듈은 최상위에서 Mock
jest.mock("../../../../../frontend/shared/api/workoutJournalApi")
jest.mock("../../../../../frontend/features/workout/hooks/useWorkoutPlans")
```

## 🔄 CI/CD 통합

### GitHub Actions 예시

```yaml
name: Workout Journal Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:workout
      - run: npm run test:coverage
```

### 테스트 결과 리포트

```bash
# JUnit XML 리포트 생성
npm test -- --reporter=junit --outputDirectory=test-results

# JSON 리포트 생성
npm test -- --json --outputFile=test-results.json
```

## 📚 추가 리소스

- [Jest 공식 문서](https://jestjs.io/docs/getting-started)
- [React Testing Library 가이드](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest 문서](https://github.com/visionmedia/supertest)
- [TypeORM 테스트 가이드](https://typeorm.io/testing)

---

이 가이드를 통해 Workout Journal 기능의 테스트를 효과적으로 작성하고 실행할 수 있습니다. 문제가 발생하면 위의 문제 해결 섹션을 참조하거나 팀원들과 상의해주세요.
