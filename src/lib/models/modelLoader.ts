/**
 * GLB 모델 로더 유틸리티
 * 
 * 현재 GLB 로딩이 비활성화되어 있습니다.
 * React hooks 문제 해결 후 다시 활성화할 수 있습니다.
 */

// 사용 가능한 모델 목록 (비활성화됨)
const AVAILABLE_MODELS: Record<string, { path: string; scale: number }> = {
  // GLB 모델 비활성화
};

/**
 * 국가 코드로 모델 경로 가져오기
 */
export function getModelPath(countryCode: string): string | null {
  const model = AVAILABLE_MODELS[countryCode.toUpperCase()];
  return model?.path ?? null;
}

/**
 * 국가 코드로 모델 스케일 가져오기
 */
export function getModelScale(countryCode: string): number {
  const model = AVAILABLE_MODELS[countryCode.toUpperCase()];
  return model?.scale ?? 1.0;
}

/**
 * 모델이 존재하는지 확인
 */
export function hasModel(countryCode: string): boolean {
  // GLB 모델 비활성화 - 항상 false 반환하여 프로시저럴 폴백 사용
  return false;
}
