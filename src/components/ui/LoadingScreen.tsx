"use client";

import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export default function LoadingScreen({ 
  onComplete, 
  minDuration = 2000 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState("");

  const TIPS = [
    "💡 출발을 지나면 보너스를 받습니다!",
    "💡 업그레이드하면 통행료가 2배!",
    "💡 Space키로 주사위를 굴릴 수 있어요",
    "💡 세계여행 칸에서 원하는 곳으로 이동!",
    "💡 황금카드로 특별한 보너스를 획득!",
    "💡 AI 봇과 함께 싱글플레이 가능!",
  ];

  useEffect(() => {
    // 랜덤 팁 선택
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);

    // 프로그레스 애니메이션
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-black to-cyan-900">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse rounded-full bg-cyan-500/20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* 로고 */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <span className="text-8xl">🌍</span>
            <div className="absolute inset-0 animate-ping text-8xl opacity-30">🌍</div>
          </div>
          <h1 className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
            AR World Marble
          </h1>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-64">
          <div className="mb-2 flex justify-between text-sm text-zinc-400">
            <span>로딩 중...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 팁 */}
        <p className="max-w-xs text-center text-sm text-zinc-400">
          {tip}
        </p>

        {/* 로딩 스피너 */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }} />
          <div className="h-3 w-3 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: "150ms" }} />
          <div className="h-3 w-3 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* 버전 */}
      <div className="absolute bottom-4 text-xs text-zinc-600">
        v1.0.0
      </div>
    </div>
  );
}

