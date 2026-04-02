"use client";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { useInView } from "@/hooks/useInView";

function Stat({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-cyan-400 font-mono">
        {children}
      </div>
      <div className="text-slate-500 text-sm mt-1">{label}</div>
    </div>
  );
}

export default function SocialProofBar() {
  const { ref, isInView } = useInView();

  return (
    <section
      ref={ref}
      className="relative border-y border-slate-700/50 bg-[#0a1628]/60 backdrop-blur-sm"
    >
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <Stat label="to order">
          {isInView ? "<30s" : "<30s"}
        </Stat>
        <Stat label="apps to install">
          <AnimatedCounter value={0} />
        </Stat>
        <Stat label="shop detection">
          <AnimatedCounter value={200} suffix="m" />
        </Stat>
        <Stat label="coffees ordered">
          <AnimatedCounter value={1247} />
        </Stat>
      </div>
    </section>
  );
}
