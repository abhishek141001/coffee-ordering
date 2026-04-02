export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative bg-gradient-to-b from-[#0f1d32] to-[#0a1628] rounded-2xl p-7 border border-slate-700/60 hover:border-cyan-400/40 transition-all duration-500 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
