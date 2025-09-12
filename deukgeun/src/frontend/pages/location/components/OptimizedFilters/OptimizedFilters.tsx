import React, { useState, useEffect } from 'react'
import styles from './OptimizedFilters.module.css'

export interface FilterOption {
  id: string
  label: string
  icon?: string
  count?: number
}

export interface OptimizedFiltersProps {
  filters: FilterOption[]
  activeFilters: string[]
  onFilterChange: (filterIds: string[]) => void
  showCounts?: boolean
  maxVisibleFilters?: number
  className?: string
}

export function OptimizedFilters({
  filters,
  activeFilters,
  onFilterChange,
  showCounts = true,
  maxVisibleFilters = 5,
  className = '',
}: OptimizedFiltersProps) {
  const [showAll, setShowAll] = useState(false)
  const [visibleFilters, setVisibleFilters] = useState<FilterOption[]>([])

  // 필터 표시 개수 조정
  useEffect(() => {
    if (showAll || filters.length <= maxVisibleFilters) {
      setVisibleFilters(filters)
    } else {
      setVisibleFilters(filters.slice(0, maxVisibleFilters))
    }
  }, [filters, showAll, maxVisibleFilters])

  // 필터 토글
  const toggleFilter = (filterId: string) => {
    const newActiveFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(id => id !== filterId)
      : [...activeFilters, filterId]

    onFilterChange(newActiveFilters)
  }

  // 모든 필터 클리어
  const clearAllFilters = () => {
    onFilterChange([])
  }

  // 필터 표시 토글
  const toggleShowAll = () => {
    setShowAll(!showAll)
  }

  return (
    <div className={`${styles.filtersContainer} ${className}`}>
      <div className={styles.filtersHeader}>
        <h3 className={styles.filtersTitle}>필터</h3>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className={styles.clearAllButton}
            type="button"
          >
            모두 해제
          </button>
        )}
      </div>

      <div className={styles.filtersGrid}>
        {visibleFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => toggleFilter(filter.id)}
            className={`${styles.filterButton} ${
              activeFilters.includes(filter.id) ? styles.active : ''
            }`}
            type="button"
          >
            {filter.icon && (
              <span className={styles.filterIcon}>{filter.icon}</span>
            )}
            <span className={styles.filterLabel}>{filter.label}</span>
            {showCounts && filter.count !== undefined && (
              <span className={styles.filterCount}>({filter.count})</span>
            )}
          </button>
        ))}
      </div>

      {filters.length > maxVisibleFilters && (
        <button
          onClick={toggleShowAll}
          className={styles.showMoreButton}
          type="button"
        >
          {showAll
            ? '접기'
            : `더 보기 (${filters.length - maxVisibleFilters}개)`}
        </button>
      )}

      {/* 활성 필터 요약 */}
      {activeFilters.length > 0 && (
        <div className={styles.activeFiltersSummary}>
          <span className={styles.summaryText}>
            {activeFilters.length}개 필터 적용됨
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * 거리 필터 컴포넌트
 */
export interface DistanceFilterProps {
  maxDistance: number
  onDistanceChange: (distance: number) => void
  minDistance?: number
  maxDistanceLimit?: number
  step?: number
  className?: string
}

export function DistanceFilter({
  maxDistance,
  onDistanceChange,
  minDistance = 1,
  maxDistanceLimit = 20,
  step = 1,
  className = '',
}: DistanceFilterProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDistance = parseInt(e.target.value)
    onDistanceChange(newDistance)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className={`${styles.distanceFilter} ${className}`}>
      <div className={styles.distanceHeader}>
        <label htmlFor="distance-range" className={styles.distanceLabel}>
          검색 반경
        </label>
        <span className={styles.distanceValue}>{maxDistance}km</span>
      </div>

      <div className={styles.sliderContainer}>
        <input
          id="distance-range"
          type="range"
          min={minDistance}
          max={maxDistanceLimit}
          step={step}
          value={maxDistance}
          onChange={handleSliderChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className={`${styles.rangeSlider} ${isDragging ? styles.dragging : ''}`}
        />

        <div className={styles.sliderLabels}>
          <span>{minDistance}km</span>
          <span>{maxDistanceLimit}km</span>
        </div>
      </div>
    </div>
  )
}

/**
 * 정렬 옵션 컴포넌트
 */
export interface SortOption {
  id: string
  label: string
  direction: 'asc' | 'desc'
}

export interface SortFilterProps {
  sortBy: string
  sortDirection: 'asc' | 'desc'
  onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void
  options: SortOption[]
  className?: string
}

export function SortFilter({
  sortBy,
  sortDirection,
  onSortChange,
  options,
  className = '',
}: SortFilterProps) {
  const handleSortChange = (optionId: string) => {
    if (sortBy === optionId) {
      // 같은 옵션 클릭 시 방향 토글
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      onSortChange(optionId, newDirection)
    } else {
      // 다른 옵션 클릭 시 기본 방향으로 설정
      onSortChange(optionId, 'asc')
    }
  }

  return (
    <div className={`${styles.sortFilter} ${className}`}>
      <label className={styles.sortLabel}>정렬</label>
      <div className={styles.sortOptions}>
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => handleSortChange(option.id)}
            className={`${styles.sortButton} ${
              sortBy === option.id ? styles.active : ''
            }`}
            type="button"
          >
            <span className={styles.sortLabel}>{option.label}</span>
            {sortBy === option.id && (
              <span className={styles.sortDirection}>
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
