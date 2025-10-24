// ============================================================================
// Optimized Machine Guide Page
// ============================================================================

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useMachines } from "@frontend/features/machine-guide/hooks/useMachines"
import { useFilterState } from "@frontend/features/machine-guide/hooks/useFilterState"
import { MachineFilter } from "@frontend/features/machine-guide/components/MachineFilter"
import { MachineCard } from "@frontend/features/machine-guide/components/MachineCard"
import { MachineModal } from "@frontend/features/machine-guide/components/MachineModal"
import { LoadingSpinner } from "@frontend/features/machine-guide/components/common/LoadingSpinner"
import { ErrorMessage } from "@frontend/features/machine-guide/components/common/ErrorMessage"
import { EmptyState } from "@frontend/features/machine-guide/components/common/EmptyState"
import { validateMachineArray } from "@frontend/features/machine-guide/utils/validation"
import { safeErrorLog } from "@frontend/features/machine-guide/utils/errorHandling"
import { UI_TEXT } from "@frontend/features/machine-guide/utils/constants"
import type { Machine } from "../../../shared/types/dto"
import type { MachineDTO } from "../../../shared/types/dto/machine.dto"
import { Navigation } from "@widgets/Navigation/Navigation"
import "./MachineGuidePage.css"

// 성능 최적화를 위한 컴포넌트 메모이제이션
const MemoizedMachineCard = React.memo(MachineCard)
const MemoizedMachineFilter = React.memo(MachineFilter)
const MemoizedErrorMessage = React.memo(ErrorMessage)
const MemoizedEmptyState = React.memo(EmptyState)

export default function MachineGuidePageOptimized() {
  // 머신 데이터 훅
  const {
    machines,
    loading,
    error,
    currentFilter,
    retryCount,
    fetchMachines,
    getMachinesByCategory,
    getMachinesByDifficulty,
    getMachinesByTarget,
    clearError,
  } = useMachines()

  // 모달 상태
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 데이터 유효성 검사
  const validMachines = useMemo(() => {
    if (!validateMachineArray(machines)) {
      safeErrorLog('Invalid machine data received', 'MachineGuidePage')
      return []
    }
    return machines
  }, [machines])

  // 필터 상태 관리
  const {
    selectedCategory,
    selectedDifficulty,
    selectedTarget,
    searchTerm,
    filteredMachines,
    hasActiveFilters,
    activeFilterCount,
    searchStats,
    setCategory,
    setDifficulty,
    setTarget,
    setSearchTerm,
    resetFilters,
  } = useFilterState(validMachines)

  // 초기 데이터 로드
  useEffect(() => {
    fetchMachines()
  }, [fetchMachines])

  // 머신 카드 클릭 핸들러
  const handleMachineClick = useCallback((machine: MachineDTO) => {
    if (!machine) {
      safeErrorLog('Invalid machine data in click handler', 'MachineGuidePage')
      return
    }
    setSelectedMachine(machine as Machine)
    setIsModalOpen(true)
  }, [])

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedMachine(null)
  }, [])

  // 필터 변경 핸들러들 (안전장치 포함)
  const handleCategoryChange = useCallback(
    async (category: string) => {
      try {
        setCategory(category)
        if (category) {
          await getMachinesByCategory(category)
        } else {
          await fetchMachines()
        }
      } catch (error) {
        safeErrorLog(error, 'Category filter change')
      }
    },
    [setCategory, getMachinesByCategory, fetchMachines]
  )

  const handleDifficultyChange = useCallback(
    async (difficulty: string) => {
      try {
        setDifficulty(difficulty)
        if (difficulty) {
          await getMachinesByDifficulty(difficulty)
        } else {
          await fetchMachines()
        }
      } catch (error) {
        safeErrorLog(error, 'Difficulty filter change')
      }
    },
    [setDifficulty, getMachinesByDifficulty, fetchMachines]
  )

  const handleTargetChange = useCallback(
    async (target: string) => {
      try {
        setTarget(target)
        if (target) {
          await getMachinesByTarget(target)
        } else {
          await fetchMachines()
        }
      } catch (error) {
        safeErrorLog(error, 'Target filter change')
      }
    },
    [setTarget, getMachinesByTarget, fetchMachines]
  )

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search)
  }, [setSearchTerm])

  const handleReset = useCallback(async () => {
    try {
      resetFilters()
      await fetchMachines()
    } catch (error) {
      safeErrorLog(error, 'Filter reset')
    }
  }, [resetFilters, fetchMachines])

  // 에러 처리
  const handleErrorDismiss = useCallback(() => {
    clearError()
  }, [clearError])

  // 머신 카드 렌더링 최적화
  const renderMachineCards = useMemo(() => {
    if (!filteredMachines.length) return null

    return filteredMachines.map((machine) => (
      <MemoizedMachineCard
        key={machine.id}
        machine={machine}
        onClick={handleMachineClick}
        className="machine-card-item"
      />
    ))
  }, [filteredMachines, handleMachineClick])

  // 로딩 상태
  if (loading) {
    return (
      <div className="machine-guide-page">
        <Navigation />
        <LoadingSpinner message={UI_TEXT.LOADING} />
      </div>
    )
  }

  return (
    <div className="machine-guide-page">
      <Navigation />
      
      {/* 헤더 섹션 */}
      <div className="machine-guide-header">
        <h1 className="machine-guide-title">운동 기구 가이드</h1>
        <p className="machine-guide-subtitle">
          다양한 운동 기구의 사용법과 효과를 알아보세요
        </p>
      </div>

      {/* 필터 섹션 */}
      <div className="machine-guide-filters">
        <MemoizedMachineFilter
          selectedCategory={selectedCategory}
          selectedDifficulty={selectedDifficulty}
          selectedTarget={selectedTarget}
          searchTerm={searchTerm}
          onCategoryChange={handleCategoryChange}
          onDifficultyChange={handleDifficultyChange}
          onTargetChange={handleTargetChange}
          onSearchChange={handleSearchChange}
          onReset={handleReset}
        />
      </div>

      {/* 현재 필터 표시 */}
      {currentFilter && (
        <div className="machine-guide-current-filter">
          <span className="current-filter-label">{UI_TEXT.CURRENT_FILTER}</span>
          <span className="current-filter-value">{currentFilter}</span>
        </div>
      )}

      {/* 재시도 상태 표시 */}
      {retryCount > 0 && (
        <div className="retry-status">
          <span className="retry-icon">🔄</span>
          <span className="retry-text">{UI_TEXT.RETRYING} ({retryCount}/3)</span>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <MemoizedErrorMessage
          error={error}
          onDismiss={handleErrorDismiss}
          autoDismiss={true}
        />
      )}

      {/* 머신 목록 */}
      <div className="machine-guide-content">
        {filteredMachines.length > 0 ? (
          <div className="machine-grid">
            {renderMachineCards}
          </div>
        ) : (
          <MemoizedEmptyState
            icon="🏋️"
            title={UI_TEXT.NO_RESULTS}
            description={UI_TEXT.NO_RESULTS_DESCRIPTION}
            actionText={UI_TEXT.RESET_FILTERS}
            onAction={handleReset}
          />
        )}
      </div>

      {/* 머신 상세 모달 */}
      <MachineModal
        machine={selectedMachine}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
