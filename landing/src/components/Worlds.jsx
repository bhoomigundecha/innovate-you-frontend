import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WORLDS = [
  {
    id: "court",
    worldId: "football_court",
    label: "The Court",
    tagline: "Find your competitive edge",
    description:
      "Step onto the field. Your coach is waiting — ready to push you, challenge you, and celebrate every win with you.",
    bg: "#8AAEE0",
    accentHex: "#395886",
    textAccent: "#1e3a5f",
  },
  {
    id: "classroom",
    worldId: "city_walk",
    label: "The City Walk",
    tagline: "Explore the urban world",
    description:
      "Walk the city streets with your AI guide. Discover, learn, and grow through the pulse of the city around you.",
    bg: "#B1C9EF",
    accentHex: "#395886",
    textAccent: "#395886",
  },
  {
    id: "cafe",
    worldId: "nature_walk",
    label: "The Nature Walk",
    tagline: "Just talk it out",
    description:
      "A calm path through nature. Breathe in the fresh air while your companion listens and guides you.",
    bg: "#D5DEEF",
    accentHex: "#628ECB",
    textAccent: "#395886",
  },
  {
    id: "garden",
    worldId: "nature_walk",
    label: "The Garden",
    tagline: "Reset and breathe",
    description:
      "A peaceful escape to slow down, reflect, and find balance. Your wellness companion is here whenever you need stillness.",
    bg: "#C3D4EC",
    accentHex: "#628ECB",
    textAccent: "#395886",
  },
  {
    id: "studio",
    worldId: "city_walk",
    label: "The Studio",
    tagline: "Create without limits",
    description:
      "Unlock your creative side. Your AI collaborator helps you brainstorm, build, and express yourself freely.",
    bg: "#F0F3FA",
    accentHex: "#8AAEE0",
    textAccent: "#628ECB",
  },
];

const TOTAL = WORLDS.length;

export default function Worlds() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  // Auto-advance every 2.8 s
  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % TOTAL), 2800);
    return () => clearInterval(t);
  }, []);

  const prev = () => setActive((p) => (p - 1 + TOTAL) % TOTAL);
  const next = () => setActive((p) => (p + 1) % TOTAL);

  const leftIdx = (active - 1 + TOTAL) % TOTAL;
  const rightIdx = (active + 1) % TOTAL;

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-24 overflow-hidden"
      id="worlds"
    >
      {/* ── Section header ── */}
      <div className="flex items-end justify-between mb-14 w-full max-w-5xl px-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Our Worlds
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Choose your{" "}
            <span className="font-serif italic font-normal">escape</span>
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

      {/* ── 3-card strip — negative margin pulls them together ── */}
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
          {/* Blob */}
          <div
            className="absolute bottom-0 right-0 w-36 h-36 rounded-full opacity-10"
            style={{ background: "#3B6AC4", transform: "translate(30%, 30%)" }}
          />
          <span className="text-3xl">{WORLDS[leftIdx].emoji}</span>
          <div>
            <h3 className="text-sm font-bold text-gray-700">
              {WORLDS[leftIdx].label}
            </h3>
            <p className="text-xs font-semibold mt-0.5 text-gray-400">
              {WORLDS[leftIdx].tagline}
            </p>
          </div>
        </div>

        {/* Centre card */}
        <div
          className="flex-shrink-0 rounded-3xl p-7 relative overflow-hidden shadow-2xl flex flex-col justify-between"
          style={{
            background: "linear-gradient(135deg, #6BA3E0 0%, #4A86CC 100%)",
            width: 420,
            height: 440,
            zIndex: 10,
          }}
        >
          {/* Blob */}
          <div
            className="absolute bottom-0 right-0 w-52 h-52 rounded-full"
            style={{
              background: "rgba(255,255,255,0.1)",
              transform: "translate(30%, 30%)",
            }}
          />

          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-1">
              {WORLDS[active].label}
            </h3>
            <p className="text-xs font-semibold mb-4 text-blue-200">
              {WORLDS[active].tagline}
            </p>
            <p className="text-sm text-blue-100 leading-relaxed">
              {WORLDS[active].description}
            </p>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm font-semibold text-white">
              Enter World
            </span>
            <button
              onClick={() => navigate(`/world/${WORLDS[active].worldId}`)}
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
          {/* Blob */}
          <div
            className="absolute bottom-0 right-0 w-36 h-36 rounded-full opacity-10"
            style={{ background: "#3B6AC4", transform: "translate(30%, 30%)" }}
          />
          <span className="text-3xl">{WORLDS[rightIdx].emoji}</span>
          <div>
            <h3 className="text-sm font-bold text-gray-700">
              {WORLDS[rightIdx].label}
            </h3>
            <p className="text-xs font-semibold mt-0.5 text-gray-400">
              {WORLDS[rightIdx].tagline}
            </p>
          </div>
        </div>
      </div>

      {/* ── Dots ── */}
      <div className="flex items-center gap-5 mt-10">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:bg-white transition-all text-sm shadow-sm"
        >
          ←
        </button>
        <div className="flex gap-2">
          {WORLDS.map((_, i) => (
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
