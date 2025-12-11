"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface Props {
  size: number;
}

export default function BoardBase({ size }: Props) {
  const glowRef = useRef<Mesh>(null);

  // 글로우 링 회전
  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      {/* 메인 베이스 플레이트 */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[size, 0.08, size]} />
        <meshStandardMaterial
          color="#0a0a12"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* 테두리 프레임 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size + 0.1, 0.12, size + 0.1]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* 네온 테두리 라인 - 상단 */}
      <mesh position={[0, 0.02, -size / 2]}>
        <boxGeometry args={[size + 0.15, 0.02, 0.03]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2}
        />
      </mesh>
      {/* 하단 */}
      <mesh position={[0, 0.02, size / 2]}>
        <boxGeometry args={[size + 0.15, 0.02, 0.03]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2}
        />
      </mesh>
      {/* 좌측 */}
      <mesh position={[-size / 2, 0.02, 0]}>
        <boxGeometry args={[0.03, 0.02, size + 0.15]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2}
        />
      </mesh>
      {/* 우측 */}
      <mesh position={[size / 2, 0.02, 0]}>
        <boxGeometry args={[0.03, 0.02, size + 0.15]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2}
        />
      </mesh>

      {/* 중앙 장식 링 */}
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.85, 64]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 외곽 글로우 링 */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.45, 64]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={1}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* 그리드 라인들 (장식) */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={`vline-${x}`} position={[x * (size * 0.4), 0.005, 0]}>
          <boxGeometry args={[0.01, 0.005, size * 0.6]} />
          <meshStandardMaterial
            color="#334155"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
      {[-0.5, 0.5].map((z) => (
        <mesh key={`hline-${z}`} position={[0, 0.005, z * (size * 0.4)]}>
          <boxGeometry args={[size * 0.6, 0.005, 0.01]} />
          <meshStandardMaterial
            color="#334155"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

