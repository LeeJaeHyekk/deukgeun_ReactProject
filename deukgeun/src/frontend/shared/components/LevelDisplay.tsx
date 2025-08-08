import React from "react"
import { useLevel } from "../hooks/useLevel"
import styles from "./LevelDisplay.module.css"

interface LevelDisplayProps {
  showProgress?: boolean
  showRewards?: boolean
  className?: string
}

export function LevelDisplay({
  showProgress = true,
  showRewards = false,
  className = "",
}: LevelDisplayProps) {
  const {
    currentLevel,
    currentExp,
    progressPercentage,
    expToNextLevel,
    rewards,
    isLoading,
    error,
  } = useLevel()

  if (isLoading) {
    return (
      <div className={`${styles.levelDisplay} ${className}`}>
        <div className={styles.loading}>레벨 정보 로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.levelDisplay} ${className}`}>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  return (
    <div className={`${styles.levelDisplay} ${className}`}>
      <div className={styles.levelInfo}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNumber}>Lv.{currentLevel}</span>
        </div>

        {showProgress && (
          <div className={styles.progressInfo}>
            <div className={styles.expInfo}>
              <span className={styles.currentExp}>{currentExp}</span>
              <span className={styles.expSeparator}>/</span>
              <span className={styles.requiredExp}>
                {currentExp + expToNextLevel}
              </span>
              <span className={styles.expLabel}>EXP</span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className={styles.progressText}>
              {progressPercentage.toFixed(1)}% 완료
            </div>
          </div>
        )}
      </div>

      {showRewards && rewards.length > 0 && (
        <div className={styles.rewardsSection}>
          <h4 className={styles.rewardsTitle}>획득한 보상</h4>
          <div className={styles.rewardsList}>
            {rewards.slice(0, 3).map(reward => (
              <div key={reward.id} className={styles.rewardItem}>
                <span className={styles.rewardIcon}>
                  {reward.metadata?.icon || "🏆"}
                </span>
                <span className={styles.rewardName}>
                  {reward.metadata?.description || reward.rewardId}
                </span>
              </div>
            ))}
            {rewards.length > 3 && (
              <div className={styles.moreRewards}>
                +{rewards.length - 3}개 더
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
