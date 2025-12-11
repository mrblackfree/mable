"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Tutorial, { shouldShowTutorial } from "@/components/ui/Tutorial";
import ErrorBoundary from "@/components/ErrorBoundary";

// Dynamically import Canvas (SSR-disable) to avoid window/document issues
const GameCanvas = dynamic(() => import("@/components/scene/GameCanvas"), {
  ssr: false,
});

function GameContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "ar" ? "ar" : "desktop";
  
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 튜토리얼 필요 여부 체크
    if (!isLoading && shouldShowTutorial()) {
      setShowTutorial(true);
    } else if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setIsReady(true);
  };

  return (
    <>
      {/* 로딩 화면 */}
      {isLoading && (
        <LoadingScreen onComplete={handleLoadingComplete} minDuration={1500} />
      )}

      {/* 튜토리얼 */}
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}

      {/* 게임 캔버스 */}
      {isReady && <GameCanvas mode={mode} />}
    </>
  );
}

export default function GamePage() {
  return (
    <ErrorBoundary>
      <main id="game-canvas">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-black text-zinc-400">
              <div className="flex flex-col items-center gap-4">
                <span className="text-4xl animate-bounce">🌍</span>
                <span>Loading...</span>
              </div>
            </div>
          }
        >
          <GameContent />
        </Suspense>
      </main>
    </ErrorBoundary>
  );
}
