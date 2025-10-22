// ============================================================================
// Admin Layout Component
// ============================================================================

import React from "react"
import { Link, useLocation } from "react-router-dom"
import { ROUTES } from "@frontend/shared/constants/routes"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import { validateAdminAccess } from "../utils/adminUtils"
import type { AdminRole } from "../types"
import "./AdminLayout.css"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const location = useLocation()
  const { user } = useAuthRedux()

  // 관리자 권한 확인
  if (!user || !validateAdminAccess(user.role as AdminRole, "admin")) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <h1>🚫 접근 권한이 없습니다</h1>
          <p>관리자 권한이 필요한 페이지입니다.</p>
          <Link to={ROUTES.HOME} className="back-home-btn">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const adminMenuItems = [
    {
      id: "dashboard",
      label: "대시보드",
      path: ROUTES.ADMIN_DASHBOARD,
      icon: "📊",
    },
    {
      id: "performance",
      label: "성능 모니터링",
      path: ROUTES.ADMIN_PERFORMANCE,
      icon: "⚡",
    },
    {
      id: "database",
      label: "데이터베이스",
      path: ROUTES.ADMIN_DATABASE,
      icon: "🗄️",
    },
  ]

  return (
    <div className="admin-layout">
      {/* 사이드바 */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>관리자 패널</h2>
          <p>시스템 관리 및 모니터링</p>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {adminMenuItems.map(item => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-role">관리자</span>
            <span className="user-name">{user.username}</span>
          </div>
          <Link to={ROUTES.HOME} className="back-to-app">
            ← 앱으로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <h1 className="page-title">{title}</h1>
            {description && <p className="page-description">{description}</p>}
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}
