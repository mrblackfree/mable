import { Howl, Howler } from "howler";

// ============================================
// Audio Manager – Singleton
// ============================================

type SfxName = "dice" | "move" | "buy" | "toll" | "bonus" | "travel" | "win";

class AudioManager {
  private bgm: Howl | null = null;
  private sfx: Record<SfxName, Howl | null> = {
    dice: null,
    move: null,
    buy: null,
    toll: null,
    bonus: null,
    travel: null,
    win: null,
  };

  private muted = false;
  private bgmVolume = 0.3;
  private sfxVolume = 0.6;

  // iOS/모바일 오디오 unlock
  private unlocked = false;

  constructor() {
    if (typeof window !== "undefined") {
      // 첫 제스처 시 unlock
      const unlock = () => {
        if (!this.unlocked) {
          Howler.ctx?.resume();
          this.unlocked = true;
          window.removeEventListener("click", unlock);
          window.removeEventListener("touchstart", unlock);
        }
      };
      window.addEventListener("click", unlock);
      window.addEventListener("touchstart", unlock);
    }
  }

  // ============================================
  // BGM
  // ============================================
  loadBGM(src: string) {
    try {
      this.bgm = new Howl({
        src: [src],
        loop: true,
        volume: this.bgmVolume,
        html5: true, // 모바일 스트리밍 최적화
        onloaderror: () => {
          console.warn(`[Audio] BGM 로드 실패: ${src}`);
          this.bgm = null;
        },
      });
    } catch {
      console.warn(`[Audio] BGM 초기화 실패: ${src}`);
    }
  }

  playBGM() {
    if (this.bgm && !this.bgm.playing()) {
      this.bgm.play();
    }
  }

  stopBGM() {
    this.bgm?.stop();
  }

  setBGMVolume(vol: number) {
    this.bgmVolume = vol;
    this.bgm?.volume(vol);
  }

  // ============================================
  // SFX
  // ============================================
  loadSFX(name: SfxName, src: string) {
    try {
      this.sfx[name] = new Howl({
        src: [src],
        volume: this.sfxVolume,
        onloaderror: () => {
          console.warn(`[Audio] SFX 로드 실패: ${name}`);
          this.sfx[name] = null;
        },
      });
    } catch {
      console.warn(`[Audio] SFX 초기화 실패: ${name}`);
    }
  }

  playSFX(name: SfxName) {
    this.sfx[name]?.play();
  }

  setSFXVolume(vol: number) {
    this.sfxVolume = vol;
    Object.values(this.sfx).forEach((h) => h?.volume(vol));
  }

  // ============================================
  // Mute Toggle
  // ============================================
  toggleMute() {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // ============================================
  // Preload All
  // ============================================
  preloadAll() {
    // BGM (placeholder – 실제 파일이 없으면 로드 실패해도 무시)
    this.loadBGM("/audio/bgm.mp3");

    // SFX (placeholder 파일들)
    this.loadSFX("dice", "/audio/dice.mp3");
    this.loadSFX("move", "/audio/move.mp3");
    this.loadSFX("buy", "/audio/buy.mp3");
    this.loadSFX("toll", "/audio/toll.mp3");
    this.loadSFX("bonus", "/audio/bonus.mp3");
    this.loadSFX("travel", "/audio/travel.mp3");
    this.loadSFX("win", "/audio/win.mp3");
  }
}

// Singleton export
export const audioManager = new AudioManager();
export type { SfxName };

