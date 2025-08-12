import React, { useMemo } from "react"
import { Machine } from "../types/machine"
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
        case "초급":
          return "#4CAF50"
        case "중급":
          return "#FF9800"
        case "고급":
          return "#F44336"
        default:
          return "#9E9E9E"
      }
    }

    const getCategoryColor = (category: string) => {
      switch (category) {
        case "상체":
          return "#2196F3"
        case "하체":
          return "#4CAF50"
        case "전신":
          return "#9C27B0"
        case "기타":
          return "#FF9800"
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
            alt={machine.name_ko}
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
            {machine.difficulty_level && (
              <div
                className="machine-card-difficulty"
                style={{
                  backgroundColor: getDifficultyColor(machine.difficulty_level),
                }}
              >
                {machine.difficulty_level}
              </div>
            )}
          </div>
        </div>

        <div className="machine-card-content">
          <h3 className="machine-card-title">{machine.name_ko}</h3>
          {machine.name_en && (
            <p className="machine-card-subtitle">{machine.name_en}</p>
          )}
          <p className="machine-card-description">{machine.short_desc}</p>

          {machine.target_muscle && machine.target_muscle.length > 0 && (
            <div className="machine-card-targets">
              <span className="machine-card-target-label">타겟 근육:</span>
              <div className="machine-card-target-list">
                {machine.target_muscle.map((muscle, index) => (
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
              className="machine-card-action-btn machine-card-edit-btn"
              onClick={handleEdit}
            >
              수정
            </button>
            <button
              className="machine-card-action-btn machine-card-delete-btn"
              onClick={handleDelete}
            >
              삭제
            </button>
          </div>
        )}
      </div>
    )
  }
)
