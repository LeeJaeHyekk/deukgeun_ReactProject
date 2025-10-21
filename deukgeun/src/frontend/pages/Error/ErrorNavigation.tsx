import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES, MENU_ITEMS } from '@frontend/shared/constants/routes'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'
import Button from '@frontend/shared/components/Button'
import './ErrorNavigation.css'

interface ErrorNavigationProps {
  currentErrorCode?: number
  onNavigate?: (path: string) => void
}

export default function ErrorNavigation({ 
  currentErrorCode, 
  onNavigate 
}: ErrorNavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn: isAuthenticated, user } = useAuthRedux()

  // 사용자 인증 상태에 따라 접근 가능한 메뉴 아이템 필터링
  const getAccessibleMenuItems = () => {
    return MENU_ITEMS.filter(item => {
      if (item.requiresAuth && !isAuthenticated) {
        return false
      }
      return true
    })
  }

  // 에러 코드별 추천 페이지
  const getRecommendedPages = () => {
    const accessibleItems = getAccessibleMenuItems()
    
    switch (currentErrorCode) {
      case 401:
      case 403: {
        // 인증 관련 에러의 경우 로그인 페이지와 홈 페이지 추가
        const authPages = [
          { label: '로그인', path: ROUTES.LOGIN, icon: '🔐', description: '로그인 페이지로 이동' },
          { label: '홈', path: ROUTES.HOME, icon: '🏠', description: '홈페이지로 이동' },
          ...accessibleItems.slice(0, 2)
        ]
        return authPages
      }
      case 404:
        return accessibleItems.slice(0, 4) // 홈, 커뮤니티, 기구가이드, 헬스장찾기
      case 500:
      case 503:
        // 서버 에러의 경우 안정적인 페이지들만 추천
        return accessibleItems.filter(item => 
          item.path === ROUTES.COMMUNITY || item.path === ROUTES.MACHINE_GUIDE
        ).slice(0, 3)
      default:
        return accessibleItems.slice(0, 4)
    }
  }

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      navigate(path, { replace: true })
    }
  }

  const recommendedPages = getRecommendedPages()

  return (
    <div className="error-navigation">
      <div className="navigation-header">
        <h3>추천 페이지</h3>
        <p>다음 페이지들을 이용해보세요</p>
      </div>

      <div className="navigation-grid">
        {recommendedPages.map((item) => (
          <div key={item.path} className="nav-card">
            <div className="nav-card-icon">{item.icon}</div>
            <div className="nav-card-content">
              <h4 className="nav-card-title">{item.label}</h4>
              <p className="nav-card-description">{item.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item.path)}
              className="nav-card-button"
            >
              이동하기
            </Button>
          </div>
        ))}
      </div>

      {/* 추가 액션들 */}
      <div className="navigation-actions">
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleNavigation(ROUTES.HOME)}
          className="action-button"
        >
          🏠 홈으로 돌아가기
        </Button>
        
        {!isAuthenticated && (
          <Button
            variant="primary"
            size="md"
            onClick={() => handleNavigation(ROUTES.LOGIN)}
            className="action-button"
          >
            🔐 로그인하기
          </Button>
        )}

        <Button
          variant="ghost"
          size="md"
          onClick={() => window.history.back()}
          className="action-button"
        >
          ⬅️ 이전 페이지
        </Button>
      </div>

      {/* 사용자 상태 정보 */}
      <div className="user-status">
        <div className="status-item">
          <span className="status-label">현재 상태:</span>
          <span className="status-value">
            {isAuthenticated && user ? `로그인됨 (${user.nickname || user.username || user.email})` : '비로그인'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">현재 페이지:</span>
          <span className="status-value">{location.pathname}</span>
        </div>
      </div>
    </div>
  )
}
