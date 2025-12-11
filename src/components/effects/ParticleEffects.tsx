"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/stores/gameStore";
import type { Group, Mesh } from "three";
import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/**
 * 전체 게임 파티클 이펙트 매니저
 */
export default function ParticleEffects() {
  const phase = useGameStore((s) => s.phase);
  const diceValue = useGameStore((s) => s.diceValue);
  const pendingAction = useGameStore((s) => s.pendingAction);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);

  const [diceParticles, setDiceParticles] = useState<Particle[]>([]);
  const [buyParticles, setBuyParticles] = useState<Particle[]>([]);
  const [bonusParticles, setBonusParticles] = useState<Particle[]>([]);

  const currentPlayer = players[currentPlayerIndex];

  // 주사위 굴릴 때 파티클
  useEffect(() => {
    if (phase === "rolling") {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            Math.random() * 0.5,
            (Math.random() - 0.5) * 0.3
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 2
          ),
          life: 1,
          maxLife: 1,
          color: "#22d3ee",
          size: 0.03 + Math.random() * 0.02,
        });
      }
      setDiceParticles(newParticles);
    }
  }, [phase]);

  // 구매 완료 시 파티클
  useEffect(() => {
    if (pendingAction?.type === "buy" && currentPlayer) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        newParticles.push({
          position: new THREE.Vector3(0, 0.3, 0),
          velocity: new THREE.Vector3(
            Math.cos(angle) * (1 + Math.random()),
            Math.random() * 2 + 0.5,
            Math.sin(angle) * (1 + Math.random())
          ),
          life: 1.5,
          maxLife: 1.5,
          color: currentPlayer.color,
          size: 0.04 + Math.random() * 0.03,
        });
      }
      setBuyParticles(newParticles);
    }
  }, [pendingAction, currentPlayer]);

  // 보너스 시 파티클
  useEffect(() => {
    if (pendingAction?.type === "bonus") {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 40; i++) {
        newParticles.push({
          position: new THREE.Vector3(0, 0.2, 0),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            Math.random() * 4 + 2,
            (Math.random() - 0.5) * 3
          ),
          life: 2,
          maxLife: 2,
          color: ["#fbbf24", "#f59e0b", "#fef3c7"][Math.floor(Math.random() * 3)],
          size: 0.05 + Math.random() * 0.03,
        });
      }
      setBonusParticles(newParticles);
    }
  }, [pendingAction]);

  return (
    <group>
      <ParticleSystem
        particles={diceParticles}
        setParticles={setDiceParticles}
        gravity={-5}
      />
      <ParticleSystem
        particles={buyParticles}
        setParticles={setBuyParticles}
        gravity={-3}
      />
      <ParticleSystem
        particles={bonusParticles}
        setParticles={setBonusParticles}
        gravity={-2}
        sparkle
      />
    </group>
  );
}

interface ParticleSystemProps {
  particles: Particle[];
  setParticles: (p: Particle[]) => void;
  gravity?: number;
  sparkle?: boolean;
}

function ParticleSystem({ particles, setParticles, gravity = -5, sparkle = false }: ParticleSystemProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (particles.length === 0) return;

    const updated = particles
      .map((p) => {
        p.position.add(p.velocity.clone().multiplyScalar(delta));
        p.velocity.y += gravity * delta;
        p.life -= delta;
        return p;
      })
      .filter((p) => p.life > 0);

    setParticles(updated);
  });

  if (particles.length === 0) return null;

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => {
        const opacity = p.life / p.maxLife;
        const scale = sparkle
          ? p.size * (1 + Math.sin(p.life * 20) * 0.3)
          : p.size * opacity;

        return (
          <mesh key={i} position={p.position}>
            {sparkle ? (
              <octahedronGeometry args={[scale]} />
            ) : (
              <sphereGeometry args={[scale, 8, 8]} />
            )}
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * 폭죽 이펙트 (승리 시)
 */
export function VictoryFireworks({ active }: { active: boolean }) {
  const groupRef = useRef<Group>(null);
  const [fireworks, setFireworks] = useState<Particle[][]>([]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      const newBurst: Particle[] = [];
      const center = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        2 + Math.random() * 2,
        (Math.random() - 0.5) * 4
      );
      const color = ["#ef4444", "#22c55e", "#3b82f6", "#fbbf24", "#ec4899"][
        Math.floor(Math.random() * 5)
      ];

      for (let i = 0; i < 50; i++) {
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI;
        const speed = 2 + Math.random() * 2;

        newBurst.push({
          position: center.clone(),
          velocity: new THREE.Vector3(
            Math.sin(angle2) * Math.cos(angle1) * speed,
            Math.cos(angle2) * speed,
            Math.sin(angle2) * Math.sin(angle1) * speed
          ),
          life: 2,
          maxLife: 2,
          color,
          size: 0.04,
        });
      }

      setFireworks((prev) => [...prev.slice(-5), newBurst]);
    }, 500);

    return () => clearInterval(interval);
  }, [active]);

  useFrame((state, delta) => {
    if (fireworks.length === 0) return;

    const updated = fireworks
      .map((burst) =>
        burst
          .map((p) => {
            p.position.add(p.velocity.clone().multiplyScalar(delta));
            p.velocity.y -= 3 * delta;
            p.life -= delta;
            return p;
          })
          .filter((p) => p.life > 0)
      )
      .filter((burst) => burst.length > 0);

    setFireworks(updated);
  });

  if (!active && fireworks.length === 0) return null;

  return (
    <group ref={groupRef}>
      {fireworks.flat().map((p, i) => {
        const opacity = p.life / p.maxLife;
        return (
          <mesh key={i} position={p.position}>
            <sphereGeometry args={[p.size * opacity, 6, 6]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * 코인 스플래시 이펙트 (세금/통행료)
 */
export function CoinSplash({ position, active }: { position: [number, number, number]; active: boolean }) {
  const [coins, setCoins] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;

    const newCoins: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newCoins.push({
        position: new THREE.Vector3(...position),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 2
        ),
        life: 1.5,
        maxLife: 1.5,
        color: "#fcd34d",
        size: 0.06,
      });
    }
    setCoins(newCoins);
  }, [active, position]);

  useFrame((state, delta) => {
    if (coins.length === 0) return;

    const updated = coins
      .map((p) => {
        p.position.add(p.velocity.clone().multiplyScalar(delta));
        p.velocity.y -= 8 * delta;
        p.life -= delta;
        return p;
      })
      .filter((p) => p.life > 0);

    setCoins(updated);
  });

  if (coins.length === 0) return null;

  return (
    <group>
      {coins.map((p, i) => {
        const opacity = p.life / p.maxLife;
        return (
          <mesh key={i} position={p.position} rotation={[Math.PI / 2, 0, p.life * 10]}>
            <cylinderGeometry args={[p.size, p.size, 0.02, 12]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.color}
              emissiveIntensity={0.5}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

