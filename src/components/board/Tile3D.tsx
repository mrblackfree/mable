"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/stores/gameStore";
import type { Mesh, Group } from "three";
import type { Tile } from "@/types";
import Landmark from "./Landmark";

interface Props {
  tile: Tile;
  position: [number, number, number];
  rotationY: number;
  isHighlighted?: boolean;
  isCurrentTile?: boolean;
}

// 타일 타입별 색상 테마
const TILE_THEMES: Record<string, { base: string; glow: string; icon: string }> = {
  start: { base: "#059669", glow: "#10b981", icon: "🚀" },
  country: { base: "#1e293b", glow: "#22d3ee", icon: "" },
  travel: { base: "#1e40af", glow: "#3b82f6", icon: "✈️" },
  bonus: { base: "#854d0e", glow: "#fbbf24", icon: "🎁" },
  tax: { base: "#7f1d1d", glow: "#ef4444", icon: "💰" },
  jail: { base: "#374151", glow: "#6b7280", icon: "⛔" },
};

export default function Tile3D({ tile, position, rotationY, isHighlighted, isCurrentTile }: Props) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const landmarkRef = useRef<Group>(null);
  const flagRef = useRef<Group>(null);

  // 소유자 확인
  const players = useGameStore((s) => s.players);
  const owner = players.find((p) => p.ownedTileIds.includes(tile.id));

  const theme = TILE_THEMES[tile.type] || TILE_THEMES.country;
  const tileColor = tile.highlightColor || theme.base;

  // 하이라이트 펄스 애니메이션
  useFrame((state) => {
    if (groupRef.current) {
      const targetY = isHighlighted ? 0.08 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }

    if (glowRef.current && isHighlighted) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.3 + 0.7;
      glowRef.current.scale.setScalar(pulse);
    }

    // 랜드마크 부드러운 회전
    if (landmarkRef.current && tile.type === "country") {
      landmarkRef.current.rotation.y += 0.005;
    }

    // 소유 깃발 펄럭임
    if (flagRef.current && owner) {
      flagRef.current.children[1].rotation.z = Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  const tileWidth = 0.46;
  const tileDepth = 0.46;
  const tileHeight = 0.06;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={groupRef}>
        {/* 타일 베이스 */}
        <mesh position={[0, tileHeight / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[tileWidth, tileHeight, tileDepth]} />
          <meshStandardMaterial
            color={isHighlighted ? tileColor : theme.base}
            metalness={0.6}
            roughness={0.3}
            emissive={isHighlighted ? tileColor : "#000"}
            emissiveIntensity={isHighlighted ? 0.5 : 0}
          />
        </mesh>

        {/* 상단 장식 라인 */}
        <mesh position={[0, tileHeight + 0.005, 0]}>
          <boxGeometry args={[tileWidth - 0.05, 0.01, tileDepth - 0.05]} />
          <meshStandardMaterial
            color={tileColor}
            emissive={tileColor}
            emissiveIntensity={isHighlighted ? 1.5 : 0.3}
          />
        </mesh>

        {/* 하이라이트 글로우 링 */}
        {isHighlighted && (
          <mesh
            ref={glowRef}
            position={[0, 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.35, 0.4, 32]} />
            <meshBasicMaterial
              color={tileColor}
              transparent
              opacity={0.6}
            />
          </mesh>
        )}

        {/* 국가 타일: 랜드마크 */}
        {tile.type === "country" && (
          <group ref={landmarkRef} position={[0, tileHeight, 0]}>
            <Landmark tile={tile} />
          </group>
        )}

        {/* 소유 깃발 */}
        {owner && tile.type === "country" && (
          <group ref={flagRef} position={[0.18, tileHeight, 0.18]}>
            {/* 깃대 */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.24, 8]} />
              <meshStandardMaterial color="#78716c" metalness={0.8} />
            </mesh>
            {/* 깃발 */}
            <mesh position={[0.04, 0.2, 0]}>
              <planeGeometry args={[0.08, 0.05]} />
              <meshStandardMaterial
                color={owner.color}
                emissive={owner.color}
                emissiveIntensity={0.8}
                side={2}
              />
            </mesh>
            {/* 깃발 그림자/후면 */}
            <mesh position={[0.04, 0.2, -0.001]}>
              <planeGeometry args={[0.08, 0.05]} />
              <meshStandardMaterial
                color={owner.color}
                emissive={owner.color}
                emissiveIntensity={0.5}
                side={2}
              />
            </mesh>
          </group>
        )}

        {/* 소유자 테두리 */}
        {owner && tile.type === "country" && (
          <mesh position={[0, tileHeight + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.22, 32]} />
            <meshStandardMaterial
              color={owner.color}
              emissive={owner.color}
              emissiveIntensity={1}
            />
          </mesh>
        )}

        {/* 특수 타일: 아이콘/이펙트 */}
        {tile.type === "start" && <StartTileEffect />}
        {tile.type === "travel" && <TravelTileEffect />}
        {tile.type === "bonus" && <BonusTileEffect />}
        {tile.type === "tax" && <TaxTileEffect />}
        {tile.type === "jail" && <JailTileEffect />}
      </group>
    </group>
  );
}

// === 특수 타일 이펙트 컴포넌트들 ===

function StartTileEffect() {
  const ref = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.2, 0]}>
      <octahedronGeometry args={[0.12]} />
      <meshStandardMaterial
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

function TravelTileEffect() {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ref.current.position.y = 0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }
  });

  return (
    <group ref={ref} position={[0, 0.15, 0]}>
      {/* 비행기 형태 */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.05, 0.15, 4]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={1.5}
        />
      </mesh>
      {/* 날개 */}
      <mesh position={[0, -0.03, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.01, 0.05]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#60a5fa"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

function BonusTileEffect() {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.2;
      ref.current.position.y = 0.18 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.18, 0]}>
      <boxGeometry args={[0.12, 0.12, 0.12]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#fbbf24"
        emissiveIntensity={2}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function TaxTileEffect() {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.12 + Math.sin(state.clock.elapsedTime) * 0.02;
    }
  });

  return (
    <group ref={ref} position={[0, 0.12, 0]}>
      {/* 코인 스택 */}
      {[0, 0.04, 0.08].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
          <meshStandardMaterial
            color="#fcd34d"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function JailTileEffect() {
  return (
    <group position={[0, 0.15, 0]}>
      {/* 감옥 바 */}
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshStandardMaterial
            color="#6b7280"
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
      ))}
      {/* 상단 바 */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial
          color="#6b7280"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}
