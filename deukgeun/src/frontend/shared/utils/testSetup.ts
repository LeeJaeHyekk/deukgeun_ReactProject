import "@testing-library/jest-dom"

// Frontend 전용 테스트 설정 - jsdom 환경에서만 실행
if (typeof window !== "undefined") {
  // MSW 서버 설정 (임시로 비활성화)
  // beforeAll(() => {
  //   // MSW 서버 시작
  //   server.listen({ onUnhandledRequest: 'error' })
  // })

  // afterEach(() => {
  //   // 각 테스트 후 MSW 핸들러 리셋
  //   server.resetHandlers()
  // })

  // afterAll(() => {
  //   // 모든 테스트 후 MSW 서버 종료
  //   server.close()
  // })

  // 전역 Mock 설정
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // localStorage Mock
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  })

  // sessionStorage Mock
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
  })

  // fetch Mock
  global.fetch = jest.fn()

  // URL.createObjectURL Mock
  global.URL.createObjectURL = jest.fn(() => "mocked-url")

  // URL.revokeObjectURL Mock
  global.URL.revokeObjectURL = jest.fn()

  // matchMedia Mock
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // scrollTo Mock
  window.scrollTo = jest.fn()

  // getComputedStyle Mock
  Object.defineProperty(window, "getComputedStyle", {
    value: () => ({
      getPropertyValue: jest.fn(),
    }),
  })
}

// console.error 무시 (선택적)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// 프론트엔드 테스트 환경 변수 설정
if (typeof window !== "undefined") {
  // Vite 환경에서는 import.meta.env를 사용하지만, 테스트 환경에서는 process.env를 사용
  // 이 파일은 테스트 전용 설정이므로 그대로 유지
  process.env.NODE_ENV = "test"
  process.env.REACT_APP_API_URL = "http://localhost:5000"
  process.env.REACT_APP_ENVIRONMENT = "test"
}

// 타임아웃 설정
jest.setTimeout(10000)

// 테스트 실패 시 스택 트레이스 개선
Error.stackTraceLimit = Infinity
