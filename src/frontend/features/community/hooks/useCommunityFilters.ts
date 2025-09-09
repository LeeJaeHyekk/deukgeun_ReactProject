import { useState, useCallback } from "react"

export type SortOption = "latest" | "popular"

export function useCommunityFilters() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("latest")

  // 카테고리 변경
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  // 검색어 변경
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  // 정렬 옵션 변경
  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort)
  }, [])

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setSelectedCategory("all")
    setSearchTerm("")
    setSortBy("latest")
  }, [])

  // 필터 상태 확인
  const hasActiveFilters = useCallback(() => {
    return (
      selectedCategory !== "all" ||
      searchTerm.trim() !== "" ||
      sortBy !== "latest"
    )
  }, [selectedCategory, searchTerm, sortBy])

  return {
    // 상태
    selectedCategory,
    searchTerm,
    sortBy,

    // 액션
    handleCategoryChange,
    handleSearchChange,
    handleSortChange,
    resetFilters,
    hasActiveFilters,
  }
}
