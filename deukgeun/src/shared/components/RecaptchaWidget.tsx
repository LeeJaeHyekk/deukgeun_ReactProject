import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { config } from '../lib'

interface RecaptchaWidgetProps {
  onVerify: (token: string | null) => void
  onChange?: (token: string | null) => void
  className?: string
}

export function RecaptchaWidget({ onVerify, onChange, className }: RecaptchaWidgetProps) {
  const handleChange = (token: string | null) => {
    onVerify(token)
    onChange?.(token)
  }

  return (
    <div className={className}>
      <ReCAPTCHA
        sitekey={config.RECAPTCHA_SITE_KEY}
        onChange={handleChange}
        theme="light"
      />
    </div>
  )
}
