"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { XRHitTest, useXR } from "@react-three/xr";
import { useGameStore } from "@/stores/gameStore";
import { Matrix4, Vector3, Mesh } from "three";

const matrixHelper = new Matrix4();
const hitPosition = new Vector3();
const hitRotation = new Vector3();

/**
 * AR 환경에서 바닥 HitTest → 탭 시 보드 배치
 */
export default function ARPlacement() {
  const meshRef = useRef<Mesh>(null);
  const hasHit = useRef(false);

  const boardPlaced = useGameStore((s) => s.boardPlaced);
  const placeBoard = useGameStore((s) => s.placeBoard);

  // @react-three/xr v6: session이 있으면 AR 세션 활성 상태
  const session = useXR((s) => s.session);
  const isPresenting = !!session;

  // 리티클 위치 업데이트
  useFrame(() => {
    if (meshRef.current && hasHit.current && !boardPlaced) {
      meshRef.current.position.copy(hitPosition);
    }
  });

  // 탭해서 배치
  const handleSelect = () => {
    if (hasHit.current && !boardPlaced) {
      placeBoard(
        [hitPosition.x, hitPosition.y, hitPosition.z],
        [hitRotation.x, hitRotation.y, hitRotation.z]
      );
    }
  };

  // AR 세션이 아니면 렌더링 안 함
  if (!isPresenting) return null;

  // 이미 배치됨
  if (boardPlaced) return null;

  return (
    <>
      {/* Hit Test Source – 화면 중앙 기준 */}
      <XRHitTest
        onResults={(results, getWorldMatrix) => {
          if (results.length === 0) {
            hasHit.current = false;
            return;
          }
          hasHit.current = true;
          getWorldMatrix(matrixHelper, results[0]);
          hitPosition.setFromMatrixPosition(matrixHelper);
        }}
      />

      {/* Reticle */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleSelect}
        onPointerDown={handleSelect}
      >
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color="#22d3ee" opacity={0.8} transparent />
      </mesh>
    </>
  );
}
