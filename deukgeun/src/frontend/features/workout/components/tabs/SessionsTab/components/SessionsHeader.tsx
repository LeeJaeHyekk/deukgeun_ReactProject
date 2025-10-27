import React from "react"

interface SessionsHeaderProps {
  // onCreateSession: () => void  // 주석 처리: 새 세션 생성 기능 비활성화
}

export const SessionsHeader: React.FC<SessionsHeaderProps> = () => {
  console.log("📋 [SessionsHeader] 컴포넌트 렌더링")

  // const handleCreateSession = () => {  // 주석 처리: 새 세션 생성 기능 비활성화
  //   console.log("🆕 [SessionsHeader] 새 세션 생성 버튼 클릭")
  //   onCreateSession()
  // }

  return (
    <div className="sessions-header">
      <h2>운동 세션</h2>
      {/* 주석 처리: 새 세션 생성 기능 비활성화
      <button className="create-session-btn" onClick={handleCreateSession}>
        <span className="icon">+</span>새 세션 시작
      </button>
      */}
    </div>
  )
}
