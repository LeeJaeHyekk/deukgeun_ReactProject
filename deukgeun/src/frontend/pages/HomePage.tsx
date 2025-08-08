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
        <section className={styles.myInfoSection}>
          <div className={styles.myInfoHeader}>
            <h2>내 정보</h2>
            <p>오늘의 운동 현황과 레벨을 확인해보세요</p>
          </div>

          <div className={styles.myInfoGrid}>
            {/* 프로필 카드 */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <img
                  src="/img/user-avatar.jpg"
                  alt="아바타"
                  className={styles.profileAvatar}
                />
                <div className={styles.profileInfo}>
                  <h3>{user.nickname}</h3>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.workoutStatus}>
                  <span className={styles.statusIcon}>🔥</span>
                  <span>오늘의 운동: 가슴 + 삼두</span>
                </div>
              </div>
            </div>

            {/* 레벨 카드 */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.levelIcon}>⭐</div>
                <h3>현재 레벨</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.levelDisplay}>
                  <div className={styles.levelBadge}>
                    {levelLoading ? "..." : `Lv.${currentLevel}`}
                  </div>
                  <div className={styles.progressContainer}>
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
              </div>
            </div>

            {/* 액션 카드 */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.actionIcon}>⚙️</div>
                <h3>계정 관리</h3>
              </div>
              <div className={styles.cardContent}>
                <button
                  onClick={() => navigate("/mypage")}
                  className={styles.mypageBtn}
                >
                  마이페이지로 이동
                </button>
                <div className={styles.quickStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>24</span>
                    <span className={styles.statLabel}>운동일수</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>7</span>
                    <span className={styles.statLabel}>연속일수</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className={styles.footerSection}>
        <div className={styles.footerContainer}>
          {/* 메인 Footer 영역 */}
          <div className={styles.footerMain}>
            {/* 회사 정보 */}
            <div className={styles.footerColumn}>
              <div className={styles.footerLogo}>
                <img
                  src="/img/logo.png"
                  alt="득근득근"
                  className={styles.footerLogoImg}
                />
                <h3>득근득근</h3>
              </div>
              <p className={styles.footerDescription}>
                과거의 나를 뛰어넘는 것이 진정한 성장이다.
                <br />
                당신의 건강한 변화를 응원합니다.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>
                  📱
                </a>
                <a href="#" className={styles.socialLink}>
                  📧
                </a>
                <a href="#" className={styles.socialLink}>
                  💬
                </a>
              </div>
            </div>

            {/* 서비스 */}
            <div className={styles.footerColumn}>
              <h4>서비스</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/location">헬스장 찾기</a>
                </li>
                <li>
                  <a href="/machine-guide">머신 가이드</a>
                </li>
                <li>
                  <a href="/community">커뮤니티</a>
                </li>
                <li>
                  <a href="/missions">운동 기록일지</a>
                </li>
              </ul>
            </div>

            {/* 고객지원 */}
            <div className={styles.footerColumn}>
              <h4>고객지원</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/faq">자주 묻는 질문</a>
                </li>
                <li>
                  <a href="/contact">문의하기</a>
                </li>
                <li>
                  <a href="/feedback">피드백</a>
                </li>
                <li>
                  <a href="/help">도움말</a>
                </li>
              </ul>
            </div>

            {/* 회사 정보 */}
            <div className={styles.footerColumn}>
              <h4>회사 정보</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/about">회사소개</a>
                </li>
                <li>
                  <a href="/privacy">개인정보처리방침</a>
                </li>
                <li>
                  <a href="/terms">이용약관</a>
                </li>
                <li>
                  <a href="/careers">채용정보</a>
                </li>
              </ul>
            </div>
          </div>

          {/* 하단 Footer 영역 */}
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>
                © 2024 득근득근. All rights reserved.
              </p>
              <div className={styles.footerBottomLinks}>
                <a href="/privacy">개인정보처리방침</a>
                <span className={styles.separator}>|</span>
                <a href="/terms">이용약관</a>
                <span className={styles.separator}>|</span>
                <a href="/contact">고객센터</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
