// ============================================================================
// 통계 관련 타입
// ============================================================================

// 사용자 통계
export interface UserStats {
  userId: number
  totalWorkouts: number
  totalDuration: number // 분 단위
  totalCalories: number
  totalWeight: number
  averageWorkoutDuration: number
  averageCaloriesPerWorkout: number
  longestStreak: number
  currentStreak: number
  favoriteMachines: Array<{
    machineId: number
    machineName: string
    usageCount: number
  }>
  progressByMonth: Array<{
    month: string
    workouts: number
    duration: number
    calories: number
    weight: number
  }>
  createdAt: Date
  updatedAt: Date
}

// 운동 통계
export interface WorkoutStats {
  id: number
  userId: number
  date: Date
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  totalWeight: number
  totalSets: number
  totalReps: number
  averageHeartRate?: number
  maxHeartRate?: number
  createdAt: Date
  updatedAt: Date
}

// 진행도 통계
export interface ProgressStats {
  userId: number
  period: "week" | "month" | "quarter" | "year"
  startDate: Date
  endDate: Date
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  totalWeight: number
  improvement: {
    workouts: number // 증가율
    duration: number
    calories: number
    weight: number
  }
  goals: Array<{
    goalId: number
    title: string
    targetValue: number
    currentValue: number
    progress: number // 퍼센트
    isCompleted: boolean
  }>
  achievements: Array<{
    id: number
    name: string
    description: string
    unlockedAt: Date
  }>
}

// 기계 사용 통계
export interface MachineUsageStats {
  machineId: number
  totalUsage: number
  averageRating: number
  totalReviews: number
  popularity: number
  usageByDifficulty: Record<string, number>
  usageByUserLevel: Record<string, number>
  averageWeight: number
  averageReps: number
  averageSets: number
  lastUsed?: Date
}

// 헬스장 방문 통계
export interface GymVisitStats {
  userId: number
  totalVisits: number
  totalDuration: number
  favoriteGyms: Array<{
    gymId: number
    gymName: string
    visitCount: number
    totalDuration: number
  }>
  visitByDay: Record<string, number>
  visitByHour: Record<string, number>
  averageVisitDuration: number
  lastVisit?: Date
}

// 커뮤니티 활동 통계
export interface CommunityStats {
  userId: number
  totalPosts: number
  totalComments: number
  totalLikes: number
  totalViews: number
  postsByCategory: Record<string, number>
  engagementRate: number
  followers: number
  following: number
  reputation: number
}

// 레벨 시스템 통계
export interface LevelStats {
  userId: number
  currentLevel: number
  currentExp: number
  totalExp: number
  expToNextLevel: number
  levelProgress: number // 퍼센트
  expHistory: Array<{
    action: string
    expGained: number
    date: Date
  }>
  achievements: Array<{
    id: number
    name: string
    description: string
    unlockedAt: Date
  }>
  streaks: Array<{
    type: string
    currentStreak: number
    longestStreak: number
    lastActivity: Date
  }>
}

// 통계 조회 요청
export interface GetUserStatsRequest {
  userId: number
  period?: "week" | "month" | "quarter" | "year"
  startDate?: Date
  endDate?: Date
}

export interface GetWorkoutStatsRequest {
  userId: number
  period: "day" | "week" | "month" | "year"
  startDate?: Date
  endDate?: Date
}

export interface GetProgressStatsRequest {
  userId: number
  period: "week" | "month" | "quarter" | "year"
  startDate?: Date
  endDate?: Date
}

export interface GetMachineStatsRequest {
  machineId: number
  period?: "week" | "month" | "quarter" | "year"
  startDate?: Date
  endDate?: Date
}

export interface GetGymStatsRequest {
  userId: number
  period?: "week" | "month" | "quarter" | "year"
  startDate?: Date
  endDate?: Date
}

export interface GetCommunityStatsRequest {
  userId: number
  period?: "week" | "month" | "quarter" | "year"
  startDate?: Date
  endDate?: Date
}

