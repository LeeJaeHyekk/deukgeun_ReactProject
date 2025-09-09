// ============================================================================
// 인증 reCAPTCHA 훅
// ============================================================================

import { useState, useCallback } from "react"

export function useAuthRecaptcha() {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false)

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token)
  }, [])

  const handleRecaptchaLoad = useCallback(() => {
    setIsRecaptchaLoaded(true)
  }, [])

  const resetRecaptcha = useCallback(() => {
    setRecaptchaToken(null)
  }, [])

  return {
    recaptchaToken,
    isRecaptchaLoaded,
    handleRecaptchaChange,
    handleRecaptchaLoad,
    resetRecaptcha,
  }
}
