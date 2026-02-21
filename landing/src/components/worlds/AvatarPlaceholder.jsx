// Temporary stand-in avatar 
// Replace this component once GLB files are ready.

// gonna add later 
export default function AvatarPlaceholder() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.35, 1.1, 8, 16]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#bfdbfe" />
      </mesh>
      {/* Shadow receiver plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </group>
  );
}
