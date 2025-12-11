"use client";

import { useState } from "react";
import { KEYBOARD_SHORTCUTS } from "@/hooks/useKeyboard";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const [muted, setMuted] = useState(false);
  const [bgmVol, setBgmVol] = useState(30);
  const [sfxVol, setSfxVol] = useState(60);

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass relative w-full max-w-md p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-zinc-400 transition-colors hover:text-white"
        >
          ✕
        </button>

        <h2 className="mb-6 text-center text-2xl font-bold text-white">⚙️ 설정</h2>

        {/* 오디오 설정 (현재 비활성화) */}
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-medium text-zinc-300">🔊 오디오</h3>
          <p className="text-sm text-zinc-500">오디오 기능은 현재 준비 중입니다.</p>

          {/* 음소거 토글 */}
          <div className="flex items-center justify-between opacity-50">
            <span className="text-zinc-400">음소거</span>
            <button
              onClick={handleMuteToggle}
              disabled
              className={`h-8 w-14 rounded-full transition-colors ${
                muted ? "bg-zinc-600" : "bg-cyan-500"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  muted ? "translate-x-1" : "translate-x-7"
                }`}
              />
            </button>
          </div>

          {/* BGM 볼륨 */}
          <div className="space-y-2 opacity-50">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">🎵 BGM</span>
              <span className="text-sm text-zinc-500">{bgmVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bgmVol}
              onChange={(e) => setBgmVol(Number(e.target.value))}
              className="w-full accent-cyan-500"
              disabled
            />
          </div>

          {/* SFX 볼륨 */}
          <div className="space-y-2 opacity-50">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">🔔 효과음</span>
              <span className="text-sm text-zinc-500">{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={(e) => setSfxVol(Number(e.target.value))}
              className="w-full accent-purple-500"
              disabled
            />
          </div>
        </div>

        {/* 단축키 */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-zinc-300">⌨️ 단축키</h3>
          <div className="rounded-lg bg-zinc-800/50 p-3">
            {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-zinc-700 py-2 last:border-0"
              >
                <span className="text-zinc-400">{shortcut.action}</span>
                <kbd className="rounded bg-zinc-700 px-2 py-1 font-mono text-sm text-cyan-400">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* 게임 정보 */}
        <div className="mt-6 border-t border-zinc-700 pt-4 text-center">
          <p className="text-sm text-zinc-500">AR World Marble v0.3.0</p>
          <p className="text-xs text-zinc-600">© 2024 World Marble Team</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 설정 버튼 컴포넌트
 */
export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="glass fixed right-4 top-36 z-30 flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all hover:scale-110"
        title="설정"
      >
        ⚙️
      </button>

      <SettingsMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
