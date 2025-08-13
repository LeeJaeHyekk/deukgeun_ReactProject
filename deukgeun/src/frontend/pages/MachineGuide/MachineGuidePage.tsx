import React, { useState } from "react"
import { useMachines } from "../../shared/hooks/useMachines"
import { MachineCard } from "../../shared/components/MachineCard"
import { MachineModal } from "../../shared/components/MachineModal"
import { Navigation } from "../../widgets/Navigation/Navigation"
import { LoadingSpinner } from "../../shared/ui/LoadingSpinner"
import type { Machine } from "../../../types"
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredMachines = machines.filter(
    machine =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.targetMuscles.some(muscle =>
        muscle.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  const categories = [
    { value: "strength", label: "근력" },
    { value: "cardio", label: "유산소" },
    { value: "flexibility", label: "유연성" },
    { value: "balance", label: "균형" },
    { value: "functional", label: "기능성" },
    { value: "rehabilitation", label: "재활" },
  ]

  const difficulties = [
    { value: "beginner", label: "초급" },
    { value: "intermediate", label: "중급" },
    { value: "advanced", label: "고급" },
    { value: "expert", label: "전문가" },
  ]

  const targets = ["가슴", "등", "어깨", "팔", "복근", "하체", "전신"]

  return (
    <div className="machine-guide-page">
      <Navigation />

      <div className="machine-guide-container">
        <header className="machine-guide-header">
          <h1>운동 기구 가이드</h1>
          <p>각 운동 기구의 사용법과 효과를 알아보세요</p>
        </header>

        {/* 필터 섹션 */}
        <div className="machine-guide-filters">
          <div className="filter-group">
            <label>카테고리</label>
            <select
              value={selectedCategory}
              onChange={e => handleCategoryChange(e.target.value)}
            >
              <option value="">전체</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>난이도</label>
            <select
              value={selectedDifficulty}
              onChange={e => handleDifficultyChange(e.target.value)}
            >
              <option value="">전체</option>
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>타겟 근육</label>
            <select
              value={selectedTarget}
              onChange={e => handleTargetChange(e.target.value)}
            >
              <option value="">전체</option>
              {targets.map(target => (
                <option key={target} value={target}>
                  {target}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>검색</label>
            <input
              type="text"
              placeholder="기구명 또는 설명 검색..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="machine-guide-loading">
            <LoadingSpinner />
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="machine-guide-error">
            <p>오류가 발생했습니다: {error}</p>
            <button onClick={() => window.location.reload()}>다시 시도</button>
          </div>
        )}

        {/* 기구 목록 */}
        {!loading && !error && (
          <div className="machine-guide-content">
            {filteredMachines.length === 0 ? (
              <div className="machine-guide-empty">
                <p>조건에 맞는 운동 기구가 없습니다.</p>
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
        )}
      </div>

      {/* 기구 상세 모달 */}
      <MachineModal
        machine={selectedMachine}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
