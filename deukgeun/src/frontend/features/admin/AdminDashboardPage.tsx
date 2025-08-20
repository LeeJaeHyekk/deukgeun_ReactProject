// ============================================================================
// 관리자 대시보드 페이지
// ============================================================================

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ROUTES } from "@shared/constants/routes"
import { AdminLayout } from "./components/AdminLayout"
import { useAdmin } from "./hooks/useAdmin"
import {
  formatUptime,
  formatBytes,
  formatPercentage,
  getStatusColor,
  getStatusText,
} from "./utils/adminUtils"
import styles from "./AdminDashboardPage.module.css"

interface DashboardStats {
  totalUsers: number
  totalMachines: number
  totalPosts: number
  systemStatus: "healthy" | "warning" | "error"
}

export default function AdminDashboardPage() {
  const { stats, loading, error } = useAdmin()

  if (loading) {
    return (
      <AdminLayout
        title="관리자 대시보드"
        description="시스템 현황과 관리 기능에 접근할 수 있습니다."
      >
        <div className={styles.loadingSection}>
          <div className={styles.loadingSpinner}></div>
          <p>대시보드 데이터를 불러오는 중...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout
        title="관리자 대시보드"
        description="시스템 현황과 관리 기능에 접근할 수 있습니다."
      >
        <div className={styles.errorSection}>
          <h1>데이터 로드 실패</h1>
          <p>{error}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="관리자 대시보드"
      description="시스템 현황과 관리 기능에 접근할 수 있습니다."
    >
      <div className={styles.container}>
        {/* 시스템 현황 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>시스템 현황</h2>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>총 사용자 수</h3>
              <p className={styles.statValue}>
                {stats?.totalUsers.toLocaleString()}명
              </p>
            </div>

            <div className={styles.statCard}>
              <h3>등록된 기구 수</h3>
              <p className={styles.statValue}>
                {stats?.totalMachines.toLocaleString()}개
              </p>
            </div>

            <div className={styles.statCard}>
              <h3>총 게시글 수</h3>
              <p className={styles.statValue}>
                {stats?.totalPosts.toLocaleString()}개
              </p>
            </div>

            <div className={styles.statCard}>
              <h3>시스템 상태</h3>
              <p
                className={`${styles.statValue} ${getStatusColor(stats?.systemStatus || "healthy")}`}
              >
                {getStatusText(stats?.systemStatus || "healthy")}
              </p>
            </div>
          </div>
        </div>

        {/* 관리 기능 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>관리 기능</h2>
          </div>

          <div className={styles.adminGrid}>
            <Link to={ROUTES.ADMIN_DATABASE} className={styles.adminCard}>
              <div className={styles.cardIcon}>🗄️</div>
              <h3>데이터베이스 관리</h3>
              <p>헬스장 데이터베이스 업데이트 및 관리</p>
            </Link>

            <Link to={ROUTES.ADMIN_PERFORMANCE} className={styles.adminCard}>
              <div className={styles.cardIcon}>📊</div>
              <h3>성능 모니터링</h3>
              <p>시스템 성능 및 API 응답 시간 모니터링</p>
            </Link>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>빠른 액션</h2>
          </div>

          <div className={styles.actionGrid}>
            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>🔄</span>
              <span>시스템 새로고침</span>
            </button>

            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>📋</span>
              <span>로그 확인</span>
            </button>

            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>⚙️</span>
              <span>설정 관리</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
