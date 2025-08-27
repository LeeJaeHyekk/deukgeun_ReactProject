import React from "react"
import { useTabState } from "../../../hooks/useWorkoutStore"
import { useSharedState } from "../../../hooks/useWorkoutStore"
import { GlobalWorkoutTimer } from "../../../components/timer/GlobalWorkoutTimer"
import { useWorkoutSessions } from "../../../hooks/useWorkoutSessions"
import { ActiveSessionContainer } from "./components/ActiveSessionContainer"
import { SessionsContent } from "./components/SessionsContent"
import { useSessionsActions } from "./hooks/useSessionsActions"
import type { WorkoutSessionDTO } from "../../../types"
import styles from "./SessionsTab.module.css"

interface SessionsTabProps {
  sessions: WorkoutSessionDTO[]
  isLoading: boolean
  onEditSession: (sessionId: number) => void
  onViewSession: (sessionId: number) => void
  onDeleteSession: (sessionId: number) => void
}

export function SessionsTab({
  sessions,
  isLoading,
  onEditSession,
  onViewSession,
  onDeleteSession,
}: SessionsTabProps) {
  // 탭별 상태 관리
  const { tabState, updateTabState } = useTabState("sessions")

  // 공유 상태 훅
  const { sharedState } = useSharedState()

  const { sessions: workoutSessions } = useWorkoutSessions()
  const { handleDeleteSession } = useSessionsActions(() => {
    // 세션 삭제 후 콜백 처리
  })

  // 활성 세션 찾기 (진행중인 세션)
  const activeSession = sessions.find(
    session => session.status === "in_progress"
  )

  // 필터링된 세션 목록 (최신순으로 기본 정렬)
  const filteredSessions = React.useMemo(() => {
    let filtered = sessions

    // 상태별 필터링
    if (tabState.filterStatus !== "all") {
      filtered = filtered.filter(session => {
        switch (tabState.filterStatus) {
          case "completed":
            return session.status === "completed"
          case "in_progress":
            return session.status === "in_progress"
          case "paused":
            return session.status === "paused"
          case "cancelled":
            return session.status === "cancelled"
          default:
            return true
        }
      })
    }

    // 정렬 (최신순으로 기본 정렬)
    filtered.sort((a, b) => {
      switch (tabState.sortBy) {
        case "startTime":
          return (
            new Date(b.startTime || b.createdAt).getTime() -
            new Date(a.startTime || a.createdAt).getTime()
          )
        case "name":
          return a.name.localeCompare(b.name)
        case "duration":
          return (b.totalDurationMinutes || 0) - (a.totalDurationMinutes || 0)
        case "status":
          const statusOrder = {
            in_progress: 1,
            paused: 2,
            completed: 3,
            cancelled: 4,
          }
          return statusOrder[a.status] - statusOrder[b.status]
        default:
          // 기본값: 최신순
          return (
            new Date(b.startTime || b.createdAt).getTime() -
            new Date(a.startTime || a.createdAt).getTime()
          )
      }
    })

    return filtered
  }, [sessions, tabState.filterStatus, tabState.sortBy])

  const handleSortChange = (sortBy: string) => {
    updateTabState({ sortBy })
  }

  const handleSessionSelect = (sessionId: number | null) => {
    updateTabState({ selectedSessionId: sessionId })
  }

  // Glassmorphism 스타일 객체
  const glassmorphismStyles = {
    main: {
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: "24px",
      padding: "24px",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      minHeight: "100vh",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: "#1f2937",
      borderRadius: "16px",
      margin: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      position: "relative" as const,
      zIndex: 1,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "24px 0",
      borderBottom: "1px solid rgba(229, 231, 235, 0.3)",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "12px",
      marginBottom: "8px",
    },
    headerContent: {
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: "4px",
    },
    headerTitle: {
      margin: "0 0 4px 0",
      color: "#1f2937",
      fontSize: "28px",
      fontWeight: "700",
      letterSpacing: "-0.025em",
    },
    headerSubtitle: {
      margin: "0",
      color: "#6b7280",
      fontSize: "16px",
    },
    controls: {
      padding: "20px 0",
      borderBottom: "1px solid rgba(243, 244, 246, 0.3)",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "12px",
      marginBottom: "8px",
    },
    controlSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
    },
    sortButtons: {
      display: "flex",
      gap: "8px",
    },
    sortBtn: (isActive: boolean) => ({
      padding: "10px 18px",
      background: isActive
        ? "linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)"
        : "rgba(249, 250, 251, 0.8)",
      backdropFilter: "blur(10px)",
      border: isActive ? "transparent" : "1px solid rgba(229, 231, 235, 0.3)",
      borderRadius: "12px",
      color: isActive ? "white" : "#374151",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: isActive
        ? "0 4px 16px rgba(245, 158, 11, 0.3)"
        : "0 2px 8px rgba(0, 0, 0, 0.1)",
    }),
    section: {
      marginBottom: "28px",
      padding: "20px",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "16px",
      border: "1px solid rgba(229, 231, 235, 0.2)",
    },
    sectionHeader: {
      marginBottom: "20px",
      padding: "16px 20px",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "12px",
      border: "1px solid rgba(229, 231, 235, 0.2)",
    },
    sectionTitle: {
      margin: "0 0 4px 0",
      color: "#1f2937",
      fontSize: "20px",
      fontWeight: "600",
    },
    sectionSubtitle: {
      margin: "0",
      color: "#6b7280",
      fontSize: "14px",
    },
    loading: {
      display: "flex" as const,
      flexDirection: "column" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      minHeight: "360px",
      color: "#6b7280",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "16px",
      border: "1px solid rgba(229, 231, 235, 0.2)",
      padding: "40px",
    },
    noSessions: {
      display: "flex" as const,
      flexDirection: "column" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: "60px 20px",
      textAlign: "center" as const,
      background: "rgba(249, 250, 251, 0.8)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      border: "2px dashed rgba(209, 213, 219, 0.5)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    },
    noSessionsIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },
    noSessionsTitle: {
      margin: "0 0 8px 0",
      color: "#1f2937",
      fontSize: "18px",
      fontWeight: "600",
    },
    noSessionsText: {
      margin: "0",
      color: "#6b7280",
      fontSize: "14px",
    },
  }

  if (isLoading) {
    return (
      <div className={styles.sessionsTab} style={glassmorphismStyles.main}>
        <div
          className={styles.loadingContainer}
          style={glassmorphismStyles.loading}
        >
          <div className={styles.loadingSpinner}></div>
          <p>세션을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.sessionsTab} style={glassmorphismStyles.main}>
      {/* Glassmorphism 헤더 */}
      <div className={styles.sessionsHeader} style={glassmorphismStyles.header}>
        <div
          className={styles.headerContent}
          style={glassmorphismStyles.headerContent}
        >
          <h2 style={glassmorphismStyles.headerTitle}>⏱️ 운동 세션</h2>
          <p style={glassmorphismStyles.headerSubtitle}>
            운동 세션을 관리하고 기록하세요
          </p>
        </div>
      </div>

      {/* Glassmorphism 컨트롤 */}
      <div
        className={styles.sessionsControls}
        style={glassmorphismStyles.controls}
      >
        <div
          className={styles.controlSection}
          style={glassmorphismStyles.controlSection}
        >
          <div
            className={styles.sortButtons}
            style={glassmorphismStyles.sortButtons}
          >
            <button
              className={`${styles.sortBtn} ${tabState.sortBy === "startTime" ? styles.active : ""}`}
              onClick={() => handleSortChange("startTime")}
              style={glassmorphismStyles.sortBtn(
                tabState.sortBy === "startTime"
              )}
            >
              최신순
            </button>
            <button
              className={`${styles.sortBtn} ${tabState.sortBy === "name" ? styles.active : ""}`}
              onClick={() => handleSortChange("name")}
              style={glassmorphismStyles.sortBtn(tabState.sortBy === "name")}
            >
              이름순
            </button>
            <button
              className={`${styles.sortBtn} ${tabState.sortBy === "duration" ? styles.active : ""}`}
              onClick={() => handleSortChange("duration")}
              style={glassmorphismStyles.sortBtn(
                tabState.sortBy === "duration"
              )}
            >
              시간순
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphism 활성 세션 (있는 경우) */}
      {activeSession && (
        <div
          className={styles.activeSessionSection}
          style={glassmorphismStyles.section}
        >
          <div
            className={styles.sectionHeader}
            style={glassmorphismStyles.sectionHeader}
          >
            <h3 style={glassmorphismStyles.sectionTitle}>🔥 진행중인 세션</h3>
            <p style={glassmorphismStyles.sectionSubtitle}>
              현재 진행 중인 운동 세션입니다
            </p>
          </div>
          <ActiveSessionContainer
            activeSession={activeSession}
            onViewSession={onViewSession}
            onEditSession={onEditSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      )}

      {/* Glassmorphism 세션 목록 */}
      {filteredSessions.length > 0 ? (
        <div
          className={styles.sessionsSection}
          style={glassmorphismStyles.section}
        >
          <div
            className={styles.sectionHeader}
            style={glassmorphismStyles.sectionHeader}
          >
            <h3 style={glassmorphismStyles.sectionTitle}>
              📋 세션 목록 ({filteredSessions.length}개)
            </h3>
            <p style={glassmorphismStyles.sectionSubtitle}>
              모든 운동 세션을 확인하세요
            </p>
          </div>
          <SessionsContent
            sessions={filteredSessions}
            activeSession={activeSession}
            onViewSession={onViewSession}
            onEditSession={onEditSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      ) : (
        <div
          className={styles.noSessionsContainer}
          style={glassmorphismStyles.noSessions}
        >
          <div
            className={styles.noSessionsIcon}
            style={glassmorphismStyles.noSessionsIcon}
          >
            ⏱️
          </div>
          <h3 style={glassmorphismStyles.noSessionsTitle}>
            아직 운동 세션이 없습니다
          </h3>
          <p style={glassmorphismStyles.noSessionsText}>
            첫 번째 운동 세션을 시작해보세요!
          </p>
        </div>
      )}

      {/* 글로벌 타이머 */}
      <GlobalWorkoutTimer />
    </div>
  )
}
