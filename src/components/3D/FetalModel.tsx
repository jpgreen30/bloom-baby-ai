import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface FetalModelProps {
  week: number;
}

export const FetalModel = ({ week }: FetalModelProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate proportions based on pregnancy week
  const proportions = useMemo(() => {
    // Early weeks (8-12): Small embryo
    if (week <= 12) {
      return {
        headSize: 0.15 + (week - 8) * 0.02,
        bodyRadius: 0.08 + (week - 8) * 0.015,
        bodyLength: 0.2 + (week - 8) * 0.05,
        limbLength: 0.1 + (week - 8) * 0.02,
        showLimbs: week > 10,
        headY: 0.2,
      };
    }
    // Mid pregnancy (13-24): Developing fetus
    else if (week <= 24) {
      const progress = (week - 13) / 11;
      return {
        headSize: 0.25 + progress * 0.1,
        bodyRadius: 0.15 + progress * 0.05,
        bodyLength: 0.5 + progress * 0.3,
        limbLength: 0.2 + progress * 0.15,
        showLimbs: true,
        headY: 0.4 + progress * 0.1,
      };
    }
    // Late pregnancy (25-40): Full-term baby
    else {
      const progress = (week - 25) / 15;
      return {
        headSize: 0.35 + progress * 0.05,
        bodyRadius: 0.2 + progress * 0.05,
        bodyLength: 0.8 + progress * 0.2,
        limbLength: 0.35 + progress * 0.1,
        showLimbs: true,
        headY: 0.5 + progress * 0.05,
      };
    }
  }, [week]);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, proportions.headY, 0]}>
        <sphereGeometry args={[proportions.headSize, 32, 32]} />
        <meshStandardMaterial color="hsl(25, 80%, 75%)" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[proportions.bodyRadius, proportions.bodyLength, 4, 16]} />
        <meshStandardMaterial color="hsl(25, 80%, 75%)" />
      </mesh>

      {/* Limbs (arms and legs) */}
      {proportions.showLimbs && (
        <>
          {/* Left arm */}
          <mesh position={[-proportions.bodyRadius * 1.2, 0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
            <capsuleGeometry args={[proportions.bodyRadius * 0.3, proportions.limbLength, 4, 8]} />
            <meshStandardMaterial color="hsl(25, 80%, 72%)" />
          </mesh>

          {/* Right arm */}
          <mesh position={[proportions.bodyRadius * 1.2, 0.1, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <capsuleGeometry args={[proportions.bodyRadius * 0.3, proportions.limbLength, 4, 8]} />
            <meshStandardMaterial color="hsl(25, 80%, 72%)" />
          </mesh>

          {/* Left leg */}
          <mesh position={[-proportions.bodyRadius * 0.6, -proportions.bodyLength * 0.5, 0]} rotation={[Math.PI / 8, 0, 0]}>
            <capsuleGeometry args={[proportions.bodyRadius * 0.35, proportions.limbLength * 1.2, 4, 8]} />
            <meshStandardMaterial color="hsl(25, 80%, 72%)" />
          </mesh>

          {/* Right leg */}
          <mesh position={[proportions.bodyRadius * 0.6, -proportions.bodyLength * 0.5, 0]} rotation={[Math.PI / 8, 0, 0]}>
            <capsuleGeometry args={[proportions.bodyRadius * 0.35, proportions.limbLength * 1.2, 4, 8]} />
            <meshStandardMaterial color="hsl(25, 80%, 72%)" />
          </mesh>
        </>
      )}
    </group>
  );
};
