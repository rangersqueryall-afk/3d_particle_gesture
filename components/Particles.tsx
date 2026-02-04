
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GestureType } from '../types';
import { PARTICLE_COUNT, COLORS } from '../constants';

interface ParticlesProps {
  gesture: GestureType;
  handPosRef: React.MutableRefObject<{ x: number, y: number }>;
}

const generateShapeTargets = (text: string, count: number): Float32Array => {
  const targets = new Float32Array(count * 3);
  
  if (text === 'NONE' || !text) {
    for (let i = 0; i < count; i++) {
      targets[i * 3] = (Math.random() - 0.5) * 15;
      targets[i * 3 + 1] = (Math.random() - 0.5) * 20;
      targets[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return targets;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return targets;

  // Optimized for mobile: Portrait-friendly sampling
  canvas.width = 1024;
  canvas.height = 1024;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const isHorseOnly = text === GestureType.HORSE;
  const isLuckyHorse = text === GestureType.LUCKY_HORSE;
  const isHorseRelated = isHorseOnly || isLuckyHorse;

  if (isLuckyHorse) {
    // Stacked layout for mobile portrait
    ctx.font = 'bold 380px "Noto Sans SC"';
    ctx.fillText('🐎', 512, 380);
    ctx.font = 'bold 130px "Noto Sans SC"';
    ctx.fillText('年大吉', 512, 700);
  } else if (isHorseOnly) {
    ctx.font = 'bold 480px "Noto Sans SC"';
    ctx.fillText('🐎', 512, 512);
  } else {
    // Wrap text for mobile or use smaller font
    ctx.font = 'bold 150px "Noto Sans SC"';
    ctx.fillText(text, 512, 512);
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const points: { x: number; y: number }[] = [];

  const step = isHorseRelated ? 3 : 4;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = imageData.data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 150) {
        points.push({
          x: (x - 512) / 35,
          y: -(y - 512) / 35
        });
      }
    }
  }

  if (points.length === 0) return generateShapeTargets('NONE', count);

  for (let i = 0; i < count; i++) {
    const p = points[i % points.length];
    targets[i * 3] = p.x;
    targets[i * 3 + 1] = p.y;
    
    let depthMultiplier = 1.2;
    if (isLuckyHorse) {
        // Depth logic adjusted for vertical stack
        depthMultiplier = p.y > 0 ? 5 : 1.5; // Top part is horse, more depth
    } else if (isHorseOnly) {
        depthMultiplier = 6;
    }
    
    targets[i * 3 + 2] = (Math.random() - 0.5) * depthMultiplier;
  }

  return targets;
};

const Particles: React.FC<ParticlesProps> = ({ gesture, handPosRef }) => {
  const mesh = useRef<THREE.Points>(null!);
  
  const targetPositions = useMemo(() => {
    return generateShapeTargets(gesture === GestureType.NONE ? 'NONE' : gesture, PARTICLE_COUNT);
  }, [gesture]);

  const initialPositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const velocities = useMemo(() => {
    const v = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      v[i * 3] = (Math.random() - 0.5) * 0.04;
      v[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
      v[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
    }
    return v;
  }, []);

  const colors = useMemo(() => {
    const c = new Float32Array(PARTICLE_COUNT * 3);
    const colorObj = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const col = Math.random() > 0.4 ? COLORS.RED : COLORS.GOLD;
      colorObj.set(col);
      c[i * 3] = colorObj.r;
      c[i * 3 + 1] = colorObj.g;
      c[i * 3 + 2] = colorObj.b;
    }
    return c;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const posAttr = mesh.current.geometry.attributes.position;
    
    const targetHandX = (handPosRef.current.x - 0.5) * 15;
    const targetHandY = -(handPosRef.current.y - 0.5) * 25;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = posAttr.getX(i);
      let y = posAttr.getY(i);
      let z = posAttr.getZ(i);

      const tx = targetPositions[i * 3];
      const ty = targetPositions[i * 3 + 1];
      const tz = targetPositions[i * 3 + 2];

      if (gesture !== GestureType.NONE) {
        const lerpFactor = 0.05 + (i % 8) * 0.003;
        x += (tx - x) * lerpFactor;
        y += (ty - y) * lerpFactor;
        z += (tz - z) * lerpFactor;

        x += Math.sin(time * 2 + i * 0.1) * 0.008;
        y += Math.cos(time * 2 + i * 0.1) * 0.008;

        const dx = targetHandX - x;
        const dy = targetHandY - y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 16) {
          const force = (1 - Math.sqrt(distSq) / 4) * 0.2;
          x -= dx * force;
          y -= dy * force;
        }
      } else {
        x += velocities[i * 3];
        y += velocities[i * 3 + 1];
        z += velocities[i * 3 + 2];

        const angle = time * 0.1;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const nx = x * c - z * s;
        const nz = x * s + z * c;
        x = nx;
        z = nz;

        if (Math.abs(x) > 25) x *= 0.98;
        if (Math.abs(y) > 35) y *= 0.98;
      }

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
    
    mesh.current.rotation.y += 0.002;
    if (gesture.includes('马')) {
        mesh.current.rotation.y += Math.sin(time) * 0.0005;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={initialPositions.length / 3}
          array={initialPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.13}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

export default Particles;
