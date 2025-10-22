import React from 'react'
import { useHomePageData } from '@frontend/shared/hooks/useHomePageData'

const HomePage: React.FC = () => {
  const { 
    userStats, 
    finalStats,
    isPageLoading, 
    error 
  } = useHomePageData()

  if (isPageLoading) return <p>통계 불러오는 중...</p>
  if (error) return <p>통계 로드 실패: {error}</p>
  if (!userStats) return <p>데이터 없음</p>

  return (
    <div>
      <h2>사용자 통계</h2>
      <p>레벨: {userStats.level}</p>
      <p>총 경험치: {userStats.totalExp}</p>
      <p>게시물 수: {userStats.totalPosts}</p>
    </div>
  )
}

export default HomePage
