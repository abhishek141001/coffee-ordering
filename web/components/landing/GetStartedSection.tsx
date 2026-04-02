"use client";
import CopyButton from "@/components/ui/CopyButton";
import { useInView } from "@/hooks/useInView";

export default function GetStartedSection() {
  const { ref, isInView } = useInView();

  return (
    <section id="get-started" className="relative px-6 py-24" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your{" "}
            <span className="text-amber-400">loadout.</span>
          </h2>
          <p className="text-zinc-400 text-lg">
            Both get you coffee before the queue moves. Pick your weapon.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* SSH option */}
          <div
            className={`group relative bg-gradient-to-b from-[#1a1510] to-[#12100d] rounded-2xl p-8 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-500 ${
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: isInView ? "200ms" : "0ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-2xl" />
            <div className="relative">
              <div className="inline-block bg-amber-400/10 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 pulse-ring-wrapper">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold mb-1 text-white">SSH</h3>
              <p className="text-zinc-400 text-sm mb-1">
                No installation. No account. Just connect.
              </p>
              <p className="text-amber-400/60 text-xs font-mono mb-5">+10 XP first connect bonus</p>
              <div className="bg-[#111118] border border-zinc-800 rounded-lg p-4 flex items-center justify-between gap-3">
                <code className="text-green-400 font-mono text-sm truncate">
                  <span className="text-zinc-500">$ </span>
                  ssh caffeineoperator.online -p 2222
                </code>
                <CopyButton text="ssh caffeineoperator.online -p 2222" />
              </div>
            </div>
          </div>

          {/* CLI option */}
          <div
            className={`group relative bg-gradient-to-b from-[#151518] to-[#0e0e12] rounded-2xl p-8 border border-zinc-800/60 hover:border-zinc-600 transition-all duration-500 ${
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: isInView ? "400ms" : "0ms" }}
          >
            <div className="relative">
              <div className="inline-block bg-zinc-800 text-zinc-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                POWER OPERATOR
              </div>
              <h3 className="text-2xl font-bold mb-1 text-white">CLI</h3>
              <p className="text-zinc-400 text-sm mb-1">
                Scriptable. Pipeable. Automatable.
              </p>
              <p className="text-zinc-600 text-xs font-mono mb-5">unlocks --json mode & streaks</p>
              <div className="bg-[#111118] border border-zinc-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-green-400 font-mono text-sm">
                    <span className="text-zinc-500">$ </span>npm i -g caffeine-cli
                  </code>
                  <CopyButton text="npm i -g caffeine-cli" />
                </div>
                <div>
                  <code className="text-green-400 font-mono text-sm">
                    <span className="text-zinc-500">$ </span>coffee order
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
