import React, { useState } from "react"
import styles from "./SetInput.module.css"

interface SetInputProps {
  exerciseName: string
  setNumber: number
  onSetComplete: (setData: {
    reps: number
    weight?: number
    rpe?: number
    distance?: number
  }) => void
  onSetSkip: () => void
}

export function SetInput({
  exerciseName,
  setNumber,
  onSetComplete,
  onSetSkip,
}: SetInputProps) {
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")
  const [rpe, setRpe] = useState("")
  const [distance, setDistance] = useState("")

  const handleComplete = () => {
    if (!reps) return

    onSetComplete({
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : undefined,
      rpe: rpe ? parseInt(rpe) : undefined,
      distance: distance ? parseFloat(distance) : undefined,
    })

    // 입력 필드 초기화
    setReps("")
    setWeight("")
    setRpe("")
    setDistance("")
  }

  return (
    <div className={styles.setInput}>
      <h3>세트 입력</h3>
      <div className={styles.setInfo}>
        <span className={styles.exerciseName}>{exerciseName}</span>
        <span className={styles.setNumber}>{setNumber}세트</span>
      </div>

      <div className={styles.setInputs}>
        <div className={styles.inputGroup}>
          <label>횟수</label>
          <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder="횟수"
            min="0"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>무게 (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="무게"
            min="0"
            step="0.5"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>RPE</label>
          <input
            type="number"
            value={rpe}
            onChange={e => setRpe(e.target.value)}
            placeholder="RPE"
            min="1"
            max="10"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>거리 (m)</label>
          <input
            type="number"
            value={distance}
            onChange={e => setDistance(e.target.value)}
            placeholder="거리"
            min="0"
          />
        </div>
      </div>

      <div className={styles.setActions}>
        <button
          onClick={handleComplete}
          className={styles.completeBtn}
          disabled={!reps}
        >
          완료
        </button>
        <button onClick={onSetSkip} className={styles.skipBtn}>
          스킵
        </button>
      </div>
    </div>
  )
}
