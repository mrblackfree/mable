/**
 * 로컬 스토리지 관리 (안전 처리 포함)
 */

export interface GameRecord {
  id: string;
  date: string;
  winnerName: string;
  winnerMoney: number;
  playerCount: number;
  botCount: number;
  turnCount: number;
  duration: number; // 초
}

const STORAGE_KEY = "ar-world-marble-records";
const MAX_RECORDS = 10;

/**
 * localStorage 사용 가능 여부 확인
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * 저장된 기록 불러오기
 */
export function loadRecords(): GameRecord[] {
  if (!isStorageAvailable()) return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as GameRecord[];
  } catch {
    return [];
  }
}

/**
 * 기록 저장
 */
export function saveRecord(record: Omit<GameRecord, "id" | "date">): void {
  if (!isStorageAvailable()) return;
  
  try {
    const records = loadRecords();
    const newRecord: GameRecord = {
      ...record,
      id: `record-${Date.now()}`,
      date: new Date().toISOString(),
    };
    
    // 상위 기록만 유지 (자산 기준 정렬)
    const updated = [newRecord, ...records]
      .sort((a, b) => b.winnerMoney - a.winnerMoney)
      .slice(0, MAX_RECORDS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save record:", e);
  }
}

/**
 * 기록 초기화
 */
export function clearRecords(): void {
  if (!isStorageAvailable()) return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}

/**
 * 최고 기록 가져오기
 */
export function getHighScore(): GameRecord | null {
  const records = loadRecords();
  return records[0] ?? null;
}

/**
 * 시간 포맷 (초 → mm:ss)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 날짜 포맷
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}
