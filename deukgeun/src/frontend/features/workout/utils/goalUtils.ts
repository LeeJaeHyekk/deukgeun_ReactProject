// ============================================================================
// Goal 관련 유틸리티 함수들 (모듈화 및 성능 최적화)
// ============================================================================

import type { Goal, Task } from '../slices/workoutSlice'

/**
 * 목표 진행률 계산 (통합 함수)
 * @param goal - 계산할 목표
 * @returns 진행률 (0-100)
 */
export function calcGoalProgress(goal: Goal): number {
  if (!goal.tasks?.length) return 0
  const completedTasks = goal.tasks.filter((t) => t.status === 'completed').length
  return Math.round((completedTasks / goal.tasks.length) * 100)
}

/**
 * 난이도 라벨 반환
 */
export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
  }
  return labels[difficulty] || difficulty
}

/**
 * 난이도 색상 반환
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#F44336',
  }
  return colors[difficulty] || '#9E9E9E'
}

/**
 * 목표가 완료되었는지 확인
 */
export function isGoalCompleted(goal: Goal): boolean {
  if (!goal.tasks?.length) return false
  const progress = calcGoalProgress(goal)
  const allTasksCompleted = goal.tasks.every((t) => t.status === 'completed')
  return progress >= 100 || allTasksCompleted
}

/**
 * 태스크 통계 계산
 */
export function calculateTaskStats(tasks: Task[]) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pending = tasks.filter((t) => t.status === 'pending').length

  return {
    total,
    completed,
    inProgress,
    pending,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
