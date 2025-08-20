import { useState, useCallback } from "react"
import { useRecaptcha } from "@shared/hooks/useRecaptcha"
import { showToast } from "@shared/lib"

interface UseAuthRecaptchaOptions {
  action: "login" | "register" | "find_id" | "find_password"
  onSuccess?: (token: string) => void
  onError?: (error: Error) => void
}

interface UseAuthRecaptchaReturn {
  recaptchaToken: string | null
  recaptchaLoading: boolean
  recaptchaError: string | null
  executeRecaptcha: () => Promise<string | null>
  resetRecaptcha: () => void
}

export function useAuthRecaptcha({
  action,
  onSuccess,
  onError,
}: UseAuthRecaptchaOptions): UseAuthRecaptchaReturn {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  const {
    execute,
    isLoading: recaptchaLoading,
    error: recaptchaError,
    reset: resetRecaptchaState,
  } = useRecaptcha({
    action,
    onSuccess: token => {
      setRecaptchaToken(token)
      onSuccess?.(token)
    },
    onError: error => {
      console.error("reCAPTCHA error:", error)
      showToast("보안 인증에 실패했습니다. 다시 시도해주세요.", "error")
      onError?.(error)
    },
  })

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    try {
      const token = await execute()
      return token
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error)
      return null
    }
  }, [execute])

  const resetRecaptcha = useCallback(() => {
    setRecaptchaToken(null)
    resetRecaptchaState()
  }, [resetRecaptchaState])

  return {
    recaptchaToken,
    recaptchaLoading,
    recaptchaError,
    executeRecaptcha,
    resetRecaptcha,
  }
}
