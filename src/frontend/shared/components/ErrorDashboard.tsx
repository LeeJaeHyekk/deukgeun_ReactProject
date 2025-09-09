import React, { useState, useEffect } from "react"
import { getErrorAnalytics, clearErrorLogs } from "./ErrorLogger"

interface ErrorDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function ErrorDashboard({ isOpen, onClose }: ErrorDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (isOpen) {
      updateAnalytics()
    }
  }, [isOpen, refreshKey])

  const updateAnalytics = () => {
    const data = getErrorAnalytics()
    setAnalytics(data)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleClearLogs = () => {
    if (window.confirm("모든 에러 로그를 삭제하시겠습니까?")) {
      clearErrorLogs()
      updateAnalytics()
    }
  }

  if (!isOpen) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>🚨 에러 분석 대시보드</h2>
          <div style={styles.headerActions}>
            <button onClick={handleRefresh} style={styles.refreshButton}>
              🔄 새로고침
            </button>
            <button onClick={handleClearLogs} style={styles.clearButton}>
              🗑️ 로그 삭제
            </button>
            <button onClick={onClose} style={styles.closeButton}>
              ✕
            </button>
          </div>
        </div>

        {analytics ? (
          <div style={styles.content}>
            {/* 요약 통계 */}
            <div style={styles.summary}>
              <div style={styles.statCard}>
                <h3 style={styles.statTitle}>총 에러 수</h3>
                <p style={styles.statNumber}>{analytics.totalErrors}</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statTitle}>최근 에러 (1시간)</h3>
                <p style={styles.statNumber}>{analytics.recentErrors.length}</p>
              </div>
            </div>

            {/* 에러 타입별 분포 */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>에러 타입별 분포</h3>
              <div style={styles.chart}>
                {Object.entries(analytics.errorsByType).map(([type, count]) => (
                  <div key={type} style={styles.chartItem}>
                    <span style={styles.chartLabel}>{type}</span>
                    <div style={styles.chartBar}>
                      <div
                        style={{
                          ...styles.chartBarFill,
                          width: `${(Number(count) / analytics.totalErrors) * 100}%`,
                          backgroundColor: getTypeColor(type),
                        }}
                      />
                    </div>
                    <span style={styles.chartValue}>{String(count)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 심각도별 분포 */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>심각도별 분포</h3>
              <div style={styles.severityGrid}>
                {Object.entries(analytics.errorsBySeverity).map(
                  ([severity, count]) => (
                    <div key={severity} style={styles.severityCard}>
                      <span
                        style={{
                          ...styles.severityBadge,
                          backgroundColor: getSeverityColor(severity),
                        }}
                      >
                        {severity}
                      </span>
                      <span style={styles.severityCount}>{String(count)}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 최근 에러 목록 */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>최근 에러 목록</h3>
              <div style={styles.errorList}>
                {analytics.recentErrors
                  .slice(0, 10)
                  .map((error: any, index: number) => (
                    <div key={index} style={styles.errorItem}>
                      <div style={styles.errorHeader}>
                        <span style={styles.errorType}>{error.type}</span>
                        <span style={styles.errorTime}>
                          {new Date(error.timestamp).toLocaleString("ko-KR")}
                        </span>
                      </div>
                      <p style={styles.errorMessage}>{error.message}</p>
                      <span
                        style={{
                          ...styles.errorSeverity,
                          backgroundColor: getSeverityColor(error.severity),
                        }}
                      >
                        {error.severity}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.loading}>
            <p>데이터를 불러오는 중...</p>
          </div>
        )}
      </div>
    </div>
  )
}

const getTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    TypeError: "#ef4444",
    ReferenceError: "#f59e0b",
    SyntaxError: "#3b82f6",
    NetworkError: "#10b981",
    default: "#6b7280",
  }
  return colors[type] || colors.default
}

const getSeverityColor = (severity: string) => {
  const colors: { [key: string]: string } = {
    critical: "#ef4444",
    error: "#f59e0b",
    warning: "#3b82f6",
    info: "#10b981",
  }
  return colors[severity] || "#6b7280"
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(12px)",
    padding: "20px",
  },
  modal: {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "24px",
    width: "90%",
    maxWidth: "1200px",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
  },
  headerTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  refreshButton: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    backdropFilter: "blur(10px)",
  },
  clearButton: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
    backdropFilter: "blur(10px)",
  },
  closeButton: {
    padding: "10px 16px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  },
  content: {
    padding: "32px",
    overflowY: "auto",
    flex: 1,
  },
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "24px",
    borderRadius: "16px",
    textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },
  statTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "0 0 12px 0",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 20px 0",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  },
  chart: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  chartItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  chartLabel: {
    minWidth: "120px",
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  },
  chartBar: {
    flex: 1,
    height: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  chartBarFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  chartValue: {
    minWidth: "40px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "right",
  },
  severityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },
  severityCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },
  severityBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  severityCount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  errorList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  errorItem: {
    padding: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },
  errorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  errorType: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
  },
  errorTime: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
  },
  errorMessage: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "0 0 12px 0",
    lineHeight: "1.5",
  },
  errorSeverity: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "16px",
  },
}

// 호버 효과 추가
const addHoverEffects = () => {
  const style = document.createElement("style")
  style.textContent = `
    .refreshButton:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    .clearButton:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
    .closeButton:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
    .statCard:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    .severityCard:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    .errorItem:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
  `
  document.head.appendChild(style)
}

// 컴포넌트 마운트 시 호버 효과 추가
if (typeof document !== "undefined") {
  addHoverEffects()
}
