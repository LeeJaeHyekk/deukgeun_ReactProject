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
    console.log(`🔄 [useRecaptcha] execute 시작 (action: ${action})`)
    setIsLoading(true)
    setError(null)

    try {
      // 먼저 스크립트를 로드 시도 (사용 가능 여부 확인 전)
      if (typeof window !== 'undefined' && !config.RECAPTCHA.IS_DEVELOPMENT && !config.RECAPTCHA.IS_TEST_KEY) {
        try {
          const { loadRecaptchaScript } = await import('@frontend/shared/lib/recaptcha')
          console.log('🔄 [useRecaptcha] 스크립트 로드 시도...')
          await loadRecaptchaScript()
          console.log('✅ [useRecaptcha] 스크립트 로드 완료')
        } catch (loadError) {
          console.warn('⚠️ [useRecaptcha] 스크립트 로드 실패, 계속 진행:', loadError)
        }
      }
      
      // reCAPTCHA 사용 가능 여부 확인
      const isAvailable = isRecaptchaAvailable()
      console.log(`🔍 [useRecaptcha] 사용 가능 여부 확인 결과: ${isAvailable}`)
      
      if (!isAvailable) {
        const errorMsg = 'reCAPTCHA를 사용할 수 없습니다.'
        console.error(`❌ [useRecaptcha] ${errorMsg}`, {
          action,
          recaptchaState: {
            isLoaded: typeof window !== 'undefined' && window.grecaptcha ? 'exists' : 'not exists',
            hasExecute: typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.execute === 'function'
          }
        })
        throw new Error(errorMsg)
      }

      // 개발 환경에서는 더미 토큰 사용
      if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
        console.log('🔧 [useRecaptcha] 개발 환경: 더미 reCAPTCHA 토큰 생성')
        const dummyToken = getDummyRecaptchaToken()
        console.log('✅ [useRecaptcha] 더미 reCAPTCHA 토큰 생성 완료:', dummyToken.substring(0, 20) + '...')
        onSuccess?.(dummyToken)
        return dummyToken
      }

      // 실제 reCAPTCHA 실행
      console.log(`🔄 [useRecaptcha] executeRecaptcha 호출 시작 (action: ${action})`)
      const token = await executeRecaptcha(action)
      console.log(`✅ [useRecaptcha] executeRecaptcha 완료 (action: ${action})`, {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...'
      })
      onSuccess?.(token)
      return token
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'reCAPTCHA 실행에 실패했습니다.'
      console.error(`❌ [useRecaptcha] execute 실패 (action: ${action}):`, {
        error: errorMessage,
        errorStack: err instanceof Error ? err.stack : undefined
      })
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    } finally {
      setIsLoading(false)
      console.log(`✅ [useRecaptcha] execute 완료 (action: ${action})`)
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