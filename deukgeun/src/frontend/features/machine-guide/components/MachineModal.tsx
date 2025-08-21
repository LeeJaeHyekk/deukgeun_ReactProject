// ============================================================================
// Machine Modal Component
// ============================================================================

import React, { useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { Machine } from "../types"
import { findMatchingImage } from "../utils/machineImageUtils"
import { ROUTES } from "@shared/constants/routes"
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
  const navigate = useNavigate()
  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  // ESC 키 이벤트 리스너 등록
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden" // 스크롤 방지
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset" // 스크롤 복원
    }
  }, [isOpen, handleKeyDown])

  // 모달 외부 클릭으로 닫기
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // 모달 닫기 핸들러
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // 동영상 보기 핸들러
  const handleVideoClick = useCallback(() => {
    // 모달을 먼저 닫고 에러 페이지로 이동
    onClose()
    navigate(
      `${ROUTES.ERROR}?code=999&title=${encodeURIComponent("동영상 서비스 준비중")}&message=${encodeURIComponent("동영상 서비스는 현재 개발 중입니다. 조금만 기다려주세요!")}`
    )
  }, [navigate, onClose])

  if (!isOpen || !machine) {
    return null
  }

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
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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
    <div className="machine-modal-backdrop" onClick={handleBackdropClick}>
      <div className="machine-modal">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">{machine.name}</h2>
            {machine.nameKo && machine.nameKo !== machine.name && (
              <p className="modal-subtitle">{machine.nameKo}</p>
            )}
          </div>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="모달 닫기"
          >
            ✕
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="modal-body">
          {/* 이미지 섹션 */}
          <div className="modal-image-section">
            <div className="image-container">
              <img
                src={imagePath}
                alt={machine.name}
                className="modal-image"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.src = "/img/machine/default.png"
                }}
              />
            </div>

            {/* 배지들 */}
            <div className="modal-badges">
              <span className="modal-category-badge">
                {getCategoryIcon(machine.category)} {machine.category}
              </span>
              <span
                className="modal-difficulty-badge"
                style={{
                  backgroundColor: getDifficultyColor(machine.difficulty),
                }}
              >
                {machine.difficulty}
              </span>
            </div>
          </div>

          {/* 정보 섹션 */}
          <div className="modal-info-section">
            {/* 기본 정보 */}
            <div className="info-group">
              <h3 className="info-title">기본 정보</h3>
              <div className="info-content">
                <p className="info-description">{machine.shortDesc}</p>
                {machine.detailDesc && (
                  <div className="detail-description">
                    <h4>상세 설명</h4>
                    <p>{machine.detailDesc}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 타겟 근육 */}
            {machine.targetMuscles && machine.targetMuscles.length > 0 && (
              <div className="info-group">
                <h3 className="info-title">타겟 근육</h3>
                <div className="target-muscles">
                  {machine.targetMuscles.map((muscle, index) => (
                    <span key={index} className="muscle-tag">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 긍정적 효과 */}
            {machine.positiveEffect && (
              <div className="info-group">
                <h3 className="info-title">운동 효과</h3>
                <div className="effects-content">
                  <p className="effects-text">{machine.positiveEffect}</p>
                </div>
              </div>
            )}

            {/* 메타 정보 */}
            <div className="info-group">
              <h3 className="info-title">기타 정보</h3>
              <div className="meta-info">
                <div className="meta-item">
                  <span className="meta-label">기구 키:</span>
                  <span className="meta-value">{machine.machineKey}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">생성일:</span>
                  <span className="meta-value">
                    {new Date(machine.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">수정일:</span>
                  <span className="meta-value">
                    {new Date(machine.updatedAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">상태:</span>
                  <span
                    className={`status-badge ${
                      machine.isActive ? "active" : "inactive"
                    }`}
                  >
                    {machine.isActive ? "활성" : "비활성"}
                  </span>
                </div>
              </div>
            </div>

            {/* 비디오 링크 */}
            <div className="info-group">
              <h3 className="info-title">관련 비디오</h3>
              <div className="video-section">
                <button
                  onClick={handleVideoClick}
                  className="video-link"
                  type="button"
                  aria-label="동영상 서비스 보기 (준비중)"
                >
                  <span className="video-icon">🎥</span>
                  <span className="video-text">동영상 보기</span>
                  <span className="video-status">준비중</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <button className="modal-action-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
