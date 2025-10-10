import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES, MENU_ITEMS } from '@frontend/shared/constants/routes'
import { useAuthContext } from '@frontend/shared/contexts/AuthContext'
import { useUserStore } from '@frontend/shared/store/userStore'
import Button from '@frontend/shared/components/Button'
import ErrorNavigation from './ErrorNavigation'
import ErrorAnalytics from './ErrorAnalytics'
import './EnhancedErrorPage.css'

// 에러 타입 정의
interface ErrorInfo {
  statusCode: number
  title: string
  message: string
  description: string
  icon: string
  color: string
  gradient: string
  suggestions: string[]
  actions: ErrorAction[]
  isRetryable: boolean
  isAuthRequired: boolean
  video?: string
}

interface ErrorAction {
  label: string
  action: () => void
  variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  icon?: string
}

interface EnhancedErrorPageProps {
  statusCode?: number
  title?: string
  message?: string
  description?: string
  suggestions?: string[]
  onRetry?: () => void
  showHomeButton?: boolean
  showRetryButton?: boolean
  customActions?: ErrorAction[]
}

export default function EnhancedErrorPage({
  statusCode = 404,
  title,
  message,
  description,
  suggestions,
  onRetry,
  showHomeButton = true,
  showRetryButton = false,
  customActions = [],
}: EnhancedErrorPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuthContext()
  const userStore = useUserStore()
  
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // URL 파라미터에서 에러 정보 추출
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlStatusCode = searchParams.get('code')
    const urlTitle = searchParams.get('title')
    const urlMessage = searchParams.get('message')
    const urlDescription = searchParams.get('description')

    const finalStatusCode = urlStatusCode ? parseInt(urlStatusCode, 10) : statusCode
    const finalTitle = urlTitle ? decodeURIComponent(urlTitle) : title
    const finalMessage = urlMessage ? decodeURIComponent(urlMessage) : message
    const finalDescription = urlDescription ? decodeURIComponent(urlDescription) : description

    setErrorInfo(getErrorInfo(finalStatusCode, finalTitle, finalMessage, finalDescription))
  }, [location, statusCode, title, message, description])

  // 에러 정보 생성 함수
  const getErrorInfo = useCallback((
    code: number,
    customTitle?: string,
    customMessage?: string,
    customDescription?: string
  ): ErrorInfo => {
    const baseErrorInfo = {
      statusCode: code,
      title: customTitle || '',
      message: customMessage || '',
      description: customDescription || '',
      icon: '',
      color: '',
      gradient: '',
      suggestions: [],
      actions: [],
      isRetryable: false,
      isAuthRequired: false,
    }

    switch (code) {
      case 400:
        return {
          ...baseErrorInfo,
          title: customTitle || '잘못된 요청',
          message: customMessage || '요청하신 정보가 올바르지 않습니다.',
          description: customDescription || '입력한 정보를 다시 확인해주세요.',
          icon: '⚠️',
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          suggestions: [
            '입력한 URL이나 파라미터를 확인해주세요',
            '브라우저 캐시를 삭제해보세요',
            '잠시 후 다시 시도해주세요',
          ],
          isRetryable: true,
        }

      case 401:
        return {
          ...baseErrorInfo,
          title: customTitle || '인증이 필요합니다',
          message: customMessage || '로그인이 필요한 서비스입니다.',
          description: customDescription || '로그인 후 다시 시도해주세요.',
          icon: '🔐',
          color: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          suggestions: [
            '로그인 페이지로 이동해주세요',
            '계정 정보를 확인해주세요',
            '비밀번호를 재설정해보세요',
          ],
          isAuthRequired: true,
        }

      case 403:
        return {
          ...baseErrorInfo,
          title: customTitle || '접근이 거부되었습니다',
          message: customMessage || '이 페이지에 접근할 권한이 없습니다.',
          description: customDescription || '관리자에게 문의하거나 다른 계정으로 로그인해보세요.',
          icon: '🚫',
          color: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          suggestions: [
            '계정 권한을 확인해주세요',
            '관리자에게 문의해주세요',
            '다른 계정으로 로그인해보세요',
          ],
          isAuthRequired: true,
        }

      case 404:
        return {
          ...baseErrorInfo,
          title: customTitle || '페이지를 찾을 수 없어요',
          message: customMessage || '요청하신 페이지가 존재하지 않습니다.',
          description: customDescription || '페이지가 이동되었거나 삭제되었을 수 있어요.',
          icon: '🔍',
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          suggestions: [
            'URL을 다시 확인해주세요',
            '홈페이지에서 원하는 페이지를 찾아보세요',
            '검색 기능을 이용해보세요',
          ],
          video: '/video/404Error.mp4',
        }

      case 500:
        return {
          ...baseErrorInfo,
          title: customTitle || '서버 오류가 발생했습니다',
          message: customMessage || '일시적인 서버 오류입니다.',
          description: customDescription || '잠시 후 다시 시도해주세요.',
          icon: '🖥️',
          color: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          suggestions: [
            '잠시 후 다시 시도해주세요',
            '브라우저를 새로고침해보세요',
            '문제가 지속되면 고객센터에 문의해주세요',
          ],
          isRetryable: true,
          video: '/video/500Error.mp4',
        }

      case 503:
        return {
          ...baseErrorInfo,
          title: customTitle || '서비스가 일시적으로 사용할 수 없습니다',
          message: customMessage || '서버 점검 중입니다.',
          description: customDescription || '점검이 완료되면 다시 이용하실 수 있습니다.',
          icon: '🔧',
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          suggestions: [
            '잠시 후 다시 시도해주세요',
            '공지사항을 확인해주세요',
            '점검 시간을 확인해주세요',
          ],
          isRetryable: true,
          video: '/video/503Error.mp4',
        }

      case 999:
        return {
          ...baseErrorInfo,
          title: customTitle || '현재 준비중에 있습니다',
          message: customMessage || '해당 기능은 현재 개발 중입니다.',
          description: customDescription || '조금만 기다려주세요! 곧 만나보실 수 있어요.',
          icon: '🚀',
          color: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          suggestions: [
            '다른 기능을 먼저 이용해보세요',
            '공지사항을 확인해주세요',
            '이메일 알림을 신청해보세요',
          ],
          video: '/video/loading.mp4',
        }

      default:
        return {
          ...baseErrorInfo,
          title: customTitle || '오류가 발생했습니다',
          message: customMessage || '예상치 못한 오류가 발생했습니다.',
          description: customDescription || '다시 시도해주세요.',
          icon: '❌',
          color: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          suggestions: [
            '페이지를 새로고침해보세요',
            '브라우저를 재시작해보세요',
            '문제가 지속되면 고객센터에 문의해주세요',
          ],
          isRetryable: true,
        }
    }
  }, [])

  // 액션 핸들러들
  const handleRetry = useCallback(async () => {
    if (!errorInfo?.isRetryable) return
    
    setIsRetrying(true)
    try {
      if (onRetry) {
        await onRetry()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      setIsRetrying(false)
    }
  }, [errorInfo?.isRetryable, onRetry])

  const handleHome = useCallback(() => {
    navigate(ROUTES.HOME, { replace: true })
  }, [navigate])

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(ROUTES.HOME)
    }
  }, [navigate])

  const handleLogin = useCallback(() => {
    navigate(ROUTES.LOGIN, { replace: true })
  }, [navigate])

  const handleContact = useCallback(() => {
    // 고객센터 연락처나 문의 페이지로 이동
    window.open('mailto:support@deukgeun.com', '_blank')
  }, [])

  // 기본 액션들 생성
  const getDefaultActions = useCallback((): ErrorAction[] => {
    const actions: ErrorAction[] = []

    if (errorInfo?.isRetryable && showRetryButton) {
      actions.push({
        label: '다시 시도',
        action: handleRetry,
        variant: 'primary',
        icon: '🔄',
      })
    }

    if (errorInfo?.isAuthRequired && !isAuthenticated) {
      actions.push({
        label: '로그인',
        action: handleLogin,
        variant: 'primary',
        icon: '🔐',
      })
    }

    actions.push({
      label: '이전 페이지',
      action: handleBack,
      variant: 'secondary',
      icon: '⬅️',
    })

    if (showHomeButton) {
      actions.push({
        label: '홈으로',
        action: handleHome,
        variant: 'success',
        icon: '🏠',
      })
    }

    actions.push({
      label: '고객센터',
      action: handleContact,
      variant: 'ghost',
      icon: '📞',
    })

    return actions
  }, [errorInfo, showRetryButton, showHomeButton, isAuthenticated, handleRetry, handleLogin, handleBack, handleHome, handleContact])

  // 최종 액션들 결정
  const finalActions = customActions.length > 0 ? customActions : getDefaultActions()

  if (!errorInfo) {
    return <div className="error-loading">에러 정보를 불러오는 중...</div>
  }

  return (
    <div className="enhanced-error-page">
      {/* 배경 애니메이션 */}
      <div className="error-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="error-container">
        {/* 메인 콘텐츠 */}
        <div className="error-content">
          {/* 아이콘 및 비디오 섹션 */}
          <div className="error-media">
            {errorInfo.video && (
              <div className="error-video-container">
                <video
                  src={errorInfo.video}
                  loop
                  autoPlay
                  muted
                  className="error-video"
                  onLoadedData={() => setIsVideoLoaded(true)}
                  onError={() => setIsVideoLoaded(false)}
                />
                {!isVideoLoaded && (
                  <div className="video-fallback">
                    <div className="fallback-icon">{errorInfo.icon}</div>
                  </div>
                )}
              </div>
            )}
            
            {!errorInfo.video && (
              <div className="error-icon-container">
                <div 
                  className="error-icon"
                  style={{ 
                    background: errorInfo.gradient,
                    color: 'white'
                  }}
                >
                  {errorInfo.icon}
                </div>
              </div>
            )}
          </div>

          {/* 에러 정보 */}
          <div className="error-info">
            <div className="error-header">
              <h1 
                className="error-title"
                style={{ 
                  background: errorInfo.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {errorInfo.title}
              </h1>
              <div className="error-code">오류 코드: {errorInfo.statusCode}</div>
            </div>

            <p className="error-message">{errorInfo.message}</p>
            <p className="error-description">{errorInfo.description}</p>

            {/* 액션 버튼들 */}
            <div className="error-actions">
              {finalActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="lg"
                  onClick={action.action}
                  disabled={isRetrying && action.label === '다시 시도'}
                  loading={isRetrying && action.label === '다시 시도'}
                  className="error-action-button"
                >
                  {action.icon && <span className="button-icon">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>

            {/* 제안사항 */}
            {errorInfo.suggestions.length > 0 && (
              <div className="error-suggestions">
                <button
                  className="suggestions-toggle"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  <span className="toggle-icon">
                    {showSuggestions ? '▼' : '▶'}
                  </span>
                  해결 방법 보기
                </button>
                
                {showSuggestions && (
                  <div className="suggestions-list">
                    {errorInfo.suggestions.map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <span className="suggestion-number">{index + 1}</span>
                        <span className="suggestion-text">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="error-footer">
          <div className="error-meta">
            <div className="meta-item">
              <span className="meta-label">발생 시간:</span>
              <span className="meta-value">{new Date().toLocaleString('ko-KR')}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">사용자:</span>
              <span className="meta-value">
                {isAuthenticated && user ? (user.nickname || user.username || user.email) : '비로그인'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">페이지:</span>
              <span className="meta-value">{location.pathname}</span>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div className="quick-links">
            <h4>빠른 링크</h4>
            <div className="links-grid">
              {MENU_ITEMS.slice(0, 4).map((item) => (
                <button
                  key={item.path}
                  className="quick-link"
                  onClick={() => navigate(item.path)}
                >
                  <span className="link-icon">{item.icon}</span>
                  <span className="link-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 향상된 네비게이션 */}
        <ErrorNavigation 
          currentErrorCode={errorInfo.statusCode}
          onNavigate={(path) => navigate(path, { replace: true })}
        />

        {/* 에러 분석 */}
        <ErrorAnalytics
          errorCode={errorInfo.statusCode}
          errorTitle={errorInfo.title}
          errorMessage={errorInfo.message}
        />
      </div>
    </div>
  )
}
