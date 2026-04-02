import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#060b18]/80 border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3 md:py-4">
        <span className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="text-2xl relative coffee-steam-wrapper">&#9749;</span>
          <span>
            Terminal
            <span className="text-cyan-400">Coffee</span>
          </span>
        </span>
        <div className="flex gap-3 items-center">
          <a
            href="#how-it-works"
            className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
          >
            How it works
          </a>
          <a
            href="#features"
            className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
          >
            Features
          </a>
          <Link
            href="/onboard"
            className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
          >
            For Shops
          </Link>
          <a
            href="#get-started"
            className="bg-cyan-400 hover:bg-cyan-300 text-black px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25"
          >
            Try it
          </a>
        </div>
      </div>
    </nav>
  );
}
