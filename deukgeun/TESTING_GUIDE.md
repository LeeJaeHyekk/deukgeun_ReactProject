# 테스트 가이드

이 문서는 프로젝트의 Jest 테스트 환경과 테스트 작성 방법에 대한 가이드입니다.

## 📋 목차

- [테스트 환경 설정](#테스트-환경-설정)
- [테스트 실행](#테스트-실행)
- [테스트 구조](#테스트-구조)
- [테스트 작성 가이드](#테스트-작성-가이드)
- [Mock 데이터](#mock-데이터)
- [테스트 커버리지](#테스트-커버리지)
- [CI/CD 통합](#cicd-통합)

## 🛠 테스트 환경 설정

### 필수 의존성

```bash
# 프론트엔드 테스트 의존성
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom ts-jest

# 백엔드 테스트 의존성
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### 환경 변수 설정

```bash
# .env.test 파일 생성
NODE_ENV=test
DB_DATABASE=deukgeun_test
JWT_SECRET=test-jwt-secret
JWT_REFRESH_SECRET=test-jwt-refresh-secret
```

## 🚀 테스트 실행

### 전체 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage

# 테스트 감시 모드
npm run test:watch
```

### 특정 테스트 실행

```bash
# 프론트엔드 테스트만
npm run test:frontend

# 백엔드 테스트만
npm run test:backend

# 단위 테스트만
npm run test:unit

# 통합 테스트만
npm run test:integration

# E2E 테스트만
npm run test:e2e
```

### CI/CD용 테스트

```bash
# CI/CD 환경용 테스트 (커버리지 포함)
npm run test:ci
```

## 📁 테스트 구조

```
src/
├── frontend/
│   ├── features/
│   │   └── auth/
│   │       └── __tests__/
│   │           ├── LoginForm.test.tsx          # 단위 테스트
│   │           └── LoginForm.integration.test.tsx  # 통합 테스트
│   └── shared/
│       ├── components/
│       │   └── __tests__/
│       │       └── LevelDisplay.test.tsx
│       ├── hooks/
│       │   └── __tests__/
│       │       └── useAuth.test.ts
│       └── utils/
│           ├── testUtils.ts
│           ├── mockData.ts
│           └── mocks/
│               ├── server.ts
│               └── handlers.ts
└── backend/
    ├── __tests__/
    │   ├── setup.ts
    │   ├── controllers/
    │   │   └── authController.test.ts
    │   ├── services/
    │   │   └── levelService.test.ts
    │   └── integration/
    │       └── auth.integration.test.ts
    └── jest.config.js
```

## ✍️ 테스트 작성 가이드

### 테스트 파일 명명 규칙

- **단위 테스트**: `*.test.ts` 또는 `*.test.tsx`
- **통합 테스트**: `*.integration.test.ts` 또는 `*.integration.test.tsx`
- **E2E 테스트**: `*.e2e.test.ts` 또는 `*.e2e.test.tsx`

### 테스트 구조

```typescript
describe('ComponentName', () => {
  // 테스트 설정
  beforeEach(() => {
    // 각 테스트 전 실행
  })

  afterEach(() => {
    // 각 테스트 후 실행
  })

  it('should do something specific', () => {
    // 테스트 로직
    expect(result).toBe(expected)
  })
})
```

### 프론트엔드 컴포넌트 테스트

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<ComponentName />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### 백엔드 API 테스트

```typescript
import request from 'supertest'
import { createApp } from '../app'

describe('API Endpoint', () => {
  let app: Express

  beforeAll(() => {
    app = createApp()
  })

  it('returns correct response', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data).toBeDefined()
  })
})
```

### 서비스 로직 테스트

```typescript
import { serviceFunction } from '../services/service'

describe('ServiceFunction', () => {
  it('processes data correctly', () => {
    const input = { test: 'data' }
    const result = serviceFunction(input)
    
    expect(result).toEqual(expectedOutput)
  })
})
```

## 🎭 Mock 데이터

### Mock 데이터 생성

```typescript
// mockData.ts
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  nickname: '테스트 사용자',
  ...overrides,
})
```

### API Mock 설정

```typescript
// handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      data: { users: mockUsers }
    })
  })
]
```

### 컴포넌트 Mock

```typescript
// Mock 컴포넌트
jest.mock('../Component', () => ({
  Component: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mocked-component">{children}</div>
  )
}))
```

## 📊 테스트 커버리지

### 커버리지 목표

- **전체 커버리지**: 70% 이상
- **라인 커버리지**: 70% 이상
- **브랜치 커버리지**: 70% 이상
- **함수 커버리지**: 70% 이상

### 커버리지 확인

```bash
# 커버리지 리포트 생성
npm run test:coverage

# HTML 리포트 확인
open coverage/lcov-report/index.html
```

### 커버리지 제외 설정

```javascript
// jest.config.js
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/*.stories.{ts,tsx}',
  '!src/**/index.{ts,tsx}',
]
```

## 🔄 CI/CD 통합

### GitHub Actions 설정

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

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
      run: npm run test:ci
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

### 테스트 자동화

```bash
# pre-commit 훅 설정
npm install --save-dev husky lint-staged

# package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "npm test -- --findRelatedTests"
    ]
  }
}
```

## 🐛 문제 해결

### 일반적인 문제들

1. **테스트 환경 설정 오류**
   ```bash
   # Jest 캐시 클리어
   npm run test -- --clearCache
   ```

2. **Mock 모듈 오류**
   ```typescript
   // jest.mock을 파일 최상단에 배치
   jest.mock('../module')
   ```

3. **비동기 테스트 오류**
   ```typescript
   // async/await 사용
   it('async test', async () => {
     const result = await asyncFunction()
     expect(result).toBe(expected)
   })
   ```

### 디버깅 팁

- `console.log` 대신 `console.debug` 사용
- `--verbose` 플래그로 상세 로그 확인
- `--detectOpenHandles` 플래그로 열린 핸들 확인

## 📚 추가 리소스

- [Jest 공식 문서](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW (Mock Service Worker)](https://mswjs.io/docs/)
- [Supertest](https://github.com/visionmedia/supertest)

## 🤝 기여 가이드

새로운 테스트를 작성할 때 다음 사항을 확인하세요:

1. **테스트 파일 위치**: 적절한 `__tests__` 디렉토리에 배치
2. **명명 규칙**: 파일명과 테스트 설명이 명확해야 함
3. **커버리지**: 새로운 기능에 대한 테스트 커버리지 확보
4. **독립성**: 각 테스트가 독립적으로 실행 가능해야 함
5. **가독성**: 테스트 코드가 이해하기 쉬워야 함

---

이 가이드를 따라 테스트를 작성하면 코드의 품질과 안정성을 크게 향상시킬 수 있습니다.
