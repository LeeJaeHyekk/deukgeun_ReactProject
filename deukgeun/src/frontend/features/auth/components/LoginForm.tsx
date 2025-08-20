import React from "react"
import { FormField } from "./common/FormField"
import ReCAPTCHA from "react-google-recaptcha"
import { AuthButton } from "./common/AuthButton"
import { config } from "@shared/config"
import { useAuthForm } from "../hooks/useAuthForm"
import { useAuthRecaptcha } from "../hooks/useAuthRecaptcha"
import { AUTH_VALIDATION_RULES } from "../utils/validation"

interface LoginFormData {
  email: string
  password: string
  recaptchaToken: string | null
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  loading?: boolean
}

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const {
    formData,
    errors,
    loading: formLoading,
    updateField,
    validateField,
    handleSubmit,
  } = useAuthForm<LoginFormData>({
    initialData: {
      email: "",
      password: "",
      recaptchaToken: null,
    },
    validationFields: ["email", "password", "recaptcha"],
    onSubmit,
  })

  const { recaptchaToken, recaptchaLoading, executeRecaptcha } =
    useAuthRecaptcha({
      action: "login",
      onSuccess: token => updateField("recaptchaToken", token),
    })

  const handleFieldChange = (field: keyof LoginFormData, value: string) => {
    updateField(field, value)
    validateField(field)
  }

  const handleRecaptchaChange = (token: string | null) => {
    updateField("recaptchaToken", token)
    validateField("recaptchaToken")
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // reCAPTCHA 토큰이 없으면 생성
    if (!formData.recaptchaToken) {
      const token = await executeRecaptcha()
      if (token) {
        updateField("recaptchaToken", token)
      }
    }

    await handleSubmit(e)
  }

  const isSubmitting = formLoading || loading || recaptchaLoading

  return (
    <form onSubmit={handleFormSubmit} className="login-form">
      <FormField
        id="email"
        type="email"
        value={formData.email}
        onChange={value => handleFieldChange("email", value)}
        placeholder="이메일"
        error={errors.email}
        required
        autoComplete="email"
        onKeyDown={e => {
          if (e.key === "Enter" && !isSubmitting) {
            e.preventDefault()
            handleFormSubmit(e)
          }
        }}
      />

      <FormField
        id="password"
        type="password"
        value={formData.password}
        onChange={value => handleFieldChange("password", value)}
        placeholder="비밀번호"
        error={errors.password}
        required
        autoComplete="current-password"
        showPasswordToggle
        onKeyDown={e => {
          if (e.key === "Enter" && !isSubmitting) {
            e.preventDefault()
            handleFormSubmit(e)
          }
        }}
      />

      <div className="recaptcha-container">
        <RecaptchaWidget
          onChange={handleRecaptchaChange}
          aria-describedby={
            errors.recaptchaToken ? "recaptcha-error" : undefined
          }
        />
        {errors.recaptchaToken && (
          <span id="recaptcha-error" className="error-message" role="alert">
            {errors.recaptchaToken}
          </span>
        )}
      </div>

      <AuthButton
        type="submit"
        variant="primary"
        size="large"
        loading={isSubmitting}
        fullWidth
        className="login-button"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </AuthButton>
    </form>
  )
}
