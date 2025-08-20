import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

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
  showRetryButton = false,
  onRetry,
}: ErrorPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  // URL 파라미터에서 에러 정보 추출
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlStatusCode = searchParams.get("code")
    const urlTitle = searchParams.get("title")
    const urlMessage = searchParams.get("message")

    if (urlStatusCode) {
      statusCode = parseInt(urlStatusCode, 10)
    }
    if (urlTitle) {
      title = decodeURIComponent(urlTitle)
    }
    if (urlMessage) {
      message = decodeURIComponent(urlMessage)
    }
  }, [location])

  // 에러 정보 결정
  const getErrorInfo = () => {
    switch (statusCode) {
      case 400:
        return {
          title: title || "잘못된 요청",
          message:
            message || "요청하신 정보가 올바르지 않습니다. 다시 확인해주세요.",
          video: "/video/400Error.mp4",
          icon: "⚠️",
          color: "#f59e0b",
        }
      case 401:
        return {
          title: title || "인증이 필요합니다",
          message:
            message ||
            "로그인이 필요한 서비스입니다. 로그인 후 다시 시도해주세요.",
          video: "/video/401Error.mp4",
          icon: "🔐",
          color: "#3b82f6",
        }
      case 403:
        return {
          title: title || "접근이 거부되었습니다",
          message: message || "이 페이지에 접근할 권한이 없습니다.",
          video: "/video/403Error.mp4",
          icon: "🚫",
          color: "#ef4444",
        }
      case 404:
        return {
          title: title || "페이지를 찾을 수 없어요",
          message:
            message ||
            "요청하신 페이지가 존재하지 않거나, 이동되었을 수 있어요.",
          video: "/video/404Error.mp4",
          icon: "🔍",
          color: "#f59e0b",
        }
      case 500:
        return {
          title: title || "서버 오류가 발생했습니다",
          message:
            message || "일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.",
          video: "/video/500Error.mp4",
          icon: "⚡",
          color: "#ef4444",
        }
      case 503:
        return {
          title: title || "서비스가 일시적으로 사용할 수 없습니다",
          message: message || "서버 점검 중입니다. 잠시 후 다시 시도해주세요.",
          video: "/video/503Error.mp4",
          icon: "🔧",
          color: "#f59e0b",
        }
      default:
        return {
          title: title || "오류가 발생했습니다",
          message:
            message || "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
          video: "/video/404Error.mp4",
          icon: "❌",
          color: "#ef4444",
        }
    }
  }

  const errorInfo = getErrorInfo()

  const handleHomeClick = () => {
    navigate("/", { replace: true })
  }

  const handleRetryClick = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleBackClick = () => {
    navigate(-1)
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* 에러 아이콘 및 비디오 섹션 */}
        <div style={styles.mediaContainer}>
          <div style={styles.iconContainer}>
            <span style={styles.errorIcon}>{errorInfo.icon}</span>
          </div>
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
          <h1 style={styles.title}>
            {statusCode} - {errorInfo.title}
          </h1>
          <p style={styles.description}>{errorInfo.message}</p>

          {/* 액션 버튼들 */}
          <div style={styles.buttonContainer}>
            {showRetryButton && (
              <button onClick={handleRetryClick} style={styles.retryButton}>
                🔄 다시 시도
              </button>
            )}
            <button onClick={handleBackClick} style={styles.backButton}>
              ⬅️ 이전 페이지로
            </button>
            {showHomeButton && (
              <button onClick={handleHomeClick} style={styles.homeButton}>
                🏠 홈으로 돌아가기
              </button>
            )}
          </div>

          {/* 추가 정보 */}
          <div style={styles.additionalInfo}>
            <p style={styles.errorCode}>오류 코드: {statusCode}</p>
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
    padding: "20px",
    background:
      "linear-gradient(to bottom, #b0b0b0 0%, #969696 50%, #7c7c7c 100%)",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    color: "#ffffff",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "900px",
    width: "100%",
    textAlign: "center",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "24px",
    padding: "40px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  mediaContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "40px",
    gap: "20px",
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
  videoContainer: {
    position: "relative",
  },
  video: {
    width: "400px",
    height: "auto",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  videoFallback: {
    width: "400px",
    height: "300px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  fallbackIcon: {
    fontSize: "64px",
    opacity: 0.5,
  },
  errorInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0",
    lineHeight: "1.2",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  description: {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "0",
    lineHeight: "1.6",
    maxWidth: "600px",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  },
  buttonContainer: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "20px",
  },
  retryButton: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    backdropFilter: "blur(10px)",
  },
  backButton: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(107, 114, 128, 0.3)",
    backdropFilter: "blur(10px)",
  },
  homeButton: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
    backdropFilter: "blur(10px)",
  },
  additionalInfo: {
    marginTop: "40px",
    padding: "24px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    textAlign: "left",
    minWidth: "300px",
    backdropFilter: "blur(10px)",
  },
  errorCode: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    margin: "0 0 8px 0",
    fontFamily: "monospace",
  },
  timestamp: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    margin: "0",
  },
}

// 버튼 호버 효과 추가
const addHoverEffects = () => {
  const style = document.createElement("style")
  style.textContent = `
    .retryButton:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    .backButton:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
    }
    .homeButton:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    }
  `
  document.head.appendChild(style)
}

// 컴포넌트 마운트 시 호버 효과 추가
if (typeof document !== "undefined") {
  addHoverEffects()
}
