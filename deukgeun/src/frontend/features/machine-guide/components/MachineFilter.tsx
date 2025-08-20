// ============================================================================
// Machine Filter Component
// ============================================================================

import React, { useState, useCallback } from "react"
import {
  MACHINE_CATEGORIES,
  DIFFICULTY_LEVELS,
  TARGET_MUSCLES,
} from "../types"
import "./MachineFilter.css"

interface MachineFilterProps {
  selectedCategory: string
  selectedDifficulty: string
  selectedTarget: string
  searchTerm: string
  onCategoryChange: (category: string) => void
  onDifficultyChange: (difficulty: string) => void
  onTargetChange: (target: string) => void
  onSearchChange: (search: string) => void
  onReset: () => void
}

export const MachineFilter: React.FC<MachineFilterProps> = ({
  selectedCategory,
  selectedDifficulty,
  selectedTarget,
  searchTerm,
  onCategoryChange,
  onDifficultyChange,
  onTargetChange,
  onSearchChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value)
    },
    [onSearchChange]
  )

  // 필터 토글 핸들러
  const handleToggleFilters = useCallback(() => {
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  // 필터 초기화 핸들러
  const handleReset = useCallback(() => {
    onReset()
    setIsExpanded(false)
  }, [onReset])

  // 활성 필터 개수 계산
  const activeFiltersCount = [
    selectedCategory,
    selectedDifficulty,
    selectedTarget,
    searchTerm,
  ].filter(Boolean).length

  return (
    <div className="machine-filter">
      {/* 검색 바 */}
      <div className="filter-search-section">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="운동 기구나 근육 부위를 검색하세요..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="search-clear"
              onClick={() => onSearchChange("")}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>

        {/* 필터 토글 버튼 */}
        <div className="filter-controls">
          <button
            className={`filter-toggle ${isExpanded ? "expanded" : ""}`}
            onClick={handleToggleFilters}
            aria-label="필터 토글"
          >
            <span className="filter-icon">⚙️</span>
            <span className="filter-text">필터</span>
            {activeFiltersCount > 0 && (
              <span className="filter-badge">{activeFiltersCount}</span>
            )}
            <span className="toggle-arrow">{isExpanded ? "▲" : "▼"}</span>
          </button>

          {activeFiltersCount > 0 && (
            <button className="filter-reset" onClick={handleReset}>
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 필터 옵션들 */}
      {isExpanded && (
        <div className="filter-options">
          {/* 카테고리 필터 */}
          <div className="filter-group">
            <h3 className="filter-group-title">카테고리</h3>
            <div className="filter-buttons">
              <button
                className={`filter-button ${
                  selectedCategory === "" ? "active" : ""
                }`}
                onClick={() => onCategoryChange("")}
              >
                전체
              </button>
              {MACHINE_CATEGORIES.map(category => (
                <button
                  key={category}
                  className={`filter-button ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 난이도 필터 */}
          <div className="filter-group">
            <h3 className="filter-group-title">난이도</h3>
            <div className="filter-buttons">
              <button
                className={`filter-button ${
                  selectedDifficulty === "" ? "active" : ""
                }`}
                onClick={() => onDifficultyChange("")}
              >
                전체
              </button>
              {DIFFICULTY_LEVELS.map(difficulty => (
                <button
                  key={difficulty}
                  className={`filter-button difficulty-${difficulty.toLowerCase()} ${
                    selectedDifficulty === difficulty ? "active" : ""
                  }`}
                  onClick={() => onDifficultyChange(difficulty)}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* 타겟 근육 필터 */}
          <div className="filter-group">
            <h3 className="filter-group-title">타겟 근육</h3>
            <div className="filter-buttons">
              <button
                className={`filter-button ${
                  selectedTarget === "" ? "active" : ""
                }`}
                onClick={() => onTargetChange("")}
              >
                전체
              </button>
              {TARGET_MUSCLES.map(target => (
                <button
                  key={target}
                  className={`filter-button ${
                    selectedTarget === target ? "active" : ""
                  }`}
                  onClick={() => onTargetChange(target)}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
