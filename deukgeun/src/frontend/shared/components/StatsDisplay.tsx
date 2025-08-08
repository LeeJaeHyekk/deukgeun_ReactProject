import React from "react"
import { useStats, useUserStats } from "../hooks/useStats"
import { LoadingSpinner } from "../ui/LoadingSpinner"

interface StatsCardProps {
  title: string
  value: number
  subtitle?: string
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-blue-600 mb-1">{value.toLocaleString()}</div>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  )
}

export const PlatformStatsDisplay: React.FC = () => {
  const { stats, isLoading, error } = useStats()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">통계 데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="활성 사용자"
        value={stats.activeUsers}
        subtitle="최근 30일 내 활동"
      />
      <StatsCard
        title="등록된 헬스장"
        value={stats.totalGyms}
        subtitle="전체 헬스장 수"
      />
      <StatsCard
        title="게시글"
        value={stats.totalPosts}
        subtitle="전체 게시글 수"
      />
      <StatsCard
        title="업적 달성자"
        value={stats.achievements}
        subtitle="레벨 5 이상"
      />
    </div>
  )
}

export const UserStatsDisplay: React.FC = () => {
  const { userStats, isLoading, error } = useUserStats()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!userStats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">사용자 통계를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="현재 레벨"
        value={userStats.level}
        subtitle={`경험치: ${userStats.currentExp}/${userStats.totalExp}`}
      />
      <StatsCard
        title="총 게시글"
        value={userStats.totalPosts}
        subtitle="작성한 게시글 수"
      />
      <StatsCard
        title="최근 활동"
        value={userStats.recentPosts}
        subtitle="최근 7일 게시글"
      />
    </div>
  )
}
