export default function Hero() {
  return (
    <section
      className="
      relative w-full min-h-screen pt-20
      flex flex-col items-center justify-center
      overflow-hidden
    "
    >
      {/* ── Centre content ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6 pt-8">
        {/* Badge */}
        {/* <div
          className="
          inline-flex items-center gap-1.5 mb-7
          px-4 py-1.5 rounded-full
          bg-white/70 border border-black/8
          backdrop-blur-sm shadow-sm
          text-xs font-medium text-gray-600
        "
        >
          &nbsp; AI-Powered Avatar Worlds
        </div> */}

        {/* Headline */}
        <h1
          className="
          text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.12]
          text-gray-900 mb-5 -mt-16
        "
        >
          Your <span className="font-serif italic font-normal">Path</span> to 
          <span className="font-serif italic font-normal">Wellness</span>
          <br />
          Starts Here.
        </h1>

        {/* Subtext */}
        <p className="text-base text-gray-500 leading-relaxed mb-9">
          Choose your escape world. People here are ready to listen, talk, and
          grow with you. No judgment. Just a conversation that actually feels
          real.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            id="explore-btn"
            className="
              text-sm font-semibold text-gray-900 no-underline
              px-7 py-3 rounded-full
              bg-white border border-black/15
              shadow-sm hover:border-black/30
              hover:-translate-y-px hover:shadow-md
              transition-all
            "
          >
            Explore Worlds
          </a>
          <a
            href="#"
            id="getstarted-btn"
            className="
              text-sm font-semibold text-white no-underline
              px-7 py-3 rounded-full
              bg-blue-500 hover:bg-blue-600
              shadow-[0_4px_14px_rgba(59,130,246,0.4)]
              hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)]
              hover:-translate-y-px
              transition-all
            "
          >
            Let's Talk
          </a>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-10 flex-wrap pt-14 pb-12 px-6">
        <span className="text-xl font-bold italic uppercase tracking-wide text-black/20">
          It's okay to not be okay. End the stigma. Talk it out.
        </span> 
      </div>

      {/* ── Logo strip ── */}
      {/* <div className="relative z-10 flex items-center justify-center gap-10 flex-wrap pt-14 pb-12 px-6">
        {[
          "MindfulAI",
          "GrowthHub",
          "WellnessX",
          "LearnSphere",
          "FutureYou",
          "ZenTech",
        ].map((name) => (
          <span
            key={name}
            className="text-sm font-bold italic uppercase tracking-wide text-black/20"
          >
            {name}
          </span>
        ))}
      </div> */}
    </section>
  );
}
