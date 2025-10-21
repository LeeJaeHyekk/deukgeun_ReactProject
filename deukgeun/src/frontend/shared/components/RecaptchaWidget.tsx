import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { config } from '@frontend/shared/lib/recaptcha'

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void
  className?: string
  "aria-describedby"?: string
  onExpired?: () => void
  onError?: () => void
}

function RecaptchaWidget({
  onChange,
  className,
  "aria-describedby": ariaDescribedBy,
  onExpired,
  onError,
}: RecaptchaWidgetProps) {
  // 개발 환경에서는 더미 토큰 자동 생성
  React.useEffect(() => {
    if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
      console.log("🔧 개발 환경: 자동 더미 토큰 생성")
      onChange("dummy-token-for-development")
    }
  }, []) // onChange 의존성 제거

  // 개발 환경에서는 위젯을 숨김
  if (config.RECAPTCHA.IS_DEVELOPMENT || config.RECAPTCHA.IS_TEST_KEY) {
    return (
      <div className={className} style={{ display: "none" }}>
        <p style={{ fontSize: "12px", color: "#666" }}>
          개발 환경: reCAPTCHA 검증이 자동으로 처리됩니다.
        </p>
      </div>
    )
  }

  return (
    <ReCAPTCHA
      sitekey={config.RECAPTCHA.SITE_KEY}
      onChange={onChange}
      onExpired={onExpired}
      onError={onError}
      className={className}
      aria-describedby={ariaDescribedBy}
    />
  )
}

export { RecaptchaWidget }