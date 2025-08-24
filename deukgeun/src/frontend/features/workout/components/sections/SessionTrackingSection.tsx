import React, { useState } from "react"
import { SessionTimer } from "../timer/SessionTimer"
import { SetInput } from "../forms/SetInput"
import { MachineSelector } from "../forms/MachineSelector"
import { NotesInput } from "../forms/NotesInput"
import { WorkoutSessionDTO } from "../../types"

interface SessionTrackingSectionProps {
  activeSessions: WorkoutSessionDTO[]
  onUpdateSession: (
    sessionId: number,
    updates: Partial<WorkoutSessionDTO>
  ) => Promise<any>
}

export function SessionTrackingSection({
  activeSessions,
  onUpdateSession,
}: SessionTrackingSectionProps) {
  // 로컬 상태 관리
  const [currentExercise, setCurrentExercise] = useState("벤치프레스")
  const [currentSetNumber, setCurrentSetNumber] = useState(1)
  const [selectedMachineId, setSelectedMachineId] = useState<
    number | undefined
  >()
  const [sessionNotes, setSessionNotes] = useState("")

  // 세트 완료 핸들러
  const handleSetComplete = (setData: {
    repsCompleted: number
    weightKg?: number
    durationSeconds?: number
    rpeRating?: number
    notes?: string
    isPersonalBest: boolean
  }) => {
    console.log("세트 완료:", setData)
    // 다음 세트로 이동
    setCurrentSetNumber(prev => prev + 1)
  }

  // 세트 스킵 핸들러
  const handleSetSkip = () => {
    console.log("세트 스킵")
    // 다음 세트로 이동
    setCurrentSetNumber(prev => prev + 1)
  }

  // 기구 선택 핸들러
  const handleMachineSelect = (machineId: number) => {
    setSelectedMachineId(machineId)
    console.log("기구 선택:", machineId)
  }

  // 메모 변경 핸들러
  const handleNotesChange = (notes: string) => {
    setSessionNotes(notes)
    console.log("메모 변경:", notes)
  }

  return (
    <section className="workout-section" id="sessionTracking">
      <div className="workout-section-header">
        <div>
          <h2 className="workout-section-title">실시간 세션 트래킹</h2>
          <p className="workout-section-description">
            실시간 운동 세션 기록과 세트별 트래킹
          </p>
        </div>
      </div>

      <div className="session-tracking-content">
        <div className="session-tracking-grid">
          {/* 세션 타이머 */}
          <div className="session-timer-section">
            <SessionTimer />
          </div>

          {/* 세트 입력 */}
          <div className="set-input-section">
            <SetInput
              exerciseName={currentExercise}
              setNumber={currentSetNumber}
              onSetComplete={handleSetComplete}
              onSetSkip={handleSetSkip}
            />
          </div>

          {/* 기구 선택 */}
          <div className="machine-selector-section">
            <MachineSelector
              onMachineSelect={handleMachineSelect}
              selectedMachineId={selectedMachineId}
            />
          </div>

          {/* 메모 입력 */}
          <div className="notes-input-section">
            <NotesInput
              onNotesChange={handleNotesChange}
              initialNotes={sessionNotes}
              placeholder="세션에 대한 메모를 입력하세요..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}
