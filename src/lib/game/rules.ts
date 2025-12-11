import type { Tile, Player, GamePhase } from "@/types";
import { worldMap, getTileByIndex, TOTAL_TILES, type BonusCard } from "./worldMap";

// ============================================
// Dice
// ============================================
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// ============================================
// Movement
// ============================================
export function computeNextPosition(current: number, steps: number): number {
  return (current + steps) % TOTAL_TILES;
}

export function passedStart(oldPos: number, newPos: number): boolean {
  // 한 바퀴 돌아서 출발을 지났는지 체크
  return newPos < oldPos || (oldPos === 0 && newPos === 0);
}

// ============================================
// Tile Actions
// ============================================
export type TileAction =
  | { type: "none" }
  | { type: "buy"; tile: Tile }
  | { type: "pay_toll"; tile: Tile; owner: Player; amount: number }
  | { type: "tax"; amount: number }
  | { type: "jail"; turns: number }
  | { type: "bonus"; card: BonusCard }
  | { type: "travel" };

export function resolveTileAction(
  tile: Tile,
  currentPlayer: Player,
  players: Player[]
): TileAction {
  switch (tile.type) {
    case "start":
      return { type: "none" };

    case "country": {
      const owner = players.find((p) => p.ownedTileIds.includes(tile.id));
      if (!owner) {
        // 미소유 → 구매 가능
        return { type: "buy", tile };
      }
      if (owner.id === currentPlayer.id) {
        // 본인 소유 → 아무 일 없음
        return { type: "none" };
      }
      // 타인 소유 → 통행료
      return {
        type: "pay_toll",
        tile,
        owner,
        amount: tile.toll ?? 0,
      };
    }

    case "tax":
      return { type: "tax", amount: worldMap.settings.taxAmount };

    case "jail":
      return { type: "jail", turns: worldMap.settings.jailTurns };

    case "bonus": {
      const cards = worldMap.settings.bonusCards;
      const card = cards[Math.floor(Math.random() * cards.length)];
      return { type: "bonus", card };
    }

    case "travel":
      return { type: "travel" };

    default:
      return { type: "none" };
  }
}

// ============================================
// Apply Actions
// ============================================
export function applyBuy(player: Player, tile: Tile): Player {
  const price = tile.price ?? 0;
  return {
    ...player,
    money: player.money - price,
    ownedTileIds: [...player.ownedTileIds, tile.id],
  };
}

export function applyPayToll(
  payer: Player,
  receiver: Player,
  amount: number
): { payer: Player; receiver: Player } {
  return {
    payer: { ...payer, money: payer.money - amount },
    receiver: { ...receiver, money: receiver.money + amount },
  };
}

export function applyTax(player: Player, amount: number): Player {
  return { ...player, money: player.money - amount };
}

export function applyBonusCard(player: Player, card: BonusCard): Player {
  if (card.effect === "cash" && card.value) {
    return { ...player, money: player.money + card.value };
  }
  // 다른 효과는 별도 상태 저장 필요 (Phase 2에서 확장)
  return player;
}

// ============================================
// Win / Bankrupt
// ============================================
export function isBankrupt(player: Player): boolean {
  return player.money < 0;
}

export function checkWinner(players: Player[]): Player | null {
  const alive = players.filter((p) => !isBankrupt(p));
  if (alive.length === 1) return alive[0];
  return null;
}

