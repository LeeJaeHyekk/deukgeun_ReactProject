import React from "react"
import { useSessionsTabState } from "../../../hooks/useWorkoutStore"
import { useSharedState } from "../../../hooks/useWorkoutStore"
import { useWorkoutSessions } from "../../../hooks/useWorkoutSessions"
import { ActiveSessionContainer } from "./components/ActiveSessionContainer"
import { SessionsContent } from "./components/SessionsContent"
import { useSessionsActions } from "./hooks/useSessionsActions"
import type { WorkoutSession } from "../../../types"
import styles from "./SessionsTab.module.css"

interface SessionsTabProps {
  sessions: WorkoutSession[]
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
  // 탭별 상태 관리 - 타입 안전한 훅 사용
  const { state: tabState, updateState: updateTabState } = useSessionsTabState()

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

  const handleSortChange = (sortBy: "startTime" | "name" | "duration" | "status") => {
    updateTabState({ sortBy })
  }

  const handleFilterChange = (filterStatus: "all" | "completed" | "in_progress" | "paused" | "cancelled") => {
    updateTabState({ filterStatus })
  }

  if (isLoading) {
    return (
      <div className={styles.sessionsTab}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h3>로딩 중...</h3>
          <p>세션 정보를 불러오는 중입니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.sessionsTab}>
      {/* 헤더 */}
      <div className={styles.sessionsHeader}>
        <div className={styles.sessionsHeaderContent}>
          <h1>운동 세션</h1>
          <p>운동 세션을 관리하고 진행 상황을 확인하세요</p>
        </div>
      </div>

      {/* 컨트롤 섹션 */}
      <div className={styles.sessionsControls}>
        <div className={styles.controlSection}>
          {/* 필터 버튼 */}
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${tabState.filterStatus === "all" ? styles.active : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              전체
            </button>
            <button
              className={`${styles.filterBtn} ${tabState.filterStatus === "completed" ? styles.active : ""}`}
              onClick={() => handleFilterChange("completed")}
            >
              완료
            </button>
            <button
              className={`${styles.filterBtn} ${tabState.filterStatus === "in_progress" ? styles.active : ""}`}
              onClick={() => handleFilterChange("in_progress")}
            >
              진행중
            </button>
            <button
              className={`${styles.filterBtn} ${tabState.filterStatus === "paused" ? styles.active : ""}`}
              onClick={() => handleFilterChange("paused")}
            >
              일시정지
            </button>
          </div>

          {/* 정렬 버튼 */}
          <div className={styles.sortButtons}>
            <button
              className={`${styles.sortBtn} ${tabState.sortBy === "startTime" ? styles.active : ""}`}
              onClick={() => handleSortChange("startTime")}
            >
              최신순
            </button>
            <button
              className={`${styles.sortBtn} ${tabState.sortBy === "name" ? styles.active : ""}`}
              onClick={() => handleSortChange("name")}
            >
              이름순
            </button>
            <button
              className={`${styles.sortBtn} ${tabState.sortBy === "duration" ? styles.active : ""}`}
              onClick={() => handleSortChange("duration")}
            >
              시간순
            </button>
          </div>
        </div>
      </div>

      {/* 세션 목록 섹션 */}
      <div className={styles.sessionsSection}>
        <div className={styles.sectionHeader}>
          <h3>📋 세션 목록</h3>
          <p>총 {filteredSessions.length}개의 세션</p>
        </div>

        {filteredSessions.length === 0 ? (
          <div className={styles.noSessionsContainer}>
            <div className={styles.noSessionsIcon}>🏋️‍♂️</div>
            <h3 className={styles.noSessionsTitle}>세션이 없습니다</h3>
            <p className={styles.noSessionsText}>
              새로운 운동 세션을 시작해보세요!
            </p>
          </div>
        ) : (
          <SessionsContent
            sessions={filteredSessions}
            activeSession={activeSession}
            onViewSession={onViewSession}
            onEditSession={onEditSession}
            onDeleteSession={onDeleteSession}
          />
        )}
      </div>

      {/* 진행중인 세션 섹션 */}
      {activeSession && (
        <div className={styles.activeSessionSection}>
          <div className={styles.sectionHeader}>
            <h3>🔥 진행중인 세션</h3>
            <p>현재 진행 중인 운동 세션</p>
          </div>
          <ActiveSessionContainer
            activeSession={activeSession}
            onViewSession={onViewSession}
            onEditSession={onEditSession}
            onDeleteSession={onDeleteSession}
          />
        </div>
      )}
    </div>
  )
}
