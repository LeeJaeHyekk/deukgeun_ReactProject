import React, { useEffect, useRef } from 'react'
import { executeRecaptcha, loadRecaptchaScript } from '@frontend/shared/lib/recaptcha'
import { config } from '@frontend/shared/lib/recaptcha'
import { getApiBaseURL } from '@frontend/shared/config'

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void
  action?: string
  className?: string
  "aria-describedby"?: string
  onExpired?: () => void
  onError?: () => void
}

function RecaptchaWidget({
  onChange,
  action = 'login',
  className,
  "aria-describedby": ariaDescribedBy,
  onExpired,
  onError,
}: RecaptchaWidgetProps) {
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializingRef = useRef(false)

  // 페이지 로드 시 즉시 토큰 생성
  useEffect(() => {
    let isMounted = true

    const initializeRecaptcha = async () => {
      if (isInitializingRef.current) {
        console.log("⚠️ [RecaptchaWidget] 이미 초기화 중입니다")
        return
      }
      isInitializingRef.current = true

      const initLogData = { action, timestamp: new Date().toISOString() }
      console.log(`🔄 [RecaptchaWidget] 초기화 시작 (action: ${action})`, initLogData)
      
      // 프로덕션 환경에서도 백엔드로 로그 전송
      if (!config.RECAPTCHA.IS_DEVELOPMENT && !config.RECAPTCHA.IS_TEST_KEY) {
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
                message: '[RecaptchaWidget] 초기화 시작',
                data: initLogData
              })
            }).catch(() => {})
          } catch {}
        })()
      }

      try {
        // 개발 환경에서는 더미 토큰 자동 생성
        if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
          console.log("🔧 [RecaptchaWidget] 개발 환경: 자동 더미 토큰 생성")
          if (isMounted) {
            onChange("dummy-token-for-development")
          }
          isInitializingRef.current = false
          return
        }

        // 스크립트 로드 (강제로 로드 시도)
        console.log("🔄 [RecaptchaWidget] reCAPTCHA v3 스크립트 로드 시작...")
        try {
          await loadRecaptchaScript()
          console.log("✅ [RecaptchaWidget] reCAPTCHA v3 스크립트 로드 완료")
          
          // 스크립트 로드 후 execute 함수가 준비될 때까지 추가 대기 (reCAPTCHA v3 표준)
          // 공식 문서에 따르면 grecaptcha.ready()를 사용할 수도 있지만, execute 함수가 준비되면 바로 사용 가능
          let waitAttempts = 0
          const maxWaitAttempts = 50 // 5초 (100ms * 50) - 공식 문서 권장 대기 시간
          
          while (waitAttempts < maxWaitAttempts) {
            const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha
            const hasExecute = hasGrecaptcha && typeof window.grecaptcha.execute === 'function'
            
            console.log(`🔍 [RecaptchaWidget] execute 함수 준비 확인 시도 ${waitAttempts + 1}/${maxWaitAttempts}`, {
              hasGrecaptcha,
              hasExecute,
              action
            })
            
            if (hasGrecaptcha && hasExecute) {
              console.log(`✅ [RecaptchaWidget] execute 함수 준비 완료 (시도: ${waitAttempts + 1})`, {
                action,
                siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set'
              })
              break
            }
            
            await new Promise(resolve => setTimeout(resolve, 100))
            waitAttempts++
          }
          
          if (waitAttempts >= maxWaitAttempts) {
            const hasGrecaptcha = typeof window !== 'undefined' && !!window.grecaptcha
            const hasExecute = hasGrecaptcha && typeof window.grecaptcha.execute === 'function'
            console.warn("⚠️ [RecaptchaWidget] execute 함수 준비 대기 타임아웃", {
              hasGrecaptcha,
              hasExecute,
              action,
              siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set'
            })
            
            // 프로덕션 환경에서도 백엔드로 경고 로그 전송
            if (!config.RECAPTCHA.IS_DEVELOPMENT && !config.RECAPTCHA.IS_TEST_KEY) {
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
                      message: '[RecaptchaWidget] execute 함수 준비 대기 타임아웃',
                      data: {
                        hasGrecaptcha,
                        hasExecute,
                        action,
                        waitAttempts,
                        maxWaitAttempts,
                        siteKey: config.RECAPTCHA.SITE_KEY ? 'set' : 'not set'
                      }
                    })
                  }).catch(() => {})
                } catch {}
              })()
            }
          }
        } catch (loadError) {
          console.error("❌ [RecaptchaWidget] 스크립트 로드 실패:", loadError)
          throw loadError
        }
        
        // 프로덕션 환경에서도 백엔드로 성공 로그 전송
        if (!config.RECAPTCHA.IS_DEVELOPMENT && !config.RECAPTCHA.IS_TEST_KEY) {
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
                  message: '[RecaptchaWidget] 스크립트 로드 완료',
                  data: { action }
                })
              }).catch(() => {})
            } catch {}
          })()
        }

        // 즉시 토큰 생성
        console.log(`🔄 [RecaptchaWidget] reCAPTCHA v3 토큰 생성 시작 (action: ${action})...`)
        const token = await executeRecaptcha(action)
        const tokenInfo = {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...'
        }
        console.log(`✅ [RecaptchaWidget] reCAPTCHA v3 토큰 생성 완료 (action: ${action})`, tokenInfo)
        
        // 프로덕션 환경에서도 백엔드로 성공 로그 전송
        if (!config.RECAPTCHA.IS_DEVELOPMENT && !config.RECAPTCHA.IS_TEST_KEY) {
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
                  message: '[RecaptchaWidget] 토큰 생성 완료',
                  data: { action, ...tokenInfo }
                })
              }).catch(() => {})
            } catch {}
          })()
        }

        if (isMounted && token) {
          onChange(token)
          console.log(`✅ [RecaptchaWidget] onChange 호출 완료 (action: ${action})`)
        } else {
          console.warn(`⚠️ [RecaptchaWidget] onChange 호출 안 함 (isMounted: ${isMounted}, hasToken: ${!!token})`)
        }
      } catch (error) {
        console.error("❌ [RecaptchaWidget] reCAPTCHA 초기화 실패:", {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          action,
          recaptchaState: {
            isLoaded: typeof window !== 'undefined' && window.grecaptcha ? 'exists' : 'not exists',
            hasExecute: typeof window !== 'undefined' && window.grecaptcha && typeof window.grecaptcha.execute === 'function'
          }
        })
        
        // 프론트엔드 로그를 백엔드로 전송
        try {
          const { API_ENDPOINTS } = await import('@frontend/shared/config')
          const apiBaseUrl = getApiBaseURL()
          await fetch(`${apiBaseUrl}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level: 'error',
              message: 'reCAPTCHA 초기화 실패',
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

        if (isMounted) {
          onChange(null)
          onError?.()
        }
      } finally {
        isInitializingRef.current = false
      }
    }

    initializeRecaptcha()

    // 2분마다 토큰 자동 갱신 (120초 = 120000ms)
    const startTokenRefresh = () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current)
      }

      tokenRefreshIntervalRef.current = setInterval(async () => {
        try {
          // 개발 환경에서는 스킵
          if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
            return
          }

          console.log(`🔄 reCAPTCHA v3 토큰 자동 갱신 시작 (action: ${action})...`)
          const token = await executeRecaptcha(action)
          console.log(`✅ reCAPTCHA v3 토큰 자동 갱신 완료 (action: ${action})`)

          if (isMounted && token) {
            onChange(token)
          }
        } catch (error) {
          console.error("❌ reCAPTCHA 토큰 갱신 실패:", error)
          
          // 프론트엔드 로그를 백엔드로 전송
          try {
            const { getApiBaseURL } = await import('@frontend/shared/config')
            const { API_ENDPOINTS } = await import('@frontend/shared/config')
            const apiBaseUrl = getApiBaseURL()
            await fetch(`${apiBaseUrl}${API_ENDPOINTS.RECAPTCHA.LOG}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                level: 'error',
                message: 'reCAPTCHA 토큰 갱신 실패',
                data: {
                  action,
                  error: error instanceof Error ? error.message : String(error),
                }
              })
            }).catch(() => {
              // 로그 전송 실패는 무시
            })
          } catch {
            // 로그 전송 실패는 무시
          }

          if (isMounted) {
            onError?.()
          }
        }
      }, 120000) // 2분마다 갱신
    }

    // 초기 토큰 생성 후 갱신 시작
    setTimeout(startTokenRefresh, 2000) // 2초 후 시작

    return () => {
      isMounted = false
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current)
      }
    }
  }, [action, onChange, onError])

  // 개발 환경에서는 위젯을 숨김 (v3는 보이지 않는 위젯)
  if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
    return (
      <div className={className} style={{ display: "none" }}>
        <p style={{ fontSize: "12px", color: "#666" }}>
          개발 환경: reCAPTCHA 검증이 자동으로 처리됩니다.
        </p>
      </div>
    )
  }

  // v3는 보이지 않는 위젯이므로 빈 div 반환
  // 실제 토큰 생성은 useEffect에서 자동으로 처리됨
  return (
    <div className={className} style={{ display: "none" }}>
      <p style={{ fontSize: "12px", color: "#666" }}>
        reCAPTCHA v3가 활성화되어 있습니다. 토큰은 자동으로 생성됩니다.
      </p>
    </div>
  )
}

export { RecaptchaWidget }
