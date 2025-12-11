"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

interface GLBModelProps {
  countryCode: string;
  fallback?: React.ReactNode;
}

/**
 * GLB 모델 컴포넌트 (현재 비활성화 - 프로시저럴 폴백만 사용)
 * 
 * useGLTF 훅이 React hooks 규칙 위반을 일으키는 문제가 있어
 * 임시로 GLB 로딩을 비활성화하고 폴백만 렌더링합니다.
 */
export default function GLBModel({ countryCode, fallback }: GLBModelProps) {
  // GLB 로딩 비활성화 - 폴백만 렌더링
  if (fallback) {
    return <>{fallback}</>;
  }

  // 폴백이 없을 경우 기본 형태
  return <DefaultShape />;
}

/**
 * 기본 형태 (GLB 로딩 실패 시)
 */
function DefaultShape() {
  const ref = useRef<Group>(null);
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.1, 0]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial 
          color="#64748b" 
          emissive="#64748b" 
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}
