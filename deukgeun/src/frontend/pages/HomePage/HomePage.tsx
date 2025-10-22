import { useCallback, useEffect } from 'react'
import styles from './HomePage.module.css'
import { Navigation } from '@widgets/Navigation/Navigation'
import { LoadingOverlay } from '@shared/ui/LoadingOverlay/LoadingOverlay'

// 커스텀 훅들
import { useHomePageData } from '@frontend/shared/hooks/useHomePageData'
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

  // 접근성 가드: 키보드 네비게이션 (글로벌 이벤트 처리)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && dataError) {
      clearErrors()
    }
  }, [dataError, clearErrors])

  // 글로벌 키보드 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 통합 로딩 상태 계산
  const globalLoading = isPageLoading || levelLoading || configLoading || userStatsLoading || statsLoading || isRetrying


  // homePageConfig 로딩 중일 때만 로딩 표시 (기본값으로 대체 가능)
  if (configLoading && !homePageConfig) {
    return <LoadingOverlay isLoading={true} />
  }

  return (
    <div 
      className={styles.homePage}
      tabIndex={0}
      role="main"
      aria-label="득근득근 홈페이지"
    >
      <LoadingOverlay isLoading={globalLoading} />
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
        heroVideoUrl={homePageConfig?.heroVideoUrl}
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
            <h2>{homePageConfig?.serviceTitle || '서비스 소개'}</h2>
            <p>{homePageConfig?.serviceSubtitle || '득근득근과 함께 건강한 변화를 시작하세요'}</p>
          </div>
          <div className={styles.serviceGrid}>
            {homePageConfig?.services?.map((service: any, index: any) => {
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
            }) || (
              // 기본 서비스 카드들
              <>
                <div className={styles.serviceCard} onClick={handleLocation}>
                  <div className={styles.serviceIcon}>
                    <div>📍</div>
                  </div>
                  <h3>헬스장 찾기</h3>
                  <p>내 주변 헬스장을 쉽게 찾아보세요</p>
                </div>
                <div className={styles.serviceCard} onClick={handleMachineGuide}>
                  <div className={styles.serviceIcon}>
                    <div>🏋️</div>
                  </div>
                  <h3>머신 가이드</h3>
                  <p>운동 기구 사용법을 배워보세요</p>
                </div>
                <div className={styles.serviceCard} onClick={() => window.location.href = '/community'}>
                  <div className={styles.serviceIcon}>
                    <div>👥</div>
                  </div>
                  <h3>커뮤니티</h3>
                  <p>함께 운동하는 동료들과 소통하세요</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Features Section - 로그인한 사용자에게만 표시 */}
      {isAuthenticated && user && (
        <div className={styles.featuresSection}>
          <div className={styles.featuresHeader}>
            <h2>{homePageConfig?.featuresTitle || '득근득근만의 특별한 기능'}</h2>
            <p>{homePageConfig?.featuresSubtitle || '다른 헬스 앱과 차별화된 혁신적인 기능들을 경험해보세요'}</p>
          </div>
          <div className={styles.featuresGrid}>
            {homePageConfig?.features?.map((feature: any, index: any) => {
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
            }) || (
              // 기본 기능 카드들
              <>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <div>📈</div>
                  </div>
                  <h3>레벨 시스템</h3>
                  <p>운동과 활동을 통해 레벨업하며 성취감을 느껴보세요</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <div>🛡️</div>
                  </div>
                  <h3>보안 중심</h3>
                  <p>JWT 토큰과 reCAPTCHA로 안전한 서비스를 제공합니다</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <div>⚡</div>
                  </div>
                  <h3>실시간 업데이트</h3>
                  <p>헬스장 정보가 실시간으로 업데이트되어 정확한 정보를 제공합니다</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <div>🎯</div>
                  </div>
                  <h3>개인화된 경험</h3>
                  <p>나만의 운동 목표와 기록을 관리할 수 있습니다</p>
                </div>
              </>
            )}
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
          <div className={styles.myInfoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.levelIcon}>🏆</div>
                <h3>레벨 정보</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.levelDisplay}>
                  <div className={styles.levelBadge}>
                    <span className={styles.levelNumber}>Lv.{currentLevel}</span>
                  </div>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className={styles.progressText}>
                      다음 레벨까지 {Math.max(0, 100 - progressPercentage)}% 남음
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.actionIcon}>📊</div>
                <h3>플랫폼 통계</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.quickStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{finalStats?.activeUsers || 0}</span>
                    <span className={styles.statLabel}>활성 사용자</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {Math.ceil((finalStats?.activeUsers || 0) / 10)}
                    </span>
                    <span className={styles.statLabel}>플랫폼 레벨</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {Math.min(100, ((finalStats?.activeUsers || 0) / 1000) * 100)}%
                    </span>
                    <span className={styles.statLabel}>진행률</span>
                  </div>
                </div>
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
            <h2>{homePageConfig?.faqTitle || '자주 묻는 질문'}</h2>
            <p>{homePageConfig?.faqSubtitle || '득근득근에 대한 궁금한 점들을 확인해보세요'}</p>
          </div>
          <div className={styles.faqGrid}>
            {homePageConfig?.faqs?.map((faq: any, index: any) => {
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
            }) || (
              // 기본 FAQ 카드들
              <>
                <div className={styles.faqCard}>
                  <div className={styles.faqIcon}>
                    <div>📍</div>
                  </div>
                  <h3>헬스장 정보는 어떻게 업데이트되나요?</h3>
                  <p>서울시 공공데이터 API와 다중 소스 크롤링을 통해 실시간으로 헬스장 정보를 업데이트합니다.</p>
                </div>
                <div className={styles.faqCard}>
                  <div className={styles.faqIcon}>
                    <div>⭐</div>
                  </div>
                  <h3>레벨 시스템은 어떻게 작동하나요?</h3>
                  <p>게시글 작성, 댓글, 좋아요 등 다양한 활동을 통해 경험치를 얻고 레벨업할 수 있습니다.</p>
                </div>
                <div className={styles.faqCard}>
                  <div className={styles.faqIcon}>
                    <div>🛡️</div>
                  </div>
                  <h3>개인정보는 안전한가요?</h3>
                  <p>JWT 토큰과 reCAPTCHA를 사용하여 보안을 강화하고, 모든 개인정보는 암호화되어 보관됩니다.</p>
                </div>
                <div className={styles.faqCard}>
                  <div className={styles.faqIcon}>
                    <div>👥</div>
                  </div>
                  <h3>커뮤니티 기능은 어떻게 사용하나요?</h3>
                  <p>로그인 후 게시글을 작성하고, 다른 사용자들과 소통하며 운동 정보를 공유할 수 있습니다.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer Section - 로그인한 사용자에게만 표시 */}
      {isAuthenticated && user && (
        <footer className={styles.footerSection}>
          <div className={styles.footerContainer}>
            <div className={styles.footerMain}>
              {/* 회사 정보 섹션 */}
              <div className={styles.footerColumn}>
                <div className={styles.footerLogo}>
                  <img
                    src="/img/logo.png"
                    alt={homePageConfig?.footerCompanyName || '득근득근'}
                    className={styles.footerLogoImg}
                  />
                  <h3>{homePageConfig?.footerCompanyName || '득근득근'}</h3>
                </div>
                <p className={styles.footerDescription}>
                  {homePageConfig?.footerDescription || '과거의 나를 뛰어넘는 것이 진정한 성장이다.\n당신의 건강한 변화를 응원합니다.'}
                </p>
              </div>

              {/* 서비스 섹션 */}
              <div className={styles.footerColumn}>
                <h4>서비스</h4>
                <ul className={styles.footerLinks}>
                  {homePageConfig?.footerLinks?.service?.map((link: any, index: any) => (
                    <li key={index}>
                      <a href={link.url}>{link.text}</a>
                    </li>
                  )) || (
                    <>
                      <li><a href="/location" onClick={(e) => { e.preventDefault(); handleLocation(); }}>헬스장 찾기</a></li>
                      <li><a href="/machine-guide" onClick={(e) => { e.preventDefault(); handleMachineGuide(); }}>머신 가이드</a></li>
                      <li><a href="/community">커뮤니티</a></li>
                      <li><a href="/workout-journal">운동 기록일지</a></li>
                    </>
                  )}
                </ul>
              </div>

              {/* 지원 섹션 */}
              <div className={styles.footerColumn}>
                <h4>지원</h4>
                <ul className={styles.footerLinks}>
                  {homePageConfig?.footerLinks?.support?.map((link: any, index: any) => (
                    <li key={index}>
                      <span className={styles.disabledLink}>{link.text}</span>
                    </li>
                  )) || (
                    <>
                      <li><span className={styles.disabledLink}>자주 묻는 질문</span></li>
                      <li><span className={styles.disabledLink}>문의하기</span></li>
                      <li><span className={styles.disabledLink}>피드백</span></li>
                      <li><span className={styles.disabledLink}>도움말</span></li>
                    </>
                  )}
                </ul>
              </div>

              {/* 회사 정보 섹션 */}
              <div className={styles.footerColumn}>
                <h4>회사</h4>
                <ul className={styles.footerLinks}>
                  {homePageConfig?.footerLinks?.company?.map((link: any, index: any) => (
                    <li key={index}>
                      <span className={styles.disabledLink}>{link.text}</span>
                    </li>
                  )) || (
                    <>
                      <li><span className={styles.disabledLink}>회사소개</span></li>
                      <li><span className={styles.disabledLink}>개인정보처리방침</span></li>
                      <li><span className={styles.disabledLink}>이용약관</span></li>
                      <li><span className={styles.disabledLink}>채용정보</span></li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            <div className={styles.footerBottom}>
              <p>&copy; 2024 {homePageConfig?.footerCompanyName || '득근득근'}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
