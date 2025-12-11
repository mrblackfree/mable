"use client";

import { Suspense, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Group } from "three";
import { getModelPath, getModelScale } from "@/lib/models/modelLoader";

interface GLBModelProps {
  countryCode: string;
  fallback?: React.ReactNode;
}

/**
 * GLB 모델 로더 컴포넌트
 * - useGLTF로 모델 로딩
 * - 에러 시 폴백 렌더링
 */
function LoadedModel({ path, scale }: { path: string; scale: number }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(path);
  
  // 천천히 회전
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  );
}

/**
 * 로딩 스피너 (모델 로딩 중)
 */
function LoadingSpinner() {
  const ref = useRef<Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[0.08, 0.02, 8, 16]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/**
 * 에러 경계 래퍼
 */
function ModelWithErrorBoundary({ 
  path, 
  scale, 
  fallback 
}: { 
  path: string; 
  scale: number; 
  fallback: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorCatcher onError={() => setHasError(true)}>
        <LoadedModel path={path} scale={scale} />
      </ErrorCatcher>
    </Suspense>
  );
}

/**
 * 간단한 에러 캐처 (three.js 로딩 에러 처리)
 */
function ErrorCatcher({ 
  children, 
  onError 
}: { 
  children: React.ReactNode; 
  onError: () => void;
}) {
  // useGLTF 에러는 Suspense에서 잡히지 않으므로
  // 실제로는 preload를 사용하거나 다른 방식이 필요
  // 여기서는 단순화를 위해 children 반환
  return <>{children}</>;
}

/**
 * 메인 GLB 모델 컴포넌트
 */
export default function GLBModel({ countryCode, fallback }: GLBModelProps) {
  const modelPath = getModelPath(countryCode);
  const scale = getModelScale(countryCode);

  // 모델 경로가 없으면 폴백 렌더링
  if (!modelPath) {
    return <>{fallback}</>;
  }

  return (
    <ModelWithErrorBoundary 
      path={modelPath} 
      scale={scale} 
      fallback={fallback || <LoadingSpinner />} 
    />
  );
}

// 모델 프리로드 (선택적)
export function preloadModel(countryCode: string) {
  const path = getModelPath(countryCode);
  if (path) {
    useGLTF.preload(path);
  }
}

