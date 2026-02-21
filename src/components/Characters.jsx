import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Avatar from "./avatar/Avatar.jsx";

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
  },
];

const TOTAL = CHARACTERS.length;

// ── Tiny 3-D avatar preview (used inside the centre card) ─────────────────
function AvatarPreview({ glb }) {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 1.4], fov: 38 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 4, 3]} intensity={1.5} />
      <Suspense fallback={null}>
        <Avatar url={glb} position={[0, -1.40, 0]} scale={1} />
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

// ── Main section ─────────────────────────────────────────────────────────────
export default function Characters() {
  const [active, setActive] = useState(0);

  // Auto-advance every 3 s
  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % TOTAL), 3000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setActive((p) => (p - 1 + TOTAL) % TOTAL);
  const next = () => setActive((p) => (p + 1) % TOTAL);

  const leftIdx = (active - 1 + TOTAL) % TOTAL;
  const rightIdx = (active + 1) % TOTAL;

  const cur = CHARACTERS[active];
  const left = CHARACTERS[leftIdx];
  const right = CHARACTERS[rightIdx];

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-24 overflow-hidden"
      id="characters"
    >
      {/* ── Section header ── */}
      <div className="flex items-end justify-between mb-14 w-full max-w-5xl px-4">
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

      {/* ── 3-card strip ── */}
      <div className="flex items-center justify-center w-full max-w-5xl px-4">
        {/* Left peek card */}
        <div
          onClick={prev}
          className="flex-shrink-0 cursor-pointer rounded-2xl p-5 relative overflow-hidden border border-gray-100 shadow-lg flex flex-col gap-2 opacity-80 hover:opacity-100 transition-opacity"
          style={{
            background: "#ffffff",
            width: 320,
            height: 360,
            transform: "rotate(-8deg)",
            transformOrigin: "bottom center",
            marginRight: -60,
            zIndex: 1,
          }}
        >
          {/* Blob decoration */}
          <div
            className="absolute bottom-0 right-0 w-36 h-36 rounded-full opacity-10"
            style={{ background: "#3B6AC4", transform: "translate(30%, 30%)" }}
          />
          {/* Role pill */}
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start"
            style={{ background: "#dbeafe", color: "#1e40af" }}
          >
            {left.pill}
          </span>
          <div className="mt-auto">
            <h3 className="text-lg font-extrabold text-gray-800">
              {left.name}
            </h3>
            <p className="text-xs font-semibold mt-0.5 text-gray-400">
              {left.role}
            </p>
          </div>
        </div>

        {/* Centre card — live 3-D avatar */}
        <div
          className="flex-shrink-0 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col"
          style={{
            background: "linear-gradient(135deg, #6BA3E0 0%, #4A86CC 100%)",
            width: 420,
            height: 500,
            zIndex: 10,
          }}
        >
          {/* Blob decoration */}
          <div
            className="absolute bottom-0 right-0 w-52 h-52 rounded-full pointer-events-none"
            style={{
              background: "rgba(255,255,255,0.1)",
              transform: "translate(30%, 30%)",
            }}
          />

          {/* Text area */}
          <div className="relative z-10 px-7 pt-7 pb-3 flex flex-col gap-1">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start mb-1"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              {cur.pill}
            </span>
            <h3 className="text-2xl font-bold text-white">{cur.name}</h3>
            <p className="text-xs font-semibold text-blue-200">{cur.role}</p>
            <p className="text-sm text-blue-100 leading-relaxed mt-1">
              {cur.tagline}
            </p>
          </div>

          {/* 3-D avatar — fills the bottom 2/3 of the card */}
          <div className="flex-1 relative z-10" style={{ minHeight: 0 }}>
            <AvatarPreview key={cur.id} glb={cur.glb} />
          </div>

          {/* "Talk to" CTA row */}
          <div className="flex items-center justify-between px-7 pb-5 relative z-10">
            <span className="text-sm font-semibold text-white">
              Talk to {cur.name}
            </span>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-transform hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            >
              →
            </button>
          </div>
        </div>

        {/* Right peek card */}
        <div
          onClick={next}
          className="flex-shrink-0 cursor-pointer rounded-2xl p-5 relative overflow-hidden border border-gray-100 shadow-lg flex flex-col gap-2 opacity-80 hover:opacity-100 transition-opacity"
          style={{
            background: "#ffffff",
            width: 320,
            height: 360,
            transform: "rotate(8deg)",
            transformOrigin: "bottom center",
            marginLeft: -60,
            zIndex: 1,
          }}
        >
          {/* Blob decoration */}
          <div
            className="absolute bottom-0 right-0 w-36 h-36 rounded-full opacity-10"
            style={{ background: "#3B6AC4", transform: "translate(30%, 30%)" }}
          />
          {/* Role pill */}
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start"
            style={{ background: "#dbeafe", color: "#1e40af" }}
          >
            {right.pill}
          </span>
          <div className="mt-auto">
            <h3 className="text-lg font-extrabold text-gray-800">
              {right.name}
            </h3>
            <p className="text-xs font-semibold mt-0.5 text-gray-400">
              {right.role}
            </p>
          </div>
        </div>
      </div>

      {/* ── Dots / nav ── */}
      <div className="flex items-center gap-5 mt-10">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:bg-white transition-all text-sm shadow-sm"
        >
          ←
        </button>
        <div className="flex gap-2">
          {CHARACTERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: active === i ? 24 : 8,
                height: 8,
                background: active === i ? "#628ECB" : "#c7d7fe",
              }}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:bg-white transition-all text-sm shadow-sm"
        >
          →
        </button>
      </div>
    </section>
  );
}
