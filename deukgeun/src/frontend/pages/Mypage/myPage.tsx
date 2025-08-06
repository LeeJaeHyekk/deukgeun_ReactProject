import React, { useCallback, memo, useMemo } from "react";
import { useUserStore } from "@shared/store/userStore";
import { useAuthContext } from "@shared/contexts/AuthContext";
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

const UserLevel = memo(({ level }: { level: string }) => (
  <span className={styles.level}>{level}</span>
));

const InfoItem = memo(({ label, value }: { label: string; value: string }) => (
  <div className={styles.infoItem}>
    <p className={styles.label}>{label}</p>
    <p className={styles.value}>{value}</p>
  </div>
));

const ActionButton = memo(
  ({
    children,
    onClick,
    variant = "primary",
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "danger";
  }) => (
    <button
      className={variant === "danger" ? styles.logoutBtn : styles.actionBtn}
      onClick={onClick}
    >
      {children}
    </button>
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
    <section className={`${styles.wrapper} ${className || ""}`}>
      <div className={styles.profile}>
        <UserAvatar src="/img/user-avatar.png" alt="유저 아바타" />
        <div className={styles.userMeta}>
          <div className={styles.username}>
            {userInfo.nickname}
            <UserLevel level="Lv.3" />
          </div>
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

      <div className={styles.infoBlock}>
        <InfoItem label="운동 부위" value="🔥 가슴 + 삼두" />
        <InfoItem label="이메일" value={userInfo.email} />
        <InfoItem label="진행 중 미션" value="2개" />
        <InfoItem label="최근 운동일" value="2025.07.24" />
      </div>

      <div className={styles.actions}>
        <ActionButton onClick={handleEditProfile}>회원정보 수정</ActionButton>
        <ActionButton onClick={handleViewWorkoutHistory}>
          운동 기록 보기
        </ActionButton>
        <ActionButton onClick={handleLogout} variant="danger">
          로그아웃
        </ActionButton>
      </div>
    </section>
  );
}

// 컴포넌트 메모이제이션
export default memo(MyPage);
