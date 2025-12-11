"use client";

// ============================================
// Audio Hook – Disabled (no audio files)
// ============================================

/**
 * 게임 이벤트에 맞춰 오디오를 자동 재생하는 훅 (비활성화)
 */
export function useGameAudio() {
  // 오디오 시스템 비활성화
}

/**
 * 오디오 컨트롤 함수들 (비활성화)
 */
export function useAudioControls() {
  const toggleMute = () => false;
  const isMuted = () => false;
  const setBGMVolume = (_vol: number) => {};
  const setSFXVolume = (_vol: number) => {};

  return { toggleMute, isMuted, setBGMVolume, setSFXVolume };
}
