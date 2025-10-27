import { PostCategoryInfo } from "../../../../shared/types"
import { SortOption } from "../hooks/useCommunityFilters"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import styles from "./communityFilters.module.css"

interface CommunityFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  availableCategories: PostCategoryInfo[]
  onCreatePost: () => void
}

export function CommunityFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCategory,
  onCategoryChange,
  availableCategories,
  onCreatePost,
}: CommunityFiltersProps) {
  const { isLoggedIn } = useAuthRedux()
  // 카테고리 데이터 준비
  const categories = [
    {
      id: "all",
      label: "전체",
      count: availableCategories.reduce((sum, cat) => sum + (cat.count || 0), 0),
    },
    ...availableCategories.map(cat => ({
      id: cat.name,
      label: cat.name,
      count: cat.count || 0,
    })),
  ]

  return (
    <section className={styles.controls}>
      {/* 검색 및 정렬 */}
      <div className={styles.searchSort}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="게시글 검색..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sortSelect}>
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value as SortOption)}
            className={styles.select}
          >
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
          </select>
        </div>
      </div>

      {/* 카테고리 + 글쓰기 동일 구역 배치 */}
      <div className={styles.categoriesRow}>
        <div className={styles.categories}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryBtn} ${
                selectedCategory === category.id ? styles.active : ""
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        <button 
          className={`${styles.createPostBtn} ${!isLoggedIn ? styles.disabled : ""}`}
          disabled={!isLoggedIn}
          onClick={() => {
            if (isLoggedIn) {
              onCreatePost()
            } else {
              console.log('로그인이 필요합니다')
            }
          }}
          title={!isLoggedIn ? "로그인이 필요합니다" : ""}
        >
          ✏️ 글쓰기
        </button>
      </div>
    </section>
  )
}
