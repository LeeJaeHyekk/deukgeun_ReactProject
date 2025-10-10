// Browser API polyfills for Node.js environment
if (typeof window === 'undefined') {
  global.window = global.window || {}
  global.document = global.document || {}
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.File = global.File || class File {}
  global.StorageEvent = global.StorageEvent || class StorageEvent {}
  global.requestAnimationFrame = global.requestAnimationFrame || (cb => setTimeout(cb, 16))
}

// ============================================================================
// ReCAPTCHA utilities
// ============================================================================

import { useState, useEffect } from 'react'

// reCAPTCHA 타입 정의 (통합된 버전)
export interface RecaptchaInstance {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options?: { action: string }) => Promise<string>
  render: (container: string | HTMLElement, config?: RecaptchaConfig) => number
  reset: (widgetId?: number) => void
  getResponse: (widgetId?: number) => string
  enterprise?: {
    ready: (callback: () => void) => void
    execute: (siteKey: string, options: { action: string }) => Promise<string>
  }
}

declare global {
  interface Window {
    grecaptcha: RecaptchaInstance
    onRecaptchaLoad?: () => void
  }
}

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

// RecaptchaInstance는 위에서 이미 정의됨 (중복 제거)

// Load ReCAPTCHA script
function loadRecaptchaScript(siteKey: string): Promise<void> {
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

    // Create script element
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad`
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
function renderRecaptcha(
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
function getRecaptchaResponse(widgetId?: number): string {
  if (!window.grecaptcha) {
    throw new Error('ReCAPTCHA not loaded')
  }

  if (widgetId === undefined) {
    throw new Error('Widget ID is required')
  }

  return window.grecaptcha.getResponse(widgetId)
}

// Reset ReCAPTCHA widget
function resetRecaptcha(widgetId?: number): void {
  if (!window.grecaptcha) {
    throw new Error('ReCAPTCHA not loaded')
  }

  if (widgetId === undefined) {
    throw new Error('Widget ID is required')
  }

  window.grecaptcha.reset(widgetId)
}

// Execute ReCAPTCHA (for invisible)
function executeRecaptcha(widgetId?: number): void {
  if (!window.grecaptcha) {
    throw new Error('ReCAPTCHA not loaded')
  }

  if (widgetId !== undefined) {
    window.grecaptcha.execute(widgetId.toString())
  }
}

// Execute ReCAPTCHA v3 with action
export async function executeRecaptchaV3(
  action: string = 'login'
): Promise<string> {
  try {
    // Development environment - return dummy token
    if (import.meta.env.DEV) {
      console.log('🔧 개발 환경: 더미 reCAPTCHA 토큰 사용')
      return getDummyRecaptchaToken()
    }

    await loadRecaptchaScript(import.meta.env.VITE_RECAPTCHA_SITE_KEY || '')

    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA가 로드되지 않았습니다.')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('reCAPTCHA 실행 시간 초과'))
      }, 10000) // 10초 타임아웃

      window.grecaptcha.ready(async () => {
        try {
          const token = await (window.grecaptcha as any).enterprise.execute(
            import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
            {
              action: action,
            }
          )
          clearTimeout(timeout)

          if (!token) {
            throw new Error('reCAPTCHA 토큰이 생성되지 않았습니다.')
          }

          console.log('✅ reCAPTCHA 토큰 생성 성공')
          resolve(token)
        } catch (error) {
          clearTimeout(timeout)
          console.error('❌ reCAPTCHA 실행 실패:', error)
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('❌ reCAPTCHA 실행 중 오류:', error)
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
function createRecaptchaWidget(
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

// useState and useEffect are already imported at the top

// Development dummy token function
export const getDummyRecaptchaToken = (): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  return `dummy-token-${timestamp}-${randomId}`
}

// Check if reCAPTCHA is available
export const isRecaptchaAvailable = (): boolean => {
  // 개발 환경에서는 항상 사용 가능
  if (import.meta.env.DEV) {
    console.log('🔧 개발 환경: reCAPTCHA 사용 가능 (shared)')
    return true
  }
  
  const isAvailable = typeof window !== 'undefined' && !!window.grecaptcha
  console.log('🔍 reCAPTCHA 사용 가능 여부 (shared):', isAvailable, {
    hasWindow: typeof window !== 'undefined',
    hasGrecaptcha: typeof window !== 'undefined' && !!window.grecaptcha
  })
  return isAvailable
}
