import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { createMockUser } from '../../../utils/testUtils';
import { AuthContext } from '../../contexts/AuthContext';

// Mock API 함수들
jest.mock('../../../api/authApi', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
}));

describe('useAuth', () => {
  const mockUser = createMockUser();
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();
  const mockRegister = jest.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider
      value={{
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
        register: mockRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증 상태를 올바르게 반환한다', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('로그인 함수를 호출할 수 있다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    await act(async () => {
      await result.current.login(loginData);
    });

    expect(mockLogin).toHaveBeenCalledWith(loginData);
  });

  it('로그아웃 함수를 호출할 수 있다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogout).toHaveBeenCalled();
  });

  it('회원가입 함수를 호출할 수 있다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const registerData = {
      email: 'new@example.com',
      password: 'password123',
      nickname: '새 사용자',
    };

    await act(async () => {
      await result.current.register(registerData);
    });

    expect(mockRegister).toHaveBeenCalledWith(registerData);
  });

  it('인증되지 않은 상태를 올바르게 처리한다', () => {
    const unauthenticatedWrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          isLoading: false,
          login: mockLogin,
          logout: mockLogout,
          register: mockRegister,
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper: unauthenticatedWrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('로딩 상태를 올바르게 처리한다', () => {
    const loadingWrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          isLoading: true,
          login: mockLogin,
          logout: mockLogout,
          register: mockRegister,
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper: loadingWrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('AuthContext 없이 사용할 때 에러를 발생시킨다', () => {
    // AuthContext 없이 렌더링
    const { result } = renderHook(() => useAuth());

    expect(() => result.current.user).toThrow();
    expect(() => result.current.isAuthenticated).toThrow();
  });
});
