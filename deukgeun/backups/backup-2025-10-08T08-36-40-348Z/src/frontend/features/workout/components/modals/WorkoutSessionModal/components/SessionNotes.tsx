import React, { useState } from "react"

interface SessionNotesProps {
  notes: string
  onChange: (notes: string) => void
}

export const SessionNotes: React.FC<SessionNotesProps> = ({
  notes,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`session-notes ${isExpanded ? "expanded" : ""}`}>
      <div className="notes-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span>세션 메모</span>
        <button className="expand-btn">{isExpanded ? "접기" : "펼치기"}</button>
      </div>
      {isExpanded && (
        <textarea
          value={notes}
          onChange={e => onChange(e.target.value)}
          placeholder="이번 세션에 대한 메모를 입력하세요"
          rows={3}
          className="notes-textarea"
        />
      )}
    </div>
  )
}
