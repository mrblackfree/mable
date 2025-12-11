import { create } from "zustand";
import type { Tile, Player, GamePhase, GameState, GameStats } from "@/types";
import { worldMap, getTileByIndex, TOTAL_TILES } from "@/lib/game/worldMap";
import {
  rollDice,
  computeNextPosition,
  passedStart,
  resolveTileAction,
  applyBuy,
  applyPayToll,
  applyTax,
  applyBonusCard,
  checkWinner,
  type TileAction,
} from "@/lib/game/rules";
import {
  decideBuy,
  decideTravelDestination,
  getBotThinkingDelay,
  getBotName,
  type BotDifficulty,
} from "@/lib/game/botAI";
import { toast } from "@/stores/toastStore";

interface GameStore extends GameState {
  // Setup
  initGame: (playerCount: number, botCount?: number, difficulty?: BotDifficulty) => void;
  botDifficulty: BotDifficulty;

  // Board placement (AR)
  placeBoard: (position: [number, number, number], rotation: [number, number, number]) => void;

  // Turn actions
  rollAndMove: () => void;
  setPhase: (phase: GamePhase) => void;

  // Modal responses
  buyTile: () => void;
  passTile: () => void;
  payToll: () => void;
  selectTravel: (tileId: string) => void;
  confirmBonus: () => void;
  upgradeTile: (tileId: string) => void;

  // Internal
  pendingAction: TileAction | null;
  nextTurn: () => void;
  
  // Bot
  executeBotTurn: () => void;
}

const PLAYER_COLORS = ["#22d3ee", "#f472b6", "#a3e635", "#fbbf24"];

function createInitialPlayers(humanCount: number, botCount: number): Player[] {
  const players: Player[] = [];
  
  // 인간 플레이어
  for (let i = 0; i < humanCount; i++) {
    players.push({
      id: `player-${i + 1}`,
      name: `Player ${i + 1}`,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      money: worldMap.settings.startingMoney,
      positionIndex: 0,
      ownedTileIds: [],
      upgradedTileIds: [],
      isBot: false,
      isBankrupt: false,
    });
  }
  
  // 봇 플레이어
  for (let i = 0; i < botCount; i++) {
    const idx = humanCount + i;
    players.push({
      id: `bot-${i + 1}`,
      name: getBotName(i),
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
      money: worldMap.settings.startingMoney,
      positionIndex: 0,
      ownedTileIds: [],
      upgradedTileIds: [],
      isBot: true,
      isBankrupt: false,
    });
  }
  
  return players;
}

