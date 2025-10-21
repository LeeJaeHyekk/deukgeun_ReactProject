import React, { useState, useEffect, memo, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import { LevelDisplay } from "@frontend/shared/components/LevelDisplay"
import { Navigation } from "@widgets/Navigation/Navigation"
import type { User } from "../../../shared/types"
import styles from "./MyPage.module.css"

// 타입 정의
interface UserInfo {
  nickname: string
  email: string
  phone?: string
  gender?: string
  birthday?: string
  createdAt?: string
}

interface MyPageProps {
  className?: string
}

// Zustand selector 최적화

// 메모이제이션된 컴포넌트들
const InfoItem = memo(
  ({ label, value, icon }: { label: string; value: string | undefined; icon?: string }) => (
    <div className={styles.infoItem}>
      <div className={styles.infoHeader}>
        {icon && <span className={styles.infoIcon}>{icon}</span>}
        <p className={styles.label}>{label}</p>
      </div>
      <p className={styles.value}>{value || "미등록"}</p>
    </div>
  )
)

const ActionButton = memo(
  ({
    children,
    onClick,
    variant = "primary",
    icon,
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: "primary" | "secondary" | "danger"
    icon?: string
  }) => (
    <button
      className={`${styles.actionBtn} ${styles[variant]}`}
      onClick={onClick}
    >
      {icon && <span className={styles.buttonIcon}>{icon}</span>}
      {children}
    </button>
  )
)

const StatsCard = memo(
  ({
    title,
    value,
    subtitle,
    icon,
  }: {
    title: string
    value: string
    subtitle?: string
    icon?: string
  }) => (
    <div className={styles.statsCard}>
      <div className={styles.statsHeader}>
        {icon && <span className={styles.statsIcon}>{icon}</span>}
        <h4 className={styles.statsTitle}>{title}</h4>
      </div>
      <div className={styles.statsValue}>{value}</div>
      {subtitle && <p className={styles.statsSubtitle}>{subtitle}</p>}
    </div>
  )
)

function MyPage({ className }: MyPageProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthRedux()

  // 사용자 정보 메모이제이션 (성능 최적화)
  const userInfo = useMemo((): UserInfo => {
    return {
      nickname: user?.nickname || "사용자",
      email: user?.email || "이메일 없음",
      phone: user?.phone || "미등록",
      gender:
        user?.gender === "male"
          ? "남성"
          : user?.gender === "female"
            ? "여성"
            : "미등록",
      birthday: user?.birthDate
        ? new Date(user.birthDate).toLocaleDateString()
        : "미등록",
      createdAt: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "미등록",
    }
  }, [user])

  // 로그아웃 핸들러 메모이제이션
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      console.log("로그아웃 성공")
    } catch (error) {
      console.error("로그아웃 실패:", error)
    }
  }, [logout])

  // 회원정보 수정 핸들러
  const handleEditProfile = useCallback(() => {
    navigate("/profile/edit")
  }, [navigate])

  // 운동 기록 보기 핸들러
  const handleViewWorkoutHistory = useCallback(() => {
    navigate("/workout/history")
  }, [navigate])

  // 운동 진행상황 보기 핸들러
  const handleViewProgress = useCallback(() => {
    navigate("/workout/progress")
  }, [navigate])

  // 설정 페이지 핸들러
  const handleSettings = useCallback(() => {
    navigate("/settings")
  }, [navigate])

  // 계정 삭제 핸들러
  const handleDeleteAccount = useCallback(() => {
    if (
      window.confirm(
        "정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      // TODO: 계정 삭제 API 호출
      console.log("계정 삭제 요청")
    }
  }, [])

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
          <LevelDisplay
            showProgress={true}
            showRewards={true}
            className={styles.myPageLevelDisplay}
          />
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>운동 통계</h3>
          <div className={styles.statsGrid}>
            <StatsCard
              title="총 운동 세션"
              value="24회"
              subtitle="이번 달"
              icon="💪"
            />
            <StatsCard
              title="총 운동 시간"
              value="1,440분"
              subtitle="24시간"
              icon="⏱️"
            />
            <StatsCard
              title="완료한 세트"
              value="156세트"
              subtitle="이번 달"
              icon="🎯"
            />
            <StatsCard
              title="평균 운동 시간"
              value="60분"
              subtitle="세션당"
              icon="📊"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>개인 정보</h3>
          <div className={styles.infoGrid}>
            <InfoItem label="닉네임" value={userInfo.nickname} icon="👤" />
            <InfoItem label="이메일" value={userInfo.email} icon="📧" />
            <InfoItem label="전화번호" value={userInfo.phone} icon="📱" />
            <InfoItem label="성별" value={userInfo.gender} icon="⚧" />
            <InfoItem label="생년월일" value={userInfo.birthday} icon="🎂" />
            <InfoItem label="가입일" value={userInfo.createdAt} icon="📝" />
          </div>
        </div>

        {/* Actions Section */}
        <div className={styles.actionsSection}>
          <h3 className={styles.sectionTitle}>계정 관리</h3>
          <div className={styles.actions}>
            <ActionButton onClick={handleEditProfile} icon="✏️">
              회원정보 수정
            </ActionButton>
            <ActionButton
              onClick={handleViewWorkoutHistory}
              icon="📊"
              variant="secondary"
            >
              운동 기록 보기
            </ActionButton>
            <ActionButton
              onClick={handleViewProgress}
              icon="📈"
              variant="secondary"
            >
              진행상황 보기
            </ActionButton>
            <ActionButton
              onClick={handleSettings}
              icon="⚙️"
              variant="secondary"
            >
              설정
            </ActionButton>
            <ActionButton onClick={handleLogout} variant="danger" icon="🚪">
              로그아웃
            </ActionButton>
            <ActionButton
              onClick={handleDeleteAccount}
              variant="danger"
              icon="🗑️"
            >
              계정 삭제
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// 컴포넌트 메모이제이션
export default memo(MyPage)
