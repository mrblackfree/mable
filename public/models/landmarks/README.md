# 🏛️ Landmark GLB Models

이 폴더에 국가별 랜드마크 GLB 모델을 추가하세요.

## ⚠️ 중요: 모델 활성화 방법

GLB 파일을 추가한 후, 반드시 `src/lib/models/modelLoader.ts`에서 해당 국가를 등록해야 합니다:

```typescript
// modelLoader.ts
export const AVAILABLE_MODELS: Set<string> = new Set([
  "KR",  // 서울타워 추가됨
  "FR",  // 에펠탑 추가됨
  // ... 추가한 국가들
]);
```

## 📁 파일 명명 규칙

```
{landmark-name}.glb
```

예시:
- `eiffel-tower.glb` (프랑스)
- `statue-of-liberty.glb` (미국)
- `taj-mahal.glb` (인도)

## 🌐 무료 GLB 모델 소스

1. **Sketchfab** (CC 라이선스)
   - https://sketchfab.com/search?type=models&features=downloadable&licenses=cc0
   
2. **Google Poly (Archive)**
   - https://poly.pizza/

3. **Free3D**
   - https://free3d.com/3d-models/glb

4. **TurboSquid (Free)**
   - https://www.turbosquid.com/Search/3D-Models/free/glb

## 📐 모델 요구사항

- **포맷**: GLB (GLTF Binary)
- **크기**: 500KB 이하 권장 (모바일 AR 최적화)
- **폴리곤**: 5,000 이하 권장
- **중심점**: 모델 바닥 중앙에 원점
- **스케일**: 실제 크기 기준 (코드에서 자동 조정)

## 🔧 모델 최적화 도구

1. **Blender** (무료)
   - 파일 → 내보내기 → glTF 2.0
   - "Draco" 압축 활성화
   
2. **gltf-transform** (CLI)
   ```bash
   npx @gltf-transform/cli optimize input.glb output.glb --compress draco
   ```

3. **glTF Viewer** (온라인)
   - https://gltf-viewer.donmccurdy.com/

## 📋 지원 국가 목록

| 국가코드 | 파일명 | 상태 |
|---------|--------|------|
| KR | seoul-tower.glb | ⏳ |
| JP | tokyo-tower.glb | ⏳ |
| CN | great-wall.glb | ⏳ |
| SG | marina-bay.glb | ⏳ |
| IN | taj-mahal.glb | ⏳ |
| AE | burj-khalifa.glb | ⏳ |
| EG | pyramid.glb | ⏳ |
| ZA | table-mountain.glb | ⏳ |
| FR | eiffel-tower.glb | ⏳ |
| IT | colosseum.glb | ⏳ |
| GB | big-ben.glb | ⏳ |
| DE | brandenburg-gate.glb | ⏳ |
| ES | sagrada-familia.glb | ⏳ |
| NL | windmill.glb | ⏳ |
| GR | acropolis.glb | ⏳ |
| RU | st-basils.glb | ⏳ |
| CH | matterhorn.glb | ⏳ |
| US | statue-of-liberty.glb | ⏳ |
| BR | christ-redeemer.glb | ⏳ |
| CA | cn-tower.glb | ⏳ |
| MX | chichen-itza.glb | ⏳ |
| PE | machu-picchu.glb | ⏳ |
| AU | sydney-opera.glb | ⏳ |

⏳ = 대기중, ✅ = 완료

