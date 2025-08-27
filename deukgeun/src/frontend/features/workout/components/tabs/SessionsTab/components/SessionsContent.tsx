import React from "react"
import { Grid3X3, List, Clock, Calendar, TrendingUp } from "lucide-react"
import type { WorkoutSessionDTO } from "../../../../types"
import "./SessionsContent.css"

interface SessionsContentProps {
  sessions: WorkoutSessionDTO[]
  activeSession?: WorkoutSessionDTO
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
      <div className="sessions-content">
        <div className="no-sessions-container">
          <div className="no-sessions-icon">🏋️‍♂️</div>
          <h3>아직 운동 세션이 없습니다</h3>
          <p>첫 번째 운동 세션을 시작해보세요!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sessions-content">
      {/* 세션 목록 헤더 */}
      <div className="sessions-list-header">
        <div className="list-header-info">
          <h3>세션 목록</h3>
          <div className="session-count">
            총 {displaySessions.length}개의 세션
          </div>
        </div>

        <div className="list-header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="그리드 보기"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="리스트 보기"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 세션 통계 요약 */}
      <div className="sessions-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="stat-number">{sessionStats.completed}</div>
            <div className="stat-label">완료</div>
          </div>
          <div className="summary-stat">
            <div className="stat-number">{sessionStats.inProgress}</div>
            <div className="stat-label">진행중</div>
          </div>
          <div className="summary-stat">
            <div className="stat-number">{sessionStats.paused}</div>
            <div className="stat-label">일시정지</div>
          </div>
          <div className="summary-stat">
            <div className="stat-number">{sessionStats.completionRate}%</div>
            <div className="stat-label">완료율</div>
          </div>
        </div>
      </div>

      {/* 세션 그리드/리스트 */}
      <div className={`sessions-display ${viewMode}`}>
        {displaySessions.map(session => (
          <div key={session.id} className="session-item">
            <div className="session-item-header">
              <div className="session-info">
                <h4 className="session-name">{session.name}</h4>
                <div className="session-meta">
                  <span className="session-date">
                    <Calendar size={14} />
                    {formatDate(session.startTime)}
                  </span>
                  {session.totalDurationMinutes && (
                    <span className="session-duration">
                      <Clock size={14} />
                      {formatDuration(session.totalDurationMinutes)}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(session.status) }}
                title={getStatusText(session.status)}
              />
            </div>

            <div className="session-item-content">
              <div className="session-details">
                <div className="detail-item">
                  <span className="label">상태</span>
                  <span className="value">{getStatusText(session.status)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">운동 세트</span>
                  <span className="value">
                    {session.exerciseSets?.length || 0}개
                  </span>
                </div>
                {session.notes && (
                  <div className="detail-item full-width">
                    <span className="label">메모</span>
                    <span className="value notes">{session.notes}</span>
                  </div>
                )}
              </div>

              <div className="session-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => onViewSession(session.id)}
                >
                  상세보기
                </button>
                <button
                  className="action-btn edit-btn"
                  onClick={() => onEditSession(session.id)}
                >
                  편집
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => onDeleteSession(session.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 세션 목록 푸터 */}
      {displaySessions.length > 0 && (
        <div className="sessions-footer">
          <div className="footer-info">
            <Clock size={14} />
            <span>마지막 업데이트: {new Date().toLocaleString()}</span>
          </div>
          <div className="footer-stats">
            <TrendingUp size={14} />
            <span>평균 완료율: {sessionStats.completionRate}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
