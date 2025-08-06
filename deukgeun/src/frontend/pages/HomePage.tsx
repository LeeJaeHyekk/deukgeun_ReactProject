import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { Navigation } from "@widgets/Navigation/Navigation";
import { LoadingOverlay } from "@shared/ui/LoadingOverlay/LoadingOverlay";
import { useUserStore } from "@shared/store/userStore";
import { useAuthContext } from "@shared/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  console.log("🧪 HomePage 렌더링 시작");

  const [isLoading, setIsLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const { logout, isLoggedIn } = useAuthContext();
  const navigate = useNavigate();

  // 🧪 디버깅용 로그
  console.log("🧪 HomePage 렌더링");
  console.log(
    "🧪 현재 사용자:",
    user ? { id: user.id, email: user.email, nickname: user.nickname } : null
  );
  console.log("🧪 로그인 상태:", isLoggedIn);
  console.log("🧪 로컬 로딩 상태:", isLoading);

  const handleLogout = async () => {
    console.log("🧪 HomePage - 로그아웃 버튼 클릭");
    try {
      setIsLoading(true);
      console.log("🧪 HomePage - 로그아웃 시작");
      await logout();
      console.log("🧪 HomePage - 로그아웃 성공");
    } catch (error) {
      console.error("🧪 HomePage - 로그아웃 실패:", error);
    } finally {
      setIsLoading(false);
      console.log("🧪 HomePage - 로그아웃 처리 완료");
    }
  };

  const handleLogin = () => {
    console.log("🧪 HomePage - 로그인 버튼 클릭, 로그인 페이지로 이동");
    navigate("/login");
  };

  console.log("🧪 HomePage - 렌더링할 UI 결정:", {
    showLogoutButton: isLoggedIn && user,
    showLoginButton: !isLoggedIn || !user,
    showMyInfoSection: isLoggedIn && user,
  });

  return (
    <div className={styles.homePage}>
      <LoadingOverlay show={isLoading} />
      <Navigation />

      {/* 인증 상태에 따른 버튼 표시 */}
      <div className={styles.authButtons}>
        {isLoggedIn && user ? (
          <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <button className={styles.loginBtn} onClick={handleLogin}>
            로그인
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <video
          src="/video/serviceMovie.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className={styles.heroVideo}
          onError={(e) => console.error("Video loading error:", e)}
        />
        <div className={styles.heroOverlay}>
          <h1>운동의 시작, 득근득근</h1>
          <p>위치 기반 헬스 서비스부터 머신 가이드까지 한 번에</p>
        </div>
      </div>

      {/* Service Section */}
      <div className={styles.serviceSection}>
        <div className={styles.serviceGrid}>
          <div className={styles.serviceCard}> 헬스장 위치</div>
          <div className={styles.serviceCard}> 머신 가이드</div>
          <div className={styles.serviceCard}> 커뮤니티</div>
          <div className={styles.serviceCard}> 운동 기록일지</div>
        </div>
      </div>

      {/* My Info Section - 로그인된 경우에만 표시 */}
      {isLoggedIn && user && (
        <section className={styles.myInfoSummary}>
          <div className={styles.myInfoCard}>
            <img
              src="/img/user-avatar.png"
              alt="아바타"
              className={styles.avatarSmall}
            />
            <div>
              <p>
                <strong>{user.nickname}</strong> (Lv.3)
              </p>
              <p>🔥 오늘의 운동: 가슴 + 삼두</p>
            </div>
            <button
              onClick={() => navigate("/mypage")}
              className={styles.detailBtn}
            >
              자세히
            </button>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className={styles.footerSection}>
        <div>회사소개</div>
        <div>개인정보처리방침</div>
        <div>이용약관</div>
        <div>고객센터</div>
        <div>문의하기</div>
      </footer>
    </div>
  );
}
