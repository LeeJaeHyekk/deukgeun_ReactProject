# 🧪 테스트 가이드

이 문서는 Deukgeun 프로젝트의 테스트 시스템에 대한 종합적인 가이드입니다.

## 📋 목차

- [테스트 개요](#테스트-개요)
- [테스트 환경 설정](#테스트-환경-설정)
- [테스트 실행](#테스트-실행)
- [테스트 작성 가이드](#테스트-작성-가이드)
- [테스트 유형별 가이드](#테스트-유형별-가이드)
- [코드 커버리지](#코드-커버리지)
- [CI/CD 통합](#cicd-통합)
- [문제 해결](#문제-해결)

## 🎯 테스트 개요

### 테스트 전략

Deukgeun 프로젝트는 다음과 같은 테스트 전략을 사용합니다:

- **단위 테스트 (Unit Tests)**: 개별 컴포넌트와 함수 테스트
- **통합 테스트 (Integration Tests)**: 여러 컴포넌트 간의 상호작용 테스트
- **E2E 테스트 (End-to-End Tests)**: 전체 사용자 플로우 테스트

### 테스트 도구

- **Vitest**: 테스트 러너 및 프레임워크
- **React Testing Library**: React 컴포넌트 테스트
- **Jest DOM**: DOM 관련 매처
- **User Event**: 사용자 상호작용 시뮬레이션

## 🔧 테스트 환경 설정

### 1. 자동 설정

```bash
# 테스트 환경 자동 설정
node scripts/test-setup.js setup
```

### 2. 수동 설정

#### 의존성 설치

```bash
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

#### 환경 변수 설정

`.env.test` 파일을 생성하고 다음 내용을 추가:

```env
NODE_ENV=test
VITE_BACKEND_URL=http://localhost:5000
VITE_RECAPTCHA_SITE_KEY=test-recaptcha-key
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=test-kakao-key
VITE_LOCATION_REST_MAP_API_KEY=test-kakao-rest-key
VITE_GYM_API_KEY=test-gym-key
```

## 🚀 테스트 실행

### 기본 명령어

```bash
# 모든 테스트 실행
npm run test

# 단위 테스트만 실행
npm run test:unit

# 통합 테스트만 실행
npm run test:integration

# E2E 테스트만 실행
npm run test:e2e

# 코드 커버리지와 함께 실행
npm run test:coverage

# 파일 변경 감시 모드
npm run test:watch
```

### 고급 실행 옵션

```bash
# 상세 리포트와 함께 실행
node scripts/test-runner.js all

# 특정 테스트 타입만 실행
node scripts/test-runner.js unit
node scripts/test-runner.js integration
node scripts/test-runner.js e2e

# 파일 변경 감시
node scripts/test-watch.js watch
```

## 📝 테스트 작성 가이드

### 파일 명명 규칙

- 단위 테스트: `*.test.tsx` 또는 `*.test.ts`
- 통합 테스트: `*.integration.test.tsx`
- E2E 테스트: `*.e2e.test.tsx`

### 기본 테스트 구조

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@frontend/shared/utils/testUtils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('올바르게 렌더링된다', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('사용자 상호작용에 올바르게 반응한다', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

### 테스트 유틸리티 사용

```typescript
import {
  render,
  createMockUser,
  createMockWorkoutPlan,
  mockApiResponses,
} from '@frontend/shared/utils/testUtils'

// 사용자 데이터 생성
const mockUser = createMockUser({ email: 'test@example.com' })

// API 응답 모킹
const mockResponse = mockApiResponses.success({ data: 'test' })
```

## 🧩 테스트 유형별 가이드

### 단위 테스트

개별 컴포넌트나 함수의 동작을 테스트합니다.

```typescript
// 컴포넌트 테스트
describe('Button Component', () => {
  it('클릭 이벤트를 올바르게 처리한다', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

// 함수 테스트
describe('validation utils', () => {
  it('이메일 형식을 올바르게 검증한다', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
  })
})
```

### 통합 테스트

여러 컴포넌트 간의 상호작용을 테스트합니다.

```typescript
describe('Login Flow Integration', () => {
  it('로그인 후 대시보드로 리다이렉트된다', async () => {
    render(<App />)

    // 로그인 폼 작성
    await user.type(screen.getByPlaceholderText('이메일'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('비밀번호'), 'password123')

    // 로그인 버튼 클릭
    await user.click(screen.getByRole('button', { name: '로그인' }))

    // 대시보드로 리다이렉트 확인
    await waitFor(() => {
      expect(screen.getByText('대시보드')).toBeInTheDocument()
    })
  })
})
```

### E2E 테스트

전체 사용자 플로우를 테스트합니다.

```typescript
describe('Workout Flow E2E', () => {
  it('사용자가 운동 계획을 생성하고 세션을 완료하는 전체 플로우', async () => {
    render(<App />)

    // 1. 운동 계획 생성
    await user.click(screen.getByText('운동 계획'))
    await user.click(screen.getByText('새 계획 만들기'))

    // 2. 계획 정보 입력
    await user.type(screen.getByPlaceholderText('계획 이름'), '새로운 계획')

    // 3. 계획 저장
    await user.click(screen.getByText('저장'))

    // 4. 운동 세션 시작
    await user.click(screen.getByText('운동 세션'))
    await user.click(screen.getByText('새 세션 시작'))

    // 5. 세션 완료
    await user.click(screen.getByText('완료'))

    // 6. 결과 확인
    expect(screen.getByText('운동이 완료되었습니다!')).toBeInTheDocument()
  })
})
```

## 📊 코드 커버리지

### 커버리지 실행

```bash
# 커버리지 리포트 생성
npm run test:coverage

# 커버리지 임계값 확인
npx vitest run --coverage --coverage.thresholds.global.branches=70
```

### 커버리지 임계값

현재 설정된 커버리지 임계값:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### 커버리지 리포트

커버리지 리포트는 다음 위치에서 확인할 수 있습니다:

- HTML 리포트: `coverage/index.html`
- JSON 리포트: `coverage/coverage-final.json`
- LCOV 리포트: `coverage/lcov.info`

## 🔄 CI/CD 통합

### GitHub Actions

`.github/workflows/test.yml` 파일 예시:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Pre-commit Hooks

Git hooks를 통한 자동 테스트:

```bash
# Pre-commit hook 설정
node scripts/test-setup.js setup
```

## 🐛 문제 해결

### 일반적인 문제

#### 1. 테스트가 실행되지 않음

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# Vitest 캐시 클리어
npx vitest --clearCache
```

#### 2. 모킹 관련 오류

```typescript
// 올바른 모킹 방법
vi.mock('@frontend/shared/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))
```

#### 3. 비동기 테스트 오류

```typescript
// 올바른 비동기 테스트
it('비동기 작업을 테스트한다', async () => {
  render(<AsyncComponent />)

  await waitFor(() => {
    expect(screen.getByText('로딩 완료')).toBeInTheDocument()
  })
})
```

### 디버깅 팁

1. **테스트 실행 시 상세 로그 확인**:

   ```bash
   npx vitest run --reporter=verbose
   ```

2. **특정 테스트만 실행**:

   ```bash
   npx vitest run --grep "특정 테스트 이름"
   ```

3. **테스트 파일 디버깅**:
   ```typescript
   it('디버깅 테스트', () => {
     console.log('디버깅 정보')
     debug() // React Testing Library의 debug 함수
   })
   ```

## 📚 추가 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [React Testing Library 가이드](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM 매처](https://github.com/testing-library/jest-dom)
- [User Event 시뮬레이션](https://testing-library.com/docs/user-event/intro/)

## 🤝 기여하기

테스트 코드 작성 시 다음 사항을 준수해주세요:

1. **명확한 테스트 이름**: 테스트가 무엇을 하는지 명확하게 표현
2. **AAA 패턴**: Arrange, Act, Assert 구조 사용
3. **독립적인 테스트**: 각 테스트는 독립적으로 실행 가능해야 함
4. **적절한 모킹**: 외부 의존성은 적절히 모킹
5. **커버리지 유지**: 새로운 코드에 대한 테스트 작성

---

**문의사항이 있으시면 개발팀에 연락해주세요!** 🚀
