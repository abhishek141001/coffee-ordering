import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-amber-500/10">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3 md:py-4">
        <span className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="text-2xl relative coffee-steam-wrapper">&#9749;</span>
          <span>
            Caffeine
            <span className="text-amber-400">Operator</span>
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
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
          >
            Deploy &#9889;
          </a>
        </div>
      </div>
    </nav>
  );
}
