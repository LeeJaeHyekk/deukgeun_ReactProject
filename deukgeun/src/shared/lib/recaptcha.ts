// ============================================================================
// ReCAPTCHA utilities
// ============================================================================

export interface RecaptchaConfig {
  siteKey: string
  theme?: 'light' | 'dark'
  size?: 'compact' | 'normal' | 'invisible'
  type?: 'image' | 'audio'
  tabindex?: number
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

export interface RecaptchaInstance {
  render: (container: string | HTMLElement, config: RecaptchaConfig) => number
  reset: (widgetId?: number) => void
  getResponse: (widgetId?: number) => string
  execute: (widgetId?: number) => void
}

declare global {
  interface Window {
    grecaptcha: RecaptchaInstance
    onRecaptchaLoad: () => void
  }
}

// Load ReCAPTCHA v3 script
export function loadRecaptchaScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.grecaptcha) {
      resolve()
      return
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="recaptcha"]')) {
      // Wait for it to load
      const checkLoaded = () => {
        if (window.grecaptcha) {
          resolve()
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    // Create script element for v3
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true

    // Set up global callback
    window.onRecaptchaLoad = () => {
      resolve()
    }

    // Handle script load error
    script.onerror = () => {
      reject(new Error('Failed to load ReCAPTCHA script'))
    }

    // Add script to document
    document.head.appendChild(script)
  })
}

// Render ReCAPTCHA widget
export function renderRecaptcha(
  container: string | HTMLElement,
  config: RecaptchaConfig
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error('ReCAPTCHA not loaded'))
      return
    }

    try {
      const widgetId = window.grecaptcha.render(container, config)
      resolve(widgetId)
    } catch (error) {
      reject(error)
    }
  })
}

// Get ReCAPTCHA response
export function getRecaptchaResponse(widgetId?: number): string {
  if (!window.grecaptcha) {
    throw new Error('ReCAPTCHA not loaded')
  }

  return window.grecaptcha.getResponse(widgetId)
}

// Reset ReCAPTCHA widget
export function resetRecaptcha(widgetId?: number): void {
  if (!window.grecaptcha) {
    throw new Error('ReCAPTCHA not loaded')
  }

  window.grecaptcha.reset(widgetId)
}

// Execute ReCAPTCHA (for invisible)
export function executeRecaptcha(widgetId?: number): void {
  if (!window.grecaptcha) {
    throw new Error('ReCAPTCHA not loaded')
  }

  window.grecaptcha.execute(widgetId)
}

// Execute ReCAPTCHA v3 with action
export async function executeRecaptchaV3(
  action: string = 'login'
): Promise<string> {
  try {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

    console.log('🚀 [executeRecaptchaV3] 시작:', {
      action,
      siteKey: siteKey ? '설정됨' : '없음',
    })

    // Site key가 없거나 테스트 키인 경우 더미 토큰 반환
    if (
      !siteKey ||
      siteKey === 'your_production_recaptcha_site_key' ||
      siteKey === 'your_recaptcha_site_key_here' ||
      siteKey === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    ) {
      // Google 테스트 키
      console.warn(
        '⚠️ [executeRecaptchaV3] Site key가 설정되지 않거나 테스트 키, 더미 토큰 사용'
      )
      return getDummyRecaptchaToken()
    }

    // Development environment - return dummy token
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      console.log('🔧 [executeRecaptchaV3] 개발 환경: 더미 reCAPTCHA 토큰 사용')
      return getDummyRecaptchaToken()
    }

    // Load reCAPTCHA script
    console.log('📥 [executeRecaptchaV3] reCAPTCHA 스크립트 로딩 중...')
    await loadRecaptchaScript(siteKey)

    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA가 로드되지 않았습니다.')
    }

    console.log('✅ [executeRecaptchaV3] reCAPTCHA 스크립트 로드 완료')

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('⏰ [executeRecaptchaV3] 타임아웃 발생')
        reject(new Error('reCAPTCHA 실행 시간 초과'))
      }, 10000) // 10초 타임아웃

      // Check if grecaptcha.ready is available
      if (
        window.grecaptcha &&
        typeof (window.grecaptcha as any).ready === 'function'
      ) {
        console.log('🔄 [executeRecaptchaV3] grecaptcha.ready 호출 중...')
        ;(window.grecaptcha as any).ready(async () => {
          try {
            console.log('🔄 [executeRecaptchaV3] grecaptcha.execute 호출 중...')
            const token = await (window.grecaptcha as any).execute(siteKey, {
              action,
            })
            clearTimeout(timeout)

            if (!token) {
              throw new Error('reCAPTCHA 토큰이 생성되지 않았습니다.')
            }

            console.log(
              '✅ [executeRecaptchaV3] reCAPTCHA 토큰 생성 성공:',
              token.substring(0, 20) + '...'
            )
            resolve(token)
          } catch (error) {
            clearTimeout(timeout)
            console.error(
              '❌ [executeRecaptchaV3] grecaptcha.execute 실패:',
              error
            )
            reject(error)
          }
        })
      } else {
        clearTimeout(timeout)
        console.error('❌ [executeRecaptchaV3] grecaptcha.ready 사용 불가')
        reject(new Error('reCAPTCHA가 로드되지 않았습니다.'))
      }
    })
  } catch (error) {
    console.error('❌ [executeRecaptchaV3] 실행 중 오류:', error)
    // 에러 발생 시 더미 토큰 반환 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.warn('⚠️ [executeRecaptchaV3] 에러 발생, 더미 토큰 반환')
      return getDummyRecaptchaToken()
    }
    throw new Error('reCAPTCHA 실행에 실패했습니다. 다시 시도해주세요.')
  }
}

// Verify ReCAPTCHA token on server
export async function verifyRecaptchaToken(
  token: string,
  secretKey: string
): Promise<boolean> {
  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    )

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('ReCAPTCHA verification error:', error)
    return false
  }
}

// Create ReCAPTCHA widget with promise-based API
export function createRecaptchaWidget(
  container: string | HTMLElement,
  config: RecaptchaConfig
): Promise<{
  widgetId: number
  getResponse: () => string
  reset: () => void
  execute: () => void
}> {
  return new Promise((resolve, reject) => {
    loadRecaptchaScript(config.siteKey)
      .then(() => {
        return renderRecaptcha(container, config)
      })
      .then(widgetId => {
        resolve({
          widgetId,
          getResponse: () => getRecaptchaResponse(widgetId),
          reset: () => resetRecaptcha(widgetId),
          execute: () => executeRecaptcha(widgetId),
        })
      })
      .catch(reject)
  })
}

// Hook for React components
export function useRecaptcha(siteKey: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecaptchaScript(siteKey)
      .then(() => {
        setIsLoaded(true)
        setError(null)
      })
      .catch(err => {
        setError(err.message)
        setIsLoaded(false)
      })
  }, [siteKey])

  return {
    isLoaded,
    error,
    render: (
      container: string | HTMLElement,
      config: Omit<RecaptchaConfig, 'siteKey'>
    ) => renderRecaptcha(container, { ...config, siteKey }),
    getResponse: getRecaptchaResponse,
    reset: resetRecaptcha,
    execute: executeRecaptcha,
  }
}

// Import useState and useEffect for the hook
import { useState, useEffect } from 'react'

// Development dummy token function
export const getDummyRecaptchaToken = (): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  return `dummy-token-${timestamp}-${randomId}`
}

// Check if reCAPTCHA is available
export const isRecaptchaAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.grecaptcha
}
