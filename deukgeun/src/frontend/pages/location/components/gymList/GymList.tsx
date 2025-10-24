import { Gym } from "@frontend/pages/location/types/index"
import { GymCard } from "../gymCard/GymCard"
// import { SortSelect } from "@frontend/pages/location/components/SortSelect/SortSelect"
import { SortOption, SortDirection } from "@frontend/pages/location/types"
import styles from "./GymList.module.css"

interface GymListProps {
  gyms: Gym[]
  sortBy: SortOption
  sortDirection: SortDirection
  onSortChange: (sortBy: SortOption, direction: SortDirection) => void
  onGymClick?: (gym: Gym) => void
  layout?: 'list' | 'grid'
}

export function GymList({
  gyms,
  sortBy,
  sortDirection,
  onSortChange,
  onGymClick,
  layout = 'list',
}: GymListProps) {
  if (gyms.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>검색 결과가 없습니다.</p>
        <p>다른 키워드로 검색해보세요.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{gyms.length}개</h3>
        {/* <SortSelect
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
        /> */}
      </div>

      <div className={`${styles.list} ${layout === 'grid' ? styles.grid : ''}`}>
        {gyms.map(gym => (
          <GymCard key={gym.id} gym={gym} onClick={onGymClick} />
        ))}
      </div>
    </div>
  )
}
