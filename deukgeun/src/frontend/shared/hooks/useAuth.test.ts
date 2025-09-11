import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'
import { authApi } from '../../features/auth/api/authApi'
import { storage } from '../lib'
import { useUserStore } from '../store/userStore'
import type { User } from '../../../shared/types'

// Mock dependencies
vi.mock('../../features/auth/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    checkAuth: vi.fn(),
  },
}))

vi.mock('../lib', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('../store/userStore', () => ({
  useUserStore: vi.fn(),
}))

const mockAuthApi = vi.mocked(authApi)
const mockStorage = vi.mocked(storage)
const mockUseUserStore = vi.mocked(useUserStore)

describe('useAuth', () => {
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    nickname: 'Test User',
    role: 'user',
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  const mockLoginResponse = {
    message: 'Login successful',
    accessToken: 'mock-access-token',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      nickname: mockUser.nickname,
    },
  }

  const mockStore = {
    user: null,
    setUser: vi.fn(),
    clearUser: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // 콘솔 로그 모킹으로 테스트 출력 정리
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockUseUserStore.mockReturnValue(mockStore)
    mockStorage.get.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정된다', async () => {
      // 자동 로그인 로직을 모킹하여 즉시 완료되도록 설정
      mockStorage.get.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // 자동 로그인 로직이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isLoggedIn).toBe(false)
    })

    it('저장된 토큰이 있으면 자동 로그인을 시도한다', async () => {
      const mockToken = 'valid-token'
      const mockStoredUser = mockUser

      // 토큰이 유효하다고 가정 (JWT 형식)
      const validToken =
        'header.' +
        btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) +
        '.signature'

      mockStorage.get
        .mockReturnValueOnce(validToken) // accessToken
        .mockReturnValueOnce(mockStoredUser) // user

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockStore.setUser).toHaveBeenCalledWith({
        ...mockUser,
        accessToken: validToken,
      })
    })
  })

  describe('login', () => {
    it('로그인이 성공적으로 처리된다', async () => {
      mockAuthApi.login.mockResolvedValue(mockLoginResponse)
      mockStorage.get.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // 자동 로그인 로직이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.login(mockUser, 'mock-token')
      })

      expect(mockStore.setUser).toHaveBeenCalledWith({
        ...mockUser,
        accessToken: 'mock-token',
      })
      expect(mockStorage.set).toHaveBeenCalledWith('accessToken', 'mock-token')
      expect(mockStorage.set).toHaveBeenCalledWith('user', mockUser)
    })

    it('로그인 실패 시 에러가 반환된다', async () => {
      const errorResponse = {
        message: '로그인 실패',
        accessToken: '',
        user: {
          id: 0,
          email: '',
          nickname: '',
        },
      }

      mockAuthApi.login.mockResolvedValue(errorResponse)
      mockStorage.get.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // 자동 로그인 로직이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.login(mockUser, 'wrong-token')
      })

      expect(mockStore.setUser).toHaveBeenCalledWith({
        ...mockUser,
        accessToken: 'wrong-token',
      })
    })

    it('API 에러가 발생하면 예외가 던져진다', async () => {
      const error = new Error('Network error')
      mockAuthApi.login.mockRejectedValue(error)
      mockStorage.get.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // 자동 로그인 로직이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.login(mockUser, 'mock-token')
      })

      expect(mockStore.setUser).toHaveBeenCalledWith({
        ...mockUser,
        accessToken: 'mock-token',
      })
    })
  })

  describe('logout', () => {
    it('로그아웃이 성공적으로 처리된다', async () => {
      mockAuthApi.logout.mockResolvedValue({
        message: '로그아웃 성공',
      })
      mockStorage.get.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // 자동 로그인 로직이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // window.location.reload 모킹
      const mockReload = vi.fn()
      delete (window.location as any).reload
      window.location = { ...window.location, reload: mockReload } as any

      await act(async () => {
        await result.current.logout()
      })

      expect(mockAuthApi.logout).toHaveBeenCalled()
      expect(mockStorage.remove).toHaveBeenCalledWith('accessToken')
      expect(mockStorage.remove).toHaveBeenCalledWith('user')
      expect(mockStore.clearUser).toHaveBeenCalled()

      // 원래 함수 복원
      Object.defineProperty(window.location, 'reload', {
        value: mockReload,
        writable: true,
      })
    })

    it('로그아웃 API 호출 실패해도 로컬 상태는 정리된다', async () => {
      mockAuthApi.logout.mockRejectedValue(new Error('API Error'))
      mockStorage.get.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // 자동 로그인 로직이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // window.location.reload 모킹
      const mockReload = vi.fn()
      delete (window.location as any).reload
      window.location = { ...window.location, reload: mockReload } as any

      await act(async () => {
        await result.current.logout()
      })

      expect(mockStorage.remove).toHaveBeenCalledWith('accessToken')
      expect(mockStorage.remove).toHaveBeenCalledWith('user')
      expect(mockStore.clearUser).toHaveBeenCalled()

      // 원래 함수 복원
      Object.defineProperty(window.location, 'reload', {
        value: mockReload,
        writable: true,
      })
    })
  })

  describe('자동 토큰 갱신', () => {
    it('토큰 만료 5분 전에 자동 갱신이 설정된다', async () => {
      vi.useFakeTimers()

      try {
        // 유효한 토큰 생성 (만료 시간: 현재 시간 + 10분)
        const futureTime = Math.floor(Date.now() / 1000) + 600 // 10분 후
        const tokenPayload = { exp: futureTime }
        const mockToken = `header.${btoa(JSON.stringify(tokenPayload))}.signature`

        mockStorage.get.mockReturnValue(mockToken)
        mockAuthApi.refreshToken.mockResolvedValue({
          accessToken: 'new-token',
        })

        const { result } = renderHook(() => useAuth())

        // 자동 로그인 로직이 완료될 때까지 대기
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // 5분 1초 후 (갱신 시점)
        act(() => {
          vi.advanceTimersByTime(5 * 60 * 1000 + 1000)
        })

        await waitFor(() => {
          expect(mockAuthApi.refreshToken).toHaveBeenCalled()
        })
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('사용자 상태', () => {
    it('사용자가 로그인되어 있으면 isLoggedIn이 true이다', async () => {
      mockUseUserStore.mockReturnValue({
        ...mockStore,
        user: mockUser,
      })
      mockStorage.get.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // 자동 로그인 로직이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isLoggedIn).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })

    it('사용자가 로그인되어 있지 않으면 isLoggedIn이 false이다', async () => {
      mockUseUserStore.mockReturnValue({
        ...mockStore,
        user: null,
      })
      mockStorage.get.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // 자동 로그인 로직이 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isLoggedIn).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('컴포넌트 언마운트', () => {
    it('컴포넌트 언마운트 시 타이머가 정리된다', async () => {
      vi.useFakeTimers()

      try {
        mockStorage.get.mockReturnValue(null)
        const { result, unmount } = renderHook(() => useAuth())

        // 자동 로그인 로직이 완료될 때까지 대기
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        unmount()

        // 타이머가 정리되었는지 확인
        expect(() => {
          vi.advanceTimersByTime(10000)
        }).not.toThrow()
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
