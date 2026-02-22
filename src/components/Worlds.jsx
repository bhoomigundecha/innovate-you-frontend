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
    emoji: "⚽",
  },
  {
    id: "classroom",
    worldId: "city_walk",
    label: "The City Walk",
    tagline: "Explore the urban world",
    description:
      "Walk the city streets with your AI guide. Discover, learn, and grow through the pulse of the city around you.",
    bg: "#B1C9EF",
    emoji: "🏙️",
  },
  {
    id: "cafe",
    worldId: "nature_walk",
    label: "The Nature Walk",
    tagline: "Just talk it out",
    description:
      "A calm path through nature. Breathe in the fresh air while your companion listens and guides you.",
    bg: "#D5DEEF",
    emoji: "🌿",
  },
  {
    id: "garden",
    worldId: "nature_walk",
    label: "The Garden",
    tagline: "Reset and breathe",
    description:
      "A peaceful escape to slow down, reflect, and find balance. Your wellness companion is here whenever you need stillness.",
    bg: "#C3D4EC",
    emoji: "🌸",
  },
  {
    id: "studio",
    worldId: "city_walk",
    label: "The Studio",
    tagline: "Create without limits",
    description:
      "Unlock your creative side. Your AI collaborator helps you brainstorm, build, and express yourself freely.",
    bg: "#F0F3FA",
    emoji: "🎨",
  },
  {
    id: "home",
    worldId: "home",
    label: "The Home",
    tagline: "Where it all begins",
    description:
      "Return to a place of warmth and familiarity. Your AI companion is right here, ready to share a quiet moment with you.",
    bg: "#EEE8F0",
    emoji: "🏠",
  },
];

export default function Worlds() {
  const navigate = useNavigate();

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-24 overflow-hidden"
      id="worlds"
    >
      {/* ── Section header ── */}
      <div className="flex items-end justify-between mb-14 w-full max-w-7xl px-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Our Worlds
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Choose your{" "}
            <span className="font-serif italic font-normal">escape</span>
          </h2>
        </div>
      </div>

      {/* ── World cards grid (simple structure like avatars) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
        {WORLDS.map((world) => (
          <div
            key={world.id}
            className="rounded-3xl relative overflow-hidden shadow-xl flex flex-col hover:shadow-2xl transition-all hover:-translate-y-1 min-h-[320px]"
            style={{
              background: "linear-gradient(135deg, #5B8FD4 0%, #3B6AC4 100%)",
              minHeight: 250,
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

            {/* Emoji + Text area */}
            <div className="relative z-10 px-6 pt-6 pb-3 flex flex-col gap-2">
              <span className="text-4xl">{world.emoji}</span>
              <h3 className="text-xl font-bold text-white">{world.label}</h3>
              <p className="text-xs font-semibold text-white/90">{world.tagline}</p>
              <p className="text-sm text-white/80 leading-relaxed line-clamp-3">
                {world.description}
              </p>
            </div>

            {/* Enter World CTA */}
            <div className="mt-auto px-6 pb-6 relative z-10">
              <button
                onClick={() => navigate(`/world/${world.worldId}`)}
                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all hover:bg-white/20"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                Enter World
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
