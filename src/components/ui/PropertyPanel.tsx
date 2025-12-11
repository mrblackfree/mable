"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";
import { getTileById } from "@/lib/game/worldMap";

export default function PropertyPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const upgradeTile = useGameStore((s) => s.upgradeTile);

  const currentPlayer = players[currentPlayerIndex];

  // 현재 플레이어의 소유지 목록
  const ownedProperties = useMemo(() => {
    if (!currentPlayer) return [];
    return currentPlayer.ownedTileIds
      .map((id) => getTileById(id))
      .filter((t) => t !== undefined);
  }, [currentPlayer]);

  // 봇이거나 로비/게임오버 상태면 숨김
  if (!currentPlayer || currentPlayer.isBot || phase === "lobby" || phase === "gameOver") {
    return null;
  }

  // 소유지가 없으면 숨김
  if (ownedProperties.length === 0) {
    return null;
  }

  return (
    <>
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass fixed bottom-6 left-6 z-30 flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all hover:scale-105"
        style={{ borderLeft: `3px solid ${currentPlayer.color}` }}
      >
        <span>🏠</span>
        <span>{ownedProperties.length}개 소유</span>
        <span className="text-xs text-zinc-500">{isOpen ? "▼" : "▲"}</span>
      </button>

      {/* 패널 */}
      {isOpen && (
        <div className="fixed bottom-16 left-6 z-30 w-72 max-h-80 overflow-y-auto">
          <div className="glass rounded-xl p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
              <span>🏠</span>
              <span>내 소유지</span>
            </h3>

            <div className="space-y-2">
              {ownedProperties.map((tile) => {
                if (!tile) return null;
                
                const isUpgraded = currentPlayer.upgradedTileIds.includes(tile.id);
                const upgradeCost = Math.floor((tile.price ?? 0) * 0.5);
                const canUpgrade = !isUpgraded && currentPlayer.money >= upgradeCost && phase === "idle";
                const toll = tile.toll ?? 0;
                const actualToll = isUpgraded ? toll * 2 : toll;

                return (
                  <div
                    key={tile.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3"
                    style={{ borderLeft: `3px solid ${tile.highlightColor}` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{tile.name}</span>
                        {isUpgraded && (
                          <span className="rounded bg-yellow-500/20 px-1 text-xs text-yellow-400">
                            ⭐ 업그레이드
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        통행료: <span className="text-cyan-400">${actualToll}</span>
                        {isUpgraded && <span className="text-yellow-400"> (2x)</span>}
                      </div>
                    </div>

                    {!isUpgraded && (
                      <button
                        onClick={() => upgradeTile(tile.id)}
                        disabled={!canUpgrade}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                          canUpgrade
                            ? "bg-yellow-500 text-black hover:bg-yellow-400"
                            : "bg-zinc-700 text-zinc-500"
                        }`}
                        title={canUpgrade ? `$${upgradeCost}로 업그레이드` : "자금 부족 또는 대기 중이 아님"}
                      >
                        ⬆️ ${upgradeCost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 총 자산 요약 */}
            <div className="mt-4 border-t border-zinc-700 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">보유 현금</span>
                <span className="font-bold text-cyan-400">${currentPlayer.money}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">부동산 가치</span>
                <span className="font-bold text-purple-400">
                  ${ownedProperties.reduce((sum, t) => sum + (t?.price ?? 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

