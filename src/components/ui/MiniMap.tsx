"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";

const MAP_SIZE = 120; // px
const TILE_SIZE = MAP_SIZE / 12; // ~10px per tile
const OFFSET = MAP_SIZE / 2 - TILE_SIZE / 2;

/**
 * 미니맵 - 보드 전체를 한눈에 볼 수 있는 UI
 */
export default function MiniMap() {
  const tiles = useGameStore((s) => s.tiles);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const phase = useGameStore((s) => s.phase);

  // 타일 위치 계산 (40칸 사각형 보드)
  const tilePositions = useMemo(() => {
    const positions: { x: number; y: number; tile: typeof tiles[0] }[] = [];
    const tilesPerSide = tiles.length / 4;
    
    tiles.forEach((tile, i) => {
      const side = Math.floor(i / tilesPerSide);
      const posInSide = i % tilesPerSide;
      const step = MAP_SIZE / (tilesPerSide + 1);
      
      let x = 0, y = 0;
      
      switch (side) {
        case 0: // 하단 (좌→우)
          x = step * (posInSide + 0.5);
          y = MAP_SIZE - TILE_SIZE;
          break;
        case 1: // 우측 (하→상)
          x = MAP_SIZE - TILE_SIZE;
          y = MAP_SIZE - step * (posInSide + 1.5);
          break;
        case 2: // 상단 (우→좌)
          x = MAP_SIZE - step * (posInSide + 1.5);
          y = 0;
          break;
        case 3: // 좌측 (상→하)
          x = 0;
          y = step * (posInSide + 0.5);
          break;
      }
      
      positions.push({ x, y, tile });
    });
    
    return positions;
  }, [tiles]);

  // 플레이어 위치
  const playerPositions = useMemo(() => {
    return players.map((player) => {
      const tilePos = tilePositions[player.positionIndex];
      return {
        player,
        x: tilePos?.x ?? 0,
        y: tilePos?.y ?? 0,
      };
    });
  }, [players, tilePositions]);

  if (phase === "lobby" || phase === "gameOver") return null;

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div 
        className="glass relative overflow-hidden rounded-xl"
        style={{ width: MAP_SIZE + 16, height: MAP_SIZE + 16 }}
      >
        <div className="absolute inset-2">
          {/* 타일 표시 */}
          {tilePositions.map(({ x, y, tile }) => {
            const owner = players.find((p) => p.ownedTileIds.includes(tile.id));
            const isSpecial = tile.type !== "country";
            
            return (
              <div
                key={tile.id}
                className="absolute rounded-sm transition-all"
                style={{
                  left: x,
                  top: y,
                  width: TILE_SIZE - 1,
                  height: TILE_SIZE - 1,
                  background: owner
                    ? owner.color
                    : isSpecial
                    ? tile.highlightColor + "80"
                    : "rgba(100,100,100,0.5)",
                  border: tile.type === "start" ? "1px solid #22d3ee" : "none",
                }}
                title={tile.name}
              />
            );
          })}

          {/* 플레이어 위치 */}
          {playerPositions.map(({ player, x, y }, i) => {
            const isActive = i === currentPlayerIndex;
            // 같은 위치의 플레이어들 오프셋
            const samePosPlayers = playerPositions.filter(
              (p) => p.x === x && p.y === y
            );
            const offsetIndex = samePosPlayers.findIndex(
              (p) => p.player.id === player.id
            );
            const offsetX = (offsetIndex % 2) * 4 - 2;
            const offsetY = Math.floor(offsetIndex / 2) * 4 - 2;

            return (
              <div
                key={player.id}
                className={`absolute rounded-full transition-all ${
                  isActive ? "z-10 animate-pulse" : ""
                }`}
                style={{
                  left: x + TILE_SIZE / 2 - 4 + offsetX,
                  top: y + TILE_SIZE / 2 - 4 + offsetY,
                  width: isActive ? 10 : 8,
                  height: isActive ? 10 : 8,
                  background: player.color,
                  border: "2px solid white",
                  boxShadow: isActive ? `0 0 6px ${player.color}` : "none",
                }}
                title={player.name}
              />
            );
          })}

          {/* 중앙 로고 */}
          <div 
            className="absolute flex items-center justify-center text-lg"
            style={{
              left: MAP_SIZE / 2 - 15,
              top: MAP_SIZE / 2 - 15,
              width: 30,
              height: 30,
            }}
          >
            🌍
          </div>
        </div>

        {/* 레이블 */}
        <div className="absolute bottom-1 left-2 text-[8px] text-zinc-500">
          MINI MAP
        </div>
      </div>
    </div>
  );
}

