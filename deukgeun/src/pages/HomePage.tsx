import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homePage">

      {/* <nav className="navBar">
        <div className="nav-logo">득근득근</div>
        <div className="navMenu">
          <div className="navItem glass">Search Gym</div>
          <div className="navItem glass">Machine Guide</div>
          <div className="navItem glass">Community</div>
          <div className="navItem glass">Challenge</div>
          <div className="navItem glass">My Page</div>
        </div>
      </nav> */}

<nav className="navbar">
        <div className="logo">DGG</div>
        <ul className="nav-menu">
          <li>Search for Gym</li>
          <li>Machine Guide</li>
          <li>Community</li>
          <li>Challenge</li>
          <li>My Page</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="heroSection">
        <video
          src="/video/serviceMovie.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="heroVideo"
        />
        <div className="heroOverlay">
          <h1>운동의 시작, 득근득근</h1>
          <p>위치 기반 헬스 서비스부터 머신 가이드까지 한 번에</p>
        </div>
      </div>

      {/* Service Section */}
      <div className="serviceSection">
        <div className="serviceGrid">
          <div className="serviceCard"> 헬스장 위치</div>
          <div className="serviceCard"> 머신 가이드</div>
          <div className="serviceCard"> 커뮤니티</div>
          <div className="serviceCard"> 운동 기록일지</div>
        </div>
      </div>

      {/* My Info Section */}
      <div className="myInfoSection">
        <div className="infoBox">
          <div>내 정보 [Lv.3]</div>
          <div>✔️ 오늘의 운동: 가슴 + 삼두</div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="footerSection">
        <div>회사소개</div>
        <div>개인정보처리방침</div>
        <div>이용약관</div>
        <div>고객센터</div>
        <div>문의하기</div>
      </footer>
    </div>
  );
}
