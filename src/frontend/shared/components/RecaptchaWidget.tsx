// ============================================================================
// reCAPTCHA 위젯 컴포넌트
// ============================================================================

import React, { useEffect, useRef } from "react"
import { frontendApiKeyConfig } from "../config/apiKeys.js"

interface RecaptchaWidgetProps {
  onTokenChange: (token: string | null) => void
  onLoad?: () => void
  theme?: "light" | "dark"
  size?: "normal" | "compact"
  className?: string
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      render: (container: string | HTMLElement, options: any) => number
      reset: (widgetId: number) => void
      getResponse: (widgetId: number) => string
    }
  }
}

export function RecaptchaWidget({
  onTokenChange,
  onLoad,
  theme = "light",
  size = "normal",
  className = "",
}: RecaptchaWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && widgetRef.current) {
        window.grecaptcha.ready(() => {
          if (widgetRef.current) {
            widgetIdRef.current = window.grecaptcha.render(widgetRef.current, {
              sitekey: frontendApiKeyConfig.recaptcha.siteKey,
              theme,
              size,
              callback: (token: string) => {
                onTokenChange(token)
              },
              "expired-callback": () => {
                onTokenChange(null)
              },
              "error-callback": () => {
                onTokenChange(null)
              },
            })

            onLoad?.()
          }
        })
      }
    }

    // reCAPTCHA 스크립트가 로드되었는지 확인
    if (window.grecaptcha) {
      loadRecaptcha()
    } else {
      // 스크립트가 로드되지 않았다면 잠시 후 다시 시도
      const timer = setTimeout(loadRecaptcha, 100)
      return () => clearTimeout(timer)
    }
  }, [onTokenChange, onLoad, theme, size])

  const resetRecaptcha = () => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current)
    }
  }

  // 외부에서 리셋할 수 있도록 ref 노출
  React.useImperativeHandle(
    React.forwardRef(() => null),
    () => ({
      reset: resetRecaptcha,
    })
  )

  return (
    <div
      ref={widgetRef}
      className={`recaptcha-widget ${className}`}
      data-sitekey={frontendApiKeyConfig.recaptcha.siteKey}
    />
  )
}
