import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-zinc-800/50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">&#9749;</span>
            <span className="font-bold">
              Caffeine<span className="text-amber-400">Operator</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-white transition-colors"
            >
              Features
            </a>
            <Link
              href="/onboard"
              className="hover:text-white transition-colors"
            >
              For Shops
            </Link>
          </div>
          <div className="text-sm text-zinc-500">
            Built for operators, by operators.
          </div>
        </div>
      </div>
    </footer>
  );
}
