import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa'
import { authApi } from '@features/auth/api/authApi'
import type { LoginRequest } from '../../../shared/types'
import { validation, showToast } from '@frontend/shared/lib'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'
import { RecaptchaWidget } from '@frontend/shared/components/RecaptchaWidget'
import { useAuthErrorHandler } from '@pages/Error'
import { logger } from '@frontend/shared/utils/logger'

import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    recaptcha?: string
  }>({})
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()
  const { login, isLoggedIn: isAuthenticated } = useAuthRedux()
  const { handleApiError, hasError, errorInfo, retry } = useAuthErrorHandler()

  // RedirectIfLoggedIn 컴포넌트에서 처리하므로 여기서는 제거

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: {
      email?: string
      password?: string
      recaptcha?: string
    } = {}

    if (!validation.required(email)) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!validation.email(email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.'
    }

    if (!validation.required(password)) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else if (!validation.password(password)) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.'
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = '보안 인증을 완료해주세요.'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    return isValid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const loginData: LoginRequest = {
        email: email.trim().toLowerCase(),
        password,
        recaptchaToken: recaptchaToken!,
      }

      logger.info('LOGIN_PAGE', '로그인 데이터 준비', { ...loginData, password: '***' })

      const response = await authApi.login(loginData)

      logger.info('LOGIN_PAGE', '로그인 API 응답', response)

      if (!response || !response.user) {
        logger.error('LOGIN_PAGE', '로그인 실패: 사용자 정보 없음')
        showToast('로그인에 실패했습니다.', 'error')
        setLoading(false)
        return
      }

      // AuthContext의 login 함수 사용 (Zustand + storage 모두 업데이트)
      logger.info('LOGIN_PAGE', 'AuthContext login 호출')

      // 백엔드 응답을 새로운 타입 시스템과 호환되도록 변환
      const userWithToken = {
        id: response.user.id,
        email: response.user.email,
        username: response.user.email, // username은 email과 동일하게 설정
        nickname: response.user.nickname,
        accessToken: response.accessToken,
        // 새로운 타입 시스템에서 요구하는 필드들에 기본값 설정
        role: 'user' as const,
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      logger.info('LOGIN_PAGE', '로그인 함수 호출 전', {
        userId: userWithToken.id,
        userEmail: userWithToken.email,
        hasToken: !!userWithToken.accessToken
      })
      
      login(userWithToken, response.accessToken)

      logger.info('LOGIN_PAGE', '로그인 성공!')
      showToast('로그인 성공!', 'success')

      // RedirectIfLoggedIn 컴포넌트가 자동으로 리다이렉트를 처리합니다
    } catch (error: unknown) {
      console.log('🧪 로그인 에러:', error)
      
      // 401 에러는 로그인 실패이므로 리다이렉트하지 않음
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any
        if (axiosError.response?.status === 401) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
          setLoading(false)
          return
        }
      }
      
      handleApiError(error as any)
      setError(errorInfo.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
      console.log('🧪 로그인 처리 완료')
    }
  }

  const handleRecaptchaChange = (token: string | null) => {
    // 개발 환경에서는 더미 토큰 사용
    const finalToken = import.meta.env.DEV
      ? 'dummy-token-for-development'
      : token

    console.log('🧪 reCAPTCHA 토큰 변경:', {
      originalToken: token,
      finalToken,
    })
    setRecaptchaToken(finalToken)
    // reCAPTCHA 완료 시 해당 에러 초기화
    if (finalToken && errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: undefined }))
    }
    setError('') // 전체 에러 메시지도 초기화
  }

  // 에러 상태 표시
  if (hasError) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loginBox}>
          <div style={{ textAlign: 'center', color: '#f1f3f5' }}>
            <h2>로그인 중 오류가 발생했습니다</h2>
            <p>{errorInfo.message}</p>
            <button
              onClick={retry}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '20px',
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 이미 로그인된 상태라면 RedirectIfLoggedIn이 처리하므로 여기서는 제거

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <button
          onClick={() => navigate('/')}
          className={styles.backButton}
          aria-label="뒤로 가기"
        >
          <FaArrowLeft />
        </button>

        <h1 className={styles.logo}>득근 득근</h1>

        <form
          onSubmit={e => {
            e.preventDefault()
            handleLogin(e)
          }}
        >
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }))
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !loading) {
                  e.preventDefault()
                  handleLogin(e)
                }
              }}
              placeholder="이메일"
              className={`${styles.input} ${
                errors.email ? styles.inputError : ''
              }`}
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className={styles.errorText}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }))
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !loading) {
                    e.preventDefault()
                    handleLogin(e)
                  }
                }}
                placeholder="비밀번호"
                className={`${styles.passwordInput} ${
                  errors.password ? styles.inputError : ''
                }`}
                autoComplete="current-password"
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className={styles.errorText}>
                {errors.password}
              </span>
            )}
          </div>

          <div className={styles.recaptchaContainer}>
            <RecaptchaWidget
              onChange={handleRecaptchaChange}
              className={styles.recaptchaWidget}
              aria-describedby={
                errors.recaptcha ? 'recaptcha-error' : undefined
              }
            />
            {errors.recaptcha && (
              <span id="recaptcha-error" className={styles.errorText}>
                {errors.recaptcha}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
            aria-describedby={loading ? 'loading-description' : undefined}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
          {loading && (
            <span id="loading-description" className="sr-only">
              로그인 처리 중입니다.
            </span>
          )}
        </form>

        <div className={styles.divider}>또는</div>

        <div className={styles.socialWrapper}>
          <button
            type="button"
            className={styles.kakaoBtn}
            disabled={loading}
            onClick={() => showToast('카카오 로그인은 준비 중입니다.', 'info')}
          >
            🟡 카카오로 로그인
          </button>
          <button
            type="button"
            className={styles.googleBtn}
            disabled={loading}
            onClick={() => showToast('Google 로그인은 준비 중입니다.', 'info')}
          >
            🔵 Google로 로그인
          </button>
        </div>

        <div className={styles.linkRow}>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className={styles.linkBtn}
            disabled={loading}
          >
            회원가입
          </button>
          <button
            type="button"
            onClick={() => navigate('/find-id')}
            className={styles.linkBtn}
            disabled={loading}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            onClick={() => navigate('/find-password')}
            className={styles.linkBtn}
            disabled={loading}
          >
            비밀번호 찾기
          </button>
        </div>

        <div className={styles.recaptcha}>
          <p className={styles.recaptchaText}>
            이 사이트는 reCAPTCHA 및 Google 개인정보처리방침과 서비스 약관의
            적용을 받습니다.
          </p>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  )
}
