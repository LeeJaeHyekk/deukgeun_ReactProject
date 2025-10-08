import React, { useState, useEffect } from "react"
import {
  Clock,
  Play,
  Pause,
  Check,
  Edit,
  Trash2,
  Timer,
  Target,
} from "lucide-react"
import { useWorkoutTimer } from "@shared/contexts/WorkoutTimerContext"
import type { WorkoutSessionDTO } from "../../../../types"
import "./ActiveSessionContainer.css"

interface ActiveSessionContainerProps {
  activeSession: WorkoutSessionDTO
  onViewSession: (sessionId: number) => void
  onEditSession: (sessionId: number) => void
  onDeleteSession: (sessionId: number) => void
}

export const ActiveSessionContainer: React.FC<ActiveSessionContainerProps> = ({
  activeSession,
  onViewSession,
  onEditSession,
  onDeleteSession,
}) => {
  const { startTimer, pauseTimer, stopTimer, timerState } = useWorkoutTimer()
  const [localElapsedTime, setLocalElapsedTime] = useState(0)

  const isInProgress = activeSession.status === "in_progress"
  const isPaused = activeSession.status === "paused"
  const isTimerRunning = timerState.isRunning

  // 로컬 타이머 관리
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning) {
      interval = setInterval(() => {
        setLocalElapsedTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isTimerRunning])

  // 타이머 시간 포맷팅
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "0분"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "미정"
    const d = new Date(date)
    return d.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStart = () => {
    startTimer(activeSession.id.toString())
  }

  const handlePause = () => {
    pauseTimer()
  }

  const handleComplete = () => {
    stopTimer()
    setLocalElapsedTime(0)
    // 세션 완료 로직 추가
  }

  const handleReset = () => {
    stopTimer()
    setLocalElapsedTime(0)
  }

  // 진행률 계산
  const calculateProgress = () => {
    const exercises = (activeSession as any).exercises || []
    if (exercises.length === 0) return { completed: 0, total: 0, percentage: 0 }

    const total = exercises.length
    const completed = exercises.filter((ex: any) => ex.isCompleted).length
    const percentage = Math.round((completed / total) * 100)

    return { completed, total, percentage }
  }

  const { completed, total, percentage } = calculateProgress()

  return (
    <div className="activeSessionContainer">
      <div className="activeSessionHeader">
        <div className="activeSessionHeaderContent">
          <div className="sessionTitle">
            <Clock size={20} />
            <h3>{activeSession.name}</h3>
            <span className="statusBadge active">진행중</span>
          </div>
          <div className="sessionMeta">
            <span>시작: {formatDate(activeSession.startTime)}</span>
            {activeSession.totalDurationMinutes && (
              <span>
                소요시간: {formatDuration(activeSession.totalDurationMinutes)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="activeSessionContent">
        {/* 타이머 섹션 */}
        <div className="timerSection">
          <div className="timerDisplay">
            <Timer size={24} />
            <div className="timerTime">
              {formatTime(
                isTimerRunning ? localElapsedTime : timerState.elapsedTime
              )}
            </div>
            <div className="timerLabel">
              {isTimerRunning ? "운동 중" : isPaused ? "일시정지" : "준비"}
            </div>
          </div>

          <div className="timerControls">
            {isTimerRunning ? (
              <button className="timerBtn pauseBtn" onClick={handlePause}>
                <Pause size={16} />
                일시정지
              </button>
            ) : (
              <button className="timerBtn startBtn" onClick={handleStart}>
                <Play size={16} />
                {isPaused ? "재개" : "시작"}
              </button>
            )}
            <button className="timerBtn resetBtn" onClick={handleReset}>
              <Target size={16} />
              리셋
            </button>
          </div>
        </div>

        {/* 진행률 섹션 */}
        <div className="progressSection">
          <div className="progressInfo">
            <span className="progressLabel">진행률</span>
            <span className="progressValue">{percentage}%</span>
          </div>
          <div className="progressBar">
            <div
              className="progressFill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="progressDetails">
            <span>완료: {completed}개</span>
            <span>전체: {total}개</span>
          </div>
        </div>

        <div className="sessionInfo">
          <div className="infoGrid">
            <div className="infoItem">
              <span className="label">상태</span>
              <span className="value">
                {isInProgress ? "운동 중" : isPaused ? "일시정지" : "준비"}
              </span>
            </div>
            <div className="infoItem">
              <span className="label">운동 세트</span>
              <span className="value">
                {activeSession.exerciseSets?.length || 0}개
              </span>
            </div>
            {activeSession.notes && (
              <div className="infoItem fullWidth">
                <span className="label">메모</span>
                <span className="value notes">{activeSession.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="sessionActions">
          <div className="primaryActions">
            <button className="actionBtn completeBtn" onClick={handleComplete}>
              <Check size={16} />
              완료
            </button>
          </div>

          <div className="secondaryActions">
            <button
              className="actionBtn viewBtn"
              onClick={() => onViewSession(activeSession.id)}
            >
              상세보기
            </button>
            <button
              className="actionBtn editBtn"
              onClick={() => onEditSession(activeSession.id)}
            >
              <Edit size={14} />
            </button>
            <button
              className="actionBtn deleteBtn"
              onClick={() => onDeleteSession(activeSession.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
