/**
 * GLB 모델 생성 스크립트
 * @gltf-transform/core를 사용하여 Node.js에서 GLB 파일 생성
 */

import { Document, NodeIO } from '@gltf-transform/core';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/models/landmarks';

// 출력 디렉토리 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const io = new NodeIO();

// 색상 변환 (hex to RGBA array)
function hexToRGBA(hex, alpha = 1) {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return [r, g, b, alpha];
}

// 박스 위치/인덱스 데이터 생성
function getBoxData(width, height, depth, offsetY = 0) {
  const hw = width / 2, hh = height / 2, hd = depth / 2;
  
  const positions = [
    // Front
    -hw, -hh + offsetY, hd,  hw, -hh + offsetY, hd,  hw, hh + offsetY, hd,  -hw, hh + offsetY, hd,
    // Back
    hw, -hh + offsetY, -hd,  -hw, -hh + offsetY, -hd,  -hw, hh + offsetY, -hd,  hw, hh + offsetY, -hd,
    // Top
    -hw, hh + offsetY, hd,  hw, hh + offsetY, hd,  hw, hh + offsetY, -hd,  -hw, hh + offsetY, -hd,
    // Bottom
    -hw, -hh + offsetY, -hd,  hw, -hh + offsetY, -hd,  hw, -hh + offsetY, hd,  -hw, -hh + offsetY, hd,
    // Right
    hw, -hh + offsetY, hd,  hw, -hh + offsetY, -hd,  hw, hh + offsetY, -hd,  hw, hh + offsetY, hd,
    // Left
    -hw, -hh + offsetY, -hd,  -hw, -hh + offsetY, hd,  -hw, hh + offsetY, hd,  -hw, hh + offsetY, -hd,
  ];
  
  const indices = [
    0, 1, 2, 0, 2, 3,       // Front
    4, 5, 6, 4, 6, 7,       // Back
    8, 9, 10, 8, 10, 11,    // Top
    12, 13, 14, 12, 14, 15, // Bottom
    16, 17, 18, 16, 18, 19, // Right
    20, 21, 22, 20, 22, 23, // Left
  ];
  
  return { positions, indices };
}

// 원뿔 위치/인덱스 데이터 생성
function getConeData(radius, height, segments = 8, offsetY = 0) {
  const positions = [];
  const indices = [];
  
  // 꼭대기
  positions.push(0, height / 2 + offsetY, 0);
  
  // 바닥 원
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(
      Math.cos(angle) * radius,
      -height / 2 + offsetY,
      Math.sin(angle) * radius
    );
  }
  
  // 측면 삼각형
  for (let i = 1; i <= segments; i++) {
    indices.push(0, i, i + 1);
  }
  
  // 바닥 (중심점 추가)
  const centerIdx = positions.length / 3;
  positions.push(0, -height / 2 + offsetY, 0);
  for (let i = 1; i <= segments; i++) {
    indices.push(centerIdx, i + 1, i);
  }
  
  return { positions, indices };
}

// 실린더 위치/인덱스 데이터 생성
function getCylinderData(radiusTop, radiusBottom, height, segments = 12, offsetY = 0) {
  const positions = [];
  const indices = [];
  
  const hh = height / 2;
  
  // 상단 원
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(angle) * radiusTop, hh + offsetY, Math.sin(angle) * radiusTop);
  }
  
  // 하단 원
  const bottomStart = positions.length / 3;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(angle) * radiusBottom, -hh + offsetY, Math.sin(angle) * radiusBottom);
  }
  
  // 측면
  for (let i = 0; i < segments; i++) {
    const a = i;
    const b = i + 1;
    const c = bottomStart + i;
    const d = bottomStart + i + 1;
    indices.push(a, c, b, b, c, d);
  }
  
  // 상단 뚜껑
  const topCenter = positions.length / 3;
  positions.push(0, hh + offsetY, 0);
  for (let i = 0; i < segments; i++) {
    indices.push(topCenter, i, i + 1);
  }
  
  // 하단 뚜껑
  const bottomCenter = positions.length / 3;
  positions.push(0, -hh + offsetY, 0);
  for (let i = 0; i < segments; i++) {
    indices.push(bottomCenter, bottomStart + i + 1, bottomStart + i);
  }
  
  return { positions, indices };
}

