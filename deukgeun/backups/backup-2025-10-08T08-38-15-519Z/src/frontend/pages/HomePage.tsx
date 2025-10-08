import { useState } from 'react'
import styles from './HomePage.module.css'
import { Navigation } from '@widgets/Navigation/Navigation'
import { LoadingOverlay } from '@shared/ui/LoadingOverlay/LoadingOverlay'
import { useUserStore } from '@frontend/shared/store/userStore'
import { useAuthContext } from '@frontend/shared/contexts/AuthContext'
import { useLevel } from '@frontend/shared/hooks/useLevel'
import { useStats } from '@frontend/shared/hooks/useStats'
import { useHomePageConfig } from '@frontend/shared/hooks/useHomePageConfig'
import { useUserStats } from '@frontend/shared/hooks/useUserStats'
import { useNavigate } from 'react-router-dom'
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
  MessageCircle,
  Trophy,
} from 'lucide-react'

export default function HomePage() {
  const [isLoading] = useState(false)
  const user = useUserStore(state => state.user)
  const { isAuthenticated } = useAuthContext()
  const { levelProgress, isLoading: levelLoading } = useLevel()
  const { config: homePageConfig, isLoading: configLoading } = useHomePageConfig()
  const { userStats, isLoading: userStatsLoading } = useUserStats()

  // 레벨 데이터에서 필요한 값들 추출
  const currentLevel = levelProgress?.level ?? 1
  const progressPercentage = levelProgress?.progressPercentage ?? 0
  const { stats, isLoading: statsLoading } = useStats()
  const navigate = useNavigate()

  // 통계 데이터 포맷팅 함수
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`
    } else {
      return `${num}+`
    }
  }

  // 기본 통계값
  const defaultStats = {
    activeUsers: 150,
    totalGyms: 45,
    totalPosts: 320,
    achievements: 25,
  }

  // 통계 데이터 사용 (없으면 기본값)
  const displayStats = stats || defaultStats

  return (
    <div className={styles.homePage}>
      <LoadingOverlay isLoading={isLoading} />
      <Navigation />

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <video
          src={homePageConfig.heroVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className={styles.heroVideo}
          onError={e => console.error('Video loading error:', e)}
        />
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <h1>{homePageConfig.heroTitle}</h1>
            <p>{homePageConfig.heroSubtitle}</p>
            <div className={styles.heroButtons}>
              <button
                className={styles.heroBtnPrimary}
                onClick={() => navigate('/location')}
              >
                {homePageConfig.heroPrimaryButtonText}
              </button>
              <button
                className={styles.heroBtnSecondary}
                onClick={() => navigate('/machine-guide')}
              >
                {homePageConfig.heroSecondaryButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Section */}
      <div className={styles.serviceSection}>
        <div className={styles.serviceHeader}>
          <h2>{homePageConfig.serviceTitle}</h2>
          <p>{homePageConfig.serviceSubtitle}</p>
        </div>
        <div className={styles.serviceGrid}>
          {homePageConfig.services.map((service, index) => {
            // 아이콘 컴포넌트 매핑
            const getIconComponent = (iconName: string) => {
              const iconMap: Record<string, any> = {
                MapPin,
                Dumbbell,
                Users,
                BarChart3,
              }
              return iconMap[iconName] || MapPin
            }

            const IconComponent = getIconComponent(service.icon)

            return (
              <div
                key={index}
                className={styles.serviceCard}
                onClick={() => navigate(service.link)}
              >
                <div className={styles.serviceIcon}>
                  <IconComponent size={48} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2>{homePageConfig.featuresTitle}</h2>
          <p>{homePageConfig.featuresSubtitle}</p>
        </div>
        <div className={styles.featuresGrid}>
          {homePageConfig.features.map((feature, index) => {
            // 아이콘 컴포넌트 매핑
            const getIconComponent = (iconName: string) => {
              const iconMap: Record<string, any> = {
                TrendingUp,
                Shield,
                Zap,
                Target,
              }
              return iconMap[iconName] || TrendingUp
            }

            const IconComponent = getIconComponent(feature.icon)

            return (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <IconComponent size={40} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            )
          })}
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
                {statsLoading ? '...' : formatNumber(displayStats.activeUsers)}
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
                {statsLoading ? '...' : formatNumber(displayStats.totalGyms)}
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
                {statsLoading ? '...' : formatNumber(displayStats.totalPosts)}
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
                {statsLoading ? '...' : formatNumber(displayStats.achievements)}
              </h3>
              <p>달성된 업적</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Info Section - 로그인된 경우에만 표시 */}
      {isAuthenticated && user && (
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
                  <span>
                    {userStatsLoading 
                      ? '로딩 중...' 
                      : `총 운동일: ${userStats?.workout.totalDays || 0}일`
                    }
                  </span>
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
                    {levelLoading ? '...' : `Lv.${currentLevel}`}
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
                        ? '로딩 중...'
                        : `${Number(progressPercentage ?? 0).toFixed(0)}% 완료`}
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
                  onClick={() => navigate('/mypage')}
                  className={styles.mypageBtn}
                >
                  마이페이지로 이동
                </button>
                <div className={styles.quickStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {userStatsLoading ? '...' : userStats?.workout.totalDays || 0}
                    </span>
                    <span className={styles.statLabel}>운동일수</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {userStatsLoading ? '...' : userStats?.workout.consecutiveDays || 0}
                    </span>
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
          <h2>{homePageConfig.faqTitle}</h2>
          <p>{homePageConfig.faqSubtitle}</p>
        </div>
        <div className={styles.faqGrid}>
          {homePageConfig.faqs.map((faq, index) => {
            // 아이콘 컴포넌트 매핑
            const getIconComponent = (iconName: string) => {
              const iconMap: Record<string, any> = {
                MapPin,
                Star,
                Shield,
                Users,
              }
              return iconMap[iconName] || MapPin
            }

            const IconComponent = getIconComponent(faq.icon)

            return (
              <div key={index} className={styles.faqCard}>
                <div className={styles.faqIcon}>
                  <IconComponent size={24} />
                </div>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            )
          })}
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
                  alt={homePageConfig.footerCompanyName}
                  className={styles.footerLogoImg}
                />
                <h3>{homePageConfig.footerCompanyName}</h3>
              </div>
              <p className={styles.footerDescription}>
                {homePageConfig.footerDescription.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < homePageConfig.footerDescription.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
              <div className={styles.socialLinks}>
                {homePageConfig.socialLinks.map((social, index) => (
                  <a key={index} href={social.url} className={styles.socialLink}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* 서비스 */}
            <div className={styles.footerColumn}>
              <h4>서비스</h4>
              <ul className={styles.footerLinks}>
                {homePageConfig.footerLinks.service.map((link, index) => (
                  <li key={index}>
                    <a href={link.url}>{link.text}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 고객지원 */}
            <div className={styles.footerColumn}>
              <h4>고객지원</h4>
              <ul className={styles.footerLinks}>
                {homePageConfig.footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.url}>{link.text}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 회사 정보 */}
            <div className={styles.footerColumn}>
              <h4>회사 정보</h4>
              <ul className={styles.footerLinks}>
                {homePageConfig.footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.url}>{link.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 하단 Footer 영역 */}
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>
                {homePageConfig.footerCopyright}
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
  )
}
