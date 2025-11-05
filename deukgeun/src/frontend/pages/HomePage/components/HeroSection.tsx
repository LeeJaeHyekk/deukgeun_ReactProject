import { useCallback } from 'react'
import styles from '../HomePage.module.css'
import { ERROR_MESSAGES } from '../constants'

interface HeroSectionProps {
  heroVideoUrl?: string
  onVideoError: (error: boolean, message?: string) => void
  videoError: boolean
  isAuthenticated: boolean
  onLogin: () => void
  onLocation: () => void
}

/**
 * 히어로 섹션 컴포넌트
 */
export const HeroSection = ({
  heroVideoUrl,
  onVideoError,
  videoError,
  isAuthenticated,
  onLogin,
  onLocation
}: HeroSectionProps) => {
  // 비디오 URL이 유효한지 확인 (빈 문자열이나 undefined 처리)
  const validVideoUrl = heroVideoUrl && heroVideoUrl.trim() !== '' ? heroVideoUrl : '/video/serviceMovie.mp4'
  
  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video loading error:', e)
    onVideoError(true, ERROR_MESSAGES.VIDEO_LOAD_ERROR)
  }, [onVideoError])

  return (
    <div className={styles.heroSection}>
      <video
        src={validVideoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={styles.heroVideo}
        onError={handleVideoError}
      />
      {videoError && (
        <div className={styles.videoFallback}>
          <div className={styles.videoFallbackContent}>
            <h2>득근득근</h2>
            <p>운동의 시작은 오늘부터 입니다.</p>
          </div>
        </div>
      )}
      <div className={styles.heroOverlay}>
        <div className={styles.heroContent}>
          <h1>득근득근</h1>
          <p>운동의 시작은 오늘부터 입니다.</p>
          {!isAuthenticated && (
            <div className={styles.heroButtons}>
              <button
                className={styles.heroBtnPrimary}
                onClick={onLogin}
                aria-label="로그인 페이지로 이동"
              >
                지금 시작하기
              </button>
              <button
                className={styles.heroBtnSecondary}
                onClick={onLocation}
                aria-label="헬스장 찾기 페이지로 이동"
              >
                둘러보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
