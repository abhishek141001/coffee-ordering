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
            You&apos;re 30 seconds from{" "}
            <span className="text-cyan-400">coffee.</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Choose your weapon. Both get you coffee before the line moves.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* SSH option */}
          <div
            className={`group relative bg-gradient-to-b from-[#0f1d32] to-[#0a1628] rounded-2xl p-8 border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-500 ${
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: isInView ? "200ms" : "0ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent rounded-2xl" />
            <div className="relative">
              <div className="inline-block bg-cyan-400/10 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 pulse-ring-wrapper">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">SSH</h3>
              <p className="text-slate-400 text-sm mb-6">
                No installation. No account. Just connect.
              </p>
              <div className="bg-[#081422] border border-slate-700 rounded-lg p-4 flex items-center justify-between gap-3">
                <code className="text-green-400 font-mono text-sm truncate">
                  <span className="text-slate-500">$ </span>
                  ssh coffee@terminalcoffee.dev
                </code>
                <CopyButton text="ssh coffee@terminalcoffee.dev" />
              </div>
            </div>
          </div>

          {/* CLI option */}
          <div
            className={`group relative bg-gradient-to-b from-[#0f1d32] to-[#0a1628] rounded-2xl p-8 border border-slate-700/60 hover:border-slate-500 transition-all duration-500 ${
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: isInView ? "400ms" : "0ms" }}
          >
            <div className="relative">
              <div className="inline-block bg-slate-700 text-slate-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                POWER USER
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">CLI</h3>
              <p className="text-slate-400 text-sm mb-6">
                Scriptable. Pipeable. Automatable.
              </p>
              <div className="bg-[#081422] border border-slate-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-green-400 font-mono text-sm">
                    <span className="text-slate-500">$ </span>npm i -g coffee-cli
                  </code>
                  <CopyButton text="npm i -g coffee-cli" />
                </div>
                <div>
                  <code className="text-green-400 font-mono text-sm">
                    <span className="text-slate-500">$ </span>coffee order
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
