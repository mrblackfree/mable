"use client";

import type { ReactNode } from "react";
import type { Tile } from "@/types";
import GLBModel from "./GLBModel";
import { hasModel } from "@/lib/models/modelLoader";

interface Props {
  tile: Tile;
}

// 스케일 팩터 (40칸 보드용으로 축소)
const S = 0.7;

// 국가별 랜드마크 컴포넌트
export default function Landmark({ tile }: Props) {
  const code = tile.countryCode?.toUpperCase() || "";
  const codeLower = tile.countryCode?.toLowerCase() || "";
  const color = tile.highlightColor || "#64748b";
  
  // GLB 모델이 있으면 우선 사용, 없으면 프로시저럴 폴백
  const proceduralFallback = getProceduralLandmark(codeLower, color);
  
  // GLB 모델 시도
  if (hasModel(code)) {
    return (
      <GLBModel 
        countryCode={code} 
        fallback={proceduralFallback}
      />
    );
  }
  
  // 프로시저럴 렌더링
  return proceduralFallback;
}

// 프로시저럴 랜드마크 선택
function getProceduralLandmark(code: string, color: string): ReactNode {
  switch (code) {
    case "kr": return <SeoulTower color={color} />;
    case "jp": return <TokyoTower color={color} />;
    case "cn": return <GreatWall color={color} />;
    case "tw": return <Taipei101 color={color} />;
    case "th": return <ThaiTemple color={color} />;
    case "vn": return <HanoiPagoda color={color} />;
    case "ph": return <GenericBuilding color={color} />;
    case "sg": return <MarinaBay color={color} />;
    case "my": return <PetronasTowers color={color} />;
    case "id": return <GenericBuilding color={color} />;
    case "in": return <TajMahal color={color} />;
    case "ae": return <BurjKhalifa color={color} />;
    case "sa": return <GenericBuilding color={color} />;
    case "tr": return <BlueMosque color={color} />;
    case "eg": return <Pyramid color={color} />;
    case "za": return <TableMountain color={color} />;
    case "ng": return <GenericBuilding color={color} />;
    case "ke": return <GenericBuilding color={color} />;
    case "ma": return <GenericBuilding color={color} />;
    case "es": return <Sagrada color={color} />;
    case "pt": return <GenericBuilding color={color} />;
    case "fr": return <EiffelTower color={color} />;
    case "it": return <ColosseoTower color={color} />;
    case "de": return <Brandenburg color={color} />;
    case "nl": return <Windmill color={color} />;
    case "gb": return <BigBen color={color} />;
    case "ch": return <SwissChalet color={color} />;
    case "se": return <GenericBuilding color={color} />;
    case "ca": return <CNTower color={color} />;
    case "us": return <StatueOfLiberty color={color} />;
    case "mx": return <MayanPyramid color={color} />;
    case "br": return <ChristRedeemer color={color} />;
    case "au": return <SydneyOpera color={color} />;
    case "gr": return <Acropolis color={color} />;
    case "ru": return <StBasils color={color} />;
    default: return <GenericBuilding color={color} />;
  }
}

// 추가: 테이블 마운틴 (남아공)
function TableMountain({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.2, 0.08, 0.1]} />
        <meshStandardMaterial color="#4a5568" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.18, 0.02, 0.08]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// 추가: 아크로폴리스 (그리스)
function Acropolis({ color }: { color: string }) {
  return (
    <group scale={S}>
      {/* 기단 */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.18, 0.04, 0.12]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.8} />
      </mesh>
      {/* 기둥들 */}
      {[-0.06, -0.02, 0.02, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.13, 0]}>
          <cylinderGeometry args={[0.012, 0.015, 0.16, 8]} />
          <meshStandardMaterial color="#f5f0e6" roughness={0.7} />
        </mesh>
      ))}
      {/* 지붕 */}
      <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.1, 0.04, 3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// 추가: 성 바실리 대성당 (러시아)
