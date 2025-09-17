import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { config } from '@shared/config'

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void
  className?: string
  'aria-describedby'?: string
  onExpired?: () => void
  onError?: () => void
}

function RecaptchaWidget({
  onChange,
  className,
  'aria-describedby': ariaDescribedBy,
  onExpired,
  onError,
}: RecaptchaWidgetProps) {
  // 더미 토큰 사용 조건 확인
  const shouldUseDummyToken =
    config.RECAPTCHA.IS_DEVELOPMENT ||
    config.RECAPTCHA.IS_TEST_KEY ||
    !config.RECAPTCHA.SITE_KEY ||
    config.RECAPTCHA.SITE_KEY === 'your_recaptcha_site_key_here' ||
    config.RECAPTCHA.SITE_KEY === 'your_production_recaptcha_site_key' ||
    config.RECAPTCHA.SITE_KEY === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Google 테스트 키

  // 더미 토큰 사용 시 자동 생성
  React.useEffect(() => {
    if (shouldUseDummyToken) {
      console.log('🔧 더미 토큰 환경: 자동 더미 토큰 생성')
      onChange('dummy-token-for-development')
    }
  }, [shouldUseDummyToken, onChange])

  // 더미 토큰 사용 시 위젯을 숨김
  if (shouldUseDummyToken) {
    return (
      <div className={className} style={{ display: 'none' }}>
        <p style={{ fontSize: '12px', color: '#666' }}>
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
export default RecaptchaWidget
