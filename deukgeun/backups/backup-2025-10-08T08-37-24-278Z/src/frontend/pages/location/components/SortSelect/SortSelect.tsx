import { SortOption, SortDirection } from "../../types"
import styles from "./SortSelect.module.css"

interface SortSelectProps {
  sortBy: SortOption
  sortDirection: SortDirection
  onSortChange: (sortBy: SortOption, direction: SortDirection) => void
}

const sortOptions = [
  { value: "distance", label: "거리순" },
  { value: "name", label: "이름순" },
  { value: "rating", label: "평점순" },
  { value: "reviewCount", label: "리뷰순" },
  { value: "price", label: "가격순" },
] as const

export function SortSelect({
  sortBy,
  sortDirection,
  onSortChange,
}: SortSelectProps) {
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newDirection] = event.target.value.split("-") as [
      SortOption,
      SortDirection,
    ]
    onSortChange(newSortBy, newDirection)
  }

  const handleDirectionToggle = () => {
    const newDirection: SortDirection = sortDirection === "asc" ? "desc" : "asc"
    onSortChange(sortBy, newDirection)
  }

  return (
    <div className={styles.sortContainer}>
      <label htmlFor="sort-select" className={styles.label}>
        정렬:
      </label>
      <select
        id="sort-select"
        value={`${sortBy}-${sortDirection}`}
        onChange={handleSortChange}
        className={styles.select}
      >
        {sortOptions.map(option => (
          <option key={`${option.value}-asc`} value={`${option.value}-asc`}>
            {option.label} (오름차순)
          </option>
        ))}
        {sortOptions.map(option => (
          <option key={`${option.value}-desc`} value={`${option.value}-desc`}>
            {option.label} (내림차순)
          </option>
        ))}
      </select>
      <button
        onClick={handleDirectionToggle}
        className={styles.directionButton}
        title={`${sortDirection === "asc" ? "내림차순" : "오름차순"}으로 변경`}
      >
        {sortDirection === "asc" ? "↑" : "↓"}
      </button>
    </div>
  )
}
