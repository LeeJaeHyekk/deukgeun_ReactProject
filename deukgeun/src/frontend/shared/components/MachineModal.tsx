import React, { useMemo } from "react"
import { Machine } from "../types/machine"
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

export const MachineModal: React.FC<MachineModalProps> = ({
  machine,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !machine) return null

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
    const matchedImage = findMatchingImage(machine)
    return getFullImageUrl(matchedImage)
  }, [machine.id, machine.name_ko, machine.name_en, machine.image_url])

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
              alt={machine.name_ko}
              onError={handleImageError}
            />
            <div className="machine-modal-badges">
              <span
                className="machine-modal-badge category"
                style={{ backgroundColor: getCategoryColor(machine.category) }}
              >
                {machine.category}
              </span>
              {machine.difficulty_level && (
                <span
                  className="machine-modal-badge difficulty"
                  style={{
                    backgroundColor: getDifficultyColor(
                      machine.difficulty_level
                    ),
                  }}
                >
                  {machine.difficulty_level}
                </span>
              )}
            </div>
          </div>

          {/* 정보 섹션 */}
          <div className="machine-modal-info-section">
            <h2 className="machine-modal-title">{machine.name_ko}</h2>
            {machine.name_en && (
              <p className="machine-modal-subtitle">{machine.name_en}</p>
            )}

            <div className="machine-modal-description">
              <h3>설명</h3>
              <p>{machine.short_desc}</p>
            </div>

            <div className="machine-modal-detail">
              <h3>상세 정보</h3>
              <p>{machine.detail_desc}</p>
            </div>

            {machine.target_muscle && machine.target_muscle.length > 0 && (
              <div className="machine-modal-targets">
                <h3>타겟 근육</h3>
                <div className="machine-modal-target-list">
                  {machine.target_muscle.map((muscle, index) => (
                    <span key={index} className="machine-modal-target-tag">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {machine.positive_effect && (
              <div className="machine-modal-effects">
                <h3>효과</h3>
                <p>{machine.positive_effect}</p>
              </div>
            )}

            {machine.video_url && (
              <div className="machine-modal-video">
                <h3>사용법 동영상</h3>
                <video controls>
                  <source src={machine.video_url} type="video/mp4" />
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
