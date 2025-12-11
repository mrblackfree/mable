// ============================================
// Audio Manager – Disabled (no audio files)
// ============================================

type SfxName = "dice" | "move" | "buy" | "toll" | "bonus" | "travel" | "win";

class AudioManager {
  private muted = false;

  loadBGM(_src: string) {
    // 비활성화: 오디오 파일 없음
  }

  playBGM() {
    // 비활성화
  }

  stopBGM() {
    // 비활성화
  }

  setBGMVolume(_vol: number) {
    // 비활성화
  }

  loadSFX(_name: SfxName, _src: string) {
    // 비활성화
  }

  playSFX(_name: SfxName) {
    // 비활성화
  }

  setSFXVolume(_vol: number) {
    // 비활성화
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  async preloadAll() {
    // 비활성화: 오디오 파일 없음
  }
}

// Singleton export
export const audioManager = new AudioManager();
export type { SfxName };
