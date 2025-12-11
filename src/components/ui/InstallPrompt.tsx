"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // SSR 체크
    if (typeof window === "undefined") return;
    
    // 이미 설치된 경우 체크
    try {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
        return;
      }
    } catch {
      // matchMedia 미지원 환경
    }

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 3초 후에 프롬프트 표시
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // 24시간 후 다시 표시
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  // 설치됨 또는 숨김 상태
  if (isInstalled || !isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="glass flex items-center gap-4 rounded-2xl p-4">
        {/* 아이콘 */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 text-2xl">
          🌍
        </div>

        {/* 텍스트 */}
        <div className="flex-1">
          <h3 className="font-bold text-white">앱 설치</h3>
          <p className="text-sm text-zinc-400">
            홈 화면에 추가하여 빠르게 접속하세요!
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white"
          >
            나중에
          </button>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-400"
          >
            설치
          </button>
        </div>
      </div>
    </div>
  );
}

