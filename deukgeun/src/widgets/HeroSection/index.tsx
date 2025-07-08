// import { Canvas, useFrame, useLoader } from "@react-three/fiber";
// import { useRef, useEffect, useState } from "react";
// import * as THREE from "three";
// import styles from "./HeroSection.module.css";

// function HeroCanvas() {
//   const mesh = useRef<THREE.Mesh>(null!);
//   const texture = useLoader(THREE.TextureLoader, "/img/heroSection_IMG.jpg");
//   const [aspectRatio, setAspectRatio] = useState(3 / 2); // 기본 비율: 가로 3, 세로 2

//   // 텍스처 로딩 후 비율 측정
//   useEffect(() => {
//     if (texture.image) {
//       const { width, height } = texture.image;
//       setAspectRatio(width / height);
//     }
//   }, [texture]);

//   useFrame(({ mouse }) => {
//     if (!mesh.current) return;
//     mesh.current.rotation.y += (mouse.x * 0.3 - mesh.current.rotation.y) * 0.05;
//     mesh.current.rotation.x += (-mouse.y * 0.3 - mesh.current.rotation.x) * 0.05;
//   });

//   return (
//     <mesh ref={mesh}>
//       <planeGeometry args={[aspectRatio * 2, 2]} />
//       <meshBasicMaterial map={texture} toneMapped={false} />
//     </mesh>
//   );
// }

// export const HeroSection = () => {
//   const maskRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       if (maskRef.current) {
//         maskRef.current.style.setProperty("--x", `${e.clientX}px`);
//         maskRef.current.style.setProperty("--y", `${e.clientY}px`);
//       }
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   return (
//     <section className={styles.wrapper}>
//       <div className={styles.yellowLayer} />
//       <div className={styles.maskLayer} ref={maskRef}>
//         <Canvas
//           className={styles.canvas}
//           camera={{ fov: 70, position: [0, 0, 3] }}
//         >
//           <HeroCanvas />
//         </Canvas>
//       </div>
//     </section>
//   );
// };

// HeroSection.tsx
import { Canvas } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import styles from "./HeroSection.module.css";
import { HeroCanvas } from "./HeroCanvas";

export const HeroSection = () => {
  const maskRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!maskRef.current) return;

      const rect = maskRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      setMouse({ x, y });

      maskRef.current.style.setProperty("--x", `${e.clientX}px`);
      maskRef.current.style.setProperty("--y", `${e.clientY}px`);
    };

    const handleMouseLeave = () => {
      setMouse({ x: 0, y: 0 });
    };

    const target = maskRef.current;
    if (target) {
      target.addEventListener("mousemove", handleMouseMove);
      target.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (target) {
        target.removeEventListener("mousemove", handleMouseMove);
        target.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <section className={styles.wrapper}>
      <div className={styles.yellowLayer} />
      <div className={styles.maskLayer} ref={maskRef}>
        <Canvas
          className={styles.canvas}
          camera={{ fov: 70, position: [0, 0, 3] }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 5]} />
          <HeroCanvas mouse={mouse} />
        </Canvas>
      </div>
    </section>
  );
};
