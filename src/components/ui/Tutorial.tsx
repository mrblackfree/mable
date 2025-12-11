"use client";

import { useState, useEffect } from "react";

interface TutorialProps {
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  highlight?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "🎲 주사위 굴리기",
    description: "주사위를 굴려 말을 이동시키세요.\nSpace키 또는 버튼을 누르면 됩니다.",
    icon: "🎲",
  },
  {
    title: "🏠 국가 구매",
    description: "빈 국가에 도착하면 구매할 수 있습니다.\n소유한 국가에 다른 플레이어가 오면 통행료를 받아요!",
    icon: "💰",
  },
  {
    title: "⬆️ 업그레이드",
    description: "소유한 국가를 업그레이드하면\n통행료가 2배로 증가합니다!",
    icon: "⭐",
  },
  {
    title: "✈️ 특수 칸",
    description: "세계여행: 원하는 곳으로 이동\n황금카드: 특별 보너스 획득\n세금: 세금 납부",
    icon: "🎯",
  },
  {
    title: "🏆 승리 조건",
    description: "다른 플레이어를 파산시키거나\n50턴 후 가장 많은 자산을 보유하면 승리!",
    icon: "🏆",
  },
];

const STORAGE_KEY = "ar-world-marble-tutorial-seen";

export default function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass relative max-w-md p-8 text-center">
        {/* 스킵 버튼 */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 text-sm text-zinc-500 hover:text-white"
        >
          건너뛰기 →
        </button>

        {/* 아이콘 */}
        <div className="mb-6 text-7xl">{step.icon}</div>

        {/* 제목 */}
        <h2 className="mb-4 text-2xl font-bold text-white">{step.title}</h2>

        {/* 설명 */}
        <p className="mb-8 whitespace-pre-line text-zinc-300">{step.description}</p>

        {/* 페이지 인디케이터 */}
        <div className="mb-6 flex justify-center gap-2">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentStep
                  ? "w-6 bg-cyan-400"
                  : i < currentStep
                  ? "bg-purple-400"
                  : "bg-zinc-600"
              }`}
            />
          ))}
        </div>

        {/* 버튼 */}
        <button
          onClick={handleNext}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 py-3 font-bold text-white transition-all hover:scale-105"
        >
          {isLastStep ? "🎮 게임 시작!" : "다음 →"}
        </button>

        {/* 단계 표시 */}
        <p className="mt-4 text-sm text-zinc-500">
          {currentStep + 1} / {TUTORIAL_STEPS.length}
        </p>
      </div>
    </div>
  );
}

/**
 * 튜토리얼이 필요한지 확인
 */
export function shouldShowTutorial(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "true";
}

/**
 * 튜토리얼 리셋 (디버그용)
 */
export function resetTutorial(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

