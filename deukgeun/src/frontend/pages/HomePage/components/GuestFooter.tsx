import styles from '../HomePage.module.css'

interface GuestFooterProps {
  onLocation: () => void
  onMachineGuide: () => void
  onLogin: () => void
  onRegister: () => void
}

/**
 * 게스트 푸터 컴포넌트
 */
export const GuestFooter = ({ 
  onLocation, 
  onMachineGuide, 
  onLogin, 
  onRegister 
}: GuestFooterProps) => {
  return (
    <footer className={styles.guestFooter}>
      <div className={styles.guestFooterContainer}>
        <div className={styles.guestFooterContent}>
          <div className={styles.guestFooterLogo}>
            <img
              src="/img/logo.png"
              alt="득근 로고"
              className={styles.guestFooterLogoImg}
            />
            <h3>득근득근</h3>
          </div>
          <p className={styles.guestFooterDescription}>
            헬스장 찾기부터 운동 기록까지, 모든 것을 한 곳에서
          </p>
          <div className={styles.guestFooterLinks}>
            <button onClick={onLocation} aria-label="헬스장 찾기 페이지로 이동">
              헬스장 찾기
            </button>
            <button onClick={onMachineGuide} aria-label="기구 가이드 페이지로 이동">
              기구 가이드
            </button>
            <button onClick={onLogin} aria-label="로그인 페이지로 이동">
              로그인
            </button>
            <button onClick={onRegister} aria-label="회원가입 페이지로 이동">
              회원가입
            </button>
          </div>
        </div>
        <div className={styles.guestFooterBottom}>
          <p className={styles.guestFooterCopyright}>
            © 2025 득근득근. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
