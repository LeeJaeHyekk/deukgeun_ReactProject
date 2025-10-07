
// 테스트 헬퍼 함수들
export * from '@frontend/shared/utils/testUtils'

// 추가 테스트 유틸리티
export const createMockStore = (initialState = {}) => ({
  getState: () => initialState,
  dispatch: jest.fn(),
  subscribe: jest.fn(),
})

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const mockLocalStorage = () => {
  const store = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value }),
    removeItem: jest.fn((key) => { delete store[key] }),
    clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]) }),
  }
}
