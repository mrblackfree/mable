"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";

type XRSupport = "unknown" | "supported" | "unsupported";

function HomePage() {
  const [xrSupport, setXrSupport] = useState<XRSupport>("unknown");

  useEffect(() => {
    // SSR 체크
    if (typeof window === "undefined") return;
    
    (async () => {
      if (typeof navigator === "undefined" || !("xr" in navigator)) {
        setXrSupport("unsupported");
        return;
      }
      try {
        const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
        if (!xr) {
          setXrSupport("unsupported");
          return;
        }
        const supported = await xr.isSessionSupported("immersive-ar");
        setXrSupport(supported ? "supported" : "unsupported");
      } catch {
        setXrSupport("unsupported");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-6 text-center">
      {/* Logo / Title */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-6xl">🌍</span>
        <h1 className="text-4xl font-bold tracking-tight">
          AR World Marble
        </h1>
        <p className="max-w-md text-zinc-400">
          전 세계 국가를 돌아다니는 3D WebAR 보드게임
        </p>
      </div>

      {/* XR Status */}
      <div className="glass px-5 py-3 text-sm">
        {xrSupport === "unknown" && "WebXR 지원 여부 확인 중…"}
        {xrSupport === "supported" && (
          <span className="text-cyan-400">✓ AR 모드 사용 가능</span>
        )}
        {xrSupport === "unsupported" && (
          <span className="text-amber-400">
            ⚠ AR 미지원 – 3D 보드뷰로 플레이합니다
          </span>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/game?mode=ar" className="btn btn-primary">
          🎲 AR 모드로 시작
        </Link>
        <Link href="/game?mode=desktop" className="btn btn-secondary">
          🖥️ 3D 보드뷰로 시작
        </Link>
      </div>

      {/* Footer hint */}
      <p className="absolute bottom-6 text-xs text-zinc-500">
        Phase 1 MVP · 1~4인 로컬 플레이
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}
