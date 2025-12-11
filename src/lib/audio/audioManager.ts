// ============================================
// Audio Manager – Singleton
// ============================================

type SfxName = "dice" | "move" | "buy" | "toll" | "bonus" | "travel" | "win";

// SSR 환경 체크
const isClient = typeof window !== "undefined";

// Howl 타입 (런타임에 할당)
type HowlType = import("howler").Howl;
type HowlerType = typeof import("howler").Howler;

class AudioManager {
  private bgm: HowlType | null = null;
  private sfx: Record<SfxName, HowlType | null> = {
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
  private unlocked = false;
  
  // 동적 로드된 Howler 모듈
  private HowlClass: (typeof import("howler"))["Howl"] | null = null;
  private HowlerModule: HowlerType | null = null;
  private moduleLoaded = false;

  constructor() {
    if (isClient) {
      this.initHowler();
    }
  }

  private async initHowler() {
    try {
      const howlerModule = await import("howler");
      this.HowlClass = howlerModule.Howl;
      this.HowlerModule = howlerModule.Howler;
      this.moduleLoaded = true;

      // 첫 제스처 시 unlock
      const unlock = () => {
        if (!this.unlocked && this.HowlerModule) {
          this.HowlerModule.ctx?.resume();
          this.unlocked = true;
          window.removeEventListener("click", unlock);
          window.removeEventListener("touchstart", unlock);
        }
      };
      window.addEventListener("click", unlock);
      window.addEventListener("touchstart", unlock);
    } catch (e) {
      console.warn("[Audio] Howler 로드 실패:", e);
    }
  }

  // ============================================
  // BGM
  // ============================================
  loadBGM(src: string) {
    if (!isClient || !this.HowlClass) return;
    
    try {
      this.bgm = new this.HowlClass({
        src: [src],
        loop: true,
        volume: this.bgmVolume,
        html5: true,
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
    if (!isClient || !this.HowlClass) return;
    
    try {
      this.sfx[name] = new this.HowlClass({
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
    this.HowlerModule?.mute(this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // ============================================
  // Preload All
  // ============================================
  async preloadAll() {
    // 모듈 로드 대기
    if (!this.moduleLoaded) {
      await this.initHowler();
    }
    
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
