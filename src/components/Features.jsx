import { useState } from "react";

// Core features from PROJECT_README
const FEATURES = [
  {
    id: "ai-avatars",
    icon: "🤖",
    title: "AI-Powered Avatars",
    description:
      "Meet your unique companions powered by advanced AI. Each avatar has its own personality, expertise, and voice tailored to help you grow.",
    highlights: [
      "Real-time voice interaction",
      "Contextual understanding",
      "Personalized responses",
    ],
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "themed-worlds",
    icon: "🌍",
    title: "Immersive 3D Worlds",
    description:
      "Escape into beautifully crafted environments. From urban streets to serene gardens, each world creates the perfect atmosphere for meaningful conversations.",
    highlights: [
      "6+ unique environments",
      "HDR photorealistic backgrounds",
      "Dynamic lighting & atmosphere",
    ],
    color: "from-emerald-400 to-emerald-600",
  },
  {
    id: "real-time-voice",
    icon: "🎙️",
    title: "Real-Time Voice Chat",
    description:
      "Press and hold to speak. Your avatar listens, understands, and responds with natural language. No waiting, just real conversation.",
    highlights: [
      "Push-to-talk interface",
      "Speech-to-text recognition",
      "Emotional audio responses",
    ],
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "mental-wellness",
    icon: "💚",
    title: "Mental Health Insights",
    description:
      "Track your emotional wellbeing with PHQ-9 and GAD-7 assessments. Get personalized insights and early intervention recommendations.",
    highlights: [
      "PHQ-9 depression tracking",
      "GAD-7 anxiety assessment",
      "Mood trend analytics",
    ],
    color: "from-rose-400 to-rose-600",
  },
  {
    id: "smart-coaching",
    icon: "🎯",
    title: "Intelligent Coaching",
    description:
      "Whether you need a therapist, friend, coach, or supporter—your avatar adapts to provide exactly what you need in that moment.",
    highlights: [
      "Role-based personas",
      "Context-aware guidance",
      "Supportive communication",
    ],
    color: "from-amber-400 to-amber-600",
  },
  {
    id: "progress-tracking",
    icon: "📊",
    title: "Session Reports & History",
    description:
      "End-of-session summaries capture key insights from your conversations. Build a narrative of your growth over time.",
    highlights: [
      "Automated summaries",
      "Mood trajectory tracking",
      "Diagnostic overview",
    ],
    color: "from-cyan-400 to-cyan-600",
  },
];

// Detailed technology stack
const TECH_STACK = [
  {
    name: "React Three Fiber",
    description: "Real-time 3D rendering with declarative JSX",
    icon: "🔷",
  },
  {
    name: "HDR Environments",
    description: "360° photorealistic immersive backgrounds",
    icon: "🌅",
  },
  {
    name: "Socket.IO",
    description: "Real-time bidirectional communication",
    icon: "⚡",
  },
  {
    name: "AI/LLM Backend",
    description: "Intelligent character responses & insights",
    icon: "🧠",
  },
  {
    name: "Voice Processing",
    description: "Speech-to-text and dynamic TTS",
    icon: "🔊",
  },
  {
    name: "Mental Health APIs",
    description: "PHQ-9 & GAD-7 assessment integration",
    icon: "❤️",
  },
];

// Feature comparison
const WORLD_THEMES = [
  {
    name: "The Court",
    emoji: "⚽",
    role: "Your Coach",
    vibe: "Competitive & Motivational",
    best: "Goal-setting & achievement",
  },
  {
    name: "The City Walk",
    emoji: "🏙️",
    role: "Your Guide",
    vibe: "Urban & Inspiring",
    best: "Exploration & discovery",
  },
  {
    name: "The Nature Walk",
    emoji: "🌿",
    role: "Your Companion",
    vibe: "Calm & Reflective",
    best: "Stress relief & clarity",
  },
  {
    name: "The Garden",
    emoji: "🌸",
    role: "Your Wellness Coach",
    vibe: "Peaceful & Grounding",
    best: "Mindfulness & balance",
  },
  {
    name: "The Studio",
    emoji: "🎨",
    role: "Your Creative Partner",
    vibe: "Expressive & Free",
    best: "Creative brainstorming",
  },
  {
    name: "The Home",
    emoji: "🏠",
    role: "Your Friend",
    vibe: "Warm & Familiar",
    best: "Everyday conversations",
  },
];

