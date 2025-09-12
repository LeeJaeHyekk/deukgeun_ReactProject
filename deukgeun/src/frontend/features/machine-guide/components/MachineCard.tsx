// ============================================================================
// Machine Card Component
// ============================================================================

import React, { useCallback } from 'react'
import type { EnhancedMachine } from '@shared/types/machineGuide.types'
import { findMatchingImage, handleImageError } from '../utils/machineImageUtils'
import './MachineCard.css'

interface MachineCardProps {
  machine: EnhancedMachine
  onClick: (machine: EnhancedMachine) => void
  className?: string
}

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  onClick,
  className = '',
}) => {
  // 카드 클릭 핸들러
  const handleClick = useCallback(() => {
    onClick(machine)
  }, [machine, onClick])

  // 이미지 경로 가져오기 (개선된 매칭 로직 사용)
  const imagePath = findMatchingImage(machine)

  // 난이도 색상 가져오기
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case '초급':
        return '#28a745'
      case 'intermediate':
      case '중급':
        return '#ffc107'
      case 'advanced':
      case '고급':
        return '#dc3545'
      case 'expert':
        return '#6f42c1'
      default:
        return '#6c757d'
    }
  }

  // 카테고리 아이콘 가져오기
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'chest':
        return '💪'
      case 'back':
        return '🦾'
      case 'legs':
        return '🦵'
      case 'shoulders':
        return '🤸'
      case 'arms':
        return '💪'
      case 'cardio':
        return '🏃'
      case 'core':
        return '🧘'
      case 'fullbody':
        return '🏃‍♂️'
      default:
        return '🏋️'
    }
  }

  // 카테고리 이름 가져오기
  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      chest: '가슴',
      back: '등',
      legs: '하체',
      shoulders: '어깨',
      arms: '팔',
      cardio: '유산소',
      core: '코어',
      fullbody: '전신',
    }
    return categoryNames[category] || category
  }

  // 난이도 이름 가져오기
  const getDifficultyName = (difficulty: string) => {
    const difficultyNames: Record<string, string> = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급',
      expert: '전문가',
      초급: '초급',
      중급: '중급',
      고급: '고급',
    }
    return difficultyNames[difficulty] || difficulty
  }

  return (
    <div
      className={`machine-card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
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
            onError={handleImageError}
          />
          <div className="card-overlay">
            <span className="overlay-text">자세히 보기</span>
          </div>
        </div>

        {/* 카테고리 및 난이도 배지 */}
        <div className="card-badges">
          <span className="category-badge">
            {getCategoryIcon(machine.category)}{' '}
            {getCategoryName(machine.category)}
          </span>
          <span
            className="difficulty-badge"
            style={{
              backgroundColor: getDifficultyColor(machine.difficulty),
            }}
          >
            {getDifficultyName(machine.difficulty)}
          </span>
        </div>
      </div>

      {/* 카드 본문 */}
      <div className="card-body">
        <h3 className="card-title">{machine.name}</h3>
        <p className="card-subtitle">{machine.nameEn}</p>
        <p className="card-description">{machine.shortDesc}</p>

        {/* 주요 근육 */}
        {machine.anatomy.primaryMuscles &&
          machine.anatomy.primaryMuscles.length > 0 && (
            <div className="card-targets">
              <span className="targets-label">주요 근육:</span>
              <div className="targets-list">
                {machine.anatomy.primaryMuscles
                  .slice(0, 3)
                  .map((muscle, index) => (
                    <span key={index} className="target-tag">
                      {muscle}
                    </span>
                  ))}
                {machine.anatomy.primaryMuscles.length > 3 && (
                  <span className="target-tag more">
                    +{machine.anatomy.primaryMuscles.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* 쉬운 설명 */}
        <div className="card-effects">
          <span className="effects-label">설명:</span>
          <p className="effects-text">{machine.anatomy.easyExplanation}</p>
        </div>
      </div>

      {/* 카드 푸터 */}
      <div className="card-footer">
        <div className="card-meta">
          <div className="meta-item">
            <span className="meta-icon">📊</span>
            <span className="meta-label">추천 횟수</span>
            <span className="meta-value">
              {machine.training.recommendedReps}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">⚡</span>
            <span className="meta-label">난이도</span>
            <span className="meta-value">
              {getDifficultyName(machine.difficulty)}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🎯</span>
            <span className="meta-label">부위</span>
            <span className="meta-value">
              {getCategoryName(machine.category)}
            </span>
          </div>
        </div>

        <button className="card-action" aria-label="상세 정보 보기">
          <span className="action-text">자세히 보기</span>
          <span className="action-icon">→</span>
        </button>
      </div>
    </div>
  )
}
