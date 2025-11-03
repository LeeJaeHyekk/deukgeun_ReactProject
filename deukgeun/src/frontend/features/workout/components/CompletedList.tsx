// ============================================================================
// CompletedList - 완료 운동 목록 (페이지네이션 적용)
// ============================================================================

import React, { memo, useMemo, useCallback, useState, useRef } from "react"
import type { CompletedWorkout } from "../slices/workoutSlice"
import { EmptyState, Pagination } from "./common"
import styles from "./CompletedList.module.css"

interface Props {
  workouts: CompletedWorkout[]
  itemsPerPage?: number
}

const DEFAULT_ITEMS_PER_PAGE = 6

function CompletedListComponent({ workouts, itemsPerPage = DEFAULT_ITEMS_PER_PAGE }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)

  // 날짜 포맷팅 함수 메모이제이션
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }, [])

  // 페이지네이션 계산
  const paginationData = useMemo(() => {
    const totalItems = workouts.length
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedWorkouts = workouts.slice(startIndex, endIndex)

    return {
      totalPages,
      paginatedWorkouts,
      totalItems
    }
  }, [workouts, currentPage, itemsPerPage])

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // 페이지 변경 시 완료된 운동 목록 섹션으로 스크롤
    if (listRef.current) {
      const offsetTop = listRef.current.offsetTop - 100 // 헤더 여유 공간
      window.scrollTo({ 
        top: offsetTop, 
        behavior: "smooth" 
      })
    }
  }, [])

  // workouts가 변경되면 첫 페이지로 리셋
  React.useEffect(() => {
    if (currentPage > paginationData.totalPages && paginationData.totalPages > 0) {
      setCurrentPage(1)
    }
  }, [workouts.length, currentPage, paginationData.totalPages])

  if (workouts.length === 0) {
    return (
      <EmptyState
        message="완료된 운동이 없습니다."
        secondaryMessage="운동을 완료하면 여기에 표시됩니다."
      />
    )
  }

  return (
    <div className={styles.completedListWrapper} ref={listRef}>
      <div className={styles.completedList}>
        {paginationData.paginatedWorkouts.map((workout) => (
          <div key={workout.completedId} className={styles.workoutCard}>
            <div className={styles.header}>
              <h3>{workout.goalTitle || "운동 완료"}</h3>
              <span className={styles.date}>
                {formatDate(workout.completedAt)}
              </span>
            </div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>총 세트</span>
                <span className={styles.statValue}>{workout.totalSets}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>총 반복</span>
                <span className={styles.statValue}>{workout.totalReps}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>경험치</span>
                <span className={styles.statValue}>{workout.expEarned} EXP</span>
              </div>
              {workout.durationMin && (
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>소요 시간</span>
                  <span className={styles.statValue}>{workout.durationMin}분</span>
                </div>
              )}
            </div>

            {workout.summary?.comment && (
              <div className={styles.comment}>
                <p>{workout.summary.comment}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {paginationData.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={paginationData.totalItems}
        />
      )}
    </div>
  )
}

// React.memo로 메모이제이션
export const CompletedList = memo(CompletedListComponent)

