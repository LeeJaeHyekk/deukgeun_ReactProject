import { useState, useCallback } from 'react'
import {
  executeRecaptchaV3,
  getDummyRecaptchaToken,
  isRecaptchaAvailable,
} from '@shared/lib/recaptcha'
import { config } from '@shared/config'

interface UseRecaptchaOptions {
  action?: string
  onSuccess?: (token: string) => void
  onError?: (error: Error) => void
}

interface UseRecaptchaReturn {
  execute: () => Promise<string>
  isLoading: boolean
  error: string | null
  isAvailable: boolean
  reset: () => void
}

export function useRecaptcha(
  options: UseRecaptchaOptions = {}
): UseRecaptchaReturn {
  const { action = 'default', onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      // reCAPTCHA 사용 가능 여부 확인
      if (!isRecaptchaAvailable()) {
        throw new Error('reCAPTCHA를 사용할 수 없습니다.')
      }

      // 개발 환경에서는 더미 토큰 사용
      if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
        const dummyToken = getDummyRecaptchaToken()
        onSuccess?.(dummyToken)
        return dummyToken
      }

      // 실제 reCAPTCHA 실행
      const token = await executeRecaptchaV3(action)
      onSuccess?.(token)
      return token
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'reCAPTCHA 실행에 실패했습니다.'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
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
    isAvailable: isRecaptchaAvailable(),
    reset,
  }
}

// 특정 액션별 reCAPTCHA 훅들
export function useRecaptchaForRegister() {
  return useRecaptcha({ action: 'register' })
}

export function useRecaptchaForLogin() {
  return useRecaptcha({ action: 'login' })
}

export function useRecaptchaForPasswordReset() {
  return useRecaptcha({ action: 'password_reset' })
}
