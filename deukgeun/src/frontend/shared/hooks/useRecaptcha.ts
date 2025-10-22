import { useState, useCallback } from 'react'
import { executeRecaptcha,
  getDummyRecaptchaToken,
  isRecaptchaAvailable,
  config,
} from '@frontend/shared/lib/recaptcha'

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

function useRecaptcha(
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
        console.log('🔧 개발 환경: 더미 reCAPTCHA 토큰 생성')
        const dummyToken = getDummyRecaptchaToken()
        console.log('✅ 더미 reCAPTCHA 토큰:', dummyToken)
        onSuccess?.(dummyToken)
        return dummyToken
      }

      // 실제 reCAPTCHA 실행
      const token = await executeRecaptcha(action)
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
function useRecaptchaForRegister() {
  return useRecaptcha({ action: 'register' })
}

function useRecaptchaForLogin() {
  return useRecaptcha({ action: 'login' })
}

function useRecaptchaForPasswordReset() {
  return useRecaptcha({ action: 'password_reset' })
}

// Export all functions
export {
  useRecaptcha,
  useRecaptchaForRegister,
  useRecaptchaForLogin,
  useRecaptchaForPasswordReset,
}