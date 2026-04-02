"use client";
import { useInView } from "@/hooks/useInView";
import FeatureCard from "./FeatureCard";

const FEATURES = [
  {
    icon: <span>&#62;&#95;</span>,
    title: "Zero install via SSH",
    description:
      "No npm, no brew, no app store. Just ssh in from any machine and order. Works on any OS with a terminal.",
  },
  {
    icon: <span>&#128205;</span>,
    title: "Auto-detects nearby shops",
    description:
      "GPS-based discovery finds coffee shops within 200 meters. Walk to the closest one, skip the queue.",
  },
  {
    icon: <span>&#128274;</span>,
    title: "Secure payments",
    description:
      "Razorpay handles the money. Your card details never touch our servers. PCI compliant out of the box.",
  },
  {
    icon: <span>&#9889;</span>,
    title: "Instant shop notifications",
    description:
      "Shops get a Telegram ping the moment you pay. They accept with one tap. No delays, no missed orders.",
  },
  {
    icon: <span>&#123;&#125;</span>,
    title: "JSON output mode",
    description:
      "Pass --json to any command. Pipe to jq, feed into scripts, build your own coffee dashboard.",
  },
  {
    icon: <span>&#128197;</span>,
    title: "Order history & status",
    description:
      "Track every order. Check status in real-time. Never wonder if your coffee is being made.",
  },
];

export default function FeaturesGrid() {
  const { ref, isInView } = useInView();

  return (
    <section id="features" className="relative px-6 py-24" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for people who{" "}
            <span className="text-cyan-400">ship code</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            We know you hate context-switching. So we brought coffee to where
            you already are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`transition-all duration-700 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{
                transitionDelay: isInView ? `${(i + 1) * 100}ms` : "0ms",
              }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
