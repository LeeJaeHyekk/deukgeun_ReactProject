import React, { useMemo } from "react"
import type {
  Machine,
  MachineCategory,
  DifficultyLevel,
} from "../../../shared/types"
import {
  findMatchingImage,
  getFullImageUrl,
  handleImageError,
} from "../utils/machineImageUtils"
import "./MachineModal.css"

interface MachineModalProps {
  machine: Machine | null
  isOpen: boolean
  onClose: () => void
}

export const MachineModal: React.FC<MachineModalProps> = React.memo(
  ({ machine, isOpen, onClose }) => {
    // Union 타입을 처리하는 헬퍼 함수들
    const getCategoryDisplay = (
      category: string | MachineCategory
    ): string => {
      if (typeof category === "string") {
        return category
      }
      return category.name
    }

    const getDifficultyDisplay = (
      difficulty: string | DifficultyLevel
    ): string => {
      if (typeof difficulty === "string") {
        return difficulty
      }
      return difficulty.name
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

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    }

    // ESC 키로 모달 닫기
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
      }
    }, [isOpen, onClose])

    // 이미지 URL을 메모이제이션하여 불필요한 재계산 방지
    const imageUrl = useMemo(() => {
      if (!machine) return ""
      const matchedImage = findMatchingImage(machine)
      return getFullImageUrl(matchedImage)
    }, [machine])

    // 조건부 렌더링을 return 문 안에서 처리
    if (!isOpen || !machine) {
      return null
    }

    return (
      <div className="machine-modal-overlay" onClick={handleBackdropClick}>
        <div className="machine-modal">
          <button className="machine-modal-close" onClick={onClose}>
            ✕
          </button>

          <div className="machine-modal-content">
            {/* 이미지 섹션 */}
            <div className="machine-modal-image-section">
              <img
                src={imageUrl}
                alt={machine.name}
                onError={handleImageError}
              />
              <div className="machine-modal-badges">
                <span
                  className="machine-modal-badge category"
                  style={{
                    backgroundColor: getCategoryColor(
                      getCategoryDisplay(machine.category)
                    ),
                  }}
                >
                  {getCategoryDisplay(machine.category)}
                </span>
                {machine.difficulty && (
                  <span
                    className="machine-modal-badge difficulty"
                    style={{
                      backgroundColor: getDifficultyColor(
                        getDifficultyDisplay(machine.difficulty)
                      ),
                    }}
                  >
                    {getDifficultyDisplay(machine.difficulty)}
                  </span>
                )}
              </div>
            </div>

            {/* 정보 섹션 */}
            <div className="machine-modal-info-section">
              <h2 className="machine-modal-title">{machine.name}</h2>

              {machine.description && (
                <div className="machine-modal-section">
                  <h3>설명</h3>
                  <p>{machine.description}</p>
                </div>
              )}

              {machine.instructions && (
                <div className="machine-modal-section">
                  <h3>사용법</h3>
                  <p>{machine.instructions}</p>
                </div>
              )}

              {machine.targetMuscles && machine.targetMuscles.length > 0 && (
                <div className="machine-modal-section">
                  <h3>타겟 근육</h3>
                  <div className="machine-modal-targets">
                    {machine.targetMuscles.map((muscle, index) => (
                      <span key={index} className="machine-modal-target-tag">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {machine.videoUrl && (
                <div className="machine-modal-section">
                  <h3>동영상 가이드</h3>
                  <div className="machine-modal-video">
                    <video controls>
                      <source src={machine.videoUrl} type="video/mp4" />
                      브라우저가 비디오를 지원하지 않습니다.
                    </video>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)
