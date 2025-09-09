// ============================================================================
// Frontend reCAPTCHA 훅
// ============================================================================

import { useState, useCallback, useEffect } from "react"

interface UseRecaptchaOptions {
  action: "login" | "register" | "find_id" | "find_password"
  onSuccess?: (token: string) => void
  onError?: (error: Error) => void
}

interface UseRecaptchaReturn {
  execute: () => Promise<string | null>
  isLoading: boolean
  error: string | null
  reset: () => void
}

export function useRecaptcha({
  action,
  onSuccess,
  onError,
}: UseRecaptchaOptions): UseRecaptchaReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // reCAPTCHA v3 실행
      const token = await new Promise<string>((resolve, reject) => {
        if (typeof window.grecaptcha === "undefined") {
          reject(new Error("reCAPTCHA가 로드되지 않았습니다"))
          return
        }

        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action })
            .then((token: string) => {
              resolve(token)
            })
            .catch((error: any) => {
              reject(error)
            })
        })
      })

      onSuccess?.(token)
      return token
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "reCAPTCHA 실행 실패"
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [action, onSuccess, onError])

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    execute,
    isLoading,
    error,
    reset,
  }
}

// reCAPTCHA 스크립트 로드
export const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.grecaptcha !== "undefined") {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true

    script.onload = () => {
      resolve()
    }

    script.onerror = () => {
      reject(new Error("reCAPTCHA 스크립트 로드 실패"))
    }

    document.head.appendChild(script)
  })
}

// 전역 타입 선언
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}
