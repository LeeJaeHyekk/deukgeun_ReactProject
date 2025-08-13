import React, { useMemo } from "react"
import type { Machine } from "../../../types"
import {
  findMatchingImage,
  getFullImageUrl,
  handleImageError,
} from "../utils/machineImageUtils"
import "./MachineCard.css"

interface MachineCardProps {
  machine: Machine
  onClick?: (machine: Machine) => void
  showActions?: boolean
  onEdit?: (machine: Machine) => void
  onDelete?: (machine: Machine) => void
}

export const MachineCard: React.FC<MachineCardProps> = React.memo(
  ({ machine, onClick, showActions = false, onEdit, onDelete }) => {
    const handleClick = () => {
      if (onClick) {
        onClick(machine)
      }
    }

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onEdit) {
        onEdit(machine)
      }
    }

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onDelete) {
        onDelete(machine)
      }
    }

    const getDifficultyColor = (difficulty?: string) => {
      switch (difficulty) {
        case "beginner":
          return "#4CAF50"
        case "intermediate":
          return "#FF9800"
        case "advanced":
          return "#F44336"
        case "expert":
          return "#9C27B0"
        default:
          return "#9E9E9E"
      }
    }

    const getCategoryColor = (category: string) => {
      switch (category) {
        case "strength":
          return "#2196F3"
        case "cardio":
          return "#4CAF50"
        case "flexibility":
          return "#9C27B0"
        case "balance":
          return "#FF9800"
        case "functional":
          return "#607D8B"
        case "rehabilitation":
          return "#795548"
        default:
          return "#9E9E9E"
      }
    }

    // 이미지 URL을 메모이제이션하여 불필요한 재계산 방지
    const imageUrl = useMemo(() => {
      const matchedImage = findMatchingImage(machine)
      return getFullImageUrl(matchedImage)
    }, [machine])

    return (
      <div className="machine-card" onClick={handleClick}>
        <div className="machine-card-image">
          <img
            src={imageUrl}
            alt={machine.name}
            onError={handleImageError}
            loading="lazy" // 지연 로딩으로 성능 최적화
          />
          <div className="machine-card-overlay">
            <div
              className="machine-card-category"
              style={{ backgroundColor: getCategoryColor(machine.category) }}
            >
              {machine.category}
            </div>
            {machine.difficulty && (
              <div
                className="machine-card-difficulty"
                style={{
                  backgroundColor: getDifficultyColor(machine.difficulty),
                }}
              >
                {machine.difficulty}
              </div>
            )}
          </div>
        </div>

        <div className="machine-card-content">
          <h3 className="machine-card-title">{machine.name}</h3>
          <p className="machine-card-description">
            {machine.description || ""}
          </p>

          {machine.targetMuscles && machine.targetMuscles.length > 0 && (
            <div className="machine-card-targets">
              <span className="machine-card-target-label">타겟 근육:</span>
              <div className="machine-card-target-list">
                {machine.targetMuscles.map((muscle, index) => (
                  <span key={index} className="machine-card-target-tag">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {showActions && (
          <div className="machine-card-actions">
            <button
              className="machine-card-action-btn edit"
              onClick={handleEdit}
              title="편집"
            >
              ✏️
            </button>
            <button
              className="machine-card-action-btn delete"
              onClick={handleDelete}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    )
  }
)
