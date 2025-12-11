"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import type { Group } from "three";
import { useGameStore } from "@/stores/gameStore";

// 주사위 면 위치와 회전 (1~6)
const DICE_FACES: Record<number, { rotation: [number, number, number] }> = {
  1: { rotation: [0, 0, 0] },
  2: { rotation: [0, Math.PI / 2, 0] },
  3: { rotation: [-Math.PI / 2, 0, 0] },
  4: { rotation: [Math.PI / 2, 0, 0] },
  5: { rotation: [0, -Math.PI / 2, 0] },
  6: { rotation: [Math.PI, 0, 0] },
};

function DiceMesh({ value, isRolling }: { value: number; isRolling: boolean }) {
  const groupRef = useRef<Group>(null);
  const [targetRotation, setTargetRotation] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    if (!isRolling && value) {
      setTargetRotation(DICE_FACES[value].rotation);
    }
  }, [value, isRolling]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isRolling) {
      // 빠른 회전
      groupRef.current.rotation.x += delta * 15;
      groupRef.current.rotation.y += delta * 12;
      groupRef.current.rotation.z += delta * 8;
    } else {
      // 목표 회전으로 부드럽게 전환
      groupRef.current.rotation.x += (targetRotation[0] - groupRef.current.rotation.x) * delta * 5;
      groupRef.current.rotation.y += (targetRotation[1] - groupRef.current.rotation.y) * delta * 5;
      groupRef.current.rotation.z += (targetRotation[2] - groupRef.current.rotation.z) * delta * 5;
    }
  });

  const dotPositions: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-0.15, -0.15], [0.15, 0.15]],
    3: [[-0.15, -0.15], [0, 0], [0.15, 0.15]],
    4: [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]],
    5: [[-0.15, -0.15], [0.15, -0.15], [0, 0], [-0.15, 0.15], [0.15, 0.15]],
    6: [[-0.15, -0.18], [0.15, -0.18], [-0.15, 0], [0.15, 0], [-0.15, 0.18], [0.15, 0.18]],
  };

  const renderDots = (count: number, faceRotation: [number, number, number], facePosition: [number, number, number]) => {
    const positions = dotPositions[count];
    return (
      <group position={facePosition} rotation={faceRotation}>
        {positions.map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <circleGeometry args={[0.06, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {/* 주사위 본체 */}
      <RoundedBox args={[0.8, 0.8, 0.8]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#fff"
          metalness={0.1}
          roughness={0.3}
        />
      </RoundedBox>

      {/* 각 면의 점들 */}
      {renderDots(1, [0, 0, 0], [0, 0, 0.41])}
      {renderDots(6, [Math.PI, 0, 0], [0, 0, -0.41])}
      {renderDots(2, [0, Math.PI / 2, 0], [0.41, 0, 0])}
      {renderDots(5, [0, -Math.PI / 2, 0], [-0.41, 0, 0])}
      {renderDots(3, [-Math.PI / 2, 0, 0], [0, 0.41, 0])}
      {renderDots(4, [Math.PI / 2, 0, 0], [0, -0.41, 0])}

      {/* 글로우 효과 */}
      <pointLight position={[0, 0, 0]} intensity={isRolling ? 0.5 : 0.2} color="#22d3ee" distance={2} />
    </group>
  );
}

export default function Dice3D() {
  const phase = useGameStore((s) => s.phase);
  const diceValue = useGameStore((s) => s.diceValue);

  const isRolling = phase === "rolling";
  const showDice = phase === "rolling" || phase === "moving" || (phase === "idle" && diceValue !== null);

  if (!showDice) return null;

  return (
    <div className="fixed right-6 top-20 z-30 h-32 w-32">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1} />
        <DiceMesh value={diceValue || 1} isRolling={isRolling} />
      </Canvas>
      
      {/* 주사위 값 표시 */}
      {!isRolling && diceValue && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl font-bold text-cyan-400">
          {diceValue}
        </div>
      )}
    </div>
  );
}

