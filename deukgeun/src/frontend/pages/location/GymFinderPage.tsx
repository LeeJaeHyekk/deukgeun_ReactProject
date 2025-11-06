import { useState, useCallback, useMemo } from "react"
import styles from "./GymFinderPage.module.css"
import { Navigation } from "@widgets/Navigation/Navigation"
import { SearchBar } from "@frontend/pages/location/components/SearchBar/SearchBar"
import { FilterTag } from "@frontend/pages/location/components/FilterTag/FilterTag"
import { GymCard } from "@frontend/pages/location/components/GymCard/GymCard"
import { GymDetailView } from "@frontend/pages/location/components/GymDetailView/GymDetailView"
import { useGymSearch } from "./hooks/useGymSearch"
import { useAuth } from "@frontend/shared/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { formatDistance } from "./utils/distanceUtils"
import { FilterOption, SortOption, SortDirection, Gym } from "./types"
import { isValidArrayIndex, isValidPageNumber } from "./utils/validation"

const filters: FilterOption[] = ["PT", "GX", "24시간", "주차", "샤워"]

export default function GymFinderPage() {
  const [viewMode, setViewMode] = useState<'list'>('list')
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  // Redux 기반 헬스장 검색 훅
  const {
    gyms,
    allGyms,
    nearbyGyms,
    isLoading,
    error,
    keyword,
    position,
    filters: activeFilters,
    sortBy,
    sortDirection,
    maxDistance,
    updateKeyword,
    updateFilters,
    updateSort,
    updateMaxDistance,
    getEmptyMessage,
    hasPosition,
    hasGyms,
    hasNearbyGyms,
  } = useGymSearch()

  // 메모이제이션된 핸들러들
  const handleFilterToggle = useCallback((filter: FilterOption) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter((f: FilterOption) => f !== filter)
      : [...activeFilters, filter]
    updateFilters(newFilters)
    handleSearchOrFilter()
  }, [activeFilters, updateFilters])

  const handleSortChange = useCallback((newSortBy: SortOption, newDirection: SortDirection) => {
    updateSort(newSortBy, newDirection)
  }, [updateSort])

  const handleGymClick = useCallback((gym: Gym) => {
    setSelectedGym(gym)
  }, [])

  const handleSearch = useCallback((query: string) => {
    updateKeyword(query)
    handleSearchOrFilter()
  }, [updateKeyword])


  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    setSelectedGym(null)
  }, [])

  const handleSearchOrFilter = useCallback(() => {
    setCurrentPage(1)
    setSelectedGym(null)
  }, [])

  // 거리 표시용 헬퍼 함수
  const getDistanceDisplay = useCallback((gym: Gym): string => {
    if (gym.distance !== undefined) {
      return formatDistance(gym.distance)
    }
    return '거리 정보 없음'
  }, [])

  // 메모이제이션된 계산값들
  const totalPages = useMemo(() => Math.ceil(gyms.length / itemsPerPage), [gyms.length, itemsPerPage])
  
  const currentGyms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return gyms.slice(startIndex, endIndex)
  }, [gyms, currentPage, itemsPerPage])

  const displayGyms = useMemo(() => {
    return allGyms.slice(0, 9)
  }, [allGyms])

  // 상세보기 모드는 viewSection 내에서 처리하므로 제거

  return (
    <div className={styles.container}>
      <Navigation />

      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.heroSection}>
            <h1>🏋️ 헬스장 찾기</h1>
            <p>내 주변 헬스장을 찾아보세요</p>
            
          </section>

      <section className={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
          </section>

          <section className={styles.filterSection}>
            <div className={styles.filterControls}>
              <div className={styles.filterTags}>
          {filters.map(filter => (
            <FilterTag
              key={filter}
              label={filter}
              active={activeFilters.includes(filter)}
                    onClick={() => handleFilterToggle(filter)}
            />
          ))}
        </div>
              
              <div className={styles.distanceControl}>
                <label htmlFor="maxDistance">최대 거리: {maxDistance}km</label>
          <input
                  id="maxDistance"
            type="range"
            min="1"
            max="20"
            value={maxDistance}
                  onChange={(e) => updateMaxDistance(Number(e.target.value))}
          />
              </div>
        </div>
      </section>

          {/* 3:7 비율 레이아웃 (view:검색결과) */}
          <div className={styles.mainLayout}>
            {/* 왼쪽: View 섹션 (70%) - 내 주변 헬스장 */}
            <section className={styles.viewSection}>
              <div className={styles.viewHeader}>
                <h3>내 주변 헬스장</h3>
            </div>
              <div className={styles.viewContent}>
                {selectedGym ? (
                  <GymDetailView 
                    gym={selectedGym} 
                    onClose={() => setSelectedGym(null)} 
                  />
                ) : (
                  <div className={styles.nearbyGymsGrid}>
                    {displayGyms.map((gym: Gym) => (
                      <div 
                        key={gym.id} 
                        className={styles.nearbyGymCard}
                        onClick={() => handleGymClick(gym)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleGymClick(gym)
                          }
                        }}
                      >
                        <h4>{gym.name}</h4>
                        <p>{gym.address}</p>
                        <div className={styles.nearbyGymDistance}>
                          📍 {getDistanceDisplay(gym)}
                    </div>
                        <div className={styles.nearbyGymTime}>
                          🕒 {gym.is24Hours ? '24시간' : '06:00-22:00'}
                      </div>
                        <div className={styles.nearbyGymPrice}>
                          💰 {gym.price || '문의'}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>

            {/* 오른쪽: 검색 결과 섹션 (30%) */}
            <section className={styles.searchResultsSection}>
            <div className={styles.listHeader}>
              <h2>검색 결과</h2>
              <div className={styles.headerControls}>
                {isLoading && <span>검색 중...</span>}
                </div>
              </div>
              
              <div className={styles.gymList}>
                {isLoading ? (
                  <div className={styles.loading}>
                    <p>로딩 중...</p>
                  </div>
                ) : error ? (
                  <div className={styles.error}>
                    <p>❌ {error}</p>
                    <button onClick={() => window.location.reload()}>다시 시도</button>
            </div>
                ) : hasGyms ? (
                  <>
                    <div className={styles.gymList}>
                      {currentGyms.map((gym: Gym) => (
                        <GymCard
                          key={gym.id}
                          gym={gym}
                          onClick={handleGymClick}
                        />
                      ))}
                    </div>
                    
                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <button
                          className={styles.pageButton}
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          이전
                        </button>
                        
                        <div className={styles.pageNumbers}>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          className={styles.pageButton}
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <p>{getEmptyMessage()}</p>
                    <button onClick={() => window.location.reload()}>새로고침</button>
                  </div>
                )}
            </div>
          </section>

            {/* 오른쪽: 선택된 헬스장 상세보기 (30%) */}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 내 주변 헬스장 찾기. All rights reserved.</p>
      </footer>
    </div>
  )
}