"use client";

import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Mesh, Group } from "three";
import type { Player } from "@/types";

interface Props {
  player: Player;
  targetPosition: [number, number, number];
  isCurrentPlayer?: boolean;
  playerIndex: number;
}

// 플레이어별 GLB 모델 경로
const PLAYER_MODEL_PATHS = [
  "/models/players/player-cyan.glb",
  "/models/players/player-pink.glb",
  "/models/players/player-green.glb",
  "/models/players/player-yellow.glb",
];

export default function PlayerPiece({ player, targetPosition, isCurrentPlayer, playerIndex }: Props) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  
  const modelPath = PLAYER_MODEL_PATHS[playerIndex % PLAYER_MODEL_PATHS.length];

  // Smooth interpolation to target position
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const pos = groupRef.current.position;
    const speed = 6;

    // 부드러운 이동
    pos.x += (targetPosition[0] - pos.x) * delta * speed;
    pos.z += (targetPosition[2] - pos.z) * delta * speed;

    // Current player: 바운스 + 회전
    if (isCurrentPlayer) {
      const bounce = Math.sin(state.clock.elapsedTime * 3) * 0.03;
      pos.y = targetPosition[1] + bounce + 0.05;
      groupRef.current.rotation.y = state.clock.elapsedTime * 2;
    } else {
      pos.y += (targetPosition[1] - pos.y) * delta * speed;
      groupRef.current.rotation.y += delta * 0.5;
    }

    // 글로우 펄스
    if (glowRef.current && isCurrentPlayer) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.15 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef} position={targetPosition}>
      {/* GLB 사람 모델 */}
      <Suspense fallback={<FallbackPiece color={player.color} />}>
        <HumanModel 
          path={modelPath} 
          color={player.color}
          isCurrentPlayer={isCurrentPlayer}
        />
      </Suspense>

      {/* 글로우 이펙트 (현재 플레이어) */}
      {isCurrentPlayer && (
        <>
          <mesh ref={glowRef} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.22, 32]} />
            <meshBasicMaterial
              color={player.color}
              transparent
              opacity={0.5}
            />
          </mesh>
          
          {/* 상단 파티클 효과 */}
          <Sparkles color={player.color} />
        </>
      )}

      {/* 베이스 서클 */}
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial
          color={player.color}
          emissive={player.color}
          emissiveIntensity={isCurrentPlayer ? 0.8 : 0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 포인트 라이트 (현재 플레이어) */}
      {isCurrentPlayer && (
        <pointLight
          position={[0, 0.3, 0]}
          color={player.color}
          intensity={0.5}
          distance={1}
        />
      )}
    </group>
  );
}

// GLB 사람 모델 로더
function HumanModel({ 
  path, 
  color,
  isCurrentPlayer 
}: { 
  path: string; 
  color: string;
  isCurrentPlayer?: boolean;
}) {
  const { scene } = useGLTF(path);
  
  return (
    <group scale={0.5} position={[0, 0.05, 0]}>
      <primitive object={scene.clone()} />
      
      {/* 현재 플레이어 하이라이트 */}
      {isCurrentPlayer && (
        <pointLight
          position={[0, 0.4, 0]}
          color={color}
          intensity={0.8}
          distance={0.8}
        />
      )}
    </group>
  );
}

// 폴백 피스 (GLB 로딩 실패 시)
function FallbackPiece({ color }: { color: string }) {
  return (
    <mesh position={[0, 0.1, 0]}>
      <capsuleGeometry args={[0.06, 0.12, 8, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

// 스파클 이펙트
function Sparkles({ color }: { color: string }) {
  const groupRef = useRef<Group>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      angle: (i / 6) * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const t = state.clock.elapsedTime * p.speed + p.offset;
      const radius = 0.15 + Math.sin(t * 2) * 0.05;
      const y = 0.15 + Math.sin(t * 3) * 0.1;
      
      child.position.x = Math.cos(p.angle + t) * radius;
      child.position.z = Math.sin(p.angle + t) * radius;
      child.position.y = y;
      
      const scale = 0.5 + Math.sin(t * 4) * 0.3;
      child.scale.setScalar(scale);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// 모델 프리로드 (클라이언트에서만 실행)
if (typeof window !== "undefined") {
  PLAYER_MODEL_PATHS.forEach(path => {
    useGLTF.preload(path);
  });
}
