import { config } from "../config"

// reCAPTCHA 타입 정의
interface RecaptchaInstance {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options?: { action: string }) => Promise<string>
  render: (container: string | HTMLElement, options: any) => number
  getResponse: (widgetId: number) => string
  reset: (widgetId: number) => void
  enterprise?: {
    ready: (callback: () => void) => void
    execute: (siteKey: string, options?: { action: string }) => Promise<string>
  }
}

declare global {
  interface Window {
    grecaptcha: RecaptchaInstance
  }
}

// reCAPTCHA 상태 관리
interface RecaptchaState {
  isLoaded: boolean
  isLoading: boolean
  error: string | null
}

let recaptchaState: RecaptchaState = {
  isLoaded: false,
  isLoading: false,
  error: null,
}

// reCAPTCHA 스크립트 로드
export const loadRecaptchaScript = (): Promise<void> => {
  // 이미 로드된 경우
  if (recaptchaState.isLoaded && window.grecaptcha) {
    return Promise.resolve()
  }

  // 로딩 중인 경우
  if (recaptchaState.isLoading) {
    return new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (recaptchaState.isLoaded) {
          resolve()
        } else if (recaptchaState.error) {
          reject(new Error(recaptchaState.error))
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
    })
  }

  // 개발 환경에서 더미 토큰 사용
  if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
    console.log("🔧 개발 환경: reCAPTCHA 스크립트 로드 스킵")
    recaptchaState.isLoaded = true
    return Promise.resolve()
  }

  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  recaptchaState.isLoading = true
  recaptchaState.error = null

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA.SITE_KEY}`
    script.async = true
    script.defer = true

    script.onload = () => {
      recaptchaState.isLoaded = true
      recaptchaState.isLoading = false
      console.log("✅ reCAPTCHA 스크립트 로드 성공")
      resolve()
    }

    script.onerror = () => {
      recaptchaState.error = "reCAPTCHA 스크립트 로드 실패"
      recaptchaState.isLoading = false
      console.error("❌ reCAPTCHA 스크립트 로드 실패")
      reject(new Error("reCAPTCHA 스크립트 로드 실패"))
    }

    document.head.appendChild(script)
  })
}

// reCAPTCHA 토큰 생성 (v3)
export const executeRecaptcha = async (
  action: string = "login"
): Promise<string> => {
  try {
    // 개발 환경에서 더미 토큰 사용
    if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
      console.log("🔧 개발 환경: 더미 reCAPTCHA 토큰 사용")
      return getDummyRecaptchaToken()
    }

    await loadRecaptchaScript()

    if (!window.grecaptcha) {
      throw new Error("reCAPTCHA가 로드되지 않았습니다.")
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("reCAPTCHA 실행 시간 초과"))
      }, 10000) // 10초 타임아웃

      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(
            config.RECAPTCHA.SITE_KEY,
            { action }
          )
          clearTimeout(timeout)

          if (!token || token.length === 0) {
            throw new Error("reCAPTCHA 토큰이 생성되지 않았습니다.")
          }

          console.log("✅ reCAPTCHA 토큰 생성 성공")
          resolve(token)
        } catch (error) {
          clearTimeout(timeout)
          console.error("❌ reCAPTCHA 실행 실패:", error)
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error("❌ reCAPTCHA 실행 중 오류:", error)
    throw new Error("reCAPTCHA 실행에 실패했습니다. 다시 시도해주세요.")
  }
}

// reCAPTCHA 위젯 렌더링 (v2용 - 필요시 사용)
export const renderRecaptchaWidget = (
  container: string | HTMLElement,
  callback: (token: string) => void,
  options: any = {}
): number => {
  if (!window.grecaptcha) {
    throw new Error("reCAPTCHA가 로드되지 않았습니다.")
  }

  const defaultOptions = {
    sitekey: config.RECAPTCHA.SITE_KEY,
    callback: callback,
    "expired-callback": () => console.log("reCAPTCHA expired"),
    "error-callback": () => console.log("reCAPTCHA error"),
    ...options,
  }

  return window.grecaptcha.render(container, defaultOptions)
}

// 개발용 더미 토큰 생성
export const getDummyRecaptchaToken = (): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  return `dummy-token-${timestamp}-${randomId}`
}

// reCAPTCHA 상태 확인
export const getRecaptchaState = (): RecaptchaState => {
  return { ...recaptchaState }
}

// reCAPTCHA 초기화 (테스트용)
export const resetRecaptchaState = (): void => {
  recaptchaState = {
    isLoaded: false,
    isLoading: false,
    error: null,
  }
}

// 환경별 reCAPTCHA 사용 가능 여부 확인
export const isRecaptchaAvailable = (): boolean => {
  return (
    config.RECAPTCHA.IS_DEVELOPMENT ||
    config.RECAPTCHA.IS_TEST_KEY ||
    (recaptchaState.isLoaded && !!window.grecaptcha)
  )
}
