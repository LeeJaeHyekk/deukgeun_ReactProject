// ============================================================================
// ControlBar - 제어 버튼들 (최적화)
// ============================================================================

import React, { memo, useMemo, useCallback } from "react"
import { useSelector } from "react-redux"
import { selectActiveWorkout, selectActiveGoalProgress } from "../selectors"
import styles from "./ControlBar.module.css"

interface Props {
  onPause: () => void
  onFinish: () => void
}

function ControlBarComponent({ onPause, onFinish }: Props) {
  // Selector를 통한 진행률 조회 (최적화 - 계산된 값 직접 조회)
  const progress = useSelector(selectActiveGoalProgress)

  // 완료 여부 메모이제이션
  const isCompleted = useMemo(() => progress >= 100, [progress])

  const handleFinish = useCallback(() => {
    if (!isCompleted) {
      alert("운동을 완료하기 위해서는 모든 항목을 100% 완성해야 합니다.")
      return
    }
    onFinish()
  }, [isCompleted, onFinish])

  return (
    <div className={styles.controlBar}>
      <button onClick={onPause} className={styles.pauseButton}>
        정지
      </button>
      <button
        onClick={handleFinish}
        className={styles.finishButton}
        disabled={!isCompleted}
      >
        세션 종료 및 결과 저장
      </button>
    </div>
  )
}

// React.memo로 메모이제이션
export const ControlBar = memo(ControlBarComponent)

