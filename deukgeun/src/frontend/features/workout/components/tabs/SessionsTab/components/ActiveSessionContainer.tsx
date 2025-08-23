import React, { useState } from "react"
import { ChevronDown, ChevronUp, Clock } from "lucide-react"
import { SessionCard } from "../../../../components/cards/SessionCard"
import { GlobalWorkoutTimer } from "../../../timer/GlobalWorkoutTimer"
import { useWorkoutTimer } from "@shared/contexts/WorkoutTimerContext"
import type { WorkoutSession } from "@shared/api/workoutJournalApi"

interface ActiveSessionContainerProps {
  activeSession: WorkoutSession
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
  const [isMinimized, setIsMinimized] = useState(false)
  const { startTimer, pauseTimer, stopTimer } = useWorkoutTimer()

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
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
          {isMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      <div className="active-session-content">
        <SessionCard
          session={activeSession}
          isActive={true}
          onView={() => onViewSession(activeSession.id)}
          onEdit={() => onEditSession(activeSession.id)}
          onDelete={() => onDeleteSession(activeSession.id)}
          onStart={() => {
            startTimer(activeSession.id.toString())
            console.log("세션 시작:", activeSession.id)
          }}
          onPause={() => {
            pauseTimer()
            console.log("세션 일시정지")
          }}
          onComplete={() => {
            stopTimer()
            console.log("세션 완료")
          }}
        />
      </div>
    </div>
  )
}
