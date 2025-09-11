import { config } from '../config'

// reCAPTCHA는 any 타입으로 처리 (v3/v2 호환성)

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
  console.log('🔍 [loadRecaptchaScript] 함수 시작')
  console.log('🔍 [loadRecaptchaScript] 현재 상태:', {
    recaptchaState,
    grecaptcha: !!(window as any).grecaptcha,
  })

  // 이미 로드된 경우
  if (recaptchaState.isLoaded && (window as any).grecaptcha) {
    console.log('✅ [loadRecaptchaScript] 이미 로드됨')
    return Promise.resolve()
  }

  // 로딩 중인 경우
  if (recaptchaState.isLoading) {
    console.log('⏳ [loadRecaptchaScript] 로딩 중...')
    return new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (recaptchaState.isLoaded) {
          console.log('✅ [loadRecaptchaScript] 로딩 완료')
          resolve()
        } else if (recaptchaState.error) {
          console.error(
            '❌ [loadRecaptchaScript] 로딩 실패:',
            recaptchaState.error
          )
          reject(new Error(recaptchaState.error))
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
    })
  }

  // 개발 환경에서 더미 토큰 사용
  const isDevEnvironment =
    import.meta.env.DEV ||
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '5173' ||
    config.RECAPTCHA.IS_DEVELOPMENT ||
    config.RECAPTCHA.IS_TEST_KEY

  console.log('🔍 [loadRecaptchaScript] 개발 환경 여부:', isDevEnvironment)

  if (isDevEnvironment) {
    console.log(
      '🔧 [loadRecaptchaScript] 개발 환경: reCAPTCHA 스크립트 로드 스킵'
    )
    recaptchaState.isLoaded = true
    return Promise.resolve()
  }

  if (typeof window === 'undefined') {
    console.log('🔍 [loadRecaptchaScript] window 객체 없음 (SSR)')
    return Promise.resolve()
  }

  console.log('🔄 [loadRecaptchaScript] 실제 스크립트 로드 시작')
  recaptchaState.isLoading = true
  recaptchaState.error = null

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA.SITE_KEY}`
    script.async = true
    script.defer = true

    console.log('🔍 [loadRecaptchaScript] 스크립트 URL:', script.src)

    script.onload = () => {
      recaptchaState.isLoaded = true
      recaptchaState.isLoading = false
      console.log('✅ [loadRecaptchaScript] reCAPTCHA 스크립트 로드 성공')
      resolve()
    }

    script.onerror = () => {
      recaptchaState.error = 'reCAPTCHA 스크립트 로드 실패'
      recaptchaState.isLoading = false
      console.error('❌ [loadRecaptchaScript] reCAPTCHA 스크립트 로드 실패')
      reject(new Error('reCAPTCHA 스크립트 로드 실패'))
    }

    document.head.appendChild(script)
    console.log('🔍 [loadRecaptchaScript] 스크립트 DOM에 추가됨')
  })
}

// reCAPTCHA 토큰 생성 (v3)
export const executeRecaptcha = async (
  action: string = 'login'
): Promise<string> => {
  console.log('🚀 [executeRecaptcha] 함수 시작, action:', action)

  try {
    // 개발 환경에서 더미 토큰 사용
    const isDevEnvironment =
      import.meta.env.DEV ||
      import.meta.env.MODE === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '5173' ||
      config.RECAPTCHA.IS_DEVELOPMENT ||
      config.RECAPTCHA.IS_TEST_KEY

    console.log('🔍 [executeRecaptcha] 개발 환경 여부:', isDevEnvironment)

    if (isDevEnvironment) {
      const dummyToken = getDummyRecaptchaToken()
      console.log(
        '🔧 [executeRecaptcha] 개발 환경: 더미 reCAPTCHA 토큰 사용:',
        dummyToken
      )
      return dummyToken
    }

    console.log('🔄 [executeRecaptcha] 스크립트 로드 시작')
    await loadRecaptchaScript()

    if (!(window as any).grecaptcha) {
      console.error('❌ [executeRecaptcha] grecaptcha 객체 없음')
      throw new Error('reCAPTCHA가 로드되지 않았습니다.')
    }

    console.log('🔄 [executeRecaptcha] 실제 reCAPTCHA 실행 시작')
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('❌ [executeRecaptcha] 타임아웃 발생')
        reject(new Error('reCAPTCHA 실행 시간 초과'))
      }, 10000) as any // 10초 타임아웃

      ;(window as any).grecaptcha.ready(() => {
        console.log('🔄 [executeRecaptcha] grecaptcha.ready 콜백 실행')
        try {
          ;(window as any).grecaptcha
            .execute(config.RECAPTCHA.SITE_KEY, { action })
            .then((token: string) => {
              clearTimeout(timeout)

              if (!token) {
                console.error('❌ [executeRecaptcha] 토큰이 비어있음')
                throw new Error('reCAPTCHA 토큰이 생성되지 않았습니다.')
              }

              console.log(
                '✅ [executeRecaptcha] reCAPTCHA 토큰 생성 성공:',
                token.substring(0, 20) + '...'
              )
              resolve(token)
            })
            .catch((error: any) => {
              clearTimeout(timeout)
              console.error('❌ [executeRecaptcha] reCAPTCHA 실행 실패:', error)
              reject(error)
            })
        } catch (error) {
          clearTimeout(timeout)
          console.error(
            '❌ [executeRecaptcha] reCAPTCHA 실행 중 예외 발생:',
            error
          )
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('❌ reCAPTCHA 실행 중 오류:', error)
    throw new Error('reCAPTCHA 실행에 실패했습니다. 다시 시도해주세요.')
  }
}

// reCAPTCHA 위젯 렌더링 (v2용 - 필요시 사용)
export const renderRecaptchaWidget = (
  container: string | HTMLElement,
  callback: (token: string) => void,
  options: any = {}
): number => {
  if (!(window as any).grecaptcha) {
    throw new Error('reCAPTCHA가 로드되지 않았습니다.')
  }

  const defaultOptions = {
    sitekey: config.RECAPTCHA.SITE_KEY,
    callback: callback,
    'expired-callback': () => console.log('reCAPTCHA expired'),
    'error-callback': () => console.log('reCAPTCHA error'),
    ...options,
  }

  return (window as any).grecaptcha.render(container, defaultOptions)
}

// 개발용 더미 토큰 생성
export const getDummyRecaptchaToken = (): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const token = `dummy-token-${timestamp}-${randomId}`
  console.log('🔧 [getDummyRecaptchaToken] 더미 토큰 생성:', token)
  return token
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
  console.log('🔍 [isRecaptchaAvailable] 함수 시작')

  try {
    console.log('🔍 [isRecaptchaAvailable] 환경 확인:', {
      DEV: import.meta.env.DEV,
      MODE: import.meta.env.MODE,
      IS_DEVELOPMENT: config.RECAPTCHA.IS_DEVELOPMENT,
      IS_TEST_KEY: config.RECAPTCHA.IS_TEST_KEY,
      hostname: window.location.hostname,
      port: window.location.port,
      config: config.RECAPTCHA,
    })

    // 개발 환경에서는 항상 사용 가능하도록 설정
    const isDevEnvironment =
      import.meta.env.DEV ||
      import.meta.env.MODE === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '5173' ||
      config.RECAPTCHA.IS_DEVELOPMENT ||
      config.RECAPTCHA.IS_TEST_KEY

    console.log('🔍 [isRecaptchaAvailable] 개발 환경 여부:', isDevEnvironment)

    if (isDevEnvironment) {
      console.log(
        '🔧 [isRecaptchaAvailable] 개발 환경 감지: reCAPTCHA 사용 가능'
      )
      return true
    }

    // 실제 reCAPTCHA가 로드되었는지 확인
    const isLoaded = recaptchaState.isLoaded && !!(window as any).grecaptcha
    console.log('🔍 [isRecaptchaAvailable] reCAPTCHA 상태:', {
      isLoaded,
      recaptchaState,
      grecaptcha: !!(window as any).grecaptcha,
      windowGrecaptcha: (window as any).grecaptcha,
    })

    // 개발 환경이 아니더라도 reCAPTCHA가 로드되지 않았으면 false 반환
    if (!isLoaded) {
      console.warn('⚠️ [isRecaptchaAvailable] reCAPTCHA가 로드되지 않음')
      return false
    }

    console.log('🔍 [isRecaptchaAvailable] 최종 결과:', isLoaded)
    return isLoaded
  } catch (error) {
    console.error('❌ [isRecaptchaAvailable] 오류 발생:', error)
    // 오류 발생 시 개발 환경이면 true, 아니면 false 반환
    const isDevEnvironment =
      import.meta.env.DEV ||
      import.meta.env.MODE === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '5173'

    console.log(
      '🔍 [isRecaptchaAvailable] 오류 발생 시 개발 환경 여부:',
      isDevEnvironment
    )
    return isDevEnvironment
  }
}

// executeRecaptchaV3 별칭 추가
export const executeRecaptchaV3 = executeRecaptcha
