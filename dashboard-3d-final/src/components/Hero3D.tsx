"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

function MouseTracker({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const [mouse] = useState({ x: 0, y: 0 });

  useFrame(({ pointer }) => {
    if (group.current) {
      mouse.x = THREE.MathUtils.lerp(mouse.x, pointer.x * viewport.width * 0.05, 0.05);
      mouse.y = THREE.MathUtils.lerp(mouse.y, pointer.y * viewport.height * 0.05, 0.05);
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        pointer.x * 0.3,
        0.03
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -pointer.y * 0.2,
        0.03
      );
    }
  });

  return <group ref={group}>{children}</group>;
}

function HeartShape({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const mesh = useRef<THREE.Mesh>(null);

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return shape;
  }, []);

  const geometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
  }, [heartShape]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.5}>
      <mesh
        ref={mesh}
        geometry={geometry}
        position={position}
        scale={scale}
        rotation={[0, 0, Math.PI]}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
    </Float>
  );
}

function PillShape({ position, color }: { position: [number, number, number]; color: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.3;
      group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={2}>
      <group ref={group} position={position} rotation={[0, 0, Math.PI / 4]}>
        <mesh position={[0, 0.3, 0]}>
          <capsuleGeometry args={[0.2, 0.4, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            roughness={0.15}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.2, 0.4, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.1}
            roughness={0.15}
            metalness={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
    </Float>
  );
}

function CrossShape({ position, color }: { position: [number, number, number]; color: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.2}>
      <group ref={group} position={position}>
        <mesh>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
        <mesh>
          <boxGeometry args={[0.6, 0.15, 0.15]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

function DNAHelix({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  const spheres = useMemo(() => {
    const items: { pos: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < 20; i++) {
      const t = (i / 20) * Math.PI * 4;
      const y = (i / 20) * 2 - 1;
      items.push({
        pos: [Math.cos(t) * 0.3, y, Math.sin(t) * 0.3],
        color: i % 2 === 0 ? "#338dff" : "#14d15c",
      });
      items.push({
        pos: [Math.cos(t + Math.PI) * 0.3, y, Math.sin(t + Math.PI) * 0.3],
        color: i % 2 === 0 ? "#14d15c" : "#338dff",
      });
    }
    return items;
  }, []);

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={group} position={position}>
        {spheres.map((s, i) => (
          <mesh key={i} position={s.pos}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function GlowingSphere({ position, color, size = 0.5 }: { position: [number, number, number]; color: string; size?: number }) {
  return (
    <Float speed={2.5} rotationIntensity={0.2} floatIntensity={2}>
      <Sphere args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.5}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  );
}

function Particles() {
  const count = 200;
  const mesh = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#338dff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#338dff" />
      <pointLight position={[5, -3, 5]} intensity={0.4} color="#14d15c" />

      <fog attach="fog" args={["#0d0e1a", 8, 25]} />

      <MouseTracker>
        <HeartShape position={[-3, 1.5, -2]} color="#ff4466" scale={0.8} />
        <PillShape position={[3.5, 0.5, -1]} color="#338dff" />
        <CrossShape position={[-2.5, -1.5, -1.5]} color="#14d15c" />
        <DNAHelix position={[2.5, -1, -2]} />
        <GlowingSphere position={[0, 2, -3]} color="#338dff" size={0.4} />
        <GlowingSphere position={[-4, 0, -3]} color="#14d15c" size={0.3} />
        <GlowingSphere position={[4, 2, -4]} color="#ff4466" size={0.25} />
        <Particles />
      </MouseTracker>
    </>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ width: "100%", height: "100%" }}
      dpr={[1, 2]}
    >
      <Scene />
    </Canvas>
  );
}