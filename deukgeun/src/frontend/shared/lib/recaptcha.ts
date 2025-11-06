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

// Default config values
export const config = {
  RECAPTCHA: {
    SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
    IS_DEVELOPMENT: import.meta.env.MODE === 'development',
    IS_TEST_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  },
}

// reCAPTCHA 타입 정의 (shared에서 import하여 사용)
// 타입 충돌 방지를 위해 declare global은 shared/lib/recaptcha.ts에서만 선언
interface RecaptchaInstance {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options?: { action: string }) => Promise<string>
  render: (container: string | HTMLElement, options: any) => number
  getResponse: (widgetId: number) => string
  reset: (widgetId: number) => void
}

// Window 인터페이스 확장은 shared/lib/recaptcha.ts에서만 수행
// 타입 충돌 방지를 위해 이 파일에서는 제거

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
  console.log('🔄 [loadRecaptchaScript] 스크립트 로드 시작', {
    isLoaded: recaptchaState.isLoaded,
    isLoading: recaptchaState.isLoading,
    error: recaptchaState.error,
    hasGrecaptcha: typeof window !== 'undefined' && !!window.grecaptcha,
    hasExecute: typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.execute === 'function',
    siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set'
  })
  
  // 이미 로드된 경우
  if (recaptchaState.isLoaded && typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.execute === 'function') {
    console.log('✅ [loadRecaptchaScript] 이미 로드되어 있음 (execute 함수 확인됨)')
    return Promise.resolve()
  }

  // HTML에 이미 스크립트가 로드되어 있는지 확인 (Enterprise 포함)
  const existingScript = document.querySelector('script[src*="recaptcha"]') || document.getElementById('recaptcha-script')
  if (existingScript && typeof window !== 'undefined' && window.grecaptcha) {
    const hasExecute = typeof window.grecaptcha.execute === 'function'
    console.log("🔍 [loadRecaptchaScript] HTML에 이미 스크립트 존재", {
      hasExecute,
      scriptSrc: existingScript.getAttribute('src')
    })
    
    if (hasExecute) {
      recaptchaState.isLoaded = true
      console.log("✅ [loadRecaptchaScript] reCAPTCHA 스크립트가 이미 HTML에 로드되어 있고 execute 함수 확인됨")
      return Promise.resolve()
    } else {
      console.warn("⚠️ [loadRecaptchaScript] 스크립트는 있지만 execute 함수가 아직 준비되지 않음")
      // execute 함수가 준비될 때까지 대기
    }
  }

  // 로딩 중인 경우
  if (recaptchaState.isLoading) {
    console.log('🔄 [loadRecaptchaScript] 이미 로딩 중입니다. 완료 대기...')
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 50 // 5초 (100ms * 50)
      
      const checkLoaded = () => {
        const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha
        const hasExecute = hasGrecaptcha && typeof window.grecaptcha.execute === 'function'
        
        if (recaptchaState.isLoaded && hasGrecaptcha && hasExecute) {
          console.log('✅ [loadRecaptchaScript] 로딩 완료 확인됨')
          resolve()
        } else if (recaptchaState.error) {
          console.error('❌ [loadRecaptchaScript] 로딩 중 오류 발생:', recaptchaState.error)
          reject(new Error(recaptchaState.error))
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(checkLoaded, 100)
        } else {
          console.error('❌ [loadRecaptchaScript] 로딩 타임아웃')
          reject(new Error("reCAPTCHA 스크립트 로드 타임아웃"))
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

  // HTML에 이미 스크립트가 있는지 확인 (중복 로드 방지)
  const scriptExists = document.querySelector('script[src*="recaptcha"]') || document.getElementById('recaptcha-script')
  if (scriptExists) {
    // 이미 스크립트가 있으면 execute 함수가 준비될 때까지 기다림
    console.log('🔍 [loadRecaptchaScript] HTML에 스크립트 존재, execute 함수 준비 대기...')
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 50 // 5초 (100ms * 50)
      
      const checkGrecaptcha = () => {
        const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha
        const hasExecute = hasGrecaptcha && typeof window.grecaptcha.execute === 'function'
        
        console.log(`🔍 [loadRecaptchaScript] execute 함수 확인 시도 ${attempts + 1}/${maxAttempts}`, {
          hasGrecaptcha,
          hasExecute
        })
        
        if (hasGrecaptcha && hasExecute) {
          recaptchaState.isLoaded = true
          recaptchaState.isLoading = false
          recaptchaState.error = null
          console.log("✅ [loadRecaptchaScript] reCAPTCHA 스크립트가 HTML에서 로드되었고 execute 함수 확인됨")
          resolve()
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(checkGrecaptcha, 100)
        } else {
          recaptchaState.isLoading = false
          recaptchaState.error = "reCAPTCHA execute 함수 준비 타임아웃"
          console.error("❌ [loadRecaptchaScript] execute 함수 준비 타임아웃")
          reject(new Error("reCAPTCHA execute 함수 준비 타임아웃"))
        }
      }
      checkGrecaptcha()
    })
  }

  return new Promise((resolve, reject) => {
    // reCAPTCHA v3 표준 API만 사용
    if (!config.RECAPTCHA.SITE_KEY) {
      recaptchaState.error = "reCAPTCHA Site Key가 설정되지 않았습니다"
      recaptchaState.isLoading = false
      reject(new Error("reCAPTCHA Site Key가 설정되지 않았습니다"))
      return
    }

    // reCAPTCHA v3 표준 API 스크립트 URL (공식 문서에 따라)
    // https://www.google.com/recaptcha/api.js?render=SITE_KEY
    const scriptUrl = `https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA.SITE_KEY}`
    
    console.log('📝 [loadRecaptchaScript] 스크립트 URL:', scriptUrl)
    
    const script = document.createElement("script")
    script.src = scriptUrl
    script.async = true
    script.defer = true
    script.id = 'recaptcha-script' // 중복 로드 방지를 위한 ID 추가

    script.onload = () => {
      // grecaptcha 객체가 로드되고 execute 함수가 준비될 때까지 최대 5초 대기
      let attempts = 0
      const maxAttempts = 50 // 5초 (100ms * 50)
      
      const checkGrecaptcha = () => {
        const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha
        const hasExecute = hasGrecaptcha && typeof window.grecaptcha.execute === 'function'
        const hasReady = hasGrecaptcha && typeof window.grecaptcha.ready === 'function'
        
        console.log(`🔍 [loadRecaptchaScript] execute 함수 확인 시도 ${attempts + 1}/${maxAttempts}`, {
          hasGrecaptcha,
          hasExecute,
          hasReady
        })
        
        // window.grecaptcha가 존재하고 execute 함수가 있는지 확인
        if (hasGrecaptcha && hasExecute) {
          recaptchaState.isLoaded = true
          recaptchaState.isLoading = false
          recaptchaState.error = null
          console.log("✅ [loadRecaptchaScript] reCAPTCHA v3 스크립트 로드 성공 (execute 함수 확인됨)", {
            attempts: attempts + 1,
            hasGrecaptcha: true,
            hasExecute: true,
            hasReady
          })
          resolve()
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(checkGrecaptcha, 100)
        } else {
          recaptchaState.error = "reCAPTCHA grecaptcha 객체 또는 execute 함수 로드 실패"
          recaptchaState.isLoading = false
          const errorDetails = {
            hasGrecaptcha,
            hasExecute,
            hasReady,
            attempts: attempts + 1,
            siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set'
          }
          console.error("❌ [loadRecaptchaScript] reCAPTCHA grecaptcha 객체 또는 execute 함수 로드 실패", errorDetails)
          
          // 백엔드로 로그 전송
          (async () => {
            try {
              const { getApiBaseURL } = await import('@frontend/shared/config')
              const { API_ENDPOINTS } = await import('@frontend/shared/config')
              const apiBaseUrl = getApiBaseURL()
              await fetch(`${apiBaseUrl}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  level: 'error',
                  message: 'reCAPTCHA 스크립트 로드 실패',
                  data: errorDetails
                })
              }).catch(() => {})
            } catch {}
          })()
          
          reject(new Error("reCAPTCHA grecaptcha 객체 또는 execute 함수 로드 실패"))
        }
      }
      
      checkGrecaptcha()
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
  console.log(`🔄 [executeRecaptcha] 토큰 생성 시작 (action: ${action})`, {
    isDevelopment: config.RECAPTCHA.IS_DEVELOPMENT,
    isTestKey: config.RECAPTCHA.IS_TEST_KEY,
    siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set',
    recaptchaState: {
      isLoaded: recaptchaState.isLoaded,
      isLoading: recaptchaState.isLoading,
      error: recaptchaState.error
    }
  })
  
  try {
    // 개발 환경에서 더미 토큰 사용
    if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
      console.log("🔧 [executeRecaptcha] 개발 환경: 더미 reCAPTCHA 토큰 사용")
      const dummyToken = getDummyRecaptchaToken()
      console.log("✅ [executeRecaptcha] 더미 토큰 생성 완료:", dummyToken.substring(0, 20) + '...')
      return dummyToken
    }

    console.log("🔄 [executeRecaptcha] 스크립트 로드 시작...")
    await loadRecaptchaScript()
    console.log("✅ [executeRecaptcha] 스크립트 로드 완료")

    // execute 함수가 준비되었는지 확인
    const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha
    const hasExecute = hasGrecaptcha && typeof window.grecaptcha.execute === 'function'
    
    console.log("🔍 [executeRecaptcha] execute 함수 확인", {
      hasGrecaptcha,
      hasExecute,
      recaptchaState: {
        isLoaded: recaptchaState.isLoaded,
        isLoading: recaptchaState.isLoading,
        error: recaptchaState.error
      }
    })
    
    if (!hasGrecaptcha || !hasExecute) {
      const errorMsg = !hasGrecaptcha 
        ? "reCAPTCHA grecaptcha 객체가 준비되지 않았습니다."
        : "reCAPTCHA execute 함수가 준비되지 않았습니다."
      console.error(`❌ [executeRecaptcha] ${errorMsg}`, {
        hasGrecaptcha,
        hasExecute,
        recaptchaState
      })
      throw new Error(errorMsg)
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("reCAPTCHA 실행 시간 초과"))
      }, 10000) // 10초 타임아웃

      // reCAPTCHA v3 표준 API 사용 - ready() 없이 직접 execute 호출
      try {
        // execute 함수가 준비될 때까지 최대 2초 대기
        let attempts = 0
        const maxAttempts = 20 // 2초 (100ms * 20)
        
        const waitAndExecute = () => {
          const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha
          const hasExecute = hasGrecaptcha && typeof window.grecaptcha.execute === 'function'
          
          console.log(`🔍 [executeRecaptcha] execute 함수 준비 확인 시도 ${attempts + 1}/${maxAttempts}`, {
            hasGrecaptcha,
            hasExecute,
            action
          })
          
          if (hasGrecaptcha && hasExecute) {
            // execute 함수가 준비되었으면 바로 호출 (reCAPTCHA v3 표준 API)
            console.log(`🔄 [executeRecaptcha] execute 함수 호출 시작 (action: ${action})`, {
              siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set',
              action
            })
            window.grecaptcha.execute(
              config.RECAPTCHA.SITE_KEY,
              { action }
            ).then((token: string) => {
              clearTimeout(timeout)
              
              if (!token || token.length === 0) {
                console.error("❌ [executeRecaptcha] 토큰이 비어있음")
                throw new Error("reCAPTCHA 토큰이 생성되지 않았습니다.")
              }

              console.log(`✅ [executeRecaptcha] reCAPTCHA v3 토큰 생성 성공 (action: ${action})`, {
                tokenLength: token.length,
                tokenPreview: token.substring(0, 20) + '...'
              })
              resolve(token)
            }).catch((error: Error) => {
              clearTimeout(timeout)
              console.error("❌ [executeRecaptcha] execute 함수 호출 실패:", {
                error: error.message,
                errorStack: error.stack,
                action,
                siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set'
              })
              
              // 프론트엔드 로그를 백엔드로 전송
              (async () => {
                try {
                  const { getApiBaseURL } = await import('@frontend/shared/config')
                  const { API_ENDPOINTS } = await import('@frontend/shared/config')
                  const apiBaseUrl = getApiBaseURL()
                  await fetch(`${apiBaseUrl}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      level: 'error',
                      message: 'reCAPTCHA 실행 실패',
                      data: {
                        action,
                        error: error instanceof Error ? error.message : String(error),
                        siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set',
                      }
                    })
                  }).catch(() => {
                    // 로그 전송 실패는 무시
                  })
                } catch {
                  // 로그 전송 실패는 무시
                }
              })()
              
              reject(error)
            })
          } else if (attempts < maxAttempts) {
            attempts++
            setTimeout(waitAndExecute, 100)
          } else {
            clearTimeout(timeout)
            const error = new Error("reCAPTCHA execute 함수가 준비되지 않았습니다.")
            console.error("❌ [executeRecaptcha] execute 함수 준비 실패 (최대 시도 횟수 초과):", {
              attempts: attempts + 1,
              maxAttempts,
              hasGrecaptcha: typeof window !== 'undefined' && !!window.grecaptcha,
              hasExecute: typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.execute === 'function',
              recaptchaState,
              action
            })
            
            // 백엔드로 로그 전송
            (async () => {
              try {
                const { getApiBaseURL } = await import('@frontend/shared/config')
                const { API_ENDPOINTS } = await import('@frontend/shared/config')
                const apiBaseUrl = getApiBaseURL()
                await fetch(`${apiBaseUrl}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    level: 'error',
                    message: 'reCAPTCHA execute 함수 준비 실패',
                    data: {
                      action,
                      attempts: attempts + 1,
                      maxAttempts,
                      hasGrecaptcha: typeof window !== 'undefined' && !!window.grecaptcha,
                      hasExecute: typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.execute === 'function',
                      recaptchaState
                    }
                  })
                }).catch(() => {})
              } catch {}
            })()
            
            reject(error)
          }
        }
        
        waitAndExecute()
      } catch (error) {
        clearTimeout(timeout)
        console.error("❌ reCAPTCHA 실행 중 예외 발생:", error)
        reject(error)
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("❌ [executeRecaptcha] reCAPTCHA 실행 중 오류:", {
      error: errorMessage,
      errorStack: error instanceof Error ? error.stack : undefined,
      action,
      recaptchaState,
      siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set'
    })
    
    // 백엔드로 로그 전송
    (async () => {
      try {
        const { getApiBaseURL } = await import('@frontend/shared/config')
        const { API_ENDPOINTS } = await import('@frontend/shared/config')
        const apiBaseUrl = getApiBaseURL()
        await fetch(`${apiBaseUrl}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message: 'reCAPTCHA 실행 중 오류',
            data: {
              action,
              error: errorMessage,
              recaptchaState,
              siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set'
            }
          })
        }).catch(() => {})
      } catch {}
    })()
    
    throw new Error("reCAPTCHA 실행에 실패했습니다. 다시 시도해주세요.")
  }
}

