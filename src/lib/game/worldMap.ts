import type { Tile } from "@/types";
import worldMapData from "../../../data/worldMap.v1.json";

export interface BonusCard {
  id: string;
  effect: "move" | "tax_exempt" | "free_stay" | "cash" | "go_to_start";
  value?: number;
  description: string;
}

export interface WorldMapSettings {
  startingMoney: number;
  taxAmount: number;
  jailTurns: number;
  passStartBonus: number;
  bonusCards: BonusCard[];
}

export interface WorldMap {
  version: string;
  description: string;
  tiles: Tile[];
  settings: WorldMapSettings;
}

export const worldMap: WorldMap = worldMapData as WorldMap;

export function getTileByIndex(index: number): Tile | undefined {
  return worldMap.tiles.find((t) => t.positionIndex === index);
}

export function getTileById(id: string): Tile | undefined {
  return worldMap.tiles.find((t) => t.id === id);
}

export function getCountryTiles(): Tile[] {
  return worldMap.tiles.filter((t) => t.type === "country");
}

export const TOTAL_TILES = worldMap.tiles.length;

