import { useCallback } from 'react'
import styles from './HomePage.module.css'
import { Navigation } from '@widgets/Navigation/Navigation'
import { LoadingOverlay } from '@shared/ui/LoadingOverlay/LoadingOverlay'

// 커스텀 훅들
import { useHomePageData } from './hooks/useHomePageData'
import { useErrorHandling } from './hooks/useErrorHandling'
import { useNavigation } from './hooks/useNavigation'

// 컴포넌트들
import { ErrorFallback } from './components/ErrorFallback'
import { HeroSection } from './components/HeroSection'
import { StatsSection } from './components/StatsSection'
import { GuestSection } from './components/GuestSection'
import { GuestFooter } from './components/GuestFooter'

// 유틸리티
import { getIconComponent } from './utils'

/**
 * 홈페이지 메인 컴포넌트
 */
export default function HomePage() {
  // 데이터 및 상태 관리
  const {
    user,
    isAuthenticated,
    currentLevel,
    progressPercentage,
    finalStats,
    userStats,
    homePageConfig,
    isPageLoading,
    levelLoading,
    configLoading,
    userStatsLoading,
    statsLoading,
  } = useHomePageData()

  // 에러 처리
  const {
    videoError,
    dataError,
    retryCount,
    isRetrying,
    handleRetry,
    clearErrors,
    setVideoErrorState,
    setDataErrorState,
  } = useErrorHandling()

  // 네비게이션
  const {
    handleLogin,
    handleLocation,
    handleMachineGuide,
    handleMypage,
    handleRegister,
  } = useNavigation()

  // 접근성 가드: 키보드 네비게이션
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && dataError) {
      clearErrors()
    }
  }, [dataError, clearErrors])

  return (
    <div 
      className={styles.homePage}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="main"
      aria-label="득근득근 홈페이지"
    >
      <LoadingOverlay isLoading={isPageLoading || isRetrying} />
      <Navigation />
      
      {/* 에러 상태 표시 */}
      {dataError && (
        <ErrorFallback
          dataError={dataError}
          retryCount={retryCount}
          isRetrying={isRetrying}
          onRetry={handleRetry}
          onClear={clearErrors}
        />
      )}

      {/* Hero Section */}
      <HeroSection
        heroVideoUrl={homePageConfig.heroVideoUrl}
        onVideoError={setVideoErrorState}
        videoError={videoError}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLocation={handleLocation}
      />

      {/* Service Section - 로그인한 사용자에게만 표시 */}
      {isAuthenticated && user && (
        <div className={styles.serviceSection}>
          <div className={styles.serviceHeader}>
            <h2>{homePageConfig.serviceTitle}</h2>
            <p>{homePageConfig.serviceSubtitle}</p>
          </div>
          <div className={styles.serviceGrid}>
            {Array.isArray(homePageConfig.services) && homePageConfig.services.map((service: any, index: any) => {
              const IconComponent = getIconComponent(service.icon)

              return (
                <div
                  key={index}
                  className={styles.serviceCard}
                  onClick={handleLocation}
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
      )}

      {/* Features Section - 로그인한 사용자에게만 표시 */}
      {isAuthenticated && user && (
        <div className={styles.featuresSection}>
          <div className={styles.featuresHeader}>
            <h2>{homePageConfig.featuresTitle}</h2>
            <p>{homePageConfig.featuresSubtitle}</p>
          </div>
          <div className={styles.featuresGrid}>
            {Array.isArray(homePageConfig.features) && homePageConfig.features.map((feature: any, index: any) => {
              const IconComponent = getIconComponent(feature.icon)

              return (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <IconComponent size={32} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats Section - 로그인한 사용자에게만 표시 */}
      {isAuthenticated && user && (
        <StatsSection stats={finalStats} isLoading={statsLoading} />
      )}

      {/* My Info Section - 로그인한 사용자에게만 표시 */}
      {isAuthenticated && user && (
        <section className={styles.myInfoSection}>
          <div className={styles.myInfoHeader}>
            <h2>내 정보</h2>
            <p>현재 레벨과 진행 상황을 확인하세요</p>
          </div>
          <div className={styles.myInfoContent}>
            <div className={styles.levelInfo}>
              <div className={styles.levelBadge}>
                <span className={styles.levelNumber}>Lv.{currentLevel}</span>
              </div>
              <div className={styles.progressInfo}>
                <h3>현재 레벨: {currentLevel}</h3>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className={styles.progressText}>
                  다음 레벨까지 {100 - progressPercentage}% 남음
                </p>
              </div>
            </div>
            <div className={styles.statsInfo}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>활성 사용자</span>
                <span className={styles.statValue}>{finalStats.activeUsers}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>플랫폼 레벨</span>
                <span className={styles.statValue}>
                  {Math.ceil(finalStats.activeUsers / 10)}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>진행률</span>
                <span className={styles.statValue}>
                  {Math.min(100, (finalStats.activeUsers / 1000) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Guest Introduction Section - 로그인하지 않은 사용자에게만 표시 */}
      {!isAuthenticated && <GuestSection />}

      {/* Guest Footer - 로그인하지 않은 사용자에게만 표시 */}
      {!isAuthenticated && (
        <GuestFooter
          onLocation={handleLocation}
          onMachineGuide={handleMachineGuide}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {/* FAQ Section - 로그인한 사용자에게만 표시 */}
      {isAuthenticated && user && (
        <div className={styles.faqSection}>
          <div className={styles.faqHeader}>
            <h2>{homePageConfig.faqTitle}</h2>
            <p>{homePageConfig.faqSubtitle}</p>
          </div>
          <div className={styles.faqGrid}>
            {Array.isArray(homePageConfig.faqs) && homePageConfig.faqs.map((faq: any, index: any) => {
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
      )}

      {/* Footer Section - 로그인한 사용자에게만 표시 */}
      {isAuthenticated && user && (
        <footer className={styles.footerSection}>
          <div className={styles.footerContainer}>
            <div className={styles.footerMain}>
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
                  {homePageConfig.footerDescription}
                </p>
              </div>
              <div className={styles.footerColumn}>
                <h4>서비스</h4>
                <ul className={styles.footerLinks}>
                  {Array.isArray(homePageConfig.footerLinks) && homePageConfig.footerLinks.map((link: any, index: any) => (
                    <li key={index}>
                      <a href={link.url}>{link.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.footerBottom}>
              <p>&copy; 2024 {homePageConfig.footerCompanyName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
