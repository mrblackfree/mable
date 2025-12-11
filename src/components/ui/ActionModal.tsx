"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { getCountryTiles } from "@/lib/game/worldMap";

export default function ActionModal() {
  const phase = useGameStore((s) => s.phase);
  const pendingAction = useGameStore((s) => s.pendingAction);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const buyTile = useGameStore((s) => s.buyTile);
  const passTile = useGameStore((s) => s.passTile);
  const payToll = useGameStore((s) => s.payToll);
  const selectTravel = useGameStore((s) => s.selectTravel);
  const confirmBonus = useGameStore((s) => s.confirmBonus);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  if (phase !== "modal" || !pendingAction) return null;

  const currentPlayer = players[currentPlayerIndex];
  
  // 타일이 있는 액션에서만 가격 확인
  const actionTile = "tile" in pendingAction ? pendingAction.tile : null;
  const canAfford = currentPlayer.money >= (actionTile?.price ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80 backdrop-blur-sm" />
      
      {/* 모달 컨테이너 */}
      <div className="relative z-10 mx-4 w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
        <div 
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/95 shadow-2xl"
          style={{
            boxShadow: actionTile?.highlightColor 
              ? `0 0 60px ${actionTile.highlightColor}40`
              : "0 0 60px rgba(34, 211, 238, 0.3)",
          }}
        >
          {/* 헤더 */}
          <div 
            className="relative flex flex-col items-center gap-2 px-6 py-6"
            style={{
              background: actionTile?.highlightColor
                ? `linear-gradient(135deg, ${actionTile.highlightColor}30, transparent)`
                : "linear-gradient(135deg, rgba(34, 211, 238, 0.2), transparent)",
            }}
          >
            {/* 아이콘 */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/30 text-4xl">
              {getActionIcon(pendingAction.type)}
            </div>
            
            {/* 타이틀 */}
            <h3 className="text-2xl font-bold text-white">
              {actionTile?.name || getActionTitle(pendingAction.type)}
            </h3>
            
            {/* 국가 티어 뱃지 */}
            {actionTile?.tier && (
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${getTierStyle(actionTile.tier)}`}>
                {actionTile.tier.toUpperCase()} TIER
              </span>
            )}
          </div>

          {/* 콘텐츠 */}
          <div className="px-6 pb-6">
            {/* 구매 */}
            {pendingAction.type === "buy" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-xl bg-black/30 p-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">구매 가격</span>
                    <span className="text-2xl font-bold text-cyan-400">${pendingAction.tile.price}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-500">통행료 수익</span>
                    <span className="text-lg font-semibold text-green-400">+${pendingAction.tile.toll}/턴</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">현재 보유 자산</span>
                  <span className={currentPlayer.money >= (pendingAction.tile.price ?? 0) ? "text-white" : "text-red-400"}>
                    ${currentPlayer.money}
                  </span>
                </div>

                {!canAfford && (
                  <div className="rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-300">
                    ⚠️ 자금이 부족합니다
                  </div>
                )}

                <div className="mt-2 flex gap-3">
                  <button
                    onClick={buyTile}
                    disabled={!canAfford}
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:hover:scale-100"
                  >
                    구매하기
                  </button>
                  <button 
                    onClick={passTile} 
                    className="rounded-xl bg-zinc-700 px-6 py-3 font-medium text-zinc-300 transition-all hover:bg-zinc-600"
                  >
                    패스
                  </button>
                </div>
              </div>
            )}

            {/* 통행료 */}
            {pendingAction.type === "pay_toll" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 rounded-xl bg-black/30 p-4">
                  <span className="text-sm text-zinc-400">소유자</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-8 w-8 rounded-full"
                      style={{ background: pendingAction.owner.color }}
                    />
                    <span className="text-xl font-bold" style={{ color: pendingAction.owner.color }}>
                      {pendingAction.owner.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-red-500/20 p-4">
                  <span className="text-zinc-300">통행료</span>
                  <span className="text-2xl font-bold text-red-400">-${pendingAction.amount}</span>
                </div>

                <button 
                  onClick={payToll} 
                  className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-bold text-white transition-all hover:scale-105"
                >
                  지불하기
                </button>
              </div>
            )}

            {/* 세금 */}
            {pendingAction.type === "tax" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 rounded-xl bg-red-500/10 p-6">
                  <span className="text-sm text-zinc-400">납부 금액</span>
                  <span className="text-3xl font-bold text-red-400">-${pendingAction.amount}</span>
                </div>

                <button
                  onClick={() => {
                    useGameStore.setState((state) => {
                      const updated = [...state.players];
                      updated[state.currentPlayerIndex] = {
                        ...updated[state.currentPlayerIndex],
                        money: updated[state.currentPlayerIndex].money - pendingAction.amount,
                      };
                      return { players: updated, pendingAction: null };
                    });
                    useGameStore.getState().nextTurn();
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-700 px-6 py-3 font-bold text-white transition-all hover:scale-105"
                >
                  납부하기
                </button>
              </div>
            )}

            {/* 정지(감옥) */}
            {pendingAction.type === "jail" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 rounded-xl bg-zinc-700/50 p-6">
                  <span className="text-4xl">⛓️</span>
                  <span className="text-sm text-zinc-400">정지 기간</span>
                  <span className="text-2xl font-bold text-zinc-300">{pendingAction.turns}턴</span>
                </div>

                <button
                  onClick={() => {
                    useGameStore.setState({ pendingAction: null });
                    useGameStore.getState().nextTurn();
                  }}
                  className="w-full rounded-xl bg-zinc-700 px-6 py-3 font-bold text-white transition-all hover:bg-zinc-600"
                >
                  확인
                </button>
              </div>
            )}

            {/* 황금카드 */}
            {pendingAction.type === "bonus" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 p-6">
                  <div className="animate-bounce text-5xl">✨</div>
                  <p className="text-center text-lg font-medium text-amber-300">
                    {pendingAction.card.description}
                  </p>
                  {pendingAction.card.value && (
                    <span className="text-2xl font-bold text-amber-400">
                      +${pendingAction.card.value}
                    </span>
                  )}
                </div>

                <button 
                  onClick={confirmBonus} 
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-black transition-all hover:scale-105"
                >
                  받기!
                </button>
              </div>
            )}

            {/* 세계여행 */}
            {pendingAction.type === "travel" && (
              <div className="flex flex-col gap-4">
                <p className="text-center text-zinc-400">원하는 국가로 이동하세요</p>
                
                <div className="max-h-52 overflow-y-auto rounded-xl bg-black/30 p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {getCountryTiles().map((tile) => (
                      <button
                        key={tile.id}
                        onClick={() => setSelectedCountry(tile.id)}
                        className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                          selectedCountry === tile.id
                            ? "ring-2 ring-cyan-400"
                            : "hover:bg-white/10"
                        }`}
                        style={{ 
                          background: selectedCountry === tile.id 
                            ? `${tile.highlightColor}40` 
                            : "rgba(255,255,255,0.05)",
                          borderLeft: `3px solid ${tile.highlightColor}`,
                        }}
                      >
                        {tile.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => selectedCountry && selectTravel(selectedCountry)}
                  disabled={!selectedCountry}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-bold text-white transition-all hover:scale-105 disabled:opacity-40"
                >
                  이동하기 ✈️
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getActionIcon(type: string): string {
  switch (type) {
    case "buy": return "🏠";
    case "pay_toll": return "💸";
    case "tax": return "💰";
    case "jail": return "⛔";
    case "bonus": return "🎁";
    case "travel": return "✈️";
    default: return "❓";
  }
}

function getActionTitle(type: string): string {
  switch (type) {
    case "buy": return "구매";
    case "pay_toll": return "통행료";
    case "tax": return "세금";
    case "jail": return "정지";
    case "bonus": return "황금카드";
    case "travel": return "세계여행";
    default: return "";
  }
}

function getTierStyle(tier: string): string {
  switch (tier) {
    case "high": return "bg-red-500/30 text-red-300";
    case "mid": return "bg-yellow-500/30 text-yellow-300";
    case "low": return "bg-green-500/30 text-green-300";
    default: return "bg-zinc-500/30 text-zinc-300";
  }
}
