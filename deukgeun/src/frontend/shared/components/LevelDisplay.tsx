import React from "react"
import { useLevel } from "../hooks/useLevel"
import styles from "./LevelDisplay.module.css"
import type { UserLevel } from "../../../shared/types"

interface LevelDisplayProps {
  userLevel?: UserLevel // 테스트용 prop
  showProgress?: boolean
  showRewards?: boolean
  showCooldown?: boolean
  showDailyLimit?: boolean
  className?: string
}

export function LevelDisplay({
  userLevel,
  showProgress = true,
  showRewards = false,
  showCooldown = false,
  showDailyLimit = false,
  className = "",
}: LevelDisplayProps) {
  const {
    levelProgress,
    rewards,
    cooldownInfo,
    dailyLimitInfo,
    isLoading,
    error,
  } = useLevel()

  // 테스트용 userLevel이 제공되면 해당 데이터 사용
  const displayLevel = userLevel ? userLevel.level : levelProgress.level
  const displayExp = userLevel ? userLevel.currentExp : levelProgress.currentExp
  const progressPercentage = levelProgress.progressPercentage
  const expToNextLevel = levelProgress.expToNextLevel

  if (isLoading && !userLevel) {
    return (
      <div className={`${styles.levelDisplay} ${className}`}>
        <div className={styles.loading}>레벨 정보 로딩 중...</div>
      </div>
    )
  }

  if (error && !userLevel) {
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
          <span className={styles.levelNumber}>Lv.{displayLevel}</span>
        </div>

        {showProgress && (
          <div className={styles.progressInfo}>
            <div className={styles.expInfo}>
              <span className={styles.currentExp}>{displayExp}</span>
              <span className={styles.expSeparator}>/</span>
              <span className={styles.requiredExp}>
                {displayExp + expToNextLevel}
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

        {showDailyLimit && dailyLimitInfo && (
          <div className={styles.dailyLimitInfo}>
            <div className={styles.dailyLimitBar}>
              <div
                className={styles.dailyLimitFill}
                style={{
                  width: `${(dailyLimitInfo.dailyExp / dailyLimitInfo.limit) * 100}%`,
                  backgroundColor:
                    dailyLimitInfo.dailyExp >= dailyLimitInfo.limit
                      ? "#ff6b6b"
                      : "#4ecdc4",
                }}
              />
            </div>
            <div className={styles.dailyLimitText}>
              일일 경험치: {dailyLimitInfo.dailyExp}/{dailyLimitInfo.limit}
            </div>
          </div>
        )}

        {showCooldown && cooldownInfo && cooldownInfo.isOnCooldown && (
          <div className={styles.cooldownInfo}>
            <div className={styles.cooldownIcon}>⏰</div>
            <div className={styles.cooldownText}>
              쿨다운: {Math.ceil(cooldownInfo.remainingTime / 1000)}초 남음
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
