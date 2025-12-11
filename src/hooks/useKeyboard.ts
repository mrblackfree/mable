"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";

/**
 * 키보드 단축키 훅
 * - Space: 주사위 굴리기
 * - Escape: 패스/닫기
 * - Enter: 확인/구매
 */
export function useKeyboardShortcuts() {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const pendingAction = useGameStore((s) => s.pendingAction);
  const rollAndMove = useGameStore((s) => s.rollAndMove);
  const buyTile = useGameStore((s) => s.buyTile);
  const passTile = useGameStore((s) => s.passTile);
  const payToll = useGameStore((s) => s.payToll);
  const confirmBonus = useGameStore((s) => s.confirmBonus);

  const currentPlayer = players[currentPlayerIndex];
  const isHumanTurn = currentPlayer && !currentPlayer.isBot;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 무시
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // 인간 플레이어 턴이 아니면 무시
      if (!isHumanTurn) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (phase === "idle") {
            rollAndMove();
          }
          break;

        case "Enter":
          e.preventDefault();
          if (phase === "modal" && pendingAction) {
            switch (pendingAction.type) {
              case "buy":
                if (currentPlayer.money >= (pendingAction.tile.price ?? 0)) {
                  buyTile();
                }
                break;
              case "pay_toll":
                payToll();
                break;
              case "bonus":
                confirmBonus();
                break;
              case "tax":
              case "jail":
                // 세금/감옥은 모달에서 직접 처리
                break;
            }
          }
          break;

        case "Escape":
          e.preventDefault();
          if (phase === "modal" && pendingAction?.type === "buy") {
            passTile();
          }
          break;

        case "KeyR":
          // R키로 주사위 굴리기 (Space 대안)
          e.preventDefault();
          if (phase === "idle") {
            rollAndMove();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    phase,
    isHumanTurn,
    pendingAction,
    currentPlayer,
    rollAndMove,
    buyTile,
    passTile,
    payToll,
    confirmBonus,
  ]);
}

/**
 * 단축키 도움말
 */
export const KEYBOARD_SHORTCUTS = [
  { key: "Space / R", action: "주사위 굴리기" },
  { key: "Enter", action: "확인 / 구매" },
  { key: "Esc", action: "패스 / 취소" },
];

