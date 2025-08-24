import React, { useState, useEffect } from "react"
import { Button } from "../ui/Button"

interface NotesInputProps {
  onNotesChange: (notes: string) => void
  initialNotes?: string
  placeholder?: string
  maxLength?: number
  autoSave?: boolean
  autoSaveInterval?: number
}

export function NotesInput({
  onNotesChange,
  initialNotes = "",
  placeholder = "운동에 대한 메모를 입력하세요...",
  maxLength = 1000,
  autoSave = true,
  autoSaveInterval = 5000,
}: NotesInputProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)

  // 자동 저장 기능
  useEffect(() => {
    if (!autoSave) return

    const timer = setTimeout(() => {
      if (notes !== initialNotes) {
        setIsAutoSaving(true)
        onNotesChange(notes)
        setLastSaved(new Date())
        setTimeout(() => setIsAutoSaving(false), 1000)
      }
    }, autoSaveInterval)

    return () => clearTimeout(timer)
  }, [notes, autoSave, autoSaveInterval, onNotesChange, initialNotes])

  // 단어 수와 문자 수 계산
  useEffect(() => {
    setCharacterCount(notes.length)
    setWordCount(notes.trim() ? notes.trim().split(/\s+/).length : 0)
  }, [notes])

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    if (newNotes.length <= maxLength) {
      setNotes(newNotes)
    }
  }

  const handleSave = () => {
    onNotesChange(notes)
    setLastSaved(new Date())
  }

  const handleClear = () => {
    setNotes("")
    onNotesChange("")
    setLastSaved(new Date())
  }

  const handleUndo = () => {
    setNotes(initialNotes)
  }

  const formatLastSaved = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getRemainingCharacters = () => {
    return maxLength - characterCount
  }

  const getProgressPercentage = () => {
    return (characterCount / maxLength) * 100
  }

  const getProgressColor = () => {
    const percentage = getProgressPercentage()
    if (percentage >= 90) return "#ef4444"
    if (percentage >= 75) return "#f59e0b"
    return "#3b82f6"
  }

  return (
    <div className="notes-input">
      <div className="notes-header">
        <h3>메모</h3>
        <div className="notes-actions">
          {autoSave && (
            <div className="auto-save-status">
              {isAutoSaving ? (
                <span className="saving-indicator">저장 중...</span>
              ) : lastSaved ? (
                <span className="saved-indicator">
                  마지막 저장: {formatLastSaved(lastSaved)}
                </span>
              ) : (
                <span className="not-saved-indicator">저장되지 않음</span>
              )}
            </div>
          )}
          <Button onClick={handleSave} size="small" variant="primary">
            저장
          </Button>
          <Button onClick={handleClear} size="small" variant="secondary">
            지우기
          </Button>
          {notes !== initialNotes && (
            <Button onClick={handleUndo} size="small" variant="secondary">
              되돌리기
            </Button>
          )}
        </div>
      </div>

      <div className="notes-textarea-container">
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder={placeholder}
          className="notes-textarea"
          rows={6}
          maxLength={maxLength}
        />

        {/* 문자 수 표시 */}
        <div className="character-counter">
          <div className="counter-info">
            <span className="word-count">단어: {wordCount}개</span>
            <span className="character-count">
              문자: {characterCount}/{maxLength}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${getProgressPercentage()}%`,
                backgroundColor: getProgressColor(),
              }}
            />
          </div>
          {getRemainingCharacters() <= 100 && (
            <span className="remaining-chars">
              {getRemainingCharacters()}자 남음
            </span>
          )}
        </div>
      </div>

      {/* 빠른 입력 버튼들 */}
      <div className="quick-notes">
        <h4>빠른 메모</h4>
        <div className="quick-notes-buttons">
          {[
            "컨디션 좋음",
            "컨디션 나쁨",
            "무게 증가",
            "무게 감소",
            "기술 개선",
            "다음에 주의",
            "개인 최고 기록",
            "새로운 운동",
          ].map((quickNote, index) => (
            <button
              key={index}
              type="button"
              className="quick-note-button"
              onClick={() => {
                const newNotes = notes ? `${notes}\n${quickNote}` : quickNote
                setNotes(newNotes)
              }}
            >
              {quickNote}
            </button>
          ))}
        </div>
      </div>

      {/* 메모 미리보기 */}
      {notes && (
        <div className="notes-preview">
          <h4>미리보기</h4>
          <div className="preview-content">
            {notes.split("\n").map((line, index) => (
              <p key={index}>{line || <br />}</p>
            ))}
          </div>
        </div>
      )}

      {/* 메모 통계 */}
      <div className="notes-stats">
        <div className="stat-item">
          <span className="stat-label">총 단어:</span>
          <span className="stat-value">{wordCount}개</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">총 문자:</span>
          <span className="stat-value">{characterCount}개</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">줄 수:</span>
          <span className="stat-value">{notes.split("\n").length}줄</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">사용률:</span>
          <span className="stat-value">
            {getProgressPercentage().toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
