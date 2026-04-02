"use client";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { useInView } from "@/hooks/useInView";

function Stat({
  children,
  label,
  xp,
}: {
  children: React.ReactNode;
  label: string;
  xp?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-amber-400 font-mono">
        {children}
      </div>
      <div className="text-zinc-500 text-sm mt-1">{label}</div>
      {xp && (
        <div className="text-amber-500/60 text-xs mt-0.5 font-mono">{xp}</div>
      )}
    </div>
  );
}

export default function SocialProofBar() {
  const { ref, isInView } = useInView();

  return (
    <section
      ref={ref}
      className="relative border-y border-amber-500/10 bg-[#0e0e15]/60 backdrop-blur-sm"
    >
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <Stat label="to order" xp="+50 XP">
          {isInView ? "<30s" : "<30s"}
        </Stat>
        <Stat label="apps to install">
          <AnimatedCounter value={0} />
        </Stat>
        <Stat label="operators active">
          <AnimatedCounter value={847} />
        </Stat>
        <Stat label="coffees deployed" xp="and counting">
          <AnimatedCounter value={3492} />
        </Stat>
      </div>
    </section>
  );
}
