// ============================================================================
// Enhanced Machine Modal Component
// ============================================================================

import React, { useEffect, useCallback, useState, useMemo } from 'react'
import type { EnhancedMachine } from '@shared/types/machineGuide.types'
import {
  findMatchingImage,
  handleImageError,
  clearMachineCache,
  preloadImages,
} from '../utils/machineImageUtils'
import {
  fillMachineData,
  getSafeText,
  getSafeArray,
} from '../utils/machineDataUtils'
import './MachineModal.css'

interface MachineModalProps {
  machine: EnhancedMachine | null
  isOpen: boolean
  onClose: () => void
}

type TabType = 'guide' | 'anatomy' | 'training' | 'safety'

export const MachineModal: React.FC<MachineModalProps> = ({
  machine,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('guide')
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [filledMachine, setFilledMachine] = useState<EnhancedMachine | null>(
    null
  )

  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  // ESC 키 이벤트 리스너 등록
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 모달이 열릴 때 body 스크롤은 유지하되, 모달 내부에서만 스크롤 처리
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
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
    // 모달 닫을 때 상태 초기화
    setActiveTab('guide')
    setSelectedImage('')
    setFilledMachine(null)
    onClose()
  }, [onClose])

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  // 머신 데이터 초기화 및 보완
  useEffect(() => {
    if (machine) {
      console.log('🔍 원본 머신 데이터:', machine)

      // 머신이 변경될 때마다 캐시를 초기화하여 최신 데이터 반영
      clearMachineCache(machine.id, machine.name)

      const filled = fillMachineData(machine)
      console.log('🔍 보완된 머신 데이터:', filled)
      setFilledMachine(filled)

      // 개선된 이미지 매칭 로직 사용
      const mainImage = findMatchingImage(machine)
      setSelectedImage(mainImage)

      // 이미지 프리로딩
      preloadImages([mainImage]).then(results => {
        console.log('🖼️ 이미지 프리로딩 결과:', results)
      })
    } else {
      // 머신이 없으면 상태 초기화
      setFilledMachine(null)
      setSelectedImage('')
    }
  }, [machine])

  // 난이도 색상 가져오기 (메모이제이션)
  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case '초급':
        return '#22c55e'
      case 'intermediate':
      case '중급':
        return '#f59e0b'
      case 'advanced':
      case '고급':
        return '#ef4444'
      case 'expert':
        return '#8b5cf6'
      default:
        return '#6b7280'
    }
  }, [])

  // 카테고리 아이콘 가져오기 (메모이제이션)
  const getCategoryIcon = useCallback((category: string) => {
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
  }, [])

  // 메모이제이션된 스타일 값들 (조건부로 계산)
  const difficultyColor = useMemo(() => {
    if (!filledMachine) return '#6b7280'
    return getDifficultyColor(filledMachine.difficulty)
  }, [filledMachine?.difficulty, getDifficultyColor])

  const categoryIcon = useMemo(() => {
    if (!filledMachine) return '🏋️'
    return getCategoryIcon(filledMachine.category)
  }, [filledMachine?.category, getCategoryIcon])

  // 조건부 렌더링 체크
  if (!isOpen || !machine || !filledMachine) {
    console.log('🚫 모달 렌더링 조건 미충족:', {
      isOpen,
      hasMachine: !!machine,
      hasFilledMachine: !!filledMachine,
    })
    return null
  }

  console.log('✅ 모달 렌더링 시작:', {
    machineName: filledMachine.name,
    selectedImage,
    activeTab,
  })

  // 탭 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case 'guide':
        return (
          <div className="tab-content">
            <div className="guide-section">
              <h3 className="section-title">운동 방법</h3>

              {/* 설정 */}
              <div className="guide-item">
                <h4 className="guide-subtitle">⚙️ 설정</h4>
                <p className="guide-text">
                  {getSafeText(filledMachine.guide.setup)}
                </p>
              </div>

              {/* 호흡 */}
              <div className="guide-item">
                <h4 className="guide-subtitle">🫁 호흡</h4>
                <p className="guide-text">
                  {getSafeText(filledMachine.guide.breathing)}
                </p>
              </div>

              {/* 실행 */}
              <div className="guide-item">
                <h4 className="guide-subtitle">🏃‍♂️ 실행</h4>
                <ul className="guide-list">
                  {getSafeArray(filledMachine.guide.execution).map(
                    (step, index) => (
                      <li key={index} className="guide-step">
                        <span className="step-number">{index + 1}.</span>
                        {step}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* 안전 팁 */}
              <div className="guide-item">
                <h4 className="guide-subtitle">⚠️ 안전 팁</h4>
                <ul className="guide-list">
                  {getSafeArray(filledMachine.guide.safetyTips).map(
                    (tip, index) => (
                      <li key={index} className="guide-step">
                        ✅ {tip}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* 이상적인 자극 */}
              <div className="guide-item">
                <h4 className="guide-subtitle">💪 이상적인 자극</h4>
                <p className="guide-text">
                  {getSafeText(filledMachine.guide.idealStimulus)}
                </p>
              </div>

              {/* 일반적인 실수 */}
              <div className="guide-item">
                <h4 className="guide-subtitle">❌ 일반적인 실수</h4>
                <ul className="guide-list">
                  {getSafeArray(filledMachine.guide.commonMistakes).map(
                    (mistake, index) => (
                      <li key={index} className="guide-step">
                        ⚠️ {mistake}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* 움직임 방향 */}
              <div className="guide-item">
                <h4 className="guide-subtitle">🔄 움직임 방향</h4>
                <p className="guide-text">
                  {getSafeText(filledMachine.guide.movementDirection)}
                </p>
              </div>
            </div>
          </div>
        )

      case 'anatomy':
        return (
          <div className="tab-content">
            <div className="anatomy-section">
              <h3 className="section-title">근육 정보</h3>

              {/* 주요 근육 */}
              <div className="anatomy-item">
                <h4 className="anatomy-subtitle">
                  🎯 주요 근육 (Primary Muscles)
                </h4>
                <div className="muscle-tags">
                  {getSafeArray(filledMachine.anatomy.primaryMuscles).length >
                  0 ? (
                    getSafeArray(filledMachine.anatomy.primaryMuscles).map(
                      (muscle, index) => (
                        <span key={index} className="muscle-tag primary">
                          {muscle}
                        </span>
                      )
                    )
                  ) : (
                    <span className="no-data-text">데이터가 없습니다</span>
                  )}
                </div>
              </div>

              {/* 보조 근육 */}
              <div className="anatomy-item">
                <h4 className="anatomy-subtitle">
                  🤝 보조 근육 (Secondary Muscles)
                </h4>
                <div className="muscle-tags">
                  {getSafeArray(filledMachine.anatomy.secondaryMuscles).length >
                  0 ? (
                    getSafeArray(filledMachine.anatomy.secondaryMuscles).map(
                      (muscle, index) => (
                        <span key={index} className="muscle-tag secondary">
                          {muscle}
                        </span>
                      )
                    )
                  ) : (
                    <span className="no-data-text">데이터가 없습니다</span>
                  )}
                </div>
              </div>

              {/* 길항근 */}
              <div className="anatomy-item">
                <h4 className="anatomy-subtitle">
                  ⚖️ 길항근 (Antagonist Muscles)
                </h4>
                <div className="muscle-tags">
                  {getSafeArray(filledMachine.anatomy.antagonistMuscles)
                    .length > 0 ? (
                    getSafeArray(filledMachine.anatomy.antagonistMuscles).map(
                      (muscle, index) => (
                        <span key={index} className="muscle-tag antagonist">
                          {muscle}
                        </span>
                      )
                    )
                  ) : (
                    <span className="no-data-text">데이터가 없습니다</span>
                  )}
                </div>
              </div>

              {/* 쉬운 설명 */}
              <div className="anatomy-item">
                <h4 className="anatomy-subtitle">💡 쉬운 설명</h4>
                <p className="anatomy-explanation">
                  {getSafeText(filledMachine.anatomy.easyExplanation)}
                </p>
              </div>
            </div>
          </div>
        )

      case 'training':
        return (
          <div className="tab-content">
            <div className="training-section">
              <h3 className="section-title">훈련 가이드</h3>

              <div className="training-grid">
                <div className="training-item">
                  <h4 className="training-subtitle">권장 횟수</h4>
                  <p className="training-value">
                    {getSafeText(filledMachine.training.recommendedReps)}
                  </p>
                </div>

                <div className="training-item">
                  <h4 className="training-subtitle">권장 세트</h4>
                  <p className="training-value">
                    {getSafeText(filledMachine.training.recommendedSets)}
                  </p>
                </div>

                <div className="training-item">
                  <h4 className="training-subtitle">휴식 시간</h4>
                  <p className="training-value">
                    {getSafeText(filledMachine.training.restTime)}
                  </p>
                </div>
              </div>

              <div className="training-item">
                <h4 className="training-subtitle">운동 변형</h4>
                <ul className="training-list">
                  {getSafeArray(filledMachine.training.variations).map(
                    (variation, index) => (
                      <li key={index} className="training-variation">
                        {variation}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="training-item">
                <h4 className="training-subtitle">레벨업 옵션</h4>
                <ul className="training-list">
                  {getSafeArray(filledMachine.training.levelUpOptions).map(
                    (option, index) => (
                      <li key={index} className="training-option">
                        {option}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="training-item">
                <h4 className="training-subtitle">초보자 팁</h4>
                <ul className="training-list">
                  {getSafeArray(filledMachine.training.beginnerTips).map(
                    (tip, index) => (
                      <li key={index} className="training-tip">
                        {tip}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'safety':
        return (
          <div className="tab-content">
            <div className="safety-section">
              <h3 className="section-title">안전 가이드</h3>

              {/* 일반적인 실수 */}
              <div className="safety-item">
                <h4 className="safety-subtitle">❌ 일반적인 실수</h4>
                <ul className="safety-list">
                  {getSafeArray(filledMachine.guide.commonMistakes).length >
                  0 ? (
                    getSafeArray(filledMachine.guide.commonMistakes).map(
                      (mistake, index) => (
                        <li key={index} className="safety-mistake">
                          ⚠️ {mistake}
                        </li>
                      )
                    )
                  ) : (
                    <li className="no-data-text">데이터가 없습니다</li>
                  )}
                </ul>
              </div>

              {/* 안전 팁 */}
              <div className="safety-item">
                <h4 className="safety-subtitle">✅ 안전 팁</h4>
                <ul className="safety-list">
                  {getSafeArray(filledMachine.guide.safetyTips).length > 0 ? (
                    getSafeArray(filledMachine.guide.safetyTips).map(
                      (tip, index) => (
                        <li key={index} className="safety-tip">
                          ✅ {tip}
                        </li>
                      )
                    )
                  ) : (
                    <li className="no-data-text">데이터가 없습니다</li>
                  )}
                </ul>
              </div>

              {/* 일상 활용 */}
              <div className="safety-item">
                <h4 className="safety-subtitle">🏠 일상 활용</h4>
                <p className="safety-daily-use">
                  {getSafeText(filledMachine.extraInfo.dailyUseCase) ||
                    '데이터가 없습니다'}
                </p>
              </div>

              {/* 검색 키워드 */}
              <div className="safety-item">
                <h4 className="safety-subtitle">🔍 검색 키워드</h4>
                <div className="keyword-tags">
                  {getSafeArray(filledMachine.extraInfo.searchKeywords).length >
                  0 ? (
                    getSafeArray(filledMachine.extraInfo.searchKeywords).map(
                      (keyword, index) => (
                        <span key={index} className="keyword-tag">
                          #{keyword}
                        </span>
                      )
                    )
                  ) : (
                    <span className="no-data-text">데이터가 없습니다</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="machine-modal-backdrop" onClick={handleBackdropClick}>
      <div className="machine-modal">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">{getSafeText(filledMachine.name)}</h2>
            <p className="modal-subtitle">
              {getSafeText(filledMachine.nameEn)}
            </p>
          </div>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="모달 닫기"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="modal-body">
          {/* 이미지 및 기본 정보 섹션 */}
          <div className="modal-image-section">
            <div className="image-container">
              <img
                src={selectedImage}
                alt={getSafeText(filledMachine.name)}
                className="modal-image"
                onError={handleImageError}
              />
            </div>

            {/* 배지들 */}
            <div className="modal-badges">
              <span className="modal-category-badge">
                {categoryIcon} {getSafeText(filledMachine.category)}
              </span>
              <span
                className="modal-difficulty-badge"
                style={{
                  backgroundColor: difficultyColor,
                }}
              >
                {getSafeText(filledMachine.difficulty)}
              </span>
            </div>

            {/* 기본 설명 */}
            <div className="modal-description">
              <p>{getSafeText(filledMachine.shortDesc)}</p>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="modal-tabs">
            <button
              className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
              onClick={() => handleTabChange('guide')}
            >
              📋 운동법
            </button>
            <button
              className={`tab-button ${activeTab === 'anatomy' ? 'active' : ''}`}
              onClick={() => handleTabChange('anatomy')}
            >
              🧬 근육
            </button>
            <button
              className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
              onClick={() => handleTabChange('training')}
            >
              💪 훈련
            </button>
            <button
              className={`tab-button ${activeTab === 'safety' ? 'active' : ''}`}
              onClick={() => handleTabChange('safety')}
            >
              ⚠️ 안전
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="modal-content">{renderTabContent()}</div>
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <button className="modal-action-btn primary" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
