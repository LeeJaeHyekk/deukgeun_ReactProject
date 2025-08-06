import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { Navigation } from "@widgets/Navigation/Navigation";
import { LoadingOverlay } from "@shared/ui/LoadingOverlay/LoadingOverlay";
import { useUserStore } from "@shared/store/userStore";
import { useAuthContext } from "@shared/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  // 🧪 디버깅용 로그
  console.log("🧪 HomePage 렌더링");
  console.log("🧪 현재 사용자:", user);

  const handleLogout = async () => {
    try {
      await logout();
      console.log("🧪 로그아웃 성공");
    } catch (error) {
      console.error("🧪 로그아웃 실패:", error);
    }
  };

  return (
    <div className={styles.homePage}>
      <LoadingOverlay show={isLoading} />
      <Navigation />
      <button className={styles.logoutBtn} onClick={handleLogout}>
        로그아웃
      </button>

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

      {/* My Info Section */}

      <section className={styles.myInfoSummary}>
        <div className={styles.myInfoCard}>
          <img
            src="/img/user-avatar.png"
            alt="아바타"
            className={styles.avatarSmall}
          />
          <div>
            <p>
              <strong>{user?.nickname || "사용자"}</strong> (Lv.3)
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
