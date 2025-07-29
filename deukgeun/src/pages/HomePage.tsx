// import styles from "./HomePage.module.css";
// import { Navigation } from "@widgets/Navigation/Navigation";
// import { LoadingOverlay } from "@shared/ui/LoadingOverlay/LoadingOverlay";

// export default function HomePage() {
//   return (
//     <div className={styles.homePage}>
//       <Navigation />

//       {/* Hero Section */}
//       <div className={styles.heroSection}>
//         <video
//           src="/video/serviceMovie.mp4"
//           autoPlay
//           muted
//           loop
//           playsInline
//           className={styles.heroVideo}
//         />
//         <div className={styles.heroOverlay}>
//           <h1>운동의 시작, 득근득근</h1>
//           <p>위치 기반 헬스 서비스부터 머신 가이드까지 한 번에</p>
//         </div>
//       </div>

//       {/* Service Section */}
//       <div className={styles.serviceSection}>
//         <div className={styles.serviceGrid}>
//           <div className={styles.serviceCard}> 헬스장 위치</div>
//           <div className={styles.serviceCard}> 머신 가이드</div>
//           <div className={styles.serviceCard}> 커뮤니티</div>
//           <div className={styles.serviceCard}> 운동 기록일지</div>
//         </div>
//       </div>

//       {/* My Info Section */}
//       <section className={styles.wrapper}>
//         <div className={styles.profile}>
//           <img
//             src="/img/user-avatar.png"
//             alt="유저 아바타"
//             className={styles.avatar}
//           />
//           <div className={styles.userMeta}>
//             <div className={styles.username}>
//               JaeHyuk
//               <span className={styles.level}>Lv.3</span>
//             </div>
//             <div className={styles.settingIcon}>⚙️</div>
//           </div>
//         </div>

//         <div className={styles.infoBlock}>
//           <div className={styles.infoItem}>
//             <p className={styles.label}>운동 부위</p>
//             <p className={styles.value}>🔥 가슴 + 삼두</p>
//           </div>
//           <div className={styles.infoItem}>
//             <p className={styles.label}>이메일</p>
//             <p className={styles.value}>jaehyuk@email.com</p>
//           </div>
//           <div className={styles.infoItem}>
//             <p className={styles.label}>진행 중 미션</p>
//             <p className={styles.value}>2개</p>
//           </div>
//           <div className={styles.infoItem}>
//             <p className={styles.label}>최근 운동일</p>
//             <p className={styles.value}>2025.07.24</p>
//           </div>
//         </div>

//         <div className={styles.actions}>
//           <button className={styles.actionBtn}>회원정보 수정</button>
//           <button className={styles.actionBtn}>운동 기록 보기</button>
//           <button className={styles.logoutBtn}>로그아웃</button>
//         </div>
//       </section>

//       {/* Footer Section */}
//       <footer className={styles.footerSection}>
//         <div>회사소개</div>
//         <div>개인정보처리방침</div>
//         <div>이용약관</div>
//         <div>고객센터</div>
//         <div>문의하기</div>
//       </footer>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { Navigation } from "@widgets/Navigation/Navigation";
import { LoadingOverlay } from "@shared/ui/LoadingOverlay/LoadingOverlay";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // 로딩 상태를 일정 시간 후 false로 바꿈 (예시: 2초 후 해제)
  useEffect(() => {
    // 🚩 실제 필요한 데이터 호출
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/home-data"); // 예시
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("데이터 불러오기 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <div className={styles.infoItem}>
            <p className={styles.label}>운동 부위</p>
            <p className={styles.value}>🔥 가슴 + 삼두</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>이메일</p>
            <p className={styles.value}>jaehyuk@email.com</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>진행 중 미션</p>
            <p className={styles.value}>2개</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>최근 운동일</p>
            <p className={styles.value}>2025.07.24</p>
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
