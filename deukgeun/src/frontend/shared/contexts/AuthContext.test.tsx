import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from './AuthContext'
import { useAuth } from '@frontend/shared/hooks/useAuth'
import { createMockUser, mockToken } from '@frontend/shared/utils/testUtils'

// Mock useAuth hook
vi.mock('@frontend/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('AuthContext', () => {
  const mockUser = createMockUser()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('AuthProvider', () => {
    it('인증되지 않은 상태로 초기화된다', () => {
      mockUseAuth.mockReturnValue({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
        checkAuthStatus: vi.fn().mockResolvedValue(false),
      })

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.isLoading).toBe(false)
    })

    it('인증된 상태로 초기화된다', () => {
      mockUseAuth.mockReturnValue({
        isLoggedIn: true,
        user: mockUser,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
        checkAuthStatus: vi.fn().mockResolvedValue(true),
      })

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
    })

    it('로딩 상태를 올바르게 전달한다', () => {
      mockUseAuth.mockReturnValue({
        isLoggedIn: false,
        user: null,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
        checkAuthStatus: vi.fn().mockResolvedValue(false),
      })

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('useAuthContext', () => {
    it('AuthProvider 외부에서 사용 시 에러를 발생시킨다', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuthContext())
      }).toThrow('useAuthContext must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })

    it('login 함수를 올바르게 전달한다', async () => {
      const mockLogin = vi.fn()
      mockUseAuth.mockReturnValue({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        login: mockLogin,
        logout: vi.fn(),
        updateUser: vi.fn(),
        checkAuthStatus: vi.fn().mockResolvedValue(false),
      })

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      await act(async () => {
        result.current.login(mockUser, mockToken)
      })

      expect(mockLogin).toHaveBeenCalledWith(mockUser, mockToken)
    })

    it('logout 함수를 올바르게 전달한다', async () => {
      const mockLogout = vi.fn().mockResolvedValue(undefined)
      mockUseAuth.mockReturnValue({
        isLoggedIn: true,
        user: mockUser,
        isLoading: false,
        login: vi.fn(),
        logout: mockLogout,
        updateUser: vi.fn(),
        checkAuthStatus: vi.fn().mockResolvedValue(true),
      })

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(mockLogout).toHaveBeenCalled()
    })

    it('updateUser 함수를 올바르게 전달한다', () => {
      const mockUpdateUser = vi.fn()
      mockUseAuth.mockReturnValue({
        isLoggedIn: true,
        user: mockUser,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: mockUpdateUser,
        checkAuthStatus: vi.fn().mockResolvedValue(true),
      })

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      const updates = { nickname: 'Updated Nickname' }
      act(() => {
        result.current.updateUser(updates)
      })

      expect(mockUpdateUser).toHaveBeenCalledWith(updates)
    })

    it('checkAuthStatus 함수를 올바르게 전달한다', async () => {
      const mockCheckAuthStatus = vi.fn().mockResolvedValue(true)
      mockUseAuth.mockReturnValue({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
        checkAuthStatus: mockCheckAuthStatus,
      })

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      const authStatus = await act(async () => {
        return await result.current.checkAuthStatus()
      })

      expect(mockCheckAuthStatus).toHaveBeenCalled()
      expect(authStatus).toBe(true)
    })
  })

  describe('Context 최적화', () => {
    it('동일한 값일 때 context 재생성을 방지한다', () => {
      const mockAuthValue = {
        isLoggedIn: true,
        user: mockUser,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
        checkAuthStatus: vi.fn().mockResolvedValue(true),
      }

      mockUseAuth.mockReturnValue(mockAuthValue)

      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      const firstResult = result.current

      // 동일한 값으로 다시 렌더링
      rerender()

      // useMemo가 작동하여 동일한 객체 참조를 유지
      expect(result.current).toBe(firstResult)
    })

    it('사용자 정보가 변경될 때 context가 업데이트된다', () => {
      const mockLogin = vi.fn()
      const mockLogout = vi.fn()
      const mockUpdateUser = vi.fn()
      const mockCheckAuthStatus = vi.fn().mockResolvedValue(true)

      // 첫 번째 렌더링 - 인증되지 않은 상태
      mockUseAuth.mockReturnValue({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
        updateUser: mockUpdateUser,
        checkAuthStatus: mockCheckAuthStatus,
      })

      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)

      // 두 번째 렌더링 - 인증된 상태
      mockUseAuth.mockReturnValue({
        isLoggedIn: true,
        user: mockUser,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
        updateUser: mockUpdateUser,
        checkAuthStatus: mockCheckAuthStatus,
      })

      rerender()

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  describe('에러 처리', () => {
    it('useAuth에서 에러가 발생해도 context가 안정적으로 작동한다', () => {
      // useAuth에서 에러 발생 시뮬레이션
      mockUseAuth.mockImplementation(() => {
        throw new Error('useAuth error')
      })

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuthContext(), {
          wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        })
      }).toThrow('useAuth error')

      consoleSpy.mockRestore()
    })
  })
})
