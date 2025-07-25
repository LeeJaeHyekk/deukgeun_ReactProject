import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      {/* <nav className={styles.navbar}>
        <div className={styles.logo}>DGG</div>
        <ul className={styles.navMenu}>
          <li>Search for Gym</li>
          <li>Machine Guide</li>
          <li>Community</li>
          <li>Challenge</li>
          <li>My Page</li>
        </ul>
      </nav> */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>DGG</div>
        <ul className={styles.navMenu}>
          <li className={styles.navMenuItem}>Search for Gym</li>
          <li className={styles.navMenuItem}>Machine Guide</li>
          <li className={styles.navMenuItem}>Community</li>
          <li className={styles.navMenuItem}>Challenge</li>
          <li className={styles.navMenuItem}>My Page</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <video
          src="/video/serviceMovie.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={styles.heroVideo}
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
      <section className={styles.wrapper}>
        <div className={styles.profile}>
          <img
            src="/img/user-avatar.png"
            alt="유저 아바타"
            className={styles.avatar}
          />
          <div className={styles.userMeta}>
            <div className={styles.username}>
              JaeHyuk
              <span className={styles.level}>Lv.3</span>
            </div>
            <div className={styles.settingIcon}>⚙️</div>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div>
            <span className={styles.label}>운동 부위</span>
            <span className={styles.value}>🔥 가슴 + 삼두</span>
          </div>
          <div>
            <span className={styles.label}>이메일</span>
            <span className={styles.value}>jaehyuk@email.com</span>
          </div>
          <div>
            <span className={styles.label}>진행 중 미션</span>
            <span className={styles.value}>2개</span>
          </div>
          <div>
            <span className={styles.label}>최근 운동일</span>
            <span className={styles.value}>2025.07.24</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionBtn}>회원정보 수정</button>
          <button className={styles.actionBtn}>운동 기록 보기</button>
          <button className={styles.logoutBtn}>로그아웃</button>
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
