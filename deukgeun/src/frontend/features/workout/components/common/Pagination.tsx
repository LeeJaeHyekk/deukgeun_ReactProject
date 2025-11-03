// ============================================================================
// Pagination - 페이지네이션 공통 컴포넌트
// ============================================================================

import React, { memo } from "react"
import styles from "./Pagination.module.css"

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  totalItems?: number
}

function PaginationComponent({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems 
}: Props) {
  if (totalPages <= 1) return null

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // 총 페이지가 5개 이하인 경우 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 첫 페이지
      pages.push(1)

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // 현재 페이지 주변 조정
      if (currentPage <= 3) {
        endPage = Math.min(4, totalPages - 1)
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 3, 2)
      }

      // 첫 페이지와 시작 페이지 사이에 ... 추가
      if (startPage > 2) {
        pages.push("...")
      }

      // 중간 페이지들
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // 끝 페이지와 마지막 페이지 사이에 ... 추가
      if (endPage < totalPages - 1) {
        pages.push("...")
      }

      // 마지막 페이지
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={styles.pagination}>
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <div className={styles.info}>
          <span>
            {((currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
          </span>
        </div>
      )}
      
      <div className={styles.controls}>
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={styles.navButton}
          aria-label="이전 페이지"
        >
          ‹
        </button>

        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              )
            }

            const pageNum = page as number
            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`${styles.pageButton} ${currentPage === pageNum ? styles.active : ""}`}
                aria-label={`${pageNum}페이지`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={styles.navButton}
          aria-label="다음 페이지"
        >
          ›
        </button>
      </div>
    </div>
  )
}

export const Pagination = memo(PaginationComponent)

