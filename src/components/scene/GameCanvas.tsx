"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Environment, 
  Stars,
  Float,
  Sparkles as DreiSparkles,
} from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import Board from "@/components/board/Board";
import ARPlacement from "@/components/scene/ARPlacement";
import HUD from "@/components/ui/HUD";
import ActionModal from "@/components/ui/ActionModal";
import MiniMap from "@/components/ui/MiniMap";
import GameStats from "@/components/ui/GameStats";
import { SettingsButton } from "@/components/ui/SettingsMenu";
import ToastContainer from "@/components/ui/ToastContainer";
import PropertyPanel from "@/components/ui/PropertyPanel";
import InstallPrompt from "@/components/ui/InstallPrompt";
import ParticleEffects, { VictoryFireworks } from "@/components/effects/ParticleEffects";
import { useGameStore } from "@/stores/gameStore";
import { useGameAudio } from "@/lib/audio/useAudio";
import { useKeyboardShortcuts } from "@/hooks/useKeyboard";
import type { Group } from "three";

interface Props {
  mode: "ar" | "desktop";
}

const xrStore = createXRStore();

function BoardWrapper() {
  const boardPlaced = useGameStore((s) => s.boardPlaced);
  const boardTransform = useGameStore((s) => s.boardTransform);

  if (!boardPlaced) return null;

  return (
    <Float
      speed={0.5}
      rotationIntensity={0}
      floatIntensity={0.3}
      floatingRange={[-0.02, 0.02]}
    >
      <group
        position={boardTransform.position}
        rotation={boardTransform.rotation}
      >
        <Board />
      </group>
    </Float>
  );
}

// 배경 파티클 효과
function BackgroundEffects() {
  return (
    <>
      {/* 별 배경 */}
      <Stars
        radius={50}
        depth={50}
        count={3000}
        factor={4}
        saturation={0.5}
        fade
        speed={0.5}
      />
      
      {/* 떠다니는 스파클 */}
      <DreiSparkles
        count={100}
        scale={15}
        size={2}
        speed={0.3}
        color="#22d3ee"
      />
      <DreiSparkles
        count={50}
        scale={12}
        size={3}
        speed={0.2}
        color="#a855f7"
      />
    </>
  );
}

// 향상된 조명
function Lighting({ isAR }: { isAR: boolean }) {
  return (
    <>
      {/* 기본 조명 */}
      <ambientLight intensity={0.4} />
      
      {/* 메인 디렉셔널 라이트 */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* 보조 라이트들 */}
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#a855f7" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#22d3ee" distance={15} />
      
      {/* 림 라이트 */}
      <spotLight
        position={[0, 12, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        color="#fff"
      />

      {/* 환경광 (비AR 모드) */}
      {!isAR && (
        <>
          <hemisphereLight args={["#1e40af", "#0f172a", 0.5]} />
          <fog attach="fog" args={["#0d0d12", 15, 40]} />
        </>
      )}
    </>
  );
}

export default function GameCanvas({ mode }: Props) {
  const isAR = mode === "ar";
  const phase = useGameStore((s) => s.phase);
  const boardPlaced = useGameStore((s) => s.boardPlaced);
  const placeBoard = useGameStore((s) => s.placeBoard);

  // 게임 오디오 훅
  useGameAudio();
  
  // 키보드 단축키
  useKeyboardShortcuts();

  // Desktop 모드에서는 자동으로 보드 배치
  useEffect(() => {
    if (!isAR && !boardPlaced) {
      placeBoard([0, 0, 0], [0, 0, 0]);
    }
  }, [isAR, boardPlaced, placeBoard]);

  return (
    <>
      {/* HUD overlay */}
      <HUD />
      <ActionModal />
      <MiniMap />
      <GameStats />
      <SettingsButton />
      <ToastContainer />
      <PropertyPanel />
      <InstallPrompt />

      {/* AR 진입 버튼 (AR 모드일 때만) */}
      {isAR && phase !== "lobby" && !boardPlaced && (
        <button
          onClick={() => xrStore.enterAR()}
          className="btn btn-primary fixed bottom-20 left-1/2 z-50 -translate-x-1/2"
        >
          AR 시작
        </button>
      )}

      {/* AR 배치 가이드 */}
      {isAR && !boardPlaced && (
        <div className="fixed left-1/2 top-24 z-40 -translate-x-1/2 text-center">
          <p className="glass px-4 py-2 text-sm text-zinc-300">
            바닥을 비춘 뒤 화면을 탭하여 보드를 배치하세요
          </p>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 8, 6], fov: 55 }}
        gl={{ 
          antialias: true, 
          alpha: isAR,
          powerPreference: "high-performance",
        }}
        shadows
        style={{ background: isAR ? "transparent" : "linear-gradient(to bottom, #0f0f1a, #0d0d12)" }}
      >
        <XR store={xrStore}>
          {/* 조명 시스템 */}
          <Lighting isAR={isAR} />

          {/* 배경 효과 (비AR 모드) */}
          {!isAR && <BackgroundEffects />}

          {/* AR Placement reticle */}
          {isAR && <ARPlacement />}

          {/* Board (wrapped with transform) */}
          <BoardWrapper />

          {/* 게임 파티클 이펙트 */}
          <ParticleEffects />
          
          {/* 승리 폭죽 */}
          <VictoryFireworks active={phase === "gameOver"} />

          {/* Desktop controls (non-AR) */}
          {!isAR && (
            <OrbitControls
              enablePan={false}
              enableZoom
              enableRotate
              minDistance={5}
              maxDistance={20}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.5}
              autoRotate={phase === "lobby"}
              autoRotateSpeed={0.5}
            />
          )}
          
          {/* 환경맵 */}
          {!isAR && <Environment preset="night" background={false} />}
        </XR>
      </Canvas>
    </>
  );
}
