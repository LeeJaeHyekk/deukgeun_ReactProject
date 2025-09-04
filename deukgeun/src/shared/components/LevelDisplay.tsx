import React from "react"

interface LevelDisplayProps {
  level: number
  experience: number
  maxExperience: number
  showProgress?: boolean
  className?: string
}

export function LevelDisplay({
  level,
  experience,
  maxExperience,
  showProgress = true,
  className,
}: LevelDisplayProps) {
  const progressPercentage = (experience / maxExperience) * 100

  return (
    <div className={`level-display ${className || ""}`}>
      <div className="level-info">
        <span className="level-label">Level {level}</span>
        <span className="experience-text">
          {experience.toLocaleString()} / {maxExperience.toLocaleString()} EXP
        </span>
      </div>
      {showProgress && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
