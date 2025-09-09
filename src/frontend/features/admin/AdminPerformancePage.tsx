// ============================================================================
// 관리자 성능 모니터링 페이지
// ============================================================================

import React, { useState, useEffect } from "react"
import { AdminLayout } from "./components/AdminLayout"
import { useAdmin } from "./hooks/useAdmin"
import { PerformanceMonitor } from "@features/machine-guide/components/PerformanceMonitor"
import styles from "./AdminPerformancePage.module.css"

interface SystemMetrics {
  averageFetchTime: number
  errorCount: number
  cacheHitRate: number
  totalRequests: number
  activeUsers: number
  serverLoad: number
  memoryUsage: number
  diskUsage: number
}

export default function AdminPerformancePage() {
  const { metrics: adminMetrics, loading, error } = useAdmin()
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5초마다 새로고침

  useEffect(() => {
    // 자동 새로고침 설정
    const interval = setInterval(() => {
      // useAdmin hook에서 자동으로 데이터를 새로고침함
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const handleRefreshIntervalChange = (newInterval: number) => {
    setRefreshInterval(newInterval)
  }

  const getLoadColor = (load: number) => {
    if (load < 30) return styles.loadLow
    if (load < 60) return styles.loadMedium
    return styles.loadHigh
  }

  const getUsageColor = (usage: number) => {
    if (usage < 50) return styles.usageLow
    if (usage < 80) return styles.usageMedium
    return styles.usageHigh
  }

  if (loading) {
    return (
      <AdminLayout
        title="성능 모니터링"
        description="시스템 성능 및 API 응답 시간을 실시간으로 모니터링합니다."
      >
        <div className={styles.loadingSection}>
          <div className={styles.loadingSpinner}></div>
          <p>성능 데이터를 불러오는 중...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout
        title="성능 모니터링"
        description="시스템 성능 및 API 응답 시간을 실시간으로 모니터링합니다."
      >
        <div className={styles.errorSection}>
          <h1>데이터 로드 실패</h1>
          <p>성능 데이터를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="성능 모니터링"
      description="시스템 성능 및 API 응답 시간을 실시간으로 모니터링합니다."
    >
      <div className={styles.container}>
        {/* 새로고침 설정 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>모니터링 설정</h2>
          </div>

          <div className={styles.settingsGrid}>
            <div className={styles.settingItem}>
              <label htmlFor="refreshInterval">새로고침 간격:</label>
              <select
                id="refreshInterval"
                value={refreshInterval}
                onChange={e =>
                  handleRefreshIntervalChange(Number(e.target.value))
                }
                className={styles.select}
              >
                <option value={2000}>2초</option>
                <option value={5000}>5초</option>
                <option value={10000}>10초</option>
                <option value={30000}>30초</option>
              </select>
            </div>
          </div>
        </div>

        {/* 시스템 성능 메트릭 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>시스템 성능</h2>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <h3>서버 부하</h3>
              <p
                className={`${styles.metricValue} ${getLoadColor(0)}`}
              >
                0%
              </p>
            </div>

            <div className={styles.metricCard}>
              <h3>메모리 사용량</h3>
              <p
                className={`${styles.metricValue} ${getUsageColor(0)}`}
              >
                0%
              </p>
            </div>

            <div className={styles.metricCard}>
              <h3>디스크 사용량</h3>
              <p
                className={`${styles.metricValue} ${getUsageColor(0)}`}
              >
                0%
              </p>
            </div>

            <div className={styles.metricCard}>
              <h3>활성 사용자</h3>
              <p className={styles.metricValue}>
                0명
              </p>
            </div>
          </div>
        </div>

        {/* API 성능 모니터링 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>API 성능</h2>
          </div>

          <div className={styles.performanceContainer}>
            <PerformanceMonitor
              metrics={{
                averageFetchTime: 0,
                errorCount: 0,
                cacheHitRate: 0,
                totalRequests: 0,
              }}
              isVisible={true}
              onClose={() => {}} // 관리자 페이지에서는 닫기 기능 비활성화
            />
          </div>
        </div>

        {/* 실시간 로그 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>실시간 로그</h2>
          </div>

          <div className={styles.logContainer}>
            <div className={styles.logEntry}>
              <span className={styles.logTime}>16:42:15</span>
              <span className={styles.logLevel}>INFO</span>
              <span className={styles.logMessage}>
                API 요청 처리 완료 - 응답시간: 125ms
              </span>
            </div>
            <div className={styles.logEntry}>
              <span className={styles.logTime}>16:42:12</span>
              <span className={styles.logLevel}>WARN</span>
              <span className={styles.logMessage}>
                캐시 히트율이 낮습니다: 45%
              </span>
            </div>
            <div className={styles.logEntry}>
              <span className={styles.logTime}>16:42:08</span>
              <span className={styles.logLevel}>INFO</span>
              <span className={styles.logMessage}>
                새 사용자 등록: user@example.com
              </span>
            </div>
            <div className={styles.logEntry}>
              <span className={styles.logTime}>16:42:05</span>
              <span className={styles.logLevel}>ERROR</span>
              <span className={styles.logMessage}>
                데이터베이스 연결 실패 - 재시도 중
              </span>
            </div>
          </div>
        </div>

        {/* 관리 액션 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>관리 액션</h2>
          </div>

          <div className={styles.actionGrid}>
            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>🧹</span>
              <span>캐시 초기화</span>
            </button>

            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>📊</span>
              <span>성능 리포트 생성</span>
            </button>

            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>⚡</span>
              <span>시스템 최적화</span>
            </button>

            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>📥</span>
              <span>로그 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
