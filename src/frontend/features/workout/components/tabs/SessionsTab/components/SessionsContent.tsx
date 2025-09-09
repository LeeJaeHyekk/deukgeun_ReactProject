import React from "react"
import { Grid3X3, List, Clock, Calendar, TrendingUp } from "lucide-react"
import type { WorkoutSession } from "../../../../types"
import styles from "./SessionsContent.module.css"

interface SessionsContentProps {
  sessions: WorkoutSession[]
  activeSession?: WorkoutSession
  onViewSession: (sessionId: number) => void
  onEditSession: (sessionId: number) => void
  onDeleteSession: (sessionId: number) => void
}

export const SessionsContent: React.FC<SessionsContentProps> = ({
  sessions,
  activeSession,
  onViewSession,
  onEditSession,
  onDeleteSession,
}) => {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")

  // 세션 통계 계산
  const sessionStats = React.useMemo(() => {
    const total = sessions.length
    const completed = sessions.filter(s => s.status === "completed").length
    const inProgress = sessions.filter(s => s.status === "in_progress").length
    const paused = sessions.filter(s => s.status === "paused").length
    const cancelled = sessions.filter(s => s.status === "cancelled").length

    return {
      total,
      completed,
      inProgress,
      paused,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [sessions])

  // 활성 세션을 제외한 세션 목록
  const displaySessions = sessions.filter(
    session => !activeSession || session.id !== activeSession.id
  )

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "미정"
    const d = new Date(date)
    return d.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "0분"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981"
      case "in_progress":
        return "#f59e0b"
      case "paused":
        return "#6b7280"
      case "cancelled":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료"
      case "in_progress":
        return "진행중"
      case "paused":
        return "일시정지"
      case "cancelled":
        return "취소"
      default:
        return "알 수 없음"
    }
  }

  if (displaySessions.length === 0) {
    return (
      <div className={styles.sessionsContent}>
        <div className={styles.noSessionsContainer}>
          <div className={styles.noSessionsIcon}>🏋️‍♂️</div>
          <h3>아직 운동 세션이 없습니다</h3>
          <p>첫 번째 운동 세션을 시작해보세요!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.sessionsContent}>
      {/* 세션 목록 헤더 */}
      <div className={styles.sessionsListHeader}>
        <div className={styles.listHeaderInfo}>
          <h3>세션 목록</h3>
          <div className={styles.sessionCount}>
            총 {displaySessions.length}개의 세션
          </div>
        </div>

        <div className={styles.listHeaderActions}>
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.viewModeBtn} ${viewMode === "grid" ? styles.active : ""}`}
              onClick={() => setViewMode("grid")}
              title="그리드 보기"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={`${styles.viewModeBtn} ${viewMode === "list" ? styles.active : ""}`}
              onClick={() => setViewMode("list")}
              title="리스트 보기"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 세션 통계 요약 */}
      <div className={styles.sessionsSummary}>
        <div className={styles.summaryStats}>
          <div className={styles.summaryStat}>
            <div className={styles.statNumber}>{sessionStats.completed}</div>
            <div className={styles.statLabel}>완료</div>
          </div>
          <div className={styles.summaryStat}>
            <div className={styles.statNumber}>{sessionStats.inProgress}</div>
            <div className={styles.statLabel}>진행중</div>
          </div>
          <div className={styles.summaryStat}>
            <div className={styles.statNumber}>{sessionStats.paused}</div>
            <div className={styles.statLabel}>일시정지</div>
          </div>
          <div className={styles.summaryStat}>
            <div className={styles.statNumber}>
              {sessionStats.completionRate}%
            </div>
            <div className={styles.statLabel}>완료율</div>
          </div>
        </div>
      </div>

      {/* 세션 목록 */}
      <div className={`${styles.sessionsList} ${styles[viewMode]}`}>
        {displaySessions.map(session => (
          <div key={session.id} className={styles.sessionItem}>
            <div className={styles.sessionItemHeader}>
              <div className={styles.sessionInfo}>
                <h4 className={styles.sessionName}>{session.name}</h4>
                <div className={styles.sessionMeta}>
                  <span className={styles.sessionDate}>
                    <Calendar size={14} />
                    {formatDate(session.startTime)}
                  </span>
                  <span className={styles.sessionDuration}>
                    <Clock size={14} />
                    {formatDuration(session.totalDurationMinutes)}
                  </span>
                </div>
              </div>
              <div
                className={styles.statusIndicator}
                style={{ backgroundColor: getStatusColor(session.status) }}
                title={getStatusText(session.status)}
              />
            </div>

            <div className={styles.sessionItemContent}>
              <div className={styles.sessionDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>상태</span>
                  <span className={styles.detailValue}>
                    {getStatusText(session.status)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>운동 세트</span>
                  <span className={styles.detailValue}>
                    {session.exercises?.length || 0}개
                  </span>
                </div>
                {session.notes && (
                  <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                    <span className={styles.detailLabel}>메모</span>
                    <span className={styles.detailValue}>{session.notes}</span>
                  </div>
                )}
              </div>

              <div className={styles.sessionActions}>
                <button
                  className={`${styles.actionBtn} ${styles.viewBtn}`}
                  onClick={() => onViewSession(session.id)}
                >
                  상세보기
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => onEditSession(session.id)}
                >
                  수정
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => onDeleteSession(session.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 세션 푸터 */}
      <div className={styles.sessionsFooter}>
        <div className={styles.footerInfo}>
          <span>총 {displaySessions.length}개의 세션</span>
        </div>
        <div className={styles.footerStats}>
          <span>완료율: {sessionStats.completionRate}%</span>
        </div>
      </div>
    </div>
  )
}
