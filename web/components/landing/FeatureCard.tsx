export default function FeatureCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="group relative bg-gradient-to-b from-[#151518] to-[#0e0e12] rounded-2xl p-7 border border-zinc-800/60 hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl">{icon}</div>
          {badge && (
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
