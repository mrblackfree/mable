"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "@/stores/gameStore";
import type { BotDifficulty } from "@/lib/game/botAI";
import { saveRecord, loadRecords, formatDuration, formatDate, type GameRecord } from "@/lib/storage/localStorage";

// 3D 주사위 (SSR 비활성화)
const Dice3D = dynamic(() => import("./Dice3D"), { ssr: false });

export default function HUD() {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const diceValue = useGameStore((s) => s.diceValue);
  const rollAndMove = useGameStore((s) => s.rollAndMove);
  const initGame = useGameStore((s) => s.initGame);
  const winner = useGameStore((s) => s.winner);

  const [muted, setMuted] = useState(false);
  
  // 로비 설정
  const [humanCount, setHumanCount] = useState(1);
  const [botCount, setBotCount] = useState(1);
  const [difficulty, setDifficulty] = useState<BotDifficulty>("normal");

  const handleMuteToggle = () => {
    setMuted(!muted);
  };
  
  const handleStartGame = () => {
    initGame(humanCount, botCount, difficulty);
  };

  const currentPlayer = players[currentPlayerIndex];
  const PLAYER_COLORS = ["#22d3ee", "#f472b6", "#a3e635", "#fbbf24"];

  // 로비에서 게임 시작
  if (phase === "lobby" || players.length === 0) {
    const totalPlayers = humanCount + botCount;
    const isValidSetup = totalPlayers >= 2 && totalPlayers <= 4;
    
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto">
        {/* 그라데이션 배경 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-black/90 to-cyan-900/80" />
        
        <div className="relative z-10 flex flex-col items-center gap-6 p-6">
          {/* 로고 */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-6xl">🌍</span>
            <h1 className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent">
              AR World Marble
            </h1>
            <p className="text-sm text-zinc-400">전 세계를 여행하는 보드게임</p>
          </div>

          {/* 설정 카드 */}
          <div className="glass flex w-full max-w-sm flex-col gap-5 p-6">
            {/* 인간 플레이어 */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <span>👤</span> 플레이어
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setHumanCount(n);
                      if (n + botCount > 4) setBotCount(4 - n);
                    }}
                    disabled={n > 4 - botCount && n !== humanCount}
                    className={`flex-1 rounded-xl py-3 font-bold transition-all ${
                      humanCount === n
                        ? "bg-cyan-500 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-30"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* AI 봇 */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <span>🤖</span> AI 봇
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBotCount(n)}
                    disabled={n > 4 - humanCount}
                    className={`flex-1 rounded-xl py-3 font-bold transition-all ${
                      botCount === n
                        ? "bg-purple-500 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-30"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* 난이도 */}
            {botCount > 0 && (
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <span>⚡</span> AI 난이도
                </label>
                <div className="flex gap-2">
                  {(["easy", "normal", "hard"] as BotDifficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                        difficulty === d
                          ? d === "easy"
                            ? "bg-green-500 text-white"
                            : d === "normal"
                            ? "bg-yellow-500 text-black"
                            : "bg-red-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {d === "easy" ? "쉬움" : d === "normal" ? "보통" : "어려움"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 플레이어 미리보기 */}
            <div className="flex justify-center gap-2 py-2">
              {Array.from({ length: humanCount }).map((_, i) => (
                <div 
                  key={`h-${i}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                  style={{ background: PLAYER_COLORS[i] }}
                >
                  👤
                </div>
              ))}
              {Array.from({ length: botCount }).map((_, i) => (
                <div 
                  key={`b-${i}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                  style={{ background: PLAYER_COLORS[humanCount + i] }}
                >
                  🤖
                </div>
              ))}
            </div>

            {/* 시작 버튼 */}
            <button
              onClick={handleStartGame}
              disabled={!isValidSetup}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              {isValidSetup ? "🎮 게임 시작" : "2~4명 필요"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 게임 스토어에서 통계 가져오기
  const stats = useGameStore((s) => s.stats);
  const [recordSaved, setRecordSaved] = useState(false);
  const [records, setRecords] = useState<GameRecord[]>([]);

  // 승리 시 기록 저장
  useEffect(() => {
    if (winner && !recordSaved) {
      const winnerPlayer = players.find((p) => p.id === winner);
      if (winnerPlayer) {
        const humanCount = players.filter((p) => !p.isBot).length;
        const botCount = players.filter((p) => p.isBot).length;
        const duration = Math.floor((Date.now() - stats.startTime) / 1000);
        
        saveRecord({
          winnerName: winnerPlayer.name,
          winnerMoney: winnerPlayer.money,
          playerCount: humanCount,
          botCount: botCount,
          turnCount: stats.turnCount,
          duration: duration,
        });
        
        setRecordSaved(true);
        setRecords(loadRecords());
      }
    }
    
    if (!winner) {
      setRecordSaved(false);
    }
  }, [winner, recordSaved, players, stats]);

  // 승자 발표
  if (winner) {
    const winnerPlayer = players.find((p) => p.id === winner);
    const duration = Math.floor((Date.now() - stats.startTime) / 1000);
    
    // 순위 계산
    const rankings = [...players]
      .sort((a, b) => b.money - a.money)
      .map((p, i) => ({ ...p, rank: i + 1 }));
    
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto">
        <div className="absolute inset-0 bg-black/80" />
        
        <div className="relative z-10 flex max-w-lg flex-col items-center gap-6 p-6 text-center">
          {/* 승리 애니메이션 */}
          <div className="animate-bounce text-7xl">🏆</div>
          
          <div className="flex flex-col gap-2">
            <p className="text-lg text-zinc-400">승자</p>
            <h2 
              className="text-4xl font-bold"
              style={{ 
                color: winnerPlayer?.color,
                textShadow: `0 0 30px ${winnerPlayer?.color}`,
              }}
            >
              {winnerPlayer?.name}
            </h2>
          </div>

          {/* 상세 통계 */}
          <div className="glass w-full p-4">
            <h3 className="mb-3 text-lg font-bold text-white">📊 게임 통계</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-zinc-500">플레이 시간</p>
                <p className="font-bold text-cyan-400">{formatDuration(duration)}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-zinc-500">총 턴</p>
                <p className="font-bold text-purple-400">{stats.turnCount}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-zinc-500">주사위 횟수</p>
                <p className="font-bold text-green-400">{stats.totalDiceRolls}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-zinc-500">총 통행료</p>
                <p className="font-bold text-yellow-400">${stats.totalTollPaid}</p>
              </div>
            </div>
          </div>

          {/* 최종 순위 */}
          <div className="glass w-full p-4">
            <h3 className="mb-3 text-lg font-bold text-white">🏅 최종 순위</h3>
            <div className="space-y-2">
              {rankings.map((p) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-2"
                  style={{ borderLeft: `3px solid ${p.color}` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : ""}
                    </span>
                    <span className={p.isBankrupt ? "text-red-400 line-through" : "text-white"}>
                      {p.name}
                    </span>
                    {p.isBot && <span className="text-xs text-zinc-500">🤖</span>}
                  </div>
                  <span className={`font-bold ${p.isBankrupt ? "text-red-400" : "text-cyan-400"}`}>
                    ${p.money}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 최고 기록 */}
          {records.length > 0 && (
            <div className="glass w-full p-4">
              <h3 className="mb-2 text-sm font-bold text-zinc-400">🏆 최고 기록</h3>
              <div className="text-xs text-zinc-500">
                {records[0].winnerName} - ${records[0].winnerMoney} ({formatDate(records[0].date)})
              </div>
            </div>
          )}

          <button 
            onClick={() => {
              setRecordSaved(false);
              initGame(humanCount, botCount, difficulty);
            }} 
            className="btn btn-primary mt-4 text-lg"
          >
            🔄 다시 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 3D 주사위 */}
      <Dice3D />

      {/* Top bar: 플레이어 정보 */}
      <div className="fixed left-2 right-2 top-2 z-30 sm:left-4 sm:right-4 sm:top-4">
        <div className="flex items-stretch gap-1 sm:gap-2">
          {players.map((p, i) => {
            const isActive = i === currentPlayerIndex;
            return (
              <div
                key={p.id}
                className={`relative flex-1 overflow-hidden rounded-xl transition-all ${
                  isActive 
                    ? "scale-105 shadow-lg" 
                    : "opacity-70"
                }`}
                style={{
                  background: isActive 
                    ? `linear-gradient(135deg, ${p.color}30, ${p.color}10)` 
                    : "rgba(0,0,0,0.4)",
                  border: isActive ? `2px solid ${p.color}` : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* 활성 표시 글로우 */}
                {isActive && (
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(circle at center, ${p.color}, transparent)`,
                    }}
                  />
                )}

                <div className="relative flex flex-col items-center px-3 py-3">
                  {/* 플레이어 아이콘 */}
                  <div 
                    className="mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: p.color }}
                  >
                    {i + 1}
                  </div>
                  
                  {/* 이름 */}
                  <span 
                    className="text-sm font-medium"
                    style={{ color: isActive ? p.color : "#a1a1aa" }}
                  >
                    {p.name}
                  </span>
                  
                  {/* 자산 */}
                  <span className={`text-lg font-bold ${p.money < 0 ? "text-red-400" : "text-white"}`}>
                    ${p.money}
                  </span>

                  {/* 소유 국가 수 */}
                  <span className="mt-1 text-xs text-zinc-500">
                    🏠 {p.ownedTileIds.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mute button */}
      <button
        onClick={handleMuteToggle}
        className="glass fixed right-4 top-24 z-30 flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all hover:scale-110"
        title={muted ? "소리 켜기" : "음소거"}
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {/* Bottom: 주사위 버튼 */}
      <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3">
        {phase === "idle" && currentPlayer && !currentPlayer.isBot && (
          <button 
            onClick={rollAndMove} 
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/30"
          >
            {/* 글로우 효과 */}
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 blur transition-opacity group-hover:opacity-50" />
            <span className="relative flex items-center gap-2">
              🎲 주사위 굴리기
            </span>
          </button>
        )}

        {phase === "rolling" && (
          <div className="glass animate-pulse px-6 py-3 text-cyan-400">
            주사위 굴리는 중...
          </div>
        )}

        {phase === "moving" && (
          <div className="glass px-6 py-3 text-purple-400">
            이동 중...
          </div>
        )}

        {/* 봇 턴 표시 */}
        {phase === "idle" && currentPlayer?.isBot && (
          <div className="glass flex items-center gap-2 px-6 py-3 text-purple-400">
            <span className="animate-spin">🤖</span>
            <span>AI 생각 중...</span>
          </div>
        )}
      </div>

      {/* 현재 턴 표시 */}
      {currentPlayer && (
        <div 
          className="fixed bottom-6 left-6 z-30 glass px-4 py-2 text-sm"
          style={{ borderLeft: `3px solid ${currentPlayer.color}` }}
        >
          <span className="text-zinc-400">현재 턴: </span>
          <span style={{ color: currentPlayer.color }}>{currentPlayer.name}</span>
        </div>
      )}
    </>
  );
}
