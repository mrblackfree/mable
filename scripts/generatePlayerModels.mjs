/**
 * 플레이어 캐릭터 GLB 모델 생성
 * 간단한 사람 형태의 3D 모델 생성
 */

import { Document, NodeIO } from '@gltf-transform/core';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/models/players';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const io = new NodeIO();

function hexToRGBA(hex, alpha = 1) {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return [r, g, b, alpha];
}

// 박스 지오메트리
function getBoxData(width, height, depth, offsetX = 0, offsetY = 0, offsetZ = 0) {
  const hw = width / 2, hh = height / 2, hd = depth / 2;
  
  const positions = [
    // Front
    -hw + offsetX, -hh + offsetY, hd + offsetZ,  hw + offsetX, -hh + offsetY, hd + offsetZ,  hw + offsetX, hh + offsetY, hd + offsetZ,  -hw + offsetX, hh + offsetY, hd + offsetZ,
    // Back
    hw + offsetX, -hh + offsetY, -hd + offsetZ,  -hw + offsetX, -hh + offsetY, -hd + offsetZ,  -hw + offsetX, hh + offsetY, -hd + offsetZ,  hw + offsetX, hh + offsetY, -hd + offsetZ,
    // Top
    -hw + offsetX, hh + offsetY, hd + offsetZ,  hw + offsetX, hh + offsetY, hd + offsetZ,  hw + offsetX, hh + offsetY, -hd + offsetZ,  -hw + offsetX, hh + offsetY, -hd + offsetZ,
    // Bottom
    -hw + offsetX, -hh + offsetY, -hd + offsetZ,  hw + offsetX, -hh + offsetY, -hd + offsetZ,  hw + offsetX, -hh + offsetY, hd + offsetZ,  -hw + offsetX, -hh + offsetY, hd + offsetZ,
    // Right
    hw + offsetX, -hh + offsetY, hd + offsetZ,  hw + offsetX, -hh + offsetY, -hd + offsetZ,  hw + offsetX, hh + offsetY, -hd + offsetZ,  hw + offsetX, hh + offsetY, hd + offsetZ,
    // Left
    -hw + offsetX, -hh + offsetY, -hd + offsetZ,  -hw + offsetX, -hh + offsetY, hd + offsetZ,  -hw + offsetX, hh + offsetY, hd + offsetZ,  -hw + offsetX, hh + offsetY, -hd + offsetZ,
  ];
  
  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23,
  ];
  
  return { positions, indices };
}

// 실린더 지오메트리
function getCylinderData(radiusTop, radiusBottom, height, segments = 12, offsetX = 0, offsetY = 0, offsetZ = 0) {
  const positions = [];
  const indices = [];
  const hh = height / 2;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(
      Math.cos(angle) * radiusTop + offsetX, 
      hh + offsetY, 
      Math.sin(angle) * radiusTop + offsetZ
    );
  }
  
  const bottomStart = positions.length / 3;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(
      Math.cos(angle) * radiusBottom + offsetX, 
      -hh + offsetY, 
      Math.sin(angle) * radiusBottom + offsetZ
    );
  }
  
  for (let i = 0; i < segments; i++) {
    const a = i, b = i + 1;
    const c = bottomStart + i, d = bottomStart + i + 1;
    indices.push(a, c, b, b, c, d);
  }
  
  const topCenter = positions.length / 3;
  positions.push(offsetX, hh + offsetY, offsetZ);
  for (let i = 0; i < segments; i++) {
    indices.push(topCenter, i, i + 1);
  }
  
  const bottomCenter = positions.length / 3;
  positions.push(offsetX, -hh + offsetY, offsetZ);
  for (let i = 0; i < segments; i++) {
    indices.push(bottomCenter, bottomStart + i + 1, bottomStart + i);
  }
  
  return { positions, indices };
}

// 구체 지오메트리 (간단한 버전)
function getSphereData(radius, segments = 8, rings = 6, offsetX = 0, offsetY = 0, offsetZ = 0) {
  const positions = [];
  const indices = [];
  
  for (let ring = 0; ring <= rings; ring++) {
    const phi = (ring / rings) * Math.PI;
    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      positions.push(x + offsetX, y + offsetY, z + offsetZ);
    }
  }
  
  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  
  return { positions, indices };
}

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
    .setMetallicFactor(0.3)
    .setRoughnessFactor(0.6);
  
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

// 사람 형태 캐릭터 생성
function createHumanFigure() {
  return [
    // 머리 (구체)
    getSphereData(0.12, 10, 8, 0, 0.52, 0),
    
    // 몸통 (박스)
    getBoxData(0.18, 0.28, 0.1, 0, 0.26, 0),
    
    // 왼쪽 팔
    getBoxData(0.06, 0.22, 0.06, -0.12, 0.28, 0),
    
    // 오른쪽 팔
    getBoxData(0.06, 0.22, 0.06, 0.12, 0.28, 0),
    
    // 왼쪽 다리
    getBoxData(0.07, 0.24, 0.07, -0.05, 0.02, 0),
    
    // 오른쪽 다리
    getBoxData(0.07, 0.24, 0.07, 0.05, 0.02, 0),
  ];
}

// 4가지 색상의 플레이어 모델 생성
const PLAYER_COLORS = [
  { name: 'player-cyan', color: 0x22d3ee },    // 시안
  { name: 'player-pink', color: 0xf472b6 },    // 핑크
  { name: 'player-green', color: 0xa3e635 },   // 그린
  { name: 'player-yellow', color: 0xfbbf24 },  // 옐로우
];

async function generateAll() {
  console.log('🧑 Generating player character models...\n');
  
  for (const { name, color } of PLAYER_COLORS) {
    try {
      const geometries = createHumanFigure();
      await saveModel(name, geometries, color);
    } catch (error) {
      console.error(`❌ Failed ${name}: ${error.message}`);
    }
  }
  
  console.log('\n✨ Done! Models saved to', OUTPUT_DIR);
}

generateAll();

