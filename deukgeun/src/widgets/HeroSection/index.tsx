// // src/widgets/HeroSection/index.tsx
// import styles from "./HeroSection.module.css";
// import { motion } from "framer-motion";

// export const HeroSection = () => (
//   <section className={styles.section}>
//     <video
//       className={styles.video}
//       autoPlay
//       loop
//       muted
//       playsInline
//       src="/videos/hero.mp4"
//     />
//     <div className={styles.content}>
//       <motion.h1
//         className={styles.title}
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//       >
//         운동의 가치를 설계하다
//       </motion.h1>
//       <motion.p
//         className={styles.description}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3, duration: 1 }}
//       >
//         위치 기반으로 추천받고, 기기별 가이드를 통해 정확하게 운동하세요.
//       </motion.p>
//     </div>
//   </section>
// );

// src/widgets/HeroSection/index.tsx
// import styles from "./HeroSection.module.css";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Stars } from "@react-three/drei";
// import { motion } from "framer-motion";

// const WebGLBackground = () => {
//   return (
//     <>
//       <ambientLight intensity={0.5} />
//       <pointLight position={[10, 10, 10]} />
//       <Stars radius={100} depth={50} count={5000} factor={4} />
//     </>
//   );
// };

// export const HeroSection = () => (
//   <section className={styles.section}>
//     <Canvas className={styles.webgl} camera={{ position: [0, 0, 1] }}>
//       <WebGLBackground />
//       {/* 필요 시 OrbitControls 추가 */}
//       {/* <OrbitControls enableZoom={false} /> */}
//     </Canvas>

//     <div className={styles.content}>
//       <motion.h1
//         className={styles.title}
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//       >
//         운동의 가치를 설계하다
//       </motion.h1>
//       <motion.p
//         className={styles.description}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3, duration: 1 }}
//       >
//         위치 기반으로 추천받고, 기기별 가이드를 통해 정확하게 운동하세요.
//       </motion.p>
//     </div>
//   </section>
// );

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useRef, useEffect } from "react";
// import styles from "./HeroSection.module.css";

// function HeroCanvas() {
//   const mesh = useRef<any>();
//   useFrame(({ clock, mouse }) => {
//     mesh.current.rotation.y = mouse.x * 0.5;
//     mesh.current.rotation.x = mouse.y * 0.5;
//   });
//   return (
//     <mesh ref={mesh}>
//       <boxGeometry />
//       <meshStandardMaterial color="#ffe500" />
//     </mesh>
//   );
// }

// export const HeroSection = () => {
//   const maskRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const onMouse = (e: MouseEvent) => {
//       maskRef.current?.style.setProperty("--x", `${e.clientX}px`);
//       maskRef.current?.style.setProperty("--y", `${e.clientY}px`);
//     };
//     window.addEventListener("mousemove", onMouse);
//     return () => window.removeEventListener("mousemove", onMouse);
//   }, []);

//   return (
//     <section className={styles.wrapper}>
//       <div className={styles.yellow} />
//       <div className={styles.mask} ref={maskRef}>
//         <Canvas className={styles.canvas} camera={{ fov: 75, position: [0, 0, 2] }}>
//           <ambientLight intensity={0.5} />
//           <pointLight position={[10, 10, 10]} />
//           <HeroCanvas />
//         </Canvas>
//         <div className={styles.content}>
//           <h1>운동의 가치를 설계하다</h1>
//           <p>위치 기반, 기기별 가이드로 정확성을 담아냅니다.</p>
//         </div>
//       </div>
//     </section>
//   );
// };

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import styles from "./HeroSection.module.css";
import * as THREE from "three";

function HeroCanvas() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(({ mouse }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = mouse.x * 0.5;
    mesh.current.rotation.x = mouse.y * 0.5;
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffe500" />
    </mesh>
  );
}

export const HeroSection = () => {
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (maskRef.current) {
        maskRef.current.style.setProperty("--x", `${e.clientX}px`);
        maskRef.current.style.setProperty("--y", `${e.clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className={styles.wrapper}>
      <div className={styles.yellowLayer} />
      <div className={styles.maskLayer} ref={maskRef}>
        <Canvas className={styles.canvas} camera={{ fov: 75, position: [0, 0, 2] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <HeroCanvas />
        </Canvas>
        <div className={styles.content}>
          <h1>운동의 가치를 설계하다</h1>
          <p>위치 기반, 기기별 가이드로 정확성을 담아냅니다.</p>
        </div>
      </div>
    </section>
  );
};
