import { useState } from "react";
import styles from "./HomePage.module.css";
import { Navigation } from "@widgets/Navigation/Navigation";
import { LoadingOverlay } from "@shared/ui/LoadingOverlay/LoadingOverlay";
import { useUserStore } from "@shared/store/userStore";
import { useAuthContext } from "@shared/contexts/AuthContext";
import { useLevel } from "@shared/hooks/useLevel";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const { logout, isLoggedIn } = useAuthContext();
  const {
    currentLevel,
    progressPercentage,
    isLoading: levelLoading,
  } = useLevel();
  const navigate = useNavigate();

  return (
    <div className={styles.homePage}>
      <LoadingOverlay show={isLoading} />
      <Navigation />

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
          <h1>득근득근</h1>
          <p>과거의 나를 뛰어넘는 것이 진정한 성장이다.</p>
        </div>
      </div>

      {/* Service Section */}
      <div className={styles.serviceSection}>
        <div className={styles.serviceGrid}>
          <div className={styles.serviceCard}>헬스장 위치</div>
          <div className={styles.serviceCard}>머신 가이드</div>
          <div className={styles.serviceCard}>커뮤니티</div>
          <div className={styles.serviceCard}>운동 기록일지</div>
        </div>
      </div>

      {/* My Info Section - 로그인된 경우에만 표시 */}
      {isLoggedIn && user && (
        <section className={styles.myInfoSummary}>
          <div className={styles.myInfoCard}>
            <div className={styles.userInfoSection}>
              <img
                src="/img/user-avatar.jpg"
                alt="아바타"
                className={styles.avatarSmall}
              />
              <div className={styles.userDetails}>
                <h3 className={styles.userName}>{user.nickname}</h3>
                <p className={styles.userEmail}>{user.email}</p>
                <p className={styles.workoutStatus}>
                  🔥 오늘의 운동: 가슴 + 삼두
                </p>
              </div>
            </div>

            <div className={styles.levelSection}>
              <div className={styles.levelBadge}>
                <span className={styles.levelNumber}>
                  {levelLoading ? "..." : `Lv.${currentLevel}`}
                </span>
              </div>
              <div className={styles.levelProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${levelLoading ? 0 : progressPercentage}%`,
                    }}
                  ></div>
                </div>
                <span className={styles.progressText}>
                  {levelLoading
                    ? "로딩 중..."
                    : `${progressPercentage.toFixed(0)}% 완료`}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/mypage")}
              className={styles.detailBtn}
            >
              마이페이지
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
