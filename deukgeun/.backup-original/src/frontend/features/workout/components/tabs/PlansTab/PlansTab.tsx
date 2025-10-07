import React from "react"
import { useTabState } from "../../../hooks/useWorkoutStore"
import { useSharedState } from "../../../hooks/useWorkoutStore"
import type { WorkoutPlan } from "../../../../../../shared/types/common"
import type { PlansTabState } from "../../../types"
import { PlansContent } from "./components/PlansContent"
import { PlansStats } from "./components/PlansStats"
import { usePlansActions } from "./hooks/usePlansActions"
import styles from "./PlansTab.module.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[PlansTab] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[PlansTab] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[PlansTab] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[PlansTab] ${message}`, data || "")
  },
}

interface PlansTabProps {
  plans: WorkoutPlan[]
  isLoading: boolean
  onCreatePlan: () => void
  onEditPlan: (planId: number) => void
  onStartSession: (planId: number) => void
  onDeletePlan: (planId: number) => void
}

export function PlansTab({
  plans,
  isLoading,
  onCreatePlan,
  onEditPlan,
  onStartSession,
  onDeletePlan,
}: PlansTabProps) {
  // 탭별 상태 관리
  const { tabState, updateTabState } = useTabState("plans")
  const plansTabState = tabState as PlansTabState

  // 공유 상태 훅
  const { sharedState } = useSharedState()

  const { handleDeletePlan } = usePlansActions(() => {
    // 삭제 완료 후 추가 작업이 필요하면 여기에 추가
  })

  logger.info("PlansTab 렌더링", {
    plansCount: plans.length,
    isLoading,
    filterStatus: plansTabState.filterStatus,
    sortBy: plansTabState.sortBy,
    viewMode: plansTabState.viewMode,
    selectedPlanId: plansTabState.selectedPlanId,
  })

  // 필터링된 계획 목록
  const filteredPlans = React.useMemo(() => {
    let filtered = plans

    // 상태별 필터링
    if (plansTabState.filterStatus !== "all") {
      filtered = filtered.filter(plan => {
        // 여기에 필터링 로직 추가
        return true
      })
    }

    // 정렬 (최신순으로 기본 정렬)
    filtered.sort((a, b) => {
      switch (plansTabState.sortBy) {
        case "createdAt":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case "name":
          return a.name.localeCompare(b.name)
        case "difficulty":
          const difficultyOrder: Record<string, number> = {
            쉬움: 1,
            보통: 2,
            어려움: 3,
          }
          return (
            (difficultyOrder[a.difficulty] || 0) -
            (difficultyOrder[b.difficulty] || 0)
          )
        default:
          // 기본값: 최신순
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    })

    return filtered
  }, [plans, plansTabState.filterStatus, plansTabState.sortBy])

  const handleSortChange = (sortBy: "createdAt" | "name" | "difficulty") => {
    updateTabState({ sortBy })
  }

  const handleViewModeChange = (viewMode: "grid" | "list") => {
    updateTabState({ viewMode })
  }

  const handlePlanSelect = (planId: number | null) => {
    updateTabState({ selectedPlanId: planId })
  }

  if (isLoading) {
    return (
      <div className={styles.plansTab}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>계획을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.plansTab}>
      {/* 헤더 섹션 */}
      <div className={styles.plansHeader}>
        <div className={styles.plansHeaderContent}>
          <h2>📋 운동 계획</h2>
          <p>운동 계획을 만들고 관리하세요</p>
        </div>
        <button className={styles.createPlanBtn} onClick={onCreatePlan}>
          <span className={styles.icon}>+</span>새 계획
        </button>
      </div>

      {/* 컨트롤 섹션 */}
      <div className={styles.plansControls}>
        <div className={styles.controlSection}>
          <div className={styles.sortButtons}>
            <button
              className={`${styles.sortBtn} ${plansTabState.sortBy === "createdAt" ? styles.active : ""}`}
              onClick={() => handleSortChange("createdAt")}
            >
              최신순
            </button>
            <button
              className={`${styles.sortBtn} ${plansTabState.sortBy === "name" ? styles.active : ""}`}
              onClick={() => handleSortChange("name")}
            >
              이름순
            </button>
            <button
              className={`${styles.sortBtn} ${plansTabState.sortBy === "difficulty" ? styles.active : ""}`}
              onClick={() => handleSortChange("difficulty")}
            >
              난이도순
            </button>
          </div>
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.viewModeBtn} ${plansTabState.viewMode === "grid" ? styles.active : ""}`}
              onClick={() => handleViewModeChange("grid")}
            >
              그리드
            </button>
            <button
              className={`${styles.viewModeBtn} ${plansTabState.viewMode === "list" ? styles.active : ""}`}
              onClick={() => handleViewModeChange("list")}
            >
              리스트
            </button>
          </div>
        </div>
      </div>

      {/* 최근 업데이트된 계획 표시 */}
      {sharedState.lastUpdatedPlan && (
        <div className={styles.recentUpdate}>
          <h4>최근 활동</h4>
          <div
            className={styles.updateItem}
            onClick={() => onEditPlan(sharedState.lastUpdatedPlan!.id)}
          >
            <span className={styles.planName}>
              {sharedState.lastUpdatedPlan.name}
            </span>
            <span className={styles.planDifficulty}>
              {sharedState.lastUpdatedPlan.difficulty}
            </span>
          </div>
        </div>
      )}

      {/* 계획 목록 */}
      {filteredPlans.length > 0 ? (
        <div className={styles.plansSection}>
          <div className={styles.sectionHeader}>
            <h3>📋 운동 계획 ({filteredPlans.length}개)</h3>
            <p>설정한 운동 계획들을 확인하세요</p>
          </div>
          <PlansContent
            plans={filteredPlans}
            viewMode={plansTabState.viewMode}
            onCreatePlan={onCreatePlan}
            onEditPlan={onEditPlan}
            onDeletePlan={handleDeletePlan}
          />
        </div>
      ) : (
        <div className={styles.noPlansContainer}>
          <div className={styles.noPlansIcon}>📋</div>
          <h3>아직 운동 계획이 없습니다</h3>
          <p>첫 번째 운동 계획을 만들어보세요!</p>
          <button className={styles.createFirstPlanBtn} onClick={onCreatePlan}>
            첫 계획 만들기
          </button>
        </div>
      )}

      {/* 통계 */}
      {plans.length > 0 && <PlansStats plans={plans as any} />}
    </div>
  )
}
