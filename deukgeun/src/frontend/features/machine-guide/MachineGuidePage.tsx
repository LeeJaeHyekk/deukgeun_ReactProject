// ============================================================================
// Machine Guide Page
// ============================================================================

import React, { useEffect, useState, useCallback } from "react"
import { useMachines } from "./hooks/useMachines"
import { MachineFilter } from "./components/MachineFilter"
import { MachineCard } from "./components/MachineCard"
import { MachineModal } from "./components/MachineModal"
import type { Machine } from "@dto/index"
import { Navigation } from "@widgets/Navigation/Navigation"
import "./MachineGuidePage.css"

export default function MachineGuidePage() {
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

  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [selectedTarget, setSelectedTarget] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // 초기 데이터 로드
  useEffect(() => {
    fetchMachines()
  }, [fetchMachines])

  // 머신 카드 클릭 핸들러
  const handleMachineClick = useCallback((machine: Machine) => {
    setSelectedMachine(machine)
    setIsModalOpen(true)
  }, [])

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedMachine(null)
  }, [])

  // 카테고리 변경 핸들러
  const handleCategoryChange = useCallback(
    async (category: string) => {
      setSelectedCategory(category)
      setSelectedDifficulty("")
      setSelectedTarget("")
      setSearchTerm("")

      if (category) {
        await getMachinesByCategory(category)
      } else {
        await fetchMachines()
      }
    },
    [getMachinesByCategory, fetchMachines]
  )

  // 난이도 변경 핸들러
  const handleDifficultyChange = useCallback(
    async (difficulty: string) => {
      setSelectedDifficulty(difficulty)
      setSelectedCategory("")
      setSelectedTarget("")
      setSearchTerm("")

      if (difficulty) {
        await getMachinesByDifficulty(difficulty)
      } else {
        await fetchMachines()
      }
    },
    [getMachinesByDifficulty, fetchMachines]
  )

  // 타겟 변경 핸들러
  const handleTargetChange = useCallback(
    async (target: string) => {
      setSelectedTarget(target)
      setSelectedCategory("")
      setSelectedDifficulty("")
      setSearchTerm("")

      if (target) {
        await getMachinesByTarget(target)
      } else {
        await fetchMachines()
      }
    },
    [getMachinesByTarget, fetchMachines]
  )

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search)
  }, [])

  // 필터 초기화 핸들러
  const handleReset = useCallback(async () => {
    setSelectedCategory("")
    setSelectedDifficulty("")
    setSelectedTarget("")
    setSearchTerm("")
    await fetchMachines()
  }, [fetchMachines])

  // 에러 처리
  useEffect(() => {
    if (error) {
      console.error("MachineGuide 에러:", error)
      // 에러가 5초 후 자동으로 사라지도록 설정
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // 검색 필터링
  const filteredMachines = React.useMemo(() => {
    if (!searchTerm.trim()) return machines

    const searchLower = searchTerm.toLowerCase()
    return machines.filter(
      (machine: any) => {
        const categoryStr = typeof machine.category === 'string' 
          ? machine.category 
          : machine.category?.name || ''
        const difficultyStr = typeof machine.difficulty === 'string' 
          ? machine.difficulty 
          : machine.difficulty?.name || ''
        
        return (
          machine.name.toLowerCase().includes(searchLower) ||
          machine.nameKo?.toLowerCase().includes(searchLower) ||
          machine.nameEn?.toLowerCase().includes(searchLower) ||
          machine.shortDesc.toLowerCase().includes(searchLower) ||
          categoryStr.toLowerCase().includes(searchLower) ||
          difficultyStr.toLowerCase().includes(searchLower) ||
          machine.targetMuscles?.some((muscle: any) =>
            muscle.toLowerCase().includes(searchLower)
          )
        )
      }
    )
  }, [machines, searchTerm])

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
        <MachineFilter
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
          <span className="current-filter-label">현재 필터:</span>
          <span className="current-filter-value">{currentFilter}</span>
        </div>
      )}

      {/* 재시도 상태 표시 */}
      {retryCount > 0 && (
        <div className="retry-status">
          <span className="retry-icon">🔄</span>
          <span className="retry-text">재시도 중... ({retryCount}/3)</span>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="machine-guide-error">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button className="error-close" onClick={clearError}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="machine-guide-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 머신 목록 */}
      {!loading && (
        <div className="machine-guide-content">
          {filteredMachines.length > 0 ? (
            <div className="machine-grid">
              {filteredMachines.map((machine: any) => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  onClick={handleMachineClick}
                  className="machine-card-item"
                />
              ))}
            </div>
          ) : (
            <div className="machine-guide-empty">
              <div className="empty-icon">🏋️</div>
              <h3 className="empty-title">검색 결과가 없습니다</h3>
              <p className="empty-description">
                다른 검색어나 필터를 시도해보세요
              </p>
              <button className="empty-reset" onClick={handleReset}>
                필터 초기화
              </button>
            </div>
          )}
        </div>
      )}

      {/* 머신 상세 모달 */}
      <MachineModal
        machine={selectedMachine}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
