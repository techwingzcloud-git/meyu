import { Suspense, useRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import mannequinWomen from "@/assets/avatars/mannequin-women.png";
import mannequinMen from "@/assets/avatars/mannequin-men.png";

export type AvatarGender = "women" | "men";

interface Props {
  colorId?: string;
  collarId?: string;
  sleeveId?: string;
  fitId?: string;
  fabricId?: string;
  autoRotate?: boolean;
  avatar?: AvatarGender;
}

const Loader = () => (
  <Html center>
    <div className="text-xs tracking-[0.2em] uppercase text-primary">Loading 3D...</div>
  </Html>
);

/**
 * Mannequin avatar — rotates smoothly on its own Y axis (no camera orbit),
 * so the figure spins in place like a turntable instead of swimming sideways.
 */
const Avatar = ({ gender, autoRotate }: { gender: AvatarGender; autoRotate?: boolean }) => {
  const src = gender === "men" ? mannequinMen : mannequinWomen;
  const texture = useLoader(THREE.TextureLoader, src);
  texture.colorSpace = THREE.SRGBColorSpace;

  const ref = useRef<THREE.Group>(null);

  // Smooth, gentle in-place rotation (turntable feel)
  useFrame((_, delta) => {
    if (ref.current && autoRotate) {
      ref.current.rotation.y += delta * 0.5; // slow & smooth
    }
  });

  return (
    <group ref={ref} position={[0, -0.1, 0]}>
      <mesh>
        {/* keep aspect ratio ~3:4 */}
        <planeGeometry args={[3.6, 4.8]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          opacity={0.95}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export const Shirt3DViewer = (props: Props) => {
  const avatar = props.avatar || "men";
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.3, 4.5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#0b0b0b"]} />
      <fog attach="fog" args={["#0b0b0b", 6, 14]} />

      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#d4af37" />
      <pointLight position={[0, 3, 3]} intensity={0.3} color="#ffd700" />

      <Suspense fallback={<Loader />}>
        <Avatar gender={avatar} autoRotate={props.autoRotate} />
        <Environment preset="studio" />
        <ContactShadows position={[0, -2.2, 0]} opacity={0.5} scale={6} blur={2.4} far={3} />
      </Suspense>

      {/* User can still drag to look around, but no camera autoRotate (avatar spins instead) */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={7}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
        enableDamping
        dampingFactor={0.08}
        autoRotate={false}
      />
    </Canvas>
  );
};
