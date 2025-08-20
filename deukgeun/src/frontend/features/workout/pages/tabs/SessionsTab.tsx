import React, { useState } from "react"
import { WorkoutSession } from "../../../../shared/api/workoutJournalApi"
import { SessionCard } from "../../components/cards/SessionCard"
import { GlobalWorkoutTimer } from "../../components/timer/GlobalWorkoutTimer"
import { useWorkoutSessions } from "../../hooks/useWorkoutSessions"
import { useWorkoutTimer } from "../../../../shared/contexts/WorkoutTimerContext"
import { ChevronDown, ChevronUp, Clock, Target } from "lucide-react"
import "./SessionsTab.css"

interface SessionsTabProps {
  sessions: WorkoutSession[]
  isLoading: boolean
  onCreateSession: () => void
  onEditSession: (sessionId: number) => void
  onViewSession: (sessionId: number) => void
  onDeleteSession: () => void
}

export function SessionsTab({
  sessions,
  isLoading,
  onCreateSession,
  onEditSession,
  onViewSession,
  onDeleteSession,
}: SessionsTabProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const { timerState, startTimer, pauseTimer, stopTimer } = useWorkoutTimer()
  const { activeSession } = useWorkoutSessions()

  // 로깅 유틸리티
  const logger = {
    info: (message: string, data?: any) => {
      console.log(`[SessionsTab] ${message}`, data || "")
    },
    debug: (message: string, data?: any) => {
      console.debug(`[SessionsTab] ${message}`, data || "")
    },
    warn: (message: string, data?: any) => {
      console.warn(`[SessionsTab] ${message}`, data || "")
    },
    error: (message: string, data?: any) => {
      console.error(`[SessionsTab] ${message}`, data || "")
    },
  }

  logger.debug("SessionsTab rendered", {
    sessionsCount: sessions.length,
    isLoading,
    hasActiveSession: !!activeSession,
    isMinimized,
  })

  const handleDeleteSession = (sessionId: number) => {
    logger.info("Delete session requested", { sessionId })
    onDeleteSession()
  }

  const toggleMinimize = () => {
    logger.info("Toggle minimize", {
      currentState: isMinimized,
      newState: !isMinimized,
    })
    setIsMinimized(!isMinimized)
  }

  if (isLoading) {
    logger.debug("Showing loading state")
    return (
      <div className="sessions-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>세션을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sessions-tab">
      <div className="sessions-header">
        <h2>운동 세션</h2>
        <button
          className="create-session-btn"
          onClick={() => {
            logger.info("Create session button clicked")
            onCreateSession()
          }}
        >
          <span className="icon">+</span>새 세션 시작
        </button>
      </div>

      {/* Active Session Container with Minimize Feature */}
      {activeSession && (
        <div
          className={`active-session-container ${isMinimized ? "minimized" : ""}`}
        >
          <div className="active-session-header" onClick={toggleMinimize}>
            <h3>
              <Clock size={20} />
              진행 중인 세션
            </h3>
            <button
              className="minimize-btn"
              onClick={e => {
                e.stopPropagation()
                toggleMinimize()
              }}
            >
              {isMinimized ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )}
            </button>
          </div>

          <div className="active-session-content">
            <SessionCard
              session={activeSession}
              isActive={true}
              onView={() => {
                logger.info("View active session", {
                  sessionId: activeSession.id,
                })
                onViewSession(activeSession.id)
              }}
              onEdit={() => {
                logger.info("Edit active session", {
                  sessionId: activeSession.id,
                })
                onEditSession(activeSession.id)
              }}
              onDelete={() => {
                logger.info("Delete active session", {
                  sessionId: activeSession.id,
                })
                handleDeleteSession(activeSession.id)
              }}
              onStart={() => {
                logger.info("Start active session", {
                  sessionId: activeSession.id,
                })
                startTimer(activeSession.id.toString())
                console.log("세션 시작:", activeSession.id)
              }}
              onPause={() => {
                logger.info("Pause active session", {
                  sessionId: activeSession.id,
                })
                pauseTimer()
                console.log("세션 일시정지")
              }}
              onComplete={() => {
                logger.info("Complete active session", {
                  sessionId: activeSession.id,
                })
                stopTimer()
                console.log("세션 완료")
              }}
            />
          </div>
        </div>
      )}

      <div className="sessions-content">
        {sessions.length === 0 ? (
          <div className="no-sessions-container">
            <div className="no-sessions-icon">🏋️‍♂️</div>
            <h3>아직 운동 세션이 없습니다</h3>
            <p>첫 번째 운동 세션을 시작해보세요!</p>
            <button
              className="create-first-session-btn"
              onClick={() => {
                logger.info("Create first session button clicked")
                onCreateSession()
              }}
            >
              첫 세션 시작하기
            </button>
          </div>
        ) : (
          <>
            <div className="sessions-filters">
              <button
                className="filter-btn active"
                onClick={() => logger.debug("Filter: 전체 clicked")}
              >
                전체
              </button>
              <button
                className="filter-btn"
                onClick={() => logger.debug("Filter: 완료 clicked")}
              >
                완료
              </button>
              <button
                className="filter-btn"
                onClick={() => logger.debug("Filter: 진행 중 clicked")}
              >
                진행 중
              </button>
              <button
                className="filter-btn"
                onClick={() => logger.debug("Filter: 일시정지 clicked")}
              >
                일시정지
              </button>
            </div>

            <div className="sessions-grid">
              {sessions
                .filter(
                  session => !activeSession || session.id !== activeSession.id
                )
                .map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onView={() => {
                      logger.info("View session", { sessionId: session.id })
                      onViewSession(session.id)
                    }}
                    onEdit={() => {
                      logger.info("Edit session", { sessionId: session.id })
                      onEditSession(session.id)
                    }}
                    onDelete={() => {
                      logger.info("Delete session", { sessionId: session.id })
                      handleDeleteSession(session.id)
                    }}
                    onStart={() => {
                      logger.info("Start session", { sessionId: session.id })
                      startTimer(session.id.toString())
                      console.log("세션 시작:", session.id)
                    }}
                    onPause={() => {
                      logger.info("Pause session", { sessionId: session.id })
                      pauseTimer()
                      console.log("세션 일시정지")
                    }}
                    onComplete={() => {
                      logger.info("Complete session", { sessionId: session.id })
                      stopTimer()
                      console.log("세션 완료")
                    }}
                  />
                ))}
            </div>

            <div className="sessions-stats">
              <div className="stat-item">
                <span className="stat-label">총 세션</span>
                <span className="stat-value">{sessions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">완료된 세션</span>
                <span className="stat-value">
                  {sessions.filter(s => s.isCompleted).length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">진행 중</span>
                <span className="stat-value">
                  {sessions.filter(s => !s.isCompleted).length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">총 운동 시간</span>
                <span className="stat-value">
                  {sessions
                    .filter(s => s.duration)
                    .reduce((total, s) => total + (s.duration || 0), 0)
                    .toFixed(0)}
                  분
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Global Timer Component */}
      <GlobalWorkoutTimer />
    </div>
  )
}
