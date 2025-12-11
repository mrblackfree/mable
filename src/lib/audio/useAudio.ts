"use client";

import { useEffect, useRef } from "react";
import { audioManager, type SfxName } from "./audioManager";
import { useGameStore } from "@/stores/gameStore";

/**
 * 게임 이벤트에 맞춰 오디오를 자동 재생하는 훅
 */
export function useGameAudio() {
  const phase = useGameStore((s) => s.phase);
  const pendingAction = useGameStore((s) => s.pendingAction);
  const winner = useGameStore((s) => s.winner);
  const prevPhase = useRef(phase);
  const initialized = useRef(false);

  // 최초 1회 preload
  useEffect(() => {
    if (!initialized.current) {
      audioManager.preloadAll();
      initialized.current = true;
    }
  }, []);

  // BGM 시작 (lobby → idle 전환 시)
  useEffect(() => {
    if (prevPhase.current === "lobby" && phase === "idle") {
      audioManager.playBGM();
    }
    prevPhase.current = phase;
  }, [phase]);

  // 주사위 굴릴 때
  useEffect(() => {
    if (phase === "rolling") {
      audioManager.playSFX("dice");
    }
  }, [phase]);

  // 이동 완료
  useEffect(() => {
    if (phase === "moving") {
      // 이동 시작 시 효과음
      audioManager.playSFX("move");
    }
  }, [phase]);

  // 모달 액션에 따른 SFX
  useEffect(() => {
    if (!pendingAction) return;

    const sfxMap: Record<string, SfxName> = {
      buy: "buy",
      pay_toll: "toll",
      bonus: "bonus",
      travel: "travel",
    };

    const sfx = sfxMap[pendingAction.type];
    if (sfx) {
      audioManager.playSFX(sfx);
    }
  }, [pendingAction]);

  // 승리
  useEffect(() => {
    if (winner) {
      audioManager.playSFX("win");
      audioManager.stopBGM();
    }
  }, [winner]);
}

/**
 * 오디오 컨트롤 함수들
 */
export function useAudioControls() {
  const toggleMute = () => audioManager.toggleMute();
  const isMuted = () => audioManager.isMuted();
  const setBGMVolume = (vol: number) => audioManager.setBGMVolume(vol);
  const setSFXVolume = (vol: number) => audioManager.setSFXVolume(vol);

  return { toggleMute, isMuted, setBGMVolume, setSFXVolume };
}

