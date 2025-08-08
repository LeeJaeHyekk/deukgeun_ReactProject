import React, { useCallback, memo, useMemo } from "react";
import { useUserStore } from "@shared/store/userStore";
import { useAuthContext } from "@shared/contexts/AuthContext";
import { LevelDisplay } from "@shared/components/LevelDisplay";
import { User } from "@shared/types/user";
import styles from "./myPage.module.css";

// 타입 정의
interface UserInfo {
  nickname: string;
  email: string;
}

interface MyPageProps {
  className?: string;
}

// Zustand selector 최적화
const selectUser = (state: { user: User | null }) => state.user;

// 메모이제이션된 컴포넌트들
const UserAvatar = memo(({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className={styles.avatar} />
));

const InfoItem = memo(
  ({ label, value, icon }: { label: string; value: string; icon?: string }) => (
    <div className={styles.infoItem}>
      <div className={styles.infoHeader}>
        {icon && <span className={styles.infoIcon}>{icon}</span>}
        <p className={styles.label}>{label}</p>
      </div>
      <p className={styles.value}>{value}</p>
    </div>
  )
);

const ActionButton = memo(
  ({
    children,
    onClick,
    variant = "primary",
    icon,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "danger";
    icon?: string;
  }) => (
    <button
      className={`${styles.actionBtn} ${styles[variant]}`}
      onClick={onClick}
    >
      {icon && <span className={styles.buttonIcon}>{icon}</span>}
      {children}
    </button>
  )
);

const StatsCard = memo(
  ({
    title,
    value,
    subtitle,
    icon,
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon?: string;
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
);

function MyPage({ className }: MyPageProps) {
  // Zustand store에서 사용자 정보 가져오기 (최적화된 selector 사용)
  const user = useUserStore(selectUser);
  const { logout } = useAuthContext();

  // 사용자 정보 메모이제이션 (성능 최적화)
  const userInfo = useMemo((): UserInfo => {
    return {
      nickname: user?.nickname || "사용자",
      email: user?.email || "이메일 없음",
    };
  }, [user?.nickname, user?.email]);

  // 로그아웃 핸들러 메모이제이션
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      console.log("로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  }, [logout]);

  // 회원정보 수정 핸들러
  const handleEditProfile = useCallback(() => {
    console.log("회원정보 수정 페이지로 이동");
    // TODO: 회원정보 수정 페이지로 라우팅
  }, []);

  // 운동 기록 보기 핸들러
  const handleViewWorkoutHistory = useCallback(() => {
    console.log("운동 기록 페이지로 이동");
    // TODO: 운동 기록 페이지로 라우팅
  }, []);

  // 설정 아이콘 클릭 핸들러
  const handleSettingsClick = useCallback(() => {
    console.log("설정 페이지로 이동");
    // TODO: 설정 페이지로 라우팅
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.wrapper} ${className || ""}`}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.profile}>
            <UserAvatar src="/img/user-avatar.png" alt="유저 아바타" />
            <div className={styles.userMeta}>
              <div className={styles.username}>{userInfo.nickname}</div>
              <div className={styles.userEmail}>{userInfo.email}</div>
              <div
                className={styles.settingIcon}
                onClick={handleSettingsClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleSettingsClick()}
              >
                ⚙️
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
          <h3 className={styles.sectionTitle}>활동 통계</h3>
          <div className={styles.statsGrid}>
            <StatsCard
              title="총 운동일수"
              value="24일"
              subtitle="이번 달"
              icon="💪"
            />
            <StatsCard
              title="연속 운동"
              value="7일"
              subtitle="현재 스트릭"
              icon="🔥"
            />
            <StatsCard
              title="완료한 미션"
              value="12개"
              subtitle="이번 달"
              icon="🎯"
            />
            <StatsCard
              title="획득한 포인트"
              value="1,250P"
              subtitle="총 누적"
              icon="⭐"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>개인 정보</h3>
          <div className={styles.infoGrid}>
            <InfoItem label="운동 부위" value="🔥 가슴 + 삼두" icon="🏋️" />
            <InfoItem label="이메일" value={userInfo.email} icon="📧" />
            <InfoItem label="진행 중 미션" value="2개" icon="🎯" />
            <InfoItem label="최근 운동일" value="2025.07.24" icon="📅" />
            <InfoItem label="가입일" value="2024.01.15" icon="📝" />
            <InfoItem label="활동 등급" value="골드" icon="🏆" />
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
            <ActionButton onClick={handleLogout} variant="danger" icon="🚪">
              로그아웃
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// 컴포넌트 메모이제이션
export default memo(MyPage);
