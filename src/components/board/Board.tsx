"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/stores/gameStore";
import Tile3D from "./Tile3D";
import PlayerPiece from "./PlayerPiece";
import BoardBase from "./BoardBase";
import BoardCenter from "./BoardCenter";
import type { Group } from "three";

// 사각형 보드 레이아웃 (브루마불 스타일)
// 40칸 = 4면 × 10칸씩 (코너 포함)
const TILE_SIZE = 0.5;
const TILES_PER_SIDE = 10; // 한 변당 타일 수
const TILE_GAP = 0.06;
const TOTAL_WIDTH = (TILE_SIZE + TILE_GAP) * TILES_PER_SIDE;

function getTileWorldPosition(index: number, total: number): [number, number, number] {
  // 사각형 보드: 0부터 시계방향
  // 하단 → 우측 → 상단 → 좌측
  const tilesPerSide = total / 4;
  const side = Math.floor(index / tilesPerSide);
  const posInSide = index % tilesPerSide;
  
  const offset = TOTAL_WIDTH / 2 - TILE_SIZE / 2;
  const step = TILE_SIZE + TILE_GAP;

  switch (side) {
    case 0: // 하단 (좌→우)
      return [-offset + posInSide * step, 0, offset];
    case 1: // 우측 (하→상)
      return [offset, 0, offset - posInSide * step];
    case 2: // 상단 (우→좌)
      return [offset - posInSide * step, 0, -offset];
    case 3: // 좌측 (상→하)
      return [-offset, 0, -offset + posInSide * step];
    default:
      return [0, 0, 0];
  }
}

function getTileRotation(index: number, total: number): number {
  const tilesPerSide = total / 4;
  const side = Math.floor(index / tilesPerSide);
  // 타일이 보드 중앙을 바라보도록 회전
  return -side * (Math.PI / 2);
}

export default function Board() {
  const tiles = useGameStore((s) => s.tiles);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const phase = useGameStore((s) => s.phase);
  const groupRef = useRef<Group>(null);

  // 보드 살짝 회전 애니메이션 (idle 시)
  useFrame((_, delta) => {
    if (groupRef.current && phase === "idle") {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  const tileData = useMemo(() => {
    return tiles.map((t, i) => ({
      tile: t,
      position: getTileWorldPosition(t.positionIndex, tiles.length),
      rotation: getTileRotation(t.positionIndex, tiles.length),
    }));
  }, [tiles]);

  const currentPlayer = players[currentPlayerIndex];
  const highlightedTileIndex = currentPlayer?.positionIndex ?? -1;

  return (
    <group ref={groupRef}>
      {/* 보드 베이스 */}
      <BoardBase size={TOTAL_WIDTH + 1.2} />

      {/* 중앙 로고 + 지구본 */}
      <BoardCenter />

      {/* 타일들 */}
      {tileData.map(({ tile, position, rotation }) => (
        <Tile3D
          key={tile.id}
          tile={tile}
          position={position}
          rotationY={rotation}
          isHighlighted={tile.positionIndex === highlightedTileIndex && phase === "idle"}
          isCurrentTile={tile.positionIndex === highlightedTileIndex}
        />
      ))}

      {/* 플레이어 말 */}
      {players.map((player, i) => {
        const tilePos = getTileWorldPosition(player.positionIndex, tiles.length);
        // 같은 칸에 여러 말이 있을 때 오프셋
        const angleOffset = (i / players.length) * Math.PI * 2;
        const radius = 0.15;
        const pos: [number, number, number] = [
          tilePos[0] + Math.cos(angleOffset) * radius,
          0.35,
          tilePos[2] + Math.sin(angleOffset) * radius,
        ];
        return (
          <PlayerPiece
            key={player.id}
            player={player}
            targetPosition={pos}
            isCurrentPlayer={i === currentPlayerIndex}
            playerIndex={i}
          />
        );
      })}
    </group>
  );
}
