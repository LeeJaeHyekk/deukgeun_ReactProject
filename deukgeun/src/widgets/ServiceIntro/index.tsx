// import { useEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import styles from "./ServiceIntro.module.css";

// gsap.registerPlugin(ScrollTrigger);

// export function ServiceIntro() {
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const element = ref.current;
//     if (!element) return;

//     const children = Array.from(element.children);

//     gsap.from(children, {
//       opacity: 0,
//       y: 50,
//       stagger: 0.2,
//       scrollTrigger: { trigger: element, start: "top 80%" },
//     });
//   }, []);

//   return (
//     <section ref={ref} className={styles.section}>
//     </section>
//   );
// }
// ServiceIntro.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ServiceIntro.module.css";

gsap.registerPlugin(ScrollTrigger);

export function ServiceIntro() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const text = textRef.current;
    if (!section || !video || !text) return;

    // 1. 등장 애니메이션 (영상 + 텍스트)
    gsap.fromTo(
      [video, text],
      { opacity: 0.8, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        },
      }
    );

    // 2. 퇴장 시 흐려지기 (스크롤 내리며 사라짐)
    gsap.to([video, text], {
      opacity: 0.8,
      scrollTrigger: {
        trigger: section,
        start: "center center",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          src="/video/serviceMovie.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={styles.video}
        />
        <div className={styles.overlayText} ref={textRef}>
          <h2>득근득근</h2>
          <p>당신의 점진적 과부하를 설계합니다.</p>
        </div>
      </div>
    </section>
  );
}
