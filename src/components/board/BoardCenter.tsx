"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import type { Group, Mesh } from "three";

/**
 * 보드 중앙 장식 컴포넌트
 * - 회전하는 지구본 스타일 로고
 * - 타이틀 텍스트
 * - 장식 링
 */
export default function BoardCenter() {
  const globeRef = useRef<Group>(null);
  const ringsRef = useRef<Group>(null);
  const starsRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.3;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z += delta * 0.15;
    }
    if (starsRef.current) {
      starsRef.current.rotation.y -= delta * 0.1;
    }
  });

  return (
    <group position={[0, 0.02, 0]}>
      {/* 베이스 플레이트 */}
      <RoundedBox args={[2.2, 2.2, 0.04]} radius={0.15} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.9}
          roughness={0.1}
        />
      </RoundedBox>

      {/* 장식 테두리 */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* 회전하는 지구본 */}
      <group ref={globeRef} position={[0, 0.35, 0]}>
        {/* 지구 본체 */}
        <mesh castShadow>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial
            color="#1e40af"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
        
        {/* 대륙 (간단한 표현) */}
        <ContinentPatches />

        {/* 위도/경도 선 */}
        <GridLines />
      </group>

      {/* 궤도 링 */}
      <group ref={ringsRef} position={[0, 0.35, 0]}>
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <torusGeometry args={[0.55, 0.015, 8, 64]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[0.5, 0.01, 8, 64]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.4}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* 별/파티클 데코 */}
      <group ref={starsRef} position={[0, 0.35, 0]}>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 0.7 + (i % 3) * 0.1;
          const y = (i % 4 - 1.5) * 0.15;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius,
              ]}
            >
              <sphereGeometry args={[0.02 + (i % 3) * 0.005, 8, 8]} />
              <meshStandardMaterial
                color="#fef3c7"
                emissive="#fef3c7"
                emissiveIntensity={1}
              />
            </mesh>
          );
        })}
      </group>

      {/* 타이틀 텍스트 */}
      <group position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* AR World Marble - 상단 */}
        <Text
          fontSize={0.14}
          position={[0, 0.7, 0.01]}
          color="#22d3ee"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#0f172a"
        >
          AR WORLD
        </Text>
        <Text
          fontSize={0.18}
          position={[0, 0.52, 0.01]}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#0f172a"
        >
          MARBLE
        </Text>

        {/* 하단 장식 텍스트 */}
        <Text
          fontSize={0.06}
          position={[0, -0.65, 0.01]}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          🌏 세계를 정복하라! 🎲
        </Text>
      </group>

      {/* 코너 장식 */}
      <CornerDecorations />

      {/* 중앙 포인트 라이트 */}
      <pointLight
        position={[0, 0.8, 0]}
        color="#22d3ee"
        intensity={0.5}
        distance={3}
      />
    </group>
  );
}

// 대륙 패치 (간단한 표현)
function ContinentPatches() {
  const continents = [
    // 아시아
    { pos: [0.2, 0.15, 0.25] as [number, number, number], scale: 0.15 },
    // 유럽
    { pos: [-0.05, 0.2, 0.28] as [number, number, number], scale: 0.08 },
    // 아프리카
    { pos: [-0.1, 0, 0.32] as [number, number, number], scale: 0.12 },
    // 북미
    { pos: [-0.25, 0.15, 0.15] as [number, number, number], scale: 0.14 },
    // 남미
    { pos: [-0.2, -0.15, 0.2] as [number, number, number], scale: 0.1 },
    // 호주
    { pos: [0.25, -0.2, 0.18] as [number, number, number], scale: 0.08 },
  ];

  return (
    <group>
      {continents.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <sphereGeometry args={[c.scale, 8, 8]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// 위도/경도 그리드
function GridLines() {
  return (
    <group>
      {/* 위도선 */}
      {[-0.2, 0, 0.2].map((y, i) => (
        <mesh key={`lat-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.sqrt(0.35 ** 2 - y ** 2), 0.003, 8, 32]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* 경도선 */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`lon-${i}`} rotation={[0, (i / 4) * Math.PI, 0]}>
          <torusGeometry args={[0.35, 0.002, 8, 32]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// 코너 장식
function CornerDecorations() {
  const corners = [
    [-0.9, 0.03, -0.9],
    [0.9, 0.03, -0.9],
    [-0.9, 0.03, 0.9],
    [0.9, 0.03, 0.9],
  ] as [number, number, number][];

  const icons = ["✈️", "🚢", "🚀", "🚗"];

  return (
    <group>
      {corners.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.1, 32]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#22d3ee"
              emissiveIntensity={0.1}
            />
          </mesh>
          <Text
            position={[0, 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.08}
            anchorX="center"
            anchorY="middle"
          >
            {icons[i]}
          </Text>
        </group>
      ))}
    </group>
  );
}