export interface GetLevelStatsRequest {
  userId: number
  period?: "week" | "month" | "quarter" | "year"
  startDate?: Date
  endDate?: Date
}

// 통계 응답 타입
export interface UserStatsResponse {
  success: boolean
  message: string
  data?: UserStats
  error?: string
}

export interface WorkoutStatsResponse {
  success: boolean
  message: string
  data?: WorkoutStats
  error?: string
}

export interface ProgressStatsResponse {
  success: boolean
  message: string
  data?: ProgressStats
  error?: string
}

export interface MachineStatsResponse {
  success: boolean
  message: string
  data?: MachineUsageStats
  error?: string
}

export interface GymStatsResponse {
  success: boolean
  message: string
  data?: GymVisitStats
  error?: string
}

export interface CommunityStatsResponse {
  success: boolean
  message: string
  data?: CommunityStats
  error?: string
}

export interface LevelStatsResponse {
  success: boolean
  message: string
  data?: LevelStats
  error?: string
}

// 통합 통계
export interface ComprehensiveStats {
  userId: number
  period: "week" | "month" | "quarter" | "year"
  startDate: Date
  endDate: Date
  user: UserStats
  workout: WorkoutStats
  progress: ProgressStats
  machine: MachineUsageStats[]
  gym: GymVisitStats
  community: CommunityStats
  level: LevelStats
}

export interface ComprehensiveStatsResponse {
  success: boolean
  message: string
  data?: ComprehensiveStats
  error?: string
}

// 통계 대시보드
export interface StatsDashboard {
  userId: number
  overview: {
    totalWorkouts: number
    totalDuration: number
    totalCalories: number
    currentStreak: number
    level: number
    expProgress: number
  }
  recentActivity: Array<{
    type: "workout" | "goal" | "achievement" | "post" | "comment"
    title: string
    description: string
    timestamp: Date
  }>
  charts: {
    workoutTrend: Array<{
      date: string
      workouts: number
      duration: number
      calories: number
    }>
    machineUsage: Array<{
      machineName: string
      usageCount: number
      averageRating: number
    }>
    progressByGoal: Array<{
      goalTitle: string
      currentValue: number
      targetValue: number
      progress: number
    }>
  }
  insights: Array<{
    type: "improvement" | "milestone" | "suggestion" | "warning"
    title: string
    description: string
    value?: number
    unit?: string
  }>
}

export interface StatsDashboardResponse {
  success: boolean
  message: string
  data?: StatsDashboard
  error?: string
}

// 통계 내보내기
export interface StatsExport {
  userId: number
  format: "csv" | "json" | "pdf"
  period: "week" | "month" | "quarter" | "year"
  startDate: Date
  endDate: Date
  includeCharts: boolean
  includeDetails: boolean
}

export interface StatsExportResponse {
  success: boolean
  message: string
  data?: {
    downloadUrl: string
    expiresAt: Date
    fileSize: number
  }
  error?: string
}

// 통계 알림
export interface StatsNotification {
  id: number
  userId: number
  type: "milestone" | "achievement" | "goal_completed" | "streak_broken" | "weekly_summary"
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: Date
}

// 통계 설정
export interface StatsSettings {
  userId: number
  privacy: {
    shareWorkoutStats: boolean
    shareProgressStats: boolean
    shareCommunityStats: boolean
    shareLevelStats: boolean
  }
  notifications: {
    weeklySummary: boolean
    monthlySummary: boolean
    milestoneReached: boolean
    goalCompleted: boolean
    streakBroken: boolean
  }
  display: {
    defaultPeriod: "week" | "month" | "quarter" | "year"
    showCharts: boolean
    showInsights: boolean
    theme: "light" | "dark"
  }
  updatedAt: Date
}

// 통계 비교
export interface StatsComparison {
  userId: number
  periods: Array<{
    label: string
    startDate: Date
    endDate: Date
    stats: UserStats
  }>
  comparison: {
    workouts: number
    duration: number
    calories: number
    weight: number
    improvement: number
  }
}

export interface StatsComparisonResponse {
  success: boolean
  message: string
  data?: StatsComparison
  error?: string
}
