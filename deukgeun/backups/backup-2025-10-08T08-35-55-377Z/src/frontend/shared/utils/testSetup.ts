import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'

// Mock 환경 변수
Object.defineProperty(import.meta, 'env', {
  value: {
    DEV: true,
    PROD: false,
    VITE_BACKEND_URL: 'http://localhost:5000',
    VITE_RECAPTCHA_SITE_KEY: 'test-recaptcha-key',
    VITE_LOCATION_JAVASCRIPT_MAP_API_KEY: 'test-kakao-key',
    VITE_LOCATION_REST_MAP_API_KEY: 'test-kakao-rest-key',
    VITE_GYM_API_KEY: 'test-gym-key',
  },
  writable: true,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock fetch
global.fetch = vi.fn()

// Mock window.location.reload (will be handled in individual tests)

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()

  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()

  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()

  // Reset fetch mock
  vi.mocked(fetch).mockClear()
})

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Global test utilities
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  nickname: 'Test User',
  role: 'user' as const,
  isActive: true,
  isEmailVerified: false,
  isPhoneVerified: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockToken = 'mock-jwt-token'

export const mockApiResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
})

export const mockApiError = (message: string, status = 500) => {
  const error = new Error(message)
  ;(error as any).response = {
    data: { message },
    status,
    statusText: 'Internal Server Error',
    headers: {},
    config: {},
  }
  return error
}
