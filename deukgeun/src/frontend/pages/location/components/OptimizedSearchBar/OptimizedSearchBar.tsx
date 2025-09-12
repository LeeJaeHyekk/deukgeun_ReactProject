import React, { useState, useRef, useEffect } from 'react'
import { useGymNameSuggestions } from '../../hooks/useOptimizedGymSearch'
import styles from './OptimizedSearchBar.module.css'

interface OptimizedSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  showSuggestions?: boolean
  maxSuggestions?: number
}

export function OptimizedSearchBar({
  onSearch,
  placeholder = '헬스장명 또는 지역을 검색하세요...',
  className = '',
  showSuggestions = true,
  maxSuggestions = 10,
}: OptimizedSearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { suggestions, isLoading, searchSuggestions, clearSuggestions } =
    useGymNameSuggestions()

  // 검색어 변경 시 자동완성 검색
  useEffect(() => {
    if (query.trim()) {
      searchSuggestions(query)
    } else {
      clearSuggestions()
    }
  }, [query, searchSuggestions, clearSuggestions])

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        clearSuggestions()
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // 검색 실행
  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim())
      clearSuggestions()
      setSelectedIndex(-1)
    }
  }

  // 자동완성 선택
  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion)
    clearSuggestions()
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  // 입력값 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(-1)
  }

  // 포커스 이벤트
  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    // 약간의 지연을 두어 클릭 이벤트가 먼저 처리되도록 함
    setTimeout(() => {
      setIsFocused(false)
      clearSuggestions()
      setSelectedIndex(-1)
    }, 150)
  }

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        clearSuggestions()
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [clearSuggestions])

  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div className={styles.searchInputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={styles.searchInput}
          autoComplete="off"
        />
        <button
          onClick={handleSearch}
          className={styles.searchButton}
          disabled={!query.trim()}
          type="button"
        >
          🔍
        </button>
      </div>

      {/* 자동완성 드롭다운 */}
      {showSuggestions &&
        isFocused &&
        (suggestions.length > 0 || isLoading) && (
          <div ref={suggestionsRef} className={styles.suggestionsDropdown}>
            {isLoading ? (
              <div className={styles.suggestionItem}>
                <span className={styles.loadingText}>검색 중...</span>
              </div>
            ) : (
              suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`${styles.suggestionItem} ${
                    index === selectedIndex ? styles.selected : ''
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className={styles.suggestionText}>{suggestion}</span>
                </div>
              ))
            )}
          </div>
        )}

      {/* 검색 힌트 */}
      {isFocused &&
        query.length > 0 &&
        suggestions.length === 0 &&
        !isLoading && (
          <div className={styles.searchHint}>
            <span>Enter를 눌러 검색하세요</span>
          </div>
        )}
    </div>
  )
}
