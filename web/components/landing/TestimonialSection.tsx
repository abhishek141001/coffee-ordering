export default function TestimonialSection() {
  return (
    <section className="relative px-6 py-20 bg-gradient-to-b from-transparent via-[#0a1628] to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-gradient-to-b from-[#0f1d32] to-[#0a1628] rounded-2xl p-10 border border-slate-700/60">
          <div className="text-5xl text-cyan-400/20 absolute top-6 left-8">
            &#10077;
          </div>
          <div className="relative">
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light mb-6 italic">
              I was mass deploying to 12 nodes and didn&apos;t want to leave
              my terminal. Ordered a double espresso via SSH, picked it up 4
              minutes later. This is the future.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                AR
              </div>
              <div>
                <div className="font-medium text-white text-sm">
                  A Developer
                </div>
                <div className="text-slate-500 text-xs">
                  Somewhere near a coffee shop
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
