"use client";
import { useInView } from "@/hooks/useInView";

function StepItem({
  number,
  title,
  description,
  code,
  isLast = false,
  isVisible,
  delay,
}: {
  number: number;
  title: string;
  description: string;
  code?: string;
  isLast?: boolean;
  isVisible: boolean;
  delay: string;
}) {
  return (
    <div
      className={`flex gap-6 transition-all duration-700 ${delay} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-lg text-black shadow-lg shadow-cyan-400/20">
          {number}
        </div>
        {!isLast && (
          <div
            className={`w-px bg-gradient-to-b from-cyan-400/40 to-transparent mt-2 transition-all duration-1000 ${delay} ${
              isVisible ? "h-full" : "h-0"
            }`}
          />
        )}
      </div>
      <div className="pb-10">
        <h3 className="font-semibold text-xl text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm mb-3">{description}</p>
        {code && (
          <code className="inline-block bg-[#081422] border border-slate-700 rounded-lg px-4 py-2 text-green-400 text-sm font-mono">
            {code}
          </code>
        )}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const { ref, isInView } = useInView();

  return (
    <section id="how-it-works" className="relative px-6 py-24" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Three steps to{" "}
            <span className="text-cyan-400">fresh coffee</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No sign-ups, no downloads, no friction. Just SSH and sip.
          </p>
        </div>

        <div className="space-y-0">
          <StepItem
            number={1}
            title="Open your terminal"
            description="SSH in from any machine. macOS, Linux, WSL &mdash; if it has a terminal, you're good."
            code="ssh coffee@terminalcoffee.dev"
            isVisible={isInView}
            delay="delay-100"
          />
          <StepItem
            number={2}
            title="Pick your drink"
            description="We auto-detect nearby shops and show their full menu. Navigate with arrow keys, hit enter."
            isVisible={isInView}
            delay="delay-300"
          />
          <StepItem
            number={3}
            title="Pay & pick up"
            description="Secure payment via Razorpay. The shop gets a Telegram ping. Walk over, grab your coffee."
            isLast
            isVisible={isInView}
            delay="delay-500"
          />
        </div>
      </div>
    </section>
  );
}
