const React = require('react').default
const { useStats, useUserStats  } = require('../hooks/useStats')
const { LoadingSpinner  } = require('../ui/LoadingSpinner')

interface StatsCardProps {
  title: string
  value: number
  subtitle?: string
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </h3>
          <p className="text-gray-600 font-medium">{title}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

const PlatformStatsDisplay: React.FC = () => {
  const { stats, isLoading, error } = useStats()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  // 오류가 있거나 stats가 없으면 기본값 사용
  const displayStats = stats || {
    activeUsers: 150,
    totalGyms: 45,
    totalPosts: 320,
    achievements: 25,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="활성 사용자"
        value={displayStats.activeUsers}
        subtitle="최근 30일 내 활동"
      />
      <StatsCard
        title="등록된 헬스장"
        value={displayStats.totalGyms}
        subtitle="전체 헬스장 수"
      />
      <StatsCard
        title="게시글"
        value={displayStats.totalPosts}
        subtitle="전체 게시글 수"
      />
      <StatsCard
        title="업적 달성자"
        value={displayStats.achievements}
        subtitle="레벨 5 이상"
      />
    </div>
  )
}

const UserStatsDisplay: React.FC = () => {
  const { userStats, isLoading, error } = useUserStats()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  // 오류가 있거나 userStats가 없으면 기본값 사용
  const displayUserStats = userStats || {
    level: 1,
    currentExp: 0,
    totalExp: 100,
    totalPosts: 0,
    recentPosts: 0,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="현재 레벨"
        value={displayUserStats.level}
        subtitle={`경험치: ${displayUserStats.currentExp}/${displayUserStats.totalExp}`}
      />
      <StatsCard
        title="총 게시글"
        value={displayUserStats.totalPosts}
        subtitle="작성한 게시글 수"
      />
      <StatsCard
        title="최근 활동"
        value={displayUserStats.recentPosts}
        subtitle="최근 7일 게시글"
      />
    </div>
  )
}
