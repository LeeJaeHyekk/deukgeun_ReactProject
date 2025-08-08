import { useState } from "react";
import styles from "./HomePage.module.css";
import { Navigation } from "@widgets/Navigation/Navigation";
import { LoadingOverlay } from "@shared/ui/LoadingOverlay/LoadingOverlay";
import { useUserStore } from "@shared/store/userStore";
import { useAuthContext } from "@shared/contexts/AuthContext";
import { useLevel } from "@shared/hooks/useLevel";
import { useStats } from "@shared/hooks/useStats";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Dumbbell,
  Users,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Star,
  Award,
  Clock,
  CheckCircle,
  MessageCircle,
  Heart,
  Calendar,
  Trophy,
} from "lucide-react";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const { logout, isLoggedIn } = useAuthContext();
  const {
    currentLevel,
    progressPercentage,
    isLoading: levelLoading,
  } = useLevel();
  const { stats, isLoading: statsLoading } = useStats();
  const navigate = useNavigate();

  // 통계 데이터 포맷팅 함수
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    } else {
      return `${num}+`;
    }
  };

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
          <div className={styles.heroContent}>
            <h1>득근득근</h1>
            <p>과거의 나를 뛰어넘는 것이 진정한 성장이다.</p>
            <div className={styles.heroButtons}>
              <button
                className={styles.heroBtnPrimary}
                onClick={() => navigate("/location")}
              >
                헬스장 찾기
              </button>
              <button
                className={styles.heroBtnSecondary}
                onClick={() => navigate("/machine-guide")}
              >
                머신 가이드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Section */}
      <div className={styles.serviceSection}>
        <div className={styles.serviceHeader}>
          <h2>서비스 소개</h2>
          <p>득근득근과 함께 건강한 변화를 시작하세요</p>
        </div>
        <div className={styles.serviceGrid}>
          <div
            className={styles.serviceCard}
            onClick={() => navigate("/location")}
          >
            <div className={styles.serviceIcon}>
              <MapPin size={48} />
            </div>
            <h3>헬스장 찾기</h3>
            <p>내 주변 헬스장을 쉽게 찾아보세요</p>
          </div>
          <div
            className={styles.serviceCard}
            onClick={() => navigate("/machine-guide")}
          >
            <div className={styles.serviceIcon}>
              <Dumbbell size={48} />
            </div>
            <h3>머신 가이드</h3>
            <p>운동 기구 사용법을 배워보세요</p>
          </div>
          <div
            className={styles.serviceCard}
            onClick={() => navigate("/community")}
          >
            <div className={styles.serviceIcon}>
              <Users size={48} />
            </div>
            <h3>커뮤니티</h3>
            <p>함께 운동하는 동료들과 소통하세요</p>
          </div>
          <div
            className={styles.serviceCard}
            onClick={() => navigate("/missions")}
          >
            <div className={styles.serviceIcon}>
              <BarChart3 size={48} />
            </div>
            <h3>운동 기록일지</h3>
            <p>나의 운동 기록을 체계적으로 관리하세요</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2>득근득근만의 특별한 기능</h2>
          <p>다른 헬스 앱과 차별화된 혁신적인 기능들을 경험해보세요</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <TrendingUp size={40} />
            </div>
            <h3>레벨 시스템</h3>
            <p>운동과 활동을 통해 레벨업하며 성취감을 느껴보세요</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Shield size={40} />
            </div>
            <h3>보안 중심</h3>
            <p>JWT 토큰과 reCAPTCHA로 안전한 서비스를 제공합니다</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={40} />
            </div>
            <h3>실시간 업데이트</h3>
            <p>
              헬스장 정보가 실시간으로 업데이트되어 정확한 정보를 제공합니다
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Target size={40} />
            </div>
            <h3>개인화된 경험</h3>
            <p>나만의 운동 목표와 기록을 관리할 수 있습니다</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={32} />
            </div>
            <div className={styles.statContent}>
              <h3>
                {statsLoading
                  ? "..."
                  : stats
                  ? formatNumber(stats.activeUsers)
                  : "0"}
              </h3>
              <p>활성 사용자</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MapPin size={32} />
            </div>
            <div className={styles.statContent}>
              <h3>
                {statsLoading
                  ? "..."
                  : stats
                  ? formatNumber(stats.totalGyms)
                  : "0"}
              </h3>
              <p>등록된 헬스장</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MessageCircle size={32} />
            </div>
            <div className={styles.statContent}>
              <h3>
                {statsLoading
                  ? "..."
                  : stats
                  ? formatNumber(stats.totalPosts)
                  : "0"}
              </h3>
              <p>커뮤니티 게시글</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Trophy size={32} />
            </div>
            <div className={styles.statContent}>
              <h3>
                {statsLoading
                  ? "..."
                  : stats
                  ? formatNumber(stats.achievements)
                  : "0"}
              </h3>
              <p>달성된 업적</p>
            </div>
          </div>
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
                  <span className={styles.statusIcon}>
                    <Zap size={16} />
                  </span>
                  <span>오늘의 운동: 가슴 + 삼두</span>
                </div>
              </div>
            </div>

            {/* 레벨 카드 */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.levelIcon}>
                  <Star size={24} />
                </div>
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
                <div className={styles.actionIcon}>
                  <Award size={24} />
                </div>
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

      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <div className={styles.faqHeader}>
          <h2>자주 묻는 질문</h2>
          <p>득근득근에 대한 궁금한 점들을 확인해보세요</p>
        </div>
        <div className={styles.faqGrid}>
          <div className={styles.faqCard}>
            <div className={styles.faqIcon}>
              <MapPin size={24} />
            </div>
            <h3>헬스장 정보는 어떻게 업데이트되나요?</h3>
            <p>
              서울시 공공데이터 API와 다중 소스 크롤링을 통해 실시간으로 헬스장
              정보를 업데이트합니다.
            </p>
          </div>
          <div className={styles.faqCard}>
            <div className={styles.faqIcon}>
              <Star size={24} />
            </div>
            <h3>레벨 시스템은 어떻게 작동하나요?</h3>
            <p>
              게시글 작성, 댓글, 좋아요 등 다양한 활동을 통해 경험치를 얻고
              레벨업할 수 있습니다.
            </p>
          </div>
          <div className={styles.faqCard}>
            <div className={styles.faqIcon}>
              <Shield size={24} />
            </div>
            <h3>개인정보는 안전한가요?</h3>
            <p>
              JWT 토큰과 reCAPTCHA를 사용하여 보안을 강화하고, 모든 개인정보는
              암호화되어 보관됩니다.
            </p>
          </div>
          <div className={styles.faqCard}>
            <div className={styles.faqIcon}>
              <Users size={24} />
            </div>
            <h3>커뮤니티 기능은 어떻게 사용하나요?</h3>
            <p>
              로그인 후 게시글을 작성하고, 다른 사용자들과 소통하며 운동 정보를
              공유할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

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
