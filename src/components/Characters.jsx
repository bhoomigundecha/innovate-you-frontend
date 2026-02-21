import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Avatar from "./avatar/Avatar.jsx";
import { useGLTF } from "@react-three/drei";

// ── Character data ──────────────────────────────────────────────────────────
export const CHARACTERS = [
  {
    id: "sienna", // female
    name: "Sienna",
    role: "Your personal therapist",
    tagline: "When you need an actual professional to talk to",
    glb: "/avatar2.glb",
    accent: "#7B9ECF",
    pill: "Therapist",
    animationGlb: "/animation/M_Standing_Idle_Variations_001.fbx",  // RPM pre-retargeted
    voice: "anushka",
  },
  {
    id: "parker",
    name: "Parker", // aadmi
    role: "Your best buddy",
    tagline: "When you need advice like a friend",
    glb: "/avatar4.glb",
    accent: "#6BA3E0",
    pill: "Friend",
    voice: "abhilash",
    animationGlb: "/animation/M_Standing_Idle_Variations_001.fbx",  // RPM pre-retargeted
  },
  {
    id: "aris",
    name: "Aris", // aurat
    role: "Your biggest supporter",
    tagline: "When you need someone in your corner",
    glb: "/avatar5.glb",
    accent: "#8AAEE0",
    pill: "Supporter",
    voice: "manisha",
    animationGlb: "/animation/M_Standing_Idle_Variations_001.fbx",  // RPM pre-retargeted
  },
  {
    id: "mark",
    name: "Mark", // aadmi
    role: "Your coach",
    tagline: "When you need to level up",
    glb: "/avatar.glb",
    accent: "#4A86CC",
    pill: "Coach",
    voice: "karun",
    animationGlb: "/animation/M_Standing_Idle_Variations_001.fbx",  // RPM pre-retargeted
  },
];

// ── Tiny 3-D avatar preview (used inside the centre card) ─────────────────
function AvatarPreview({ glb, animationGlb }) {
  console.log("[AvatarPreview] glb:", glb, "animationGlb:", animationGlb);
  return (
    <Canvas
      camera={{ position: [0, 0.25, 1.4], fov: 38 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 4, 3]} intensity={1.5} />
      <Suspense fallback={null}>
        <Avatar
          url={glb}
          animationUrls={animationGlb ? [animationGlb] : []}
          position={[0, -1.4, 0]}
          scale={1}
          onReady={({ animationNames }) =>
            console.log("[Avatar] Ready! Animations available:", animationNames)
          }
        />
      </Suspense>
      {/* Subtle environment for nice material shading */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={1.2}
      />
    </Canvas>
  );
}

useGLTF.preload("/avatar.glb");
useGLTF.preload("/avatar2.glb");
useGLTF.preload("/avatar4.glb");
useGLTF.preload("/avatar5.glb");
// Waving.fbx preloaded via useAvatar's FBXLoader

// ── Main section ─────────────────────────────────────────────────────────────
export default function Characters() {
  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-24 overflow-hidden"
      id="characters"
    >
      {/* ── Section header ── */}
      <div className="flex items-end justify-between mb-14 w-full max-w-7xl px-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Meet Your Guides
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Choose your{" "}
            <span className="font-serif italic font-normal">companion</span>
          </h2>
        </div>
        <a
          href="#"
          className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors no-underline"
        >
          See All
          <span className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-xs">
            ↗
          </span>
        </a>
      </div>

      {/* ── Avatar cards in a line ── */}
      <div className="flex items-stretch justify-center w-full max-w-7xl px-4 gap-4">
        {CHARACTERS.map((character, idx) => (
          <div
            key={character.id}
            className="flex-1 min-w-0 rounded-3xl relative overflow-hidden shadow-xl flex flex-col hover:shadow-2xl transition-shadow"
            style={{
              background: "linear-gradient(135deg, #5B8FD4 0%, #3B6AC4 100%)",
              minHeight: 420,
            }}
          >
            {/* Blob decoration */}
            <div
              className="absolute bottom-0 right-0 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background: "rgba(255,255,255,0.08)",
                transform: "translate(20%, 20%)",
              }}
            />

            {/* Text area */}
            <div className="relative z-10 px-5 pt-6 pb-3 flex flex-col gap-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start mb-1"
                style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}
              >
                {character.pill}
              </span>
              <h3 className="text-xl font-bold text-white">{character.name}</h3>
              <p className="text-xs font-semibold text-blue-100">{character.role}</p>
              <p className="text-xs text-blue-50 leading-relaxed mt-1 line-clamp-2">
                {character.tagline}
              </p>
            </div>

            {/* 3-D avatar — fills middle section */}
            <div className="flex-1 relative z-10" style={{ minHeight: 0 }}>
              <AvatarPreview glb={character.glb} animationGlb={character.animationGlb} />
            </div>

            {/* "Talk to" CTA button */}
            <div className="px-5 pb-5 relative z-10">
              <button
                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all hover:bg-white/20"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                Talk to {character.name}
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
