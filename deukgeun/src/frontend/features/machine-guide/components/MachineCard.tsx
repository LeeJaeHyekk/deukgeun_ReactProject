// ============================================================================
// Machine Card Component
// ============================================================================

import React, { useCallback } from "react"
import { findMatchingImage, getFullImageUrl } from "../utils/machineImageUtils"
import type {
  MachineDTO,
  MachineCategoryDTO,
  DifficultyLevelDTO,
} from "../../../../shared/types/dto/machine.dto"
import "./MachineCard.css"

interface MachineCardProps {
  machine: MachineDTO
  onClick: (machine: MachineDTO) => void
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
        return "#28a745"
      case "intermediate":
        return "#ffc107"
      case "advanced":
        return "#dc3545"
      case "expert":
        return "#6f42c1"
      default:
        return "#6c757d"
    }
  }

  // 카테고리 아이콘 가져오기
  const getCategoryIcon = (category: string | MachineCategoryDTO) => {
    return ""
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
                  : machine.difficulty?.name || 'beginner'
              ),
            }}
          >
            {typeof machine.difficulty === "string"
              ? machine.difficulty
              : machine.difficulty?.name || 'beginner'}
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
              {machine.targetMuscles.map((muscle: string, index: number) => (
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
          {/* 동영상 유무 */}
          <span className="meta-item">
            <span className="meta-icon">🎥</span>
            {machine.videoUrl ? "동영상 있음" : "동영상 없음"}
          </span>
          
          {/* 사용법 단계 수 */}
          <span className="meta-item">
            <span className="meta-icon">📋</span>
            {machine.instructions?.length || 0}단계
          </span>
          
          {/* 활성 상태 */}
          <span className="meta-item">
            <span className="meta-icon">{machine.isActive ? "✅" : "❌"}</span>
            {machine.isActive ? "사용 가능" : "점검 중"}
          </span>
          
          {/* 타겟 근육 수 */}
          <span className="meta-item">
            <span className="meta-icon">💪</span>
            {machine.targetMuscles?.length || 0}개 근육
          </span>
          
          {/* 이미지 정보 (새로 추가) */}
          {machine.imageMetadata && (
            <>
              <span className="meta-item">
                <span className="meta-icon">📏</span>
                {machine.imageMetadata.dimensions.width}x{machine.imageMetadata.dimensions.height}
              </span>
              <span className="meta-item">
                <span className="meta-icon">💾</span>
                {(machine.imageMetadata.fileSize / 1024).toFixed(0)}KB
              </span>
            </>
          )}
        </div>

        <button className="card-action" aria-label="상세 정보 보기">
          <span className="action-text">자세히 보기</span>
          <span className="action-icon">→</span>
        </button>
      </div>
    </div>
  )
}