// 지오메트리 데이터들을 합치기
function mergeGeometries(geometries) {
  const allPositions = [];
  const allIndices = [];
  let indexOffset = 0;
  
  for (const geo of geometries) {
    allPositions.push(...geo.positions);
    for (const idx of geo.indices) {
      allIndices.push(idx + indexOffset);
    }
    indexOffset += geo.positions.length / 3;
  }
  
  return {
    positions: new Float32Array(allPositions),
    indices: new Uint16Array(allIndices)
  };
}

// 모델 저장
async function saveModel(name, geometries, color) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  
  const merged = mergeGeometries(geometries);
  
  const posAccessor = doc.createAccessor()
    .setType('VEC3')
    .setArray(merged.positions)
    .setBuffer(buffer);
  
  const idxAccessor = doc.createAccessor()
    .setType('SCALAR')
    .setArray(merged.indices)
    .setBuffer(buffer);
  
  const material = doc.createMaterial(name + '_mat')
    .setBaseColorFactor(hexToRGBA(color))
    .setMetallicFactor(0.5)
    .setRoughnessFactor(0.5);
  
  const primitive = doc.createPrimitive()
    .setAttribute('POSITION', posAccessor)
    .setIndices(idxAccessor)
    .setMaterial(material);
  
  const mesh = doc.createMesh(name).addPrimitive(primitive);
  const node = doc.createNode(name).setMesh(mesh);
  const scene = doc.createScene().addChild(node);
  doc.getRoot().setDefaultScene(scene);
  
  const glb = await io.writeBinary(doc);
  const outputPath = path.join(OUTPUT_DIR, `${name}.glb`);
  fs.writeFileSync(outputPath, glb);
  console.log(`✅ Created: ${name}.glb (${glb.length} bytes)`);
}

// === 랜드마크 모델 정의 ===

const MODELS = {
  'seoul-tower': {
    color: 0x94a3b8,
    geometries: [
      getCylinderData(0.04, 0.08, 1.2, 12, 0.6), // 기둥
      getCylinderData(0.15, 0.1, 0.15, 12, 1.25), // 전망대
      getCylinderData(0.015, 0.015, 0.5, 8, 1.6), // 안테나
    ]
  },
  'tokyo-tower': {
    color: 0xff4444,
    geometries: [
      getConeData(0.4, 2, 4, 1), // 타워
    ]
  },
  'eiffel-tower': {
    color: 0x8b7355,
    geometries: [
      getConeData(0.5, 2.5, 4, 1.25), // 타워
    ]
  },
  'statue-of-liberty': {
    color: 0x4a9c6d,
    geometries: [
      getBoxData(0.4, 0.5, 0.4, 0.25), // 받침대
      getCylinderData(0.12, 0.18, 1, 8, 1), // 몸체
    ]
  },
  'pyramid': {
    color: 0xd4a574,
    geometries: [
      getConeData(0.8, 1.2, 4, 0.6), // 피라미드
    ]
  },
  'big-ben': {
    color: 0xc9b896,
    geometries: [
      getBoxData(0.4, 2, 0.4, 1), // 타워
      getConeData(0.15, 0.5, 4, 2.25), // 첨탑
    ]
  },
  'colosseum': {
    color: 0xd4c4a8,
    geometries: [
      getCylinderData(0.6, 0.7, 0.4, 24, 0.2), // 원형
    ]
  },
  'taj-mahal': {
    color: 0xffffff,
    geometries: [
      getBoxData(0.6, 0.6, 0.6, 0.4), // 건물
      getConeData(0.35, 0.5, 16, 0.95), // 돔
    ]
  },
  'burj-khalifa': {
    color: 0xc0c0c0,
    geometries: [
      getCylinderData(0.05, 0.25, 3, 6, 1.5), // 타워
    ]
  },
  'marina-bay': {
    color: 0x4a5568,
    geometries: [
      getBoxData(0.2, 1.2, 0.15, 0.6), // 타워
      getBoxData(1.2, 0.08, 0.3, 1.25), // 스카이파크
    ]
  },
  'great-wall': {
    color: 0x8b7355,
    geometries: [
      getBoxData(1.5, 0.3, 0.2, 0.15), // 성벽
      getBoxData(0.25, 0.5, 0.25, 0.55), // 망루
    ]
  },
  'christ-redeemer': {
    color: 0xf5f5f5,
    geometries: [
      getCylinderData(0.1, 0.15, 1.2, 8, 0.9), // 몸체
      getBoxData(1, 0.08, 0.08, 1.2), // 팔
    ]
  },
  'cn-tower': {
    color: 0xd1d5db,
    geometries: [
      getCylinderData(0.02, 0.08, 2, 12, 1), // 타워
    ]
  },
  'sydney-opera': {
    color: 0xffffff,
    geometries: [
      getBoxData(1.2, 0.1, 0.6, 0.05), // 플랫폼
      getConeData(0.3, 0.5, 8, 0.45), // 조개껍데기
    ]
  },
  'windmill': {
    color: 0x8b4513,
    geometries: [
      getCylinderData(0.15, 0.25, 0.8, 8, 0.4), // 몸체
      getConeData(0.2, 0.2, 8, 0.9), // 지붕
    ]
  },
  'brandenburg-gate': {
    color: 0xd4c4a8,
    geometries: [
      getBoxData(1, 0.8, 0.2, 0.4), // 게이트
    ]
  },
  'sagrada-familia': {
    color: 0xd4a574,
    geometries: [
      getBoxData(0.5, 0.6, 0.4, 0.3), // 건물
      getConeData(0.06, 0.8, 8, 1), // 첨탑
    ]
  },
  'table-mountain': {
    color: 0x5d7a3a,
    geometries: [
      getBoxData(1.2, 0.4, 0.8, 0.2), // 평평한 산
    ]
  },
  'acropolis': {
    color: 0xf5f5dc,
    geometries: [
      getBoxData(0.8, 0.4, 0.6, 0.2), // 파르테논
    ]
  },
  'st-basils': {
    color: 0xcc0000,
    geometries: [
      getBoxData(0.4, 0.6, 0.4, 0.3), // 건물
      getConeData(0.2, 0.4, 8, 0.8), // 양파돔
    ]
  },
  'machu-picchu': {
    color: 0x808080,
    geometries: [
      getBoxData(0.8, 0.3, 0.6, 0.15), // 테라스
    ]
  },
  'chichen-itza': {
    color: 0xb8860b,
    geometries: [
      getConeData(0.6, 1, 4, 0.5), // 피라미드
    ]
  },
  'moai': {
    color: 0x696969,
    geometries: [
      getBoxData(0.3, 0.8, 0.25, 0.4), // 모아이 머리
    ]
  },
};

