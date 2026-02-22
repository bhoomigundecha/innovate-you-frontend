import { useState, useEffect } from "react";

const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Kunj Vipul Goyal",
    profession: "Full-Stack Developer",
    github: "https://github.com/kunj-10",
    image:
      "/kunj.png",
  },
  {
    id: 2,
    name: "Bhoomi Gundecha",
    profession: "Frontend Developer",
    github: "https://github.com/bhoomigundecha",
    image:
      "/bhoomi.jpg",
  },
  {
    id: 3,
    name: "Luv Kansal",
    profession: "Backend Developer",
    github: "https://github.com/luv29",
    image:
      "/luv.png",
  },
  {
    id: 4,
    name: "Manaswi Rajne",
    profession: "Backend Developer",
    github: "https://github.com/manaswijain28",
    image:
      "/manaswi.png",
  },
];

export default function AboutUs() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % TEAM_MEMBERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % TEAM_MEMBERS.length);
    setAutoplay(false);
  };

  const handlePrev = () => {
    setActive(
      (prev) => (prev - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length
    );
    setAutoplay(false);
  };

  const currentMember = TEAM_MEMBERS[active];

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-24 overflow-hidden"
      id="about-us"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            ❤️ Meet the Team
          </p>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            The Innovators Behind InnovateYou
          </h2>
          {/* <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A passionate team of developers, designers, and mental health
            advocates building the future of AI-powered emotional wellness.
          </p> */}
        </div>

        {/* Main carousel section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side - Image carousel */}
          <div className="relative h-96 w-full flex items-center justify-center">
            <div className="relative w-full h-full max-w-sm">
              {/* Background cards for depth effect */}
              {TEAM_MEMBERS.map((member, idx) => {
                const distance = Math.abs(idx - active);
                const isActive = idx === active;
                const offset = idx > active ? distance * 8 : -distance * 8;

                return (
                  <div
                    key={member.id}
                    className={`absolute inset-0 rounded-3xl overflow-hidden transition-all duration-500 ease-out ${
                      isActive
                        ? "scale-100 opacity-100 z-30"
                        : "scale-95 opacity-60 z-20"
                    }`}
                    style={{
                      transform: `translateX(${offset}px) translateY(${isActive ? 0 : 20}px)`,
                    }}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
                  </div>
                );
              })}

              {/* Decorative circles */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-2xl" />
              <div className="absolute -top-4 -left-4 w-40 h-40 bg-purple-500 rounded-full opacity-10 blur-2xl" />
            </div>
          </div>

          {/* Right side - Member info */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Team member name and info */}
            <div className="space-y-4">
              <div
                key={`info-${active}`}
                className="transition-all duration-500"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {currentMember.name}
                </h3>
                <p className="text-lg md:text-xl text-blue-600 font-semibold">
                  {currentMember.profession}
                </p>
              </div>

              {/* GitHub link with icon */}
              <div
                key={`github-${active}`}
                className="transition-all duration-500"
              >
                <a
                  href={currentMember.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>View GitHub</span>
                </a>
              </div>

              {/* Contribution note */}
              {/* <div className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    Core Contribution:
                  </span>{" "}
                  Building the foundation of InnovateYou with expertise,
                  passion, and dedication to mental wellness technology.
                </p>
              </div> */}
            </div>

            {/* Navigation arrows */}
            <div className="flex gap-4 pt-4 md:pt-8">
              <button
                onClick={handlePrev}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-blue-500 transition-all duration-300"
                aria-label="Previous team member"
              >
                <svg
                  className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 12H5M12 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-blue-500 transition-all duration-300"
                aria-label="Next team member"
              >
                <svg
                  className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Indicator dots */}
            <div className="flex gap-2 pt-4">
              {TEAM_MEMBERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActive(idx);
                    setAutoplay(false);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    idx === active
                      ? "bg-blue-600 w-8 h-3"
                      : "bg-gray-300 w-3 h-3 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to team member ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Team grid fallback for mobile */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow p-6 text-center"
              >
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-blue-200">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-blue-600 font-semibold mb-4">
                  {member.profession}
                </p>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Mission statement */}
        {/* <div className="mt-24 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Our Mission
          </h3>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We believe mental health support should be accessible, engaging, and
            free from judgment. By combining cutting-edge AI with immersive 3D
            environments, we're creating a new standard for emotional wellness—one
            conversation at a time. Our team is committed to making AI-powered
            mental health support a tool that empowers everyone to take control of
            their emotional journey.
          </p>
        </div> */}
      </div>
    </section>
  );
}
