"use client";
import { useInView } from "@/hooks/useInView";

export default function SkipTheLineCallout() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative px-6 py-16">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto transition-all duration-700 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="relative bg-gradient-to-r from-[#1a1510] to-[#12100d] rounded-2xl p-8 md:p-10 border border-amber-500/20 border-l-4 border-l-amber-500 overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">&#127942;</span>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                <span className="text-amber-400 text-xs font-mono font-bold">ACHIEVEMENT UNLOCKED</span>
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Skip the queue.{" "}
              <span className="text-amber-400">Like a pro.</span>
            </h3>
            <p className="text-zinc-400 text-base md:text-lg mb-6 max-w-xl">
              While they wait in line, you&apos;re already sipping. Every order earns XP. Climb the leaderboard.
            </p>

            {/* XP Progress bar */}
            <div className="max-w-sm mb-6">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-mono">Espresso Elite</span>
                <span className="text-zinc-500 font-mono">2,450 / 3,000 XP</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="xp-bar h-full" style={{ "--fill-width": "82%" } as React.CSSProperties} />
              </div>
              <div className="text-zinc-600 text-xs mt-1 font-mono">Next: Caffeine Commander</div>
            </div>

            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    "ssh caffeineoperator.online -p 2222"
                  );
                } catch {}
              }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/25"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span className="font-mono text-sm">
                ssh caffeineoperator.online -p 2222
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
