import React from "react"

interface SessionsHeaderProps {
  onCreateSession: () => void
}

export const SessionsHeader: React.FC<SessionsHeaderProps> = ({
  onCreateSession,
}) => {
  console.log("📋 [SessionsHeader] 컴포넌트 렌더링")

  const handleCreateSession = () => {
    console.log("🆕 [SessionsHeader] 새 세션 생성 버튼 클릭")
    onCreateSession()
  }

  return (
    <div className="sessions-header">
      <h2>운동 세션</h2>
      <button className="create-session-btn" onClick={handleCreateSession}>
        <span className="icon">+</span>새 세션 시작
      </button>
    </div>
  )
}
