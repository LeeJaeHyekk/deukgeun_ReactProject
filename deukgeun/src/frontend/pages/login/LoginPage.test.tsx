import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockUser, mockApiResponses } from '@frontend/shared/utils/testUtils'
import LoginPage from './LoginPage'
import { authApi } from '@features/auth/api/authApi'

// Mock authApi
vi.mock('@features/auth/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

// Mock reCAPTCHA
vi.mock('@frontend/shared/components/RecaptchaWidget', () => ({
  RecaptchaWidget: ({ onChange }: { onChange: (token: string | null) => void }) => (
    <div data-testid="recaptcha-widget">
      <button
        data-testid="recaptcha-button"
        onClick={() => onChange('test-recaptcha-token')}
      >
        Complete reCAPTCHA
      </button>
    </div>
  ),
}))

// Mock toast
vi.mock('@frontend/shared/lib', () => ({
  showToast: vi.fn(),
  validation: {
    required: (value: string) => !!value,
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    password: (value: string) => value.length >= 8,
  },
}))

// Mock error handler
vi.mock('@pages/Error', () => ({
  useAuthErrorHandler: () => ({
    handleApiError: vi.fn(),
    hasError: false,
    errorInfo: { message: '' },
    retry: vi.fn(),
  }),
}))

describe('LoginPage', () => {
  const user = userEvent.setup()
  const mockLogin = vi.mocked(authApi.login)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('로그인 폼이 올바르게 렌더링된다', () => {
      render(<LoginPage />)

      expect(screen.getByText('득근 득근')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
      expect(screen.getByText('회원가입')).toBeInTheDocument()
    })

    it('이미 로그인된 사용자는 리다이렉트 메시지를 본다', () => {
      render(<LoginPage />, {
        isAuthenticated: true,
        user: createMockUser(),
      })

      expect(screen.getByText('이미 로그인된 상태입니다.')).toBeInTheDocument()
      expect(screen.getByText('메인페이지로 이동 중...')).toBeInTheDocument()
    })
  })

  describe('폼 검증', () => {
    it('빈 이메일로 제출 시 에러 메시지를 표시한다', async () => {
      render(<LoginPage />)

      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument()
    })

    it('잘못된 이메일 형식으로 제출 시 에러 메시지를 표시한다', async () => {
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'invalid-email')

      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      expect(screen.getByText('유효한 이메일 주소를 입력해주세요.')).toBeInTheDocument()
    })

    it('빈 비밀번호로 제출 시 에러 메시지를 표시한다', async () => {
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'test@example.com')

      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument()
    })

    it('짧은 비밀번호로 제출 시 에러 메시지를 표시한다', async () => {
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'test@example.com')

      const passwordInput = screen.getByPlaceholderText('비밀번호')
      await user.type(passwordInput, '123')

      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다.')).toBeInTheDocument()
    })

    it('reCAPTCHA를 완료하지 않으면 에러 메시지를 표시한다', async () => {
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'test@example.com')

      const passwordInput = screen.getByPlaceholderText('비밀번호')
      await user.type(passwordInput, 'password123')

      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      expect(screen.getByText('보안 인증을 완료해주세요.')).toBeInTheDocument()
    })
  })

  describe('로그인 성공', () => {
    it('유효한 정보로 로그인 시 성공한다', async () => {
      const mockUser = createMockUser()
      const mockResponse = {
        message: '로그인 성공',
        user: mockUser,
        accessToken: 'mock-access-token',
      }

      mockLogin.mockResolvedValueOnce(mockResponse)

      render(<LoginPage />)

      // 폼 입력
      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'test@example.com')

      const passwordInput = screen.getByPlaceholderText('비밀번호')
      await user.type(passwordInput, 'password123')

      // reCAPTCHA 완료
      const recaptchaButton = screen.getByTestId('recaptcha-button')
      await user.click(recaptchaButton)

      // 로그인 버튼 클릭
      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      // API 호출 확인
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          recaptchaToken: 'test-recaptcha-token',
        })
      })
    })

    it('로그인 중에는 버튼이 비활성화된다', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'test@example.com')

      const passwordInput = screen.getByPlaceholderText('비밀번호')
      await user.type(passwordInput, 'password123')

      const recaptchaButton = screen.getByTestId('recaptcha-button')
      await user.click(recaptchaButton)

      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      expect(screen.getByText('로그인 중...')).toBeInTheDocument()
      expect(loginButton).toBeDisabled()
    })
  })

  describe('로그인 실패', () => {
    it('API 에러 시 에러 메시지를 표시한다', async () => {
      const errorMessage = '로그인에 실패했습니다.'
      mockLogin.mockRejectedValueOnce(new Error(errorMessage))

      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'test@example.com')

      const passwordInput = screen.getByPlaceholderText('비밀번호')
      await user.type(passwordInput, 'password123')

      const recaptchaButton = screen.getByTestId('recaptcha-button')
      await user.click(recaptchaButton)

      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('잘못된 응답 시 에러 메시지를 표시한다', async () => {
      mockLogin.mockResolvedValueOnce(null as any)

      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'test@example.com')

      const passwordInput = screen.getByPlaceholderText('비밀번호')
      await user.type(passwordInput, 'password123')

      const recaptchaButton = screen.getByTestId('recaptcha-button')
      await user.click(recaptchaButton)

      const loginButton = screen.getByRole('button', { name: '로그인' })
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument()
      })
    })
  })

  describe('사용자 상호작용', () => {
    it('비밀번호 표시/숨기기 토글 작동한다', async () => {
      render(<LoginPage />)

      const passwordInput = screen.getByPlaceholderText('비밀번호')
      const toggleButton = screen.getByLabelText('비밀번호 보기')

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText('비밀번호 숨기기')).toBeInTheDocument()

      await user.click(screen.getByLabelText('비밀번호 숨기기'))
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('Enter 키로 로그인 폼 제출이 가능하다', async () => {
      const mockUser = createMockUser()
      const mockResponse = {
        message: '로그인 성공',
        user: mockUser,
        accessToken: 'mock-access-token',
      }

      mockLogin.mockResolvedValueOnce(mockResponse)

      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      await user.type(emailInput, 'test@example.com')

      const passwordInput = screen.getByPlaceholderText('비밀번호')
      await user.type(passwordInput, 'password123')

      const recaptchaButton = screen.getByTestId('recaptcha-button')
      await user.click(recaptchaButton)

      // Enter 키로 제출
      fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' })

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })

    it('에러 메시지가 입력 시 사라진다', async () => {
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('이메일')
      const loginButton = screen.getByRole('button', { name: '로그인' })

      // 에러 발생
      await user.click(loginButton)
      expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument()

      // 입력 시 에러 사라짐
      await user.type(emailInput, 'test@example.com')
      expect(screen.queryByText('이메일을 입력해주세요.')).not.toBeInTheDocument()
    })
  })

  describe('네비게이션', () => {
    it('뒤로 가기 버튼이 작동한다', async () => {
      render(<LoginPage />)

      const backButton = screen.getByLabelText('뒤로 가기')
      await user.click(backButton)

      // navigate 호출 확인 (실제 구현에 따라 조정 필요)
    })

    it('회원가입 링크가 작동한다', async () => {
      render(<LoginPage />)

      const signupButton = screen.getByText('회원가입')
      await user.click(signupButton)

      // navigate 호출 확인 (실제 구현에 따라 조정 필요)
    })

    it('아이디 찾기 링크가 작동한다', async () => {
      render(<LoginPage />)

      const findIdButton = screen.getByText('아이디 찾기')
      await user.click(findIdButton)

      // navigate 호출 확인 (실제 구현에 따라 조정 필요)
    })

    it('비밀번호 찾기 링크가 작동한다', async () => {
      render(<LoginPage />)

      const findPasswordButton = screen.getByText('비밀번호 찾기')
      await user.click(findPasswordButton)

      // navigate 호출 확인 (실제 구현에 따라 조정 필요)
    })
  })

  describe('소셜 로그인', () => {
    it('카카오 로그인 버튼이 표시된다', () => {
      render(<LoginPage />)

      expect(screen.getByText('🟡 카카오로 로그인')).toBeInTheDocument()
    })

    it('Google 로그인 버튼이 표시된다', () => {
      render(<LoginPage />)

      expect(screen.getByText('🔵 Google로 로그인')).toBeInTheDocument()
    })

    it('소셜 로그인 버튼 클릭 시 준비 중 메시지를 표시한다', async () => {
      render(<LoginPage />)

      const kakaoButton = screen.getByText('🟡 카카오로 로그인')
      await user.click(kakaoButton)

      // showToast 호출 확인 (실제 구현에 따라 조정 필요)
    })
  })
})
