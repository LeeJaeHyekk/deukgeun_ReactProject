import React, { useState } from "react"
import "./NotesInput.css"

interface NotesInputProps {
  initialNotes: string
  onNotesChange: (notes: string) => void
  placeholder?: string
}

export function NotesInput({
  initialNotes,
  onNotesChange,
  placeholder = "메모를 입력하세요...",
}: NotesInputProps) {
  const [notes, setNotes] = useState(initialNotes)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    onNotesChange(newNotes)
  }

  return (
    <div className="notes-input">
      <h3>메모</h3>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder={placeholder}
        className="notes-textarea"
        rows={4}
      />
      <div className="notes-info">
        <span className="notes-count">{notes.length}자</span>
      </div>
    </div>
  )
}
