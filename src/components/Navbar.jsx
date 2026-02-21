export default function Navbar() {
  return (
    /* Full-width wrapper — centres the pill */
    <div className="absolute top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <nav
        className="
        pointer-events-auto
        flex items-center justify-between gap-8
        px-4 py-2 rounded-full
        bg-white/55 backdrop-blur-md
        border border-white/75
        shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]
        w-full max-w-2xl
      "
      >
        {/* Logo */}
        <span className="text-2xl font-extrabold tracking-tight text-gray-900 cursor-pointer whitespace-nowrap">
          Soulbot.
        </span>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-7 list-none">
          <li>
            <a
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline"
            >
              About Us
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline"
            >
              Worlds
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors no-underlinee"
            >
              Templates
            </a>
          </li>
        </ul>

        {/* CTA */}
        <a
          href="#"
          id="nav-cta"
          className="
            text-sm font-semibold text-white no-underline whitespace-nowrap
            bg-blue-500 hover:bg-blue-600
            px-5 py-2 rounded-full
            shadow-[0_4px_14px_rgba(59,130,246,0.35)]
            transition-all hover:-translate-y-px
          "
        >
          Get Started
        </a>
      </nav>
    </div>
  );
}
