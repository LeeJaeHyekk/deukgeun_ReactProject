// 통합 테스트 환경 설정
import '@testing-library/jest-dom'

// 환경 변수 설정
process.env.NODE_ENV = 'test'

// 전역 모킹 설정
global.console = {
  ...console,
  // 테스트 중 불필요한 로그 숨김
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// MSW 설정 (API 모킹)
if (typeof window !== 'undefined') {
  const { server } = require('./shared/mocks/server')
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
}

// 전역 테스트 유틸리티
global.testUtils = {
  // 테스트 데이터 생성 헬퍼
  createMockUser: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    nickname: 'TestUser',
    birthDate: new Date('1990-01-01'),
    gender: 'male',
    phoneNumber: '010-1234-5678',
    level: 1,
    exp: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
  
  // API 응답 모킹 헬퍼
  createMockApiResponse: (data: any, success = true) => ({
    success,
    data,
    message: success ? 'Success' : 'Error',
  }),
  
  // 에러 응답 모킹 헬퍼
  createMockErrorResponse: (message = 'Error occurred') => ({
    success: false,
    data: null,
    message,
  }),
}

// 타입 정의
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWithUser: (expectedUser: any) => R
      toHaveBeenCalledWithToken: (expectedToken: string) => R
    }
  }
  
  var testUtils: {
    createMockUser: (overrides?: any) => any
    createMockApiResponse: (data: any, success?: boolean) => any
    createMockErrorResponse: (message?: string) => any
  }
}

// 커스텀 매처 추가
expect.extend({
  toHaveBeenCalledWithUser(received, expectedUser) {
    const pass = received.mock.calls.some((call: any[]) =>
      call.some((arg: any) => 
        arg && typeof arg === 'object' && arg.id === expectedUser.id
      )
    )
    
    return {
      pass,
      message: () =>
        `expected ${received.getMockName()} to have been called with user ${JSON.stringify(expectedUser)}`,
    }
  },
  
  toHaveBeenCalledWithToken(received, expectedToken) {
    const pass = received.mock.calls.some((call: any[]) =>
      call.some((arg: any) => arg === expectedToken)
    )
    
    return {
      pass,
      message: () =>
        `expected ${received.getMockName()} to have been called with token "${expectedToken}"`,
    }
  },
})
