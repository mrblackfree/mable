# AR World Marble

전 세계 국가를 돌아다니는 **3D WebAR 보드게임** (브루마불 스타일)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 🎮 플레이 모드

### Desktop (3D 보드뷰)
- `http://localhost:3000/game?mode=desktop`
- OrbitControls로 보드 회전/줌
- 마우스/터치로 상호작용

### AR (Android Chrome)
- `http://localhost:3000/game?mode=ar`
- WebXR 지원 기기에서 바닥 인식 후 보드 배치
- **HTTPS 필수** (Vercel 배포 시 자동 적용)

> ⚠️ iOS Safari는 WebXR 미지원 – Desktop 모드로 자동 fallback

## 📁 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지 (모드 선택)
│   └── game/page.tsx      # 게임 화면
├── src/
│   ├── components/
│   │   ├── board/         # Board, Tile3D, PlayerPiece
│   │   ├── scene/         # GameCanvas, ARPlacement
│   │   └── ui/            # HUD, ActionModal
│   ├── stores/            # Zustand 게임 스토어
│   ├── lib/
│   │   ├── game/          # 룰 엔진, worldMap 로더
│   │   ├── audio/         # Howler 오디오 매니저
│   │   └── xr/            # WebXR 유틸 (확장용)
│   └── types/             # TypeScript 타입 정의
├── data/
│   └── worldMap.v1.json   # 타일/국가 데이터
└── public/
    ├── models/            # GLB 3D 모델 (랜드마크)
    └── audio/             # BGM + 효과음
```

## 🎲 게임 룰

- **출발**: 모든 플레이어 $500 시작
- **주사위**: 1~6 랜덤, 이동 후 타일 액션
- **국가 타일**: 미소유 시 구매 가능, 타인 소유 시 통행료 지불
- **특수 타일**: 세계여행(원하는 곳 이동), 황금카드(랜덤 보너스), 세금, 정지
- **승리 조건**: 다른 플레이어 전원 파산

## 🔊 오디오 파일

`public/audio/` 폴더에 다음 파일 추가 필요 (Phase 1 MVP는 파일 없어도 동작):

- `bgm.mp3` – 메인 BGM (loop)
- `dice.mp3` – 주사위 굴림
- `move.mp3` – 말 이동
- `buy.mp3` – 구매
- `toll.mp3` – 통행료
- `bonus.mp3` – 황금카드
- `travel.mp3` – 세계여행
- `win.mp3` – 승리

## 🚢 Vercel 배포

1. GitHub에 push
2. Vercel 대시보드 → Import → 레포 선택
3. Framework: Next.js 자동 인식
4. 환경변수 없이 배포 가능 (Phase 1)
5. **HTTPS URL**로 AR 테스트

## 🛠 기술 스택

- **Frontend**: Next.js 14+ (App Router) + React + TypeScript
- **3D/WebAR**: Three.js + @react-three/fiber + @react-three/drei + @react-three/xr
- **State**: Zustand
- **Audio**: Howler.js
- **Styling**: Tailwind CSS

## 📋 Phase 로드맵

- [x] **Phase 1**: 싱글/로컬 멀티 MVP (8개국 + 특수칸, AR 배치, 기본 룰)
- [ ] **Phase 2**: 32~40칸 확장, 국가별 연출/이펙트 강화
- [ ] **Phase 3**: Supabase 멀티플레이 + 랭킹

## License

MIT
"# mable" 