function StBasils({ color }: { color: string }) {
  return (
    <group scale={S}>
      {/* 중앙 돔 */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.12, 8]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* 양쪽 작은 돔 */}
      {[-0.06, 0.06].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color={i === 0 ? "#22c55e" : "#3b82f6"} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.08, 6]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// === 아시아 ===
function SeoulTower({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.25, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.06, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
        <meshStandardMaterial color="#f87171" emissive="#f87171" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function TokyoTower({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.08, 0.32, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} wireframe />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.06, 0.28, 4]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function GreatWall({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.04]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0]}>
          <boxGeometry args={[0.04, 0.06, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Taipei101({ color }: { color: string }) {
  return (
    <group scale={S}>
      {[0, 0.08, 0.14, 0.18].map((y, i) => (
        <mesh key={i} position={[0, y + 0.04, 0]}>
          <boxGeometry args={[0.08 - i * 0.012, 0.06, 0.08 - i * 0.012]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2 + i * 0.1} />
        </mesh>
      ))}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.08, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}

function ThaiTemple({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.1, 0.04, 0.1]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {[0.08, 0.14, 0.18].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <coneGeometry args={[0.06 - i * 0.015, 0.06, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3 + i * 0.2} />
        </mesh>
      ))}
    </group>
  );
}

function HanoiPagoda({ color }: { color: string }) {
  return (
    <group scale={S}>
      {[0, 0.08, 0.14].map((y, i) => (
        <mesh key={i} position={[0, y + 0.04, 0]}>
          <cylinderGeometry args={[0.06 - i * 0.015, 0.07 - i * 0.015, 0.05, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function MarinaBay({ color }: { color: string }) {
  return (
    <group scale={S}>
      {[-0.05, 0, 0.05].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0]}>
          <boxGeometry args={[0.025, 0.2, 0.025]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function PetronasTowers({ color }: { color: string }) {
  return (
    <group scale={S}>
      {[-0.03, 0.03].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.28, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function TajMahal({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.12]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.06, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {[[-0.06, 0.06], [0.06, 0.06], [-0.06, -0.06], [0.06, -0.06]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]}>
          <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      ))}
    </group>
  );
}

function BurjKhalifa({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.2, 0]}>
        <coneGeometry args={[0.04, 0.35, 3]} />
        <meshStandardMaterial color="#6b7280" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.08, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function BlueMosque({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.1]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.05, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      ))}
    </group>
  );
}

// === 아프리카 ===
function Pyramid({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.1, 0.18, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.08, 0.05, 0.06]}>
        <coneGeometry args={[0.04, 0.08, 4]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
    </group>
  );
}

// === 유럽 ===
function EiffelTower({ color }: { color: string }) {
  return (
    <group scale={S}>
      {[[-0.04, -0.04], [0.04, -0.04], [-0.04, 0.04], [0.04, 0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]}>
          <boxGeometry args={[0.015, 0.15, 0.015]} />
          <meshStandardMaterial color="#78716c" metalness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.08, 0.015, 0.08]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <coneGeometry args={[0.025, 0.15, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function BigBen({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.06, 0.25, 0.06]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      <mesh position={[0, 0.22, 0.032]}>
        <cylinderGeometry args={[0.025, 0.025, 0.008, 16]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.29, 0]}>
        <coneGeometry args={[0.04, 0.08, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function ColosseoTower({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.04, 8, 16, Math.PI * 1.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function Brandenburg({ color }: { color: string }) {
  return (
    <group scale={S}>
      {[-0.05, -0.025, 0, 0.025, 0.05].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0]}>
          <boxGeometry args={[0.015, 0.18, 0.02]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.025, 0.025]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function Windmill({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.05, 0.18, 6]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0.16, 0.03]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.15, 0.02, 0.005]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0.03]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.15, 0.02, 0.005]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Sagrada({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      {[-0.025, 0.025].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0]}>
          <coneGeometry args={[0.015, 0.12, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function SwissChalet({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.08, 0.08]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.08, 0.08, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// === 아메리카 ===
function StatueOfLiberty({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.04, 0.28, 0]}>
        <coneGeometry args={[0.01, 0.04, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function CNTower({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 0.32, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function MayanPyramid({ color }: { color: string }) {
  return (
    <group scale={S}>
      {[0, 0.04, 0.08, 0.11].map((y, i) => (
        <mesh key={i} position={[0, y + 0.02, 0]}>
          <boxGeometry args={[0.1 - i * 0.02, 0.035, 0.1 - i * 0.02]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1 + i * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

function ChristRedeemer({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.08]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <capsuleGeometry args={[0.02, 0.14, 8, 12]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.015, 0.12, 4, 8]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
    </group>
  );
}

// === 오세아니아 ===
function SydneyOpera({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.14, 0.025, 0.08]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {[-0.03, 0.015, 0.05].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0]} rotation={[0, 0, -0.15 + i * 0.08]}>
          <sphereGeometry args={[0.05, 16, 8, 0, Math.PI]} />
          <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// === 기본 ===
function GenericBuilding({ color }: { color: string }) {
  return (
    <group scale={S}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.06, 0.16, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {[0.04, 0.09, 0.14].map((y, i) => (
        <mesh key={i} position={[0.032, y, 0]}>
          <boxGeometry args={[0.004, 0.02, 0.03]} />
          <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}
