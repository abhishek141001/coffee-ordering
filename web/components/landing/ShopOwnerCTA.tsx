import Link from "next/link";

export default function ShopOwnerCTA() {
  return (
    <section className="relative px-6 py-24 bg-gradient-to-b from-transparent via-[#0a1628] to-transparent">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-4xl mb-6">&#9749;</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Own a coffee shop?
        </h2>
        <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          Get orders from developers in your area without building an app.
          Setup takes 5 minutes. Get Telegram notifications for every order.
        </p>
        <Link
          href="/onboard"
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl"
        >
          Register your shop
          <span>&#8594;</span>
        </Link>
      </div>
    </section>
  );
}
