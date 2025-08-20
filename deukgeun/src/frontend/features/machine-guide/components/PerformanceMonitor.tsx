// ============================================================================
// Performance Monitor Component
// ============================================================================

import React, { useState, useEffect } from "react"
import "./PerformanceMonitor.css"

interface PerformanceMetrics {
  averageFetchTime: number
  errorCount: number
  cacheHitRate: number
  totalRequests: number
}

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics
  isVisible?: boolean
  onClose?: () => void
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  isVisible = false,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isVisible) return null

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return "#28a745" // 좋음
    if (value <= threshold) return "#ffc107" // 보통
    return "#dc3545" // 나쁨
  }

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 80) return "#28a745" // 좋음
    if (rate >= 60) return "#ffc107" // 보통
    return "#dc3545" // 나쁨
  }

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h3 className="monitor-title">
          📊 성능 모니터링
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "접기" : "펼치기"}
          >
            {isExpanded ? "▼" : "▲"}
          </button>
        </h3>
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        )}
      </div>

      <div className={`monitor-content ${isExpanded ? "expanded" : ""}`}>
        <div className="metrics-grid">
          {/* 평균 응답 시간 */}
          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-info">
              <span className="metric-label">평균 응답 시간</span>
              <span
                className="metric-value"
                style={{
                  color: getPerformanceColor(metrics.averageFetchTime, 1000),
                }}
              >
                {metrics.averageFetchTime.toFixed(2)}ms
              </span>
            </div>
            <div className="metric-status">
              {metrics.averageFetchTime <= 500
                ? "🟢"
                : metrics.averageFetchTime <= 1000
                  ? "🟡"
                  : "🔴"}
            </div>
          </div>

          {/* 캐시 히트율 */}
          <div className="metric-card">
            <div className="metric-icon">💾</div>
            <div className="metric-info">
              <span className="metric-label">캐시 히트율</span>
              <span
                className="metric-value"
                style={{ color: getCacheHitRateColor(metrics.cacheHitRate) }}
              >
                {metrics.cacheHitRate.toFixed(1)}%
              </span>
            </div>
            <div className="metric-status">
              {metrics.cacheHitRate >= 80
                ? "🟢"
                : metrics.cacheHitRate >= 60
                  ? "🟡"
                  : "🔴"}
            </div>
          </div>

          {/* 총 요청 수 */}
          <div className="metric-card">
            <div className="metric-icon">📡</div>
            <div className="metric-info">
              <span className="metric-label">총 요청 수</span>
              <span className="metric-value">{metrics.totalRequests}</span>
            </div>
            <div className="metric-status">
              {metrics.totalRequests > 0 ? "📊" : "📈"}
            </div>
          </div>

          {/* 에러 수 */}
          <div className="metric-card">
            <div className="metric-icon">⚠️</div>
            <div className="metric-info">
              <span className="metric-label">에러 수</span>
              <span
                className="metric-value"
                style={{
                  color: metrics.errorCount > 0 ? "#dc3545" : "#28a745",
                }}
              >
                {metrics.errorCount}
              </span>
            </div>
            <div className="metric-status">
              {metrics.errorCount === 0 ? "🟢" : "🔴"}
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        {isExpanded && (
          <div className="detailed-metrics">
            <h4>성능 분석</h4>
            <div className="analysis-grid">
              <div className="analysis-item">
                <strong>응답 시간 분석:</strong>
                {metrics.averageFetchTime <= 500
                  ? "매우 빠름"
                  : metrics.averageFetchTime <= 1000
                    ? "적절함"
                    : "개선 필요"}
              </div>
              <div className="analysis-item">
                <strong>캐시 효율성:</strong>
                {metrics.cacheHitRate >= 80
                  ? "매우 효율적"
                  : metrics.cacheHitRate >= 60
                    ? "적절함"
                    : "개선 필요"}
              </div>
              <div className="analysis-item">
                <strong>안정성:</strong>
                {metrics.errorCount === 0
                  ? "완벽함"
                  : metrics.errorCount <= 2
                    ? "양호함"
                    : "주의 필요"}
              </div>
            </div>

            {/* 권장사항 */}
            <div className="recommendations">
              <h4>권장사항</h4>
              <ul>
                {metrics.averageFetchTime > 1000 && (
                  <li>
                    🚀 API 응답 시간이 느립니다. 서버 성능을 확인해주세요.
                  </li>
                )}
                {metrics.cacheHitRate < 60 && (
                  <li>💾 캐시 히트율이 낮습니다. 캐시 전략을 개선해주세요.</li>
                )}
                {metrics.errorCount > 2 && (
                  <li>
                    ⚠️ 에러가 많이 발생하고 있습니다. 네트워크 상태를
                    확인해주세요.
                  </li>
                )}
                {metrics.averageFetchTime <= 500 &&
                  metrics.cacheHitRate >= 80 &&
                  metrics.errorCount === 0 && (
                    <li>✅ 모든 지표가 양호합니다. 현재 상태를 유지하세요.</li>
                  )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
