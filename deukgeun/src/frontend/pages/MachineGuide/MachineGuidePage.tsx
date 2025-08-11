import React, { useState } from "react"
import { useMachines } from "../../shared/hooks/useMachines"
import { MachineCard } from "../../shared/components/MachineCard"
import { MachineModal } from "../../shared/components/MachineModal"
import { Navigation } from "../../widgets/Navigation/Navigation"
import { LoadingSpinner } from "../../shared/ui/LoadingSpinner"
import {
  Machine,
  MACHINE_CATEGORIES,
  MACHINE_DIFFICULTIES,
  TARGET_MUSCLES,
} from "../../shared/types/machine"
import "./MachineGuidePage.css"

export default function MachineGuidePage() {
  const {
    machines,
    loading,
    error,
    getMachinesByCategory,
    getMachinesByDifficulty,
    getMachinesByTarget,
  } = useMachines()

  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")
  const [selectedTarget, setSelectedTarget] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")

  const handleMachineClick = (machine: Machine) => {
    setSelectedMachine(machine)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMachine(null)
  }

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category)
    setSelectedDifficulty("")
    setSelectedTarget("")

    if (category) {
      await getMachinesByCategory(category)
    } else {
      window.location.reload()
    }
  }

  const handleDifficultyChange = async (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    setSelectedCategory("")
    setSelectedTarget("")

    if (difficulty) {
      await getMachinesByDifficulty(difficulty)
    } else {
      window.location.reload()
    }
  }

  const handleTargetChange = async (target: string) => {
    setSelectedTarget(target)
    setSelectedCategory("")
    setSelectedDifficulty("")

    if (target) {
      await getMachinesByTarget(target)
    } else {
      window.location.reload()
    }
  }

  const filteredMachines = (machines || []).filter(machine => {
    if (!searchTerm) return true

    return (
      machine.name_ko.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.short_desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) {
    return (
      <div className="machine-guide-page">
        <Navigation />
        <div className="machine-guide-loading">
          <LoadingSpinner />
          <p>기구 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="machine-guide-page">
        <Navigation />
        <div className="machine-guide-error">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div className="machine-guide-page">
      <Navigation />

      <div className="machine-guide-container">
        {/* 헤더 */}
        <div className="machine-guide-header">
          <h1>운동 기구 가이드</h1>
          <p>다양한 운동 기구에 대해 알아보세요</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="machine-guide-controls">
          {/* 검색 */}
          <div className="machine-search">
            <input
              type="text"
              placeholder="기구 이름이나 설명으로 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="machine-search-input"
            />
          </div>

          {/* 필터 */}
          <div className="machine-filters">
            <select
              value={selectedCategory}
              onChange={e => handleCategoryChange(e.target.value)}
              className="machine-filter-select"
            >
              <option value="">전체 카테고리</option>
              {MACHINE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={e => handleDifficultyChange(e.target.value)}
              className="machine-filter-select"
            >
              <option value="">전체 난이도</option>
              {MACHINE_DIFFICULTIES.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>

            <select
              value={selectedTarget}
              onChange={e => handleTargetChange(e.target.value)}
              className="machine-filter-select"
            >
              <option value="">전체 근육</option>
              {TARGET_MUSCLES.map(muscle => (
                <option key={muscle} value={muscle}>
                  {muscle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 결과 정보 */}
        <div className="machine-guide-info">
          <p>
            총 <strong>{filteredMachines.length}</strong>개의 기구
            {selectedCategory && ` • ${selectedCategory}`}
            {selectedDifficulty && ` • ${selectedDifficulty}`}
            {selectedTarget && ` • ${selectedTarget}`}
          </p>
        </div>

        {/* 기구 목록 */}
        {filteredMachines.length === 0 ? (
          <div className="machine-guide-empty">
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 필터를 시도해보세요.</p>
          </div>
        ) : (
          <div className="machine-guide-grid">
            {filteredMachines.map(machine => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onClick={handleMachineClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* 모달 */}
      <MachineModal
        machine={selectedMachine}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
