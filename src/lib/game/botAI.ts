import type { Player, Tile } from "@/types";
import { getCountryTiles } from "./worldMap";

/**
 * AI 봇 결정 로직
 * - 구매 결정: 자금 상황과 타일 가치를 고려
 * - 여행 선택: 빈 땅이나 저렴한 국가 우선
 */

export type BotDifficulty = "easy" | "normal" | "hard";

interface BotDecision {
  action: "buy" | "pass" | "travel";
  targetTileId?: string;
}

/**
 * 구매 결정
 * - Easy: 50% 확률로 구매
 * - Normal: 자금의 30% 이하면 구매
 * - Hard: ROI 계산해서 구매
 */
export function decideBuy(
  bot: Player,
  tile: Tile,
  difficulty: BotDifficulty = "normal"
): boolean {
  const price = tile.price ?? 0;
  
  // 자금 부족
  if (bot.money < price) return false;

  switch (difficulty) {
    case "easy":
      // 50% 확률
      return Math.random() > 0.5;

    case "normal":
      // 자금의 50% 이상 남으면 구매
      return bot.money - price >= bot.money * 0.3;

    case "hard":
      // ROI 기반 결정
      const toll = tile.toll ?? 0;
      const roi = toll / price; // 통행료 / 가격
      const turnsToBreakEven = price / toll;
      
      // 10턴 내에 본전 가능하고, 구매 후 자금이 300 이상이면 구매
      return turnsToBreakEven <= 10 && bot.money - price >= 300;

    default:
      return true;
  }
}

/**
 * 여행 목적지 선택
 * - Easy: 랜덤 선택
 * - Normal: 빈 땅 우선
 * - Hard: 가장 저렴한 빈 땅 선택
 */
export function decideTravelDestination(
  bot: Player,
  players: Player[],
  difficulty: BotDifficulty = "normal"
): string {
  const countries = getCountryTiles();
  
  // 소유되지 않은 국가 찾기
  const unowned = countries.filter((tile) =>
    !players.some((p) => p.ownedTileIds.includes(tile.id))
  );

  switch (difficulty) {
    case "easy":
      // 랜덤 선택
      return countries[Math.floor(Math.random() * countries.length)].id;

    case "normal":
      // 빈 땅이 있으면 랜덤 빈 땅, 없으면 랜덤
      if (unowned.length > 0) {
        return unowned[Math.floor(Math.random() * unowned.length)].id;
      }
      return countries[Math.floor(Math.random() * countries.length)].id;

    case "hard":
      // 빈 땅 중 가장 저렴한 것
      if (unowned.length > 0) {
        const sorted = unowned.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        // 살 수 있는 것 중 가장 저렴한 것
        const affordable = sorted.filter((t) => (t.price ?? 0) <= bot.money);
        if (affordable.length > 0) {
          return affordable[0].id;
        }
        return sorted[0].id;
      }
      // 빈 땅 없으면 내 땅으로 이동 (안전)
      const myTiles = countries.filter((t) => bot.ownedTileIds.includes(t.id));
      if (myTiles.length > 0) {
        return myTiles[Math.floor(Math.random() * myTiles.length)].id;
      }
      return countries[Math.floor(Math.random() * countries.length)].id;

    default:
      return countries[0].id;
  }
}

/**
 * AI 턴 딜레이 (자연스러움을 위해)
 */
export function getBotThinkingDelay(difficulty: BotDifficulty): number {
  switch (difficulty) {
    case "easy": return 500;
    case "normal": return 800;
    case "hard": return 1200;
    default: return 800;
  }
}

/**
 * 봇 이름 생성
 */
const BOT_NAMES = [
  "🤖 AI Alpha",
  "🤖 Bot Beta",
  "🤖 CPU Charlie",
  "🤖 Droid Delta",
];

export function getBotName(index: number): string {
  return BOT_NAMES[index % BOT_NAMES.length];
}