function createInitialStats(): GameStats {
  return {
    turnCount: 0,
    totalDiceRolls: 0,
    totalMoneySpent: 0,
    totalTollPaid: 0,
    startTime: Date.now(),
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  tiles: worldMap.tiles as Tile[],
  players: [],
  currentPlayerIndex: 0,
  diceValue: null,
  phase: "lobby",
  boardPlaced: false,
  boardTransform: { position: [0, 0, 0], rotation: [0, 0, 0] },
  winner: null,
  pendingAction: null,
  botDifficulty: "normal",
  stats: createInitialStats(),
  maxTurns: 50, // 기본 50턴 제한

  // ============================================
  // Setup
  // ============================================
  initGame: (playerCount, botCount = 0, difficulty = "normal") => {
    const totalPlayers = Math.min(Math.max(playerCount + botCount, 1), 4);
    const humans = Math.min(playerCount, totalPlayers);
    const bots = totalPlayers - humans;
    
    const players = createInitialPlayers(humans, bots);
    set({
      players,
      currentPlayerIndex: 0,
      diceValue: null,
      phase: "idle",
      winner: null,
      pendingAction: null,
      botDifficulty: difficulty,
      stats: createInitialStats(),
    });
  },

  // ============================================
  // AR Board Placement
  // ============================================
  placeBoard: (position, rotation) => {
    set({ boardPlaced: true, boardTransform: { position, rotation } });
  },

  // ============================================
  // Turn Flow
  // ============================================
  rollAndMove: () => {
    const { phase, players, currentPlayerIndex, stats } = get();
    if (phase !== "idle") return;

    const dice = rollDice();
    const player = players[currentPlayerIndex];
    const oldPos = player.positionIndex;
    const newPos = computeNextPosition(oldPos, dice);

    // 출발 통과 보너스
    let bonus = 0;
    if (passedStart(oldPos, newPos) && newPos !== 0) {
      bonus = worldMap.settings.passStartBonus;
      toast.success(`출발 통과! +$${bonus} 보너스!`, "🚀");
    }

    const updatedPlayer: Player = {
      ...player,
      positionIndex: newPos,
      money: player.money + bonus,
    };

    const updatedPlayers = players.map((p, i) =>
      i === currentPlayerIndex ? updatedPlayer : p
    );

    set({ 
      diceValue: dice, 
      phase: "moving", 
      players: updatedPlayers,
      stats: { ...stats, totalDiceRolls: stats.totalDiceRolls + 1 },
    });

    // 이동 애니메이션 후 resolve (간단히 타이머로 시뮬)
    setTimeout(() => {
      const tile = getTileByIndex(newPos);
      if (!tile) {
        get().nextTurn();
        return;
      }

      const action = resolveTileAction(tile, updatedPlayer, updatedPlayers);

      if (action.type === "none") {
        get().nextTurn();
      } else {
        set({ phase: "modal", pendingAction: action });
      }
    }, 800);
  },

  setPhase: (phase) => set({ phase }),

  // ============================================
  // Modal Responses
  // ============================================
  buyTile: () => {
    const { pendingAction, players, currentPlayerIndex, stats } = get();
    if (pendingAction?.type !== "buy") return;

    const tile = pendingAction.tile;
    const player = players[currentPlayerIndex];
    const updatedPlayer = applyBuy(player, tile);
    const updatedPlayers = players.map((p, i) =>
      i === currentPlayerIndex ? updatedPlayer : p
    );

    set({ 
      players: updatedPlayers, 
      pendingAction: null,
      stats: { ...stats, totalMoneySpent: stats.totalMoneySpent + (tile.price ?? 0) },
    });
    
    toast.success(`${player.name}이(가) ${tile.name}을(를) 구매했습니다!`, "🏠");
    get().nextTurn();
  },

  upgradeTile: (tileId: string) => {
    const { players, currentPlayerIndex, tiles, stats } = get();
    const player = players[currentPlayerIndex];
    const tile = tiles.find((t) => t.id === tileId);
    
    if (!tile || !player.ownedTileIds.includes(tileId)) return;
    if (player.upgradedTileIds.includes(tileId)) return; // 이미 업그레이드됨
    
    const upgradeCost = Math.floor((tile.price ?? 0) * 0.5); // 구매가의 50%
    if (player.money < upgradeCost) return;
    
    const updatedPlayer: Player = {
      ...player,
      money: player.money - upgradeCost,
      upgradedTileIds: [...player.upgradedTileIds, tileId],
    };
    
    const updatedPlayers = players.map((p, i) =>
      i === currentPlayerIndex ? updatedPlayer : p
    );
    
    set({ 
      players: updatedPlayers,
      stats: { ...stats, totalMoneySpent: stats.totalMoneySpent + upgradeCost },
    });
  },

  passTile: () => {
    set({ pendingAction: null });
    get().nextTurn();
  },

  payToll: () => {
    const { pendingAction, players, currentPlayerIndex, stats } = get();
    if (pendingAction?.type !== "pay_toll") return;

    const payer = players[currentPlayerIndex];
    const receiverIndex = players.findIndex((p) => p.id === pendingAction.owner.id);
    const receiver = players[receiverIndex];
    
    // 업그레이드된 타일이면 통행료 2배
    const isUpgraded = receiver.upgradedTileIds.includes(pendingAction.tile.id);
    const actualAmount = isUpgraded ? pendingAction.amount * 2 : pendingAction.amount;

    const result = applyPayToll(payer, receiver, actualAmount);
    
    // 파산 처리
    const finalPayer = result.payer.money < 0 
      ? { ...result.payer, isBankrupt: true }
      : result.payer;

    const updatedPlayers = players.map((p, i) => {
      if (i === currentPlayerIndex) return finalPayer;
      if (i === receiverIndex) return result.receiver;
      return p;
    });

    set({ 
      players: updatedPlayers, 
      pendingAction: null,
      stats: { ...stats, totalTollPaid: stats.totalTollPaid + actualAmount },
    });

    // 통행료 알림
    if (isUpgraded) {
      toast.warning(`${payer.name}이(가) ${receiver.name}에게 $${actualAmount} 지불! (2배)`, "💸");
    } else {
      toast.info(`${payer.name}이(가) ${receiver.name}에게 $${actualAmount} 지불`, "💰");
    }

    // 파산 체크
    const alivePlayers = updatedPlayers.filter((p) => !p.isBankrupt);
    if (finalPayer.isBankrupt) {
      toast.error(`${payer.name}이(가) 파산했습니다!`, "💀");
    }
    
    if (alivePlayers.length === 1) {
      set({ winner: alivePlayers[0].id, phase: "gameOver" });
    } else {
      get().nextTurn();
    }
  },

  selectTravel: (tileId) => {
    const { players, currentPlayerIndex, tiles } = get();
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) {
      get().nextTurn();
      return;
    }

    const updatedPlayer: Player = {
      ...players[currentPlayerIndex],
      positionIndex: tile.positionIndex,
    };

    const updatedPlayers = players.map((p, i) =>
      i === currentPlayerIndex ? updatedPlayer : p
    );

    set({ players: updatedPlayers, pendingAction: null });
    get().nextTurn();
  },

  confirmBonus: () => {
    const { pendingAction, players, currentPlayerIndex } = get();
    if (pendingAction?.type !== "bonus") return;

    const updatedPlayer = applyBonusCard(players[currentPlayerIndex], pendingAction.card);
    const updatedPlayers = players.map((p, i) =>
      i === currentPlayerIndex ? updatedPlayer : p
    );

    set({ players: updatedPlayers, pendingAction: null });
    get().nextTurn();
  },

  // ============================================
  // Next Turn
  // ============================================
  nextTurn: () => {
    const { players, currentPlayerIndex, winner, stats, maxTurns } = get();
    if (winner) return;

    // 파산하지 않은 다음 플레이어 찾기
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    let loopCount = 0;
    while (players[nextIndex]?.isBankrupt && loopCount < players.length) {
      nextIndex = (nextIndex + 1) % players.length;
      loopCount++;
    }
    
    // 한 바퀴 돌 때마다 턴 카운트 증가
    const newTurnCount = nextIndex <= currentPlayerIndex ? stats.turnCount + 1 : stats.turnCount;
    
    // 턴 제한 체크
    if (maxTurns > 0 && newTurnCount >= maxTurns) {
      // 가장 부자인 플레이어가 승리
      const richest = [...players]
        .filter((p) => !p.isBankrupt)
        .sort((a, b) => b.money - a.money)[0];
      
      if (richest) {
        toast.info(`${maxTurns}턴 종료! 최종 승자 결정!`, "🏁");
        set({ 
          winner: richest.id, 
          phase: "gameOver",
          stats: { ...stats, turnCount: newTurnCount },
        });
        return;
      }
    }
    
    set({ 
      currentPlayerIndex: nextIndex, 
      diceValue: null, 
      phase: "idle",
      stats: { ...stats, turnCount: newTurnCount },
    });
    
    // 다음 플레이어가 봇이면 자동 플레이
    const nextPlayer = players[nextIndex];
    if (nextPlayer?.isBot && !nextPlayer.isBankrupt) {
      setTimeout(() => {
        get().executeBotTurn();
      }, getBotThinkingDelay(get().botDifficulty));
    }
  },

  // ============================================
  // Bot AI
  // ============================================
  executeBotTurn: () => {
    const { phase, players, currentPlayerIndex, pendingAction, botDifficulty } = get();
    const bot = players[currentPlayerIndex];
    
    if (!bot?.isBot) return;

    // 모달 상태: 결정 필요
    if (phase === "modal" && pendingAction) {
      setTimeout(() => {
        const { pendingAction: action, players: currentPlayers } = get();
        if (!action) return;

        switch (action.type) {
          case "buy":
            if (decideBuy(bot, action.tile, botDifficulty)) {
              get().buyTile();
            } else {
              get().passTile();
            }
            break;
            
          case "pay_toll":
            get().payToll();
            break;
            
          case "tax":
            useGameStore.setState((state) => {
              const updated = [...state.players];
              updated[state.currentPlayerIndex] = {
                ...updated[state.currentPlayerIndex],
                money: updated[state.currentPlayerIndex].money - action.amount,
              };
              return { players: updated, pendingAction: null };
            });
            get().nextTurn();
            break;
            
          case "jail":
            useGameStore.setState({ pendingAction: null });
            get().nextTurn();
            break;
            
          case "bonus":
            get().confirmBonus();
            break;
            
          case "travel":
            const destination = decideTravelDestination(bot, currentPlayers, botDifficulty);
            get().selectTravel(destination);
            break;
        }
      }, getBotThinkingDelay(botDifficulty) / 2);
      return;
    }

    // idle 상태: 주사위 굴리기
    if (phase === "idle") {
      get().rollAndMove();
    }
  },
}));

