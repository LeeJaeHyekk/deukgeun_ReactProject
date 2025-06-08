// import styles from "./ServiceIntro.module.css";

// export const ServiceIntro = () => (
//   <section className={styles.section}>
//     {[
//       { title: "위치 기반 추천", desc: "내 주변 기구, 추천 루틴을 자동 분석" },
//       { title: "기능적 근비대", desc: "논문 기반의 알고리즘으로 구성된 운동 프로그램" },
//       { title: "도전과 미션", desc: "미션 기반으로 재미있게 지속 가능한 운동 습관 형성" },
//     ].map((item, i) => (
//       <div key={i} className={styles.card}>
//         <h3 className={styles.title}>{item.title}</h3>
//         <p className={styles.desc}>{item.desc}</p>
//       </div>
//     ))}
//   </section>
// );

// ServiceIntro/index.tsx
// import { useEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import styles from "./ServiceIntro.module.css";
// gsap.registerPlugin(ScrollTrigger);

// export function ServiceIntro() {
//   const ref = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     gsap.from(ref.current?.children, {
//       opacity: 0, y: 50, stagger: 0.2,
//       scrollTrigger: { trigger: ref.current, start: "top 80%" },
//     });
//   }, []);
//   return (
//     <section ref={ref} className={styles.section}>
//       {/* cards */}
//     </section>
//   );
// }

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ServiceIntro.module.css";

gsap.registerPlugin(ScrollTrigger);

export function ServiceIntro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const children = Array.from(element.children);

    gsap.from(children, {
      opacity: 0,
      y: 50,
      stagger: 0.2,
      scrollTrigger: { trigger: element, start: "top 80%" },
    });
  }, []);

  return (
    <section ref={ref} className={styles.section}>
      {/* cards */}
    </section>
  );
}
