"use client";
import CopyButton from "@/components/ui/CopyButton";
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
        <div className="relative bg-gradient-to-r from-[#0f1d32] to-[#0a1628] rounded-2xl p-8 md:p-10 border border-cyan-400/20 border-l-4 border-l-cyan-400 overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl" />

          <div className="relative">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              You&apos;re already here.{" "}
              <span className="text-cyan-400">Why wait in line?</span>
            </h3>
            <p className="text-slate-400 text-base md:text-lg mb-6 max-w-xl">
              Copy the command. Order from your phone. Pick up hot coffee.
            </p>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    "ssh coffee@terminalcoffee.dev"
                  );
                } catch {}
              }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/25"
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
                ssh coffee@terminalcoffee.dev
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
