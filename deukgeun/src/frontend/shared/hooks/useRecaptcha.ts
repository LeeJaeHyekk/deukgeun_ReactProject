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
    console.log('🚀 [useRecaptcha] execute 함수 시작')
    setIsLoading(true)
    setError(null)

    try {
      // reCAPTCHA 사용 가능 여부 확인
      console.log('🔍 [useRecaptcha] reCAPTCHA 사용 가능 여부 확인 중...')
      const isAvailable = isRecaptchaAvailable()
      console.log('🔍 [useRecaptcha] reCAPTCHA 사용 가능 여부:', isAvailable)

      if (!isAvailable) {
        console.warn('⚠️ [useRecaptcha] reCAPTCHA 사용 불가능, 더미 토큰 사용')
        // reCAPTCHA 사용 불가능 시 더미 토큰 반환
        const dummyToken = getDummyRecaptchaToken()
        console.log('🔧 [useRecaptcha] 더미 토큰 반환:', dummyToken)
        onSuccess?.(dummyToken)
        return dummyToken
      }

      // 환경 확인 및 더미 토큰 사용 조건
      console.log('🔍 [useRecaptcha] 환경 확인:', {
        DEV: import.meta.env.DEV,
        MODE: import.meta.env.MODE,
        PROD: import.meta.env.PROD,
        IS_DEVELOPMENT: config.RECAPTCHA.IS_DEVELOPMENT,
        IS_PRODUCTION: config.RECAPTCHA.IS_PRODUCTION,
        IS_TEST_KEY: config.RECAPTCHA.IS_TEST_KEY,
        SITE_KEY: config.RECAPTCHA.SITE_KEY,
        hostname: window.location.hostname,
        port: window.location.port,
        config: config.RECAPTCHA,
      })

      // Site key가 없거나 테스트 키인 경우 더미 토큰 사용
      const shouldUseDummyToken =
        config.RECAPTCHA.IS_DEVELOPMENT ||
        config.RECAPTCHA.IS_TEST_KEY ||
        !config.RECAPTCHA.SITE_KEY ||
        config.RECAPTCHA.SITE_KEY === 'your_recaptcha_site_key_here' ||
        config.RECAPTCHA.SITE_KEY === 'your_production_recaptcha_site_key' ||
        config.RECAPTCHA.SITE_KEY === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Google 테스트 키

      console.log('🔍 [useRecaptcha] 더미 토큰 사용 여부:', shouldUseDummyToken)

      if (shouldUseDummyToken) {
        const dummyToken = getDummyRecaptchaToken()
        console.log('🔧 [useRecaptcha] 더미 reCAPTCHA 토큰 사용', dummyToken)
        onSuccess?.(dummyToken)
        return dummyToken
      }

      // 실제 reCAPTCHA 실행
      console.log('🔄 [useRecaptcha] 실제 reCAPTCHA 실행 시작')
      const token = await executeRecaptchaV3(action)
      console.log(
        '✅ [useRecaptcha] 실제 reCAPTCHA 토큰 생성 성공:',
        token ? token.substring(0, 20) + '...' : '토큰 없음'
      )
      onSuccess?.(token)
      return token
    } catch (err) {
      console.error('❌ [useRecaptcha] 에러 발생:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'reCAPTCHA 실행에 실패했습니다.'
      console.error('❌ [useRecaptcha] 에러 메시지:', errorMessage)
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    } finally {
      console.log('🔍 [useRecaptcha] execute 함수 종료')
      setIsLoading(false)
    }
  }, [action, onSuccess, onError])

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  const isAvailable = isRecaptchaAvailable()
  // 개발 환경에서만 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [useRecaptcha] 훅 반환값:', {
      isAvailable,
      isLoading,
      error,
    })
  }

  return {
    execute,
    isLoading,
    error,
    isAvailable,
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
