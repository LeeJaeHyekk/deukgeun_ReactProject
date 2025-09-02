import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { WorkoutSession, ExerciseSet } from "@shared/types"
import type { Machine } from "@dto/index"
import { useWorkoutTimer } from "@shared/contexts/WorkoutTimerContext"
import { useWorkoutStore } from "../../../store/workoutStore"
import { useMachines } from "@shared/hooks/useMachines"
import { TimerDisplay } from "./components/TimerDisplay"
import { ExerciseCard } from "./components/ExerciseCard"
import { SessionNotes } from "./components/SessionNotes"
import { ModalFooter } from "./components/ModalFooter"
import { useSessionState } from "./hooks/useSessionState"
import "./WorkoutSessionModal.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[WorkoutSessionModal] ${message}`, data || "")
  },
  debug: (message: string, data?: any) => {
    console.debug(`[WorkoutSessionModal] ${message}`, data || "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutSessionModal] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutSessionModal] ${message}`, data || "")
  },
  performance: (operation: string, startTime: number) => {
    const duration = performance.now() - startTime
    console.log(
      `[WorkoutSessionModal] ${operation} took ${duration.toFixed(2)}ms`
    )
  },
}

export function WorkoutSessionModal() {
  const { machines } = useMachines()
  const {
    modals: { session: modalState },
    currentSession,
    closeSessionModal,
    createSession,
    updateSession,
  } = useWorkoutStore()

  // 글로벌 타이머 컨텍스트 사용
  const {
    timerState,
    sessionState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setCurrentExercise: setGlobalCurrentExercise,
    completeSet: completeGlobalSet,
    startRestTimer: startGlobalRestTimer,
    stopRestTimer: stopGlobalRestTimer,
    getFormattedTime,
    getSessionProgress,
  } = useWorkoutTimer()

  // 커스텀 훅으로 세션 상태 관리
  const {
    currentSessionData,
    currentExerciseIndex,
    currentSetIndex,
    restTimer,
    isRestTimerRunning,
    completedSets,
    setCurrentSessionData,
    setCurrentExerciseIndex,
    setCurrentSetIndex,
    initializeSession,
    updateSessionData,
    completeSet,
    startRest,
    stopRest,
  } = useSessionState()

  const isOpen = modalState.isOpen
  const isEditMode = modalState.mode === "edit"
  const isViewMode = modalState.mode === "view"
  const session = currentSession

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      logger.info("Modal opened, initializing session", {
        hasSession: !!session,
        mode: modalState.mode,
        machinesCount: machines.length,
      })

      if (session) {
        initializeSession(session)
      }
    }
  }, [isOpen, session, modalState.mode, machines, initializeSession])

  // 모달 닫기 핸들러
  const handleClose = () => {
    logger.info("Modal closing")
    closeSessionModal()
  }

  // 세션 저장 핸들러
  const handleSave = async () => {
    const startTime = performance.now()
    logger.info("Saving session", { sessionData: currentSessionData })

    try {
      if (isEditMode && session && currentSessionData) {
        await updateSession(session.id, {
          ...currentSessionData,
          id: session.id,
          startTime: new Date(currentSessionData.startTime),
        })
        logger.info("Session updated successfully")
      } else if (currentSessionData) {
        await createSession({
          ...currentSessionData,
          name: "새 세션",
          startTime: new Date(currentSessionData.startTime),
        })
        logger.info("Session created successfully")
      }
      handleClose()
      logger.performance("Session save", startTime)
    } catch (error) {
      logger.error("Session save failed", error)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="workout-session-modal-overlay" onClick={handleClose}>
      <div className="workout-session-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <h2>
            {isViewMode ? "세션 보기" : isEditMode ? "세션 편집" : "새 세션"}
          </h2>
          <button className="close-button" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="modal-body">
          {/* 타이머 표시 */}
          <TimerDisplay
            seconds={timerState.seconds}
            label="세션 타이머"
            isRunning={timerState.isRunning}
            onToggle={() =>
              timerState.isRunning ? pauseTimer() : resumeTimer()
            }
            variant="session"
            progress={getSessionProgress()}
          />

          {/* 운동 카드들 */}
          <div className="exercises-container">
            {currentSessionData?.exerciseSets?.map((exercise, index) => (
              <ExerciseCard
                key={index}
                exercise={exercise}
                isCurrent={index === currentExerciseIndex}
                isCompleted={completedSets[index] >= exercise.setNumber}
                completedSets={completedSets[index] || 0}
                totalSets={exercise.setNumber || 1}
                onCompleteSet={() => completeSet(index)}
                onStartRest={startRest}
                order={index + 1}
              />
            )) || (
              <div className="no-exercises-message">
                <p>아직 운동이 추가되지 않았습니다.</p>
                <p>운동을 추가하여 세션을 시작하세요.</p>
              </div>
            )}
          </div>

          {/* 세션 노트 */}
          <SessionNotes
            notes={currentSessionData?.notes || ""}
            onChange={notes => {
              if (currentSessionData) {
                setCurrentSessionData({
                  ...currentSessionData,
                  notes,
                })
              }
            }}
          />
        </div>

        {/* 푸터 */}
        <ModalFooter
          onClose={handleClose}
          onComplete={handleSave}
          isTimerRunning={timerState.isRunning}
          onToggleTimer={() =>
            timerState.isRunning ? pauseTimer() : resumeTimer()
          }
          currentExerciseIndex={currentExerciseIndex}
          totalExercises={currentSessionData?.exerciseSets?.length || 0}
        />
      </div>
    </div>
  )
}
