"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import type { Group, Mesh } from "three";

export default function CenterLogo() {
  const globeRef = useRef<Mesh>(null);
  const ringRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // 지구본 회전
    if (globeRef.current) {
      globeRef.current.rotation.y = t * 0.3;
    }
    
    // 링 회전
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.2;
      ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group position={[0, 0.3, 0]}>
      {/* 지구본 */}
      <mesh ref={globeRef} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color="#1e40af"
          metalness={0.3}
          roughness={0.7}
          emissive="#3b82f6"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 대륙 표현 (간단한 패치들) */}
      <mesh ref={globeRef} position={[0.15, 0.1, 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.28]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.1, -0.15, 0.32]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 궤도 링들 */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.015, 8, 64]} />
          <meshStandardMaterial
            color="#f472b6"
            emissive="#f472b6"
            emissiveIntensity={1.5}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <torusGeometry args={[0.6, 0.01, 8, 64]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* 포인트 라이트 (지구 발광) */}
      <pointLight
        position={[0, 0, 0]}
        color="#3b82f6"
        intensity={0.5}
        distance={2}
      />
    </group>
  );
}