// reCAPTCHA 위젯 렌더링 (v2용 - 필요시 사용)
const renderRecaptchaWidget = (
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
const getRecaptchaState = (): RecaptchaState => {
  return { ...recaptchaState }
}

// reCAPTCHA 초기화 (테스트용)
const resetRecaptchaState = (): void => {
  recaptchaState = {
    isLoaded: false,
    isLoading: false,
    error: null,
  }
}

// 환경별 reCAPTCHA 사용 가능 여부 확인
export const isRecaptchaAvailable = (): boolean => {
  const logData = {
    isDevelopment: config.RECAPTCHA.IS_DEVELOPMENT,
    isTestKey: config.RECAPTCHA.IS_TEST_KEY,
    siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set',
    recaptchaState: {
      isLoaded: recaptchaState.isLoaded,
      isLoading: recaptchaState.isLoading,
      error: recaptchaState.error
    },
    windowGrecaptcha: {
      exists: typeof window !== 'undefined' && !!window.grecaptcha,
      hasExecute: typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.execute === 'function',
      hasReady: typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.ready === 'function'
    }
  }
  
  console.log('🔍 [isRecaptchaAvailable] reCAPTCHA 사용 가능 여부 확인 시작', logData)
  
  // 프로덕션 환경에서도 백엔드로 로그 전송
  if (typeof window !== 'undefined' && !config.RECAPTCHA.IS_DEVELOPMENT) {
    (async () => {
      try {
        const { getApiBaseURL } = await import('@frontend/shared/config')
        const { API_ENDPOINTS } = await import('@frontend/shared/config')
        const apiBaseUrl = getApiBaseURL()
        await fetch(`${apiBaseUrl}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'info',
            message: '[isRecaptchaAvailable] 사용 가능 여부 확인',
            data: logData
          })
        }).catch(() => {})
      } catch {}
    })()
  }
  
  // 개발 환경에서는 항상 사용 가능
  if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
    console.log('✅ [isRecaptchaAvailable] 개발 환경: reCAPTCHA 사용 가능')
    return true
  }
  
  // execute 함수가 있는지 확인 (중요!)
  const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha
  const hasExecute = hasGrecaptcha && typeof window.grecaptcha.execute === 'function'
  const isAvailable = recaptchaState.isLoaded && hasGrecaptcha && hasExecute
  
  console.log('🔍 [isRecaptchaAvailable] 사용 가능 여부 확인 결과:', {
    isAvailable,
    isLoaded: recaptchaState.isLoaded,
    hasGrecaptcha,
    hasExecute,
    reason: !isAvailable 
      ? (!recaptchaState.isLoaded ? '스크립트 미로드' : !hasGrecaptcha ? 'grecaptcha 객체 없음' : !hasExecute ? 'execute 함수 없음' : '알 수 없음')
      : '사용 가능'
  })
  
  if (!isAvailable) {
    const warningData = {
      recaptchaState,
      grecaptcha: hasGrecaptcha ? 'exists' : 'not exists',
      execute: hasExecute ? 'exists' : 'not exists',
      reason: !recaptchaState.isLoaded ? '스크립트 미로드' : !hasGrecaptcha ? 'grecaptcha 객체 없음' : !hasExecute ? 'execute 함수 없음' : '알 수 없음'
    }
    console.warn('⚠️ [isRecaptchaAvailable] reCAPTCHA 사용 불가:', warningData)
    
    // 프로덕션 환경에서도 백엔드로 경고 로그 전송
    if (typeof window !== 'undefined' && !config.RECAPTCHA.IS_DEVELOPMENT) {
      (async () => {
        try {
          const { getApiBaseURL } = await import('@frontend/shared/config')
          const { API_ENDPOINTS } = await import('@frontend/shared/config')
          const apiBaseUrl = getApiBaseURL()
          await fetch(`${apiBaseUrl}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level: 'warn',
              message: '[isRecaptchaAvailable] reCAPTCHA 사용 불가',
              data: warningData
            })
          }).catch(() => {})
        } catch {}
      })()
    }
  }
  
  return isAvailable
}
