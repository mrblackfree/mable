// ============================================
// AR World Marble – Core Types
// ============================================

export type TileType =
  | "start"
  | "country"
  | "travel"   // 세계여행
  | "bonus"    // 황금카드
  | "tax"
  | "jail";

export type TileTier = "low" | "mid" | "high";

export interface Tile {
  id: string;
  type: TileType;
  positionIndex: number;        // 보드 순번(0 = 출발)
  name: string;
  countryCode?: string;         // ISO 3166-1 alpha-2 (예: KR, JP)
  price?: number;               // 구매 가격
  toll?: number;                // 통행료
  tier?: TileTier;
  modelPath?: string;           // GLB 경로 (없으면 placeholder)
  fallbackShape?: "box" | "cone" | "cylinder";
  highlightColor?: string;      // hex
}

export interface Player {
  id: string;
  name: string;
  color: string;                // 말 색상
  money: number;
  positionIndex: number;        // 현재 위치
  ownedTileIds: string[];       // 소유 국가 id 목록
  upgradedTileIds: string[];    // 업그레이드된 국가 (통행료 2배)
  isBot?: boolean;
  isBankrupt?: boolean;
}

export type GamePhase =
  | "lobby"       // 플레이어 설정 중
  | "idle"        // 턴 대기
  | "rolling"     // 주사위 굴리는 중
  | "moving"      // 말 이동 중
  | "resolving"   // 도착 타일 처리 중
  | "modal"       // 구매/통행료 팝업
  | "gameOver";   // 게임 종료

export interface GameStats {
  turnCount: number;
  totalDiceRolls: number;
  totalMoneySpent: number;
  totalTollPaid: number;
  startTime: number;
}

export interface GameState {
  tiles: Tile[];
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  phase: GamePhase;
  boardPlaced: boolean;
  boardTransform: {
    position: [number, number, number];
    rotation: [number, number, number];
  };
  winner: string | null;
  stats: GameStats;
  maxTurns: number; // 0 = 무제한
}

