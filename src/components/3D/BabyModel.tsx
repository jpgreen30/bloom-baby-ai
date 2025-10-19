import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BabyModelProps {
  ageMonths: number;
}

export const BabyModel = ({ ageMonths }: BabyModelProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate baby proportions based on age
  const proportions = useMemo(() => {
    // Newborn (0-3 months)
    if (ageMonths <= 3) {
      return {
        headSize: 0.4,
        bodyRadius: 0.22,
        bodyLength: 0.6,
        limbLength: 0.35,
        headY: 0.5,
        pose: 'lying',
      };
    }
    // Infant (4-8 months) - sitting proportions
    else if (ageMonths <= 8) {
      const progress = (ageMonths - 4) / 4;
      return {
        headSize: 0.38 - progress * 0.03,
        bodyRadius: 0.25 + progress * 0.03,
        bodyLength: 0.7 + progress * 0.1,
        limbLength: 0.4 + progress * 0.1,
        headY: 0.55 + progress * 0.05,
        pose: 'sitting',
      };
    }
    // Older baby (9-24 months) - standing proportions
    else {
      const progress = Math.min((ageMonths - 9) / 15, 1);
      return {
        headSize: 0.35 - progress * 0.02,
        bodyRadius: 0.28 + progress * 0.05,
        bodyLength: 0.8 + progress * 0.3,
        limbLength: 0.5 + progress * 0.2,
        headY: 0.6 + progress * 0.1,
        pose: 'standing',
      };
    }
  }, [ageMonths]);

  // Gentle rocking animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
      if (proportions.pose === 'lying') {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, proportions.headY, 0]}>
        <sphereGeometry args={[proportions.headSize, 32, 32]} />
        <meshStandardMaterial color="hsl(30, 75%, 78%)" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[proportions.bodyRadius, proportions.bodyLength, 6, 16]} />
        <meshStandardMaterial color="hsl(30, 75%, 78%)" />
      </mesh>

      {/* Arms */}
      <mesh position={[-proportions.bodyRadius * 1.3, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <capsuleGeometry args={[proportions.bodyRadius * 0.35, proportions.limbLength, 4, 8]} />
        <meshStandardMaterial color="hsl(30, 75%, 75%)" />
      </mesh>

      <mesh position={[proportions.bodyRadius * 1.3, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <capsuleGeometry args={[proportions.bodyRadius * 0.35, proportions.limbLength, 4, 8]} />
        <meshStandardMaterial color="hsl(30, 75%, 75%)" />
      </mesh>

      {/* Legs */}
      <mesh position={[-proportions.bodyRadius * 0.7, -proportions.bodyLength * 0.5, 0]} rotation={[Math.PI / 12, 0, 0]}>
        <capsuleGeometry args={[proportions.bodyRadius * 0.4, proportions.limbLength * 1.3, 4, 8]} />
        <meshStandardMaterial color="hsl(30, 75%, 75%)" />
      </mesh>

      <mesh position={[proportions.bodyRadius * 0.7, -proportions.bodyLength * 0.5, 0]} rotation={[Math.PI / 12, 0, 0]}>
        <capsuleGeometry args={[proportions.bodyRadius * 0.4, proportions.limbLength * 1.3, 4, 8]} />
        <meshStandardMaterial color="hsl(30, 75%, 75%)" />
      </mesh>
    </group>
  );
};
