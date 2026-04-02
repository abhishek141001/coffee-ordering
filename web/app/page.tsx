import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofBar from "@/components/landing/SocialProofBar";
import SkipTheLineCallout from "@/components/landing/SkipTheLineCallout";
import HowItWorks from "@/components/landing/HowItWorks";
import TerminalShowcase from "@/components/landing/TerminalShowcase";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import TestimonialSection from "@/components/landing/TestimonialSection";
import GetStartedSection from "@/components/landing/GetStartedSection";
import ShopOwnerCTA from "@/components/landing/ShopOwnerCTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="flex-1 relative overflow-hidden">
      <div className="noise-overlay" />

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/[0.03] rounded-full blur-[120px]" />
      </div>

      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <SkipTheLineCallout />
      <HowItWorks />
      <TerminalShowcase />
      <FeaturesGrid />
      <TestimonialSection />
      <GetStartedSection />
      <ShopOwnerCTA />
      <Footer />
    </main>
  );
}
