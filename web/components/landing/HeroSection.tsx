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
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-amber-400 text-xs font-mono font-bold">LVL 99</span>
              <span className="text-amber-400 text-xs font-medium tracking-wide uppercase">
                Caffeine Wizard
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Hack
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 animate-gradient">
                your coffee.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 leading-relaxed max-w-lg">
              Order coffee from your terminal. No app. No account.
              <span className="text-amber-400 font-semibold"> +50 XP</span> per order.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 bg-[#111118] border border-amber-500/30 rounded-xl px-5 py-3.5 hover:border-amber-500/60 transition-colors">
                <span className="text-zinc-500 font-mono text-sm">$</span>
                <code className="text-green-400 font-mono text-sm flex-1">
                  ssh caffeineoperator.online -p 2222
                </code>
                <CopyButton text="ssh caffeineoperator.online -p 2222" />
              </div>
            </div>
            <div className="flex gap-4 mt-5">
              <a
                href="#get-started"
                className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/25 flex items-center gap-2"
              >
                Start mission
                <span className="group-hover:translate-x-1 transition-transform">
                  &#8594;
                </span>
              </a>
              <a
                href="#how-it-works"
                className="border border-zinc-700 hover:border-zinc-500 text-white px-7 py-3.5 rounded-xl font-medium transition-all duration-300 hover:bg-white/5"
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
