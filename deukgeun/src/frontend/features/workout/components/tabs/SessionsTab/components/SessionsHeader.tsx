import React from "react"

interface SessionsHeaderProps {
  onCreateSession: () => void
}

export const SessionsHeader: React.FC<SessionsHeaderProps> = ({
  onCreateSession,
}) => {
  return (
    <div className="sessions-header">
      <h2>운동 세션</h2>
      <button className="create-session-btn" onClick={onCreateSession}>
        <span className="icon">+</span>새 세션 시작
      </button>
    </div>
  )
}
