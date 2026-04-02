export default function TestimonialSection() {
  return (
    <section className="relative px-6 py-20 bg-gradient-to-b from-transparent via-[#0e0e15] to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-gradient-to-b from-[#151518] to-[#0e0e12] rounded-2xl p-10 border border-zinc-800/60">
          <div className="text-5xl text-amber-400/20 absolute top-6 left-8">
            &#10077;
          </div>
          <div className="relative">
            <p className="text-xl md:text-2xl text-zinc-200 leading-relaxed font-light mb-6 italic">
              I was mass deploying to 12 nodes and didn&apos;t want to leave
              my terminal. Ordered a double espresso via SSH, picked it up 4
              minutes later. +50 XP. This is the future.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-bold text-sm">
                AR
              </div>
              <div>
                <div className="font-medium text-white text-sm flex items-center gap-2">
                  A Developer
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    LVL 42
                  </span>
                </div>
                <div className="text-zinc-500 text-xs">
                  Espresso Elite &bull; 2,450 XP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
