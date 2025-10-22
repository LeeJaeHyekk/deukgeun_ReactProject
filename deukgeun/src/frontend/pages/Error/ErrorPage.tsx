import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import ErrorPageCSS from "./ErrorPage.module.css"
import EnhancedErrorPage from "@frontend/pages/Error/EnhancedErrorPage"
import { ErrorHandler } from "@frontend/pages/Error/ErrorHandler"

interface ErrorPageProps {
  statusCode?: number
  title?: string
  message?: string
  showHomeButton?: boolean
  showRetryButton?: boolean
  onRetry?: () => void
}

export default function ErrorPage({
  statusCode = 404,
  title,
  message,
  showHomeButton = true,
}: ErrorPageProps) {
  // React Hooks를 컴포넌트 최상위에서 호출
  const navigate = useNavigate()
  const location = useLocation()
  
  // 새로운 Enhanced Error Page 사용
  const [useEnhanced, setUseEnhanced] = useState(true)
  
  // URL 파라미터에서 enhanced 모드 확인
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const enhanced = searchParams.get('enhanced')
    setUseEnhanced(enhanced !== 'false')
  }, [])

  // Enhanced Error Page 사용
  if (useEnhanced) {
    return (
      <EnhancedErrorPage
        statusCode={statusCode}
        title={title}
        message={message}
        showHomeButton={showHomeButton}
      />
    )
  }
  
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [errorStatusCode, setErrorStatusCode] = useState(statusCode)
  const [errorTitle, setErrorTitle] = useState(title)
  const [errorMessage, setErrorMessage] = useState(message)

  // URL 파라미터에서 에러 정보 추출
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlStatusCode = searchParams.get("code")
    const urlTitle = searchParams.get("title")
    const urlMessage = searchParams.get("message")

    if (urlStatusCode) {
      setErrorStatusCode(parseInt(urlStatusCode, 10))
    }
    if (urlTitle) {
      setErrorTitle(decodeURIComponent(urlTitle))
    }
    if (urlMessage) {
      setErrorMessage(decodeURIComponent(urlMessage))
    }
  }, [location])

  // 에러 정보 결정
  const getErrorInfo = () => {
    switch (errorStatusCode) {
      case 400:
        return {
          title: errorTitle || "잘못된 요청",
          message:
            errorMessage ||
            "요청하신 정보가 올바르지 않습니다. 다시 확인해주세요.",
          video: "/video/400Error.mp4",
          color: "#f59e0b",
          gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        }
      case 401:
        return {
          title: errorTitle || "인증이 필요합니다",
          message:
            errorMessage ||
            "로그인이 필요한 서비스입니다. 로그인 후 다시 시도해주세요.",
          video: "/video/401Error.mp4",
          color: "#3b82f6",
          gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        }
      case 403:
        return {
          title: errorTitle || "접근이 거부되었습니다",
          message: errorMessage || "이 페이지에 접근할 권한이 없습니다.",
          video: "/video/403Error.mp4",
          color: "#ef4444",
          gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        }
      case 404:
        return {
          title: errorTitle || "페이지를 찾을 수 없어요",
          message:
            errorMessage ||
            "요청하신 페이지가 존재하지 않거나, 이동되었을 수 있어요.",
          video: "/video/404Error.mp4",
          color: "#f59e0b",
          gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        }
      case 500:
        return {
          title: errorTitle || "서버 오류가 발생했습니다",
          message:
            errorMessage ||
            "일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.",
          video: "/video/500Error.mp4",
          color: "#ef4444",
          gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        }
      case 503:
        return {
          title: errorTitle || "서비스가 일시적으로 사용할 수 없습니다",
          message:
            errorMessage || "서버 점검 중입니다. 잠시 후 다시 시도해주세요.",
          video: "/video/503Error.mp4",
          color: "#f59e0b",
          gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        }
      case 999:
        return {
          title: errorTitle || "현재 준비중에 있습니다",
          message:
            errorMessage ||
            "해당 기능은 현재 개발 중입니다. 조금만 기다려주세요!",
          video: "/video/loading.mp4",
          color: "#8b5cf6",
          gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
          isComingSoon: true,
        }
      default:
        return {
          title: errorTitle || "오류가 발생했습니다",
          message:
            errorMessage ||
            "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
          video: "/video/404Error.mp4",
          color: "#ef4444",
          gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        }
    }
  }

  const errorInfo = getErrorInfo()

  const handleHomeClick = () => {
    navigate("/", { replace: true })
  }

  const handleBackClick = () => {
    navigate(-1)
  }

  return (
    <div style={styles.container}>
      {/* 배경 애니메이션 요소들 */}
      <div style={styles.backgroundElements}>
        <div style={styles.floatingCircle1}></div>
        <div style={styles.floatingCircle2}></div>
        <div style={styles.floatingCircle3}></div>
      </div>

      <div style={styles.content}>
        {/* 에러 아이콘 및 비디오 섹션 */}
        <div style={styles.mediaContainer}>
          {errorInfo.isComingSoon && (
            <div style={styles.comingSoonBadge}>
              <span style={styles.comingSoonText}>COMING SOON</span>
            </div>
          )}

          <div style={styles.videoContainer}>
            <video
              src={errorInfo.video}
              loop
              autoPlay
              muted
              style={styles.video}
              onLoadedData={() => setIsVideoLoaded(true)}
              onError={() => setIsVideoLoaded(false)}
            />
            {!isVideoLoaded && (
              <div style={styles.videoFallback}>
                <div style={styles.fallbackIcon}>🎬</div>
              </div>
            )}
          </div>
        </div>

        {/* 에러 정보 */}
        <div style={styles.errorInfo}>
          <div style={styles.titleContainer}>
            <h1
              style={{
                ...styles.title,
                background: errorInfo.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {errorInfo.title}
            </h1>
            {errorInfo.isComingSoon && (
              <div style={styles.statusIndicator}>
                <div style={styles.statusDot}></div>
                <span style={styles.statusText}>개발 진행중</span>
              </div>
            )}
          </div>


          {/* 액션 버튼들 */}
          <div style={styles.buttonContainer}>
            <button
              onClick={handleBackClick}
              style={styles.backButton}
              className="backButton"
            >
              ⬅️ 이전 페이지로
            </button>
            {showHomeButton && (
              <button
                onClick={handleHomeClick}
                style={styles.homeButton}
                className="homeButton"
              >
                🏠 홈으로 돌아가기
              </button>
            )}
          </div>

          {/* 추가 정보 */}
          <div style={styles.additionalInfo}>
            <p style={styles.errorCode}>오류 코드: {errorStatusCode}</p>
            <p style={styles.timestamp}>
              발생 시간: {new Date().toLocaleString("ko-KR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "1rem",
    background: "linear-gradient(to bottom, #b0b0b0 0%, #969696 50%, #7c7c7c 100%)",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "600px",
    width: "90%",
    textAlign: "center",
    background: "linear-gradient(to bottom, #b0b0b0 0%, #969696 50%, #7c7c7c 100%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    padding: "3rem 2rem",
    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)",
    position: "relative",
    zIndex: 1,
  },
  mediaContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "2rem",
    gap: "1.5rem",
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "120px",
    height: "120px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
  },
  errorIcon: {
    fontSize: "48px",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
  },
  comingSoonBadge: {
    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    padding: "8px 16px",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
    marginTop: "16px",
  },
  comingSoonText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginBottom: "8px",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "rgba(139, 92, 246, 0.1)",
    borderRadius: "20px",
    border: "1px solid rgba(139, 92, 246, 0.3)",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#8b5cf6",
    animation: "pulse 2s infinite",
  },
  statusText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#8b5cf6",
  },
  backgroundElements: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: 0,
    background: "linear-gradient(135deg, #a0a0a0 0%, #808080 100%)",
  },
  floatingCircle1: {
    position: "absolute",
    top: "15%",
    left: "10%",
    width: "120px",
    height: "120px",
    background: "linear-gradient(135deg, #808080 0%, #606060 100%)",
    borderRadius: "50%",
    animation: "float 8s ease-in-out infinite",
    opacity: 0.15,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  floatingCircle2: {
    position: "absolute",
    top: "60%",
    right: "15%",
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #707070 0%, #505050 100%)",
    borderRadius: "50%",
    animation: "float 8s ease-in-out infinite reverse",
    opacity: 0.15,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  floatingCircle3: {
    position: "absolute",
    bottom: "20%",
    left: "20%",
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #606060 0%, #404040 100%)",
    borderRadius: "50%",
    animation: "float 8s ease-in-out infinite",
    opacity: 0.15,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  videoContainer: {
    position: "relative",
  },
  video: {
    width: "160px",
    height: "160px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    objectFit: "cover",
  },
  videoFallback: {
    width: "160px",
    height: "160px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  fallbackIcon: {
    fontSize: "2.5rem",
    opacity: 0.4,
    color: "rgba(255, 255, 255, 0.6)",
  },
  errorInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0",
    lineHeight: "1.2",
    letterSpacing: "-0.02em",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "1.5rem",
    justifyContent: "center",
    width: "100%",
    marginTop: "1rem",
  },
  backButton: {
    padding: "1rem 1.5rem",
    background: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    minWidth: "140px",
  },
  homeButton: {
    padding: "1rem 1.5rem",
    background: "#ffffff",
    color: "#3b82f6",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    minWidth: "140px",
  },
  additionalInfo: {
    marginTop: "1.5rem",
    padding: "1rem",
    background: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    textAlign: "left",
    minWidth: "200px",
  },
  errorCode: {
    fontSize: "0.75rem",
    color: "#6b7280",
    margin: "0 0 0.5rem 0",
    fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
    fontWeight: "500",
  },
  timestamp: {
    fontSize: "0.75rem",
    color: "#6b7280",
    margin: "0",
    fontWeight: "400",
  },
}

// 현대적인 버튼 호버 효과 추가
const addHoverEffects = () => {
  const style = document.createElement("style")
  style.textContent = `
    .backButton:hover {
      background: #2563eb !important;
    }
    .homeButton:hover {
      background: #f9fafb !important;
    }
    .backButton:active, .homeButton:active {
      transform: scale(0.98);
    }
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-15px) rotate(180deg);
      }
    }
  `
  document.head.appendChild(style)
}

// 컴포넌트 마운트 시 호버 효과 추가
if (typeof document !== "undefined") {
  addHoverEffects()
}
