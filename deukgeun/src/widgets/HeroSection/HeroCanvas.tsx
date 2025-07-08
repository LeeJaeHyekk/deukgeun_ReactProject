import { useFrame, useLoader } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

interface HeroCanvasProps {
  mouse: { x: number; y: number };
}

export function HeroCanvas({ mouse }: HeroCanvasProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, "/img/heroSection_IMG.jpg");
  const [aspectRatio, setAspectRatio] = useState(3 / 2); // 기본 비율

  useEffect(() => {
    if (texture.image) {
      const { width, height } = texture.image;
      setAspectRatio(width / height);
    }
  }, [texture]);

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.y += (mouse.x * 0.3 - mesh.current.rotation.y) * 0.05;
    mesh.current.rotation.x += (-mouse.y * 0.3 - mesh.current.rotation.x) * 0.05;
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[aspectRatio * 2, 2]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