export default function Features() {
  const [expandedFeature, setExpandedFeature] = useState(null);

  return (
    <section
      className="relative w-full min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50 py-24 overflow-hidden"
      id="features"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            ✨ Powered by Advanced Tech
          </p>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            Features That Transform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A holistic mental wellness platform combining cutting-edge 3D
            immersion with compassionate AI conversations. Every feature is
            designed to support your emotional journey.
          </p>
        </div>

        {/* Main features grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              onClick={() =>
                setExpandedFeature(
                  expandedFeature === feature.id ? null : feature.id
                )
              }
              className="group cursor-pointer"
            >
              <div className="h-full rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2">
                {/* Gradient header */}
                <div
                  className={`bg-gradient-to-r ${feature.color} h-24 flex items-center justify-center text-5xl`}
                >
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col h-[400px]">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-gray-700"
                        >
                          <span className="text-blue-500 font-bold mt-0.5">
                            ✓
                          </span>
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs font-semibold text-blue-600 flex items-center gap-2">
                    {expandedFeature === feature.id ? (
                      <>
                        <span>Less details</span>
                        <span>↑</span>
                      </>
                    ) : (
                      <>
                        <span>Learn more</span>
                        <span>↓</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded detail section */}
                {expandedFeature === feature.id && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Why it matters:
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {feature.id === "ai-avatars" &&
                          "Personalized AI companions create emotional connection through natural conversation, making mental health support feel like talking to a trusted friend."}
                        {feature.id === "themed-worlds" &&
                          "Environmental psychology shows that being in different settings helps access different emotional states and perspectives for deeper reflection."}
                        {feature.id === "real-time-voice" &&
                          "Voice interaction eliminates typing friction and creates a more authentic, natural conversation experience that mirrors real human connection."}
                        {feature.id === "mental-wellness" &&
                          "Clinically validated assessments (PHQ-9, GAD-7) provide objective metrics to track progress and identify when professional help may be needed."}
                        {feature.id === "smart-coaching" &&
                          "Different life challenges require different approaches. A therapist differs from a coach differs from a friend—our avatars adapt to your needs."}
                        {feature.id === "progress-tracking" &&
                          "Self-awareness is the first step toward change. Reviewing your journey helps you recognize patterns and celebrate growth."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Worlds theming section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Six Therapeutic Worlds
            </h3>
            <p className="text-gray-600">
              Choose your environment based on your emotional needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORLD_THEMES.map((world, idx) => (
              <div
                key={idx}
                className="rounded-xl p-5 bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all hover:border-blue-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{world.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{world.name}</h4>
                    <p className="text-xs text-gray-500">{world.vibe}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Role: </span>
                    <span className="text-gray-600">{world.role}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Best for: </span>
                    <span className="text-gray-600">{world.best}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology stack */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Built on Modern Tech
            </h3>
            <p className="text-gray-600">
              Cutting-edge technologies ensure a smooth, immersive experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_STACK.map((tech, idx) => (
              <div
                key={idx}
                className="rounded-xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 hover:border-blue-400 transition-colors"
              >
                <div className="text-4xl mb-3">{tech.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{tech.name}</h4>
                <p className="text-sm text-gray-700">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key benefits call-out */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            🚀 The InnovateYou Advantage
          </h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-95">
            We combine the latest in AI, 3D visualization, and mental health
            science to create something truly new: therapy that's accessible,
            engaging, and never judgmental.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h4 className="font-bold mb-2">Always Available</h4>
              <p className="text-sm opacity-90">
                Your AI companions are available 24/7, whenever you need to
                talk
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h4 className="font-bold mb-2">Completely Private</h4>
              <p className="text-sm opacity-90">
                Your conversations are encrypted and never shared without consent
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <h4 className="font-bold mb-2">Measurable Progress</h4>
              <p className="text-sm opacity-90">
                Track your mental wellness journey with validated assessments
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
