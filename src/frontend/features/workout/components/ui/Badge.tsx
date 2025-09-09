import React from "react"

interface BadgeProps {
  level: string
  milestone?: string
  className?: string
}

export function Badge({ level, milestone, className = "" }: BadgeProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "쉬움":
        return "badge-easy"
      case "보통":
        return "badge-medium"
      case "어려움":
        return "badge-hard"
      default:
        return "badge-default"
    }
  }

  return (
    <div className={`badge ${getLevelColor(level)} ${className}`}>
      {milestone && <span className="badge-milestone">{milestone}</span>}
      <span className="badge-level">{level}</span>
    </div>
  )
}
