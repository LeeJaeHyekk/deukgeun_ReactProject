import React, { useEffect, useState } from 'react'

interface RecaptchaEnterpriseButtonProps {
  action: string
  onSuccess: (token: string) => void
  onError: (error: any) => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
}

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void
        execute: (siteKey: string, options: { action: string }) => Promise<string>
      }
    }
  }
}

export const RecaptchaEnterpriseButton: React.FC<RecaptchaEnterpriseButtonProps> = ({
  action,
  onSuccess,
  onError,
  children,
  className = '',
  disabled = false,
  loading = false
}) => {
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.enterprise) {
        window.grecaptcha.enterprise.ready(() => {
          console.log('reCAPTCHA Enterprise 로드됨')
          setIsRecaptchaLoaded(true)
        })
      } else {
        console.warn('reCAPTCHA Enterprise가 로드되지 않았습니다.')
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadRecaptcha)
    } else {
      loadRecaptcha()
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', loadRecaptcha)
    }
  }, [])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (disabled || loading || isExecuting) {
      return
    }

    if (!isRecaptchaLoaded) {
      onError(new Error('reCAPTCHA Enterprise가 아직 로드되지 않았습니다.'))
      return
    }

    try {
      setIsExecuting(true)

      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
      if (!siteKey) {
        throw new Error('reCAPTCHA 사이트 키가 설정되지 않았습니다.')
      }

      const token = await window.grecaptcha.enterprise.execute(siteKey, { action })
      
      if (!token) {
        throw new Error('reCAPTCHA 토큰 생성에 실패했습니다.')
      }

      onSuccess(token)
    } catch (error) {
      console.error('reCAPTCHA Enterprise 실행 오류:', error)
      onError(error)
    } finally {
      setIsExecuting(false)
    }
  }

  const isDisabled = disabled || loading || isExecuting || !isRecaptchaLoaded

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`recaptcha-enterprise-button ${className} ${
        isDisabled ? 'disabled' : ''
      } ${isExecuting ? 'executing' : ''}`}
      data-testid="recaptcha-enterprise-button"
    >
      {isExecuting ? (
        <span className="loading-spinner">🔄</span>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * reCAPTCHA Enterprise 훅
 * 컴포넌트에서 쉽게 사용할 수 있는 훅
 */
export const useRecaptchaEnterprise = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.enterprise) {
        window.grecaptcha.enterprise.ready(() => {
          setIsLoaded(true)
          setIsLoading(false)
        })
      } else {
        setIsLoading(false)
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkRecaptcha)
    } else {
      checkRecaptcha()
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', checkRecaptcha)
    }
  }, [])

  const executeRecaptcha = async (action: string): Promise<string> => {
    if (!isLoaded) {
      throw new Error('reCAPTCHA Enterprise가 로드되지 않았습니다.')
    }

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    if (!siteKey) {
      throw new Error('reCAPTCHA 사이트 키가 설정되지 않았습니다.')
    }

    return await window.grecaptcha.enterprise.execute(siteKey, { action })
  }

  return {
    isLoaded,
    isLoading,
    executeRecaptcha
  }
}

/**
 * reCAPTCHA Enterprise 스크립트 로더
 * HTML head에 reCAPTCHA Enterprise 스크립트를 동적으로 추가
 */
export const RecaptchaEnterpriseScript: React.FC = () => {
  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    if (!siteKey) {
      console.error('reCAPTCHA 사이트 키가 설정되지 않았습니다.')
      return
    }

    // 이미 스크립트가 로드되었는지 확인
    if (document.querySelector('script[src*="recaptcha/enterprise.js"]')) {
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log('reCAPTCHA Enterprise 스크립트 로드 완료')
    }

    script.onerror = () => {
      console.error('reCAPTCHA Enterprise 스크립트 로드 실패')
    }

    document.head.appendChild(script)

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 컴포넌트에서 사용할 수 있음)
    }
  }, [])

  return null
}
