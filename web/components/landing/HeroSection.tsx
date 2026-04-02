"use client";
import TypingTerminal from "./TypingTerminal";
import CopyButton from "@/components/ui/CopyButton";

export default function HeroSection() {
  return (
    <section className="relative px-6 pt-16 pb-20 md:pt-28 md:pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left - Copy */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs font-medium tracking-wide uppercase">
                You&apos;re near a coffee shop
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Skip
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500 animate-gradient">
                the line.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed max-w-lg">
              Order coffee from your terminal. No app. No account. 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 bg-[#081422] border border-cyan-400/30 rounded-xl px-5 py-3.5 hover:border-cyan-400/60 transition-colors">
                <span className="text-slate-500 font-mono text-sm">$</span>
                <code className="text-green-400 font-mono text-sm flex-1">
                  ssh coffee@terminalcoffee.dev
                </code>
                <CopyButton text="ssh coffee@terminalcoffee.dev" />
              </div>
            </div>
            <div className="flex gap-4 mt-5">
              <a
                href="#get-started"
                className="group bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/25 flex items-center gap-2"
              >
                Start ordering
                <span className="group-hover:translate-x-1 transition-transform">
                  &#8594;
                </span>
              </a>
              <a
                href="#how-it-works"
                className="border border-slate-600 hover:border-slate-500 text-white px-7 py-3.5 rounded-xl font-medium transition-all duration-300 hover:bg-white/5"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right - Typing Terminal Demo */}
          <div className="animate-fade-in-up animation-delay-400">
            <TypingTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
