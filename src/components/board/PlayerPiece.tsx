"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Group } from "three";
import type { Player } from "@/types";

interface Props {
  player: Player;
  targetPosition: [number, number, number];
  isCurrentPlayer?: boolean;
  playerIndex: number;
}

// 플레이어 색상 배열
const PLAYER_SHAPES = ["capsule", "cone", "cylinder", "box"] as const;

export default function PlayerPiece({ player, targetPosition, isCurrentPlayer, playerIndex }: Props) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  
  const shapeType = PLAYER_SHAPES[playerIndex % PLAYER_SHAPES.length];

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
      {/* 플레이어 피스 (프로시저럴) */}
      <PlayerShape type={shapeType} color={player.color} isCurrentPlayer={isCurrentPlayer} />

      {/* 글로우 이펙트 (현재 플레이어) */}
      {isCurrentPlayer && (
        <>
          <mesh ref={glowRef} position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.18, 32]} />
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
        <circleGeometry args={[0.1, 32]} />
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

// 플레이어 형태 컴포넌트
function PlayerShape({ 
  type, 
  color, 
  isCurrentPlayer 
}: { 
  type: typeof PLAYER_SHAPES[number]; 
  color: string;
  isCurrentPlayer?: boolean;
}) {
  const emissiveIntensity = isCurrentPlayer ? 0.5 : 0.2;

  switch (type) {
    case "capsule":
      return (
        <mesh position={[0, 0.12, 0]}>
          <capsuleGeometry args={[0.05, 0.1, 8, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      );
    case "cone":
      return (
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.06, 0.18, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      );
    case "cylinder":
      return (
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.18, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      );
    case "box":
    default:
      return (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.08, 0.16, 0.08]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      );
  }
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
      const radius = 0.12 + Math.sin(t * 2) * 0.04;
      const y = 0.2 + Math.sin(t * 3) * 0.08;
      
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
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}
