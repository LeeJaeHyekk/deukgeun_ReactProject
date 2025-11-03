// ============================================================================
// MyPage Component - 모듈화 및 최적화 버전
// ============================================================================

import React, { memo, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import { useLevel } from "@frontend/shared/hooks/useLevel"
import { LevelDisplay } from "@frontend/shared/components/LevelDisplay"
import { Navigation } from "@widgets/Navigation/Navigation"
import { selectCompletedWorkouts, selectWorkoutStatus, selectWorkoutError } from "@frontend/features/workout/selectors/workoutSelectors"
import { fetchGoalsFromBackend } from "@frontend/features/workout/slices/workoutSlice"
import { useAppDispatch } from "@frontend/shared/store/hooks"
import { LoadingState, ErrorState } from "@frontend/features/workout/components/common"
import { calculateLevelFromTotalExp } from "@frontend/shared/utils/levelUtils"
import { useUserInfo, useWorkoutStats, useMyPageInitialization, useUserExp } from "./hooks"
import { InfoItem, ActionButton, StatsCard, EditProfileModal } from "./components"
import styles from "./MyPage.module.css"

interface MyPageProps {
  className?: string
}

function MyPage({ className }: MyPageProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, logout, isLoggedIn } = useAuthRedux()
  
  // Redux 상태 - 선택적 구독으로 불필요한 리렌더링 방지
  const completedWorkouts = useSelector(selectCompletedWorkouts, (prev, next) => {
    // 배열 길이와 내용이 동일한지 비교
    if (!prev || !next) return prev === next
    if (prev.length !== next.length) return false
    return prev.every((item, index) => {
      const nextItem = next[index]
      return item?.completedId === nextItem?.completedId &&
             item?.completedAt === nextItem?.completedAt
    })
  }) || []
  const workoutStatus = useSelector(selectWorkoutStatus)
  const workoutError = useSelector(selectWorkoutError)
  
  // 커스텀 훅 사용
  const { levelProgress, fetchLevelProgress, error: levelError, isLoading: isLevelLoading } = useLevel()
  const { isInitializing, initializationError, setInitializationError } = useMyPageInitialization(user?.id, isLoggedIn)
  const userInfo = useUserInfo(user)
  const userTotalExp = useUserExp(levelProgress, completedWorkouts)
  const workoutStats = useWorkoutStats(completedWorkouts)
  
  // 새로고침 상태
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 회원정보 수정 모달 상태
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  
  // 이전 상태 추적을 위한 ref (렌더링 최적화)
  const prevUserIdRef = React.useRef<number | undefined>(undefined)
  const prevIsLoggedInRef = React.useRef<boolean>(false)
  
  // 사용자 ID 변경 감지 (렌더링 최적화)
  React.useEffect(() => {
    const currentUserId = user?.id
    const currentIsLoggedIn = isLoggedIn
    const prevUserId = prevUserIdRef.current
    const prevIsLoggedIn = prevIsLoggedInRef.current
    
    // 실제 변경이 있을 때만 처리
    if (prevUserId !== currentUserId || prevIsLoggedIn !== currentIsLoggedIn) {
      prevUserIdRef.current = currentUserId
      prevIsLoggedInRef.current = currentIsLoggedIn
    }
  }, [user?.id, isLoggedIn])
  
  // 레벨 정보 계산 (안정적인 메모이제이션)
  const levelInfo = React.useMemo(() => {
    try {
      if (typeof userTotalExp !== 'number' || isNaN(userTotalExp) || userTotalExp < 0) {
        return calculateLevelFromTotalExp(0)
      }
      return calculateLevelFromTotalExp(userTotalExp)
    } catch (error) {
      console.error('❌ [MyPage] 레벨 계산 오류:', error)
      return calculateLevelFromTotalExp(0)
    }
  }, [userTotalExp])

  // 데이터 새로고침 핸들러 (순차 처리로 rate limit 방지)
  const handleRefresh = useCallback(async () => {
    if (!user?.id || !isLoggedIn) return
    
    setIsRefreshing(true)
    setInitializationError(null)
    
    try {
      // 순차 처리로 rate limit 방지
      // 1. 레벨 정보 새로고침
      await fetchLevelProgress()
      
      // 2. 요청 간 간격 추가 (rate limit 방지)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 3. 운동 목표 목록 로드
      await dispatch(fetchGoalsFromBackend(user.id)).unwrap()
      
      console.log('✅ [MyPage] 데이터 새로고침 성공')
    } catch (error: any) {
      console.error('❌ [MyPage] 데이터 새로고침 실패:', error)
      const errorMessage = error?.message || error?.response?.data?.message || '데이터를 불러오는데 실패했습니다.'
      setInitializationError(errorMessage)
    } finally {
      setIsRefreshing(false)
    }
  }, [user?.id, isLoggedIn, fetchLevelProgress, dispatch, setInitializationError])

  // 핸들러 함수들
  const handleViewWorkoutHistory = useCallback(() => {
    try {
      navigate("/workout", { state: { tab: "completed" } })
    } catch (error) {
      console.error('❌ [MyPage] 운동 기록 페이지 이동 실패:', error)
      navigate("/workout?tab=completed")
    }
  }, [navigate])

  const handleLogout = useCallback(async () => {
    try {
      const confirmed = window.confirm("정말 로그아웃하시겠습니까?")
      if (!confirmed) return
      
      await logout()
      console.log("✅ 로그아웃 성공")
      navigate("/")
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error)
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }, [logout, navigate])

  const handleEditProfile = useCallback(() => {
    try {
      setIsEditProfileModalOpen(true)
    } catch (error) {
      console.error('❌ [MyPage] 회원정보 수정 모달 열기 실패:', error)
      alert("회원정보 수정 모달을 열 수 없습니다.")
    }
  }, [])

  const handleCloseEditProfileModal = useCallback(() => {
    setIsEditProfileModalOpen(false)
  }, [])

  const handleProfileUpdateSuccess = useCallback(() => {
    console.log('✅ [MyPage] 회원정보 수정 성공')
    // 필요시 추가 처리 (예: 토스트 메시지)
  }, [])
  
  // 에러 상태 처리
  if (!isLoggedIn || !user) {
    return (
      <div className={styles.pageWrapper}>
        <Navigation />
        <div className={`${styles.wrapper} ${className || ""}`}>
          <ErrorState 
            message="로그인이 필요합니다." 
            onRetry={() => navigate("/login")}
          />
        </div>
      </div>
    )
  }
  
  // 로딩/에러 상태 계산 (메모이제이션 - 렌더링 최적화)
  const isLoading = React.useMemo(
    () => isInitializing || isLevelLoading || workoutStatus === "loading",
    [isInitializing, isLevelLoading, workoutStatus]
  )
  
  const hasError = React.useMemo(
    () => !!(initializationError || workoutError || levelError),
    [initializationError, workoutError, levelError]
  )
  
  const errorMessage = React.useMemo(
    () => initializationError || workoutError || levelError || "데이터를 불러오는데 실패했습니다.",
    [initializationError, workoutError, levelError]
  )
  
  // 레벨 디스플레이 컴포넌트 메모이제이션 (안정적인 의존성)
  const levelDisplayContent = React.useMemo(() => {
    if (!levelInfo || typeof levelInfo !== 'object') {
      return <ErrorState message="레벨 정보를 불러올 수 없습니다." onRetry={handleRefresh} />
    }
    
    // 레벨 데이터 계산 (안정적인 값)
    const levelData = {
      level: typeof levelInfo.level === 'number' ? Math.max(1, Math.floor(levelInfo.level)) : 1,
      currentExp: typeof levelInfo.currentExp === 'number' ? Math.max(0, Math.floor(levelInfo.currentExp)) : 0,
      totalExp: typeof userTotalExp === 'number' ? Math.max(0, Math.floor(userTotalExp)) : 0,
      expToNextLevel: typeof levelInfo.nextLevelExp === 'number' ? Math.max(0, Math.floor(levelInfo.nextLevelExp)) : 0,
      progressPercentage: typeof levelInfo.progressPercentage === 'number' 
        ? Math.max(0, Math.min(100, levelInfo.progressPercentage)) 
        : 0,
    }
    
    return (
      <LevelDisplay
        userLevel={levelData as any}
        showProgress={true}
        showRewards={true}
        className={styles.myPageLevelDisplay}
      />
    )
  }, [
    levelInfo?.level, 
    levelInfo?.currentExp, 
    levelInfo?.nextLevelExp, 
    levelInfo?.progressPercentage, 
    userTotalExp, 
    handleRefresh
  ])
  
  // 통계 섹션 메모이제이션 (hooks 규칙 준수를 위해 컴포넌트 최상위에서 호출)
  const statsSectionContent = React.useMemo(() => {
    if (!workoutStats || !workoutStats.hasData || !workoutStats.formatNumber) {
      return (
        <div className={styles.emptyStats}>
          <p>아직 완료한 운동이 없습니다.</p>
          <p className={styles.emptyStatsSubtitle}>운동을 시작하고 기록을 남겨보세요!</p>
        </div>
      )
    }
    
    return (
      <div className={styles.statsGrid}>
        <StatsCard
          title="총 운동 세션"
          value={`${workoutStats.formatNumber(workoutStats.totalSessions || 0)}회`}
          subtitle={workoutStats.thisMonthSessions > 0 ? `이번 달: ${workoutStats.thisMonthSessions}회` : undefined}
          icon="💪"
        />
        <StatsCard
          title="완료한 세트"
          value={`${workoutStats.formatNumber(workoutStats.totalSets || 0)}세트`}
          subtitle={workoutStats.thisMonthSets && workoutStats.thisMonthSets > 0 ? `이번 달: ${workoutStats.formatNumber(workoutStats.thisMonthSets)}세트` : undefined}
          icon="🎯"
        />
        <StatsCard
          title="완료한 반복"
          value={`${workoutStats.formatNumber(workoutStats.totalReps || 0)}회`}
          subtitle="총 반복 횟수"
          icon="🔄"
        />
        <StatsCard
          title="획득한 경험치"
          value={`${workoutStats.formatNumber(workoutStats.totalExp || 0)} EXP`}
          subtitle="총 획득 경험치"
          icon="⭐"
        />
      </div>
    )
  }, [workoutStats])
  
  // 개인 정보 섹션 메모이제이션 (안정적인 의존성)
  const infoSectionContent = React.useMemo(() => (
    <div className={styles.infoGrid}>
      <InfoItem label="닉네임" value={userInfo.nickname} icon="👤" />
      <InfoItem label="이메일" value={userInfo.email} icon="📧" />
      <InfoItem label="전화번호" value={userInfo.phone} icon="📱" />
      <InfoItem label="성별" value={userInfo.gender} icon="⚧" />
      <InfoItem label="생년월일" value={userInfo.birthday} icon="🎂" />
      <InfoItem label="가입일" value={userInfo.createdAt} icon="📝" />
    </div>
  ), [
    userInfo.nickname,
    userInfo.email,
    userInfo.phone,
    userInfo.gender,
    userInfo.birthday,
    userInfo.createdAt
  ])
  
  // 액션 섹션 메모이제이션 (안정적인 의존성)
  const actionsSectionContent = React.useMemo(() => (
    <div className={styles.actions}>
      <ActionButton 
        onClick={handleEditProfile} 
        icon="✏️"
        disabled={isRefreshing}
      >
        회원정보 수정
      </ActionButton>
      <ActionButton
        onClick={handleViewWorkoutHistory}
        icon="📊"
        variant="secondary"
        disabled={isRefreshing}
      >
        운동 기록 보기
      </ActionButton>
      {isRefreshing && (
        <ActionButton 
          onClick={handleRefresh} 
          icon="🔄"
          variant="secondary"
          disabled={true}
        >
          새로고침 중...
        </ActionButton>
      )}
      {!isRefreshing && hasError && (
        <ActionButton 
          onClick={handleRefresh} 
          icon="🔄"
          variant="secondary"
        >
          다시 시도
        </ActionButton>
      )}
      <ActionButton 
        onClick={handleLogout} 
        variant="danger" 
        icon="🚪"
        disabled={isRefreshing}
      >
        로그아웃
      </ActionButton>
    </div>
  ), [isRefreshing, hasError, handleEditProfile, handleViewWorkoutHistory, handleRefresh, handleLogout])
  
  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <Navigation />
        <div className={`${styles.wrapper} ${className || ""}`}>
          <LoadingState message="데이터를 불러오는 중..." />
        </div>
      </div>
    )
  }
  
  // 에러 상태 처리
  if (hasError) {
    return (
      <div className={styles.pageWrapper}>
        <Navigation />
        <div className={`${styles.wrapper} ${className || ""}`}>
          <ErrorState 
            message={typeof errorMessage === 'string' ? errorMessage : "데이터를 불러오는데 실패했습니다."} 
            onRetry={handleRefresh}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <Navigation />
      <div className={`${styles.wrapper} ${className || ""}`}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.profile}>
            <div className={styles.userMeta}>
              <div className={styles.username}>{userInfo.nickname}</div>
              <div className={styles.userEmail}>{userInfo.email}</div>
              <div className={styles.userStatus}>
                <span className={styles.statusBadge}>활성 계정</span>
                <span className={styles.joinDate}>
                  가입일: {userInfo.createdAt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Section */}
        <div className={styles.levelSection}>
          <h3 className={styles.sectionTitle}>레벨 정보</h3>
          {levelDisplayContent}
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>운동 통계</h3>
          {statsSectionContent}
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>개인 정보</h3>
          {infoSectionContent}
        </div>

        {/* Actions Section */}
        <div className={styles.actionsSection}>
          <h3 className={styles.sectionTitle}>계정 관리</h3>
          {actionsSectionContent}
        </div>
      </div>

      {/* 회원정보 수정 모달 */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={handleCloseEditProfileModal}
        onSuccess={handleProfileUpdateSuccess}
      />
    </div>
  )
}

export default memo(MyPage)
