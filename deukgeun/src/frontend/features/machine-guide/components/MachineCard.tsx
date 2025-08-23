// ============================================================================
// Machine Card Component
// ============================================================================

import React, { useCallback } from "react"
import { findMatchingImage, getFullImageUrl } from "../utils/machineImageUtils"
import type {
  Machine,
  MachineCategoryDTO,
  DifficultyLevelDTO,
} from "@dto/index"
import "./MachineCard.css"

interface MachineCardProps {
  machine: Machine
  onClick: (machine: Machine) => void
  className?: string
}

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  onClick,
  className = "",
}) => {
  // 카드 클릭 핸들러
  const handleClick = useCallback(() => {
    onClick(machine)
  }, [machine, onClick])

  // 이미지 경로 가져오기
  const imagePath = findMatchingImage(machine)

  // 난이도 색상 가져오기
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
      case "초급":
        return "#28a745"
      case "intermediate":
      case "중급":
        return "#ffc107"
      case "advanced":
      case "고급":
        return "#dc3545"
      case "expert":
        return "#6f42c1"
      default:
        return "#6c757d"
    }
  }

  // 카테고리 아이콘 가져오기
  const getCategoryIcon = (category: string | MachineCategoryDTO) => {
    const categoryStr = typeof category === "string" ? category : category.name
    switch (categoryStr.toLowerCase()) {
      case "cardio":
        return "🏃"
      case "strength":
        return "💪"
      case "flexibility":
        return "🧘"
      case "balance":
        return "⚖️"
      case "functional":
        return "🎯"
      case "rehabilitation":
        return "🏥"
      case "상체":
        return "👤"
      case "하체":
        return "🦵"
      case "전신":
        return "🏃‍♂️"
      case "기타":
        return "🔧"
      default:
        return "🏋️"
    }
  }

  return (
    <div
      className={`machine-card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`${machine.name} 상세 정보 보기`}
    >
      {/* 카드 헤더 */}
      <div className="card-header">
        <div className="card-image-container">
          <img
            src={imagePath}
            alt={machine.name}
            className="card-image"
            loading="lazy"
            onError={e => {
              const target = e.target as HTMLImageElement
              target.src = "/img/machine/default.png"
            }}
          />
          <div className="card-overlay">
            <span className="overlay-text">자세히 보기</span>
          </div>
        </div>

        {/* 카테고리 및 난이도 배지 */}
        <div className="card-badges">
          <span className="category-badge">
            {getCategoryIcon(machine.category)}{" "}
            {typeof machine.category === "string"
              ? machine.category
              : machine.category.name}
          </span>
          <span
            className="difficulty-badge"
            style={{
              backgroundColor: getDifficultyColor(
                typeof machine.difficulty === "string"
                  ? machine.difficulty
                  : machine.difficulty.name
              ),
            }}
          >
            {typeof machine.difficulty === "string"
              ? machine.difficulty
              : machine.difficulty.name}
          </span>
        </div>
      </div>

      {/* 카드 본문 */}
      <div className="card-body">
        <h3 className="card-title">{machine.name}</h3>

        {machine.nameKo && machine.nameKo !== machine.name && (
          <p className="card-subtitle">{machine.nameKo}</p>
        )}

        <p className="card-description">{machine.shortDesc}</p>

        {/* 타겟 근육 */}
        {machine.targetMuscles && machine.targetMuscles.length > 0 && (
          <div className="card-targets">
            <span className="targets-label">타겟 근육:</span>
            <div className="targets-list">
              {machine.targetMuscles.map((muscle, index) => (
                <span key={index} className="target-tag">
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 긍정적 효과 */}
        {machine.positiveEffect && (
          <div className="card-effects">
            <span className="effects-label">효과:</span>
            <p className="effects-text">{machine.positiveEffect}</p>
          </div>
        )}
      </div>

      {/* 카드 푸터 */}
      <div className="card-footer">
        <div className="card-meta">
          <span className="meta-item">
            <span className="meta-icon">📅</span>
            {new Date(machine.updatedAt).toLocaleDateString("ko-KR")}
          </span>
          <span className="meta-item">
            <span className="meta-icon">🆔</span>
            {machine.machineKey}
          </span>
        </div>

        <button className="card-action" aria-label="상세 정보 보기">
          <span className="action-text">자세히 보기</span>
          <span className="action-icon">→</span>
        </button>
      </div>
    </div>
  )
}
