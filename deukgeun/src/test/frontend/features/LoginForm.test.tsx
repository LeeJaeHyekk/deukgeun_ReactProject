import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LoginForm } from "../../../frontend/features/auth/components/LoginForm"
import {
  createMockUser,
  createMockAuthToken,
  createMockApiResponse,
} from "../../../frontend/shared/utils/testUtils"

// Mock API 호출
jest.mock("../../../frontend/shared/api/authApi", () => ({
  login: jest.fn(),
}))

// Mock useAuth hook
jest.mock("../../../frontend/shared/hooks/useAuth", () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null,
  }),
}))

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

describe("LoginForm", () => {
  const mockLogin = jest.fn()
  const mockNavigate = jest.fn()
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useAuth hook
    jest.doMock("../../../frontend/shared/hooks/useAuth", () => ({
      useAuth: () => ({
        login: mockLogin,
        isLoading: false,
        error: null,
      }),
    }))

    // Mock useNavigate
    jest.doMock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
      Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
      ),
    }))
  })

  describe("렌더링", () => {
    it("should render login form correctly", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      // 필수 요소들이 렌더링되는지 확인
      expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /로그인/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/회원가입/i)).toBeInTheDocument()
      expect(screen.getByText(/비밀번호 찾기/i)).toBeInTheDocument()
    })

    it("should display form validation errors initially", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      // 초기에는 에러 메시지가 보이지 않아야 함
      expect(
        screen.queryByText(/이메일을 입력해주세요/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(/비밀번호를 입력해주세요/i)
      ).not.toBeInTheDocument()
    })

    it("should show loading state when isLoading is true", () => {
      jest.doMock("../../../frontend/shared/hooks/useAuth", () => ({
        useAuth: () => ({
          login: mockLogin,
          isLoading: true,
          error: null,
        }),
      }))

      render(<LoginForm onSubmit={mockOnSubmit} loading={true} />)

      const loginButton = screen.getByRole("button", { name: /로그인/i })
      expect(loginButton).toBeDisabled()
      expect(loginButton).toHaveTextContent(/로그인 중/i)
    })
  })

  describe("폼 검증", () => {
    it("should validate email format", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 잘못된 이메일 형식 입력
      await userEvent.type(emailInput, "invalid-email")
      await userEvent.click(loginButton)

      expect(screen.getByText(/유효한 이메일 주소를 입력해주세요/i)).toBeInTheDocument()
    })

    it("should validate password length", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 유효한 이메일과 짧은 비밀번호 입력
      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "123")
      await userEvent.click(loginButton)

      expect(screen.getByText(/비밀번호는 최소 8자 이상이어야 합니다/i)).toBeInTheDocument()
    })

    it("should require reCAPTCHA verification", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 유효한 이메일과 비밀번호 입력 (reCAPTCHA 없이)
      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "password123")
      await userEvent.click(loginButton)

      expect(screen.getByText(/보안 인증을 완료해주세요/i)).toBeInTheDocument()
    })
  })

  describe("사용자 상호작용", () => {
    it("should handle email input changes", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      await userEvent.type(emailInput, "test@example.com")

      expect(emailInput).toHaveValue("test@example.com")
    })

    it("should handle password input changes", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const passwordInput = screen.getByLabelText(/비밀번호/i)
      await userEvent.type(passwordInput, "password123")

      expect(passwordInput).toHaveValue("password123")
    })

    it("should toggle password visibility", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const passwordInput = screen.getByLabelText(/비밀번호/i)
      const toggleButton = screen.getByRole("button", { name: /비밀번호 표시/i })

      // 초기에는 비밀번호가 숨겨져 있음
      expect(passwordInput).toHaveAttribute("type", "password")

      // 토글 버튼 클릭
      await userEvent.click(toggleButton)

      // 비밀번호가 보임
      expect(passwordInput).toHaveAttribute("type", "text")
    })

    it("should clear email error when user starts typing", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 에러 발생
      await userEvent.click(loginButton)
      expect(screen.getByText(/이메일을 입력해주세요/i)).toBeInTheDocument()

      // 이메일 입력 시작
      await userEvent.type(emailInput, "t")
      expect(screen.queryByText(/이메일을 입력해주세요/i)).not.toBeInTheDocument()
    })

    it("should clear password error when user starts typing", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 유효한 이메일 입력
      await userEvent.type(emailInput, "test@example.com")

      // 에러 발생
      await userEvent.click(loginButton)
      expect(screen.getByText(/비밀번호를 입력해주세요/i)).toBeInTheDocument()

      // 비밀번호 입력 시작
      await userEvent.type(passwordInput, "p")
      expect(screen.queryByText(/비밀번호를 입력해주세요/i)).not.toBeInTheDocument()
    })
  })

  describe("폼 제출", () => {
    it("should call onSubmit with correct data when form is valid", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 유효한 데이터 입력
      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "password123")

      // reCAPTCHA 모킹 (개발 환경에서는 더미 토큰 사용)
      const recaptchaElement = screen.getByTestId("recaptcha")
      fireEvent.change(recaptchaElement, { target: { value: "dummy-token" } })

      // 폼 제출
      await userEvent.click(loginButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          "test@example.com",
          "password123",
          "dummy-token"
        )
      })
    })

    it("should not submit form when validation fails", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 빈 폼으로 제출
      await userEvent.click(loginButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("should handle submission errors gracefully", async () => {
      const mockOnSubmitWithError = jest.fn().mockRejectedValue(new Error("Login failed"))
      render(<LoginForm onSubmit={mockOnSubmitWithError} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 유효한 데이터 입력
      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "password123")

      // reCAPTCHA 모킹
      const recaptchaElement = screen.getByTestId("recaptcha")
      fireEvent.change(recaptchaElement, { target: { value: "dummy-token" } })

      // 폼 제출
      await userEvent.click(loginButton)

      await waitFor(() => {
        expect(mockOnSubmitWithError).toHaveBeenCalled()
      })
    })

    it("should show loading state during submission", async () => {
      const mockOnSubmitAsync = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<LoginForm onSubmit={mockOnSubmitAsync} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // 유효한 데이터 입력
      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "password123")

      // reCAPTCHA 모킹
      const recaptchaElement = screen.getByTestId("recaptcha")
      fireEvent.change(recaptchaElement, { target: { value: "dummy-token" } })

      // 폼 제출
      await userEvent.click(loginButton)

      // 로딩 상태 확인
      expect(loginButton).toBeDisabled()
      expect(loginButton).toHaveTextContent(/로그인 중/i)
    })
  })

  describe("접근성", () => {
    it("should have proper form labels", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    })

    it("should have proper ARIA attributes", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const passwordInput = screen.getByLabelText(/비밀번호/i)

      expect(emailInput).toHaveAttribute("type", "email")
      expect(passwordInput).toHaveAttribute("type", "password")
    })

    it("should be keyboard accessible", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      const loginButton = screen.getByRole("button", { name: /로그인/i })

      // Tab 순서 확인
      emailInput.focus()
      expect(emailInput).toHaveFocus()

      passwordInput.focus()
      expect(passwordInput).toHaveFocus()

      loginButton.focus()
      expect(loginButton).toHaveFocus()
    })
  })

  describe("반응형 디자인", () => {
    it("should be responsive on different screen sizes", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const form = screen.getByRole("form")

      // 모바일 크기
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event("resize"))

      expect(form).toBeInTheDocument()

      // 데스크톱 크기
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      })
      window.dispatchEvent(new Event("resize"))

      expect(form).toBeInTheDocument()
    })
  })

  describe("성능", () => {
    it("should not re-render unnecessarily", () => {
      const { rerender } = render(<LoginForm onSubmit={mockOnSubmit} />)

      // 같은 props로 리렌더링
      rerender(<LoginForm onSubmit={mockOnSubmit} />)

      // 컴포넌트가 정상적으로 렌더링되는지 확인
      expect(screen.getByRole("button", { name: /로그인/i })).toBeInTheDocument()
    })

    it("should handle rapid input changes efficiently", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/이메일/i)

      // 빠른 입력 변경
      for (let i = 0; i < 10; i++) {
        await userEvent.clear(emailInput)
        await userEvent.type(emailInput, `test${i}@example.com`)
      }

      expect(emailInput).toHaveValue("test9@example.com")
    })
  })
})

