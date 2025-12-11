"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";

/**
 * 게임 통계 표시 UI
 * - 턴 카운터
 * - 경과 시간
 * - 주사위 횟수
 */
export default function GameStats() {
  const phase = useGameStore((s) => s.phase);
  const stats = useGameStore((s) => s.stats);
  const maxTurns = useGameStore((s) => s.maxTurns);
  const players = useGameStore((s) => s.players);

  // 경과 시간 계산
  const elapsedTime = useMemo(() => {
    const now = Date.now();
    const diff = Math.floor((now - stats.startTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [stats.startTime]);

  // 총 자산 계산
  const totalAssets = useMemo(() => {
    return players.reduce((sum, p) => sum + p.money, 0);
  }, [players]);

  if (phase === "lobby" || phase === "gameOver") return null;

  return (
    <div className="fixed left-6 top-24 z-30">
      <div className="glass flex flex-col gap-1 rounded-xl px-3 py-2 text-xs">
        {/* 턴 카운터 */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500">턴</span>
          <span className="font-mono font-bold text-cyan-400">
            {stats.turnCount}
            {maxTurns > 0 && <span className="text-zinc-500">/{maxTurns}</span>}
          </span>
        </div>

        {/* 턴 진행률 바 */}
        {maxTurns > 0 && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
              style={{ width: `${(stats.turnCount / maxTurns) * 100}%` }}
            />
          </div>
        )}

        {/* 구분선 */}
        <div className="my-1 border-t border-zinc-700" />

        {/* 주사위 횟수 */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500">🎲 주사위</span>
          <span className="font-mono text-zinc-300">{stats.totalDiceRolls}</span>
        </div>

        {/* 총 지출 */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500">💸 총 지출</span>
          <span className="font-mono text-zinc-300">${stats.totalMoneySpent}</span>
        </div>

        {/* 총 통행료 */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500">🏠 통행료</span>
          <span className="font-mono text-zinc-300">${stats.totalTollPaid}</span>
        </div>
      </div>
    </div>
  );
}

