/**
 * GLB 모델 로더 시스템
 * - 비동기 모델 로딩
 * - 캐싱
 * - 폴백 처리
 */

// ✅ 생성된 GLB 파일들 (23개 국가)
export const AVAILABLE_MODELS: Set<string> = new Set([
  "KR", "JP", "FR", "US", "EG", "GB", "IT", "IN", "AE", "SG", 
  "CN", "BR", "CA", "AU", "NL", "DE", "ES", "ZA", "GR", "RU", 
  "PE", "MX", "CL"
]);

// 국가별 모델 경로 매핑
export const MODEL_PATHS: Record<string, string> = {
  // 아시아
  KR: "/models/landmarks/seoul-tower.glb",
  JP: "/models/landmarks/tokyo-tower.glb",
  CN: "/models/landmarks/great-wall.glb",
  SG: "/models/landmarks/marina-bay.glb",
  IN: "/models/landmarks/taj-mahal.glb",
  
  // 중동/아프리카
  AE: "/models/landmarks/burj-khalifa.glb",
  EG: "/models/landmarks/pyramid.glb",
  ZA: "/models/landmarks/table-mountain.glb",
  
  // 유럽
  FR: "/models/landmarks/eiffel-tower.glb",
  IT: "/models/landmarks/colosseum.glb",
  GB: "/models/landmarks/big-ben.glb",
  DE: "/models/landmarks/brandenburg-gate.glb",
  ES: "/models/landmarks/sagrada-familia.glb",
  NL: "/models/landmarks/windmill.glb",
  GR: "/models/landmarks/acropolis.glb",
  RU: "/models/landmarks/st-basils.glb",
  
  // 아메리카
  US: "/models/landmarks/statue-of-liberty.glb",
  BR: "/models/landmarks/christ-redeemer.glb",
  CA: "/models/landmarks/cn-tower.glb",
  MX: "/models/landmarks/chichen-itza.glb",
  PE: "/models/landmarks/machu-picchu.glb",
  CL: "/models/landmarks/moai.glb",
  
  // 오세아니아
  AU: "/models/landmarks/sydney-opera.glb",
};

// 모델 스케일 (각 모델의 크기 조정)
export const MODEL_SCALES: Record<string, number> = {
  KR: 0.4,
  JP: 0.4,
  CN: 0.4,
  SG: 0.4,
  IN: 0.4,
  AE: 0.25,
  EG: 0.4,
  ZA: 0.4,
  FR: 0.35,
  IT: 0.5,
  GB: 0.35,
  DE: 0.5,
  ES: 0.4,
  NL: 0.5,
  GR: 0.5,
  RU: 0.4,
  US: 0.4,
  BR: 0.35,
  CA: 0.3,
  MX: 0.4,
  PE: 0.5,
  AU: 0.5,
  CL: 0.5,
};

// 기본 스케일
export const DEFAULT_MODEL_SCALE = 0.1;

/**
 * 모델 경로 가져오기
 */
export function getModelPath(countryCode: string): string | null {
  return MODEL_PATHS[countryCode] ?? null;
}

/**
 * 모델 스케일 가져오기
 */
export function getModelScale(countryCode: string): number {
  return MODEL_SCALES[countryCode] ?? DEFAULT_MODEL_SCALE;
}

/**
 * 모델이 실제로 사용 가능한지 확인
 * (AVAILABLE_MODELS에 등록된 것만 true)
 */
export function hasModel(countryCode: string): boolean {
  return AVAILABLE_MODELS.has(countryCode);
}

