import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'
import './ErrorAnalytics.css'

interface ErrorAnalyticsProps {
  errorCode: number
  errorTitle: string
  errorMessage: string
  onAnalyticsReady?: (analytics: ErrorAnalyticsData) => void
}

interface ErrorAnalyticsData {
  commonCauses: string[]
  solutions: string[]
  preventionTips: string[]
  relatedErrors: number[]
  userBehavior: {
    isLoggedIn: boolean
    userLevel?: string
    commonPages: string[]
  }
}

export default function ErrorAnalytics({ 
  errorCode, 
  errorTitle, 
  errorMessage,
  onAnalyticsReady 
}: ErrorAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ErrorAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  
  const location = useLocation()
  const { isLoggedIn: isAuthenticated, user } = useAuthRedux()

  useEffect(() => {
    const generateAnalytics = async () => {
      setIsLoading(true)
      
      // 에러 분석 데이터 생성
      const analyticsData = await analyzeError(errorCode, errorTitle, errorMessage)
      setAnalytics(analyticsData)
      
      if (onAnalyticsReady) {
        onAnalyticsReady(analyticsData)
      }
      
      setIsLoading(false)
    }

    generateAnalytics()
  }, [errorCode, errorTitle, errorMessage, onAnalyticsReady])

  const analyzeError = async (
    code: number, 
    title: string, 
    message: string
  ): Promise<ErrorAnalyticsData> => {
    // 실제 환경에서는 서버에서 에러 분석 데이터를 가져올 수 있음
    // 여기서는 클라이언트 사이드에서 기본 분석을 수행
    
    const commonCauses = getCommonCauses(code)
    const solutions = getSolutions(code)
    const preventionTips = getPreventionTips(code)
    const relatedErrors = getRelatedErrors(code)
    
    return {
      commonCauses,
      solutions,
      preventionTips,
      relatedErrors,
      userBehavior: {
        isLoggedIn: isAuthenticated,
        userLevel: user?.role,
        commonPages: getCommonPages(code),
      }
    }
  }

  const getCommonCauses = (code: number): string[] => {
    switch (code) {
      case 400:
        return [
          '잘못된 URL 형식',
          '필수 파라미터 누락',
          '잘못된 데이터 형식',
          '브라우저 캐시 문제'
        ]
      case 401:
        return [
          '세션 만료',
          '로그인 정보 오류',
          '토큰 만료',
          '권한 부족'
        ]
      case 403:
        return [
          '계정 권한 부족',
          '관리자 전용 페이지',
          '지역 제한',
          'IP 차단'
        ]
      case 404:
        return [
          '페이지 이동 또는 삭제',
          '잘못된 URL',
          '링크 오류',
          '서버 설정 문제'
        ]
      case 500:
        return [
          '서버 내부 오류',
          '데이터베이스 연결 문제',
          '메모리 부족',
          '코드 오류'
        ]
      case 503:
        return [
          '서버 점검',
          '과부하',
          '네트워크 문제',
          '서비스 일시 중단'
        ]
      default:
        return ['알 수 없는 원인']
    }
  }

  const getSolutions = (code: number): string[] => {
    switch (code) {
      case 400:
        return [
          'URL을 다시 확인해주세요',
          '브라우저 캐시를 삭제해주세요',
          '입력한 정보를 검토해주세요',
          '페이지를 새로고침해주세요'
        ]
      case 401:
        return [
          '다시 로그인해주세요',
          '계정 정보를 확인해주세요',
          '비밀번호를 재설정해주세요',
          '고객센터에 문의해주세요'
        ]
      case 403:
        return [
          '계정 권한을 확인해주세요',
          '관리자에게 문의해주세요',
          '다른 계정으로 로그인해보세요',
          '권한 요청을 해주세요'
        ]
      case 404:
        return [
          '홈페이지에서 원하는 페이지를 찾아보세요',
          '검색 기능을 이용해보세요',
          '사이트맵을 확인해보세요',
          'URL을 다시 입력해보세요'
        ]
      case 500:
        return [
          '잠시 후 다시 시도해주세요',
          '브라우저를 새로고침해주세요',
          '다른 브라우저를 사용해보세요',
          '고객센터에 문의해주세요'
        ]
      case 503:
        return [
          '잠시 후 다시 시도해주세요',
          '공지사항을 확인해주세요',
          '점검 시간을 확인해주세요',
          '대체 서비스를 이용해보세요'
        ]
      default:
        return ['페이지를 새로고침해주세요']
    }
  }

  const getPreventionTips = (code: number): string[] => {
    switch (code) {
      case 400:
        return [
          'URL을 정확히 입력해주세요',
          '정기적으로 브라우저 캐시를 삭제해주세요',
          '최신 브라우저를 사용해주세요'
        ]
      case 401:
        return [
          '정기적으로 로그인 상태를 확인해주세요',
          '안전한 비밀번호를 사용해주세요',
          '로그아웃 후 다시 로그인해주세요'
        ]
      case 403:
        return [
          '계정 권한을 정기적으로 확인해주세요',
          '관리자에게 권한 요청을 해주세요'
        ]
      case 404:
        return [
          '북마크를 정기적으로 업데이트해주세요',
          '사이트맵을 활용해주세요'
        ]
      case 500:
        return [
          '정기적으로 브라우저를 업데이트해주세요',
          '안정적인 네트워크를 사용해주세요'
        ]
      case 503:
        return [
          '공지사항을 정기적으로 확인해주세요',
          '대체 서비스를 미리 알아두세요'
        ]
      default:
        return ['정기적으로 시스템을 점검해주세요']
    }
  }

  const getRelatedErrors = (code: number): number[] => {
    switch (code) {
      case 400:
        return [422, 413, 414]
      case 401:
        return [403, 407]
      case 403:
        return [401, 451]
      case 404:
        return [410, 405]
      case 500:
        return [502, 503, 504]
      case 503:
        return [500, 502, 504]
      default:
        return []
    }
  }

  const getCommonPages = (code: number): string[] => {
    // 에러 코드별로 자주 발생하는 페이지들
    switch (code) {
      case 404:
        return ['/community', '/machine-guide', '/gym-finder']
      case 401:
        return ['/my-page', '/workout', '/admin']
      case 403:
        return ['/admin', '/admin/dashboard']
      default:
        return ['/']
    }
  }

  if (isLoading) {
    return (
      <div className="error-analytics">
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>에러 분석 중...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="error-analytics">
      <div className="analytics-header">
        <h3>에러 분석</h3>
        <button
          className="toggle-details"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '숨기기' : '자세히 보기'}
        </button>
      </div>

      <div className="analytics-summary">
        <div className="summary-item">
          <span className="summary-label">사용자 상태:</span>
          <span className="summary-value">
            {analytics.userBehavior.isLoggedIn ? '로그인됨' : '비로그인'}
            {analytics.userBehavior.userLevel && ` (${analytics.userBehavior.userLevel})`}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">현재 페이지:</span>
          <span className="summary-value">{location.pathname}</span>
        </div>
      </div>

      {showDetails && (
        <div className="analytics-details">
          <div className="detail-section">
            <h4>일반적인 원인</h4>
            <ul className="detail-list">
              {analytics.commonCauses.map((cause, index) => (
                <li key={index} className="detail-item">
                  <span className="item-icon">🔍</span>
                  <span className="item-text">{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h4>해결 방법</h4>
            <ul className="detail-list">
              {analytics.solutions.map((solution, index) => (
                <li key={index} className="detail-item">
                  <span className="item-icon">✅</span>
                  <span className="item-text">{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h4>예방 팁</h4>
            <ul className="detail-list">
              {analytics.preventionTips.map((tip, index) => (
                <li key={index} className="detail-item">
                  <span className="item-icon">💡</span>
                  <span className="item-text">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {analytics.relatedErrors.length > 0 && (
            <div className="detail-section">
              <h4>관련 에러 코드</h4>
              <div className="related-errors">
                {analytics.relatedErrors.map((errorCode) => (
                  <span key={errorCode} className="error-code-badge">
                    {errorCode}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
