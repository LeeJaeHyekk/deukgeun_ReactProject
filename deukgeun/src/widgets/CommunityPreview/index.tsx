// import styles from "./CommunityPreview.module.css";

// export const CommunityPreview = () => (
//   <section className={styles.section}>
//     <h2 className={styles.heading}>🔥 실시간 커뮤니티 인기 글</h2>
//     <div className={styles.grid}>
//       {[1, 2, 3].map((_, i) => (
//         <div key={i} className={styles.card}>
//           <h3 className={styles.cardTitle}>오늘 하체 털렸습니다</h3>
//           <p className={styles.cardDesc}>
//             스미스 머신에서 100kg 8회 5세트 했어요! 미션 인증합니다.
//           </p>
//         </div>
//       ))}
//     </div>
//   </section>
// );

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./CommunityPreview.module.css";

gsap.registerPlugin(ScrollTrigger); // 꼭 등록해야 scrollTrigger 작동합니다

export function CommunityPreview() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const children = Array.from(grid.children); // HTMLCollection → Array로 변환

    gsap.from(children, {
      scale: 0.8,
      opacity: 0,
      stagger: 0.2,
      scrollTrigger: {
        trigger: grid,
        start: "top 80%",
      },
    });

    children.forEach((el) => {
      el.addEventListener("mouseenter", () => gsap.to(el, { scale: 1.05, duration: 0.3 }));
      el.addEventListener("mouseleave", () => gsap.to(el, { scale: 1, duration: 0.3 }));
    });

    // ⚠️ cleanup 이벤트 리스너 제거
    return () => {
      children.forEach((el) => {
        el.removeEventListener("mouseenter", () => {});
        el.removeEventListener("mouseleave", () => {});
      });
    };
  }, []);

  return (
    <section className={styles.section}>
      <div ref={gridRef} className={styles.grid}>
        {/* cards */}
      </div>
    </section>
  );
}