// 모든 모델 생성
async function generateAll() {
  console.log('🏗️ Generating GLB models with gltf-transform...\n');
  
  for (const [name, config] of Object.entries(MODELS)) {
    try {
      await saveModel(name, config.geometries, config.color);
    } catch (error) {
      console.error(`❌ Failed ${name}: ${error.message}`);
    }
  }
  
  console.log('\n✨ Done! Models saved to', OUTPUT_DIR);
  console.log('\n📝 Update AVAILABLE_MODELS in src/lib/models/modelLoader.ts:');
  console.log('export const AVAILABLE_MODELS: Set<string> = new Set([');
  console.log('  "' + Object.keys(MODELS).map(n => n.toUpperCase().replace(/-/g, '_').replace('SEOUL_TOWER', 'KR').replace('TOKYO_TOWER', 'JP').replace('EIFFEL_TOWER', 'FR').replace('STATUE_OF_LIBERTY', 'US').replace('PYRAMID', 'EG').replace('BIG_BEN', 'GB').replace('COLOSSEUM', 'IT').replace('TAJ_MAHAL', 'IN').replace('BURJ_KHALIFA', 'AE').replace('MARINA_BAY', 'SG').replace('GREAT_WALL', 'CN').replace('CHRIST_REDEEMER', 'BR').replace('CN_TOWER', 'CA').replace('SYDNEY_OPERA', 'AU').replace('WINDMILL', 'NL').replace('BRANDENBURG_GATE', 'DE').replace('SAGRADA_FAMILIA', 'ES').replace('TABLE_MOUNTAIN', 'ZA').replace('ACROPOLIS', 'GR').replace('ST_BASILS', 'RU').replace('MACHU_PICCHU', 'PE').replace('CHICHEN_ITZA', 'MX').replace('MOAI', 'CL')).join('", "') + '"');
  console.log(']);');
}

generateAll();
