import { useMemo } from "react"
import styles from "./ProgressIndicator.module.css"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
  className?: string
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  className = "",
}: ProgressIndicatorProps) {
  const progressPercentage = useMemo(() => {
    return ((currentStep - 1) / (totalSteps - 1)) * 100
  }, [currentStep, totalSteps])

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercentage}%` }}
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>

      <div className={styles.steps}>
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div
              key={stepNumber}
              className={`${styles.step} ${
                isCompleted ? styles.completed : ""
              } ${isCurrent ? styles.current : ""}`}
            >
              <div className={styles.stepNumber}>
                {isCompleted ? (
                  <span className={styles.checkmark}>✓</span>
                ) : (
                  stepNumber
                )}
              </div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
